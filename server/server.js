// server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { Pool } = require('pg');
const socketIo = require('socket.io');
const http = require('http');
const supabase = require('./supabaseClient');
const crypto = require('crypto');
const { verifyFirebaseToken } = require('./middleware/authMiddleware');
const config = require('./config');
const app = express();
const PORT = config.port;
const server = http.createServer(app);
const helmet = require('helmet');

// Socket.io setup
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] }
});
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// PG Pool setup (ensure DATABASE_URL is set)
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Check PG Connection on startup
pool.connect((err, client, release) => {
  if (err) {
      return console.error('Error acquiring PG client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
        return console.error('Error executing PG check query', err.stack);
    }
    console.log('PostgreSQL connected successfully:', result.rows[0].now);
  });
});


// Firebase Admin SDK
try {
 admin.initializeApp({
   credential: admin.credential.cert(config.firebaseServiceAccount),
   projectId: config.firebaseProjectId,
 });
 console.log('Firebase Admin SDK initialized.');
} catch (error) {
 console.error('Firebase Admin SDK init error:', error);
 process.exit(1);
}

// Middleware
app.use(cors({
  origin: "*", // Be more specific in production if possible
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "HEAD", "OPTIONS"], // Explicitly list allowed methods
  allowedHeaders: ["Content-Type", "Authorization"] // Ensure necessary headers are allowed
}));
app.use(express.json());

// ===========================================
//             PUBLIC/PROTECTED ROUTES
// ===========================================

// Example protected route (accessible by any logged-in user)
app.get('/api/queue', verifyFirebaseToken, async (req, res) => {
  res.json({ message: 'Queue data for authenticated user', userId: req.uid });
});

// ===========================================
//             SALES REP ROUTES
// ===========================================
app.get('/api/salesreps', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM salesreps ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch sales reps:', error);
    res.status(500).json({ error: 'Failed to fetch sales reps' });
  }
});

// GET Sales Rep Profile
app.get('/api/salesreps/me', verifyFirebaseToken, async (req, res) => {
  try {
    // Fetch all relevant columns for the logged-in user's profile
    const result = await pool.query(
        `SELECT id, firebase_id, name, status, total_customers, finished_at, avatar_url
         FROM salesreps
         WHERE firebase_id = $1
         LIMIT 1`,
        [req.uid]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Sales rep profile not found for this user' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching my profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH Sales Rep Profile
app.patch('/api/salesreps/me', verifyFirebaseToken, async (req, res) => {
  const { name, status, avatar_url } = req.body;
  if (name === undefined && status === undefined && avatar_url === undefined) {
      return res.status(400).json({ error: 'No update data provided (name, status, or avatar_url required).' });
  }

  try {
    const result = await pool.query(
      `UPDATE salesreps
       SET
           name = COALESCE($1, name),
           status = COALESCE($2, status),
           avatar_url = COALESCE($3, avatar_url)
       WHERE firebase_id = $4
       RETURNING *`, // Return all columns
      [name, status, avatar_url, req.uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sales rep not found to update' });
    }

    const updatedRep = result.rows[0];
    io.emit('repUpdated', updatedRep); // Notify clients about the update

    res.json(updatedRep);
  } catch (error) {
    console.error(`!! Error updating sales rep profile for UID ${req.uid}:`, error);
    res.status(500).json({ error: 'Failed to update sales rep profile' });
  }
});

// PATCH Sales Rep Finish
app.patch('/api/salesreps/finish', verifyFirebaseToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Find and update customer status
    const custRes = await client.query(
        `UPDATE customers
         SET status = 'helped'
         WHERE id = (
             SELECT c.id FROM customers c
             JOIN salesreps sr ON c.rep_id = sr.id
             WHERE sr.firebase_id = $1 AND c.status = 'being helped'
             ORDER BY c.created_at ASC LIMIT 1
         )
         RETURNING *`,
        [req.uid]
    );
    if (custRes.rowCount === 0) {
        throw new Error('No customer being helped by this rep found');
    }
    const finCust = custRes.rows[0];

    // Update rep status, count, timestamp
    const repRes = await client.query(
        `UPDATE salesreps
         SET total_customers = total_customers + 1, status = 'available', finished_at = NOW()
         WHERE firebase_id = $1
         RETURNING *`,
        [req.uid]
    );
    if (repRes.rowCount === 0) {
        // This indicates a data inconsistency if the first query succeeded
        throw new Error('Sales rep record not found during finish operation');
    }
    await client.query('COMMIT');

    // Emit updates after successful commit
    io.emit('repUpdated', repRes.rows[0]);
    io.emit('customerUpdated', finCust);
    res.json({ rep: repRes.rows[0], finishedCustomer: finCust });

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error finishing with customer:', e);
    res.status(e.message.includes('customer being helped') ? 404 : 500).json({ error: e.message || 'Failed to finish with customer' });
  } finally {
    client.release();
  }
});

// PATCH Sales Rep Reset
app.patch('/api/salesreps/reset', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
        `UPDATE salesreps
         SET total_customers = 0, finished_at = NULL, status = 'available'
         WHERE firebase_id = $1
         RETURNING *`,
        [req.uid]
    );
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Sales rep not found to reset' });
    }
    io.emit('repUpdated', result.rows[0]); // Notify clients
    res.json(result.rows[0]);
  } catch (e) {
    console.error('Failed to reset sales rep:', e);
    res.status(500).json({ error: 'Failed to reset sales rep' });
  }
});


// ===========================================
//             CUSTOMERS ROUTES
// ===========================================

app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(
        `SELECT c.*, sr.name as rep_name
         FROM customers c
         LEFT JOIN salesreps sr ON c.rep_id = sr.id
         ORDER BY
             CASE c.status
                 WHEN 'waiting' THEN 1
                 WHEN 'being helped' THEN 2
                 WHEN 'helped' THEN 3
                 ELSE 4
             END,
             c.created_at ASC`
    );
    res.json(result.rows);
  } catch (e) {
    console.error('Failed to fetch customers:', e);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { customer_name } = req.body;
    if (!customer_name || customer_name.trim() === '') {
        return res.status(400).json({ error: 'Customer name is required' });
    }
    const result = await pool.query(
        `INSERT INTO customers (customer_name, status, rep_id)
         VALUES ($1, 'waiting', NULL)
         RETURNING *`,
        [customer_name.trim()]
    );
    const newCustomer = result.rows[0];
    io.emit('customerCreated', newCustomer);
    res.status(201).json(newCustomer);
  } catch (e) {
    console.error('Failed to add customer:', e);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

app.patch('/api/customers/update/next', verifyFirebaseToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Find rep and check status
    const repRes = await client.query(
        `SELECT id, status FROM salesreps WHERE firebase_id = $1 FOR UPDATE`,
        [req.uid]
    );
    if (repRes.rowCount === 0) throw new Error('Rep not found');
    if (repRes.rows[0].status !== 'available') throw new Error('Rep not available');
    const repId = repRes.rows[0].id;

    // Find next waiting customer and assign rep
    const custRes = await client.query(
        `UPDATE customers
         SET status = 'being helped', rep_id = $1
         WHERE id = (
             SELECT id FROM customers
             WHERE status = 'waiting' AND rep_id IS NULL
             ORDER BY created_at ASC LIMIT 1
             FOR UPDATE SKIP LOCKED
         )
         RETURNING *`,
        [repId]
    );
    if (custRes.rowCount === 0) throw new Error('No waiting customer found');
    const upCust = custRes.rows[0];

    // Update rep status to busy
    const upRepRes = await client.query(
        `UPDATE salesreps SET status = 'busy' WHERE id = $1 RETURNING *`,
        [repId]
    );
    if (upRepRes.rowCount === 0) throw new Error('Rep record inconsistency during update');

    await client.query('COMMIT');

    // Emit updates after commit
    io.emit('customerUpdated', upCust);
    io.emit('repUpdated', upRepRes.rows[0]);
    res.json(upCust);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error helping next customer:', e);
    res.status(e.message.includes('customer') ? 404 : e.message.includes('available') ? 409 : 500)
       .json({ error: e.message || 'Failed to update customer' });
  } finally {
    client.release();
  }
});

// DELETE Customer
app.delete('/api/customers/:id', verifyFirebaseToken, async (req, res) => {
  const { id } = req.params;
  const customerId = parseInt(id, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID format' });
  }

  try {
    const result = await pool.query(
        'DELETE FROM customers WHERE id = $1 RETURNING id, status, rep_id',
        [customerId]
    );
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    const deletedCustomerInfo = result.rows[0];

    // If the deleted customer was being helped, make the rep available again
    if (deletedCustomerInfo.status === 'being helped' && deletedCustomerInfo.rep_id) {
        const repUpdateResult = await pool.query(
            `UPDATE salesreps SET status = 'available' WHERE id = $1 RETURNING *`,
            [deletedCustomerInfo.rep_id]
        );
        if (repUpdateResult.rowCount > 0) {
            io.emit('repUpdated', repUpdateResult.rows[0]);
        }
    }

    io.emit('customerDeleted', { id: customerId }); // Notify clients
    res.status(204).send(); // No content on successful delete

  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});


// ===========================================
//             INVENTORY ROUTES
// ===========================================
app.get('/api/inventory', async (req, res) => {
  try {
    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Supabase error fetching inventory:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/product', async (req, res) => {
  try {
    const { data, error } = await supabase.from('product_types').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Supabase error fetching product types:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH inventory status
app.patch('/api/inventory/status', async (req, res) => {
  try {
    const { itemIds, updateData } = req.body;
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty item IDs array provided' });
    }
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Invalid or empty update data provided' });
    }
    // Example validation: only allow 'status' and 'location' updates
    const allowedUpdates = ['status', 'location'];
    for (const key in updateData) {
        if (!allowedUpdates.includes(key)) {
            return res.status(400).json({ error: `Updating field '${key}' is not allowed.` });
        }
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .in('id', itemIds)
      .select();

    if (error) throw error;
    io.emit('inventoryUpdated', data); // Notify clients
    res.status(200).json({
      message: `Updated ${data ? data.length : 0} inventory items successfully.`,
      updatedItems: data || []
    });
  } catch (error) {
    console.error('🔴 Error updating inventory status:', error);
    res.status(500).json({
      error: error.message || 'Unknown server error updating inventory',
      details: error.details || 'No details available'
    });
  }
});

// ===========================================
//             TRANSFER ROUTES
// ===========================================
app.get('/api/transfers', async (req, res) => {
  try {
    const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('transfer_date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Supabase error fetching transfers:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST transfers (Create new transfers)
app.post('/api/transfers', async (req, res) => {
  try {
    const { transfers } = req.body;
    if (!transfers || !Array.isArray(transfers) || transfers.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty transfers array provided' });
    }

    const { data, error } = await supabase
      .from('transfers')
      .insert(transfers)
      .select();

    if (error) throw error;
    io.emit('transfersCreated', data); // Notify clients
    res.status(201).json({
      message: `Created ${data ? data.length : 0} transfer records successfully.`,
      transfers: data || []
    });
  } catch (error) {
    console.error('Error creating transfer records:', error);
    res.status(500).json({ error: 'Failed to create transfer records', details: error.message });
  }
});

// PATCH transfer complete
app.patch('/api/transfers/complete', async (req, res) => {
  const { transferId } = req.body;

  if (!transferId) {
    return res.status(400).json({ error: 'transferId is required' });
  }

  try {
    // 1. Fetch the transfer record to get item ID and check status
    const { data: transferData, error: fetchError } = await supabase
      .from('transfers')
      .select('id, inventory_item_id, status, transfer_to')
      .eq('id', transferId)
      .single();

    if (fetchError) {
      console.error(`!! Error fetching transfer ${transferId}:`, fetchError);
      return res.status(500).json({ error: `Failed to fetch transfer: ${fetchError.message}` });
    }

    if (!transferData) {
      return res.status(404).json({ error: 'Transfer not found.' });
    }

    if (transferData.status !== 'in_transit') {
      return res.status(409).json({ error: `Transfer status is not 'in_transit' (currently: ${transferData.status}).` });
    }

    // Check if transfer_to is Store A 
    if (transferData.transfer_to !== 'Store A') {
        return res.status(400).json({ error: `Transfer destination must be 'Store A' to receive here.` });
    }

    const inventoryItemId = transferData.inventory_item_id;

    // 2. Update the transfer status to 'Delivered'
    const { data: updatedTransferData, error: transferUpdateError } = await supabase
      .from('transfers')
      .update({ status: 'Delivered' })
      .eq('id', transferId)
      .select()
      .single();

    if (transferUpdateError) {
      console.error(`!! Error updating transfer ${transferId} status:`, transferUpdateError);
      return res.status(500).json({ error: `Failed to update transfer status: ${transferUpdateError.message}` });
    }
    if (!updatedTransferData) {
        console.error(`!! Failed to update transfer ${transferId} status, record not returned after update.`);
        return res.status(500).json({ error: 'Failed to update transfer status (record lost).' });
    }


    // 3. Update the inventory item status and location
    const { data: updatedInventoryData, error: inventoryUpdateError } = await supabase
      .from('inventory_items')
      .update({ status: 'Available', location: 'Store A' })
      .eq('id', inventoryItemId)
      .select()
      .single();

    if (inventoryUpdateError) {
      console.error(`!! Error updating inventory item ${inventoryItemId}:`, inventoryUpdateError);
      return res.status(500).json({
          error: `Failed to update inventory item: ${inventoryUpdateError.message}`,
          details: 'Transfer status was updated, but inventory item update failed. Data might be inconsistent.'
      });
    }
     if (!updatedInventoryData) {
        console.error(`!! Failed to update inventory item ${inventoryItemId}, record not returned after update.`);
        return res.status(500).json({ error: 'Failed to update inventory item (record lost).' });
    }

    // Emit socket events
    if (updatedInventoryData) io.emit('inventoryUpdated', [updatedInventoryData]); // Wrap in array if client expects array
    if (updatedTransferData) io.emit('transferUpdated', updatedTransferData);

    // 5. Send success response
    res.json({
        success: true,
        message: `Transfer ${transferId} completed successfully.`,
        updatedTransfer: updatedTransferData,
        updatedInventoryItem: updatedInventoryData
    });

  } catch (err) {
    console.error(`!! Unexpected error completing transfer ${transferId}:`, err);
    res.status(500).json({ error: 'Unexpected server error during transfer completion.', details: err.message });
  }
});


// ===========================================
//             SUPPLY ORDER ROUTES
// ===========================================
app.get('/api/supply_orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('supply_orders')
      .select('*')
      .order('ordered_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Supabase error fetching supply orders:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/supply_orders', async (req, res) => {
  const { product_type_id, quantity, lead_time_days, color, size } = req.body;
  if (product_type_id == null || !quantity || quantity < 1 || lead_time_days == null || lead_time_days < 0) {
      return res.status(400).json({ error: 'product_type_id, positive quantity, and non-negative lead_time_days required' });
  }
  const expected_at = new Date(Date.now() + lead_time_days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const insertData = { product_type_id, quantity, expected_at, status: 'pending', color, size };
    const { data, error } = await supabase.from('supply_orders').insert([insertData]).select();
    if (error) {
        console.error('Supabase insert error (supply_orders):', error);
        if (error.code === '23503') return res.status(400).json({ error: `Invalid product_type_id: ${product_type_id}` });
        return res.status(500).json({ error: error.message });
    }
    if (data && data.length > 0) {
      const newOrder = data[0];
      io.emit('supplyOrderCreated', newOrder);
      return res.status(201).json(newOrder);
    } else {
      console.error("Supabase insert successful but returned unexpected data for supply order:", data);
      return res.status(500).json({ error: 'Order created but failed to retrieve its details.' });
    }
  } catch (err) {
    console.error('Unexpected error inserting supply_order:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/supply_orders/:id/complete', async (req, res) => {
  const idParam = parseInt(req.params.id, 10);
  if (isNaN(idParam) || idParam <= 0) {
      return res.status(400).json({ error: 'Invalid order ID' });
  }
  try {
    // Update order status and fetch details
    const { data: updatedOrderData, error: updateErr } = await supabase
        .from('supply_orders')
        .update({ status: 'delivered' })
        .eq('id', idParam)
        .neq('status', 'delivered')
        .select('product_type_id, quantity, color, size');

    if (updateErr) throw updateErr;
    if (!updatedOrderData || updatedOrderData.length === 0) {
        const { data: existing } = await supabase.from('supply_orders').select('status').eq('id', idParam).maybeSingle();
        if (!existing) return res.status(404).json({ error: 'Supply order not found.' });
        if (existing.status === 'delivered') return res.status(409).json({ error: 'Supply order already delivered.' });
        return res.status(500).json({ error: 'Failed to update supply order status.' });
    }
    const order = updatedOrderData[0];

    // Prepare inventory items
    const newInventoryItems = [];
    if (order.quantity > 0) {
        for (let i = 0; i < order.quantity; i++) {
            newInventoryItems.push({
                product_type_id: order.product_type_id,
                unique_identifier: crypto.randomBytes(8).toString('hex'),
                status: 'Available',
                location: 'Store A',
                color: order.color,
                size: order.size
            });
        }
    }

    // Insert inventory items
    let insertedItems = [];
    if (newInventoryItems.length > 0) {
        const { data: insertResult, error: insertErr } = await supabase
            .from('inventory_items')
            .insert(newInventoryItems)
            .select();
        if (insertErr) {
            console.error(`Error inserting inventory items for order ${idParam}:`, insertErr);
            return res.status(500).json({
                error: `Failed to insert inventory items: ${insertErr.message}`,
                details: 'Order status updated, but inventory items failed insertion.'
            });
        }
        insertedItems = insertResult || [];
    }

    // Emit events 
    io.emit('supplyOrderUpdated', { ...order, id: idParam, status: 'delivered' });
    if (insertedItems.length > 0) {
        io.emit('inventoryCreated', insertedItems);
    }
    return res.json({
        success: true,
        message: `Order ${idParam} completed. ${insertedItems.length} items added.`,
        addedItems: insertedItems
    });

  } catch (err) {
    console.error(`Unexpected error completing supply order ${idParam}:`, err);
    return res.status(500).json({ error: err.message || 'Internal server error during completion' });
  }
});


// ===========================================
//             END OF ROUTES
// ===========================================

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
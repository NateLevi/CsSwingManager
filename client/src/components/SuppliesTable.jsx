import { useContext } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Button
} from '@mui/material';
import dayjs from 'dayjs';
import { CustomerContext } from '../context/CustomerContext'; // Adjust path if needed

export default function SuppliesTable({ timeLeft, fmt }) {
  const { products = [], supplyOrders = [], completeSupplyOrder } = useContext(CustomerContext);

  return (
    <Paper sx={{ maxWidth: 1000, mx: 'auto', overflowX: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Expected At</TableCell>
            <TableCell>Countdown</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {supplyOrders && supplyOrders.length > 0 ? (
            supplyOrders
              .filter(o => o && o.id)
              .map(o => {
                const pt = products.find(p => p.id === o.product_type_id);
                const secs = timeLeft[o.id] ?? 0;
                return (
                  <TableRow key={o.id} hover>
                    <TableCell>{pt?.model || 'Unknown Product'}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>{o.color || '–'}</TableCell>
                    <TableCell>{o.size || '–'}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>
                      {o.expected_at ? dayjs(o.expected_at).format('MMM D, YYYY HH:mm') : '–'}
                    </TableCell>
                    <TableCell>
                      {o.status === 'pending' && o.expected_at ? fmt(secs) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {o.status === 'pending' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => completeSupplyOrder(o.id)}
                        >
                          Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
          ) : (
             <TableRow>
                <TableCell colSpan={8} align="center">No supply orders found.</TableCell>
             </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
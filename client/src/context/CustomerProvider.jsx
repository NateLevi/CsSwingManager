// src/context/CustomerProvider.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Keep useCallback for refresh functions
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CustomerContext } from './CustomerContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function CustomerProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [nextCustomerNumber, setNextCustomerNumber] = useState(1);
  const [reps, setReps] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [supplyOrders, setSupplyOrders] = useState([]);

  // Fetch customers and determine next number
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/customers`)
      .then((res) => {
        const fetchedCustomers = Array.isArray(res.data) ? res.data : [];
        setCustomers(fetchedCustomers);

        // --- Calculate next customer number --- 
        let maxNumber = 0;
        if (fetchedCustomers.length > 0) {
            fetchedCustomers.forEach(customer => {
                if (customer && customer.customer_name) {
                    const match = customer.customer_name.match(/(?:Customer #|#|^)(\d+)$/);
                    if (match && match[1]) {
                        const num = parseInt(match[1], 10);
                        if (!isNaN(num) && num > maxNumber) {
                            maxNumber = num;
                        }
                    }
                }
            });
            console.log(`[CustomerProvider] Max customer number found: ${maxNumber}`);
            setNextCustomerNumber(maxNumber + 1);
        } else {
             console.log(`[CustomerProvider] No existing customers found, setting next number to 1.`);
             setNextCustomerNumber(1); // Default to 1 if no customers
        }
        // --- End calculation --- 

      })
      .catch(err => {
          console.error("Error fetching customers:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch sales reps
  useEffect(() => {
    axios
      .get(`${API_URL}/api/salesreps`)
      .then((res) => setReps(res.data))
      .catch(console.error);
  }, []);

  // Firebase auth & load myProfile
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const res = await axios.get(
            `${API_URL}/api/salesreps/me`,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
          setMyProfile(res.data);
        } catch (err) {
          console.error('Profile fetch error', err.response?.data || err);
          setMyProfile(null);
        }
      } else {
        setMyProfile(null);
      }
    });
    return unsubscribe;
  }, []);

   // Fetch inventory items
  const refreshInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/inventory`);
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching inventory:', err.response?.data || err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  // Fetch product types
  useEffect(() => {
    axios
      .get(`${API_URL}/api/product`)
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
          console.error('Error fetching product types:', err.response?.data || err);
          setProducts([]);
      });
  }, []);

  // Fetch transfers
  const refreshTransfers = useCallback(async () => {
     try {
       const res = await axios.get(`${API_URL}/api/transfers`);
       setTransfers(Array.isArray(res.data) ? res.data : []);
     } catch (err) {
       console.error('Error fetching transfers:', err.response?.data || err);
       setTransfers([]);
     }
  }, []);

   useEffect(() => {
    refreshTransfers();
  }, [refreshTransfers]);


  // Fetch supply orders
  const refreshSupplyOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/supply_orders`);
      setSupplyOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching supply orders:', err.response?.data || err);
      setSupplyOrders([]);
    }
  }, []);

  useEffect(() => {
    refreshSupplyOrders();
  }, [refreshSupplyOrders]);


  // --- Action Functions ---

  // **UPDATED orderSupplies function**
  async function orderSupplies(product_type_id, quantity, lead_time_days, color, size) { // Added color, size
    try {
      const res = await axios.post(
        `${API_URL}/api/supply_orders`,
        {
          product_type_id,
          quantity,
          lead_time_days,
          color,
          size
        }
      );
      if (res.data && res.data.id) {
        setSupplyOrders((prevSupplyOrders) => [res.data, ...prevSupplyOrders]);
      } else {
         console.error('Invalid data received after order POST:', res.data);
         refreshSupplyOrders();
      }
    } catch (err) {
      console.error('Error placing supply order via API:', err.response?.data || err);
    }
  }

  // Complete a supply order
  async function completeSupplyOrder(id) {
    try {
      await axios.patch(
        `${API_URL}/api/supply_orders/${id}/complete`
      );
      // Refresh lists to reflect changes made by the backend
      await Promise.all([
          refreshSupplyOrders(),
          refreshInventory()
      ]);
    } catch (err) {
      console.error(
        `Error completing supply order ID ${id}:`,
        err.response?.data || err
      );
       // Handle completion error
    }
  }

  // --- Derived State ---
  const LOW_STOCK_THRESHOLD = 5;
  const storeAInventory = inventory.filter((i) => i && i.location === 'Store A');
  const lowStockCounts = storeAInventory.reduce((acc, item) => {
    if (item && item.product_type_id) {
        acc[item.product_type_id] = (acc[item.product_type_id] || 0) + 1;
    }
    return acc;
  }, {});
  const lowStockAlerts = Object.entries(lowStockCounts)
    .filter(([, count]) => count < LOW_STOCK_THRESHOLD)
    .map(([product_type_id, count]) => ({
      product_type_id: Number(product_type_id),
      count
    }));


  // --- Context Value ---
  const value = {
    inventory,
    customers,
    setCustomers,
    nextCustomerNumber,
    setNextCustomerNumber,
    reps,
    products,
    selectedRows,
    transfers,
    myProfile,
    supplyOrders,
    loading,
    orderSupplies,
    completeSupplyOrder,
    refreshInventory,
    refreshTransfers,
    refreshSupplyOrders,
    setSelectedRows,
    // Derived state
    lowStockAlerts,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}
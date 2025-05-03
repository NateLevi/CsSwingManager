// src/pages/SuppliesPage.jsx
import { useState, useEffect, useContext } from 'react';
import {
  Box, Card, CardContent, Typography,
  FormControl, InputLabel, Select, MenuItem,
  TextField, Button
} from '@mui/material';
import dayjs from 'dayjs';
import { CustomerContext } from '../context/CustomerContext';
import SuppliesTable from '../components/SuppliesTable';

// Define dropdown options
const colorOptions = ['Red', 'Blue', 'Silver', 'White', 'Black'];
const sizeOptions = ['64GB', '128GB', '256GB', '512GB']; // Logically ordered

export default function SuppliesPage() {
  const {
    products = [],
    supplyOrders = [],
    orderSupplies,
  } = useContext(CustomerContext);

  // form state
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [leadTime, setLeadTime] = useState(3);
  const [orderColor, setOrderColor] = useState(''); // State for color dropdown
  const [orderSize, setOrderSize] = useState('');   // State for size dropdown

  // countdowns
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const iv = setInterval(() => {
      const now = dayjs();
      const next = {};
      supplyOrders
        .filter(o => o && typeof o.status === 'string')
        .forEach(o => {
          if (o.status === 'pending' && o.expected_at) {
            const diff = dayjs(o.expected_at).diff(now, 'second');
            next[o.id] = diff > 0 ? diff : 0;
          }
        });
      setTimeLeft(next);
    }, 1000);
    return () => clearInterval(iv);
  }, [supplyOrders]);


  const handleOrder = () => {
    if (!productId || quantity < 1 || leadTime < 0) {
        console.error("Order validation failed.");
        return;
    }
    orderSupplies(productId, quantity, leadTime, orderColor, orderSize);

    setProductId('');
    setQuantity(1);
    setLeadTime(3);
    setOrderColor('');
    setOrderSize('');
  };

  const fmt = secs => {
     if (isNaN(secs) || secs < 0) return '00:00:00';
     const h = Math.floor(secs / 3600);
     const m = Math.floor((secs % 3600) / 60);
     const s = Math.floor(secs % 60);
     return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
   };

  return (
    <Box className="p-6 bg-[#f5f7f8]">
      <Card sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h6">Order Supplies</Typography>

          {/* Product Select */}
          <FormControl fullWidth>
            <InputLabel id="product-select-label">Product</InputLabel>
            <Select
              labelId="product-select-label"
              value={productId}
              label="Product"
              onChange={e => setProductId(e.target.value)}
            >
              <MenuItem value="" disabled><em>Select Product...</em></MenuItem>
              {products.map(pt => (
                <MenuItem key={pt.id} value={pt.id}>
                  {pt.model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity Input */}
          <TextField
            type="number"
            label="Quantity"
            inputProps={{ min: 1 }}
            value={quantity}
            onChange={e => setQuantity(e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : 1)}
            fullWidth
          />

          {/*Color Select Dropdown --- */}
          <FormControl fullWidth>
            <InputLabel id="color-select-label">Color</InputLabel>
            <Select
                labelId="color-select-label"
                value={orderColor}
                label="Color"
                onChange={(e) => setOrderColor(e.target.value)}
            >
                <MenuItem value="" disabled><em>Select Color...</em></MenuItem>
                {colorOptions.map((color) => (
                    <MenuItem key={color} value={color}>
                        {color}
                    </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Size Select Dropdown */}
          <FormControl fullWidth>
              <InputLabel id="size-select-label">Size</InputLabel>
              <Select
                  labelId="size-select-label"
                  value={orderSize}
                  label="Size"
                  onChange={(e) => setOrderSize(e.target.value)}
              >
                   {/* Add default "Select..." option */}
                  <MenuItem value="" disabled><em>Select Size...</em></MenuItem>
                  {sizeOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                          {size}
                      </MenuItem>
                  ))}
              </Select>
          </FormControl>

          {/* Lead Time Input */}
          <TextField
            type="number"
            label="Lead time (days)"
            inputProps={{ min: 0 }}
            value={leadTime}
            onChange={e => setLeadTime(e.target.value ? Math.max(0, parseInt(e.target.value, 10)) : 0)}
            fullWidth
          />

          {/* Order Button */}
          <Button
            variant="contained"
            onClick={handleOrder}
            disabled={!productId || quantity < 1 || leadTime < 0}
          >
            Place Order
          </Button>
        </CardContent>
      </Card>

      {/* Supplies Table */}
      <SuppliesTable timeLeft={timeLeft} fmt={fmt} />
    </Box>
  );
}
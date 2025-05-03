import { Card, CardContent, Typography, List, ListItem, Badge, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useContext } from 'react';
import { CustomerContext } from '../context/CustomerContext';
import Chip from '@mui/material/Chip';
export default function AlertsWidget() {
  const { lowStockAlerts, products } = useContext(CustomerContext);

  // Helper to get product model name
  const getModel = id => products.find(p => p.id === id)?.model || 'Unknown';

  return (
    <Card className="w-full rounded-lg shadow-lg">
      <CardContent>
        <Box className="flex items-center mb-2">
          <Badge badgeContent={lowStockAlerts.length} color="error">
            <WarningIcon/>
          </Badge>
          <Typography variant="h6" className="ml-3">
            Low Stock Alerts
          </Typography>
        </Box>
        {lowStockAlerts.length === 0 ? (
          <Typography>No low‑stock items</Typography>
        ) : (
          <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
            <List dense>
              {lowStockAlerts.sort((a,b) => b.count - a.count).map(({ product_type_id, count }) => (
                <ListItem key={product_type_id}>
                  <Typography component="span">
                    {getModel(product_type_id)}: <Chip
                      label={`${count} left`}
                      size="small"
                      color={count < 2 ? 'error' : 'warning'}
                    />
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

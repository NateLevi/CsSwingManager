
import React, { useState, useEffect, useContext } from 'react';
import TransferModal from './TransferModal';
import {
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CustomerContext } from '../context/CustomerContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const InventoryTable = ({ filterByStatus = [] }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [isCheckboxSelected, setIsCheckboxSelected] = useState([]);
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const isTransfersPage = location.pathname === '/transfers';

  const {
    inventory,
    setSelectedRows,
    transfers,
    refreshInventory,
    refreshTransfers
  } = useContext(CustomerContext);

  // fetch products
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/product`)
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // filter inventory
  useEffect(() => {
    let filtered = inventory;
    if (selectedModels.length) {
      filtered = filtered.filter(item => {
        const prod = products.find(p => p.id === item.product_type_id);
        return prod && selectedModels.includes(prod.model);
      });
    }
    if (filterByStatus.length) {
      filtered = filtered.filter(item =>
        filterByStatus.includes(item.status)
      );
    }
    setFilteredInventory(filtered);
  }, [inventory, products, selectedModels, filterByStatus]);

  if (loading) return <div className="flex justify-center items-center h-40"><CircularProgress/></div>;
  if (error)   return <Typography color="error">Error: {error}</Typography>;
  if (!inventory.length) return <Typography>No inventory items found.</Typography>;

  const formatDate = dateString => new Date(dateString)
    .toLocaleString('en-US', { year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit' });

  const formatStatus = s => s === 'in_transit' ? 'In Transit' : s;

  const uniqueModels = [...new Set(products.map(p => p.model))];

  const handleFilterClick = e => setFilterAnchorEl(e.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const handleModelToggle = model => {
    setSelectedModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const handleSelection = ids => {
    setIsCheckboxSelected(ids);
    setSelectedRows(filteredInventory.filter(item => ids.includes(item.id)));
  };

  const handleTransferClick = () => {
    if (isCheckboxSelected.length) setOpen(true);
  };

  const handleReceive = async transferId => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/transfers/complete`, { transferId });
      refreshInventory();
      refreshTransfers();
    } catch (err) {
      console.error('Receive failed:', err.message || err);
    }
  };

  const columns = [
    { field: 'id',              headerName: 'ID',             width:  80 },
    { field: 'product_model',   headerName: 'Product Model',   width: 200 },
    { field: 'unique_identifier', headerName: 'IMEI',          width: 170 },
    { field: 'status',          headerName: 'Status',         width: 140 },
    { field: 'location',        headerName: 'Location',       width: 160 },
    { field: 'color',           headerName: 'Color',          width: 130 },
    { field: 'size',            headerName: 'Size',           width: 120 },
    {
      field: 'added_at',
      headerName: 'Added At',
      flex: 1,
      minWidth: 200
    },
    ...(isTransfersPage
      ? [{
          field: 'canReceive',
          headerName: 'Receive',
          width: 140,
          type: 'boolean',
          renderCell: params => {
            if (params.row.canReceive) {
              const confirmReceive = () => {
                if (window.confirm('Are you sure you want to receive this item?')) {
                  handleReceive(params.row.receiveTransferId);
                }
              };
              
              return (
                <button
                  className="bg-black text-white py-1 px-2 rounded text-sm cursor-pointer"
                  onClick={confirmReceive}
                >
                  Receive
                </button>
              );
            }
            return null;
          }
        }]
      : [])
  ];

  return (
    <>
      <TransferModal
        open={open}
        onClose={() => setOpen(false)}
        isCheckboxSelected={isCheckboxSelected}
      />

      <Paper className="mt-5" sx={{ height: 620, width: '100%' }}>
        <div className="flex items-center p-2 bg-black text-white">
          <IconButton onClick={handleFilterClick} sx={{ color: 'white' }}><FilterListIcon/></IconButton>
          {isCheckboxSelected.length > 0 &&
            <button
              className="ml-2 bg-white text-black py-1 px-3 rounded"
              onClick={handleTransferClick}
            >
              Transfer
            </button>
          }
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled>Filter by Model</MenuItem>
            {uniqueModels.map(model => (
              <MenuItem key={model} onClick={() => handleModelToggle(model)}>
                <Checkbox checked={selectedModels.includes(model)} />
                <ListItemText primary={model} />
              </MenuItem>
            ))}
          </Menu>
        </div>

        <DataGrid
          rows={filteredInventory.map(item => {
            const prod = products.find(p => p.id === item.product_type_id) || {};
            const match = isTransfersPage ? transfers.find(t =>
              t.inventory_item_id === item.id &&
              t.transfer_to === 'Store A' &&
              t.status === 'in_transit'
            ) : null;
            
            return {
              id:                item.id,
              product_model:     prod.model || 'N/A',
              unique_identifier: item.unique_identifier,
              status:            formatStatus(item.status),
              location:          item.location,
              color:             item.color || 'N/A',
              size:              item.size || 'N/A',
              added_at:          formatDate(item.added_at),
              canReceive:        !!match,
              receiveTransferId: match ? match.id : null
            };
          })}
          columns={columns}
          pageSizeOptions={[5,10]}
          initialState={{ 
            pagination: { paginationModel: { page:0, pageSize:10 } },
            sorting: { sortModel: [{ field: 'id', sort: 'asc' }] }
          }}
          checkboxSelection
          onRowSelectionModelChange={handleSelection}
          disableExtendRowFullWidth
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'black',
              color: 'black'
            }
          }}
        />
      </Paper>
    </>
  );
};

export default InventoryTable;

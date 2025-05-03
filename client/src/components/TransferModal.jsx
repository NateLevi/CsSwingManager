import ReactDOM from 'react-dom';
import { useContext } from 'react';
import { CustomerContext} from '../context/CustomerContext';
//Material UI imports
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
//
import { updateInventoryStatus, createTransferRecords } from '../services/inventoryService';


const TransferModal = ({open, onClose, isCheckboxSelected}) => {
    const [store, setStore] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);

    const { selectedRows } = useContext(CustomerContext);
    
    const currentStores = [...new Set(selectedRows.map(row => row.location))];
    
    const allStores = [
      { value: "Store A", label: "Store A" },
      { value: "Store B", label: "Store B" },
      { value: "Store C", label: "Store C" }
    ];
    
    const availableStores = allStores.filter(
      storeOption => !currentStores.includes(storeOption.value)
    );
    
    isCheckboxSelected.length > 0 ? null : null

    const handleChange = (event) => {
        setStore(event.target.value);
    };

    const handleTransfer = async () => {
      if (!store) return;
      setIsSubmitting(true);
      setError(null);
    
      // 1) Capture the "from" for each selected row
      const records = selectedRows.map(item => ({
        inventory_item_id: item.id,
        transfer_from:     item.location,
        transfer_to:       store,
        transfer_date:     new Date().toISOString(),
        status:            'in_transit'
      }));
      
      await createTransferRecords(records);
      
    
      try {
        // 2) Insert the transfer records (with correct "from")
        await createTransferRecords(records);
    
        // 3) update the inventory table to set new location & status

        
        // 1) Extract just the IDs
const ids = selectedRows.map(item => item.id);

// 2) Call the refactored service
await updateInventoryStatus(ids, 'in_transit');

    
        setSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error('Transfer failed:', err.message || err);
        setError(err.response?.data?.error || err.message || 'Failed to transfer items');
      }
       finally {
        setIsSubmitting(false);
      }
    };
    

    if (!open) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
          <div className="bg-white rounded p-6 w-80 z-[1001]">
            <h2 className="p-2 font-bold">Transfer Item to</h2>
            
            {success ? (
              <div className="text-center py-4">
                <div className="text-green-600 mb-2">✓</div>
                <p>Items successfully transferred to {store}</p>
              </div>
            ) : (
              <>
                <Box sx={{ minWidth: 140 }}>
                  <FormControl fullWidth>
                    <InputLabel id="store-select-label">Store</InputLabel>
                    <Select
                      labelId="store-select-label"
                      id="store-select"
                      value={store}
                      label="Store"
                      onChange={handleChange}
                    >
                      {availableStores.map(storeOption => (
                        <MenuItem key={storeOption.value} value={storeOption.value}>
                          {storeOption.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                
                {availableStores.length === 0 && (
                  <p className="text-orange-500 text-sm mt-2">
                    Cannot transfer: Items already exist in all available stores
                  </p>
                )}
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    className="px-4 py-2 bg-gray-200 rounded" 
                    onClick={onClose}
                    disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-black text-white rounded flex items-center" 
                    onClick={handleTransfer}
                    disabled={!store || isSubmitting || availableStores.length === 0}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">Processing</span>
                        <span className="animate-spin">⟳</span>
                      </>
                    ) : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.getElementById('modal-root')
      );
};

export default TransferModal;
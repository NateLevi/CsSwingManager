import axios from 'axios';

// Update inventory items to mark them as transferred
export const updateInventoryStatus = async (itemIds, status, destinationStore = null) => {
  try {
    const validIds = itemIds.filter(id => id != null);
    
    if (validIds.length === 0) {
      throw new Error('No valid item IDs provided for update');
    }

    const updateData = { status };
    if (destinationStore) updateData.location = destinationStore;

    const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/inventory/status`, {
      itemIds: validIds,
      updateData
    });

    return response.data;
  } catch (error) {
    console.error('Error updating inventory status:', error.response?.data || error.message);
    throw error;
  }
};


// Create transfer records in the transfers table
export const createTransferRecords = async (records) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/transfers`,
      { transfers: records }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating transfer records:', error.response?.data || error.message);
    throw error;
  }
};



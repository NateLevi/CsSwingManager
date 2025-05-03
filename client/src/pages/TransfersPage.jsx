import InventoryTable from "../components/InventoryTable"
import CustomerProvider from "../context/CustomerProvider"
import TransferModal from "../components/TransferModal"
const TransfersPage = () => {
  return (
    <CustomerProvider>
    <div>
      <InventoryTable filterByStatus={['Available','in_transit','Transferred']}/>
    </div>
    </CustomerProvider>
  )
}

export default TransfersPage
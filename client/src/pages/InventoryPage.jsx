import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import InventoryTable from "../components/InventoryTable"
import CustomerProvider from "../context/CustomerProvider"
const InventoryPage = () => {
  return (
    <CustomerProvider>
    <div>
        <InventoryTable/>
    </div>
    </CustomerProvider>
  )
}

export default InventoryPage
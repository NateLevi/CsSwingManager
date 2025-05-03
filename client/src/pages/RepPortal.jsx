import SalesReps from '../components/SalesReps'
import CustomerTable from '../components/CustomerTable'
import CustomerProvider from '../context/CustomerProvider'
const RepPortal = () => {
  

  return (
    <CustomerProvider>
    <div className='bg-[#f5f7f8]'>
        <SalesReps/>
        <CustomerTable />
    </div>
    </CustomerProvider>
  )
}

export default RepPortal

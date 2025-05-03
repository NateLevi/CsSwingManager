import { useContext, useRef } from 'react'
import { CustomerContext } from '../context/CustomerContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const StatusChart = () => {
    const { inventory } = useContext(CustomerContext)
    const chartRef = useRef(null)
    const available = inventory.reduce((a,c) => c.status === 'Available' ? a += 1 : a,0)
    const sold = inventory.reduce((a,c) => c.status === 'Sold' ? a += 1 : a,0)
    const transferred = inventory.reduce((a,c) => c.status === 'Transferred' ? a += 1 : a,0)
    const inTransit = inventory.reduce((a,c) => c.status === 'In Transit' ? a += 1 : a,0)

    const data = {
        labels: ['Available', 'Sold', 'Transferred', 'In Transit'],
        datasets: [
          {
            label: '# of Items',
            data: [available, sold, transferred, inTransit], // Added inTransit to the data array
            backgroundColor: ['#00C853', '#D50000', '#FFAB00', '#2196F3'], // Added blue color for In Transit
            borderColor: ['#009624', '#9B0000', '#C66900', '#0D47A1'],
            borderWidth: 1,
          },
        ],
      };
      

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            title: {
                display: true,
                text: 'Inventory by Status',
                font: {
                    size: 16,
                    color: 'black'
                }
            }
        }
    }
    
    

    
    return(
        <div className="bg-white chart-container max-w-xs rounded-lg shadow-lg p-4" style={{ width: '420px', height: '450px' }}>
            <h1 className="chart-title text-xl font-bold text-gray-800 mb-2 pb-1 border-b-2 border-gray-300 flex justify-center items-center">Inventory by Status</h1>
            <div className="flex justify-center items-center" style={{ height: 'calc(100% - 50px)' }}>
                <Doughnut data={data} options={{...options, maintainAspectRatio: false}} ref={chartRef} />
            </div>
        </div>
    )
}

export default StatusChart
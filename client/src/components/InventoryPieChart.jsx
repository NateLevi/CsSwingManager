import { useContext, useRef } from 'react'
import { CustomerContext } from '../context/CustomerContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const InventoryPieChart = () => {
    const { products, inventory } = useContext(CustomerContext)


    // Filter inventory to only include 'Available' and 'Transferred' items
    const filteredOut = inventory.filter(item => 
        item.status === 'Available' || item.status === 'Transferred'
    ).map(item => {
        // Find the matching product to get brand information
        const matchingProduct = products.find(product => product.id === item.product_type_id);
        return {
            ...item,
            brand: matchingProduct ? matchingProduct.brand : 'Unknown'
        };
    });

    const chartRef = useRef(null)
    const apple = filteredOut.reduce((a,c) => c.brand === 'Apple' ? a + 1 : a, 0)
    const samsung = filteredOut.reduce((a,c) => c.brand === 'Samsung' ? a + 1 : a, 0)
    const google = filteredOut.reduce((a,c) => c.brand === 'Google' ? a + 1 : a, 0)
    const motorola = filteredOut.reduce((a,c) => c.brand === 'Motorola' ? a + 1 : a, 0)
    const kyocera = filteredOut.reduce((a,c) => c.brand === 'Kyocera' ? a + 1 : a, 0)
    const tcl = filteredOut.reduce((a,c) => c.brand === 'TCL' ? a + 1 : a, 0)

    const chartData = {
        labels: ['Apple', 'Samsung', 'Google', 'Motorola', 'Kyocera', 'TCL'],
        datasets: [
            {
                data: [apple, samsung, google, motorola, kyocera, tcl],
                backgroundColor: [
                    '#A2AAAD', '#1428A0', '#4285F4', '#E6002E', '#B71C1C','#F57C00'
                  ], 
                  hoverBackgroundColor: [
                    '#8C9298', '#0F1F70', '#356ac3', '#B30023', '#9B1E1E', '#DC6D00'
                  ]
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            title: {
                display: true,
                text: 'Inventory by Brand',
                font: {
                    size: 16,
                    color: 'black'
                }
            }
        }
    }
    
    

    
    return(
        <div className="bg-white chart-container max-w-xs rounded-lg shadow-lg p-4" style={{ width: '420px', height: '450px' }}>
            <h1 className="chart-title text-xl font-bold text-gray-800 mb-2 pb-1 border-b-2 border-gray-300 flex justify-center items-center">Inventory by Brand</h1>
            <div className="flex justify-center items-center" style={{ height: 'calc(100% - 50px)' }}>
                <Pie data={chartData} options={{...options, maintainAspectRatio: false}} ref={chartRef} />
            </div>
        </div>
    )
}

export default InventoryPieChart
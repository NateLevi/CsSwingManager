import { useContext, useRef } from 'react';
import { CustomerContext } from '../context/CustomerContext'; // Adjust path if needed
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const { inventory = [] } = useContext(CustomerContext); // Default to empty array
  const chartRef = useRef(null);

  // Ensure inventory is an array before filtering
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  // Count items for each store
  const storeCounts = safeInventory.reduce((acc, item) => {
    if (item && item.location) { // Check if item and location exist
        acc[item.location] = (acc[item.location] || 0) + 1;
    }
    return acc;
  }, {});

  // Prepare data dynamically based on found locations or predefined ones
  const labels = ['Store A', 'Store B', 'Store C'];
  const chartDataValues = labels.map(label => storeCounts[label] || 0);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Inventory Count',
        data: chartDataValues,
        backgroundColor: [
          'rgba(33, 33, 33, 0.8)',  // Store A - Dark Grey
          'rgba(117, 117, 117, 0.8)', // Store B - Medium Grey
          'rgba(189, 189, 189, 0.8)', // Store C - Light Grey
        ],
        borderColor: [
          'rgba(33, 33, 33, 1)',
          'rgba(117, 117, 117, 1)',
          'rgba(189, 189, 189, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0
            }
        },
        x: {
        }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full h-90 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        Inventory by Store
      </h2>
      <div className="flex-grow relative">
        <Bar data={data} options={options} ref={chartRef} />
      </div>
    </div>
  );
};

export default BarChart;
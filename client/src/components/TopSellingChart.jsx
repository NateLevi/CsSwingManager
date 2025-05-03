
import React, { useContext, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
} from 'chart.js';
import { CustomerContext } from '../context/CustomerContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function TopSellingChart() {
  const { inventory, products } = useContext(CustomerContext);

  const { labels, data } = useMemo(() => {
    const soldItems = inventory.filter(item => item.status === 'Sold');
    const counts = soldItems.reduce((acc, item) => {
      const p = products.find(p => p.id === item.product_type_id);
      const model = p?.model ?? 'Unknown';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});
    const top5 = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return {
      labels: top5.map(([model]) => model),
      data:    top5.map(([, count]) => count)
    };
  }, [inventory, products]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Units Sold',
        data,
        backgroundColor: 'rgba(0,0,0,0.7)'
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 5 Best-Selling Models'
      }
    },
    scales: {
      x: { beginAtZero: true }
    }
  };

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

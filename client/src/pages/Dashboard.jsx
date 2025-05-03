// src/pages/Dashboard.jsx
import CustomerProvider from "../context/CustomerProvider";
import InfoCard from "../components/InfoCard";
import InventoryPieChart from "../components/InventoryPieChart";
import StatusChart from "../components/StatusChart";
import BarChart from "../components/BarChart";
import AlertsWidget from "../components/AlertsWidget";
import TopSellingChart from "../components/TopSellingChart";

const Dashboard = () => {
  return (
    <CustomerProvider>
      <div className="bg-[#f5f7f8] p-4 overflow-hidden">

        {/* Top row - Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <InfoCard title="Total Reps" type="reps" className="bg-white shadow rounded" />
          <InfoCard title="Total Customers" type="customers" className="bg-white shadow rounded" />
          <InfoCard title="Total Inventory" type="inventory" className="bg-white shadow rounded" />
          <InfoCard title="Items in Transit" type="transit" className="bg-white shadow rounded" />
        </div>

        {/* First row of charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="min-w-0">
            <InventoryPieChart />
          </div>
          <div className="min-w-0">
            <StatusChart />
          </div>
          <div className="min-w-0">
            <BarChart />
          </div>
        </div>

        {/* Second row: flex layout */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3 min-w-0">
            <AlertsWidget />
          </div>

          <div className="w-full md:w-2/3 min-w-0">
            <TopSellingChart />
          </div>
        </div>

      </div>
    </CustomerProvider>
  );
};

export default Dashboard;
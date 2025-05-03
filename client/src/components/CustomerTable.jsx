import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
// No longer need timezone plugin for this specific calculation
// import timezone from 'dayjs/plugin/timezone';
import { useContext } from 'react'
import { CustomerContext } from '../context/CustomerContext';
import { getAuth } from 'firebase/auth';

// Initialize socket connection
const socket = io(import.meta.env.VITE_API_URL);

// Extend dayjs with utc plugin
dayjs.extend(utc);

// --- NEW: localStorage key ---
const LOCAL_STORAGE_KEY = 'customerStartTimes';

//---------------------------------------------Table---------------------------------------------------------//
const CustomerTable = () => {
  const { customers, setCustomers, nextCustomerNumber, setNextCustomerNumber } = useContext(CustomerContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- UPDATED: Initialize state from localStorage ---
  const [localStartTimeMap, setLocalStartTimeMap] = useState(() => {
    try {
      const savedMap = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Basic validation: Check if it's a non-empty string before parsing
      if (savedMap && typeof savedMap === 'string' && savedMap !== '{}') {
          return JSON.parse(savedMap); // { customerId: ISODateString }
      } else {
           return {};
      }
    } catch (error) {
      console.error("Error reading/parsing customer start times from localStorage:", error);
      return {};
    }
  });

  // --- NEW: Effect to save state changes to localStorage ---
  useEffect(() => {
    try {
      // Only save if the map is not empty to avoid storing '{}' unnecessarily
      if (Object.keys(localStartTimeMap).length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localStartTimeMap));
      } else {
          // Optionally remove the item if the map becomes empty
          // console.log("[LocalStorage Save] Map is empty, removing item.");
          // localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving customer start times to localStorage:", error);
    }
  }, [localStartTimeMap]);

  // Effect for the 1-second timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Effect for socket listener and initial data fetch (if any)
  useEffect(() => {


    socket.on('customerUpdated', () => {
      axios.get(`${import.meta.env.VITE_API_URL}/api/customers`)
        .then(response => {
          setCustomers(response.data);
          const helpedCustomers = response.data.filter(c => c.status.toLowerCase() === 'helped');
          if (helpedCustomers.length > 0) {
              setLocalStartTimeMap(prevMap => {
                  const newMap = { ...prevMap };
                  let changed = false;
                  helpedCustomers.forEach(customer => {
                      if (newMap[customer.id]) {
                          delete newMap[customer.id];
                          changed = true;
                      }
                  });
                  return changed ? newMap : prevMap;
              });
          }
        })
        .catch(error => console.error('Error reloading customers:', error));
    });

    return () => socket.off('customerUpdated');

  }, [setCustomers]);

  // Handle "Add Customer" button click
  const handleAddCustomer = async () => {
    try {
      const clientStartTime = new Date();
      const newCustomerData = {
        rep_id: null,
        customer_name: `Customer #${nextCustomerNumber}`,
        status: 'waiting'
      };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/customers`, newCustomerData);
      const newCustomer = response.data;

      if (!newCustomer || !newCustomer.id) {
         console.error("Invalid customer data received from server:", newCustomer);
         return;
      }

      // Update context state
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      setNextCustomerNumber(prevNumber => prevNumber + 1);

      setLocalStartTimeMap(prevMap => ({
        ...prevMap,
        [newCustomer.id]: clientStartTime.toISOString()
      }));

    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  // Handle "Remove Customer" button click
  const handleRemoveCustomer = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete the last customer?");
    if (!confirmDelete) return;

    try {
      if (customers.length === 0) {
           console.error("No customers to remove.");
           return;
       }
       const lastCustomer = customers[customers.length - 1];


      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
          console.error('Error removing customer: User not logged in.');
          return;
      }
      const idToken = await user.getIdToken();

      await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/customers/${lastCustomer.id}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== lastCustomer.id));

      setLocalStartTimeMap(prevMap => {
          const newMap = { ...prevMap };
          delete newMap[lastCustomer.id];
          return newMap;
      });

    } catch (err) {
      console.error('Error removing customer:', err);
    }
  };

  // --- Function to get display time ---
  const getDisplayTime = (customer) => {
      if (!customer || !customer.id) return "Invalid"; // Basic guard clause

      if (customer.status.toLowerCase() === 'helped') {
          return 'Finished';
      }

      const startTimeSource = localStartTimeMap[customer.id] ? 'local' : 'server';
      const startTimeValue = localStartTimeMap[customer.id] || customer.created_at;

      if (!startTimeValue) {
           console.warn(`No valid start time found for customer ${customer.id} (Source attempted: ${startTimeSource})`);
           return "0m 0s";
      }

      try {
          const startUtc = dayjs(startTimeValue).utc();
          const nowUtc = dayjs(currentTime).utc();

          if (!startUtc.isValid() || !nowUtc.isValid()) {
              console.error(`Invalid Dayjs object - Start: ${startUtc.isValid()}, Now: ${nowUtc.isValid()}`, { startTimeValue, currentTime });
              return "Error";
          }

          const diffInSeconds = nowUtc.diff(startUtc, 'second');
          const effectiveDiff = diffInSeconds < 0 ? 0 : diffInSeconds;

          const minutes = Math.floor(effectiveDiff / 60);
          const seconds = effectiveDiff % 60;

          return `${minutes}m ${seconds}s`;

      } catch (e) {
          console.error("Error calculating time:", e, { customerId: customer.id, startTimeValue, currentTime });
          return "Calc Error";
      }
  };


  return (
    <div className="flex flex-col items-center mb-20">
      <div className="card w-full max-w-4xl shadow-xl rounded-2xl overflow-x-auto">
        <h1 className="text-2xl font-bold text-center p-4">Waiting Customers ({customers.length})</h1>
        <table className="table table-zebra table-fixed w-full">
          <thead className="bg-[#2f2f2f] text-white sticky top-0">
            <tr>
              <th className="px-8 py-4 text-center">Line #</th>
              <th className="px-8 py-4 text-left">Customer</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-center">Wait Time</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => {
              return (
                <tr key={customer.id} className="hover:bg-gray-100 text-1xl">
                  <th className="px-8 py-4 text-center">{index + 1}</th>
                  <td className="px-8 py-4 font-bold">{customer.customer_name}</td>
                  <td className="px-8 py-4 text-center">
                    <span className="badge badge-info flex items-center justify-center">
                      <span
                        className={`inline-block w-3 h-3 mr-2 rounded-full ${
                          customer.status.toLowerCase() === 'waiting'
                            ? 'bg-red-500'
                            : customer.status.toLowerCase() === 'being helped'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                        }`}
                      ></span>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    {getDisplayTime(customer)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* ... buttons ... */}
       <div className="mt-4">
        <button
          onClick={handleAddCustomer}
          className="bg-black text-white p-2 rounded-md cursor-pointer mr-2">
          Add Customer
        </button>
        <button
          onClick={handleRemoveCustomer}
          className="bg-black text-white p-2 rounded-md cursor-pointer">
          Remove Customer
        </button>
      </div>
    </div>
  );
};

export default CustomerTable;

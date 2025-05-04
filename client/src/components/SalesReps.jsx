import { useState, useEffect } from 'react'
import axios from 'axios'
import { getAuth } from 'firebase/auth';


const SalesReps = () => {
  const [reps, setReps] = useState([])
  const auth = getAuth();
  const user = auth.currentUser

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/salesreps`)
      .then(response => {
        setReps(response.data)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      });
  }, []);

  const handleHelpNextCustomer = async () => {
    try {
      const token = await user.getIdToken();

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/customers/update/next`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newRepsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/salesreps`);
      setReps(newRepsResponse.data);
    } catch (err) {
      console.error('Error helping next customer:', err);
      if (err.response?.status === 409) {
        console.warn("Conflict: Rep might already be busy or no customers waiting.");
      } else if (err.response?.status === 404) {
         console.warn("Not Found: Rep or waiting customer not found.");
      }
    }
  };
  
  //if current logged in sales rep is busy then make it available again and remove the customer tied to that logged in user
  const handleFinishWithCustomer = async () => {
    try {
      const token = await user.getIdToken();
      
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/salesreps/finish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newRepsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/salesreps`);
      const allReps = newRepsResponse.data;
      
      // Rearrange the list so the current rep is at the bottom:
      const currentRep = allReps.find(rep => rep.firebase_id === user.uid);
      const otherReps = allReps.filter(rep => rep.firebase_id !== user.uid);
      setReps([...otherReps, currentRep]);
      
    } catch (err) {
      console.error('Error finishing with customer:', err);
    }
  };
  
  const handleResetRep = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your rep status? This will set your total customers to 0 and move you back to the top of the list."
    );
    if (!confirmed) return;
    
    try {
      const token = await user.getIdToken();
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/salesreps/reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newRepsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/salesreps`);
      setReps(newRepsResponse.data);
    } catch (err) {
      console.error('Error resetting rep:', err);
    }
  };
  

  const loggedInRep = reps.find(rep => rep.firebase_id === user?.uid);

    return (
    <div className="flex flex-col items-center p-6">
      <div className="card w-full max-w-4xl shadow-xl rounded-2xl overflow-x-auto">
        <h1 className="text-2xl font-bold text-center p-4">Sales Reps Status</h1>
        <table className="table table-zebra table-fixed w-full">
          <thead className="bg-[#2f2f2f] text-white sticky top-0">
            <tr>
              <th className="px-8 py-4 text-center">#</th>
              <th className="px-8 py-4 text-left">Sales Rep</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-center">Total Customers</th>
            </tr>
          </thead>
          <tbody>
          {[...reps]
  .sort((a, b) => {
    // First, if one rep is busy and the other available, busy stays on top.
    if (a.status.toLowerCase() === 'busy' && b.status.toLowerCase() !== 'busy') return -1;
    if (a.status.toLowerCase() !== 'busy' && b.status.toLowerCase() === 'busy') return 1;
    
    if (a.status.toLowerCase() === 'available' && b.status.toLowerCase() === 'available') {
      if (a.finished_at && b.finished_at) {
        return new Date(a.finished_at) - new Date(b.finished_at);
      }
      // If only one has finished_at, the one with finished_at goes to the bottom (i.e., is considered "finished")
      if (a.finished_at && !b.finished_at) return 1;
      if (!a.finished_at && b.finished_at) return -1;
    }
    return 0;
  })
  .map((rep, index) => (
    <tr key={rep.id} className="hover:bg-gray-100 text-1xl">
      <th className="px-8 py-4 text-center">{index + 1}</th>
      <td className="px-8 py-4 font-bold">{rep.name}</td>
      <td className="px-8 py-4 text-center">
  <span
    className={`inline-block px-3 py-1 rounded-full text-s font-semibold leading-tight ${ // Base styles for a badge-like look
      rep.status.toLowerCase() === 'available'
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'     
    }`}
  >
    {rep.status.charAt(0).toUpperCase() + rep.status.slice(1)}
  </span>
</td>
      <td className="px-8 py-4 text-center">{rep.total_customers}</td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-row space-x-4">
        <button
          onClick={handleHelpNextCustomer}
          disabled ={loggedInRep && loggedInRep.status.toLowerCase() === 'busy'}
          className="bg-black text-white p-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-auto"
        >
          Help
        </button>
        <button
          onClick={handleFinishWithCustomer}
          disabled ={loggedInRep && loggedInRep.status.toLowerCase() === 'available'}
          className="bg-black text-white p-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-auto"
        >
          Finish
        </button>
        <button 
          onClick={handleResetRep} 
          disabled ={loggedInRep && loggedInRep.status.toLowerCase() === 'busy'}
          className="bg-black text-white p-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-auto"
        >
          Reset Rep
        </button>

      </div>

    </div>
  )
}

export default SalesReps

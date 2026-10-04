import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Dashboard() {
  const api = useContext(ApiContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayCollections: 0,
    monthCollections: 0
  });
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);

      const pendingRes = await api.get('/reports/pending-fees');
      setPendingFees(pendingRes.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-gray-600 text-sm font-medium">Total Students</div>
          <div className="text-4xl font-bold text-blue-600 mt-2">{stats.totalStudents}</div>
        </div>

        <div className="card">
          <div className="text-gray-600 text-sm font-medium">Today's Collections</div>
          <div className="text-4xl font-bold text-green-600 mt-2">₹{stats.todayCollections.toLocaleString()}</div>
        </div>

        <div className="card">
          <div className="text-gray-600 text-sm font-medium">This Month Collections</div>
          <div className="text-4xl font-bold text-purple-600 mt-2">₹{stats.monthCollections.toLocaleString()}</div>
        </div>
      </div>

      {/* Pending Fees Table */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Top 10 Pending Fees</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Phone</th>
                <th>Monthly Fees</th>
                <th>Paid Amount</th>
                <th>Pending Amount</th>
              </tr>
            </thead>
            <tbody>
              {pendingFees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500">No pending fees</td>
                </tr>
              ) : (
                pendingFees.map(fee => (
                  <tr key={fee.id}>
                    <td className="font-medium">{fee.name}</td>
                    <td>{fee.phone}</td>
                    <td>₹{fee.total_monthly_fees.toLocaleString()}</td>
                    <td className="text-green-600">₹{fee.total_paid.toLocaleString()}</td>
                    <td className="text-red-600 font-medium">₹{fee.pending_amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

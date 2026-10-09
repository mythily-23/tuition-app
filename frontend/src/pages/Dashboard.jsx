import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Dashboard() {
  const api = useContext(ApiContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayCollections: 0,
    monthCollections: 0,
    collectionsByGrade: []
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

  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + parseFloat(f.pending_amount || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-2">Welcome back! Here's your tuition center overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid mb-8">
        <div className="stat-card stat-card-blue">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-gray-600 text-sm font-medium">👨‍🎓 Total Students</div>
              <div className="stat-value text-blue-600 mt-2">{stats.totalStudents}</div>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-gray-600 text-sm font-medium">👨‍🏫 Total Teachers</div>
              <div className="stat-value text-purple-600 mt-2">{stats.totalTeachers}</div>
            </div>
            <div className="text-3xl">🎓</div>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-gray-600 text-sm font-medium">📅 Today's Collections</div>
              <div className="stat-value text-red-600 mt-2">₹{(stats.todayCollections || 0).toLocaleString()}</div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-gray-600 text-sm font-medium">📊 This Month</div>
              <div className="stat-value text-green-600 mt-2">₹{(stats.monthCollections || 0).toLocaleString()}</div>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Collections by Grade */}
      {stats.collectionsByGrade && stats.collectionsByGrade.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">📊 Collections by Grade</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.collectionsByGrade.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-lg transition">
                <p className="text-sm text-purple-700 font-medium">{item.grade_name}</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">₹{(item.total || 0).toLocaleString()}</p>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-purple-600">Collected this month</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Fees Summary and Table */}
      <div className="card">
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">💳 Pending Fees Status</h2>
            <p className="text-sm text-gray-600 mt-1">Students with outstanding balance</p>
          </div>
          {pendingFees.length > 0 && (
            <div className="text-right">
              <p className="text-3xl font-bold text-red-600">₹{totalPendingAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">Total Pending</p>
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Grade</th>
                <th>Phone</th>
                <th>Monthly Fees</th>
                <th>Paid Amount</th>
                <th>Pending Amount</th>
              </tr>
            </thead>
            <tbody>
              {pendingFees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    ✅ Excellent! No pending fees - Everyone is paid up!
                  </td>
                </tr>
              ) : (
                pendingFees.map(fee => (
                  <tr key={fee.id}>
                    <td className="font-medium text-gray-900">{fee.name}</td>
                    <td className="text-purple-600 font-medium">{fee.grade_name || '-'}</td>
                    <td className="text-gray-600">{fee.phone || 'N/A'}</td>
                    <td className="text-gray-600">₹{(fee.total_monthly_fees || 0).toLocaleString()}</td>
                    <td className="text-green-600 font-medium">₹{(fee.total_paid || 0).toLocaleString()}</td>
                    <td className="text-red-600 font-bold">₹{(fee.pending_amount || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pendingFees.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Showing top 10 students with pending fees</p>
            <p className="text-xs text-gray-500 mt-1">View the Reports section for detailed analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

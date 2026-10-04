import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Reports() {
  const api = useContext(ApiContext);
  const [pendingFees, setPendingFees] = useState([]);
  const [monthlyCollections, setMonthlyCollections] = useState([]);
  const [teacherPayroll, setTeacherPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const pendingRes = await api.get('/reports/pending-fees');
      setPendingFees(pendingRes.data);

      const monthlyRes = await api.get('/reports/monthly-collection');
      setMonthlyCollections(monthlyRes.data);

      const payrollRes = await api.get('/reports/teacher-payroll');
      setTeacherPayroll(payrollRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + parseFloat(f.pending_amount || 0), 0);
  const totalTeacherSalary = teacherPayroll.reduce((sum, t) => sum + parseFloat(t.monthly_salary || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'pending' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Fees ({pendingFees.length})
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'monthly' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly Collections
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'payroll' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Teacher Payroll
        </button>
      </div>

      {/* Pending Fees Report */}
      {activeTab === 'pending' && (
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Fees</h2>
            <div className="text-3xl font-bold text-red-600">
              ₹{totalPendingAmount.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total amount pending from {pendingFees.length} students</p>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Phone</th>
                  <th>Total Monthly Fees</th>
                  <th>Paid Amount</th>
                  <th>Pending Amount</th>
                  <th>% Paid</th>
                </tr>
              </thead>
              <tbody>
                {pendingFees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-8">
                      ✅ No pending fees - Everyone is paid up!
                    </td>
                  </tr>
                ) : (
                  pendingFees.map(fee => {
                    const percentage = fee.total_monthly_fees > 0 
                      ? Math.round((fee.total_paid / fee.total_monthly_fees) * 100)
                      : 0;
                    return (
                      <tr key={fee.id}>
                        <td className="font-medium">{fee.name}</td>
                        <td>{fee.phone || 'N/A'}</td>
                        <td>₹{fee.total_monthly_fees.toLocaleString()}</td>
                        <td className="text-green-600">₹{fee.total_paid.toLocaleString()}</td>
                        <td className="text-red-600 font-medium">₹{fee.pending_amount.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{width: `${percentage}%`}}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Collections Report */}
      {activeTab === 'monthly' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Collections (Last 12 Months)</h2>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Collection Amount</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {monthlyCollections.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-8">
                      No collections yet
                    </td>
                  </tr>
                ) : (
                  monthlyCollections.map((mc, idx) => {
                    const maxAmount = Math.max(...monthlyCollections.map(m => parseFloat(m.total || 0)));
                    const percentage = maxAmount > 0 ? (parseFloat(mc.total || 0) / maxAmount) * 100 : 0;
                    return (
                      <tr key={idx}>
                        <td className="font-medium">{new Date(mc.month).toLocaleDateString('en-IN', {year: 'numeric', month: 'short'})}</td>
                        <td className="text-blue-600 font-medium">₹{parseFloat(mc.total || 0).toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded h-6">
                              <div 
                                className="bg-blue-600 h-6 rounded" 
                                style={{width: `${percentage}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher Payroll Report */}
      {activeTab === 'payroll' && (
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Payroll Summary</h2>
            <div className="text-3xl font-bold text-purple-600">
              ₹{totalTeacherSalary.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total monthly salary for {teacherPayroll.length} teachers</p>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Monthly Salary</th>
                  <th>Active Students</th>
                  <th>Salary per Student</th>
                </tr>
              </thead>
              <tbody>
                {teacherPayroll.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-8">
                      No teachers added yet
                    </td>
                  </tr>
                ) : (
                  teacherPayroll.map(teacher => {
                    const salaryPerStudent = teacher.student_count > 0 
                      ? Math.round(teacher.monthly_salary / teacher.student_count)
                      : 0;
                    return (
                      <tr key={teacher.id}>
                        <td className="font-medium">{teacher.name}</td>
                        <td className="text-purple-600 font-medium">₹{teacher.monthly_salary.toLocaleString()}</td>
                        <td className="text-center">{teacher.student_count || 0}</td>
                        <td className="text-gray-600">₹{salaryPerStudent.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

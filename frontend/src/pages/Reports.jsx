import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Reports() {
  const api = useContext(ApiContext);
  const [pendingFees, setPendingFees] = useState([]);
  const [monthlyCollections, setMonthlyCollections] = useState([]);
  const [teacherPayroll, setTeacherPayroll] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  const [filters, setFilters] = useState({
    gradeId: '',
    subjectId: ''
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch pending fees with filters
      const queryParams = new URLSearchParams();
      if (filters.gradeId) queryParams.append('gradeId', filters.gradeId);
      if (filters.subjectId) queryParams.append('subjectId', filters.subjectId);
      
      const pendingRes = await api.get(`/reports/pending-fees?${queryParams.toString()}`);
      setPendingFees(pendingRes.data);

      // Fetch monthly collections
      const monthlyRes = await api.get('/reports/monthly-collection');
      setMonthlyCollections(monthlyRes.data);

      // Fetch teacher payroll
      const payrollRes = await api.get('/reports/teacher-payroll');
      setTeacherPayroll(payrollRes.data);

      // Fetch grades and subjects for filters
      if (grades.length === 0) {
        const gradesRes = await api.get('/grades');
        setGrades(gradesRes.data);
      }
      if (subjects.length === 0) {
        const subjectsRes = await api.get('/subjects');
        setSubjects(subjectsRes.data);
      }
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
  const totalTeacherSalary = teacherPayroll.reduce((sum, t) => sum + parseFloat(t.total_salary || 0), 0);
  const totalCollected = monthlyCollections.reduce((sum, m) => sum + parseFloat(m.total || 0), 0);

  return (
    <div>
      <h1 className="page-title">Reports & Analytics</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b-2 border-gray-200 flex-wrap">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium border-b-4 transition ${
            activeTab === 'pending' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💰 Pending Fees ({pendingFees.length})
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-3 font-medium border-b-4 transition ${
            activeTab === 'monthly' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Collections
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-6 py-3 font-medium border-b-4 transition ${
            activeTab === 'payroll' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          👨‍🏫 Payroll ({teacherPayroll.length})
        </button>
      </div>

      {/* Pending Fees Report */}
      {activeTab === 'pending' && (
        <>
          {/* Filters */}
          <div className="card mb-8 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Filter by Grade</label>
                <select
                  value={filters.gradeId}
                  onChange={(e) => setFilters({...filters, gradeId: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Grades</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Filter by Subject</label>
                <select
                  value={filters.subjectId}
                  onChange={(e) => setFilters({...filters, subjectId: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({gradeId: '', subjectId: ''})}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Pending Fees Summary */}
          <div className="card mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Fees Summary</h2>
                <p className="text-sm text-gray-600">Students with outstanding balance</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">₹{totalPendingAmount.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-1">Total Pending</p>
              </div>
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
                    <th>Pending</th>
                    <th>% Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 py-8">
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
                          <td className="font-medium text-gray-900">{fee.name}</td>
                          <td className="text-purple-600 font-medium">{fee.grade_name || '-'}</td>
                          <td className="text-gray-600">{fee.phone || 'N/A'}</td>
                          <td className="text-gray-600">₹{(fee.total_monthly_fees || 0).toLocaleString()}</td>
                          <td className="text-green-600 font-medium">₹{(fee.total_paid || 0).toLocaleString()}</td>
                          <td className="text-red-600 font-bold">₹{(fee.pending_amount || 0).toLocaleString()}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{width: `${percentage}%`}}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-10">{percentage}%</span>
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
        </>
      )}

      {/* Monthly Collections Report */}
      {activeTab === 'monthly' && (
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Collections (Last 12 Months)</h2>
              <p className="text-sm text-gray-600">Collection trend over time</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">₹{totalCollected.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Total Collected</p>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Collection Amount</th>
                  <th>Visual Chart</th>
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
                    const date = new Date(mc.month);
                    return (
                      <tr key={idx}>
                        <td className="font-medium text-gray-900">
                          {date.toLocaleDateString('en-IN', {year: 'numeric', month: 'short'})}
                        </td>
                        <td className="text-blue-600 font-bold">₹{(parseFloat(mc.total || 0)).toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all" 
                                style={{width: `${percentage}%`}}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{Math.round(percentage)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {monthlyCollections.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Average Monthly Collection:</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{Math.round(totalCollected / monthlyCollections.length).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Teacher Payroll Report */}
      {activeTab === 'payroll' && (
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Payroll Summary</h2>
              <p className="text-sm text-gray-600">Monthly salary commitments</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">₹{totalTeacherSalary.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Total Monthly Cost</p>
            </div>
          </div>

          <div className="table-container mb-6">
            <table className="table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Subject</th>
                  <th>Total Salary</th>
                </tr>
              </thead>
              <tbody>
                {teacherPayroll.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-8">
                      No teachers added yet
                    </td>
                  </tr>
                ) : (
                  teacherPayroll.map(teacher => (
                    <tr key={teacher.id}>
                      <td className="font-medium text-gray-900">{teacher.name}</td>
                      <td className="text-gray-600">Subject ID: {teacher.subject_id || '-'}</td>
                      <td className="text-purple-600 font-bold">₹{(teacher.total_salary || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payroll Breakdown Cards */}
          {teacherPayroll.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherPayroll.map(teacher => (
                <div key={teacher.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">Subject ID: {teacher.subject_id || 'Not assigned'}</p>
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-gray-600">Total Salary</p>
                    <p className="text-2xl font-bold text-purple-600">₹{(teacher.total_salary || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {teacherPayroll.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Monthly payroll breakdown:</p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-green-600">{teacherPayroll.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Average Salary</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{Math.round(totalTeacherSalary / teacherPayroll.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

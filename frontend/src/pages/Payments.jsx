import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Payments() {
  const api = useContext(ApiContext);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    months_covered: '1',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const paymentsRes = await api.get('/payments');
      setPayments(paymentsRes.data);

      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    setSelectedStudent(student);
    setFormData({ ...formData, student_id: studentId });
    
    if (student) {
      try {
        const res = await api.get(`/enrollments/student/${student.id}`);
        setEnrollments(res.data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const paymentPayload = {
        student_id: parseInt(formData.student_id),
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        months_covered: parseInt(formData.months_covered),
        notes: formData.notes
      };

      const response = await api.post('/payments', paymentPayload);
      
      // Show receipt with student info
      const student = selectedStudent;
      const totalMonthlyFees = enrollments.reduce((sum, e) => sum + (e.monthly_fee || 0), 0);
      
      alert(`
💰 PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━
Student: ${student?.name}
Grade: ${student?.grade_name || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━
Amount Paid: ₹${parseFloat(formData.amount).toLocaleString()}
Date: ${formData.payment_date}
Months: ${formData.months_covered}
Method: ${formData.payment_method.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━
Total Monthly Fees: ₹${totalMonthlyFees.toLocaleString()}
Payment ID: #${response.data.id}
━━━━━━━━━━━━━━━━━━━━━━━━
✅ Payment Recorded Successfully!`);

      setFormData({
        student_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        months_covered: '1',
        notes: ''
      });
      setSelectedStudent(null);
      setEnrollments([]);
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Error adding payment: ' + error.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Payments & Collections</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Record Payment
        </button>
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Record New Payment</h2>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.grade_name || 'No Grade'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Grade:</span> {selectedStudent.grade_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Monthly Fees:</span> ₹{enrollments.reduce((sum, e) => sum + (e.monthly_fee || 0), 0).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Payment Date</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="input-field"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="online">🏦 Online Transfer</option>
                  <option value="check">✓ Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Months Covered</label>
                <input
                  type="number"
                  min="1"
                  value={formData.months_covered}
                  onChange={(e) => setFormData({...formData, months_covered: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>

            {selectedStudent && enrollments.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">Enrolled Subjects:</p>
                <div className="space-y-1">
                  {enrollments.map(e => (
                    <p key={e.id} className="text-sm text-blue-800">
                      • {e.subject_name} - ₹{e.monthly_fee.toLocaleString()}/month
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Record Payment</button>
              <button 
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedStudent(null);
                  setEnrollments([]);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Recent Payments</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Months</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">No payments recorded yet</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id}>
                    <td className="font-medium text-gray-900">{payment.student_name}</td>
                    <td className="text-green-600 font-bold">₹{(payment.amount || 0).toLocaleString()}</td>
                    <td className="text-gray-600">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</td>
                    <td className="capitalize text-gray-600">{payment.payment_method}</td>
                    <td className="text-gray-600">{payment.months_covered}</td>
                    <td className="text-gray-500 text-sm">{payment.notes || '-'}</td>
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

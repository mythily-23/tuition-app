import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Payments() {
  const api = useContext(ApiContext);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

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
      
      // Show receipt
      const studentName = students.find(s => s.id === parseInt(formData.student_id))?.name;
      alert(`💰 RECEIPT\n\nStudent: ${studentName}\nAmount: ₹${formData.amount}\nDate: ${formData.payment_date}\nMonths: ${formData.months_covered}\nMethod: ${formData.payment_method}\n\nPayment ID: ${response.data.id}\n\n✅ Payment recorded successfully!`);

      setFormData({
        student_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        months_covered: '1',
        notes: ''
      });
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Payments</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          💰 Record Payment
        </button>
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Months Covered</label>
                <input
                  type="number"
                  min="1"
                  value={formData.months_covered}
                  onChange={(e) => setFormData({...formData, months_covered: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Record Payment</button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
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
        <h2 className="text-2xl font-bold mb-4">Recent Payments</h2>
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
                  <td colSpan="6" className="text-center text-gray-500">No payments recorded</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id}>
                    <td className="font-medium">{payment.student_name}</td>
                    <td className="text-green-600 font-medium">₹{payment.amount.toLocaleString()}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="capitalize">{payment.payment_method}</td>
                    <td>{payment.months_covered}</td>
                    <td className="text-gray-600">{payment.notes || '-'}</td>
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

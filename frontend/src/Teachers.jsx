import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Teachers() {
  const api = useContext(ApiContext);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    subject_id: '',
    monthly_salary: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const teachersRes = await api.get('/teachers');
      setTeachers(teachersRes.data);

      const subjectsRes = await api.get('/subjects');
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teachers', {
        name: formData.name,
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
        monthly_salary: parseFloat(formData.monthly_salary),
        phone: formData.phone
      });
      setFormData({ name: '', subject_id: '', monthly_salary: '', phone: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Error adding teacher: ' + error.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const totalMonthlySalary = teachers.reduce((sum, t) => sum + parseFloat(t.monthly_salary || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Teachers ({teachers.length})</h1>
          <p className="text-xl text-gray-600 mt-2">Total Monthly Salary: ₹{totalMonthlySalary.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Add Teacher
        </button>
      </div>

      {/* Add Teacher Form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Add Teacher</h2>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Teacher Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-field"
              />
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                className="input-field"
              >
                <option value="">Select Subject (Optional)</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Monthly Salary (₹)"
                value={formData.monthly_salary}
                onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Add Teacher</button>
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

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(teacher => (
          <div key={teacher.id} className="card">
            <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
            <p className="text-sm text-gray-600 mt-2">📱 {teacher.phone || 'N/A'}</p>
            <p className="text-sm text-gray-600">📚 {teacher.subject_name || 'No subject assigned'}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-lg font-bold text-blue-600">₹{teacher.monthly_salary.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Monthly Salary</p>
            </div>
            {teacher.student_count && (
              <div className="mt-2 text-sm text-gray-600">
                📊 {teacher.student_count} active student{teacher.student_count !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="card text-center text-gray-500 py-12">
          No teachers added yet. Click "+ Add Teacher" to get started.
        </div>
      )}
    </div>
  );
}

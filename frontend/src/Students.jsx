import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Students() {
  const api = useContext(ApiContext);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parent_phone: '',
    email: '',
    address: ''
  });

  const [enrollmentData, setEnrollmentData] = useState({
    subject_id: '',
    monthly_fee: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      const subjectsRes = await api.get('/subjects');
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      setFormData({ name: '', phone: '', parent_phone: '', email: '', address: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Error adding student: ' + error.message);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/enrollments/student/${student.id}`);
      setEnrollments(res.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleAddEnrollment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enrollments', {
        student_id: selectedStudent.id,
        subject_id: parseInt(enrollmentData.subject_id),
        monthly_fee: parseFloat(enrollmentData.monthly_fee)
      });
      setEnrollmentData({ subject_id: '', monthly_fee: '' });
      setShowEnrollmentForm(false);
      handleSelectStudent(selectedStudent);
    } catch (error) {
      alert('Error adding enrollment: ' + error.message);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try {
        await api.delete(`/enrollments/${enrollmentId}`);
        handleSelectStudent(selectedStudent);
      } catch (error) {
        alert('Error deleting enrollment: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Students ({students.length})</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Add Student
        </button>
      </div>

      {/* Add Student Form */}
      {showForm && (
        <div className="card mb-8">
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Student Name"
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
              <input
                type="tel"
                placeholder="Parent Phone"
                value={formData.parent_phone}
                onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="input-field"
                colSpan="2"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Add Student</button>
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

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => (
          <div 
            key={student.id}
            onClick={() => handleSelectStudent(student)}
            className={`card cursor-pointer transition hover:shadow-lg ${selectedStudent?.id === student.id ? 'ring-2 ring-blue-600' : ''}`}
          >
            <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
            <p className="text-sm text-gray-600 mt-1">📱 {student.phone}</p>
            <p className="text-sm text-gray-600">👨‍👩‍👧 {student.parent_phone}</p>
          </div>
        ))}
      </div>

      {/* Student Details & Enrollments */}
      {selectedStudent && (
        <div className="card mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name} - Enrollments</h2>
            <button 
              onClick={() => setShowEnrollmentForm(!showEnrollmentForm)}
              className="btn-primary"
            >
              + Add Subject
            </button>
          </div>

          {showEnrollmentForm && (
            <form onSubmit={handleAddEnrollment} className="card bg-blue-50 mb-4 space-y-3">
              <select
                value={enrollmentData.subject_id}
                onChange={(e) => setEnrollmentData({...enrollmentData, subject_id: e.target.value})}
                className="input-field"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Monthly Fee (₹)"
                value={enrollmentData.monthly_fee}
                onChange={(e) => setEnrollmentData({...enrollmentData, monthly_fee: e.target.value})}
                className="input-field"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Add Subject</button>
                <button 
                  type="button"
                  onClick={() => setShowEnrollmentForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Monthly Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500">No enrollments yet</td>
                  </tr>
                ) : (
                  enrollments.map(enrollment => (
                    <tr key={enrollment.id}>
                      <td className="font-medium">{enrollment.subject_name}</td>
                      <td>₹{enrollment.monthly_fee.toLocaleString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ApiContext } from '../App';

export default function Students() {
  const api = useContext(ApiContext);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    grade_id: '',
    phone: '',
    parent_phone: '',
    email: '',
    address: ''
  });

  const [enrollmentData, setEnrollmentData] = useState({
    subject_id: '',
    monthly_fee: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      const subjectsRes = await api.get('/subjects');
      setSubjects(subjectsRes.data);

      const gradesRes = await api.get('/grades');
      setGrades(gradesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

    useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', {
        ...formData,
        grade_id: formData.grade_id ? parseInt(formData.grade_id) : null
      });
      setFormData({ name: '', grade_id: '', phone: '', parent_phone: '', email: '', address: '' });
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
    if (!selectedStudent.grade_id) {
      alert('Please set the student grade first!');
      return;
    }
    try {
      await api.post('/enrollments', {
        student_id: selectedStudent.id,
        subject_id: parseInt(enrollmentData.subject_id),
        grade_id: selectedStudent.grade_id,
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Students ({students.length})</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Add Student
        </button>
      </div>

      {/* Add Student Form */}
      {showForm && (
        <div className="card mb-8 bg-purple-50 border-purple-200">
          <h2 className="text-xl font-bold mb-6 text-gray-900">➕ Add New Student</h2>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Student Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Grade</label>
                <select
                  value={formData.grade_id}
                  onChange={(e) => setFormData({...formData, grade_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone</label>
                <input
                  type="tel"
                  placeholder="Student's phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Parent Phone</label>
                <input
                  type="tel"
                  placeholder="Parent's phone"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {students.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-500">
            No students added yet. Click "+ Add Student" to get started.
          </div>
        ) : (
          students.map(student => (
            <div 
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className={`card cursor-pointer transition hover:shadow-lg ${selectedStudent?.id === student.id ? 'ring-2 ring-purple-600' : ''}`}
            >
              <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
              <p className="text-sm text-purple-600 font-medium mt-1">{student.grade_name || 'No Grade'}</p>
              <p className="text-sm text-gray-600 mt-2">📱 {student.phone || '-'}</p>
              <p className="text-sm text-gray-600">👨‍👩‍👧 {student.parent_phone || '-'}</p>
            </div>
          ))
        )}
      </div>

      {/* Student Details & Enrollments */}
      {selectedStudent && (
        <div className="card">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-purple-200">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{selectedStudent.name}</h2>
              <p className="text-lg text-purple-600 font-bold mt-2">📚 {selectedStudent.grade_name || 'No Grade Assigned'}</p>
              
              {/* Student Info Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-600">Student Phone:</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Parent Phone:</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.parent_phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email:</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Address:</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowEnrollmentForm(!showEnrollmentForm)}
              className="btn-primary"
            >
              + Add Subject
            </button>
          </div>

          {showEnrollmentForm && (
            <form onSubmit={handleAddEnrollment} className="card bg-purple-50 mb-6 space-y-4 border-purple-200">
              <h3 className="font-bold text-gray-900 text-lg">📖 Enroll in Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
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
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter any amount"
                    value={enrollmentData.monthly_fee}
                    onChange={(e) => setEnrollmentData({...enrollmentData, monthly_fee: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">💡 Fee is flexible - set any amount based on class level and subject</p>
              <div className="flex gap-2 pt-2">
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

          <h3 className="text-lg font-bold text-gray-900 mb-4">Enrolled Subjects ({enrollments.length})</h3>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No subjects enrolled yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "+ Add Subject" to enroll</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map(enrollment => {
                const totalFees = enrollments.reduce((sum, e) => sum + (e.monthly_fee || 0), 0);
                return (
                  <div key={enrollment.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{enrollment.subject_name}</h4>
                        <p className="text-2xl font-bold text-purple-600 mt-2">₹{(enrollment.monthly_fee || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-600 mt-1">per month</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm bg-red-50 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {enrollments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Monthly Fees:</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₹{enrollments.reduce((sum, e) => sum + (e.monthly_fee || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-2">Across {enrollments.length} subject{enrollments.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useContext , useCallback} from 'react';
import { ApiContext } from '../App';

export default function Teachers() {
  const api = useContext(ApiContext);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSalaries, setTeacherSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    subject_id: '',
    phone: ''
  });

  const [salaryForm, setSalaryForm] = useState({
    teacher_id: '',
    grade_id: '',
    monthly_salary: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const teachersRes = await api.get('/teachers');
      setTeachers(teachersRes.data);

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

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teachers', {
        name: formData.name,
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
        phone: formData.phone
      });
      setFormData({ name: '', subject_id: '', phone: '' });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      alert('Error adding teacher: ' + error.message);
    }
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      const res = await api.get(`/teacher-grade-salary/${teacher.id}`);
      setTeacherSalaries(res.data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    
    try {
      await api.post('/teacher-grade-salary', {
        teacher_id: selectedTeacher.id,
        grade_id: parseInt(salaryForm.grade_id),
        monthly_salary: parseFloat(salaryForm.monthly_salary)
      });
      setSalaryForm({ teacher_id: '', grade_id: '', monthly_salary: '' });
      setShowSalaryForm(null);
      handleSelectTeacher(selectedTeacher);
    } catch (error) {
      alert('Error adding salary: ' + error.message);
    }
  };

  const handleDeleteSalary = async (id) => {
    if (window.confirm('Delete this salary record?')) {
      try {
        await api.delete(`/teacher-grade-salary/${id}`);
        handleSelectTeacher(selectedTeacher);
      } catch (error) {
        alert('Error deleting salary: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const totalMonthlySalary = teacherSalaries.reduce((sum, s) => sum + (s.monthly_salary || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Teachers Management</h1>
          {selectedTeacher && (
            <p className="text-gray-600 mt-2">
              Total Salary for {selectedTeacher.name}: <span className="font-bold text-purple-600">₹{totalMonthlySalary.toLocaleString()}</span>
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          + Add Teacher
        </button>
      </div>

      {/* Add Teacher Form */}
      {showAddForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Teacher</h2>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g., Raj Sir"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Add Teacher</button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {teachers.length === 0 ? (
          <div className="col-span-3 card text-center text-gray-500">
            No teachers added yet. Click "+ Add Teacher" to get started.
          </div>
        ) : (
          teachers.map(teacher => (
            <div 
              key={teacher.id}
              onClick={() => handleSelectTeacher(teacher)}
              className={`card cursor-pointer transition hover:shadow-lg ${selectedTeacher?.id === teacher.id ? 'ring-2 ring-purple-600 bg-purple-50' : ''}`}
            >
              <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
              <p className="text-sm text-purple-600 font-medium mt-1">📚 {teacher.subject_name || 'No Subject'}</p>
              <p className="text-sm text-gray-600 mt-2">📱 {teacher.phone || 'N/A'}</p>
              {selectedTeacher?.id === teacher.id && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-gray-500">Total Salary:</p>
                  <p className="text-lg font-bold text-purple-600">₹{totalMonthlySalary.toLocaleString()}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Teacher Salary Management */}
      {selectedTeacher && (
        <div className="card">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedTeacher.subject_name || 'Subject: Not Assigned'}</p>
            </div>
            <button 
              onClick={() => setShowSalaryForm(showSalaryForm ? null : 'form')}
              className="btn-primary"
            >
              + Add Grade Salary
            </button>
          </div>

          {/* Add Salary Form */}
          {showSalaryForm === 'form' && (
            <form onSubmit={handleAddSalary} className="card bg-purple-50 mb-6 space-y-4 border-purple-200">
              <h3 className="font-bold text-gray-900">Add Grade-Wise Salary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Grade</label>
                  <select
                    value={salaryForm.grade_id}
                    onChange={(e) => setSalaryForm({...salaryForm, grade_id: e.target.value})}
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
                  <label className="block text-sm font-medium mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter salary"
                    value={salaryForm.monthly_salary}
                    onChange={(e) => setSalaryForm({...salaryForm, monthly_salary: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Add Salary</button>
                <button 
                  type="button"
                  onClick={() => setShowSalaryForm(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Salary List */}
          <h3 className="text-lg font-bold text-gray-900 mb-4">Grade-Wise Salary Breakdown</h3>
          {teacherSalaries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No salary records yet. Click "+ Add Grade Salary" to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherSalaries.map(salary => (
                <div key={salary.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-medium text-purple-700">{salary.grade_name}</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">₹{(salary.monthly_salary || 0).toLocaleString()}</p>
                      <p className="text-xs text-purple-600 mt-1">monthly salary</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteSalary(salary.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {teacherSalaries.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Monthly Salary Commitment:</p>
              <p className="text-3xl font-bold text-green-600">₹{totalMonthlySalary.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-2">Across {teacherSalaries.length} grade level{teacherSalaries.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

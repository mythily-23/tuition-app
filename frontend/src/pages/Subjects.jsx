import React, { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../App';

export default function Subjects() {
  const api = useContext(ApiContext);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjectGrades, setSubjectGrades] = useState([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [loading, setLoading] = useState(true);

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: ''
  });

  const [gradeForm, setGradeForm] = useState({
    subject_id: '',
    grade_id: '',
    reference_fee: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const subjectsRes = await api.get('/subjects');
      setSubjects(subjectsRes.data);

      const gradesRes = await api.get('/grades');
      setGrades(gradesRes.data);

      const sgRes = await api.get('/subject-grades');
      setSubjectGrades(sgRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', subjectForm);
      setSubjectForm({ name: '', description: '' });
      setShowAddSubject(false);
      fetchData();
    } catch (error) {
      alert('Error adding subject: ' + error.message);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subject-grades', {
        subject_id: parseInt(gradeForm.subject_id),
        grade_id: parseInt(gradeForm.grade_id),
        reference_fee: parseFloat(gradeForm.reference_fee)
      });
      setGradeForm({ subject_id: '', grade_id: '', reference_fee: '' });
      setShowAddGrade(false);
      fetchData();
    } catch (error) {
      alert('Error adding grade: ' + error.message);
    }
  };

  const handleDeleteSubjectGrade = async (id) => {
    if (window.confirm('Delete this grade mapping?')) {
      try {
        await api.delete(`/subject-grades/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Subjects Management</h1>
        <button 
          onClick={() => setShowAddSubject(!showAddSubject)}
          className="btn-primary"
        >
          + Add Subject
        </button>
      </div>

      {/* Add Subject Form */}
      {showAddSubject && (
        <div className="card mb-8 bg-purple-50 border-purple-200">
          <h2 className="text-xl font-bold mb-6 text-gray-900">➕ Add New Subject</h2>
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Subject Name</label>
              <input
                type="text"
                placeholder="e.g., Mathematics, Science, Hindi"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
              <input
                type="text"
                placeholder="Optional - describe what will be taught"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Add Subject</button>
              <button 
                type="button"
                onClick={() => setShowAddSubject(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Grade to Subject Form */}
      {showAddGrade && (
        <div className="card mb-8 bg-purple-50 border-purple-200">
          <h2 className="text-xl font-bold mb-6 text-gray-900">📚 Add Grade to Subject</h2>
          <form onSubmit={handleAddGrade} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                <select
                  value={gradeForm.subject_id}
                  onChange={(e) => setGradeForm({...gradeForm, subject_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Grade</label>
                <select
                  value={gradeForm.grade_id}
                  onChange={(e) => setGradeForm({...gradeForm, grade_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Reference Fee (₹)</label>
              <input
                type="number"
                placeholder="This is just a reference - actual fees are set per student"
                value={gradeForm.reference_fee}
                onChange={(e) => setGradeForm({...gradeForm, reference_fee: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Add Grade</button>
              <button 
                type="button"
                onClick={() => setShowAddGrade(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {subjects.length === 0 ? (
          <div className="col-span-2 card text-center text-gray-500 py-12">
            <div className="text-4xl mb-3">📚</div>
            <p>No subjects added yet. Click "+ Add Subject" to get started.</p>
          </div>
        ) : (
          subjects.map(subject => {
            const subjectGradesList = subjectGrades.filter(sg => sg.subject_id === subject.id);
            return (
              <div key={subject.id} className="card border-l-4 border-l-purple-600 hover:shadow-lg transition">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">📖 {subject.name}</h3>
                {subject.description && (
                  <p className="text-sm text-gray-600 mb-4 italic">{subject.description}</p>
                )}
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  {subjectGradesList.length === 0 ? (
                    <p className="text-sm text-purple-600 font-medium">📌 No grades added yet</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-700 mb-3">Grade Reference Fees:</p>
                      <div className="space-y-2">
                        {subjectGradesList.map(sg => (
                          <div key={sg.id} className="flex justify-between items-center p-3 bg-white rounded border border-purple-200 hover:bg-purple-50 transition">
                            <div>
                              <p className="font-medium text-gray-900">{sg.grade_name}</p>
                              <p className="text-sm text-purple-600 font-bold">₹{(sg.reference_fee || 0).toLocaleString()}/month</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteSubjectGrade(sg.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Grade Button */}
      {subjects.length > 0 && (
        <div className="card text-center bg-purple-50 border-purple-200">
          <button 
            onClick={() => setShowAddGrade(!showAddGrade)}
            className="btn-primary"
          >
            + Add Grade to Subject
          </button>
        </div>
      )}
    </div>
  );
}

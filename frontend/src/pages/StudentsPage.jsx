import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function StudentsPage({ token }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    dob: '',
    parent_name: '',
    parent_contact_1: '',
    parent_contact_2: '',
    address: '',
    email: '',
    admission_date: '',
    class_id: '',
    section: '',
    status: 'active'
  });

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const { role, hasPermission } = useAuth();

  if (!hasPermission('students','view')) {
    return (
      <div className="p-6 text-slate-300">You do not have permission to view students.</div>
    );
  }

  async function loadStudents() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load students');
      const data = await res.json();
      setStudents(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadClasses() {
    try {
      const res = await fetch('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    }
  }

  async function handleEdit(student) {
    setEditingId(student.id);
    setError('');
    setShowForm(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setError('Failed to load student details');
        return;
      }
      const j = await res.json();
      const s = j.data || {};
      function normalizeDate(v){
        if(!v) return '';
        if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        if(typeof v === 'string' && v.length >= 10 && v[4]==='-' && v[7]==='-') return v.slice(0,10);
        try{ const d=new Date(v); if(!isNaN(d)) return d.toISOString().slice(0,10); }catch(e){}
        return '';
      }

      setFormData({
        full_name: s.full_name || '',
        gender: s.gender || '',
        dob: normalizeDate(s.dob),
        parent_name: s.parent_name || '',
        parent_contact_1: s.parent_contact || s.parent_contact_1 || s.mobile || '',
        parent_contact_2: s.parent_contact_2 || '',
        address: s.address || '',
        email: s.email || '',
        admission_date: normalizeDate(s.admission_date),
        class_id: s.class_id || '',
        section: s.section || '',
        status: s.status || 'active'
      });
    } catch (err) {
      console.error('Edit load failed', err);
      setError('Failed to load student details');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/students/${editingId}` : '/api/students';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(editingId ? 'Failed to update student' : 'Failed to create student');
      
      resetForm();
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    setError('');

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete student');
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setFormData({
      full_name: '',
      gender: '',
      dob: '',
      parent_name: '',
      parent_contact_1: '',
      parent_contact_2: '',
      address: '',
      email: '',
      admission_date: '',
      class_id: '',
      section: '',
      status: 'active'
    });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Students Management</h1>
          {hasPermission('students','create') && (
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400"
            >
              {showForm ? 'Cancel' : 'Add Student'}
            </button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="date"
                placeholder="DOB"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />
              <input
                type="tel"
                placeholder="Parent Contact Number 1"
                value={formData.parent_contact_1}
                onChange={(e) => setFormData({ ...formData, parent_contact_1: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />

              <input
                type="text"
                placeholder="Parent Name"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />
              <input
                type="tel"
                placeholder="Parent Contact Number 2"
                value={formData.parent_contact_2}
                onChange={(e) => setFormData({ ...formData, parent_contact_2: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />
              <input
                type="date"
                placeholder="Date of Joining ACC"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />

              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.class_name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />

              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400"
              >
                {editingId ? 'Update Student' : 'Create Student'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading students…</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-1">
            {students.length === 0 ? (
              <p className="text-slate-400">No students found.</p>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-3 text-left font-semibold">Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Class</th>
                      <th className="px-6 py-3 text-left font-semibold">Email</th>
                      <th className="px-6 py-3 text-left font-semibold">Parent Contact 1</th>
                      <th className="px-6 py-3 text-left font-semibold">Parent Contact 2</th>
                      {(hasPermission('students','edit') || hasPermission('students','delete')) && (
                        <th className="px-6 py-3 text-left font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-6 py-3">{student.full_name}</td>
                        <td className="px-6 py-3">{student.class_name || '-'}</td>
                        <td className="px-6 py-3">{student.email}</td>
                        <td className="px-6 py-3">{student.parent_contact || student.parent_contact_1 || student.mobile || '-'}</td>
                        <td className="px-6 py-3">{student.parent_contact_2 || '-'}</td>
                      {(hasPermission('students','edit') || hasPermission('students','delete')) && (
                        <td className="px-6 py-3">
                          {hasPermission('students','edit') && (
                            <button
                              onClick={() => handleEdit(student)}
                              className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500"
                            >
                              Edit
                            </button>
                          )}
                          {hasPermission('students','delete') && (
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsPage;

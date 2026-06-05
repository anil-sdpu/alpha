import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function SubjectsPage({ token }) {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_name: '',
    subject_code: '',
    description: ''
  });

  useEffect(() => {
    loadSubjects();
    loadClasses();
  }, []);

  const { hasPermission } = useAuth();

  if (!hasPermission('subjects','view')) {
    return <div className="p-6 text-slate-300">You do not have permission to view subjects.</div>;
  }

  async function loadSubjects() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load subjects');
      const data = await res.json();
      setSubjects(data.data || []);
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

  function handleEdit(subject) {
    setEditingId(subject.id);
    setFormData(subject);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/subjects/${editingId}` : '/api/subjects';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(editingId ? 'Failed to update subject' : 'Failed to create subject');
      
      resetForm();
      loadSubjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    setError('');

    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete subject');
      loadSubjects();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setFormData({
      class_id: '',
      subject_name: '',
      subject_code: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Subjects Management</h1>
          {hasPermission('subjects','create') && (
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400"
            >
              {showForm ? 'Cancel' : 'Add Subject'}
            </button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Subject' : 'Add New Subject'}</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                placeholder="Subject Name"
                value={formData.subject_name}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
                required
              />

              <input
                type="text"
                placeholder="Subject Code"
                value={formData.subject_code}
                onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400"
              >
                {editingId ? 'Update Subject' : 'Create Subject'}
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
          <p className="text-slate-400">Loading subjects…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {subjects.length === 0 ? (
              <p className="p-6 text-slate-400">No subjects found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Subject Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Code</th>
                    <th className="px-6 py-3 text-left font-semibold">Description</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{subject.subject_name}</td>
                      <td className="px-6 py-3">{subject.subject_code}</td>
                      <td className="px-6 py-3 text-slate-400">{subject.description}</td>
                      <td className="px-6 py-3">
                        {hasPermission('subjects','edit') && (
                          <button
                            onClick={() => handleEdit(subject)}
                            className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500"
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission('subjects','delete') && (
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubjectsPage;

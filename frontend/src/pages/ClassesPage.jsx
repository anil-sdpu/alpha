import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function ClassesPage({ token }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '',
    academic_year: '',
    description: ''
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const { hasPermission } = useAuth();

  if (!hasPermission('classes','view')) {
    return <div className="p-6 text-slate-300">You do not have permission to view classes.</div>;
  }

  async function loadClasses() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load classes');
      const data = await res.json();
      setClasses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(cls) {
    setEditingId(cls.id);
    setFormData(cls);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/classes/${editingId}` : '/api/classes';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(editingId ? 'Failed to update class' : 'Failed to create class');
      
      resetForm();
      loadClasses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this class?')) return;
    setError('');

    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete class');
      loadClasses();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setFormData({
      class_name: '',
      academic_year: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Classes Management</h1>
          {hasPermission('classes','create') && (
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400"
            >
              {showForm ? 'Cancel' : 'Add Class'}
            </button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Class' : 'Add New Class'}</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Class Name"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
                required
              />
              <input
                type="text"
                placeholder="Academic Year"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
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
                {editingId ? 'Update Class' : 'Create Class'}
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
          <p className="text-slate-400">Loading classes…</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.length === 0 ? (
              <p className="text-slate-400">No classes found.</p>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                  <h3 className="mb-2 text-xl font-semibold">{cls.class_name}</h3>
                  <p className="mb-2 text-sm text-slate-400">{cls.academic_year}</p>
                  <p className="mb-2 text-sm text-slate-300">Students: {typeof cls.student_count !== 'undefined' ? cls.student_count : '-'}</p>
                  <p className="mb-4 text-sm text-slate-300">{cls.description}</p>
                  <div className="flex gap-3">
                    {hasPermission('classes','edit') && (
                      <button
                        onClick={() => handleEdit(cls)}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white transition hover:bg-blue-500"
                      >
                        Edit
                      </button>
                    )}
                    {hasPermission('classes','delete') && (
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-1 text-xs text-white transition hover:bg-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassesPage;

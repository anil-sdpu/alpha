import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function ChaptersPage({ token }) {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ subject_id: '', chapter_number: '', title: '', notes_path: '', status: 'published' });

  useEffect(() => { load(); loadSubjects(); }, []);
  const { hasPermission } = useAuth();

  if (!hasPermission('chapters','view')) {
    return <div className="p-6 text-slate-300">You do not have permission to view chapters.</div>;
  }

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/chapters', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load chapters');
      const j = await res.json(); setItems(j.data || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  async function loadSubjects() {
    try { const res = await fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const j = await res.json(); setSubjects(j.data || []); } } catch (e) {}
  }

  function handleEdit(it) { setEditingId(it.id); setFormData(it); setShowForm(true); }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/chapters/${editingId}` : '/api/chapters';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error(editingId ? 'Failed to update chapter' : 'Failed to create chapter');
      resetForm(); load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) { if (!confirm('Delete chapter?')) return; setError(''); try { const res = await fetch(`/api/chapters/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error('Failed to delete chapter'); load(); } catch (err) { setError(err.message); } }

  function resetForm() { setFormData({ subject_id: '', chapter_number: '', title: '', notes_path: '', status: 'published' }); setEditingId(null); setShowForm(false); }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Chapters</h1>
          {hasPermission('chapters','create') && (
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{showForm ? 'Cancel' : 'Add Chapter'}</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
              </select>
              <input type="text" placeholder="Chapter Number" value={formData.chapter_number} onChange={e => setFormData({ ...formData, chapter_number: e.target.value })} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
              <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" required />
              <input type="text" placeholder="Notes Path" value={formData.notes_path} onChange={e => setFormData({ ...formData, notes_path: e.target.value })} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={!hasPermission('chapters', editingId ? 'edit' : 'create')} className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId ? 'Update Chapter' : 'Create Chapter'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading chapters…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length === 0 ? (
              <p className="p-6 text-slate-400">No chapters found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Title</th>
                    <th className="px-6 py-3 text-left font-semibold">Subject</th>
                    <th className="px-6 py-3 text-left font-semibold">#</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{it.title}</td>
                      <td className="px-6 py-3">{it.subject_name || '-'}</td>
                      <td className="px-6 py-3">{it.chapter_number}</td>
                      <td className="px-6 py-3">
                        {hasPermission('chapters','edit') && <button onClick={() => handleEdit(it)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>}
                        {hasPermission('chapters','delete') && <button onClick={() => handleDelete(it.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
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

export default ChaptersPage;
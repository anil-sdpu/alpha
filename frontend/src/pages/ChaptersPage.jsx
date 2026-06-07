import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function ChaptersPage({ token }) {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ class_id: '', subject_id: '', chapter_number: '', title: '', notes_path: '', status: 'published' });

  useEffect(() => { loadClasses(); loadSubjects(); load(); }, []);
  const { hasPermission } = useAuth();

  if (!hasPermission('chapters','view')) {
    return <div className="p-6 text-slate-300">You do not have permission to view chapters.</div>;
  }

  async function load(classId = null, subjectId = null) {
    setLoading(true); setError('');
    try {
      let url = '/api/chapters';
      if (classId && subjectId) url = `/api/chapters?class_id=${classId}&subject_id=${subjectId}`;
      else if (subjectId) url = `/api/chapters?subject_id=${subjectId}`;
      else if (classId) url = `/api/chapters?class_id=${classId}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load chapters');
      const j = await res.json(); setItems(j.data || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  async function loadClasses() {
    try { const res = await fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const j = await res.json(); setClasses(j.data || []); } } catch (e) { console.error(e); }
  }

  async function loadSubjects(classId = null) {
    try {
      const url = classId ? `/api/subjects?class_id=${classId}` : '/api/subjects';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const j = await res.json(); setSubjects(j.data || []); }
    } catch (e) { console.error(e); }
  }

  function handleEdit(it) {
    setEditingId(it.id);
    // Ensure formData has class_id and subject_id
    setFormData({
      class_id: it.class_id || '',
      subject_id: it.subject_id || '',
      chapter_number: it.chapter_number || '',
      title: it.title || '',
      notes_path: it.notes_path || '',
      status: it.status || 'published'
    });
    // load subjects for the chapter's class so subject select is scoped
    if (it.class_id) loadSubjects(it.class_id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/chapters/${editingId}` : '/api/chapters';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error(editingId ? 'Failed to update chapter' : 'Failed to create chapter');
      resetForm(); load(selectedClass, selectedSubject); loadClasses();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) { if (!confirm('Delete chapter?')) return; setError(''); try { const res = await fetch(`/api/chapters/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error('Failed to delete chapter'); load(selectedClass); } catch (err) { setError(err.message); } }

  function resetForm() {
    setFormData({ class_id: selectedClass || '', subject_id: '', chapter_number: '', title: '', notes_path: '', status: 'published' });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Chapters List</h1>
          {hasPermission('chapters','create') && (
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{showForm ? 'Cancel' : 'Add Chapter'}</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        { !selectedClass && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {classes.map(c => (
              <div key={c.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <h3 className="text-lg font-semibold">{c.class_name}</h3>
                <p className="text-sm text-slate-400">Chapters: {c.chapters_count ?? '-'}</p>
                <div className="mt-3">
                  <button onClick={() => { setSelectedClass(c.id); setSelectedSubject(null); loadSubjects(c.id); load(c.id); }} className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white">View chapters</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedClass && !selectedSubject && (
          <div className="mb-6">
            <button onClick={() => { setSelectedClass(null); setSelectedSubject(null); load(); }} className="rounded-lg bg-slate-800 px-3 py-1">← Back to classes</button>
            <h2 className="mt-4 text-xl">Subjects for {classes.find(x=>x.id===selectedClass)?.class_name || selectedClass}</h2>
          </div>
        )}

        {selectedSubject && (
          <div className="mb-6">
            <button onClick={() => { setSelectedSubject(null); load(selectedClass); }} className="rounded-lg bg-slate-800 px-3 py-1">← Back to subjects</button>
            <h2 className="mt-4 text-xl">Chapters in {subjects.find(x=>x.id===selectedSubject)?.subject_name || selectedSubject}</h2>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.class_id} onChange={e => {
                const val = e.target.value;
                setFormData({ ...formData, class_id: val, subject_id: '' });
                loadSubjects(val);
              }} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" required>
                <option value="">Select Class</option>
                {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.class_name}</option>)}
              </select>

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
          selectedClass && !selectedSubject ? (
            // show subjects tiles for the selected class
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {subjects.map(s => (
                <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <h3 className="text-lg font-semibold">{s.subject_name}</h3>
                  <p className="text-sm text-slate-400">Chapters: {s.chapters_count ?? '-'}</p>
                  <div className="mt-3">
                    <button onClick={() => { setSelectedSubject(s.id); load(null, s.id); }} className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white">View chapters</button>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedClass && selectedSubject ? (
            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
              {(() => {
                const filtered = items.filter(it => String(it.subject_id) === String(selectedSubject));
                if (filtered.length === 0) return (<p className="p-6 text-slate-400">No chapters found for this subject.</p>);
                return (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-3 text-left font-semibold">Title</th>
                      <th className="px-6 py-3 text-left font-semibold">#</th>
                      {(hasPermission('chapters','edit') || hasPermission('chapters','delete')) && (
                        <th className="px-6 py-3 text-left font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((it) => (
                      <tr key={it.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-6 py-3 font-medium">{it.title}</td>
                        <td className="px-6 py-3">{it.chapter_number}</td>
                        {(hasPermission('chapters','edit') || hasPermission('chapters','delete')) && (
                          <td className="px-6 py-3">
                            {hasPermission('chapters','edit') && <button onClick={() => handleEdit(it)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>}
                            {hasPermission('chapters','delete') && <button onClick={() => handleDelete(it.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                );
              })()}
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default ChaptersPage;
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function TestsPage({ token }){
  const [items,setItems]=useState([]);
  const [papers,setPapers]=useState([]);
  const [classes,setClasses]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [formData,setFormData]=useState({class_id:'',subject_id:'',chapter_id:'',test_type:'weekly',title:'',date:'',start_time:'',end_time:'',total_marks:100,duration_minutes:60});
  const [editingId,setEditingId]=useState(null); const [show,setShow]=useState(false);
  const [uploadShow, setUploadShow] = useState(false);
  const [uploadTestId, setUploadTestId] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(()=>{load(); loadMeta();},[]);
  useEffect(()=>{ loadPapers(); },[]);
  const { hasPermission } = useAuth();

  if (!hasPermission('tests','view')) {
    return <div className="p-6 text-slate-300">You do not have permission to view tests.</div>;
  }

  async function load(){ setLoading(true); setError(''); try{ const res=await fetch('/api/tests',{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) throw new Error('Failed to load tests'); const j=await res.json(); setItems(j.data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  async function loadPapers(){ try{ const res = await fetch('/api/question_papers',{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) return; const j = await res.json(); setPapers(j.data || []); }catch(e){} }

  async function loadMeta(){ try{ const r1=await fetch('/api/classes',{headers:{Authorization:`Bearer ${token}`}}); if(r1.ok){ setClasses((await r1.json()).data||[]);} const r2=await fetch('/api/subjects',{headers:{Authorization:`Bearer ${token}`}}); if(r2.ok){ setSubjects((await r2.json()).data||[]);} }catch(e){} }

  function resetForm(){ setFormData({class_id:'',subject_id:'',chapter_id:'',test_type:'weekly',title:'',date:'',start_time:'',end_time:'',total_marks:100,duration_minutes:60}); setEditingId(null); setShow(false); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const method=editingId?'PUT':'POST'; const url=editingId?`/api/tests/${editingId}`:'/api/tests'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(formData)}); if(!r.ok) throw new Error(editingId?'Failed to update test':'Failed to create test'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function handleEdit(it){ setEditingId(it.id); setFormData(it); setShow(true); }
  async function handleDelete(id){ if(!confirm('Delete test?')) return; setError(''); try{ const r=await fetch(`/api/tests/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete test'); load(); }catch(e){ setError(e.message);} }

  function openUpload(testId){ setUploadTestId(testId); setUploadTitle(''); setUploadFile(null); setUploadError(''); setUploadShow(true); }

  function handleFileSelect(e){ setUploadFile(e.target.files && e.target.files[0] ? e.target.files[0] : null); }

  async function handleUploadSubmit(e){ e.preventDefault(); if(!uploadTestId) return setUploadError('No test selected'); if(!uploadFile) return setUploadError('Select a PDF to upload'); setUploadLoading(true); setUploadError(''); try{ const fd = new FormData(); fd.append('file', uploadFile); fd.append('test_id', uploadTestId); fd.append('title', uploadTitle || 'Paper'); const r = await fetch('/api/upload/question_paper',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:fd}); if(!r.ok){ const j = await r.json().catch(()=>null); throw new Error((j && j.error) ? j.error : 'Upload failed'); } setUploadShow(false); load(); }catch(e){ setUploadError(e.message);} finally{ setUploadLoading(false); } }

  async function handleUploadSubmit(e){
    e.preventDefault();
    if(!uploadTestId) return setUploadError('No test selected');
    if(!uploadFile) return setUploadError('Select a PDF to upload');
    setUploadLoading(true); setUploadError('');
    try{
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('test_id', uploadTestId);
      fd.append('title', uploadTitle || 'Paper');
      const r = await fetch('/api/upload/question_paper',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:fd});
      if(!r.ok){ const j = await r.json().catch(()=>null); throw new Error((j && j.error) ? j.error : 'Upload failed'); }
      setUploadShow(false);
      await load();
      await loadPapers();
    }catch(e){ setUploadError(e.message);} finally{ setUploadLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Tests</h1>
          {hasPermission('tests','create') && (
            <button onClick={()=>{ resetForm(); setShow(!show); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{show?'Cancel':'Add Test'}</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {show && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId?'Edit Test':'Create Test'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.class_id} onChange={e=>setFormData({...formData,class_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" required>
                <option value="">Select Class</option>
                {classes.map(c=> <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
              <select value={formData.subject_id} onChange={e=>setFormData({...formData,subject_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" required>
                <option value="">Select Subject</option>
                {subjects.map(s=> <option key={s.id} value={s.id}>{s.subject_name}</option>)}
              </select>
              <input type="text" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" required />
              <input type="date" value={formData.date} onChange={e=>setFormData({...formData,date:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={!hasPermission('tests', editingId ? 'edit' : 'create')} className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId?'Update Test':'Create Test'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {uploadShow && (
          <form onSubmit={handleUploadSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Upload Question Paper</h2>
            <p className="text-sm text-slate-400">Uploading for test ID: {uploadTestId}</p>
            {uploadError && <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{uploadError}</div>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input type="text" placeholder="Paper Title" value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
              <input type="file" accept="application/pdf" onChange={handleFileSelect} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={uploadLoading} className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-emerald-400">{uploadLoading?'Uploading...':'Upload'}</button>
              <button type="button" onClick={()=>setUploadShow(false)} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading tests…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length===0 ? (
              <p className="p-6 text-slate-400">No tests found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Title</th>
                    <th className="px-6 py-3 text-left font-semibold">Class</th>
                    <th className="px-6 py-3 text-left font-semibold">Subject</th>
                    <th className="px-6 py-3 text-left font-semibold">Papers</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    {(hasPermission('tests','edit') || hasPermission('tests','delete') || hasPermission('tests','create')) && (
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map(it=> (
                    <tr key={it.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{it.title}</td>
                      <td className="px-6 py-3">{it.class_name}</td>
                      <td className="px-6 py-3">{it.subject_name}</td>
                      <td className="px-6 py-3">
                        {papers.filter(p=>p.test_id===it.id).length===0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          papers.filter(p=>p.test_id===it.id).map(p => (
                            <div key={p.id} className="mb-1">
                              <a href={`/${p.pdf_path || p.pdf_path}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{p.title || 'Paper'}</a>
                            </div>
                          ))
                        )}
                      </td>
                      <td className="px-6 py-3">{it.date}</td>
                      {(hasPermission('tests','edit') || hasPermission('tests','delete') || hasPermission('tests','create')) && (
                        <td className="px-6 py-3">
                          {hasPermission('tests','edit') && <button onClick={()=>handleEdit(it)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>}
                          {hasPermission('tests','create') && <button onClick={()=>openUpload(it.id)} className="mr-2 rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500">Upload Paper</button>}
                          {hasPermission('tests','delete') && <button onClick={()=>handleDelete(it.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
                        </td>
                      )}
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
export default TestsPage;
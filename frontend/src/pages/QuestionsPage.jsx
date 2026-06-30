import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import config from '../config';

function QuestionsPage({ token }){
  const [items,setItems]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [chapters,setChapters]=useState([]);
  const [uploads, setUploads] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [formData,setFormData]=useState({subject_id:'',chapter_id:'',question_type:'mcq',question_text:'',options:[],correct_answer:'',marks:1,difficulty:'medium',tags:''});
  const [show,setShow]=useState(false); const [editingId,setEditingId]=useState(null);
  const [importShow, setImportShow] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(()=>{load(); loadMeta(); loadUploads();},[]);

  const { hasPermission } = useAuth();

  async function load(){ setLoading(true); setError(''); try{ const res=await fetch('/api/questions',{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) throw new Error('Failed to load questions'); setItems((await res.json()).data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  async function loadUploads(){ try{ const res = await fetch('/api/practice/uploads',{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) return; const j = await res.json(); setUploads(j.data || []); }catch(e){ console.error(e); } }

  async function loadMeta(){ try{ const r1=await fetch('/api/subjects',{headers:{Authorization:`Bearer ${token}`}}); if(r1.ok) setSubjects((await r1.json()).data||[]); const r2=await fetch('/api/chapters',{headers:{Authorization:`Bearer ${token}`}}); if(r2.ok) setChapters((await r2.json()).data||[]); }catch(e){}
  }

  function addOption(){ setFormData({...formData,options:[...formData.options,'']}); }
  function setOption(i,v){ const o=[...formData.options]; o[i]=v; setFormData({...formData,options:o}); }
  function removeOpt(i){ const o=[...formData.options]; o.splice(i,1); setFormData({...formData,options:o}); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const payload={...formData,options: formData.options}; const method=editingId?'PUT':'POST'; const url=editingId?`/api/questions/${editingId}`:'/api/questions'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)}); if(!r.ok) throw new Error(editingId?'Failed to update question':'Failed to create question'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function resetForm(){ setFormData({subject_id:'',chapter_id:'',question_type:'mcq',question_text:'',options:[],correct_answer:'',marks:1,difficulty:'medium',tags:''}); setEditingId(null); setShow(false); }

  function handleEdit(q){
    const parsed = { ...q };
    try {
      parsed.options = q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [];
    } catch (e) {
      parsed.options = [];
    }
    setEditingId(q.id);
    setFormData(parsed);
    setShow(true);
  }
  async function handleDelete(id){ if(!confirm('Delete question?')) return; setError(''); try{ const r=await fetch(`/api/questions/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete question'); load(); }catch(e){ setError(e.message);} }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Practice Questions</h1>
          <div className="flex gap-2">
            {hasPermission('questions','create') && (
              <button onClick={()=>{ setImportShow(!importShow); setImportError(''); setImportFile(null); }} className="rounded-2xl bg-emerald-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-emerald-400">{importShow?'Close Upload':'Upload Practice File'}</button>
            )}
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {/* add question form removed — Practice module now supports only file uploads */}

        {importShow && (
          <form onSubmit={async (e)=>{
            e.preventDefault(); if(!importFile){ setImportError('Select a file'); return; } setImportLoading(true); setImportError(''); try{ const fd=new FormData(); fd.append('file', importFile); const r=await fetch('/api/practice/uploads',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:fd}); if(!r.ok){ const j=await r.json().catch(()=>null); throw new Error((j&&j.error)?j.error:'Upload failed'); } const j=await r.json(); alert('File uploaded'); setImportShow(false); setImportFile(null); await loadUploads(); }catch(err){ setImportError(err.message);} finally{ setImportLoading(false); } }} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Upload Practice File (PDF / Image)</h2>
            {importError && <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{importError}</div>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input type="file" accept="application/pdf,image/*" onChange={e=>setImportFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={importLoading} className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-emerald-400">{importLoading?'Uploading...':'Upload'}</button>
              <button type="button" onClick={()=>setImportShow(false)} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 p-4">
            {uploads.length===0 ? (
              <p className="p-6 text-slate-400">No uploaded practice files.</p>
            ) : (
              <div className="space-y-3">
                {uploads.map(u => {
                  // derive public URL from configured uploads base
                  const filename = u.file_path ? u.file_path.split('/').pop() : null;
                  const encoded = filename ? encodeURIComponent(filename) : null;
                  const publicUrl = encoded ? `${config.UPLOADS_BASE_URL.replace(/\/$/, '')}/${encoded}` : null;
                  return (
                    <div key={u.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-3">
                      <div>
                        <div className="font-medium">{u.original_name}</div>
                        <div className="text-sm text-slate-400">Uploaded: {new Date(u.created_at).toLocaleString()} {u.uploaded_by_name ? `by ${u.uploaded_by_name}` : ''}</div>
                      </div>
                      <div className="flex gap-2">
                        {publicUrl && <button onClick={()=> { setPreviewUrl(publicUrl); setPreviewMime(u.mime_type || 'application/octet-stream'); setShowPreview(true); }} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700">View</button>}
                        {hasPermission('questions','delete') && <button onClick={async ()=>{ if(!confirm('Delete this file?')) return; try{ const r=await fetch(`/api/practice/uploads/${u.id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Delete failed'); await loadUploads(); }catch(e){ alert(e.message); } }} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-xl bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Preview</div>
              <div className="flex gap-2">
                {previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700">Open in new tab</a>}
                <button onClick={() => { setShowPreview(false); setPreviewUrl(null); setPreviewMime(null); }} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Close</button>
              </div>
            </div>
            <div className="overflow-auto">
              {previewMime && previewMime.startsWith('image') ? (
                <img src={previewUrl} alt="preview" className="w-full h-auto max-h-[75vh] object-contain" />
              ) : (
                <iframe src={previewUrl} title="preview" className="w-full h-[75vh] border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default QuestionsPage;
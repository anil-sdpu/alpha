import { useState, useEffect } from 'react';

function DPQPage({ token }){
  const [items,setItems]=useState([]);
  const [classes,setClasses]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [formData,setFormData]=useState({class_id:'',subject_id:'',chapter_id:'',title:'',description:'',publish_date:'',due_date:''});
  const [show,setShow]=useState(false); const [editingId,setEditingId]=useState(null);

  useEffect(()=>{ load(); loadMeta(); },[]);

  async function load(){ setLoading(true); setError(''); try{ const r=await fetch('/api/dpq',{headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to load DPQ'); setItems((await r.json()).data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  async function loadMeta(){ try{ const r1=await fetch('/api/classes',{headers:{Authorization:`Bearer ${token}`}}); if(r1.ok) setClasses((await r1.json()).data||[]); const r2=await fetch('/api/subjects',{headers:{Authorization:`Bearer ${token}`}}); if(r2.ok) setSubjects((await r2.json()).data||[]); }catch(e){}
  }

  function resetForm(){ setFormData({class_id:'',subject_id:'',chapter_id:'',title:'',description:'',publish_date:'',due_date:''}); setEditingId(null); setShow(false); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const method=editingId?'PUT':'POST'; const url=editingId?`/api/dpq/${editingId}`:'/api/dpq'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(formData)}); if(!r.ok) throw new Error(editingId?'Failed to update DPQ':'Failed to create DPQ'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function handleEdit(it){ setEditingId(it.id); setFormData(it); setShow(true); }
  async function handleDelete(id){ if(!confirm('Delete DPQ?')) return; setError(''); try{ const r=await fetch(`/api/dpq/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete DPQ'); load(); }catch(e){ setError(e.message);} }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Daily Practice Questions (DPQ)</h1>
          <button onClick={()=>{ resetForm(); setShow(!show); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{show?'Cancel':'Add DPQ'}</button>
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {show && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId?'Edit DPQ':'Create DPQ'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.class_id} onChange={e=>setFormData({...formData,class_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Class</option>{classes.map(c=> <option key={c.id} value={c.id}>{c.class_name}</option>)}</select>
              <select value={formData.subject_id} onChange={e=>setFormData({...formData,subject_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Subject</option>{subjects.map(s=> <option key={s.id} value={s.id}>{s.subject_name}</option>)}</select>
              <input type="text" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" required />
              <textarea placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId?'Update DPQ':'Create DPQ'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading DPQs…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length===0 ? (<p className="p-6 text-slate-400">No DPQs found.</p>) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Title</th>
                    <th className="px-6 py-3 text-left font-semibold">Class</th>
                    <th className="px-6 py-3 text-left font-semibold">Publish</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(d=> (
                    <tr key={d.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{d.title}</td>
                      <td className="px-6 py-3">{d.class_name}</td>
                      <td className="px-6 py-3">{d.publish_date}</td>
                      <td className="px-6 py-3">
                        <button onClick={()=>handleEdit(d)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>
                        <button onClick={()=>handleDelete(d.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>
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
export default DPQPage;
import { useState, useEffect } from 'react';

function QuestionsPage({ token }){
  const [items,setItems]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [chapters,setChapters]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [formData,setFormData]=useState({subject_id:'',chapter_id:'',question_type:'mcq',question_text:'',options:[],correct_answer:'',marks:1,difficulty:'medium',tags:''});
  const [show,setShow]=useState(false); const [editingId,setEditingId]=useState(null);

  useEffect(()=>{load(); loadMeta();},[]);

  async function load(){ setLoading(true); setError(''); try{ const res=await fetch('/api/questions',{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) throw new Error('Failed to load questions'); setItems((await res.json()).data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  async function loadMeta(){ try{ const r1=await fetch('/api/subjects',{headers:{Authorization:`Bearer ${token}`}}); if(r1.ok) setSubjects((await r1.json()).data||[]); const r2=await fetch('/api/chapters',{headers:{Authorization:`Bearer ${token}`}}); if(r2.ok) setChapters((await r2.json()).data||[]); }catch(e){}
  }

  function addOption(){ setFormData({...formData,options:[...formData.options,'']}); }
  function setOption(i,v){ const o=[...formData.options]; o[i]=v; setFormData({...formData,options:o}); }
  function removeOpt(i){ const o=[...formData.options]; o.splice(i,1); setFormData({...formData,options:o}); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const payload={...formData,options: formData.options}; const method=editingId?'PUT':'POST'; const url=editingId?`/api/questions/${editingId}`:'/api/questions'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)}); if(!r.ok) throw new Error(editingId?'Failed to update question':'Failed to create question'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function resetForm(){ setFormData({subject_id:'',chapter_id:'',question_type:'mcq',question_text:'',options:[],correct_answer:'',marks:1,difficulty:'medium',tags:''}); setEditingId(null); setShow(false); }

  function handleEdit(q){ setEditingId(q.id); setFormData(q); setShow(true); }
  async function handleDelete(id){ if(!confirm('Delete question?')) return; setError(''); try{ const r=await fetch(`/api/questions/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete question'); load(); }catch(e){ setError(e.message);} }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Questions</h1>
          <button onClick={()=>{ resetForm(); setShow(!show); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{show?'Cancel':'Add Question'}</button>
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {show && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId?'Edit Question':'Create Question'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.subject_id} onChange={e=>setFormData({...formData,subject_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Subject</option>{subjects.map(s=> <option key={s.id} value={s.id}>{s.subject_name}</option>)}</select>
              <select value={formData.chapter_id} onChange={e=>setFormData({...formData,chapter_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Chapter</option>{chapters.map(c=> <option key={c.id} value={c.id}>{c.title}</option>)}</select>
              <select value={formData.question_type} onChange={e=>setFormData({...formData,question_type:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="mcq">MCQ</option><option value="short_answer">Short Answer</option><option value="true_false">True/False</option></select>
              <textarea value={formData.question_text} onChange={e=>setFormData({...formData,question_text:e.target.value})} placeholder="Question" className="col-span-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" />
              {formData.question_type==='mcq' && (<div className="md:col-span-2">
                <button type="button" onClick={addOption} className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Add option</button>
                <div className="mt-2 space-y-2">{formData.options.map((opt,i)=>(<div key={i} className="flex gap-2"><input value={opt} onChange={e=>setOption(i,e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 flex-1" /><button type="button" onClick={()=>removeOpt(i)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Remove</button></div>))}</div>
              </div>)}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId?'Update':'Create'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading questions…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length===0 ? (<p className="p-6 text-slate-400">No questions found.</p>) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800"><th className="px-6 py-3 text-left font-semibold">Question</th><th className="px-6 py-3 text-left font-semibold">Type</th><th className="px-6 py-3 text-left font-semibold">Marks</th><th className="px-6 py-3 text-left font-semibold">Actions</th></tr>
                </thead>
                <tbody>{items.map(q=>(<tr key={q.id} className="border-b border-slate-800 hover:bg-slate-800/50"><td className="px-6 py-3 font-medium">{q.question_text}</td><td className="px-6 py-3">{q.question_type}</td><td className="px-6 py-3">{q.marks}</td><td className="px-6 py-3"><button onClick={()=>handleEdit(q)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button><button onClick={()=>handleDelete(q.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button></td></tr>))}</tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default QuestionsPage;
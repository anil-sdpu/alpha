import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function FeesPage({ token }){
  const [items,setItems]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [formData,setFormData]=useState({student_id:'',total_fee:0,paid_amount:0,due_amount:0,payment_date:'',payment_mode:'bank_transfer',status:'due',remarks:''});
  const [show,setShow]=useState(false); const [editingId,setEditingId]=useState(null);

  useEffect(()=>{ load(); loadMeta(); },[]);

  const { hasPermission } = useAuth();

  async function load(){ setLoading(true); setError(''); try{ const r=await fetch('/api/fees',{headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to load payments'); setItems((await r.json()).data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  async function loadMeta(){ try{ const r=await fetch('/api/students',{headers:{Authorization:`Bearer ${token}`}}); if(r.ok) setStudents((await r.json()).data||[]); }catch(e){}
  }

  function resetForm(){ setFormData({student_id:'',total_fee:0,paid_amount:0,due_amount:0,payment_date:'',payment_mode:'bank_transfer',status:'due',remarks:''}); setEditingId(null); setShow(false); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const method=editingId?'PUT':'POST'; const url=editingId?`/api/fees/${editingId}`:'/api/fees'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(formData)}); if(!r.ok) throw new Error(editingId?'Failed to update payment':'Failed to create payment'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function handleEdit(it){ setEditingId(it.id); setFormData(it); setShow(true); }
  async function handleDelete(id){ if(!confirm('Delete fee?')) return; setError(''); try{ const r=await fetch(`/api/fees/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete payment'); load(); }catch(e){ setError(e.message);} }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Fees</h1>
          {hasPermission('fees','create') && (
            <button onClick={()=>{ resetForm(); setShow(!show); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{show?'Cancel':'Add Payment'}</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {show && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId?'Edit Payment':'Record Payment'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.student_id} onChange={e=>setFormData({...formData,student_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Student</option>{students.map(s=> <option key={s.id} value={s.id}>{s.full_name}</option>)}</select>
              <input type="number" placeholder="Total fee" value={formData.total_fee} onChange={e=>setFormData({...formData,total_fee:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
              <input type="number" placeholder="Paid amount" value={formData.paid_amount} onChange={e=>setFormData({...formData,paid_amount:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
              <input type="date" value={formData.payment_date} onChange={e=>setFormData({...formData,payment_date:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
              <input type="text" placeholder="Remarks" value={formData.remarks} onChange={e=>setFormData({...formData,remarks:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={!hasPermission('fees', editingId ? 'edit' : 'create')} className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId?'Update':'Save'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading payments…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length===0 ? (<p className="p-6 text-slate-400">No payments found.</p>) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Student</th>
                    <th className="px-6 py-3 text-left font-semibold">Total</th>
                    <th className="px-6 py-3 text-left font-semibold">Paid</th>
                    <th className="px-6 py-3 text-left font-semibold">Due</th>
                    {(hasPermission('fees','edit') || hasPermission('fees','delete')) && (
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map(f => (
                    <tr key={f.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{f.full_name}</td>
                      <td className="px-6 py-3">{f.total_fee}</td>
                      <td className="px-6 py-3">{f.paid_amount}</td>
                      <td className="px-6 py-3">{f.due_amount}</td>
                      {(hasPermission('fees','edit') || hasPermission('fees','delete')) && (
                        <td className="px-6 py-3">
                          {hasPermission('fees','edit') && <button onClick={()=>handleEdit(f)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>}
                          {hasPermission('fees','delete') && <button onClick={()=>handleDelete(f.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
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

export default FeesPage;
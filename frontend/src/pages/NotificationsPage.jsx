import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function NotificationsPage({ token }){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [show,setShow]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [formData,setFormData]=useState({recipient_role:'all',recipient_id:'',type:'general',message:'',channel:'in-app',send_date:''});

  useEffect(()=>{ load(); },[]);

  const { hasPermission } = useAuth();

  async function load(){ setLoading(true); setError(''); try{ const r=await fetch('/api/notifications',{headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to load notifications'); setItems((await r.json()).data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  function resetForm(){ setFormData({recipient_role:'all',recipient_id:'',type:'general',message:'',channel:'in-app',send_date:''}); setEditingId(null); setShow(false); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const method=editingId?'PUT':'POST'; const url=editingId?`/api/notifications/${editingId}`:'/api/notifications'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(formData)}); if(!r.ok) throw new Error(editingId?'Failed to update notification':'Failed to send notification'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function handleEdit(it){ setEditingId(it.id); setFormData(it); setShow(true); }
  async function handleMarkRead(id){ setError(''); try{ const r=await fetch(`/api/notifications/${id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({is_read:true})}); if(!r.ok) throw new Error('Failed to mark read'); load(); }catch(e){ setError(e.message);} }
  async function handleDelete(id){ if(!confirm('Delete notification?')) return; setError(''); try{ const r=await fetch(`/api/notifications/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete notification'); load(); }catch(e){ setError(e.message);} }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Notifications</h1>
          {hasPermission('notifications','create') && (
            <button onClick={()=>{ resetForm(); setShow(!show); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{show?'Cancel':'Create'}</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {show && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId?'Edit Notification':'Create Notification'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.recipient_role} onChange={e=>setFormData({...formData,recipient_role:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="all">All</option><option value="student">Student</option><option value="tutor">Tutor</option></select>
              <input value={formData.recipient_id} onChange={e=>setFormData({...formData,recipient_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" placeholder="Recipient ID (optional)" />
              <textarea value={formData.message} onChange={e=>setFormData({...formData,message:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" placeholder="Message" />
              <select value={formData.channel} onChange={e=>setFormData({...formData,channel:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="in-app">In-App</option><option value="email">Email</option></select>
              <input type="date" value={formData.send_date} onChange={e=>setFormData({...formData,send_date:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={!hasPermission('notifications', editingId ? 'edit' : 'create')} className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId?'Update':'Send'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading notifications…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length===0 ? (<p className="p-6 text-slate-400">No notifications found.</p>) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Message</th>
                    <th className="px-6 py-3 text-left font-semibold">Role</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    {(hasPermission('notifications','edit') || hasPermission('notifications','delete')) && (
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map(n => (
                    <tr key={n.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{n.message}</td>
                      <td className="px-6 py-3">{n.recipient_role}</td>
                      <td className="px-6 py-3">{n.send_date}</td>
                      {(hasPermission('notifications','edit') || hasPermission('notifications','delete')) && (
                        <td className="px-6 py-3">
                          {!n.is_read && hasPermission('notifications','edit') && <button onClick={()=>handleMarkRead(n.id)} className="mr-2 rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500">Mark Read</button>}
                          {hasPermission('notifications','edit') && <button onClick={()=>handleEdit(n)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>}
                          {hasPermission('notifications','delete') && <button onClick={()=>handleDelete(n.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
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

export default NotificationsPage;
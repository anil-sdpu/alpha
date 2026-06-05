import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function AttendancePage({ token }){
  const [items,setItems]=useState([]);
  const [students,setStudents]=useState([]);
  const [classes,setClasses]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [formData,setFormData]=useState({student_id:'',class_id:'',attendance_date:'',status:'present',remarks:''});
  const [show,setShow]=useState(false); const [editingId,setEditingId]=useState(null);

  useEffect(()=>{ load(); loadMeta(); },[]);

  const { hasPermission } = useAuth();

  async function load(){ setLoading(true); setError(''); try{ const r=await fetch('/api/attendance',{headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to load attendance'); setItems((await r.json()).data||[]); }catch(e){ setError(e.message);} finally{ setLoading(false);} }

  async function loadMeta(){ try{ const r1=await fetch('/api/students',{headers:{Authorization:`Bearer ${token}`}}); if(r1.ok) setStudents((await r1.json()).data||[]); const r2=await fetch('/api/classes',{headers:{Authorization:`Bearer ${token}`}}); if(r2.ok) setClasses((await r2.json()).data||[]); }catch(e){}
  }

  function resetForm(){ setFormData({student_id:'',class_id:'',attendance_date:'',status:'present',remarks:''}); setEditingId(null); setShow(false); }

  async function handleSubmit(e){ e.preventDefault(); setError(''); const method=editingId?'PUT':'POST'; const url=editingId?`/api/attendance/${editingId}`:'/api/attendance'; try{ const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(formData)}); if(!r.ok) throw new Error(editingId?'Failed to update attendance':'Failed to create attendance'); resetForm(); load(); }catch(e){ setError(e.message);} }

  function handleEdit(it){ setEditingId(it.id); setFormData(it); setShow(true); }
  async function handleDelete(id){ if(!confirm('Delete record?')) return; setError(''); try{ const r=await fetch(`/api/attendance/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); if(!r.ok) throw new Error('Failed to delete record'); load(); }catch(e){ setError(e.message);} }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Attendance</h1>
          {hasPermission('attendance','create') && (
            <button onClick={()=>{ resetForm(); setShow(!show); }} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{show?'Cancel':'Mark Attendance'}</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {show && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{editingId?'Edit Record':'Mark Attendance'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formData.student_id} onChange={e=>setFormData({...formData,student_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Student</option>{students.map(s=> <option key={s.id} value={s.id}>{s.full_name}</option>)}</select>
              <select value={formData.class_id} onChange={e=>setFormData({...formData,class_id:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="">Class</option>{classes.map(c=> <option key={c.id} value={c.id}>{c.class_name}</option>)}</select>
              <input type="date" value={formData.attendance_date} onChange={e=>setFormData({...formData,attendance_date:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
              <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={!hasPermission('attendance', editingId ? 'edit' : 'create')} className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold transition hover:bg-cyan-400">{editingId?'Update':'Save'}</button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-slate-100 transition hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading attendance…</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {items.length===0 ? (<p className="p-6 text-slate-400">No attendance records.</p>) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Student</th>
                    <th className="px-6 py-3 text-left font-semibold">Class</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    {(hasPermission('attendance','edit') || hasPermission('attendance','delete')) && (
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map(a => (
                    <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-medium">{a.full_name}</td>
                      <td className="px-6 py-3">{a.class_name}</td>
                      <td className="px-6 py-3">{a.attendance_date}</td>
                      <td className="px-6 py-3">{a.status}</td>
                      {(hasPermission('attendance','edit') || hasPermission('attendance','delete')) && (
                        <td className="px-6 py-3">
                          {hasPermission('attendance','edit') && <button onClick={()=>handleEdit(a)} className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">Edit</button>}
                          {hasPermission('attendance','delete') && <button onClick={()=>handleDelete(a.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500">Delete</button>}
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
export default AttendancePage;
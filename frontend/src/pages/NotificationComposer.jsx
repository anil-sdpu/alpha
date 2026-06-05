import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function NotificationComposer({ token }){
  const { hasPermission } = useAuth();
  const [students, setStudents] = useState([]);
  const [recipientType, setRecipientType] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  useEffect(()=>{ loadStudents(); },[]);
  async function loadStudents(){ try{ const r=await fetch('/api/students',{ headers:{ Authorization:`Bearer ${token}` } }); if(r.ok){ setStudents((await r.json()).data||[]); } }catch(e){} }

  if (!hasPermission('notifications','create')) return <div className="p-6 text-slate-300">You do not have permission to send notifications.</div>;

  async function handleSend(){
    setSending(true); setResult('');
    try{
      const payload = {
        title, message, priority, due_date: null, recipient_role: recipientType === 'tutors' ? 'tutor' : 'student',
        recipient_ids: recipientType === 'single' && selectedStudent ? [selectedStudent] : (recipientType === 'class' && selectedClass ? null : null),
        channel: `${channelInApp? 'in-app':''}${channelEmail? ',email':''}`
      };
      // if class selection, caller can implement filter server-side; for now send recipient_role and optionally ids
      const r = await fetch('/api/notifications/send',{ method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      const j = await r.json(); if(!r.ok) throw new Error(j.error||'Failed');
      setResult(`Sent: ${j.sent}  Failed: ${j.failed}`);
    }catch(e){ setResult(e.message); }
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Notification Composer</h1>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select value={recipientType} onChange={e=>setRecipientType(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100">
              <option value="all">All Students</option>
              <option value="single">Single Student</option>
              <option value="class">By Class (not implemented)</option>
              <option value="tutors">All Tutors</option>
            </select>
            {recipientType === 'single' && (
              <select value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100">
                <option value="">Select Student</option>
                {students.map(s=> <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            )}
            <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
            <textarea placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" rows={4} />
            <select value={priority} onChange={e=>setPriority(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={channelInApp} onChange={e=>setChannelInApp(e.target.checked)} /> In-app</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={channelEmail} onChange={e=>setChannelEmail(e.target.checked)} /> Email</label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSend} disabled={sending} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold">Send Notification</button>
        </div>
        {result && <div className="mt-4 text-sm text-slate-300">{result}</div>}
      </div>
    </div>
  );
}

export default NotificationComposer;

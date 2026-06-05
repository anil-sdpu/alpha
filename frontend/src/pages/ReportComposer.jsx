import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function ReportComposer({ token }){
  const { hasPermission } = useAuth();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [periodLabel, setPeriodLabel] = useState('');
  const [grades, setGrades] = useState([{ subject_name:'', obtained:'', total:'100', grade:'', remarks:'' }]);
  const [comments, setComments] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(()=>{ loadStudents(); },[]);

  async function loadStudents(){
    try{
      const r = await fetch('/api/students',{ headers: { Authorization: `Bearer ${token}` } });
      if(!r.ok) throw new Error('Failed to load students');
      const j = await r.json(); setStudents(j.data||[]);
    }catch(e){ console.error(e); }
  }

  if (!hasPermission('students','edit')) return <div className="p-6 text-slate-300">You do not have permission to create reports.</div>;

  function addGrade(){ setGrades([...grades, { subject_name:'', obtained:'', total:'100', grade:'', remarks:'' }]); }
  function updateGrade(i, k, v){ const copy = [...grades]; copy[i][k]=v; setGrades(copy); }
  function removeGrade(i){ const copy=[...grades]; copy.splice(i,1); setGrades(copy); }

  async function handleSend(sendEmail){
    setSending(true); setMessage('');
    try{
      const body = { student_id: studentId, period, period_label: periodLabel, grades, comments, send_email: !!sendEmail };
      const r = await fetch('/api/reports/markcard',{ method: 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(body) });
      const j = await r.json(); if(!r.ok) throw new Error(j.error||'Failed');
      setMessage('Report generated' + (sendEmail? ' and emailed.' : '.'));
    }catch(e){ setMessage(e.message); }
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Report Composer</h1>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select value={studentId} onChange={e=>setStudentId(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100">
              <option value="">Select Student</option>
              {students.map(s=> <option key={s.id} value={s.id}>{s.full_name} ({s.class_name||''})</option>)}
            </select>
            <select value={period} onChange={e=>setPeriod(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfyear">Half Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input placeholder="Period label (e.g., May 2026)" value={periodLabel} onChange={e=>setPeriodLabel(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 md:col-span-2" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Grades</h2>
          <div className="space-y-3">
            {grades.map((g,i)=> (
              <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-6 items-center">
                <input placeholder="Subject" value={g.subject_name} onChange={e=>updateGrade(i,'subject_name',e.target.value)} className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
                <input placeholder="Obtained" value={g.obtained} onChange={e=>updateGrade(i,'obtained',e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
                <input placeholder="Total" value={g.total} onChange={e=>updateGrade(i,'total',e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
                <input placeholder="Grade" value={g.grade} onChange={e=>updateGrade(i,'grade',e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
                <input placeholder="Remarks" value={g.remarks} onChange={e=>updateGrade(i,'remarks',e.target.value)} className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
                <button type="button" onClick={()=>removeGrade(i)} className="mt-2 md:mt-0 rounded-2xl bg-red-600 px-3 py-1 text-sm">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button onClick={addGrade} className="rounded-2xl bg-cyan-500 px-4 py-2 text-slate-950 font-semibold">Add Subject</button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Comments</h2>
          <textarea value={comments} onChange={e=>setComments(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" rows={4} />
        </div>

        <div className="flex gap-3">
          <button onClick={()=>handleSend(false)} disabled={sending} className="rounded-2xl bg-emerald-600 px-4 py-2 font-semibold">Generate PDF</button>
          <button onClick={()=>handleSend(true)} disabled={sending} className="rounded-2xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Generate & Send to Parent</button>
        </div>
        {message && <div className="mt-4 text-sm text-slate-300">{message}</div>}
      </div>
    </div>
  );
}

export default ReportComposer;

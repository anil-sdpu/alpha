import { useEffect, useState } from 'react';

function DashboardPage({ token, user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setError('');
      setLoading(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [studentsRes, classesRes, subjectsRes] = await Promise.all([
          fetch('/api/students', { headers }),
          fetch('/api/classes', { headers }),
          fetch('/api/subjects', { headers })
        ]);

        const studentsData = await studentsRes.json();
        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();

        if (!studentsRes.ok || !classesRes.ok || !subjectsRes.ok) {
          setError('Unable to load dashboard data');
          return;
        }

        setStudents(studentsData.data || []);
        setClasses(classesData.data || []);
        setSubjects(subjectsData.data || []);
      } catch (err) {
        setError('Unable to connect to backend');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Welcome back,</p>
            <h1 className="text-2xl font-semibold">{user?.name || 'Tutor'}</h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl bg-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/30">
            <p className="text-sm text-slate-400">Total students</p>
            <p className="mt-3 text-4xl font-semibold">{students.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/30">
            <p className="text-sm text-slate-400">Total classes</p>
            <p className="mt-3 text-4xl font-semibold">{classes.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/30">
            <p className="text-sm text-slate-400">Total subjects</p>
            <p className="mt-3 text-4xl font-semibold">{subjects.length}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/30">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Students</h2>
                <p className="text-sm text-slate-500">Recent student records</p>
              </div>
            </div>
            {loading ? (
              <p className="text-slate-400">Loading students…</p>
            ) : (
              <div className="space-y-3">
                {students.slice(0, 5).map((student) => (
                  <div key={student.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="font-medium">{student.full_name}</p>
                    <p className="text-sm text-slate-500">{student.class_name || 'Unassigned'}</p>
                  </div>
                ))}
                {students.length === 0 && <p className="text-slate-500">No students found.</p>}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/30">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Subjects</h2>
                <p className="text-sm text-slate-500">Active subjects</p>
              </div>
            </div>
            {loading ? (
              <p className="text-slate-400">Loading subjects…</p>
            ) : (
              <ul className="space-y-3">
                {subjects.slice(0, 5).map((subject) => (
                  <li key={subject.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="font-medium">{subject.subject_name}</p>
                    <p className="text-sm text-slate-500">{subject.subject_code || 'No code'}</p>
                  </li>
                ))}
                {subjects.length === 0 && <p className="text-slate-500">No subjects found.</p>}
              </ul>
            )}
          </div>
        </section>

        {error && <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      </main>
    </div>
  );
}

export default DashboardPage;

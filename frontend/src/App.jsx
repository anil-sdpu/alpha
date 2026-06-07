import { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import ChaptersPage from './pages/ChaptersPage';
import TestsPage from './pages/TestsPage';
import QuestionsPage from './pages/QuestionsPage';
import DPQPage from './pages/DPQPage';
import AttendancePage from './pages/AttendancePage';
import FeesPage from './pages/FeesPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportComposer from './pages/ReportComposer';
import NotificationComposer from './pages/NotificationComposer';

function App() {
  const [token, setToken] = useState(localStorage.getItem('alpha_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('alpha_user') || 'null'));
  const [currentPage, setCurrentPage] = useState('dashboard');

  function handleLogin(authToken, authUser) {
    localStorage.setItem('alpha_token', authToken);
    localStorage.setItem('alpha_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
    setCurrentPage('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('alpha_token');
    localStorage.removeItem('alpha_user');
    setToken('');
    setUser(null);
    setCurrentPage('login');
  }

  // Always render the app shell; show LoginPage inside main when not authenticated

  return (
    <div className="flex min-h-screen bg-slate-950">
      {token && (
        <aside className="w-64 border-r border-slate-800 bg-slate-900">
        <nav className="space-y-2 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Alpha Tuition</h2>
          {(() => {
            const { hasPermission } = useAuth();
            const items = [
              { id: 'dashboard', label: 'Dashboard', entity: null },
              { id: 'students', label: 'Students', entity: 'students' },
              { id: 'classes', label: 'Classes', entity: 'classes' },
              { id: 'subjects', label: 'Subjects', entity: 'subjects' },
              { id: 'chapters', label: 'Chapters List', entity: 'chapters' },
              { id: 'tests', label: 'Tests', entity: 'tests' },
              { id: 'questions', label: 'Practice', entity: 'questions' },
              { id: 'dpq', label: 'DPQ', entity: 'dpq' },
              { id: 'attendance', label: 'Attendance', entity: 'attendance' },
              { id: 'fees', label: 'Fees', entity: 'fees' },
              { id: 'notifications', label: 'Notifications', entity: 'notifications' },
              // reports requires the ability to edit student records (compose reports)
              { id: 'reports', label: 'Reports', entity: 'students', requiredAction: 'edit' },
              // compose requires notifications:create
              { id: 'compose', label: 'Compose', entity: 'notifications', requiredAction: 'create' }
            ];

            return items
              .filter(i => {
                if (!i.entity) return true;
                if (!hasPermission(i.entity, 'view')) return false;
                if (i.requiredAction && !hasPermission(i.entity, i.requiredAction)) return false;
                return true;
              })
              .map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full rounded-2xl px-4 py-2 text-left text-sm transition ${
                  currentPage === item.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ));
          })()}
          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl bg-red-600/20 px-4 py-2 text-left text-sm text-red-400 transition hover:bg-red-600/30"
          >
            Logout
          </button>
        </nav>
        </aside>
      )}

      <main className="flex-1">
        {!token ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            {currentPage === 'dashboard' && <DashboardPage token={token} user={user} />}
            {currentPage === 'students' && <StudentsPage token={token} />}
            {currentPage === 'classes' && <ClassesPage token={token} />}
            {currentPage === 'subjects' && <SubjectsPage token={token} />}
            {currentPage === 'chapters' && <ChaptersPage token={token} />}
            {currentPage === 'tests' && <TestsPage token={token} />}
            {currentPage === 'questions' && <QuestionsPage token={token} />}
            {currentPage === 'dpq' && <DPQPage token={token} />}
            {currentPage === 'attendance' && <AttendancePage token={token} />}
            {currentPage === 'fees' && <FeesPage token={token} />}
            {currentPage === 'notifications' && <NotificationsPage token={token} />}
            {currentPage === 'reports' && <ReportComposer token={token} />}
            {currentPage === 'compose' && <NotificationComposer token={token} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

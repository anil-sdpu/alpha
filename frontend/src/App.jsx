import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('alpha_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('alpha_user') || 'null'));

  function handleLogin(authToken, authUser) {
    localStorage.setItem('alpha_token', authToken);
    localStorage.setItem('alpha_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }

  function handleLogout() {
    localStorage.removeItem('alpha_token');
    localStorage.removeItem('alpha_user');
    setToken('');
    setUser(null);
  }

  return token ? (
    <DashboardPage token={token} user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;

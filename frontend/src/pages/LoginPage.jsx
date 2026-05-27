import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Login failed');
        return;
      }

      onLogin(result.token, result.user);
    } catch (err) {
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-xl shadow-slate-900/30">
        <h1 className="mb-6 text-3xl font-semibold text-center">Alpha Coaching Login</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              placeholder="admin@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              placeholder="Enter your password"
              required
            />
          </label>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-slate-950 font-semibold transition hover:bg-cyan-400"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

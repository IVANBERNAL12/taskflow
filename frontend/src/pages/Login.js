import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://taskflow-fqk0.onrender.com/api/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
    setLoading(false);
  };

return (
  <div className="auth-page">
    <div className="auth-left">
      <div className="auth-brand">
        <div className="auth-brand-icon">✦</div>
        <span className="auth-brand-name">TaskFlow</span>
      </div>
      <h1 className="auth-headline">
        Manage your work<br/>with <span className="grad">clarity.</span>
      </h1>
      <p className="auth-tagline">
        A clean, focused task manager built for developers and professionals who want to stay on top of their work.
      </p>
      <div className="auth-features">
        <div className="auth-feature"><span className="auth-feature-dot"></span>Real-time task tracking</div>
        <div className="auth-feature"><span className="auth-feature-dot"></span>Secure user accounts</div>
        <div className="auth-feature"><span className="auth-feature-dot"></span>Progress analytics</div>
      </div>
    </div>
    <div className="auth-right">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Welcome back</h1>
          <p>Sign in to your TaskFlow account</p>
        </div>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required/>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required/>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p className="auth-link">No account? <Link to="/register">Create one free</Link></p>
      </div>
    </div>
  </div>
);
}
export default Login;
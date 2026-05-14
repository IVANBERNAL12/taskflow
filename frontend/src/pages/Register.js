import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
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
        Start shipping<br/>tasks <span className="grad">faster.</span>
      </h1>
      <p className="auth-tagline">
        Join developers who use TaskFlow to stay organized, focused, and productive every single day.
      </p>
      <div className="auth-features">
        <div className="auth-feature"><span className="auth-feature-dot"></span>Free forever</div>
        <div className="auth-feature"><span className="auth-feature-dot"></span>No credit card needed</div>
        <div className="auth-feature"><span className="auth-feature-dot"></span>Set up in 30 seconds</div>
      </div>
    </div>
    <div className="auth-right">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Create account</h1>
          <p>Start managing your tasks today</p>
        </div>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" placeholder="Ivan Bernal"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required/>
          </div>
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
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  </div>
);
}

export default Register;
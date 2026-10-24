import React, { useState } from 'react';
import { authApi } from './api';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login(username.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(data.username || username);
      }
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        setErrorMessage(
          err.response.data?.message || 'Invalid username or password.'
        );
      } else {
        setErrorMessage('Unable to connect to the server. Please ensure the backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-box">
        {/* Brand Header */}
        <div className="login-brand-group">
          <div className="login-brand-icon">
            <Briefcase size={22} />
          </div>
          <h1 className="login-brand-title">BharatHR</h1>
          <p className="login-brand-sub">Enterprise Workforce & People Operations · India</p>
        </div>

        {/* Demo Credentials Pill */}
        <div
          className="quick-demo-badge"
          onClick={handleFillDemoCredentials}
          title="Click to populate demo administrator credentials"
        >
          <ShieldCheck size={16} />
          <span>Click to autofill Admin credentials (<strong>admin</strong> / <strong>admin123</strong>)</span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-alert" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="username"
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} />
          <span>Protected by Spring Security 6 & Stateless JWT</span>
        </div>
      </div>
    </div>
  );
}

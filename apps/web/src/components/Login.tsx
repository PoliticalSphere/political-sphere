/**
 * Login Component
 * Handles user authentication
 */

import { useState } from 'react';

import { apiClient } from '../utils/api-client';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await apiClient.register(username, password, email || undefined);
      } else {
        await apiClient.login(username, password);
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Political Sphere</h1>
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              autoComplete="username"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          {error && (
            <div id="login-error" role="alert" className="error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          className="btn-link"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthPage() {
  const [mode, setMode] = useState('login');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Discord Clone</h1>
          <p>Real-time chat for your community</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' ? <Login /> : <Register />}
      </div>
    </div>
  );
}

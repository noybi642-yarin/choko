import { useState } from 'react';
import { login } from '../store';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('noybi642@gmail.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = login(email, password);
      if (user) {
        onSuccess(user);
      } else {
        setError('אימייל או סיסמה שגויים');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <a href="#/" className="auth-logo">choko<span className="logo-dot"></span></a>
        <h1 className="auth-title">ברוך הבא חזרה</h1>
        <p className="auth-sub">התחבר לחשבון שלך כדי לנהל את האירועים</p>

        <div className="demo-hint">
          <span className="demo-badge">Demo</span>
          <span>noybi642@gmail.com / demo123</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>אימייל</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="field">
            <label>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'כניסה'}
          </button>
        </form>

        <p className="auth-footer">
          אין לך חשבון? <button className="link-btn" onClick={() => alert('הרשמה בקרוב!')}>הירשם חינם</button>
        </p>
      </div>
    </div>
  );
}

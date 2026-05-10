import { useState } from 'react';
import { venueLogin } from '../store';

export default function VenueLogin({ onSuccess, onBack }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const venue = venueLogin(email.trim(), password);
      if (venue) {
        onSuccess(venue);
      } else {
        setError('פרטי התחברות שגויים. נסה שנית.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="venue-login-page">
      <div className="venue-login-card">
        <div className="venue-login-logo">
          <div className="venue-login-logo-mark">V</div>
          <div className="venue-login-product">choko · venues</div>
        </div>

        <h1 className="venue-login-title">כניסה לניהול אולם</h1>
        <p className="venue-login-sub">פלטפורמת ניהול חתונות ואורחים עבור אולמות ומקומות אירועים</p>

        <form onSubmit={handleSubmit}>
          <div className="venue-login-field">
            <label>דוא"ל</label>
            <input
              className="venue-login-input"
              type="email"
              placeholder="admin@venue.co.il"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="venue-login-field">
            <label>סיסמה</label>
            <input
              className="venue-login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="venue-login-error">{error}</div>}

          <button className="venue-login-btn" type="submit" disabled={loading || !email || !password}>
            {loading ? 'מתחבר...' : 'כניסה לניהול'}
          </button>
        </form>

        <div className="venue-login-demo-hint">
          חשבון דמו לאולם<br />
          <code>venue@elegance.co.il</code> · <code>venue123</code>
        </div>

        <div className="venue-login-back">
          <button onClick={onBack}>חזרה לכניסת זוגות</button>
        </div>
      </div>
    </div>
  );
}

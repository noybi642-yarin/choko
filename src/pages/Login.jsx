import { useState } from 'react';
import { login } from '../store';
import LegalModal from '../components/LegalModal';

export default function Login({ onSuccess }) {
  const [agreed, setAgreed] = useState(false);
  const [legal, setLegal]   = useState(null); // 'terms' | 'privacy'

  const enter = () => {
    if (!agreed) return;
    const user = login('noybi642@gmail.com', 'demo123');
    if (user) onSuccess(user);
  };

  return (
    <div className="auth-page">
      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}

      <div className="auth-card">
        <div className="auth-logo">choko<span className="logo-dot"></span></div>
        <div className="auth-welcome-icon">👋</div>
        <h1 className="auth-title">שלום נוי!</h1>
        <p className="auth-sub">לחצי על הכפתור כדי להיכנס לחשבון הדמו</p>

        <button className="demo-login-btn" onClick={enter} disabled={!agreed} style={{ opacity: agreed ? 1 : 0.45 }}>
          <span className="demo-login-icon">🚀</span>
          <div>
            <div className="demo-login-title">כניסה לחשבון הדמו</div>
            <div className="demo-login-sub">noybi642@gmail.com</div>
          </div>
        </button>

        <label className="terms-checkbox-row">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="terms-checkbox"
          />
          <span className="terms-checkbox-label">
            אני מאשר/ת את{' '}
            <button type="button" className="terms-link" onClick={() => setLegal('terms')}>
              תנאי השימוש
            </button>
            {' '}ואת{' '}
            <button type="button" className="terms-link" onClick={() => setLegal('privacy')}>
              מדיניות הפרטיות
            </button>
          </span>
        </label>

        <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 8 }}>
          אין צורך בסיסמה — זהו חשבון דמו
        </p>
      </div>
    </div>
  );
}

import { login } from '../store';

export default function Login({ onSuccess }) {
  const enter = () => {
    const user = login('noybi642@gmail.com', 'demo123');
    if (user) onSuccess(user);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">choko<span className="logo-dot"></span></div>
        <div className="auth-welcome-icon">👋</div>
        <h1 className="auth-title">שלום נוי!</h1>
        <p className="auth-sub">לחצי על הכפתור כדי להיכנס לחשבון הדמו</p>

        <button className="demo-login-btn" onClick={enter}>
          <span className="demo-login-icon">🚀</span>
          <div>
            <div className="demo-login-title">כניסה לחשבון הדמו</div>
            <div className="demo-login-sub">noybi642@gmail.com</div>
          </div>
        </button>

        <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 16 }}>
          אין צורך בסיסמה — זהו חשבון דמו
        </p>
      </div>
    </div>
  );
}

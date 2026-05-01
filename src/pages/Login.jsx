import { login } from '../store';

export default function Login({ onSuccess }) {
  const handleDemoLogin = () => {
    const user = login('noybi642@gmail.com', 'demo123');
    if (user) onSuccess(user);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <a href="#/" className="auth-logo">choko<span className="logo-dot"></span></a>
        <h1 className="auth-title">ברוך הבא 👋</h1>
        <p className="auth-sub">לחץ להיכנס כמשתמש הדמו</p>

        <button className="demo-login-btn" onClick={handleDemoLogin}>
          <span className="demo-login-icon">🚀</span>
          <div>
            <div className="demo-login-title">כניסה לחשבון הדמו</div>
            <div className="demo-login-sub">noybi642@gmail.com</div>
          </div>
        </button>

        <div className="auth-divider"><span>או כנס עם פרטים</span></div>

        <form className="auth-form" onSubmit={(e) => {
          e.preventDefault();
          const em = e.target.email.value;
          const pw = e.target.password.value;
          const user = login(em, pw);
          if (user) { onSuccess(user); }
          else { e.target.querySelector('.auth-error-inline').style.display = 'block'; }
        }}>
          <div className="field">
            <label>אימייל</label>
            <input name="email" type="email" defaultValue="noybi642@gmail.com" required />
          </div>
          <div className="field">
            <label>סיסמה</label>
            <input name="password" type="password" defaultValue="demo123" required />
          </div>
          <div className="auth-error auth-error-inline" style={{ display: 'none' }}>
            אימייל או סיסמה שגויים (השתמש בפרטי הדמו למעלה)
          </div>
          <button type="submit" className="auth-submit">כניסה</button>
        </form>
      </div>
    </div>
  );
}

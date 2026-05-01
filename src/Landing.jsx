import PhoneRSVP from './PhoneRSVP';
import { Steps, Features, Pricing, FooterCTA } from './Sections';

function Nav({ onLogin }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="logo" style={{cursor:'default'}}>choko<span className="logo-dot"></span></span>
        <div className="nav-links">
          <a href="#how">איך זה עובד</a>
          <a href="#features">תכונות</a>
          <a href="#pricing">תמחור</a>
        </div>
        <div className="nav-cta">
          <button className="btn btn-ghost"   onClick={onLogin}>כניסה</button>
          <button className="btn btn-primary" onClick={onLogin}>יצירת אירוע</button>
        </div>
      </div>
    </nav>
  );
}

export default function Landing({ onLogin }) {
  return (
    <>
      <Nav onLogin={onLogin} />

      {/* Hero */}
      <section className="hero" data-variant="b">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="pill"><span className="pill-dot"></span> חדש: שיבוץ שולחנות בקליק</span>
            </div>
            <h1>
              אישורי הגעה<br />
              <span className="scribble"><span className="accent">בלי כאב ראש</span></span>
            </h1>
            <p className="sub">
              choko היא הדרך הכי קלה ויפה לנהל את רשימת האורחים לחתונה, לבר מצווה או למסיבה.
              אתם שולחים — האורחים מאשרים. כולם מרוצים.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-coral" onClick={onLogin}>יצירת הזמנה — חינם</button>
              <a href="#how" className="btn btn-ghost">איך זה עובד?</a>
            </div>
            <div className="hero-meta">
              <div className="avatars">
                <span className="avatar">נ</span>
                <span className="avatar">ד</span>
                <span className="avatar">ר</span>
                <span className="avatar">+</span>
              </div>
              <div className="hero-meta-item">
                <span style={{ color: 'var(--coral)' }}>★★★★★</span>
                <span>למעלה מ-50,000 אירועים מאושרים</span>
              </div>
            </div>
          </div>

          <div className="hero-stage">
            <div className="invite-card" style={{ top: '8%', right: '-5%', transform: 'rotate(8deg)' }}>
              <div className="invite-card-mini" style={{ background: 'linear-gradient(135deg, var(--sun), var(--coral))' }}></div>
              <div className="t">יום הולדת 30</div>
              <div className="s">22 יוני · 21:00</div>
            </div>
            <div className="invite-card" style={{ bottom: '5%', left: '-8%', transform: 'rotate(-6deg)' }}>
              <div className="invite-card-mini" style={{ background: 'linear-gradient(135deg, var(--mint), var(--lavender))' }}></div>
              <div className="t">בר מצווה</div>
              <div className="s">8 ספטמבר · גליקסון</div>
            </div>
            <PhoneRSVP eventType="wedding" />
          </div>
        </div>
      </section>

      <Steps />
      <Features />
      <Pricing onCta={onLogin} />
      <FooterCTA onCta={onLogin} />
    </>
  );
}

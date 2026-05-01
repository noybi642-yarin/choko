import { useState } from 'react';
import PhoneRSVP from './PhoneRSVP';
import { Steps, Features, Pricing, FooterCTA } from './Sections';

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#/" className="logo">choko<span className="logo-dot"></span></a>
        <div className="nav-links">
          <a href="#how">איך זה עובד</a>
          <a href="#features">תכונות</a>
          <a href="#pricing">תמחור</a>
        </div>
        <div className="nav-cta">
          <a href="#/login" className="btn btn-ghost">כניסה</a>
          <a href="#/login" className="btn btn-primary">יצירת אירוע</a>
        </div>
      </div>
    </nav>
  );
}

function Hero({ variant, eventType, showInviteCards, onCta }) {
  const headlines = {
    wedding: { big: 'אישורי הגעה', accent: 'בלי כאב ראש', sub: 'choko היא הדרך הכי קלה ויפה לנהל את רשימת האורחים לחתונה, לבר מצווה או למסיבה. אתם שולחים — האורחים מאשרים. כולם מרוצים.' },
    birthday: { big: 'מסיבת יום הולדת', accent: 'בלי דרמות', sub: 'שלחו הזמנות שכיף לקבל. עקבו אחרי מי בא בקליק. לא עוד אקסלים, לא עוד טלפונים.' },
    bar: { big: 'בר ובת מצווה', accent: 'מאורגנים לבד', sub: 'מהרגע שיוצאת ההזמנה ועד היום שאחרי — choko דואגת שהכל יזרום.' },
  };
  const h = headlines[eventType] || headlines.wedding;

  return (
    <section className="hero" data-variant={variant}>
      <div className="container hero-grid">
        <div className="hero-text">
          <div className="hero-eyebrow">
            <span className="pill"><span className="pill-dot"></span> חדש: שיבוץ שולחנות בקליק</span>
          </div>
          <h1>
            {h.big}<br />
            <span className="scribble"><span className="accent">{h.accent}</span></span>
          </h1>
          <p className="sub">{h.sub}</p>
          <div className="hero-ctas">
            <a href="#/login" className="btn btn-coral">יצירת הזמנה — חינם</a>
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
          {variant === 'b' && showInviteCards && (
            <>
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
            </>
          )}
          <PhoneRSVP eventType={eventType} />
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Nav />
      <Hero variant="b" eventType="wedding" showInviteCards={true} onCta={onLogin} />
      <Steps />
      <Features />
      <Pricing onCta={onLogin} />
      <FooterCTA onCta={onLogin} />
    </>
  );
}

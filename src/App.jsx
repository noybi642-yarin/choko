import { useState } from 'react';
import PhoneRSVP from './PhoneRSVP';
import { Steps, Features, Pricing, FooterCTA } from './Sections';

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="logo">choko<span className="logo-dot"></span></a>
        <div className="nav-links">
          <a href="#how">איך זה עובד</a>
          <a href="#features">תכונות</a>
          <a href="#pricing">תמחור</a>
          <a href="#signup">בלוג</a>
        </div>
        <div className="nav-cta">
          <a href="#" className="btn btn-ghost">כניסה</a>
          <a href="#signup" className="btn btn-primary">יצירת אירוע</a>
        </div>
      </div>
    </nav>
  );
}

const VARIANT_LABELS = { a: 'גרדיאנט קלאסי', b: 'גריד משחקי', c: 'ספלייט אסימטרי' };

function Hero({ variant, eventType, showInviteCards }) {
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
            <a href="#signup" className="btn btn-coral">יצירת הזמנה — חינם</a>
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
          {variant === 'a' && (
            <>
              <span className="deco deco-confetti" style={{ top: '10%', right: '15%', background: 'var(--coral)', '--r': '15deg', animation: 'float 4s ease-in-out infinite' }}></span>
              <span className="deco deco-circle" style={{ top: '20%', left: '8%', width: 24, height: 24, background: 'var(--lavender)', animation: 'float-slow 5s ease-in-out infinite' }}></span>
              <span className="deco deco-confetti" style={{ bottom: '15%', left: '12%', background: 'var(--mint)', '--r': '-20deg', animation: 'float 6s ease-in-out infinite .5s' }}></span>
              <span className="deco deco-star" style={{ bottom: '25%', right: '8%', '--r': '10deg', animation: 'float-slow 5s ease-in-out infinite 1s' }}>✦</span>
              <span className="deco deco-circle" style={{ top: '45%', right: '2%', width: 14, height: 14, background: 'var(--sun)', animation: 'float 4s ease-in-out infinite .8s' }}></span>
            </>
          )}
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
          {variant === 'c' && (
            <>
              <span className="deco" style={{ top: '15%', right: '10%', width: 80, height: 80, borderRadius: '50%', border: '2px dashed oklch(0.78 0.16 35)', animation: 'float-slow 7s ease-in-out infinite' }}></span>
              <span className="deco deco-star" style={{ bottom: '20%', left: '5%', color: 'var(--sun)', fontSize: 36, '--r': '-15deg', animation: 'float 5s ease-in-out infinite' }}>✦</span>
              <span className="deco" style={{ top: '8%', left: '15%', fontFamily: 'Caveat', fontSize: 32, color: 'var(--coral)', transform: 'rotate(-8deg)' }}>save the date!</span>
            </>
          )}
          <PhoneRSVP eventType={eventType} />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [heroVariant, setHeroVariant] = useState('b');
  const [eventType, setEventType] = useState('wedding');
  const [showInviteCards, setShowInviteCards] = useState(true);

  return (
    <>
      <Nav />
      <Hero variant={heroVariant} eventType={eventType} showInviteCards={showInviteCards} />
      <Steps />
      <Features />
      <Pricing />
      <FooterCTA />
    </>
  );
}

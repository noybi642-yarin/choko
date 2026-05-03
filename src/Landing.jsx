import { useEffect, useRef } from 'react';
import PhoneRSVP from './PhoneRSVP';
import { Steps, Features, AppBanner, Pricing, FooterCTA } from './Sections';
import { RainbowBorderButton } from './components/ui/RainbowBorderButton';

function Nav({ onLogin }) {
  const navRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="lp-nav" ref={navRef}>
      <div className="lp-nav-inner">
        <span className="lp-logo">choko<span className="lp-logo-dot" /></span>
        <div className="lp-nav-links">
          <a href="#how">איך זה עובד</a>
          <a href="#features">תכונות</a>
          <a href="#pricing">תמחור</a>
        </div>
        <div className="lp-nav-end">
          <button className="lp-nav-btn lp-nav-btn--ghost" onClick={onLogin}>כניסה</button>
          <RainbowBorderButton onClick={onLogin}>יצירת אירוע</RainbowBorderButton>
        </div>
      </div>
    </nav>
  );
}

export default function Landing({ onLogin, onAI }) {
  const copyRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const els = [copyRef.current, stageRef.current].filter(Boolean);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.15 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Nav onLogin={onLogin} />

      <section className="lp-hero">
        {/* Background orbs */}
        <div className="lp-orb lp-orb--coral" />
        <div className="lp-orb lp-orb--lavender" />
        <div className="lp-orb lp-orb--gold" />
        <div className="lp-hero-grid" />

        <div className="lp-hero-inner">
          {/* Copy column */}
          <div className="lp-hero-copy" ref={copyRef}>
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              חדש: שיבוץ שולחנות בקליק
            </div>

            <h1 className="lp-h1">
              אישורי הגעה
              <span className="lp-h1-line2">בלי כאב ראש</span>
            </h1>

            <p className="lp-hero-sub">
              choko היא הדרך הכי קלה ויפה לנהל את רשימת האורחים לחתונה,
              לבר מצווה או למסיבה. אתם שולחים — האורחים מאשרים. כולם מרוצים.
            </p>

            <div className="lp-ctas">
              <RainbowBorderButton onClick={onLogin} className="lp-btn-coral-size">
                יצירת הזמנה — חינם
              </RainbowBorderButton>
              <button className="lp-btn-outline" onClick={onAI}>
                ✨ חברי הטוב AI
              </button>
              <a href="#how" className="lp-btn-outline">איך זה עובד?</a>
            </div>

            <div className="lp-trust">
              <div className="lp-avs">
                <span className="lp-av">נ</span>
                <span className="lp-av">ד</span>
                <span className="lp-av">ר</span>
                <span className="lp-av">+</span>
              </div>
              <div className="lp-trust-text">
                <span className="lp-stars">★★★★★</span>
                {' '}
                <strong>למעלה מ-50,000</strong> אירועים מאושרים
              </div>
            </div>
          </div>

          {/* Stage column */}
          <div className="lp-hero-stage" ref={stageRef}>
            <div className="lp-phone-glow" />

            {/* Floating card A — new RSVP */}
            <div className="lp-float lp-float--a">
              <div className="lp-float-row">
                <div className="lp-float-icon" style={{ background: 'oklch(0.52 0.16 155 / 0.25)' }}>✅</div>
                <div>
                  <div className="lp-float-title">דנה כהן אישרה הגעה</div>
                  <div className="lp-float-sub">2 אורחים · הרגע</div>
                </div>
              </div>
            </div>

            {/* Floating card B — event type */}
            <div className="lp-float lp-float--b">
              <div className="lp-float-row">
                <div className="lp-float-icon" style={{ background: 'oklch(0.65 0.22 28 / 0.25)' }}>💍</div>
                <div>
                  <div className="lp-float-title">חתונת דנה ויוסי</div>
                  <div className="lp-float-sub">22 ביוני · 143 מוזמנים</div>
                </div>
              </div>
            </div>

            {/* Floating card C — live count */}
            <div className="lp-float lp-float--c">
              <div className="lp-float-row">
                <div className="lp-live-dot" />
                <div>
                  <div className="lp-float-title">87% אישרו הגעה</div>
                  <div className="lp-float-sub">עדכון חי</div>
                </div>
              </div>
            </div>

            <PhoneRSVP eventType="wedding" />
          </div>
        </div>

        <div className="lp-scroll-cue">
          <span>גלול למטה</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 9l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      <Steps />
      <Features />
      <AppBanner />
      <Pricing onCta={onLogin} />
      <FooterCTA onCta={onLogin} />
    </>
  );
}

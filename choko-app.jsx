import { useState, useEffect, useRef } from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { direction: rtl; scroll-behavior: smooth; }
    body { font-family: 'Heebo', sans-serif; background: #0a0a0f; color: #fff; overflow-x: hidden; }

    :root {
      --choc: #3b1a08;
      --gold: #c9a84c;
      --gold-light: #f0d078;
      --cream: #fdf6ec;
      --rose: #e8a0a0;
      --rose-deep: #c45f5f;
      --dark: #0a0a0f;
      --dark2: #13111a;
      --card-bg: rgba(255,255,255,0.04);
    }

    ::selection { background: var(--gold); color: #000; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

    .serif { font-family: 'Cormorant Garamond', serif; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(40px);  } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes float    { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-14px) rotate(2deg); } }
    @keyframes shimmer  { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes spin     { to { transform:rotate(360deg); } }
    @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(0.96)} }
    @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes glowPulse{ 0%,100%{box-shadow:0 0 40px rgba(201,168,76,0.3)} 50%{box-shadow:0 0 80px rgba(201,168,76,0.6)} }

    .fade-up { animation: fadeUp 0.8s ease forwards; }
    .float   { animation: float 5s ease-in-out infinite; }

    .gold-text {
      background: linear-gradient(90deg, #c9a84c, #f0d078, #c9a84c);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }

    .btn-gold {
      background: linear-gradient(135deg, #c9a84c, #f0d078, #c9a84c);
      background-size: 200% auto;
      color: #1a0e00;
      border: none;
      border-radius: 50px;
      font-family: 'Heebo', sans-serif;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.3s;
      animation: shimmer 3s linear infinite;
    }
    .btn-gold:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 40px rgba(201,168,76,0.5); }

    .btn-outline {
      background: transparent;
      color: var(--gold);
      border: 2px solid var(--gold);
      border-radius: 50px;
      font-family: 'Heebo', sans-serif;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-outline:hover { background: var(--gold); color: #1a0e00; transform: translateY(-2px); }

    .glass {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .section-reveal { opacity: 0; transform: translateY(50px); transition: all 0.9s cubic-bezier(0.16,1,0.3,1); }
    .section-reveal.visible { opacity: 1; transform: translateY(0); }

    /* Nav */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 20px 40px;
      display: flex; align-items: center; justify-content: space-between;
      transition: all 0.4s;
    }
    .nav.scrolled {
      background: rgba(10,10,15,0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(201,168,76,0.2);
      padding: 14px 40px;
    }
    .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 600; letter-spacing: 3px; color: var(--gold); cursor: pointer; }
    .nav-logo span { color: #fff; font-style: italic; }

    @media(max-width:768px) {
      .nav { padding: 16px 20px; }
      .nav.scrolled { padding: 12px 20px; }
    }
  `}</style>
);

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.section-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Phone mockup with invite ──
function PhoneMockup({ floating = false }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }} className={floating ? "float" : ""}>
      {/* Glow */}
      <div style={{ position: "absolute", inset: -30, background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)", borderRadius: "50%", animation: "glowPulse 3s ease infinite" }} />

      {/* Phone shell */}
      <div style={{
        width: 240, height: 490,
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        borderRadius: 40,
        border: "8px solid #2a2a3e",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Notch */}
        <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
          <div style={{ width: 60, height: 8, background: "#0f0f1a", borderRadius: 10 }} />
        </div>

        {/* WhatsApp header */}
        <div style={{ background: "#075e54", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #f0d078)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍫</div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>Choko Events</div>
            <div style={{ color: "#a8d5b5", fontSize: 10 }}>מקוון</div>
          </div>
        </div>

        {/* Chat bg */}
        <div style={{ flex: 1, background: "#ece5dd", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8, overflowY: "hidden" }}>

          {/* Invite bubble */}
          <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
            <div style={{ background: "white", borderRadius: "0 14px 14px 14px", padding: "10px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
              {/* Invite card inside bubble */}
              <div style={{ background: "linear-gradient(135deg, #1a0e00, #3b1a08)", borderRadius: 10, padding: "14px 10px", textAlign: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>💍</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0d078", fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>נוי & ירין</div>
                <div style={{ color: "rgba(240,208,120,0.7)", fontSize: 10, marginTop: 4 }}>מזמינים אתכם לחגוג</div>
                <div style={{ color: "white", fontSize: 10, marginTop: 6, lineHeight: 1.6 }}>📅 שישי, 15.08.2025{"\n"}⏰ 19:00 | 📍 אולם גן עדן</div>
              </div>
              <div style={{ fontSize: 11, color: "#333", lineHeight: 1.5 }}>שלום משפחת כהן! 💍{"\n"}אנחנו שמחים להזמין אתכם...</div>
              {/* RSVP link */}
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "6px 10px", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #f0d078)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💍</div>
                <div style={{ fontSize: 10 }}>
                  <div style={{ fontWeight: 700, color: "#065f46" }}>אישור הגעה</div>
                  <div style={{ color: "#059669" }}>choko.app/rsvp/noayonatan</div>
                </div>
              </div>
              <div style={{ textAlign: "left", fontSize: 9, color: "#9ca3af", marginTop: 4, display: "flex", justifyContent: "flex-end", gap: 3 }}>
                <span>10:32</span><span style={{ color: "#34a853" }}>✓✓</span>
              </div>
            </div>
          </div>

          {/* Reply bubble */}
          <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
            <div style={{ background: "#dcf8c6", borderRadius: "14px 0 14px 14px", padding: "8px 12px", fontSize: 11, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
              בטח! מגיעים 🎉
              <div style={{ textAlign: "right", fontSize: 9, color: "#9ca3af", marginTop: 2, display: "flex", justifyContent: "flex-end", gap: 3 }}>
                <span>10:35</span><span style={{ color: "#34a853" }}>✓✓</span>
              </div>
            </div>
          </div>

          {/* Table reminder bubble */}
          <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
            <div style={{ background: "white", borderRadius: "0 14px 14px 14px", padding: "10px 12px", fontSize: 11, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
              🌸 בוקר טוב! היום החתונה!
              <div style={{ background: "#fff1f2", borderRadius: 6, padding: "6px 8px", marginTop: 6, fontWeight: 700, fontSize: 12, color: "#c45f5f", textAlign: "center" }}>
                🪑 השולחן שלכם: מספר 3
              </div>
            </div>
          </div>
        </div>

        {/* Home bar */}
        <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e" }}>
          <div style={{ width: 80, height: 4, background: "#3a3a5e", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

// ── Credit card gift mockup ──
function GiftPhoneMockup() {
  return (
    <div style={{ position: "relative", display: "inline-block" }} className="float">
      <div style={{ position: "absolute", inset: -20, background: "radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)", borderRadius: "50%" }} />
      <div style={{
        width: 220, height: 450,
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        borderRadius: 36, border: "7px solid #2a2a3e",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        {/* Status bar */}
        <div style={{ background: "#0a0a0f", padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
          <span>9:41</span><span>●●●</span>
        </div>

        {/* App screen */}
        <div style={{ flex: 1, background: "linear-gradient(160deg, #1a0e00, #3b1a08, #1a0e00)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🎁</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0d078", fontSize: 16, fontWeight: 600 }}>שלחו מתנה</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 2 }}>נוי & ירין</div>
          </div>

          {/* Amount selector */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 10px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>בחרו סכום</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {["₪200", "₪300", "₪500", "₪1000"].map((amt, i) => (
                <div key={i} style={{ background: i === 1 ? "linear-gradient(135deg,#c9a84c,#f0d078)" : "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px", textAlign: "center", fontSize: 13, fontWeight: 700, color: i === 1 ? "#1a0e00" : "#fff" }}>
                  {amt}
                </div>
              ))}
            </div>
          </div>

          {/* Card input */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>פרטי כרטיס</div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>**** **** **** 4242</div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>12/27</div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>***</div>
            </div>
          </div>

          {/* Send button */}
          <div style={{ background: "linear-gradient(135deg, #c9a84c, #f0d078)", borderRadius: 14, padding: "12px", textAlign: "center", fontWeight: 800, color: "#1a0e00", fontSize: 14 }}>
            💳 שלח מתנה — ₪300
          </div>

          <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>🔒 מאובטח ומוצפן | PCI DSS</div>
        </div>

        {/* Home bar */}
        <div style={{ height: 18, background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 70, height: 3, background: "#2a2a3e", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

// ── Event type card ──
function EventCard({ icon, title, desc, color, delay }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24, padding: "32px 24px", textAlign: "center", cursor: "pointer",
      transition: "all 0.35s", animationDelay: delay,
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `rgba(201,168,76,0.08)`; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = `0 20px 60px rgba(201,168,76,0.15)`; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#f0d078", marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{desc}</div>
      <div style={{ marginTop: 20, display: "inline-block", background: "linear-gradient(135deg,#c9a84c,#f0d078)", color: "#1a0e00", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 700 }}>
        בואו נתחיל →
      </div>
    </div>
  );
}

// ── Feature row ──
function FeatureRow({ icon, title, desc, tag, reverse, delay }) {
  return (
    <div className="section-reveal" style={{ animationDelay: delay, display: "flex", flexDirection: reverse ? "row-reverse" : "row", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 14 }}>{tag}</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "#fff", marginBottom: 14, lineHeight: 1.25 }}>{title}</h3>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>{desc}</p>
      </div>
      <div style={{ flex: "0 0 auto", fontSize: 80, filter: "drop-shadow(0 0 30px rgba(201,168,76,0.3))" }}>{icon}</div>
    </div>
  );
}

// ── Ticker ──
function Ticker() {
  const items = ["💍 חתונות", "🎊 בר/בת מצווה", "👶 ברית", "💼 אירועים עסקיים", "🎂 יומולדות", "💍 חתונות", "🎊 בר/בת מצווה", "👶 ברית", "💼 אירועים עסקיים", "🎂 יומולדות"];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(201,168,76,0.2)", borderBottom: "1px solid rgba(201,168,76,0.2)", padding: "14px 0", background: "rgba(201,168,76,0.04)" }}>
      <div style={{ display: "flex", gap: 60, animation: "ticker 18s linear infinite", width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 14, fontWeight: 600, color: "rgba(201,168,76,0.7)", whiteSpace: "nowrap" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ── Stats strip ──
function StatsStrip() {
  const stats = [
    { num: "12,000+", label: "אירועים מנוהלים" },
    { num: "98%", label: "שביעות רצון" },
    { num: "3 דקות", label: "הגדרה ראשונית" },
    { num: "₪200", label: "מחיר התחלתי" },
  ];
  return (
    <div className="section-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 1, background: "rgba(201,168,76,0.15)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(201,168,76,0.2)" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: "var(--dark2)", padding: "28px 20px", textAlign: "center" }}>
          <div className="gold-text" style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Heebo',sans-serif" }}>{s.num}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main landing ──
function ChokoLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "var(--dark)", minHeight: "100vh", direction: "rtl" }}>
      <GlobalStyles />

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo">choko<span>.</span></div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-outline" style={{ padding: "9px 22px", fontSize: 14 }}>כניסה</button>
          <button className="btn-gold" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => setSignupOpen(true)}>התחילו בחינם</button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "100px 24px 60px" }}>
        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(201,168,76,0.12) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 80% 80%, rgba(196,95,95,0.08) 0%, transparent 50%)" }} />
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: 2 + (i % 3), height: 2 + (i % 3), borderRadius: "50%", background: `rgba(201,168,76,${0.2 + (i % 4) * 0.1})`, top: `${10 + (i * 7.5) % 80}%`, right: `${5 + (i * 9.3) % 90}%`, animation: `float ${3 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
        ))}

        <div style={{ maxWidth: 1100, width: "100%", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center" }}>
          {/* Text side */}
          <div style={{ flex: "1 1 420px", maxWidth: 560 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 30, padding: "7px 16px", marginBottom: 24, animation: "fadeUp 0.6s ease" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>נעים מאוד — אנחנו חברת Choko</span>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(44px, 5.5vw, 76px)", fontWeight: 300, lineHeight: 1.12, marginBottom: 24, animation: "fadeUp 0.7s ease 0.1s both" }}>
              האפליקציה{" "}
              <span className="gold-text" style={{ fontWeight: 600, fontStyle: "italic" }}>המתקדמת ביותר</span>
              <br />לתכנון וניהול<br />
              <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>אירוע מושלם</span>
            </h1>

            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 36, animation: "fadeUp 0.7s ease 0.2s both" }}>
              בקלי קלות. מהנייד. עם חיוך.<br />
              הזמנות, אישורי הגעה, שולחנות, מתנות — הכל במקום אחד.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.3s both" }}>
              <button className="btn-gold" style={{ padding: "16px 36px", fontSize: 16 }} onClick={() => setSignupOpen(true)}>
                🚀 התחילו בחינם
              </button>
              <button className="btn-outline" style={{ padding: "15px 28px", fontSize: 15 }}>
                צפו בסרטון הדגמה
              </button>
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 20, fontSize: 13, color: "rgba(255,255,255,0.35)", animation: "fadeUp 0.7s ease 0.4s both", flexWrap: "wrap" }}>
              <span>✓ ללא כרטיס אשראי</span>
              <span>✓ הגדרה תוך 3 דקות</span>
              <span>✓ תמיכה בעברית</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div style={{ flex: "0 0 auto", animation: "fadeIn 1s ease 0.5s both" }}>
            <PhoneMockup floating />
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ══════════════════════════════════════════
          MANAGE FROM MOBILE
      ══════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div className="section-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 20 }}>📱 לנהל את האירוע מהנייד</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 300, lineHeight: 1.2, marginBottom: 20 }}>
            להיות אחראים על<br />
            <span className="gold-text" style={{ fontWeight: 600, fontStyle: "italic" }}>אירוע כל כך גדול</span> — זה אירוע מורכב.
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
            יחד איתנו, התהליך יהיה<br />
            <strong style={{ color: "white" }}>פשוט, מהיר ומהנה!</strong>
          </p>
        </div>

        {/* Feature rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 70 }}>
          <FeatureRow icon="💌" title="הזמנות יפות ישירות לוואטסאפ" desc="העלו את עיצוב ההזמנה שלכם, בחרו תבנית הודעה, ושלחו לכל האורחים בלחיצה אחת. WhatsApp ראשון, SMS כגיבוי אוטומטי." tag="✉️ הזמנות דיגיטליות" reverse={false} delay="0s" />
          <FeatureRow icon="✅" title="אישורי הגעה — נוחים לתפעול" desc="כל אורח מקבל קישור אישי. מאשר בקליק אחד — כן, לא, אולי. אתם רואים הכל בזמן אמת בדשבורד חי עם פירוט לפי קבוצות." tag="📊 דשבורד חי" reverse={true} delay="0.1s" />
          <FeatureRow icon="🪑" title="סידורי הושבה חכמים" desc="בנו מפת שולחנות, שבצו אורחים, ועם הגיע יום האירוע — כל אורח מקבל WhatsApp עם שעת הגעה, ניווט Waze ומספר השולחן שלו." tag="🗺️ ניהול שולחנות" reverse={false} delay="0.2s" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "20px 24px 100px", maxWidth: 900, margin: "0 auto" }}>
        <StatsStrip />
      </section>

      {/* ══════════════════════════════════════════
          GIFTS
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px 100px", background: "linear-gradient(180deg, transparent, rgba(201,168,76,0.04), transparent)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center", position: "relative" }}>

          {/* Phone */}
          <div className="section-reveal">
            <GiftPhoneMockup />
          </div>

          {/* Text */}
          <div className="section-reveal" style={{ flex: "1 1 340px", maxWidth: 460 }}>
            <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 20 }}>🎁 מתנות דיגיטליות</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 4vw, 54px)", fontWeight: 300, lineHeight: 1.2, marginBottom: 20 }}>
              מתנות באשראי —<br />
              <span className="gold-text" style={{ fontWeight: 600, fontStyle: "italic" }}>ישירות דרך האפליקציה</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 28 }}>
              האורחים שלכם יכולים לשלוח מתנה כספית דיגיטלית ישירות מדף ה-RSVP — בכרטיס אשראי, בביטחון מלא, ובלי צורך להביא מעטפה.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["💳 תשלום מאובטח PCI DSS", "📲 ישירות מהנייד, ללא הורדת אפליקציה", "💰 הכסף מגיע ישר לחשבון הבנק שלכם", "🧾 אישור תשלום אוטומטי לאורח"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHAT ARE WE CELEBRATING
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px 100px", maxWidth: 1000, margin: "0 auto" }}>
        <div className="section-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 20 }}>🎉 לכל שמחה</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 300, lineHeight: 1.2 }}>
            מה חוגגים?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 14 }}>Choko מתאימה לכל אירוע ולכל שמחה</p>
        </div>

        <div className="section-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 }}>
          <EventCard icon="💍" title="חתונה" desc="ניהול מלא של ההזמנות, RSVP, שולחנות ומתנות" color="#c9a84c" delay="0s" />
          <EventCard icon="✡️" title="בר / בת מצווה" desc="הזמינו משפחה וחברים לאירוע חייו הגדול של הילד" color="#a78bfa" delay="0.1s" />
          <EventCard icon="👶" title="ברית / שמחת בת" desc="רשימת אורחים, אישורים ותיאום מהיר לאירוע" color="#6ee7b7" delay="0.2s" />
          <EventCard icon="💼" title="אירועים עסקיים" desc="כנסים, השקות מוצר ואירועי חברה — בצורה מקצועית" color="#93c5fd" delay="0.3s" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px 120px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,168,76,0.1) 0%, transparent 60%)" }} />
        <div className="section-reveal" style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🍫</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 300, marginBottom: 16, lineHeight: 1.2 }}>
            מוכנים לתכנן<br />
            <span className="gold-text" style={{ fontWeight: 600, fontStyle: "italic" }}>את הרגעים הגדולים?</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 36, lineHeight: 1.7 }}>
            הצטרפו לאלפי זוגות ומשפחות שכבר בחרו ב-Choko לניהול האירוע שלהם
          </p>
          <button className="btn-gold" style={{ padding: "18px 48px", fontSize: 17 }} onClick={() => setSignupOpen(true)}>
            🚀 התחילו עכשיו — ללא תשלום
          </button>
          <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>ממחיר ₪200 בלבד · ללא הפתעות · ביטול בכל עת</div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div className="nav-logo" style={{ fontSize: 24 }}>choko<span>.</span></div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>© 2025 Choko Events · כל הזכויות שמורות</div>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          <span style={{ cursor: "pointer" }}>תנאי שימוש</span>
          <span style={{ cursor: "pointer" }}>פרטיות</span>
          <span style={{ cursor: "pointer" }}>צור קשר</span>
        </div>
      </footer>

      {/* ── Signup modal ── */}
      {signupOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", z: 200, padding: 24 }} onClick={() => setSignupOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg, #13111a, #1a1624)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 28, padding: "40px 32px", maxWidth: 420, width: "100%", animation: "fadeUp 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🍫</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#f0d078", marginBottom: 6 }}>ברוכים הבאים ל-Choko</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>צרו חשבון בחינם ותתחילו לתכנן</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["שם הכלה", "שם הכלה"], ["שם החתן", "שם החתן"], ["מייל", "your@email.com"], ["טלפון", "05X-XXXXXXX"]].map(([label, ph]) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 600 }}>{label}</div>
                  <input placeholder={ph} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
              ))}
              <button className="btn-gold" style={{ padding: "14px", fontSize: 16, marginTop: 4, width: "100%", borderRadius: 14 }} onClick={() => { setSignupOpen(false); onEnter(); }}>
                🎊 יצירת חשבון חינם — בואו נתחיל
              </button>
              <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                בלחיצה אתם מסכימים לתנאי השימוש שלנו
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════ DASHBOARD ══════════

// ── DATA ──────────────────────────────────────────────────────
const MOCK_GUESTS = [
  { id:"g1", name:"משפחת כהן",   phone:"052-1111111", invited:4, group:"משפחה",  rsvp:"confirmed", coming:4 },
  { id:"g2", name:"דנה לוי",     phone:"054-2222222", invited:2, group:"חברים",  rsvp:"confirmed", coming:2 },
  { id:"g3", name:"רוני אברהם",  phone:"053-3333333", invited:2, group:"עבודה",  rsvp:"declined",  coming:0 },
  { id:"g4", name:"מיכל גולן",   phone:"050-4444444", invited:3, group:"חברים",  rsvp:"maybe",     coming:2 },
  { id:"g5", name:"משפחת שפירא", phone:"055-5555555", invited:5, group:"משפחה",  rsvp:"pending",   coming:0 },
  { id:"g6", name:"אורן מזרחי",  phone:"058-6666666", invited:2, group:"צד חתן", rsvp:"confirmed", coming:2 },
  { id:"g7", name:"ליאת רוזן",   phone:"052-7777777", invited:2, group:"צד כלה", rsvp:"pending",   coming:0 },
  { id:"g8", name:"שלמה בן דוד", phone:"054-8888888", invited:4, group:"משפחה",  rsvp:"confirmed", coming:3 },
  { id:"g9", name:"נטע פרידמן",  phone:"053-9999999", invited:2, group:"חברים",  rsvp:"pending",   coming:0 },
  { id:"g10",name:"איתי בר",     phone:"050-0000000", invited:1, group:"עבודה",  rsvp:"declined",  coming:0 },
];
const MOCK_COUPLE = { brideName:"נוי", groomName:"ירין", weddingDate:"2025-08-15", weddingTime:"19:00", venue:"אולם 'גן עדן'", venueAddress:"רחוב הפרחים 12, תל אביב", mapsLink:"https://maps.google.com", contactPhone:"050-1234567", notes:"בבקשה להודיע על הגעה עד שבועיים לפני האירוע" };
const GROUPS = ["משפחה","חברים","עבודה","צד חתן","צד כלה"];
const TEMPLATES = [
  { id:"t1", name:"קלאסי ורומנטי",  preview:"שלום {שם} 💍\nאנחנו שמחים להזמין אתכם!\n{חתן} & {כלה}\n📅 {תאריך} | ⏰ {שעה}\n📍 {אולם}\nלאישור הגעה: {קישור}" },
  { id:"t2", name:"שמח ומודרני",    preview:"היי {שם}! 🎉\nמתחתנים! 💃🕺\n{חתן} ו-{כלה} מחכים לכם!\n{תאריך} | {שעה} | {אולם}\nאשרו הגעה: {קישור}" },
  { id:"t3", name:"אלגנטי ומינימלי",preview:"{שם} היקר/ה,\nנשמח לנוכחותכם בחגיגת נישואינו.\n{חתן} ❤️ {כלה}\n{תאריך} | {שעה}\n{אולם}\nאישור הגעה: {קישור}" },
];
const PLANS = [
  { id:"basic",   label:"בייסיק",  guests:100, price:200, features:["עד 100 אורחים","WhatsApp + SMS","דף RSVP אישי","תזכורות אוטומטיות"] },
  { id:"popular", label:"פופולרי", guests:300, price:400, features:["עד 300 אורחים","WhatsApp + SMS","דף RSVP אישי","תזכורות אוטומטיות","ניתוח נתונים","קבוצות אורחים"], hot:true },
  { id:"premium", label:"פרימיום", guests:500, price:600, features:["עד 500 אורחים","WhatsApp + SMS","דף RSVP אישי","תזכורות אוטומטיות","ניתוח נתונים","קבוצות אורחים","עיצוב מותאם","תמיכה VIP"] },
];
const TABLE_TYPES = [
  { id:"round", label:"עגול",   icon:"⭕" },
  { id:"rect",  label:"מלבני",  icon:"▬"  },
  { id:"royal", label:"ראשי",   icon:"👑" },
  { id:"kids",  label:"ילדים",  icon:"🎈" },
];
const INIT_TABLES = [
  { id:"t1", number:1, type:"round", capacity:10, guests:["g1","g6"] },
  { id:"t2", number:2, type:"round", capacity:8,  guests:["g2","g4"] },
  { id:"t3", number:3, type:"rect",  capacity:12, guests:["g8"] },
  { id:"t4", number:4, type:"round", capacity:10, guests:[] },
  { id:"t5", number:5, type:"royal", capacity:20, guests:[] },
];

// ── STYLES ────────────────────────────────────────────────────
const DashStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{direction:rtl;scroll-behavior:smooth}
    body{font-family:'Heebo',sans-serif;background:#0a0a0f;color:#fff;overflow-x:hidden}
    :root{
      --gold:#c9a84c; --gold-l:#f0d078; --dark:#0a0a0f; --dark2:#13111a; --dark3:#1a1624;
      --border:rgba(255,255,255,0.07); --border-gold:rgba(201,168,76,0.25);
      --green:#4ade80; --red:#f87171; --amber:#fbbf24; --muted:rgba(255,255,255,0.45);
    }
    ::selection{background:var(--gold);color:#000}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px}
    .serif{font-family:'Cormorant Garamond',serif}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .fade-up{animation:fadeUp 0.5s ease both}
    .gold-text{
      background:linear-gradient(90deg,#c9a84c,#f0d078,#c9a84c);
      background-size:200% auto;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      animation:shimmer 3s linear infinite;
    }
    /* Nav */
    .app-nav{
      position:fixed;top:0;left:0;right:0;z-index:200;height:60px;
      background:rgba(10,10,15,0.95);backdrop-filter:blur(20px);
      border-bottom:1px solid var(--border-gold);
      display:flex;align-items:center;justify-content:space-between;padding:0 24px;
    }
    .nav-logo{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;color:var(--gold);letter-spacing:2px}
    .nav-logo span{color:#fff;font-style:italic}
    /* Sidebar */
    .app-sidebar{
      position:fixed;top:60px;right:0;width:210px;height:calc(100vh - 60px);
      background:var(--dark2);border-left:1px solid var(--border);
      padding:20px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto;z-index:100;
    }
    .s-item{
      display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;
      font-size:13px;font-weight:500;border:none;background:transparent;
      cursor:pointer;color:rgba(255,255,255,0.45);transition:all 0.2s;
      text-align:right;width:100%;font-family:'Heebo',sans-serif;
    }
    .s-item:hover{background:rgba(201,168,76,0.07);color:var(--gold-l)}
    .s-item.active{background:rgba(201,168,76,0.12);color:var(--gold);font-weight:700;border:1px solid rgba(201,168,76,0.2)}
    .s-icon{font-size:17px}
    /* Main */
    .app-main{margin-right:210px;margin-top:60px;padding:32px;min-height:calc(100vh - 60px);padding-bottom:80px}
    /* Cards */
    .c-card{background:var(--dark2);border:1px solid var(--border);border-radius:20px}
    .c-pad{padding:24px}
    .c-card-gold{background:linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03));border:1px solid var(--border-gold);border-radius:20px}
    /* Buttons */
    .btn-g{background:linear-gradient(135deg,#c9a84c,#f0d078,#c9a84c);background-size:200% auto;animation:shimmer 3s linear infinite;color:#1a0e00;border:none;border-radius:50px;font-family:'Heebo',sans-serif;font-weight:800;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
    .btn-g:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.35)}
    .btn-g:disabled{opacity:.5;pointer-events:none}
    .btn-o{background:transparent;color:var(--gold);border:1.5px solid var(--border-gold);border-radius:50px;font-family:'Heebo',sans-serif;font-weight:700;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
    .btn-o:hover{background:rgba(201,168,76,0.1)}
    .btn-ghost{background:transparent;border:none;cursor:pointer;font-family:'Heebo',sans-serif;color:rgba(255,255,255,0.4);transition:all 0.2s;border-radius:10px;display:inline-flex;align-items:center;gap:6px}
    .btn-ghost:hover{color:#fff;background:rgba(255,255,255,0.06)}
    /* Input */
    .c-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;color:#fff;font-size:14px;font-family:'Heebo',sans-serif;outline:none;width:100%;transition:all 0.2s}
    .c-input:focus{border-color:rgba(201,168,76,0.5);background:rgba(255,255,255,0.07)}
    .c-input::placeholder{color:rgba(255,255,255,0.25)}
    .c-label{font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);margin-bottom:6px;display:block}
    /* Badges */
    .badge-confirmed{background:rgba(74,222,128,0.15);color:#4ade80;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700}
    .badge-declined{background:rgba(248,113,113,0.15);color:#f87171;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700}
    .badge-maybe{background:rgba(251,191,36,0.15);color:#fbbf24;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700}
    .badge-pending{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700}
    /* Table */
    .c-table{width:100%;border-collapse:collapse}
    .c-table th{padding:10px 14px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-align:right;background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border)}
    .c-table td{padding:13px 14px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle}
    .c-table tr:hover td{background:rgba(201,168,76,0.03)}
    /* Progress */
    .prog-bar{background:rgba(255,255,255,0.06);border-radius:8px;overflow:hidden;height:6px}
    .prog-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-l));border-radius:8px;transition:width 1s ease}
    /* Modal */
    .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px}
    .modal-box{background:linear-gradient(145deg,#13111a,#1a1624);border:1px solid var(--border-gold);border-radius:24px;padding:32px;max-width:480px;width:100%;animation:fadeUp 0.3s ease;max-height:85vh;overflow-y:auto}
    /* Section title */
    .pg-title{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;color:#fff;margin-bottom:4px}
    .pg-sub{font-size:13px;color:var(--muted)}
    /* Mobile nav */
    .mob-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(10,10,15,0.97);backdrop-filter:blur(20px);border-top:1px solid var(--border-gold);padding:8px 4px calc(8px + env(safe-area-inset-bottom))}
    .mob-nav-inner{display:flex;justify-content:space-around}
    .mob-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-family:'Heebo',sans-serif}
    .mob-btn .mi{font-size:20px;line-height:1}
    .mob-btn .ml{font-size:9px;font-weight:600;color:rgba(255,255,255,0.35)}
    .mob-btn.active .ml{color:var(--gold)}
    .mob-btn.active{background:rgba(201,168,76,0.1)}
    /* Drawer */
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .mob-drawer{position:fixed;bottom:0;left:0;right:0;z-index:400;background:#13111a;border-radius:24px 24px 0 0;padding:12px 16px calc(24px + env(safe-area-inset-bottom));max-height:75vh;overflow-y:auto;box-shadow:0 -8px 40px rgba(0,0,0,0.5);animation:slideUp 0.28s ease;border-top:1px solid var(--border-gold)}
    .drawer-handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 18px}
    .d-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;font-size:14px;font-weight:500;border:none;background:transparent;cursor:pointer;color:rgba(255,255,255,0.6);width:100%;text-align:right;transition:all 0.15s;font-family:'Heebo',sans-serif}
    .d-item:hover,.d-item.active{background:rgba(201,168,76,0.1);color:var(--gold)}
    .d-item.active{font-weight:700}
    @media(max-width:768px){
      .app-sidebar{display:none}
      .app-main{margin-right:0;padding:14px 12px 90px}
      .mob-nav{display:block}
      .pg-title{font-size:22px}
      .c-table{font-size:12px}
      .c-table td,.c-table th{padding:9px 10px}
    }
  `}</style>
);

// ── Helpers ──────────────────────────────────────────────────
function useToast(){
  const [t,setT]=useState(null);
  const show=(m)=>{setT(m);setTimeout(()=>setT(null),3000)};
  return{toast:t,show};
}
const rsvpLabel=s=>({confirmed:"מגיע ✓",declined:"לא מגיע",maybe:"אולי",pending:"ממתין"}[s]||s);
const rsvpBadge=s=><span className={`badge-${s}`}>{rsvpLabel(s)}</span>;

// ── Guest List Modal ─────────────────────────────────────────
function GuestModal({title,guests,icon,color,onClose,extra}){
  return(
    <div className="modal-ov" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(145deg,#13111a,#1a1624)",border:"1px solid var(--border-gold)",borderRadius:24,width:"100%",maxWidth:520,maxHeight:"82vh",display:"flex",flexDirection:"column",animation:"fadeUp 0.3s ease",overflow:"hidden"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
            <div><div style={{fontWeight:800,fontSize:16}}>{title}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{guests.length} אורחים</div></div>
          </div>
          <button className="btn-ghost" style={{width:32,height:32,padding:0,justifyContent:"center",borderRadius:"50%"}} onClick={onClose}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {guests.length===0?<div style={{textAlign:"center",padding:"48px 24px",color:"var(--muted)"}}>אין אורחים בקטגוריה זו</div>:
          guests.map((g,i)=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 24px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(201,168,76,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"var(--gold)",flexShrink:0,fontSize:14}}>{g.name.charAt(0)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{g.name}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:1,display:"flex",gap:8}}>
                  <span style={{direction:"ltr"}}>{g.phone}</span>
                  <span style={{background:"rgba(201,168,76,0.1)",color:"var(--gold)",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:600}}>{g.group}</span>
                </div>
              </div>
              {extra==="coming"&&<div style={{textAlign:"center"}}><div style={{fontWeight:800,fontSize:18,color:"#4ade80"}}>{g.coming}</div><div style={{fontSize:10,color:"var(--muted)"}}>מגיעים</div></div>}
              {extra==="invited"&&<div style={{textAlign:"center"}}><div style={{fontWeight:800,fontSize:18,color:"var(--muted)"}}>{g.invited}</div><div style={{fontSize:10,color:"var(--muted)"}}>מוזמנים</div></div>}
              <div style={{flexShrink:0}}>{rsvpBadge(g.rsvp)}</div>
            </div>
          ))}
        </div>
        {guests.length>0&&(
          <div style={{padding:"12px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)"}}>
            <span>סה״כ: {guests.length} אורחים</span>
            {extra==="coming"&&<span style={{color:"#4ade80",fontWeight:700}}>סה״כ מגיעים: {guests.reduce((s,g)=>s+(g.coming||0),0)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════

// ── Dashboard ────────────────────────────────────────────────
function Dashboard({guests}){
  const[modal,setModal]=useState(null);
  const total=guests.length;
  const confirmed=guests.filter(g=>g.rsvp==="confirmed");
  const declined=guests.filter(g=>g.rsvp==="declined");
  const maybe=guests.filter(g=>g.rsvp==="maybe");
  const pending=guests.filter(g=>g.rsvp==="pending");
  const totalComing=confirmed.reduce((s,g)=>s+g.coming,0);
  const responseRate=total>0?Math.round(((total-pending.length)/total)*100):0;
  const stats=[
    {key:"all",num:total,label:"סה״כ מוזמנים",color:"rgba(255,255,255,0.9)",icon:"👥",list:guests,extra:"invited"},
    {key:"confirmed",num:confirmed.length,label:"מאשרים הגעה",color:"#4ade80",icon:"✅",list:confirmed,extra:"coming"},
    {key:"coming",num:totalComing,label:"אנשים שמגיעים",color:"var(--gold)",icon:"🎉",list:confirmed,extra:"coming"},
    {key:"declined",num:declined.length,label:"לא מגיעים",color:"#f87171",icon:"❌",list:declined,extra:"invited"},
    {key:"maybe",num:maybe.length,label:"אולי",color:"#fbbf24",icon:"🤷",list:maybe,extra:"invited"},
    {key:"pending",num:pending.length,label:"טרם ענו",color:"rgba(255,255,255,0.3)",icon:"⏳",list:pending,extra:"invited"},
  ];
  const groupStats=["משפחה","חברים","עבודה","צד חתן","צד כלה"].map(g=>({name:g,total:guests.filter(x=>x.group===g).length,confirmed:guests.filter(x=>x.group===g&&x.rsvp==="confirmed").length,list:guests.filter(x=>x.group===g)})).filter(g=>g.total>0);
  const active=stats.find(s=>s.key===modal);
  const activeGroup=modal?.startsWith("group_")?modal.replace("group_",""):null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}} className="fade-up">
      <div>
        <h1 className="pg-title">שלום <span className="gold-text">נוי וירין</span> 💍</h1>
        <p className="pg-sub">חתונה ב-15.08.2025 · אולם גן עדן, תל אביב</p>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:14}}>
        {stats.map((s,i)=>(
          <div key={i} className="c-card-gold" onClick={()=>setModal(s.key)}
            style={{padding:"18px 16px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",borderBottom:`3px solid ${s.color}`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 32px rgba(201,168,76,0.15)`}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
            <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:30,fontWeight:900,color:s.color,fontFamily:"'Heebo',sans-serif"}}>{s.num}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{s.label}</div>
            <div style={{fontSize:10,color:s.color,marginTop:4,opacity:.7}}>לחץ לפירוט ›</div>
          </div>
        ))}
      </div>

      {/* Response rate */}
      <div className="c-card c-pad">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontWeight:700}}>שיעור מענה</span>
          <span className="gold-text" style={{fontWeight:900,fontSize:22}}>{responseRate}%</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width:`${responseRate}%`}}/></div>
        <div style={{display:"flex",gap:16,marginTop:12,fontSize:11,flexWrap:"wrap"}}>
          {[{l:"מאשרים",p:Math.round((confirmed.length/total)*100),c:"#4ade80",k:"confirmed"},{l:"לא מגיעים",p:Math.round((declined.length/total)*100),c:"#f87171",k:"declined"},{l:"אולי",p:Math.round((maybe.length/total)*100),c:"#fbbf24",k:"maybe"},{l:"ממתינים",p:Math.round((pending.length/total)*100),c:"rgba(255,255,255,0.3)",k:"pending"}].map((x,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}} onClick={()=>setModal(x.k)}>
              <div style={{width:8,height:8,borderRadius:"50%",background:x.c}}/>
              <span style={{color:"var(--muted)"}}>{x.l}: <strong style={{color:x.c}}>{x.p}%</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="c-card c-pad">
        <h3 style={{fontWeight:700,marginBottom:16,fontSize:14}}>פירוט לפי קבוצות</h3>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {groupStats.map((g,i)=>(
            <div key={i} style={{cursor:"pointer"}} onClick={()=>setModal(`group_${g.name}`)}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                <span style={{fontWeight:600}}>{g.name}</span>
                <span style={{color:"var(--muted)"}}>{g.confirmed}/{g.total} אישרו <span style={{color:"var(--gold)",fontSize:11}}>‹ לחץ</span></span>
              </div>
              <div className="prog-bar"><div className="prog-fill" style={{width:`${g.total>0?(g.confirmed/g.total)*100:0}%`,background:"linear-gradient(90deg,#4ade80,#22d3ee)"}}/></div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders */}
      <div className="c-card-gold c-pad">
        <h3 style={{fontWeight:700,marginBottom:12,fontSize:14}}>🔔 תזכורות מתוזמנות</h3>
        {[{l:"תזכורת שבוע לפני",d:"08.08.2025"},{l:"תזכורת יום האירוע",d:"15.08.2025"}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
            <div><div style={{fontWeight:600,fontSize:13}}>{r.l}</div><div style={{fontSize:11,color:"var(--muted)"}}>{r.d}</div></div>
            <span style={{background:"rgba(201,168,76,0.15)",color:"var(--gold)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>מתוזמנת</span>
          </div>
        ))}
      </div>

      {active&&<GuestModal title={active.label} guests={active.list} icon={active.icon} color={active.color} extra={active.extra} onClose={()=>setModal(null)}/>}
      {activeGroup&&<GuestModal title={`קבוצה: ${activeGroup}`} guests={guests.filter(g=>g.group===activeGroup)} icon="👥" color="var(--gold)" extra="invited" onClose={()=>setModal(null)}/>}
    </div>
  );
}

// ── Wedding Details ───────────────────────────────────────────
function WeddingDetails({toast,couplePhoto,setCouplePhoto}){
  const[form,setForm]=useState(MOCK_COUPLE);
  const[drag,setDrag]=useState(false);
  const f=(label,key,type="text",ph="")=>(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label className="c-label">{label}</label>
      <input className="c-input" type={type} value={form[key]||""} placeholder={ph} onChange={e=>setForm({...form,[key]:e.target.value})}/>
    </div>
  );
  const handlePhoto=(file)=>{
    if(!file||!file.type.startsWith("image/"))return;
    const r=new FileReader();r.onload=e=>{setCouplePhoto(e.target.result);toast("💕 התמונה הועלתה!")};r.readAsDataURL(file);
  };
  return(
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 className="pg-title">פרטי האירוע</h1><p className="pg-sub">הפרטים שיופיעו בהזמנות ובדף RSVP</p></div>

      {/* Photo upload */}
      <div className="c-card-gold c-pad">
        <h3 style={{fontWeight:700,marginBottom:4,fontSize:15}}>📸 תמונת הזוג</h3>
        <p style={{fontSize:12,color:"var(--muted)",marginBottom:16}}>תופיע בראש דף ה-RSVP של האורחים</p>
        <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{flexShrink:0}}>
            {couplePhoto
              ?<div style={{position:"relative",display:"inline-block"}}>
                  <img src={couplePhoto} alt="" style={{width:100,height:100,objectFit:"cover",borderRadius:"50%",border:"3px solid var(--gold)",boxShadow:"0 4px 20px rgba(201,168,76,0.3)",display:"block"}}/>
                  <button onClick={()=>setCouplePhoto(null)} style={{position:"absolute",top:-4,left:-4,width:26,height:26,borderRadius:"50%",background:"#dc2626",color:"white",border:"2px solid #13111a",cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              :<div style={{width:100,height:100,borderRadius:"50%",background:"rgba(201,168,76,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,border:"2px dashed var(--border-gold)"}}>💑</div>
            }
          </div>
          <div style={{flex:1,minWidth:200,border:`2px dashed ${drag?"var(--gold)":"rgba(201,168,76,0.3)"}`,borderRadius:14,padding:"18px 14px",textAlign:"center",cursor:"pointer",background:drag?"rgba(201,168,76,0.08)":"transparent",transition:"all 0.2s"}}
            onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handlePhoto(e.dataTransfer.files[0])}}
            onClick={()=>document.getElementById("cp-inp").click()}>
            <input id="cp-inp" type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePhoto(e.target.files[0])}/>
            <div style={{fontSize:24,marginBottom:6}}>🖼️</div>
            <div style={{fontWeight:700,fontSize:13,color:"var(--gold)"}}>{couplePhoto?"החלף תמונה":"העלו תמונה"}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:3}}>JPG, PNG · גרור או לחץ</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="c-card c-pad">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {f("שם הכלה","brideName")} {f("שם החתן","groomName")}
          {f("תאריך","weddingDate","date")} {f("שעה","weddingTime","time")}
          {f("שם האולם","venue")} {f("טלפון","contactPhone","tel")}
        </div>
        <div style={{marginTop:14}}>{f("כתובת האולם","venueAddress")}</div>
        <div style={{marginTop:12}}>{f("קישור Waze / Google Maps","mapsLink","url")}</div>
        <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
          <label className="c-label">הערות לאורחים</label>
          <textarea className="c-input" style={{minHeight:70,resize:"vertical"}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
        </div>
        <button className="btn-g" style={{marginTop:20,padding:"12px 28px",fontSize:14}} onClick={()=>toast("✅ הפרטים נשמרו!")}>שמור פרטים</button>
      </div>
    </div>
  );
}

// ── Guest Management ─────────────────────────────────────────
function GuestManagement({guests,setGuests,toast}){
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[showAdd,setShowAdd]=useState(false);
  const[ng,setNg]=useState({name:"",phone:"",invited:2,group:"חברים"});
  const filtered=guests.filter(g=>{
    const mG=filter==="all"||g.group===filter;
    const mS=g.name.includes(search)||g.phone.includes(search);
    return mG&&mS;
  });
  const add=()=>{
    if(!ng.name||!ng.phone)return;
    setGuests([...guests,{id:`g${Date.now()}`,...ng,rsvp:"pending",coming:0,sentAt:null}]);
    setNg({name:"",phone:"",invited:2,group:"חברים"});setShowAdd(false);toast("✅ האורח נוסף!");
  };
  return(
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div><h1 className="pg-title">ניהול אורחים</h1><p className="pg-sub">{guests.length} אורחים · {guests.filter(g=>g.rsvp==="confirmed").length} אישרו</p></div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-o" style={{padding:"9px 18px",fontSize:13}}>📥 ייבוא Excel</button>
          <button className="btn-g" style={{padding:"9px 18px",fontSize:13}} onClick={()=>setShowAdd(true)}>+ אורח</button>
        </div>
      </div>

      {/* Import banner */}
      <div className="c-card-gold c-pad" style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{fontSize:32}}>📊</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:"var(--gold-l)",marginBottom:3}}>יש רשימת אורחים בExcel? הורידו טמפלייט מוכן</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>הורידו ← מלאו ← העלו חזרה — הכל יתעדכן אוטומטית</div>
        </div>
        <button className="btn-g" style={{padding:"9px 18px",fontSize:13}}>⬇️ הורד טמפלייט</button>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {["all",...GROUPS].map(g=>(
          <button key={g} onClick={()=>setFilter(g)}
            style={{padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:`1px solid ${filter===g?"var(--gold)":"rgba(255,255,255,0.1)"}`,background:filter===g?"rgba(201,168,76,0.15)":"transparent",color:filter===g?"var(--gold)":"rgba(255,255,255,0.45)",cursor:"pointer",transition:"all 0.2s"}}>
            {g==="all"?"כולם":g}
          </button>
        ))}
      </div>

      <input className="c-input" placeholder="🔍 חיפוש לפי שם או טלפון..." value={search} onChange={e=>setSearch(e.target.value)}/>

      {/* Table */}
      <div className="c-card" style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table className="c-table">
            <thead><tr><th>שם</th><th>טלפון</th><th>קבוצה</th><th>מוזמנים</th><th>סטטוס</th><th>מגיעים</th><th></th></tr></thead>
            <tbody>
              {filtered.map(g=>(
                <tr key={g.id}>
                  <td style={{fontWeight:700}}>{g.name}</td>
                  <td style={{color:"var(--muted)",direction:"ltr",fontSize:12}}>{g.phone}</td>
                  <td><span style={{background:"rgba(201,168,76,0.1)",color:"var(--gold)",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:600}}>{g.group}</span></td>
                  <td style={{textAlign:"center"}}>{g.invited}</td>
                  <td>{rsvpBadge(g.rsvp)}</td>
                  <td style={{textAlign:"center",fontWeight:700,color:"#4ade80"}}>{g.coming||"—"}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      {g.rsvp==="pending"&&<button className="btn-ghost" style={{fontSize:14,padding:"3px 7px"}} onClick={()=>toast(`📨 תזכורת נשלחה ל${g.name}`)}>📨</button>}
                      <button className="btn-ghost" style={{fontSize:14,padding:"3px 7px",color:"#f87171"}} onClick={()=>{setGuests(guests.filter(x=>x.id!==g.id));toast("🗑️ הוסר")}}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd&&(
        <div className="modal-ov" onClick={()=>setShowAdd(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontWeight:800,fontSize:18,marginBottom:20}}>➕ הוספת אורח</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="c-label">שם מלא</label><input className="c-input" value={ng.name} onChange={e=>setNg({...ng,name:e.target.value})} placeholder="שם האורח"/></div>
              <div><label className="c-label">טלפון</label><input className="c-input" value={ng.phone} onChange={e=>setNg({...ng,phone:e.target.value})} placeholder="05X-XXXXXXX"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="c-label">מוזמנים</label><input className="c-input" type="number" min={1} value={ng.invited} onChange={e=>setNg({...ng,invited:+e.target.value})}/></div>
                <div><label className="c-label">קבוצה</label><select className="c-input" value={ng.group} onChange={e=>setNg({...ng,group:e.target.value})}>{GROUPS.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="btn-g" style={{flex:1,justifyContent:"center",padding:"12px"}} onClick={add}>הוסף</button>
                <button className="btn-o" style={{flex:1,justifyContent:"center",padding:"12px"}} onClick={()=>setShowAdd(false)}>ביטול</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Send ─────────────────────────────────────────────────────
function SendPage({guests,toast}){
  const[mode,setMode]=useState("now");
  const[groups,setGroups]=useState(["all"]);
  const[sending,setSending]=useState(false);
  const[sent,setSent]=useState(false);
  const[testPhone,setTestPhone]=useState("");
  const[testSent,setTestSent]=useState(false);
  const[testSending,setTestSending]=useState(false);
  const[preview,setPreview]=useState(false);
  const sendTest=()=>{if(!testPhone)return;setTestSending(true);setTimeout(()=>{setTestSending(false);setTestSent(true);toast(`📨 נשלח ל-${testPhone}`)},1800)};
  const send=()=>{setSending(true);setTimeout(()=>{setSending(false);setSent(true);toast("🎉 ההזמנות נשלחו!")},2400)};
  const toggle=(g)=>{if(g==="all"){setGroups(["all"]);return;}const n=groups.filter(x=>x!=="all");if(n.includes(g))setGroups(n.filter(x=>x!==g)||["all"]);else setGroups([...n,g])};
  if(sent)return(
    <div className="fade-up" style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:80,marginBottom:20}}>🎊</div>
      <h2 className="serif" style={{fontSize:36,marginBottom:12}}>ההזמנות נשלחו!</h2>
      <p style={{color:"var(--muted)",marginBottom:32}}>האורחים יקבלו את ההזמנה בקרוב</p>
      <button className="btn-g" style={{padding:"14px 32px",fontSize:15}} onClick={()=>setSent(false)}>שלח שוב</button>
    </div>
  );
  return(
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:22}}>
      <div><h1 className="pg-title">שליחת הזמנות</h1><p className="pg-sub">בחרו למי ומתי לשלוח</p></div>

      {/* Warning */}
      <div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:14,padding:"12px 16px",fontSize:13,display:"flex",gap:8,alignItems:"center"}}>
        <span>⚠️</span><span><strong style={{color:"#fbbf24"}}>מצב הדגמה</strong> — השליחה מדומה. לחיבור WhatsApp Business API אמיתי ראו תיעוד.</span>
      </div>

      {/* Test send */}
      <div className="c-card-gold c-pad">
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:14,background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🧪</div>
          <div><div style={{fontWeight:800,fontSize:15,color:"var(--gold-l)"}}>שלחו טסט לעצמכם קודם</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>בדקו איך ההזמנה נראית לפני שליחה לכולם</div></div>
        </div>
        <button style={{width:"100%",padding:"11px",borderRadius:12,background:"rgba(201,168,76,0.1)",border:"1.5px solid var(--border-gold)",color:"var(--gold)",fontWeight:700,cursor:"pointer",marginBottom:12,fontSize:13,fontFamily:"'Heebo',sans-serif"}} onClick={()=>setPreview(true)}>👀 תצוגה מקדימה של ההודעה</button>
        <div style={{display:"flex",gap:10}}>
          <input className="c-input" style={{flex:1}} placeholder="מספר טלפון לטסט..." value={testPhone} onChange={e=>{setTestPhone(e.target.value);setTestSent(false)}} dir="ltr"/>
          <button className="btn-g" style={{padding:"11px 20px",fontSize:13,flexShrink:0,background:testSent?"linear-gradient(135deg,#4ade80,#22d3ee)":"",backgroundSize:"200% auto"}} onClick={sendTest} disabled={testSending||!testPhone}>
            {testSending?<span style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#1a0e00",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>:testSent?"✓ נשלח":"📨 שלח טסט"}
          </button>
        </div>
      </div>

      {/* Who */}
      <div className="c-card c-pad">
        <h3 style={{fontWeight:700,marginBottom:12,fontSize:14}}>👥 למי לשלוח</h3>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["all",...GROUPS].map(g=>(
            <button key={g} onClick={()=>toggle(g)}
              style={{padding:"8px 16px",borderRadius:20,fontSize:12,fontWeight:600,border:`1px solid ${groups.includes(g)?"var(--gold)":"rgba(255,255,255,0.1)"}`,background:groups.includes(g)?"rgba(201,168,76,0.15)":"transparent",color:groups.includes(g)?"var(--gold)":"rgba(255,255,255,0.45)",cursor:"pointer",transition:"all 0.2s"}}>
              {g==="all"?"🌍 כולם":g}
            </button>
          ))}
        </div>
      </div>

      {/* When */}
      <div className="c-card c-pad">
        <h3 style={{fontWeight:700,marginBottom:12,fontSize:14}}>⏰ מתי לשלוח</h3>
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          {[["now","🚀 עכשיו"],["scheduled","📅 תזמן"]].map(([v,l])=>(
            <button key={v} onClick={()=>setMode(v)} style={{padding:"10px 22px",borderRadius:20,fontSize:13,fontWeight:700,border:`1.5px solid ${mode===v?"var(--gold)":"rgba(255,255,255,0.1)"}`,background:mode===v?"rgba(201,168,76,0.15)":"transparent",color:mode===v?"var(--gold)":"rgba(255,255,255,0.45)",cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
        {mode==="scheduled"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label className="c-label">תאריך</label><input className="c-input" type="date"/></div>
          <div><label className="c-label">שעה</label><input className="c-input" type="time" defaultValue="10:00"/></div>
        </div>}
      </div>

      {/* Channel */}
      <div className="c-card c-pad">
        <h3 style={{fontWeight:700,marginBottom:12,fontSize:14}}>📡 ערוץ שליחה</h3>
        <div style={{display:"flex",gap:12}}>
          {[["💬","WhatsApp","עדיפות ראשונה","rgba(74,222,128,0.08)","rgba(74,222,128,0.2)"],["📱","SMS","גיבוי אוטומטי","rgba(96,165,250,0.08)","rgba(96,165,250,0.2)"]].map(([ic,nm,sub,bg,border])=>(
            <div key={nm} style={{flex:1,background:bg,border:`1px solid ${border}`,borderRadius:14,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:26,marginBottom:4}}>{ic}</div>
              <div style={{fontWeight:700,fontSize:13}}>{nm}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-g" style={{width:"100%",justifyContent:"center",padding:"16px",fontSize:16}} onClick={send} disabled={sending}>
        {sending?<span style={{width:20,height:20,border:"3px solid rgba(0,0,0,0.2)",borderTopColor:"#1a0e00",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>:`🚀 ${mode==="now"?"שלח לכולם עכשיו":"תזמן שליחה"}`}
      </button>

      {/* WA preview modal */}
      {preview&&(
        <div className="modal-ov" onClick={()=>setPreview(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#13111a",border:"1px solid var(--border-gold)",borderRadius:24,maxWidth:480,width:"100%",overflow:"hidden",animation:"fadeUp 0.3s ease"}}>
            <div style={{background:"#075e54",padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#f0d078)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💍</div>
              <div><div style={{color:"white",fontWeight:700,fontSize:14}}>נוי וירין</div><div style={{color:"#a8d5b5",fontSize:11}}>מקוון</div></div>
              <button className="btn-ghost" style={{marginRight:"auto",color:"white"}} onClick={()=>setPreview(false)}>×</button>
            </div>
            <div style={{background:"#ece5dd",padding:"20px 16px",minHeight:240}}>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{background:"#dcf8c6",borderRadius:"14px 4px 14px 14px",padding:"12px 14px",maxWidth:"82%",boxShadow:"0 1px 3px rgba(0,0,0,0.12)"}}>
                  <div style={{background:"linear-gradient(135deg,#1a0e00,#3b1a08)",borderRadius:10,padding:"14px 12px",marginBottom:8,textAlign:"center"}}>
                    <div style={{fontSize:24}}>💍</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",color:"#f0d078",fontSize:15,fontWeight:600}}>נוי & ירין</div>
                    <div style={{color:"rgba(240,208,120,0.7)",fontSize:10,marginTop:3}}>מזמינים אתכם לחגוג</div>
                    <div style={{color:"white",fontSize:10,marginTop:6,lineHeight:1.7}}>📅 שישי 15.08.2025 · ⏰ 19:00<br/>📍 אולם גן עדן, תל אביב</div>
                  </div>
                  <div style={{fontSize:13,direction:"rtl",lineHeight:1.6}}>שלום משפחת כהן! 💍<br/>אנחנו שמחים להזמין אתכם...</div>
                  <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 10px",marginTop:8,display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#f0d078)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>💍</div>
                    <div><div style={{fontWeight:700,fontSize:11,color:"#065f46"}}>אישור הגעה</div><div style={{fontSize:10,color:"#059669"}}>choko.app/rsvp</div></div>
                  </div>
                  <div style={{textAlign:"left",fontSize:10,color:"#9ca3af",marginTop:4}}>10:32 ✓✓</div>
                </div>
              </div>
            </div>
            <div style={{padding:"14px 18px",display:"flex",gap:10,justifyContent:"flex-end",borderTop:"1px solid var(--border)"}}>
              <button className="btn-o" style={{padding:"10px 18px",fontSize:13}} onClick={()=>setPreview(false)}>סגור</button>
              <button className="btn-g" style={{padding:"10px 20px",fontSize:13}} onClick={()=>setPreview(false)}>נראה מעולה →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reminders ────────────────────────────────────────────────
function Reminders({toast}){
  const[reminders,setReminders]=useState([
    {id:"r1",label:"שבוע לפני",date:"08.08.2025",active:true},
    {id:"r2",label:"יום האירוע",date:"15.08.2025",active:true},
  ]);
  return(
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:22}}>
      <div><h1 className="pg-title">תזכורות</h1><p className="pg-sub">תזכורות אוטומטיות לאורחים שלא ענו</p></div>
      {reminders.map(r=>(
        <div key={r.id} className="c-card c-pad">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><h3 style={{fontWeight:700,fontSize:15}}>🔔 {r.label}</h3><div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>📅 {r.date}</div></div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button className="btn-o" style={{padding:"7px 14px",fontSize:12}} onClick={()=>toast("✅ נשמר!")}>✏️ ערוך</button>
              <div style={{width:44,height:24,borderRadius:12,background:r.active?"var(--gold)":"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",transition:"background 0.2s"}}
                onClick={()=>setReminders(reminders.map(x=>x.id===r.id?{...x,active:!x.active}:x))}>
                <div style={{width:18,height:18,background:"white",borderRadius:"50%",position:"absolute",top:3,right:r.active?3:undefined,left:r.active?undefined:3,transition:"all 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
            <span style={{background:"rgba(201,168,76,0.1)",color:"var(--gold)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>💬 WhatsApp + SMS</span>
            <span style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.4)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>👥 לא ענו בלבד</span>
          </div>
        </div>
      ))}
      <button className="btn-o" style={{padding:"11px 22px",fontSize:13,alignSelf:"flex-start"}} onClick={()=>toast("➕ תזכורת חדשה!")}>+ הוסף תזכורת</button>
    </div>
  );
}

// ── Seating ───────────────────────────────────────────────────
function Seating({guests,tables,setTables,toast}){
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[showAssign,setShowAssign]=useState(false);
  const[nt,setNt]=useState({type:"round",capacity:10});
  const[search,setSearch]=useState("");
  const confirmed=guests.filter(g=>g.rsvp==="confirmed"||g.rsvp==="maybe");
  const assignedIds=new Set(tables.flatMap(t=>t.guests));
  const unassigned=confirmed.filter(g=>!assignedIds.has(g.id));
  const getG=id=>guests.find(g=>g.id===id);
  const selTable=tables.find(t=>t.id===sel);
  const totalSeats=tables.reduce((s,t)=>s+t.capacity,0);
  const totalFilled=tables.reduce((s,t)=>s+t.guests.reduce((ss,gid)=>{const g=getG(gid);return ss+(g?g.coming||1:1)},0),0);
  const totalComing=confirmed.reduce((s,g)=>s+(g.coming||1),0);
  const addTable=()=>{const num=Math.max(...tables.map(t=>t.number),0)+1;setTables([...tables,{id:`t${Date.now()}`,number:num,...nt,guests:[]}]);setShowAdd(false);toast(`✅ שולחן #${num} נוסף!`)};
  const assign=gid=>{if(!sel)return;setTables(tables.map(t=>{if(t.id===sel)return{...t,guests:[...new Set([...t.guests,gid])]};return{...t,guests:t.guests.filter(id=>id!==gid)}}))};
  const unassign=gid=>setTables(tables.map(t=>({...t,guests:t.guests.filter(id=>id!==gid)})));
  const autoAssign=()=>{let rem=[...unassigned];const upd=tables.map(t=>{let free=t.capacity-t.guests.reduce((s,gid)=>{const g=getG(gid);return s+(g?g.coming||1:1)},0);const ng=[...t.guests];while(rem.length>0&&free>0){const g=rem[0];const need=g.coming||1;if(need<=free){ng.push(g.id);free-=need;rem.shift();}else break;}return{...t,guests:ng}});setTables(upd);toast(`🪄 שובצו ${unassigned.length-rem.length} אורחים!`)};
  const[sendingDay,setSendingDay]=useState(false);
  const filtSearch=search?confirmed.filter(g=>g.name.includes(search)):[];
  return(
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div><h1 className="pg-title">סידורי הושבה</h1><p className="pg-sub">תכננו שולחנות ושבצו אורחים</p></div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-o" style={{padding:"9px 16px",fontSize:13}} onClick={autoAssign} disabled={unassigned.length===0}>🪄 שיבוץ אוטומטי</button>
          <button className="btn-g" style={{padding:"9px 16px",fontSize:13}} onClick={()=>setShowAdd(true)}>+ שולחן</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
        {[{n:tables.length,l:"שולחנות",c:"var(--gold)",i:"🪑"},{n:totalSeats,l:"מקומות",c:"rgba(255,255,255,0.5)",i:"💺"},{n:totalFilled,l:"משובצים",c:"#4ade80",i:"✅"},{n:Math.max(0,totalComing-totalFilled),l:"ממתינים",c:"#f87171",i:"⏳"}].map((s,i)=>(
          <div key={i} className="c-card-gold" style={{padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.i}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.n}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="c-card c-pad">
        <h3 style={{fontWeight:700,marginBottom:10,fontSize:14}}>🔍 חפש אורח — ראה מספר שולחן</h3>
        <input className="c-input" placeholder="שם אורח..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {filtSearch.length>0&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {filtSearch.slice(0,5).map(g=>{const tbl=tables.find(t=>t.guests.includes(g.id));return(
            <div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:tbl?"rgba(74,222,128,0.05)":"rgba(248,113,113,0.05)",borderRadius:10,padding:"10px 14px"}}>
              <span style={{fontWeight:700,fontSize:14}}>{g.name}</span>
              {tbl?<span style={{background:"rgba(74,222,128,0.15)",color:"#4ade80",borderRadius:8,padding:"4px 12px",fontWeight:700,fontSize:13}}>שולחן #{tbl.number}</span>
                  :<span style={{background:"rgba(248,113,113,0.15)",color:"#f87171",borderRadius:8,padding:"4px 12px",fontWeight:700,fontSize:13}}>לא שובץ</span>}
            </div>
          )})}
        </div>}
      </div>

      {/* Floor plan */}
      <div className="c-card c-pad">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontWeight:700,fontSize:14}}>🗺️ מפת האולם</h3>
          <span style={{fontSize:11,color:"var(--muted)"}}>לחצו על שולחן לניהול</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:18,padding:"18px 12px",background:"rgba(255,255,255,0.02)",borderRadius:14,minHeight:160,alignItems:"center"}}>
          {tables.length===0&&<div style={{width:"100%",textAlign:"center",color:"var(--muted)",padding:28}}>אין שולחנות — לחצו "+ שולחן"</div>}
          {tables.map(t=>{
            const filled=t.guests.reduce((s,gid)=>{const g=getG(gid);return s+(g?g.coming||1:1)},0);
            const pct=t.capacity>0?filled/t.capacity:0;
            const fc=pct>=1?"#f87171":pct>=0.8?"#fbbf24":"#4ade80";
            const isRoyal=t.type==="royal";const isRound=t.type==="round";const isKids=t.type==="kids";
            const w=isRoyal?130:isRound?84:110;const h=isRoyal?52:isRound?84:52;const br=isRound?"50%":isRoyal?12:10;
            return(
              <div key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <div style={{width:w,height:h,borderRadius:br,background:sel===t.id?"rgba(201,168,76,0.15)":"rgba(255,255,255,0.04)",border:`2px solid ${sel===t.id?"var(--gold)":fc+"40"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s",boxShadow:sel===t.id?"0 0 0 3px rgba(201,168,76,0.2)":"none"}}
                  onClick={()=>setSel(sel===t.id?null:t.id)}>
                  <div style={{fontSize:12,marginBottom:1}}>{isRoyal?"👑":isKids?"🎈":""}</div>
                  <div style={{fontWeight:800,fontSize:15}}>{t.number}</div>
                  <div style={{fontSize:10,color:fc,fontWeight:700}}>{filled}/{t.capacity}</div>
                </div>
                <div style={{fontSize:10,color:"var(--muted)"}}>{TABLE_TYPES.find(tt=>tt.id===t.type)?.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected table */}
      {selTable&&(
        <div className="c-card-gold c-pad">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontWeight:800,fontSize:16}}>שולחן #{selTable.number} — {TABLE_TYPES.find(t=>t.id===selTable.type)?.label} · {selTable.capacity} מקומות</h3>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-g" style={{padding:"8px 16px",fontSize:12}} onClick={()=>setShowAssign(true)}>+ הוסף</button>
              <button className="btn-ghost" style={{color:"#f87171",fontSize:13}} onClick={()=>{setTables(tables.filter(t=>t.id!==selTable.id));setSel(null);toast("🗑️ הוסר")}}>🗑️</button>
            </div>
          </div>
          {selTable.guests.length===0?<div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>אין אורחים בשולחן זה</div>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {selTable.guests.map(gid=>{const g=getG(gid);if(!g)return null;return(
              <div key={gid} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"10px 14px"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(201,168,76,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"var(--gold)",flexShrink:0,fontSize:13}}>{g.name.charAt(0)}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{g.coming||g.invited||1} אנשים · {g.group}</div></div>
                <span style={{fontSize:11,color:"var(--muted)",direction:"ltr"}}>{g.phone}</span>
                <button className="btn-ghost" style={{color:"#f87171",fontSize:12,padding:"3px 8px"}} onClick={()=>unassign(gid)}>✕</button>
              </div>
            )})}
          </div>}
        </div>
      )}

      {/* Unassigned */}
      {unassigned.length>0&&(
        <div className="c-card c-pad" style={{border:"1.5px dashed rgba(248,113,113,0.3)"}}>
          <h3 style={{fontWeight:700,marginBottom:12,color:"#f87171",fontSize:14}}>⏳ ממתינים לשיבוץ ({unassigned.length})</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {unassigned.map(g=>(
              <div key={g.id} style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:6,cursor:sel?"pointer":"default"}}
                onClick={()=>{if(sel){assign(g.id);toast(`✅ ${g.name} שובץ לשולחן #${selTable?.number}`);}else toast("💡 בחרו שולחן תחילה")}}>
                <span style={{fontWeight:700}}>{g.name}</span>
                <span style={{color:"var(--muted)",fontSize:10}}>({g.coming||1})</span>
                {sel&&<span style={{color:"#f87171",fontWeight:800}}>+</span>}
              </div>
            ))}
          </div>
          {sel&&<div style={{marginTop:8,fontSize:11,color:"var(--gold)",fontWeight:600}}>לחצו על אורח להוספה לשולחן #{selTable?.number}</div>}
        </div>
      )}

      {/* Day reminder */}
      <div className="c-card-gold c-pad">
        <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{fontSize:32}}>💬</div>
          <div style={{flex:1}}>
            <h3 style={{fontWeight:800,fontSize:15,marginBottom:6}}>תזכורת יום החתונה עם מספר שולחן</h3>
            <p style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>כל אורח יקבל WhatsApp עם שעה · ניווט Waze · <strong style={{color:"var(--gold)"}}>מספר שולחן אישי</strong></p>
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:12,direction:"rtl",maxWidth:280}}>
              <div style={{fontWeight:700,marginBottom:4}}>🌸 בוקר טוב משפחת כהן!</div>
              <div style={{color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>⏰ 19:00 · <span style={{color:"#4ade80"}}>ניווט ב-Waze</span><br/><span style={{background:"rgba(201,168,76,0.2)",color:"var(--gold)",borderRadius:6,padding:"2px 8px",fontWeight:800}}>🪑 שולחן מספר 3</span></div>
            </div>
            <button className="btn-g" style={{padding:"11px 22px",fontSize:13}} onClick={()=>{setSendingDay(true);setTimeout(()=>{setSendingDay(false);toast("🎉 תזכורות נשלחו עם מספרי שולחן!")},2000)}}>
              {sendingDay?<span style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#1a0e00",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>:"📨 שלח תזכורת יום החתונה"}
            </button>
          </div>
        </div>
      </div>

      {/* Add table modal */}
      {showAdd&&(
        <div className="modal-ov" onClick={()=>setShowAdd(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontWeight:800,fontSize:18,marginBottom:20}}>➕ הוספת שולחן</h3>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div><label className="c-label">סוג שולחן</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {TABLE_TYPES.map(t=>(
                    <div key={t.id} onClick={()=>setNt({...nt,type:t.id})}
                      style={{border:`1.5px solid ${nt.type===t.id?"var(--gold)":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:"12px",cursor:"pointer",background:nt.type===t.id?"rgba(201,168,76,0.1)":"transparent",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
                      <span style={{fontSize:22}}>{t.icon}</span>
                      <div><div style={{fontWeight:700,fontSize:13}}>{t.label}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="c-label">מקומות</label>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <button className="btn-o" style={{width:38,height:38,padding:0,justifyContent:"center",borderRadius:"50%",fontSize:18}} onClick={()=>setNt({...nt,capacity:Math.max(2,nt.capacity-1)})}>−</button>
                  <span style={{fontSize:28,fontWeight:800,minWidth:48,textAlign:"center",color:"var(--gold)"}}>{nt.capacity}</span>
                  <button className="btn-o" style={{width:38,height:38,padding:0,justifyContent:"center",borderRadius:"50%",fontSize:18}} onClick={()=>setNt({...nt,capacity:Math.min(30,nt.capacity+1)})}>+</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-g" style={{flex:1,justifyContent:"center",padding:"12px",fontSize:14}} onClick={addTable}>הוסף</button>
                <button className="btn-o" style={{flex:1,justifyContent:"center",padding:"12px",fontSize:14}} onClick={()=>setShowAdd(false)}>ביטול</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {showAssign&&selTable&&(
        <div className="modal-ov" onClick={()=>setShowAssign(false)}>
          <div className="modal-box" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontWeight:800,fontSize:17}}>הוסף לשולחן #{selTable.number}</h3>
              <button className="btn-ghost" style={{width:30,height:30,padding:0,justifyContent:"center",borderRadius:"50%"}} onClick={()=>setShowAssign(false)}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:340,overflowY:"auto"}}>
              {confirmed.map(g=>{const isHere=selTable.guests.includes(g.id);const other=tables.find(t=>t.id!==sel&&t.guests.includes(g.id));return(
                <div key={g.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,background:isHere?"rgba(74,222,128,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${isHere?"rgba(74,222,128,0.2)":"var(--border)"}`}}>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{g.coming||1} אנשים{other&&<span style={{color:"#fbbf24",marginRight:6}}>· שולחן #{other.number}</span>}</div></div>
                  <button className={isHere?"btn-ghost":"btn-g"} style={isHere?{color:"#f87171",padding:"6px 12px",fontSize:12}:{padding:"6px 14px",fontSize:12}} onClick={()=>{isHere?unassign(g.id):assign(g.id)}}>{isHere?"הסר":"+ הוסף"}</button>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RSVP Page (guest-facing) ─────────────────────────────────
function RSVPPage({onBack,couplePhoto}){
  const[choice,setChoice]=useState(null);
  const[count,setCount]=useState(2);
  const[done,setDone]=useState(false);
  if(done)return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0a0f 0%,#1a1624 50%,#13111a 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"linear-gradient(145deg,#13111a,#1a1624)",border:"1px solid var(--border-gold)",borderRadius:28,padding:"40px 32px",maxWidth:420,width:"100%",textAlign:"center",animation:"fadeUp 0.5s ease"}}>
        {couplePhoto&&<img src={couplePhoto} alt="" style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"3px solid var(--gold)",margin:"0 auto 16px",display:"block"}}/>}
        <div style={{fontSize:52,marginBottom:14}}>{choice==="confirmed"?"🎉":choice==="declined"?"😢":"🤗"}</div>
        <h2 className="serif" style={{fontSize:28,color:"var(--gold-l)",marginBottom:12}}>{choice==="confirmed"?"מעולה! נתראה בשמחה!":choice==="declined"?"חבל שלא תוכלו להגיע":"תודה על המענה!"}</h2>
        <p style={{color:"var(--muted)",fontSize:14,marginBottom:24,lineHeight:1.7}}>{choice==="confirmed"?`נרשמה הגעה של ${count} אנשים 🎊`:choice==="declined"?"תשמרו לנו על הזכרון הטוב ✨":"נחכה לאישור הסופי שלכם"}</p>
        {choice==="confirmed"&&<div style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:16,padding:16,marginBottom:20,fontSize:13,lineHeight:2}}>
          <div style={{fontWeight:700,color:"#4ade80",marginBottom:6}}>📍 פרטי האירוע</div>
          <div>📅 שישי, 15.08.2025</div><div>⏰ 19:00</div><div>🏛️ אולם גן עדן, תל אביב</div>
          <a href="https://maps.google.com" style={{color:"#4ade80",fontWeight:600}}>📍 ניווט ב-Waze</a>
        </div>}
        <button className="btn-g" style={{width:"100%",justifyContent:"center",padding:"14px",fontSize:15}} onClick={onBack}>חזרה</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0a0f 0%,#1a1624 50%,#13111a 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"linear-gradient(145deg,#13111a,#1a1624)",border:"1px solid var(--border-gold)",borderRadius:28,maxWidth:420,width:"100%",overflow:"hidden",animation:"fadeUp 0.5s ease"}}>
        {couplePhoto?(
          <div style={{height:180,position:"relative"}}>
            <img src={couplePhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(10,10,15,0.85))"}}/>
            <div style={{position:"absolute",bottom:16,left:0,right:0,textAlign:"center"}}>
              <h1 className="serif" style={{fontSize:24,color:"var(--gold-l)",textShadow:"0 2px 8px rgba(0,0,0,0.5)"}}>נוי ❤️ ירין</h1>
              <p style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:3}}>מתחתנים! שישי, 15.08.2025</p>
            </div>
          </div>
        ):(
          <div style={{padding:"32px 32px 0",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:10}}>💍</div>
            <h1 className="serif" style={{fontSize:26,color:"var(--gold-l)"}}>נוי ❤️ ירין</h1>
            <p style={{color:"var(--muted)",fontSize:13,marginTop:4}}>מתחתנים! שישי, 15.08.2025</p>
          </div>
        )}
        <div style={{padding:"24px 28px 32px",textAlign:"center"}}>
          <div style={{background:"rgba(201,168,76,0.1)",border:"1px solid var(--border-gold)",borderRadius:12,padding:"8px 16px",display:"inline-block",marginBottom:20,fontSize:13}}>
            שלום <strong style={{color:"var(--gold)"}}>משפחת כהן</strong>! 👋
          </div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:6}}>האם תגיעו לשמחה שלנו?</h2>
          <p style={{fontSize:13,color:"var(--muted)",marginBottom:22}}>הוזמנתם ל-4 אנשים</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {[["confirmed","✅","כן! מגיעים בשמחה","rgba(74,222,128,0.12)","#4ade80"],["maybe","🤷","אולי, עדיין לא בטוחים","rgba(251,191,36,0.1)","#fbbf24"],["declined","😢","לא נוכל להגיע","rgba(248,113,113,0.1)","#f87171"]].map(([v,ic,lbl,bg,bc])=>(
              <button key={v} onClick={()=>setChoice(v)}
                style={{width:"100%",padding:"14px",borderRadius:14,fontSize:15,fontWeight:700,border:`2px solid ${choice===v?bc:bc+"30"}`,background:choice===v?bg:"transparent",color:choice===v?bc:"rgba(255,255,255,0.6)",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Heebo',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                {ic} {lbl}
              </button>
            ))}
          </div>
          {choice==="confirmed"&&(
            <div style={{background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:14,padding:"16px",marginBottom:18}}>
              <label style={{fontWeight:700,display:"block",marginBottom:10,fontSize:14}}>כמה אנשים יגיעו?</label>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18}}>
                <button style={{width:42,height:42,borderRadius:"50%",border:"1.5px solid rgba(74,222,128,0.3)",background:"rgba(74,222,128,0.1)",color:"#4ade80",fontSize:20,cursor:"pointer",fontWeight:700}} onClick={()=>setCount(Math.max(1,count-1))}>−</button>
                <span style={{fontSize:36,fontWeight:900,color:"#4ade80",minWidth:50,textAlign:"center"}}>{count}</span>
                <button style={{width:42,height:42,borderRadius:"50%",border:"1.5px solid rgba(74,222,128,0.3)",background:"rgba(74,222,128,0.1)",color:"#4ade80",fontSize:20,cursor:"pointer",fontWeight:700}} onClick={()=>setCount(Math.min(4,count+1))}>+</button>
              </div>
            </div>
          )}
          {choice&&<button className="btn-g" style={{width:"100%",justifyContent:"center",padding:"15px",fontSize:16}} onClick={()=>setDone(true)}>אשר תגובה →</button>}
          <div style={{marginTop:18,fontSize:11,color:"var(--muted)",lineHeight:1.8}}>📍 אולם גן עדן, תל אביב<br/>📞 050-1234567</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PLAN SELECTION (after login, before dashboard)
// ══════════════════════════════════════════════════════════════
function PlanSelection({onSelect}){
  const[sel,setSel]=useState(null);
  return(
    <div style={{minHeight:"100vh",background:"var(--dark)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,direction:"rtl"}}>
      <DashStyles/>
      <div style={{maxWidth:860,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:40,marginBottom:12}}>🍫</div>
          <h1 className="serif gold-text" style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:600,marginBottom:12}}>בחרו את התוכנית המתאימה</h1>
          <p style={{color:"var(--muted)",fontSize:15}}>שלמו פעם אחת, נהלו הכל</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:20,marginBottom:28}}>
          {PLANS.map((p,i)=>(
            <div key={p.id} onClick={()=>setSel(p.id)}
              style={{background:sel===p.id?"linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))":"var(--dark2)",border:`1.5px solid ${sel===p.id?"var(--gold)":p.hot?"rgba(201,168,76,0.3)":"var(--border)"}`,borderRadius:22,padding:"28px 22px",cursor:"pointer",transition:"all 0.25s",position:"relative",transform:sel===p.id?"translateY(-4px)":"",boxShadow:sel===p.id?"0 16px 48px rgba(201,168,76,0.15)":""}}>
              {p.hot&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#c9a84c,#f0d078)",color:"#1a0e00",borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>⭐ הכי פופולרי</div>}
              <div style={{textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:36,marginBottom:8}}>{p.id==="basic"?"💌":p.id==="popular"?"💎":"👑"}</div>
                <div style={{fontSize:17,fontWeight:800,marginBottom:4}}>{p.label}</div>
                <div className="gold-text" style={{fontSize:38,fontWeight:900}}>₪{p.price}</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>עד {p.guests} אורחים</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {p.features.map((f,j)=>(
                  <div key={j} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"rgba(255,255,255,0.7)"}}>
                    <span style={{color:"var(--gold)",fontWeight:700,fontSize:11}}>✓</span>{f}
                  </div>
                ))}
              </div>
              {sel===p.id&&<div style={{position:"absolute",top:12,left:12,width:20,height:20,borderRadius:"50%",background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#1a0e00",fontWeight:800}}>✓</div>}
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginBottom:24,background:"rgba(201,168,76,0.07)",border:"1px solid var(--border-gold)",borderRadius:14,padding:"12px 20px",fontSize:14}}>
          🔐 גישה לדשבורד אישי לזוג: תוספת של <strong style={{color:"var(--gold)"}}>₪20</strong> בלבד
        </div>
        <div style={{textAlign:"center"}}>
          <button className="btn-g" style={{padding:"16px 48px",fontSize:16}} disabled={!sel} onClick={()=>onSelect(sel)}>
            {sel?`המשיכו עם תוכנית ${PLANS.find(p=>p.id===sel)?.label} ←`:"בחרו תוכנית קודם"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
function ChokoApp({ onHome }){
  const[page,setPage]=useState("dashboard");
  const[guests,setGuests]=useState(MOCK_GUESTS);
  const[tables,setTables]=useState(INIT_TABLES);
  const[couplePhoto,setCouplePhoto]=useState(null);
  const[drawerOpen,setDrawerOpen]=useState(false);
  const[isMobile,setIsMobile]=useState(window.innerWidth<=768);
  const{toast,show}=useToast();

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<=768);
    window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);
  },[]);



  const sidebarItems=[
    {id:"dashboard",icon:"📊",label:"סקירה כללית"},
    {id:"details",  icon:"💍",label:"פרטי האירוע"},
    {id:"guests",   icon:"👥",label:"ניהול אורחים"},
    {id:"seating",  icon:"🪑",label:"סידורי הושבה"},
    {id:"send",     icon:"🚀",label:"שליחת הזמנות"},
    {id:"reminders",icon:"🔔",label:"תזכורות"},
    {id:"rsvp",     icon:"📱",label:"דף RSVP"},
  ];
  const bottomNav=[
    {id:"dashboard",icon:"📊",label:"סקירה"},
    {id:"guests",   icon:"👥",label:"אורחים"},
    {id:"send",     icon:"🚀",label:"שליחה"},
    {id:"seating",  icon:"🪑",label:"שולחנות"},
    {id:"__more__", icon:"☰", label:"עוד"},
  ];
  const navigate=id=>{setDrawerOpen(false);setPage(id)};
  const renderPage=()=>{
    switch(page){
      case"dashboard": return <Dashboard guests={guests}/>;
      case"details":   return <WeddingDetails toast={show} couplePhoto={couplePhoto} setCouplePhoto={setCouplePhoto}/>;
      case"guests":    return <GuestManagement guests={guests} setGuests={setGuests} toast={show}/>;
      case"seating":   return <Seating guests={guests} tables={tables} setTables={setTables} toast={show}/>;
      case"send":      return <SendPage guests={guests} toast={show}/>;
      case"reminders": return <Reminders toast={show}/>;
      case"rsvp":      return <RSVPPage onBack={()=>setPage("dashboard")} couplePhoto={couplePhoto}/>;
      default:         return <Dashboard guests={guests}/>;
    }
  };

  return(
    <>
      <DashStyles/>
      {/* Top nav */}
      <nav className="app-nav">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("dashboard")}>choko<span>.</span></div>
          {/* Home icon button */}
          <button
            onClick={()=>setPage("dashboard")}
            title="חזרה לסקירה הכללית"
            style={{
              width:34,height:34,borderRadius:10,border:"1px solid rgba(201,168,76,0.25)",
              background:page==="dashboard"?"rgba(201,168,76,0.15)":"transparent",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all 0.2s",color:page==="dashboard"?"var(--gold)":"rgba(255,255,255,0.35)",
              fontSize:17,
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,0.15)";e.currentTarget.style.color="var(--gold)"}}
            onMouseLeave={e=>{if(page!=="dashboard"){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.35)"}}}
          >
            🏠
          </button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:12,color:"var(--muted)",display:isMobile?"none":"block"}}>{initData?`${initData.brideName} ו${initData.groomName} 💍`:"נוי וירין 💍"}</div>
          <div style={{background:"rgba(201,168,76,0.1)",border:"1px solid var(--border-gold)",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:"var(--gold)"}}>{initData?.weddingDate?`חתונה · ${initData.weddingDate.split("-").reverse().join(".")}` : "חתונה · 15.08.25"}</div>
          <button className="btn-ghost" style={{fontSize:12,padding:"7px 14px"}} onClick={()=>onHome()}>🏠 בית</button>
        </div>
      </nav>

      {/* Desktop sidebar */}
      {!isMobile&&(
        <aside className="app-sidebar">
          <div style={{padding:"8px 14px 16px",borderBottom:"1px solid var(--border)",marginBottom:8}}>
            <div style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>האירוע שלכם</div>
            <div className="gold-text" style={{fontWeight:900,fontSize:16,marginTop:2}}>נוי & ירין</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>15.08.2025</div>
          </div>
          {sidebarItems.map(item=>(
            <button key={item.id} className={`s-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
              <span className="s-icon">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
          <div style={{marginTop:"auto",padding:"12px 14px",borderTop:"1px solid var(--border)"}}>
            <div style={{fontSize:10,color:"var(--muted)"}}>תוכנית פופולרי · עד 300 אורחים</div>
            <div className="prog-bar" style={{marginTop:6}}><div className="prog-fill" style={{width:`${Math.round((guests.length/300)*100)}%`}}/></div>
            <div style={{fontSize:10,color:"var(--muted)",marginTop:4}}>{guests.length}/300 אורחים</div>
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="app-main" style={isMobile?{marginRight:0,padding:"14px 12px 90px"}:{}}>
        {page==="rsvp"
          ?<RSVPPage onBack={()=>setPage("dashboard")} couplePhoto={couplePhoto}/>
          :renderPage()
        }
      </main>

      {/* Mobile bottom nav */}
      {isMobile&&(
        <nav className="mob-nav">
          <div className="mob-nav-inner">
            {bottomNav.map(item=>(
              <button key={item.id} className={`mob-btn ${item.id!=="__more__"&&page===item.id?"active":""} ${item.id==="__more__"&&drawerOpen?"active":""}`}
                onClick={()=>item.id==="__more__"?setDrawerOpen(v=>!v):navigate(item.id)}>
                <span className="mi">{item.icon}</span>
                <span className="ml">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Drawer */}
      {drawerOpen&&isMobile&&(
        <>
          <div onClick={()=>setDrawerOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300}}/>
          <div className="mob-drawer">
            <div className="drawer-handle"/>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:"var(--muted)"}}>כל הדפים</div>
            {sidebarItems.map(item=>(
              <button key={item.id} className={`d-item ${page===item.id?"active":""}`} onClick={()=>navigate(item.id)}>
                <span style={{fontSize:20}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {page===item.id&&<span style={{color:"var(--gold)",fontWeight:800}}>✓</span>}
              </button>
            ))}
            <div style={{marginTop:8,borderTop:"1px solid var(--border)",paddingTop:8}}>
              <button className="d-item" style={{color:"#f87171"}} onClick={()=>{setDrawerOpen(false);onHome()}}>
                <span style={{fontSize:20}}>🏠</span><span>חזרה לדף הבית</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:isMobile?80:24,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1a1624,#13111a)",border:"1px solid var(--border-gold)",color:"white",padding:"13px 22px",borderRadius:14,fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"fadeUp 0.3s ease",whiteSpace:"nowrap"}}>{toast}</div>}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// ONBOARDING — couple fills in event details after plan select
// ══════════════════════════════════════════════════════════════
function Onboarding({ plan, onDone }) {
  const [step, setStep] = useState(1); // 1=names, 2=event, 3=done
  const [form, setForm] = useState({
    brideName:"", groomName:"", weddingDate:"", weddingTime:"19:00",
    venue:"", venueAddress:"", contactPhone:"", guestCount:"",
    mapsLink:"", notes:""
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const canNext1 = form.brideName && form.groomName;
  const canNext2 = form.weddingDate && form.venue && form.contactPhone;

  const planLabel = { basic:"בייסיק", popular:"פופולרי", premium:"פרימיום" }[plan] || plan;
  const planGuests = { basic:100, popular:300, premium:500 }[plan] || 300;

  // Step done animation
  if (step === 3) return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, direction:"rtl" }}>
      <DashStyles/>
      <div style={{ textAlign:"center", maxWidth:480, animation:"fadeUp 0.6s ease" }}>
        <div style={{ fontSize:72, marginBottom:20 }}>🥂</div>
        <h1 className="serif" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:600, marginBottom:16 }}>
          <span className="gold-text">ברוכים הבאים, {form.brideName} ו{form.groomName}!</span>
        </h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.55)", lineHeight:1.8, marginBottom:32 }}>
          הכל מוכן — הדשבורד שלכם ממתין.<br/>
          בואו נתחיל לנהל את האירוע המושלם שלכם 💍
        </p>
        <button className="btn-g" style={{ padding:"16px 48px", fontSize:16 }} onClick={()=>onDone(form)}>
          🚀 כניסה לדשבורד
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", direction:"rtl" }}>
      <DashStyles/>

      {/* Top bar */}
      <div style={{ height:60, background:"rgba(10,10,15,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(201,168,76,0.2)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", position:"sticky", top:0, zIndex:100 }}>
        <div className="nav-logo">choko<span>.</span></div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700, color:"var(--gold)" }}>
            תוכנית {planLabel} · עד {planGuests} אורחים
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ maxWidth:600, margin:"0 auto", padding:"36px 24px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:40 }}>
          {[["1","פרטי הזוג"],["2","פרטי האירוע"]].map(([n,l],i)=>{
            const active = step === +n;
            const done   = step > +n;
            return (
              <div key={n} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`2px solid ${done?"var(--gold)":active?"var(--gold)":"rgba(255,255,255,0.15)"}`, background:done?"var(--gold)":active?"rgba(201,168,76,0.15)":"transparent", color:done?"#1a0e00":active?"var(--gold)":"rgba(255,255,255,0.3)", transition:"all 0.3s" }}>
                    {done?"✓":n}
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:active?"var(--gold)":"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{l}</div>
                </div>
                {i===0&&<div style={{ width:80, height:2, background:step>1?"var(--gold)":"rgba(255,255,255,0.1)", margin:"0 12px", marginBottom:22, transition:"background 0.4s" }}/>}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Couple names ── */}
        {step === 1 && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>💍</div>
              <h2 className="serif" style={{ fontSize:34, fontWeight:600, color:"var(--gold-l)", marginBottom:8 }}>ספרו לנו עליכם</h2>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>הפרטים שיופיעו בכל ההזמנות</p>
            </div>
            <div className="c-card" style={{ padding:28, display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label className="c-label">שם הכלה *</label>
                  <input className="c-input" placeholder="שם הכלה" value={form.brideName} onChange={e=>set("brideName",e.target.value)}/>
                </div>
                <div>
                  <label className="c-label">שם החתן *</label>
                  <input className="c-input" placeholder="שם החתן" value={form.groomName} onChange={e=>set("groomName",e.target.value)}/>
                </div>
              </div>
              <div>
                <label className="c-label">טלפון ליצירת קשר *</label>
                <input className="c-input" placeholder="05X-XXXXXXX" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} dir="ltr"/>
              </div>
              <div>
                <label className="c-label">כמה אורחים אתם מצפים? (בערך)</label>
                <input className="c-input" type="number" placeholder={`עד ${planGuests} (לפי התוכנית שבחרתם)`} value={form.guestCount} onChange={e=>set("guestCount",e.target.value)}/>
              </div>

              {/* Photo upload teaser */}
              <div style={{ background:"rgba(201,168,76,0.06)", border:"1px dashed rgba(201,168,76,0.3)", borderRadius:14, padding:"16px 18px", display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ fontSize:28 }}>📸</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:"var(--gold-l)", marginBottom:2 }}>תמונת הזוג (אופציונלי)</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>תוכלו להוסיף בדשבורד — היא תופיע בראש דף RSVP של האורחים</div>
                </div>
              </div>

              <button className="btn-g" style={{ padding:"14px", fontSize:15, justifyContent:"center", marginTop:4 }} disabled={!canNext1} onClick={()=>setStep(2)}>
                המשיכו לפרטי האירוע ←
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Event details ── */}
        {step === 2 && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>🏛️</div>
              <h2 className="serif" style={{ fontSize:34, fontWeight:600, color:"var(--gold-l)", marginBottom:8 }}>פרטי האירוע</h2>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>יופיעו בהזמנות ובתזכורות לאורחים</p>
            </div>
            <div className="c-card" style={{ padding:28, display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label className="c-label">תאריך החתונה *</label>
                  <input className="c-input" type="date" value={form.weddingDate} onChange={e=>set("weddingDate",e.target.value)}/>
                </div>
                <div>
                  <label className="c-label">שעת החתונה *</label>
                  <input className="c-input" type="time" value={form.weddingTime} onChange={e=>set("weddingTime",e.target.value)}/>
                </div>
              </div>
              <div>
                <label className="c-label">שם האולם *</label>
                <input className="c-input" placeholder='למשל: אולם "גן עדן"' value={form.venue} onChange={e=>set("venue",e.target.value)}/>
              </div>
              <div>
                <label className="c-label">כתובת האולם</label>
                <input className="c-input" placeholder="רחוב הפרחים 12, תל אביב" value={form.venueAddress} onChange={e=>set("venueAddress",e.target.value)}/>
              </div>
              <div>
                <label className="c-label">קישור ניווט (Waze / Google Maps)</label>
                <input className="c-input" placeholder="https://waze.com/..." value={form.mapsLink} onChange={e=>set("mapsLink",e.target.value)} dir="ltr"/>
              </div>
              <div>
                <label className="c-label">הערות לאורחים (אופציונלי)</label>
                <textarea className="c-input" style={{ minHeight:70, resize:"vertical" }} placeholder="למשל: בבקשה להגיע עם לבוש מכובד" value={form.notes} onChange={e=>set("notes",e.target.value)}/>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button className="btn-o" style={{ padding:"13px 20px", fontSize:14, flex:"0 0 auto" }} onClick={()=>setStep(1)}>← חזרה</button>
                <button className="btn-g" style={{ padding:"14px", fontSize:15, justifyContent:"center", flex:1 }} disabled={!canNext2} onClick={()=>setStep(3)}>
                  סיום — כניסה לדשבורד 🎊
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// ROOT — wires landing → plan → dashboard
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | plan | onboarding | app
  const [chosenPlan, setChosenPlan] = useState(null);
  const [coupleData, setCoupleData] = useState(null);

  if (screen === "app")
    return <ChokoApp onHome={() => setScreen("landing")} initData={coupleData} />;

  if (screen === "onboarding")
    return <Onboarding plan={chosenPlan} onDone={(data) => { setCoupleData(data); setScreen("app"); }} />;

  if (screen === "plan")
    return <PlanSelection onSelect={(plan) => { setChosenPlan(plan); setScreen("onboarding"); }} />;

  return (
    <>
      <GlobalStyles />
      <ChokoLanding
        onLogin={() => setScreen("plan")}
        onEnter={() => setScreen("plan")}
      />
    </>
  );
}

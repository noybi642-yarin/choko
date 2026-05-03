import { useState, useEffect, useRef, useMemo } from 'react';

// ── SEO ──────────────────────────────────────────────────────────────────────

function SEOMeta() {
  useEffect(() => {
    document.title = 'מחשבון מוזמנים לחתונה | כמה באמת יגיעו? | Choko';
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = 'גלו כמה מוזמנים באמת יגיעו לחתונה שלכם. מחשבון חכם לזוגות מתחתנים בישראל + אישורי הגעה דיגיטליים.';
    return () => { document.title = 'choko'; m.content = ''; };
  }, []);
  return null;
}

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  const raf  = useRef(null);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ── Calculation Engine ────────────────────────────────────────────────────────

const BASE_RATES = {
  closeFamily: 0.93, distantFamily: 0.76,
  bridesFriends: 0.68, groomsFriends: 0.68,
  workColleagues: 0.42, parentsGuests: 0.71, children: 0.88,
};
const REGION_MOD = { center: 0, north: -0.06, south: -0.06, jerusalem: -0.04, mixed: -0.03 };
const SEASON_MOD = { summer: -0.04, winter: -0.06, friday: +0.06, evening: 0 };
const NOTICE_MOD = { twoMonths: +0.04, oneMonth: 0, twoWeeks: -0.10 };
const REL_MOD    = { close: +0.06, medium: 0, weak: -0.12 };

function calculate(inp) {
  const mod = (REGION_MOD[inp.region] || 0) + (SEASON_MOD[inp.season] || 0)
            + (NOTICE_MOD[inp.notice] || 0) + (REL_MOD[inp.relationship] || 0);
  const cap = r => Math.min(0.97, Math.max(0.08, r + mod));
  const keys = ['closeFamily','distantFamily','bridesFriends','groomsFriends','workColleagues','parentsGuests','children'];
  const total = keys.reduce((s, k) => s + (inp[k] || 0), 0);
  const attending = Math.round(keys.reduce((s, k) => s + (inp[k] || 0) * cap(BASE_RATES[k]), 0));
  const declining = Math.max(0, total - attending);
  const noShows  = Math.round(attending * 0.09);
  const actual   = attending - noShows;
  const meals    = Math.ceil(actual * 1.08 / 5) * 5;
  const buffer   = meals - actual;
  const pct      = total > 0 ? Math.round((attending / total) * 100) : 0;
  const COLORS   = ['#e8645a','#f59e0b','#8b5cf6','#6366f1','#14b8a6','#10b981','#f97316'];
  const LABELS   = ['משפחה קרובה','משפחה רחוקה','חברות הכלה','חברי החתן','קולגות','מוזמני הורים','ילדים'];
  const breakdown = keys.map((k, i) => ({
    label: LABELS[i], color: COLORS[i],
    invited: inp[k] || 0,
    value: Math.round((inp[k] || 0) * cap(BASE_RATES[k])),
    rate: Math.round(cap(BASE_RATES[k]) * 100),
  })).filter(b => b.invited > 0);
  return { total, attending, declining, noShows, actual, meals, buffer, pct, breakdown };
}

// ── Category data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'closeFamily',    label: 'משפחה קרובה',    emoji: '👨‍👩‍👧‍👦', rate: '~93%', hint: 'הורים, אחים, דודים קרובים' },
  { key: 'distantFamily',  label: 'משפחה רחוקה',    emoji: '👴',      rate: '~76%', hint: 'דודנים, קרובים מרוחקים' },
  { key: 'bridesFriends',  label: 'חברות הכלה',     emoji: '👰',      rate: '~68%', hint: 'חברות אישיות של הכלה' },
  { key: 'groomsFriends',  label: 'חברים של החתן',  emoji: '🤵',      rate: '~68%', hint: 'חברים אישיים של החתן' },
  { key: 'workColleagues', label: 'עבודה / קולגות', emoji: '💼',      rate: '~42%', hint: 'עמיתים ומנהלים' },
  { key: 'parentsGuests',  label: 'מוזמני ההורים',  emoji: '🎩',      rate: '~71%', hint: 'אנשי הורים' },
  { key: 'children',       label: 'ילדים',           emoji: '🧒',      rate: '~88%', hint: 'ילדי המוזמנים' },
];

const REGIONS = [
  { value: 'center',    label: 'מרכז',    emoji: '🏙️' },
  { value: 'north',     label: 'צפון',    emoji: '🌲' },
  { value: 'south',     label: 'דרום',    emoji: '🌵' },
  { value: 'jerusalem', label: 'ירושלים', emoji: '🕌' },
  { value: 'mixed',     label: 'מעורב',   emoji: '🗺️' },
];

const SEASONS = [
  { value: 'evening', label: 'ערב רגיל',     emoji: '🌙', hint: '+0%' },
  { value: 'friday',  label: 'שישי צהריים',  emoji: '☀️', hint: '+6%' },
  { value: 'summer',  label: 'קיץ',          emoji: '🌞', hint: '−4%' },
  { value: 'winter',  label: 'חורף',         emoji: '🌧️', hint: '−6%' },
];

const NOTICE_OPTIONS = [
  { value: 'twoMonths', label: 'חודשיים',  hint: '+4%' },
  { value: 'oneMonth',  label: 'חודש',     hint: '±0%' },
  { value: 'twoWeeks',  label: 'שבועיים',  hint: '−10%' },
];

const REL_OPTIONS = [
  { value: 'close',  label: 'קרובה',   emoji: '❤️',  hint: '+6%' },
  { value: 'medium', label: 'בינונית', emoji: '🤝',  hint: '±0%' },
  { value: 'weak',   label: 'חלשה',    emoji: '👋',  hint: '−12%' },
];

const DEFAULT_INPUTS = {
  closeFamily: 40, distantFamily: 30, bridesFriends: 30, groomsFriends: 30,
  workColleagues: 20, parentsGuests: 40, children: 20,
  region: 'center', season: 'evening', notice: 'oneMonth', relationship: 'medium',
};

const SAMPLE_INPUTS = {
  closeFamily: 55, distantFamily: 40, bridesFriends: 35, groomsFriends: 35,
  workColleagues: 25, parentsGuests: 50, children: 25,
  region: 'center', season: 'friday', notice: 'oneMonth', relationship: 'medium',
};

const STEPS = ['סוגי מוזמנים', 'פרטי האירוע', 'רמת קשר', 'תוצאות'];

// ── Sub-components ────────────────────────────────────────────────────────────

function AnimNum({ value, suffix = '' }) {
  const v = useCountUp(value);
  return <>{v.toLocaleString('he-IL')}{suffix}</>;
}

function GuestSlider({ cat, value, onChange }) {
  const pct = Math.min((value / 100) * 100, 100);
  return (
    <div className="gc2-cat-card">
      <div className="gc2-cat-top">
        <div className="gc2-cat-left">
          <span className="gc2-cat-emoji">{cat.emoji}</span>
          <div>
            <div className="gc2-cat-name">{cat.label}</div>
            <div className="gc2-cat-hint">{cat.hint}</div>
          </div>
        </div>
        <div className="gc2-cat-right">
          <button className="gc2-adj" onClick={() => onChange(cat.key, Math.max(0, value - 5))}>−</button>
          <span className="gc2-cat-val">{value}</span>
          <button className="gc2-adj" onClick={() => onChange(cat.key, Math.min(200, value + 5))}>+</button>
          <span className="gc2-cat-rate">{cat.rate}</span>
        </div>
      </div>
      <div className="gc2-slider-wrap">
        <input
          type="range" min={0} max={150} step={5} value={value}
          onChange={e => onChange(cat.key, +e.target.value)}
          className="gc2-slider"
          style={{ '--pct': `${(value / 150) * 100}%` }}
        />
      </div>
    </div>
  );
}

function SegCard({ opt, active, onClick }) {
  return (
    <button className={`gc2-seg-card ${active ? 'active' : ''}`} onClick={onClick}>
      {opt.emoji && <span className="gc2-seg-emoji">{opt.emoji}</span>}
      <span className="gc2-seg-label">{opt.label}</span>
      {opt.hint && <span className="gc2-seg-hint">{opt.hint}</span>}
    </button>
  );
}

function Chip({ opt, active, onClick }) {
  return (
    <button className={`gc2-chip-btn ${active ? 'active' : ''}`} onClick={onClick}>
      {opt.emoji && <span>{opt.emoji}</span>}
      <span>{opt.label}</span>
      {opt.hint && <span className="gc2-chip-hint">{opt.hint}</span>}
    </button>
  );
}

function LivePanel({ results, total, visible }) {
  return (
    <div className={`gc2-live-panel ${visible ? 'visible' : ''}`}>
      <div className="gc2-live-header">
        <div className="gc2-live-dot" />
        <span>תצוגה חיה</span>
      </div>
      <div className="gc2-live-ring-wrap">
        <svg viewBox="0 0 96 96" className="gc2-live-ring-svg">
          <circle cx="48" cy="48" r="40" fill="none" stroke="oklch(0.92 0.04 75)" strokeWidth="7"/>
          <circle cx="48" cy="48" r="40" fill="none" stroke="#C9A84C" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(results.pct / 100) * 251.3} 251.3`}
            style={{ transform:'rotate(-90deg)', transformOrigin:'48px 48px', transition:'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="gc2-live-ring-inner">
          <div className="gc2-live-pct"><AnimNum value={results.pct} suffix="%" /></div>
          <div className="gc2-live-pct-label">יגיעו</div>
        </div>
      </div>
      <div className="gc2-live-stats">
        <div className="gc2-live-stat">
          <span className="gc2-live-stat-n"><AnimNum value={total} /></span>
          <span className="gc2-live-stat-l">מוזמנים</span>
        </div>
        <div className="gc2-live-stat accent">
          <span className="gc2-live-stat-n"><AnimNum value={results.attending} /></span>
          <span className="gc2-live-stat-l">צפויים</span>
        </div>
        <div className="gc2-live-stat">
          <span className="gc2-live-stat-n"><AnimNum value={results.meals} /></span>
          <span className="gc2-live-stat-l">מנות</span>
        </div>
      </div>
      <div className="gc2-live-bar-track">
        <div className="gc2-live-bar-fill" style={{ width: `${results.pct}%` }} />
      </div>
      <div className="gc2-live-range">
        <span>0%</span><span>ממוצע ישראלי 67%</span><span>100%</span>
      </div>
    </div>
  );
}

function ResultsView({ results, onLogin }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), 50); return () => clearTimeout(t); }, []);

  const CARDS = [
    { label: 'סה״כ מוזמנים',       value: results.total,     sub: 'בסגירת האולם' },
    { label: 'צפויים להגיע',       value: results.attending,  sub: 'לפי חישוב חכם', accent: true },
    { label: 'לא יגיעו',           value: results.declining,  sub: 'ביטולים צפויים' },
    { label: 'ביטולי יום האירוע',  value: results.noShows,   sub: '~9% מהמאשרים' },
    { label: 'יגיעו בפועל',        value: results.actual,    sub: 'נוכחות אמיתית', accent: true },
    { label: 'מנות לסגור',         value: results.meals,     sub: `+ רזרבה ${results.buffer}`, big: true, gold: true },
  ];

  return (
    <div className={`gc2-results ${shown ? 'in' : ''}`}>
      {/* Big ring */}
      <div className="gc2-res-ring-wrap">
        <div className="gc2-res-ring-card">
          <svg viewBox="0 0 140 140" className="gc2-res-svg">
            <circle cx="70" cy="70" r="58" fill="none" stroke="oklch(0.93 0.03 75)" strokeWidth="10"/>
            <circle cx="70" cy="70" r="58" fill="none" stroke="#C9A84C" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(results.pct / 100) * 364.4} 364.4`}
              style={{ transform:'rotate(-90deg)', transformOrigin:'70px 70px', transition:'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1) 0.3s' }}
            />
          </svg>
          <div className="gc2-res-ring-inner">
            <div className="gc2-res-pct"><AnimNum value={results.pct} />%</div>
            <div className="gc2-res-pct-label">אחוז הגעה</div>
          </div>
        </div>
        <div className="gc2-res-ring-context">
          <h3 className="gc2-res-context-title">
            {results.pct >= 72 ? 'מעל הממוצע! 🎉' : results.pct >= 60 ? 'אחוז ממוצע ✅' : 'מתחת לממוצע ⚠️'}
          </h3>
          <p className="gc2-res-context-desc">
            {results.pct >= 72
              ? 'האירוע שלכם צפוי למשוך קהל מגובש. הרשימה שלכם חזקה!'
              : results.pct >= 60
              ? 'אחוז הגעה סביר לחתונה ישראלית. שקלו לשלוח תזכורות.'
              : 'כדאי לשקול B-list, לשלוח הזמנות מוקדם יותר, או לחזק קשרים.'}
          </p>
          <div className="gc2-res-avg-bar">
            <div className="gc2-res-avg-track">
              <div className="gc2-res-avg-mark" style={{ right: '33%' }} title="ממוצע ישראלי 67%" />
              <div className="gc2-res-avg-fill" style={{ width: `${results.pct}%` }} />
            </div>
            <div className="gc2-res-avg-labels">
              <span>0%</span><span>ממוצע 67%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="gc2-res-cards">
        {CARDS.map((c, i) => (
          <div key={i} className={`gc2-res-card ${c.accent ? 'accent' : ''} ${c.gold ? 'gold' : ''}`}
               style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="gc2-res-val"><AnimNum value={c.value} /></div>
            <div className="gc2-res-label">{c.label}</div>
            <div className="gc2-res-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      {results.breakdown.length > 0 && (
        <div className="gc2-breakdown-card">
          <h4 className="gc2-breakdown-title">פילוח לפי קטגוריה</h4>
          <div className="gc2-breakdown-bar">
            {results.breakdown.filter(b => b.value > 0).map((b, i) => (
              <div key={i} className="gc2-bar-seg"
                   style={{ width: `${(b.value / results.attending) * 100}%`, background: b.color }}
                   title={`${b.label}: ${b.value}`} />
            ))}
          </div>
          <div className="gc2-breakdown-rows">
            {results.breakdown.map((b, i) => (
              <div key={i} className="gc2-breakdown-row">
                <div className="gc2-breakdown-left">
                  <span className="gc2-breakdown-dot" style={{ background: b.color }} />
                  <span className="gc2-breakdown-lbl">{b.label}</span>
                </div>
                <div className="gc2-breakdown-right">
                  <span className="gc2-breakdown-invited">{b.invited} מוזמנים</span>
                  <span className="gc2-breakdown-arrow">→</span>
                  <span className="gc2-breakdown-val">{b.value} יגיעו</span>
                  <span className="gc2-breakdown-rate" style={{ color: b.color }}>{b.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="gc2-insights">
        <div className="gc2-insight">
          <span className="gc2-insight-icon">💡</span>
          <div><strong>רזרבת מנות:</strong> {results.buffer} מנות ({Math.round((results.buffer / results.meals) * 100)}%) מעל הצפי — הסטנדרט הישראלי.</div>
        </div>
        <div className="gc2-insight">
          <span className="gc2-insight-icon">📱</span>
          <div><strong>טיפ:</strong> שלחו תזכורת WhatsApp 48 שעות לפני — מוריד no-show ב-30%.</div>
        </div>
      </div>

      {/* CTA */}
      <div className="gc2-res-cta">
        <div className="gc2-res-cta-badge">✨ הכלי הבא</div>
        <h3 className="gc2-res-cta-title">רוצים לדעת באמת מי מגיע?</h3>
        <p className="gc2-res-cta-desc">
          עברו לאישורי הגעה חכמים עם Choko — שלחו הזמנות WhatsApp,
          קבלו אישורים דיגיטליים ועקבו אחרי כל אורח בזמן אמת.
        </p>
        <div className="gc2-res-cta-btns">
          <button className="gc2-cta-primary" onClick={onLogin}>התחל עכשיו — חינם</button>
          <button className="gc2-cta-secondary" onClick={onLogin}>נהל מוזמנים ←</button>
        </div>
        <div className="gc2-res-cta-trust">✓ ללא כרטיס אשראי &nbsp;·&nbsp; ✓ בעברית &nbsp;·&nbsp; ✓ מוכן תוך דקה</div>
      </div>
    </div>
  );
}

// ── Content sections ──────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: 'כמה אחוז מהמוזמנים באמת מגיעים?', a: 'בממוצע ישראלי — 65–72%. משפחה קרובה מגיעה ב-90%+, קולגות ב-40–50% בלבד.' },
  { q: 'כמה מנות לסגור עם האולם?', a: 'המקובל: 8–12% מעל המאשרים הסופי. אם 180 אישרו — סגרו על 194–200 מנות.' },
  { q: 'למה לא כולם עונים להזמנה?', a: 'שתי הסיבות העיקריות: לא ידעו שצריך לאשר, או שקיבלו את ההזמנה מאוחר מדי.' },
  { q: 'מתי הכי טוב לשלוח הזמנות?', a: 'חודש וחצי עד חודשיים לפני — נותן זמן לתכנן אבל לא נשכח.' },
  { q: 'איך Choko עוזרת לעקוב?', a: 'שולחים הזמנות WhatsApp, האורחים מאשרים בלחיצה, ורואים הכל בזמן אמת בדשבורד.' },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`gc2-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="gc2-faq-q">
        <span>{item.q}</span>
        <span className="gc2-faq-arrow">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="gc2-faq-a">{item.a}</div>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GuestCalculator({ navigate, onLogin }) {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [step, setStep]     = useState(0);
  const calcRef             = useRef(null);

  const setField = (k, v) => setInputs(p => ({ ...p, [k]: v }));

  const results = useMemo(() => calculate(inputs), [inputs]);
  const total   = useMemo(() =>
    ['closeFamily','distantFamily','bridesFriends','groomsFriends','workColleagues','parentsGuests','children']
      .reduce((s, k) => s + (inputs[k] || 0), 0),
    [inputs]
  );

  const scrollToCalc = () => {
    calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExample = () => {
    setInputs(SAMPLE_INPUTS);
    setStep(0);
    scrollToCalc();
  };

  const doLogin = onLogin || (() => navigate?.({ page: 'login' }));

  return (
    <>
      <SEOMeta />
      <div className="gc2-page">

        {/* ── Nav ── */}
        <nav className="gc2-nav">
          <div className="gc2-nav-inner">
            <button className="gc2-logo" onClick={() => navigate?.({ page: 'landing' })}>
              choko<span className="gc2-logo-dot" />
            </button>
            <div className="gc2-nav-end">
              <button className="gc2-nav-ghost" onClick={doLogin}>כניסה</button>
              <button className="gc2-nav-fill" onClick={doLogin}>התחל חינם</button>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="gc2-hero">
          <div className="gc2-hero-orb gc2-hero-orb--a" />
          <div className="gc2-hero-orb gc2-hero-orb--b" />
          <div className="gc2-hero-orb gc2-hero-orb--c" />
          <div className="gc2-hero-inner">
            <div className="gc2-hero-badge">
              <span className="gc2-badge-dot" />
              מחשבון חכם לזוגות מתחתנים בישראל
            </div>
            <h1 className="gc2-hero-h1">
              כמה מוזמנים<br />
              <span className="gc2-hero-h1-gold">באמת יגיעו?</span>
            </h1>
            <p className="gc2-hero-sub">
              מחשבון שמעריך הגעה אמיתית לפי סוג המוזמנים,
              מיקום האירוע והרגלי RSVP בישראל
            </p>
            <div className="gc2-hero-ctas">
              <button className="gc2-hero-cta-primary" onClick={scrollToCalc}>
                <span>התחילו לחשב</span>
                <span>←</span>
              </button>
              <button className="gc2-hero-cta-ghost" onClick={handleExample}>
                ראו דוגמה
              </button>
            </div>
            {/* Floating stats card */}
            <div className="gc2-hero-float-card">
              <div className="gc2-float-row">
                <div className="gc2-float-stat">
                  <div className="gc2-float-n">147</div>
                  <div className="gc2-float-l">מוזמנים</div>
                </div>
                <div className="gc2-float-arrow">→</div>
                <div className="gc2-float-stat accent">
                  <div className="gc2-float-n">98</div>
                  <div className="gc2-float-l">יגיעו</div>
                </div>
                <div className="gc2-float-badge">67%</div>
              </div>
              <div className="gc2-float-bar">
                <div className="gc2-float-bar-fill" style={{ width: '67%' }} />
              </div>
              <div className="gc2-float-sub">חיזוי מבוסס נתוני אירועים ישראליים</div>
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <div className="gc2-trust-bar">
          <div className="gc2-trust-inner">
            {[
              { icon: '📊', text: 'מבוסס על נתוני אלפי חתונות בישראל' },
              { icon: '💰', text: 'עוזר לזוגות לחסוך אלפי שקלים באולם' },
              { icon: '⚡', text: 'חיזוי חכם לפני סגירת מספר המנות' },
            ].map((t, i) => (
              <div key={i} className="gc2-trust-item">
                <span className="gc2-trust-icon">{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Calculator ── */}
        <div className="gc2-calc-section" ref={calcRef}>
          <div className="gc2-calc-container">

            {/* Step progress */}
            <div className="gc2-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`gc2-step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                     onClick={() => i < step && setStep(i)}>
                  <div className="gc2-step-num">{i < step ? '✓' : i + 1}</div>
                  <div className="gc2-step-label">{s}</div>
                  {i < STEPS.length - 1 && <div className="gc2-step-line" />}
                </div>
              ))}
            </div>

            <div className="gc2-calc-layout">
              {/* Main form area */}
              <div className="gc2-form-col">

                {/* Step 0 — Guest categories */}
                {step === 0 && (
                  <div className="gc2-step-body">
                    <div className="gc2-step-header">
                      <h2 className="gc2-step-title">כמה מוזמנים לפי קטגוריה?</h2>
                      <p className="gc2-step-desc">כל קטגוריה מגיעה בשיעור שונה — הזיזו את הסליידר</p>
                    </div>
                    <div className="gc2-cat-list">
                      {CATEGORIES.map(cat => (
                        <GuestSlider key={cat.key} cat={cat} value={inputs[cat.key]} onChange={setField} />
                      ))}
                    </div>
                    <div className="gc2-step-footer">
                      <div className="gc2-total-pill">
                        <span>סה״כ: <strong>{total}</strong> מוזמנים</span>
                      </div>
                      <button className="gc2-next-btn" onClick={() => setStep(1)}>
                        המשך לפרטי האירוע ←
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 1 — Event details */}
                {step === 1 && (
                  <div className="gc2-step-body">
                    <div className="gc2-step-header">
                      <h2 className="gc2-step-title">פרטי האירוע</h2>
                      <p className="gc2-step-desc">אזור ועונה משפיעים על אחוז ההגעה</p>
                    </div>
                    <div className="gc2-option-section">
                      <div className="gc2-option-label">🗺️ אזור בארץ</div>
                      <div className="gc2-seg-grid gc2-seg-grid--5">
                        {REGIONS.map(opt => (
                          <SegCard key={opt.value} opt={opt} active={inputs.region === opt.value} onClick={() => setField('region', opt.value)} />
                        ))}
                      </div>
                    </div>
                    <div className="gc2-option-section">
                      <div className="gc2-option-label">📅 סוג / עונת האירוע</div>
                      <div className="gc2-seg-grid gc2-seg-grid--4">
                        {SEASONS.map(opt => (
                          <SegCard key={opt.value} opt={opt} active={inputs.season === opt.value} onClick={() => setField('season', opt.value)} />
                        ))}
                      </div>
                    </div>
                    <div className="gc2-step-footer">
                      <button className="gc2-back-btn" onClick={() => setStep(0)}>← חזרה</button>
                      <button className="gc2-next-btn" onClick={() => setStep(2)}>המשך לרמת קשר ←</button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Relationship */}
                {step === 2 && (
                  <div className="gc2-step-body">
                    <div className="gc2-step-header">
                      <h2 className="gc2-step-title">רמת קשר ותזמון</h2>
                      <p className="gc2-step-desc">שני גורמים שמשפיעים מאד על שיעור ההגעה</p>
                    </div>
                    <div className="gc2-option-section">
                      <div className="gc2-option-label">📬 כמה זמן מראש שולחים הזמנות?</div>
                      <div className="gc2-chips-row">
                        {NOTICE_OPTIONS.map(opt => (
                          <Chip key={opt.value} opt={opt} active={inputs.notice === opt.value} onClick={() => setField('notice', opt.value)} />
                        ))}
                      </div>
                    </div>
                    <div className="gc2-option-section">
                      <div className="gc2-option-label">🤝 רמת קשר ממוצעת עם המוזמנים</div>
                      <div className="gc2-chips-row">
                        {REL_OPTIONS.map(opt => (
                          <Chip key={opt.value} opt={opt} active={inputs.relationship === opt.value} onClick={() => setField('relationship', opt.value)} />
                        ))}
                      </div>
                    </div>
                    <div className="gc2-modifiers-explain">
                      <div className="gc2-mod-title">השפעה על אחוז ההגעה:</div>
                      <div className="gc2-mod-chips">
                        {[
                          `אזור: ${REGION_MOD[inputs.region] >= 0 ? '+' : ''}${Math.round(REGION_MOD[inputs.region] * 100)}%`,
                          `עונה: ${SEASON_MOD[inputs.season] >= 0 ? '+' : ''}${Math.round(SEASON_MOD[inputs.season] * 100)}%`,
                          `תזמון: ${NOTICE_MOD[inputs.notice] >= 0 ? '+' : ''}${Math.round(NOTICE_MOD[inputs.notice] * 100)}%`,
                          `קשר: ${REL_MOD[inputs.relationship] >= 0 ? '+' : ''}${Math.round(REL_MOD[inputs.relationship] * 100)}%`,
                        ].map(t => <span key={t} className="gc2-mod-chip">{t}</span>)}
                      </div>
                    </div>
                    <div className="gc2-step-footer">
                      <button className="gc2-back-btn" onClick={() => setStep(1)}>← חזרה</button>
                      <button className="gc2-calc-btn" onClick={() => setStep(3)}>
                        ← חשב תוצאות
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Results */}
                {step === 3 && (
                  <div className="gc2-step-body">
                    <ResultsView results={results} onLogin={doLogin} />
                    <div className="gc2-step-footer" style={{ marginTop: 24 }}>
                      <button className="gc2-back-btn" onClick={() => setStep(2)}>← ערוך נתונים</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Live panel */}
              <div className="gc2-panel-col">
                <LivePanel results={results} total={total} visible={step < 3} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content sections ── */}
        <div className="gc2-content-section">
          <div className="gc2-content-container">

            <div className="gc2-content-grid">
              {[
                {
                  icon: '📋', title: 'איך זה עובד?',
                  body: 'הזינו כמות מוזמנים לפי קטגוריה (משפחה, חברים, קולגות), בחרו אזור, עונה ורמת קשר — המחשבון מחשב שיעורי הגעה ריאליים ומחזיר לכם מספר מנות מומלץ.'
                },
                {
                  icon: '🤔', title: 'למה אנשים לא מגיעים?',
                  body: 'שלושת הגורמים העיקריים: מרחק גיאוגרפי (כל 50 ק"מ = 4-6% ירידה), תזמון מאוחר של ההזמנה, ועוצמת הקשר עם הזוג. קולגות עם קשר לא אישי מגיעים פחות מ-50%.'
                },
                {
                  icon: '💰', title: 'איך לחסוך אלפי שקלים?',
                  body: 'כל מנה עולה 200-400₪. זוגות שמזמינים 250 ואמורים לקבל 160 — וסוגרים על 250 מנות — מפסידים 18,000-36,000₪ מיותר. מחשבון חכם חוסך בממוצע 15,000₪.'
                },
                {
                  icon: '⏰', title: 'מתי לבקש אישור הגעה?',
                  body: 'שלחו הזמנה חודש וחצי לפני, תזכורת שבועיים לפני, וסגרו רשימה שבוע לפני האירוע. אישורי הגעה דיגיטליים עם Choko מקלים על כל התהליך.'
                },
              ].map((c, i) => (
                <div key={i} className="gc2-content-card">
                  <div className="gc2-content-icon">{c.icon}</div>
                  <h3 className="gc2-content-title">{c.title}</h3>
                  <p className="gc2-content-body">{c.body}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="gc2-faq-section">
              <h2 className="gc2-faq-title">שאלות נפוצות</h2>
              <div className="gc2-faq-list">
                {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="gc2-bottom-cta">
          <div className="gc2-bottom-cta-inner">
            <div className="gc2-bottom-icon">💍</div>
            <h2 className="gc2-bottom-title">מוכנים לנהל אישורי הגעה בצורה חכמה?</h2>
            <p className="gc2-bottom-desc">הצטרפו ל-50,000+ זוגות שכבר ניהלו את האירוע שלהם עם Choko</p>
            <button className="gc2-hero-cta-primary" onClick={doLogin}>התחל חינם ←</button>
            <div className="gc2-bottom-trust">✓ חינם לחלוטין &nbsp;·&nbsp; ✓ ללא כרטיס אשראי &nbsp;·&nbsp; ✓ בעברית</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="gc2-footer">
          <button className="gc2-logo" style={{ cursor: 'default' }} onClick={() => {}}>
            choko<span className="gc2-logo-dot" />
          </button>
          <span className="gc2-footer-copy">© 2026 כל הזכויות שמורות</span>
        </footer>

      </div>
    </>
  );
}

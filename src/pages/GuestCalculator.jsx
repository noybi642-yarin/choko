import { useState, useEffect, useRef } from 'react';

// ── SEO ──────────────────────────────────────────────────────────────────────

function SEOMeta() {
  useEffect(() => {
    document.title = 'מחשבון מוזמנים לחתונה | כמה באמת יגיעו? | Choko';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = 'גלו כמה מוזמנים באמת יגיעו לחתונה שלכם. מחשבון חכם לזוגות מתחתנים בישראל + אישורי הגעה דיגיטליים.';
    return () => { document.title = 'choko'; };
  }, []);
  return null;
}

// ── Calculation Engine ────────────────────────────────────────────────────────

const BASE_RATES = {
  closeFamily:    0.93,
  distantFamily:  0.76,
  bridesFriends:  0.68,
  groomsFriends:  0.68,
  workColleagues: 0.42,
  parentsGuests:  0.71,
  children:       0.88,
};

const REGION_MOD   = { center: 0, north: -0.06, south: -0.06, jerusalem: -0.04, mixed: -0.03 };
const SEASON_MOD   = { summer: -0.04, winter: -0.06, friday: +0.06, evening: 0 };
const NOTICE_MOD   = { twoMonths: +0.04, oneMonth: 0, twoWeeks: -0.10 };
const REL_MOD      = { close: +0.06, medium: 0, weak: -0.12 };

function calculate(inp) {
  const { closeFamily, distantFamily, bridesFriends, groomsFriends,
          workColleagues, parentsGuests, children,
          region, season, notice, relationship } = inp;

  const mod = (REGION_MOD[region] || 0) + (SEASON_MOD[season] || 0)
            + (NOTICE_MOD[notice] || 0) + (REL_MOD[relationship] || 0);

  const cap = r => Math.min(0.97, Math.max(0.08, r + mod));

  const attending = Math.round(
    closeFamily    * cap(BASE_RATES.closeFamily)    +
    distantFamily  * cap(BASE_RATES.distantFamily)  +
    bridesFriends  * cap(BASE_RATES.bridesFriends)  +
    groomsFriends  * cap(BASE_RATES.groomsFriends)  +
    workColleagues * cap(BASE_RATES.workColleagues) +
    parentsGuests  * cap(BASE_RATES.parentsGuests)  +
    children       * cap(BASE_RATES.children)
  );

  const total     = closeFamily + distantFamily + bridesFriends + groomsFriends
                  + workColleagues + parentsGuests + children;
  const declining = Math.max(0, total - attending);
  const noShows   = Math.round(attending * 0.09);
  const actual    = attending - noShows;
  const meals     = Math.ceil(actual * 1.08 / 5) * 5;
  const buffer    = meals - actual;
  const pct       = total > 0 ? Math.round((attending / total) * 100) : 0;

  // Breakdown by category (for chart)
  const breakdown = [
    { label: 'משפחה קרובה',  value: Math.round(closeFamily    * cap(BASE_RATES.closeFamily)),    color: '#e8645a' },
    { label: 'משפחה רחוקה',  value: Math.round(distantFamily  * cap(BASE_RATES.distantFamily)),  color: '#f59e0b' },
    { label: "חברי הכלה",   value: Math.round(bridesFriends  * cap(BASE_RATES.bridesFriends)),  color: '#8b5cf6' },
    { label: "חברי החתן",   value: Math.round(groomsFriends  * cap(BASE_RATES.groomsFriends)),  color: '#6366f1' },
    { label: 'קולגות',        value: Math.round(workColleagues * cap(BASE_RATES.workColleagues)), color: '#14b8a6' },
    { label: 'מוזמני הורים',  value: Math.round(parentsGuests  * cap(BASE_RATES.parentsGuests)),  color: '#10b981' },
    { label: 'ילדים',         value: Math.round(children       * cap(BASE_RATES.children)),       color: '#f97316' },
  ].filter(b => b.value > 0);

  return { total, attending, declining, noShows, actual, meals, buffer, pct, breakdown };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NumInput({ label, name, value, onChange, emoji }) {
  return (
    <div className="gc-num-field">
      <div className="gc-num-label">
        <span className="gc-num-emoji">{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="gc-num-controls">
        <button type="button" className="gc-num-btn" onClick={() => onChange(name, Math.max(0, value - 5))}>−</button>
        <input
          type="number" min={0} max={999}
          value={value}
          onChange={e => onChange(name, Math.max(0, +e.target.value || 0))}
          className="gc-num-input"
        />
        <button type="button" className="gc-num-btn" onClick={() => onChange(name, value + 5)}>+</button>
      </div>
    </div>
  );
}

function OptionGroup({ label, name, value, options, onChange }) {
  return (
    <div className="gc-option-group">
      <div className="gc-option-label">{label}</div>
      <div className="gc-options">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`gc-option-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(name, opt.value)}
          >
            {opt.emoji && <span>{opt.emoji}</span>}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, accent, big, delay = 0 }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`gc-result-card ${accent ? 'gc-result-card--accent' : ''} ${big ? 'gc-result-card--big' : ''} ${shown ? 'is-visible' : ''}`}>
      <div className="gc-result-val">{value}</div>
      <div className="gc-result-label">{label}</div>
      {sub && <div className="gc-result-sub">{sub}</div>}
    </div>
  );
}

function BreakdownBar({ breakdown, total }) {
  if (!total) return null;
  return (
    <div className="gc-breakdown">
      <div className="gc-breakdown-title">פילוח לפי קטגוריה</div>
      <div className="gc-bar-track">
        {breakdown.map((b, i) => (
          <div
            key={i}
            className="gc-bar-seg"
            style={{ width: `${(b.value / total) * 100}%`, background: b.color }}
            title={`${b.label}: ${b.value}`}
          />
        ))}
      </div>
      <div className="gc-breakdown-legend">
        {breakdown.map((b, i) => (
          <div key={i} className="gc-legend-item">
            <span className="gc-legend-dot" style={{ background: b.color }} />
            <span className="gc-legend-label">{b.label}</span>
            <span className="gc-legend-n">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS = {
  closeFamily: 40, distantFamily: 30, bridesFriends: 30, groomsFriends: 30,
  workColleagues: 20, parentsGuests: 40, children: 20,
  region: 'center', season: 'evening', notice: 'oneMonth', relationship: 'medium',
};

export default function GuestCalculator({ navigate, onLogin }) {
  const [inputs, setInputs]     = useState(DEFAULT_INPUTS);
  const [results, setResults]   = useState(null);
  const [calculated, setCalc]   = useState(false);
  const resultsRef              = useRef(null);

  const setField = (k, v) => setInputs(p => ({ ...p, [k]: v }));

  const handleCalculate = () => {
    const r = calculate(inputs);
    setResults(r);
    setCalc(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const total = inputs.closeFamily + inputs.distantFamily + inputs.bridesFriends
              + inputs.groomsFriends + inputs.workColleagues + inputs.parentsGuests
              + inputs.children;

  return (
    <>
      <SEOMeta />
      <div className="gc-page" dir="rtl">

        {/* ── Nav ── */}
        <nav className="gc-nav">
          <div className="gc-nav-inner">
            <button className="gc-logo" onClick={() => navigate({ page: 'landing' })}>
              choko<span className="gc-logo-dot" />
            </button>
            <div className="gc-nav-end">
              {onLogin && (
                <>
                  <button className="lp-nav-btn lp-nav-btn--ghost" onClick={onLogin}>כניסה</button>
                  <button className="lp-nav-btn lp-nav-btn--fill" onClick={onLogin}>התחל חינם</button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="gc-hero">
          <div className="gc-hero-orb gc-hero-orb--a" />
          <div className="gc-hero-orb gc-hero-orb--b" />
          <div className="gc-hero-inner">
            <div className="gc-eyebrow">
              <span className="gc-eyebrow-dot" />
              כלי חינמי לזוגות מתחתנים
            </div>
            <h1 className="gc-h1">
              כמה מוזמנים<br />
              <span className="gc-h1-grad">באמת יגיעו?</span>
            </h1>
            <p className="gc-hero-sub">
              מחשבון חכם שלוקח בחשבון עונה, מרחק, וסוג קשר —
              כדי שתדעו בדיוק כמה מנות לסגור עם האולם.
            </p>
            <div className="gc-hero-chips">
              <span className="gc-chip">✅ חינם לחלוטין</span>
              <span className="gc-chip">🇮🇱 מבוסס על חתונות ישראליות</span>
              <span className="gc-chip">⚡ תוצאות מיידיות</span>
            </div>
          </div>
        </header>

        {/* ── Calculator Card ── */}
        <div className="gc-container">
          <div className="gc-card">

            {/* Guest count inputs */}
            <div className="gc-section">
              <div className="gc-section-header">
                <div className="gc-section-icon">👥</div>
                <div>
                  <div className="gc-section-title">כמות מוזמנים לפי קטגוריה</div>
                  <div className="gc-section-sub">סה״כ: <strong>{total}</strong> מוזמנים</div>
                </div>
              </div>
              <div className="gc-num-grid">
                <NumInput label="משפחה קרובה"    name="closeFamily"    value={inputs.closeFamily}    onChange={setField} emoji="👨‍👩‍👧‍👦" />
                <NumInput label="משפחה רחוקה"    name="distantFamily"  value={inputs.distantFamily}  onChange={setField} emoji="👴" />
                <NumInput label="חברות הכלה"     name="bridesFriends"  value={inputs.bridesFriends}  onChange={setField} emoji="👰" />
                <NumInput label="חברים של החתן"  name="groomsFriends"  value={inputs.groomsFriends}  onChange={setField} emoji="🤵" />
                <NumInput label="עבודה / קולגות" name="workColleagues" value={inputs.workColleagues} onChange={setField} emoji="💼" />
                <NumInput label="מוזמני ההורים"  name="parentsGuests"  value={inputs.parentsGuests}  onChange={setField} emoji="🎩" />
                <NumInput label="ילדים"           name="children"       value={inputs.children}       onChange={setField} emoji="🧒" />
              </div>
            </div>

            <div className="gc-divider" />

            {/* Options */}
            <div className="gc-section">
              <div className="gc-section-header">
                <div className="gc-section-icon">⚙️</div>
                <div>
                  <div className="gc-section-title">פרטי האירוע</div>
                  <div className="gc-section-sub">משפיעים על אחוז ההגעה</div>
                </div>
              </div>
              <div className="gc-options-grid">
                <OptionGroup
                  label="אזור בארץ"
                  name="region"
                  value={inputs.region}
                  onChange={setField}
                  options={[
                    { value: 'center',    label: 'מרכז',     emoji: '🏙️' },
                    { value: 'north',     label: 'צפון',     emoji: '🌲' },
                    { value: 'south',     label: 'דרום',     emoji: '🌵' },
                    { value: 'jerusalem', label: 'ירושלים',  emoji: '🕌' },
                    { value: 'mixed',     label: 'מעורב',    emoji: '🗺️' },
                  ]}
                />
                <OptionGroup
                  label="סוג / עונת האירוע"
                  name="season"
                  value={inputs.season}
                  onChange={setField}
                  options={[
                    { value: 'evening', label: 'ערב רגיל',      emoji: '🌙' },
                    { value: 'friday',  label: 'שישי צהריים',   emoji: '☀️' },
                    { value: 'summer',  label: 'חתונת קיץ',     emoji: '🌞' },
                    { value: 'winter',  label: 'חתונת חורף',    emoji: '🌧️' },
                  ]}
                />
                <OptionGroup
                  label="כמה זמן מראש שולחים הזמנות"
                  name="notice"
                  value={inputs.notice}
                  onChange={setField}
                  options={[
                    { value: 'twoMonths', label: 'חודשיים',   emoji: '📅' },
                    { value: 'oneMonth',  label: 'חודש',      emoji: '🗓️' },
                    { value: 'twoWeeks',  label: 'שבועיים',   emoji: '⚡' },
                  ]}
                />
                <OptionGroup
                  label="רמת הקשר הממוצעת עם המוזמנים"
                  name="relationship"
                  value={inputs.relationship}
                  onChange={setField}
                  options={[
                    { value: 'close',  label: 'קרובה',   emoji: '❤️' },
                    { value: 'medium', label: 'בינונית', emoji: '🤝' },
                    { value: 'weak',   label: 'חלשה',    emoji: '👋' },
                  ]}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="gc-calc-cta">
              <button className="gc-calc-btn" onClick={handleCalculate}>
                <span>חשב לי עכשיו</span>
                <span className="gc-calc-btn-arrow">←</span>
              </button>
              {total > 0 && (
                <div className="gc-calc-hint">
                  {total} מוזמנים · תוצאות מיידיות
                </div>
              )}
            </div>
          </div>

          {/* ── Results ── */}
          {calculated && results && (
            <div className="gc-results" ref={resultsRef}>
              <div className="gc-results-header">
                <h2 className="gc-results-title">תוצאות החישוב</h2>
                <p className="gc-results-sub">
                  על בסיס {results.total} מוזמנים, ממוצע ישראלי, ופרטי האירוע שלך
                </p>
              </div>

              {/* Big attendance rate */}
              <div className="gc-pct-ring-wrap">
                <div className="gc-pct-ring">
                  <svg viewBox="0 0 120 120" className="gc-ring-svg">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.92 0.04 60)" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke="var(--coral)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(results.pct / 100) * 326.7} 326.7`}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
                    />
                  </svg>
                  <div className="gc-ring-label">
                    <div className="gc-ring-pct">{results.pct}%</div>
                    <div className="gc-ring-sub">יגיעו</div>
                  </div>
                </div>
                <div className="gc-pct-context">
                  <div className="gc-pct-title">אחוז הגעה משוער</div>
                  <div className="gc-pct-desc">
                    {results.pct >= 75 ? '🎉 מעל הממוצע! אירוע מצוין עם קהל מגובש.' :
                     results.pct >= 60 ? '✅ אחוז הגעה ממוצע לחתונה ישראלית.' :
                     '⚠️ אחוז נמוך — שקול להרחיב את רשימת ה-B list.'}
                  </div>
                  <div className="gc-pct-avg">ממוצע ישראלי: 65–72%</div>
                </div>
              </div>

              {/* Result cards grid */}
              <div className="gc-result-cards">
                <ResultCard label="סה״כ מוזמנים"       value={results.total}     delay={0}   />
                <ResultCard label="צפויים להגיע"       value={results.attending}  delay={80}  accent />
                <ResultCard label="צפויים לא להגיע"    value={results.declining}  delay={160} />
                <ResultCard label="ביטולי יום האירוע"  value={results.noShows}   delay={240} sub="~9% מהמאשרים" />
                <ResultCard label="יגיעו בפועל"         value={results.actual}    delay={320} accent />
                <ResultCard label="מנות מומלצות לסגור" value={results.meals}     delay={400} big accent sub={`כולל רזרבה של ${results.buffer} מנות`} />
              </div>

              {/* Breakdown bar */}
              <BreakdownBar breakdown={results.breakdown} total={results.attending} />

              {/* Insight chips */}
              <div className="gc-insights">
                <div className="gc-insight-card">
                  <div className="gc-insight-icon">💡</div>
                  <div>
                    <strong>טיפ:</strong> {results.buffer} מנות רזרבה זה {Math.round((results.buffer / results.meals) * 100)}% מהסגירה — המספר הנכון להמנע מחסר באוכל.
                  </div>
                </div>
                <div className="gc-insight-card">
                  <div className="gc-insight-icon">📱</div>
                  <div>
                    <strong>חשוב:</strong> שלח תזכורת WhatsApp 48 שעות לפני האירוע — זה מוריד את אחוז ה-no-show ב-30%.
                  </div>
                </div>
              </div>

              {/* Lead gen CTA */}
              <div className="gc-lead-cta">
                <div className="gc-lead-cta-inner">
                  <div className="gc-lead-cta-emoji">📋</div>
                  <h3 className="gc-lead-title">רוצים לדעת בדיוק מי מגיע?</h3>
                  <p className="gc-lead-sub">
                    נהלו אישורי הגעה אמיתיים עם Choko — שלחו הזמנות WhatsApp,
                    קבלו אישורים דיגיטליים, ועקבו אחרי כל אורח בזמן אמת.
                  </p>
                  <div className="gc-lead-btns">
                    <button className="gc-lead-btn-primary" onClick={onLogin || (() => navigate({ page: 'login' }))}>
                      התחל עכשיו — חינם
                    </button>
                    <button className="gc-lead-btn-secondary" onClick={onLogin || (() => navigate({ page: 'login' }))}>
                      נהל מוזמנים →
                    </button>
                  </div>
                  <div className="gc-lead-trust">✓ ללא כרטיס אשראי &nbsp;·&nbsp; ✓ בעברית &nbsp;·&nbsp; ✓ מוכן תוך דקה</div>
                </div>
              </div>
            </div>
          )}

          {/* ── SEO Article ── */}
          <article className="gc-article">
            <h2 className="gc-article-h2">כמה מוזמנים באמת מגיעים לחתונה בישראל?</h2>
            <p className="gc-article-lead">
              שאלת המיליון דולר של כל זוג מתחתן: אנחנו מזמינים 200 אנשים — כמה יגיעו?
              הנה המדריך המלא, מבוסס על נתוני חתונות ישראליות.
            </p>

            <div className="gc-article-sections">

              <div className="gc-article-section">
                <h3>איך לחשב מוזמנים לחתונה?</h3>
                <p>
                  הנוסחה הפשוטה: חלקו את המוזמנים לקטגוריות וכפלו כל קטגוריה בשיעור ההגעה הממוצע שלה.
                  משפחה קרובה? כ-93%. חברי עבודה? כ-40-50%. מוזמני ההורים? כ-70%.
                </p>
                <div className="gc-article-table">
                  <div className="gc-table-row gc-table-header">
                    <span>קטגוריה</span><span>אחוז הגעה ממוצע</span>
                  </div>
                  {[
                    ['משפחה קרובה', '90–95%'],
                    ['משפחה רחוקה', '72–80%'],
                    ['חברים קרובים', '65–75%'],
                    ['מוזמני הורים', '68–75%'],
                    ['קולגות / עבודה', '38–50%'],
                    ['היכרויות כלליות', '40–55%'],
                  ].map(([k, v]) => (
                    <div key={k} className="gc-table-row">
                      <span>{k}</span><span className="gc-table-pct">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gc-article-section">
                <h3>למה אנשים לא מגיעים לחתונות?</h3>
                <p>הסיבות הנפוצות ביותר לאי-הגעה לחתונות בישראל:</p>
                <div className="gc-article-bullets">
                  {[
                    ['📍 מרחק גיאוגרפי', 'כל 50 ק"מ מוסיפים כ-4-6% ירידה בהגעה.'],
                    ['📅 עיתוי', 'שישי צהריים? נוח יותר לכולם. שישי ערב בפסח? לא.'],
                    ['🤝 עוצמת הקשר', 'מי שמכיר אתכם 3 שנים לא יסע 100 ק"מ.'],
                    ['🗓️ שליחת הזמנות מאוחרת', 'שבועיים לפני = 10% פחות הגעה.'],
                    ['☀️ חום קיצי', 'אוגוסט בישראל — חלק פשוט נוסעים לחו"ל.'],
                  ].map(([icon, text]) => (
                    <div key={icon} className="gc-article-bullet">
                      <span className="gc-bullet-icon">{icon.split(' ')[0]}</span>
                      <div><strong>{icon.substring(3)}</strong> — {text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gc-article-section">
                <h3>כמה רזרבה מנות צריך לסגור עם האולם?</h3>
                <p>
                  הכלל המקובל בישראל: <strong>8–12% מעל</strong> מספר המאשרים הסופי.
                  אם 180 אנשים אישרו — סגרו על 195–200 מנות. עדיף 10 מנות מיותרות מאשר
                  אורח שיצא רעב.
                </p>
                <div className="gc-article-callout">
                  <strong>💡 טיפ חשוב:</strong> קחו בחשבון שגם מבין המאשרים, ~9%
                  לא יגיעו ביום האירוע עצמו (חולה, טיסה, ילד חולה). זה "no-show ישראלי"
                  נורמלי לחלוטין.
                </div>
              </div>

              <div className="gc-article-section">
                <h3>מתי לבקש אישור הגעה?</h3>
                <div className="gc-timeline">
                  {[
                    ['חודשיים לפני', 'שלחו הזמנה דיגיטלית ראשונה'],
                    ['חודש לפני',    'תזכורת עדינה לכל מי שלא ענה'],
                    ['שבועיים לפני', 'ספירה סופית — עצרו עדכוני רשימה'],
                    ['שבוע לפני',    'אישרו מספר מנות סופי עם האולם'],
                    ['יומיים לפני',  'WhatsApp אחרון: "מחכים לראותכם!"'],
                  ].map(([time, action], i) => (
                    <div key={i} className="gc-timeline-item">
                      <div className="gc-timeline-dot" />
                      <div className="gc-timeline-content">
                        <strong>{time}</strong>
                        <span>{action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gc-article-section">
                <h3>איך Choko עוזר לנהל מוזמנים?</h3>
                <p>
                  Choko היא מערכת ניהול מוזמנים ישראלית שמאפשרת לשלוח הזמנות WhatsApp,
                  לקבל אישורי הגעה דיגיטליים, ולראות בזמן אמת כמה אנשים מגיעים.
                </p>
                <div className="gc-feature-chips">
                  {['✅ שליחת הזמנות WhatsApp', '📊 מעקב אישורים בזמן אמת', '🎨 הזמנות מעוצבות', '📥 ייבוא מאקסל', '📱 מותאם לנייד', '🔔 תזכורות אוטומטיות'].map(f => (
                    <span key={f} className="gc-feature-chip">{f}</span>
                  ))}
                </div>
              </div>

            </div>
          </article>

          {/* Bottom CTA */}
          <div className="gc-bottom-cta">
            <h2>מוכנים לנהל את המוזמנים בצורה חכמה?</h2>
            <p>הצטרפו ל-50,000+ זוגות שכבר ניהלו את האירוע שלהם עם Choko</p>
            <button className="gc-calc-btn" onClick={onLogin || (() => navigate({ page: 'login' }))}>
              התחל חינם ←
            </button>
          </div>

        </div>

        {/* Footer */}
        <footer className="gc-footer">
          <div className="gc-footer-inner">
            <span className="gc-logo" style={{ cursor: 'default' }}>choko<span className="gc-logo-dot" /></span>
            <span className="gc-footer-copy">© 2026 כל הזכויות שמורות</span>
          </div>
        </footer>

      </div>
    </>
  );
}

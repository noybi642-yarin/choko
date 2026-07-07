import { useState } from 'react';
import '../venue-reports.css';
import {
  TrendingUp, TrendingDown, CalendarCheck, Target, AlertTriangle,
  Sparkles, ArrowUpRight, Phone, ChevronLeft, Filter,
  BarChart2, Users, Flame, Clock, CircleDollarSign, Zap,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
// VenueReports — "דוחות" · executive business insights
// Mock data anchored to today = 2026-05-22. Pure CSS/SVG visuals, no chart libs.
// ══════════════════════════════════════════════════════════════════════════════

// ── Mock data ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { key: 'month',   label: 'החודש' },
  { key: 'quarter', label: 'רבעון' },
  { key: 'year',    label: 'שנה' },
];

const KPIS_BY_PERIOD = {
  month: {
    revenue: '₪1.24M', revenueTrend: '+18% מול אשתקד',
    events: '34', eventsSub: '6 החודש',
    conversion: '42%', benchmark: 'ממוצע ענף: 31%',
    atRisk: 3,
  },
  quarter: {
    revenue: '₪3.6M', revenueTrend: '+14% מול אשתקד',
    events: '52', eventsSub: '18 ברבעון',
    conversion: '39%', benchmark: 'ממוצע ענף: 31%',
    atRisk: 3,
  },
  year: {
    revenue: '₪11.8M', revenueTrend: '+22% מול אשתקד',
    events: '96', eventsSub: '61 מתחילת השנה',
    conversion: '37%', benchmark: 'ממוצע ענף: 31%',
    atRisk: 3,
  },
};

const AI_CHIPS = [
  { id: 1, icon: Flame,   text: 'מאי כמעט מלא — העלה תמחור לתאריכים שנותרו' },
  { id: 2, icon: Zap,     text: 'ימי חמישי בתפוסה 20% — שקול חבילת חמישי' },
  { id: 3, icon: Clock,   text: '2 הצעות מעל שבוע ללא מענה' },
  { id: 4, icon: Users,   text: 'מקור הלידים החזק ביותר החודש: המלצות (38%)' },
];

// Revenue forecast, ינו–יונ 2026 (₪K)
const REVENUE_FORECAST = [
  { month: 'ינו', confirmed: 480, expected: 60  },
  { month: 'פבר', confirmed: 520, expected: 90  },
  { month: 'מרץ', confirmed: 690, expected: 110 },
  { month: 'אפר', confirmed: 810, expected: 130 },
  { month: 'מאי', confirmed: 1140, expected: 100 },
  { month: 'יונ', confirmed: 460, expected: 280 },
];

const MONTHLY_PERF = [
  { month: 'ינואר',  events: 4, revenue: '₪540K',   occupancy: 45 },
  { month: 'פברואר', events: 5, revenue: '₪610K',   occupancy: 52 },
  { month: 'מרץ',    events: 6, revenue: '₪800K',   occupancy: 61 },
  { month: 'אפריל',  events: 7, revenue: '₪940K',   occupancy: 74 },
  { month: 'מאי',    events: 9, revenue: '₪1.24M',  occupancy: 92, best: true },
  { month: 'יוני',   events: 5, revenue: '₪740K',   occupancy: 58 },
];

const FUNNEL = [
  { label: 'לידים',   value: 64 },
  { label: 'פגישות',  value: 38 },
  { label: 'הצעות',   value: 25 },
  { label: 'חוזים',   value: 15 },
  { label: 'חתימות',  value: 12 },
];

const WEEKDAYS = [
  { day: 'א', value: 3  },
  { day: 'ב', value: 2  },
  { day: 'ג', value: 4  },
  { day: 'ד', value: 3  },
  { day: 'ה', value: 5  },
  { day: 'ו', value: 22 },
  { day: 'ש', value: 18 },
];

const OPEN_DATES = [
  { id: 1, date: 'שישי · 5 ביוני',   season: 'שיא עונה', value: '₪48K' },
  { id: 2, date: 'שבת · 13 ביוני',   season: 'שיא עונה', value: '₪45K' },
  { id: 3, date: 'שישי · 19 ביוני',  season: 'שיא עונה', value: '₪45K' },
  { id: 4, date: 'שבת · 4 ביולי',    season: 'שיא עונה', value: '₪46K' },
  { id: 5, date: 'שישי · 10 ביולי',  season: 'שיא עונה', value: '₪44K' },
];

const AT_RISK_DEALS = [
  { id: 1, couple: 'נועה & אורי',  stage: 'הצעת מחיר', reason: 'הצעה פתוחה 9 ימים',      severity: 'bad'  },
  { id: 2, couple: 'טל & רותם',   stage: 'אופציה',     reason: 'אופציה פגה מחר',          severity: 'bad'  },
  { id: 3, couple: 'מאיה & יונתן', stage: 'פגישה',      reason: 'אין תשובה אחרי פגישה',   severity: 'warn' },
];

const LEAD_SOURCES = [
  { label: 'המלצות',    pct: 38, color: '#4F46E5' },
  { label: 'אינסטגרם',  pct: 24, color: '#7C3AED' },
  { label: 'אתר',       pct: 20, color: '#0891B2' },
  { label: 'גוגל',      pct: 18, color: '#D97706' },
];

const BOTTLENECKS = [
  { id: 1, label: 'אישור תפריט ממוצע: 12 ימים',        status: 'bad',  rec: 'קבע דדליין של 7 ימים לאישור תפריט בחוזה' },
  { id: 2, label: 'זמן מענה ללידים: 9 שעות',            status: 'warn', rec: 'ליד שנענה תוך שעה ממיר פי 3 — הפעל מענה אוטומטי' },
  { id: 3, label: 'הושבה נסגרת 4 ימים לפני אירוע',      status: 'good', rec: 'בטווח תקין — שמור על הקצב' },
];

const SMART_RECS = [
  {
    id: 1,
    title: 'דחוף סגירת 3 תאריכי יוני הפתוחים',
    why: 'יוני חלש ב-40% מהממוצע, ויש 8 זוגות פעילים במשפך שטרם קיבלו הצעה לתאריך.',
    impact: '+₪120K פוטנציאל',
    cta: 'שלח הצעות ממוקדות',
  },
  {
    id: 2,
    title: 'קצר את זמן המענה ללידים מ-9 שעות לשעה',
    why: 'הנשירה הגדולה במשפך היא בין פגישה להצעה — מענה מהיר מכפיל את שיעור ההתקדמות.',
    impact: '+5 חוזים ברבעון',
    cta: 'הפעל מענה אוטומטי',
  },
  {
    id: 3,
    title: 'בנה תוכנית המלצות מסודרת',
    why: 'המלצות הן 38% מהלידים וממירות פי 2.3 — כרגע אין תהליך יזום לבקשת המלצה.',
    impact: '+₪80K פוטנציאל',
    cta: 'צור תבנית בקשת המלצה',
  },
];

// ── Small building blocks ─────────────────────────────────────────────────────

function ReportCard({ title, icon: Icon, insight, action, onAction, children, wide }) {
  return (
    <section className={`vr-card${wide ? ' vr-card--wide' : ''}`}>
      <header className="vr-card-head">
        <h3 className="vr-card-title">
          {Icon && <Icon size={15} strokeWidth={2.1} />}
          {title}
        </h3>
      </header>
      <div className="vr-card-body">{children}</div>
      {(insight || action) && (
        <footer className="vr-card-foot">
          {insight && (
            <div className="vr-insight">
              <Sparkles size={12} strokeWidth={2.2} />
              <span><strong>כך זה משפיע:</strong> {insight}</span>
            </div>
          )}
          {action && (
            <button className="vr-action-chip" onClick={onAction}>
              {action}
              <ChevronLeft size={12} />
            </button>
          )}
        </footer>
      )}
    </section>
  );
}

// ── KPI row ───────────────────────────────────────────────────────────────────

function KpiRow({ period }) {
  const d = KPIS_BY_PERIOD[period];
  return (
    <div className="vr-kpis">
      <div className="vr-kpi">
        <div className="vr-kpi-icon" style={{ color: '#16A34A', background: 'rgba(22,163,74,0.08)' }}>
          <CircleDollarSign size={17} />
        </div>
        <div className="vr-kpi-label">צפי הכנסות</div>
        <div className="vr-kpi-value">{d.revenue}</div>
        <div className="vr-kpi-sub vr-kpi-sub--up">
          <TrendingUp size={12} /> {d.revenueTrend}
        </div>
      </div>

      <div className="vr-kpi">
        <div className="vr-kpi-icon" style={{ color: 'var(--venue-primary)', background: 'rgba(79,70,229,0.07)' }}>
          <CalendarCheck size={17} />
        </div>
        <div className="vr-kpi-label">אירועים מאושרים</div>
        <div className="vr-kpi-value">{d.events}</div>
        <div className="vr-kpi-sub">{d.eventsSub}</div>
      </div>

      <div className="vr-kpi">
        <div className="vr-kpi-icon" style={{ color: 'var(--venue-violet)', background: 'rgba(124,58,237,0.07)' }}>
          <Target size={17} />
        </div>
        <div className="vr-kpi-label">המרה מליד לחוזה</div>
        <div className="vr-kpi-value">{d.conversion}</div>
        <div className="vr-kpi-sub vr-kpi-sub--up">
          <ArrowUpRight size={12} /> {d.benchmark}
        </div>
      </div>

      <div className="vr-kpi vr-kpi--risk">
        <div className="vr-kpi-icon" style={{ color: '#DC2626', background: 'rgba(220,38,38,0.08)' }}>
          <AlertTriangle size={17} />
        </div>
        <div className="vr-kpi-label">עסקאות בסיכון</div>
        <div className="vr-kpi-value vr-kpi-value--red">{d.atRisk}</div>
        <button className="vr-action-chip vr-action-chip--red">
          טפל עכשיו <ChevronLeft size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Revenue forecast bar chart ────────────────────────────────────────────────

function RevenueForecastChart() {
  const max = Math.max(...REVENUE_FORECAST.map(m => m.confirmed + m.expected));
  const total = REVENUE_FORECAST.reduce((s, m) => s + m.confirmed + m.expected, 0);
  return (
    <>
      <div className="vr-barchart" role="img" aria-label="תחזית הכנסות חודשית, ינואר עד יוני">
        {REVENUE_FORECAST.map(m => {
          const sum = m.confirmed + m.expected;
          return (
            <div key={m.month} className="vr-barchart-col" title={`${m.month}: ₪${sum}K`}>
              <div className="vr-barchart-total">₪{sum >= 1000 ? (sum / 1000).toFixed(1) + 'M' : sum + 'K'}</div>
              <div className="vr-barchart-stack">
                <div
                  className="vr-bar vr-bar--expected"
                  style={{ height: `${(m.expected / max) * 100}%` }}
                />
                <div
                  className="vr-bar vr-bar--confirmed"
                  style={{ height: `${(m.confirmed / max) * 100}%` }}
                />
              </div>
              <div className="vr-barchart-label">{m.month}</div>
            </div>
          );
        })}
      </div>
      <div className="vr-legend-row">
        <span className="vr-legend-item"><span className="vr-legend-swatch vr-legend-swatch--confirmed" />מאושר</span>
        <span className="vr-legend-item"><span className="vr-legend-swatch vr-legend-swatch--expected" />צפוי</span>
        <span className="vr-legend-total">סה"כ תחזית: ₪{(total / 1000).toFixed(2)}M</span>
      </div>
    </>
  );
}

// ── Monthly performance table ─────────────────────────────────────────────────

function MonthlyPerfTable() {
  return (
    <table className="vr-table">
      <thead>
        <tr>
          <th>חודש</th>
          <th>אירועים</th>
          <th>הכנסה</th>
          <th>תפוסה</th>
        </tr>
      </thead>
      <tbody>
        {MONTHLY_PERF.map(r => (
          <tr key={r.month} className={r.best ? 'vr-table-row--best' : ''}>
            <td>
              {r.month}
              {r.best && <span className="vr-best-badge">חודש שיא</span>}
            </td>
            <td className="vr-table-num">{r.events}</td>
            <td className="vr-table-num">{r.revenue}</td>
            <td>
              <div className="vr-occ">
                <div className="vr-occ-track">
                  <div className="vr-occ-fill" style={{ width: `${r.occupancy}%` }} />
                </div>
                <span className="vr-occ-num">{r.occupancy}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Conversion funnel ─────────────────────────────────────────────────────────

function ConversionFunnel() {
  const max = FUNNEL[0].value;
  return (
    <div className="vr-funnel">
      {FUNNEL.map((step, i) => {
        const prev = i > 0 ? FUNNEL[i - 1].value : null;
        const drop = prev ? Math.round((1 - step.value / prev) * 100) : null;
        const biggestLeak = i === 2; // פגישות → הצעות
        return (
          <div key={step.label}>
            {drop !== null && (
              <div className={`vr-funnel-drop${biggestLeak ? ' vr-funnel-drop--leak' : ''}`}>
                <TrendingDown size={11} />
                נשירה {drop}%
                {biggestLeak && <span className="vr-funnel-leak-tag">הנשירה הגדולה</span>}
              </div>
            )}
            <div className="vr-funnel-step">
              <span className="vr-funnel-label">{step.label}</span>
              <div className="vr-funnel-track">
                <div
                  className="vr-funnel-bar"
                  style={{ width: `${(step.value / max) * 100}%`, opacity: 1 - i * 0.13 }}
                >
                  <span className="vr-funnel-value">{step.value}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Popular weekdays ──────────────────────────────────────────────────────────

function WeekdayChart() {
  const max = Math.max(...WEEKDAYS.map(d => d.value));
  return (
    <div className="vr-days" role="img" aria-label="התפלגות אירועים לפי ימי השבוע">
      {WEEKDAYS.map(d => {
        const dominant = d.value === max || d.day === 'ש';
        return (
          <div key={d.day} className="vr-days-col" title={`יום ${d.day}: ${d.value} אירועים`}>
            <div className="vr-days-value">{d.value}</div>
            <div className="vr-days-stack">
              <div
                className={`vr-bar vr-days-bar${dominant ? ' vr-days-bar--hot' : ''}`}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <div className="vr-days-label">{d.day}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Lead sources donut ────────────────────────────────────────────────────────

function LeadSourcesDonut() {
  const R = 42, C = 2 * Math.PI * R;
  const GAP = 2; // percent of circumference reserved as gap per segment
  let offset = 25; // start at 12 o'clock
  return (
    <div className="vr-donut-wrap">
      <svg className="vr-donut" viewBox="0 0 110 110" role="img" aria-label="התפלגות מקורות לידים">
        {LEAD_SOURCES.map(s => {
          const seg = Math.max(s.pct - GAP, 0);
          const el = (
            <circle
              key={s.label}
              cx="55" cy="55" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${(seg / 100) * C} ${C}`}
              strokeDashoffset={(offset / 100) * C}
              className="vr-donut-seg"
            />
          );
          offset -= s.pct;
          return el;
        })}
        <text x="55" y="52" textAnchor="middle" className="vr-donut-center-num">64</text>
        <text x="55" y="66" textAnchor="middle" className="vr-donut-center-label">לידים החודש</text>
      </svg>
      <ul className="vr-donut-legend">
        {LEAD_SOURCES.map(s => (
          <li key={s.label}>
            <span className="vr-legend-swatch" style={{ background: s.color }} />
            <span className="vr-donut-legend-label">{s.label}</span>
            <span className="vr-donut-legend-pct">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VenueReports({ venue, navigate }) {
  const [period, setPeriod] = useState('month');

  return (
    <div className="vr-page">

      {/* ── Header ── */}
      <div className="vr-header">
        <div>
          <h1 className="vr-title">דוחות</h1>
          <p className="vr-subtitle">תמונת מצב עסקית · {venue?.name || 'האולם שלי'}</p>
        </div>
        <div className="vr-period" role="tablist" aria-label="בחירת תקופה">
          {PERIODS.map(p => (
            <button
              key={p.key}
              role="tab"
              aria-selected={period === p.key}
              className={`vr-period-btn${period === p.key ? ' active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Executive KPIs ── */}
      <KpiRow period={period} />

      {/* ── Choko AI strip ── */}
      <div className="vr-ai-strip">
        <div className="vr-ai-brand">
          <Sparkles size={13} />
          <span>Choko AI</span>
        </div>
        <div className="vr-ai-chips">
          {AI_CHIPS.map(c => {
            const Icon = c.icon;
            return (
              <button key={c.id} className="vr-ai-chip">
                <Icon size={12} strokeWidth={2.2} />
                {c.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Reports grid ── */}
      <div className="vr-grid">

        <ReportCard
          title="תחזית הכנסות חודשית"
          icon={BarChart2}
          insight="יוני חלש ב-40% — כדאי לדחוף אופציות פתוחות."
          action="דחוף אופציות ליוני"
        >
          <RevenueForecastChart />
        </ReportCard>

        <ReportCard
          title="ביצועים חודשיים"
          icon={TrendingUp}
          insight="מאי הוא חודש השיא — 92% תפוסה ופי 2.3 הכנסה מינואר."
          action="נתח את מאי"
        >
          <MonthlyPerfTable />
        </ReportCard>

        <ReportCard
          title="משפך המרה"
          icon={Filter}
          insight="הנשירה הגדולה: פגישה→הצעה (34%) — שם הולכים לאיבוד הכי הרבה זוגות."
          action="שפר מעקב אחרי פגישות"
        >
          <ConversionFunnel />
        </ReportCard>

        <ReportCard
          title="ימים פופולריים"
          icon={CalendarCheck}
          insight="חמישי מבוקש פחות — הזדמנות תמחור לחבילת אמצע שבוע."
          action="בנה חבילת חמישי"
        >
          <WeekdayChart />
        </ReportCard>

        <ReportCard
          title="תאריכים פנויים בעלי ערך"
          icon={Flame}
          insight="5 תאריכי שישי/שבת בשיא העונה עדיין פתוחים — שווי כולל ₪228K."
        >
          <ul className="vr-dates">
            {OPEN_DATES.map(d => (
              <li key={d.id} className="vr-dates-row">
                <div className="vr-dates-main">
                  <span className="vr-dates-date">{d.date}</span>
                  <span className="vr-dates-season">{d.season}</span>
                </div>
                <span className="vr-dates-value">{d.value}</span>
                <button className="venue-btn venue-btn--ghost venue-btn--sm">
                  הצע לזוג ממתין
                </button>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="עסקאות בסיכון"
          icon={AlertTriangle}
          insight="3 עסקאות בשווי משוער ₪135K עלולות להיסגר אצל מתחרים השבוע."
        >
          <ul className="vr-risk">
            {AT_RISK_DEALS.map(d => (
              <li key={d.id} className="vr-risk-row">
                <span className={`vr-dot vr-dot--${d.severity}`} />
                <div className="vr-risk-main">
                  <span className="vr-risk-couple">{d.couple}</span>
                  <span className="vr-risk-meta">{d.stage} · {d.reason}</span>
                </div>
                <button className="venue-btn venue-btn--primary venue-btn--sm">
                  <Phone size={11} /> התקשר עכשיו
                </button>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="מקורות לידים"
          icon={Users}
          insight="המלצות ממירות פי 2.3 — בקש המלצות אחרי כל אירוע."
          action="שלח בקשת המלצה"
        >
          <LeadSourcesDonut />
        </ReportCard>

        <ReportCard
          title="צווארי בקבוק תפעוליים"
          icon={Clock}
          insight="קיצור זמן המענה ללידים הוא המנוף המהיר ביותר לשיפור ההמרה."
        >
          <ul className="vr-bottlenecks">
            {BOTTLENECKS.map(b => (
              <li key={b.id} className="vr-bn-row">
                <span className={`vr-dot vr-dot--${b.status}`} />
                <div className="vr-bn-main">
                  <span className="vr-bn-label">{b.label}</span>
                  <span className="vr-bn-rec">{b.rec}</span>
                </div>
              </li>
            ))}
          </ul>
        </ReportCard>

      </div>

      {/* ── Smart recommendations ── */}
      <section className="vr-recs">
        <header className="vr-recs-head">
          <h2 className="vr-recs-title">
            <Sparkles size={16} />
            המלצות חכמות
          </h2>
          <span className="vr-recs-sub">שלוש הפעולות בעלות ההשפעה הגבוהה ביותר עכשיו</span>
        </header>
        <div className="vr-recs-list">
          {SMART_RECS.map((r, i) => (
            <article key={r.id} className="vr-rec">
              <span className="vr-rec-num">{i + 1}</span>
              <div className="vr-rec-body">
                <h3 className="vr-rec-title">{r.title}</h3>
                <p className="vr-rec-why">{r.why}</p>
                <div className="vr-rec-foot">
                  <span className="vr-rec-impact">{r.impact}</span>
                  <button className="venue-btn venue-btn--primary venue-btn--sm">
                    {r.cta} <ChevronLeft size={12} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

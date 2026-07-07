import { useMemo, useState } from 'react';
import '../venue-proposals.css';
import {
  Search, Eye, Phone, MessageCircle, Bell, Clock, AlertTriangle,
  FileText, Calendar, Users, TrendingUp, Sparkles, X, CheckCircle,
  ExternalLink, Flame, Send, Star, Zap, Hourglass, CalendarClock,
  PhoneCall, Handshake,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-22T12:00:00');

const STATUS = {
  sent:     { label: 'נשלחה',       color: '#2563EB', bg: 'rgba(37,99,235,0.09)',   border: 'rgba(37,99,235,0.22)' },
  opened:   { label: 'נפתחה',       color: '#7C3AED', bg: 'rgba(124,58,237,0.09)',  border: 'rgba(124,58,237,0.22)' },
  waiting:  { label: 'ממתינה',      color: '#6B5F8A', bg: 'rgba(107,95,138,0.09)',  border: 'rgba(107,95,138,0.22)' },
  followup: { label: 'דורשת מעקב',  color: '#D97706', bg: 'rgba(217,119,6,0.1)',    border: 'rgba(217,119,6,0.25)' },
  closed:   { label: 'נסגרה',       color: '#16A34A', bg: 'rgba(22,163,74,0.09)',   border: 'rgba(22,163,74,0.22)' },
  lost:     { label: 'אבדה',        color: '#9A93AC', bg: 'rgba(154,147,172,0.1)',  border: 'rgba(154,147,172,0.22)' },
};

const PAY_STATUS = {
  received: { label: 'התקבל', color: '#16A34A' },
  pending:  { label: 'ממתין', color: '#D97706' },
  late:     { label: 'באיחור', color: '#DC2626' },
  partial:  { label: 'חלקי',  color: '#2563EB' },
};

const OPEN_STATUSES = ['sent', 'opened', 'waiting', 'followup'];

// ── Mock data ─────────────────────────────────────────────────────────────────

const PROPOSALS = [
  {
    id: 'p1', couple: 'לירון & עומר', status: 'opened',
    eventDate: '2026-09-11', guests: 280, amount: 34000,
    sentDate: '2026-05-15', validUntil: '2026-06-05', viewedDaysAgo: 2,
    phone: '0521234567',
    payment: { paid: 0, total: 34000, status: 'pending' },
    nextAction: 'שלח תזכורת',
    notes: 'ביקשו הצעה למסלול פרימיום כולל בר אקטיבי. חשוב להם דיל על צלם.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '15 במאי' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '17 במאי' },
      { icon: Eye, text: 'נצפתה שוב', time: '20 במאי' },
    ],
  },
  {
    id: 'p2', couple: 'רון & מאיה', status: 'followup',
    eventDate: '2026-07-17', guests: 220, amount: 28000,
    sentDate: '2026-05-13', validUntil: '2026-05-24', viewedDaysAgo: 5,
    phone: '0537654321', payLink: true, hasOption: true,
    payment: { paid: 5000, total: 28000, status: 'pending' },
    nextAction: 'התקשר',
    notes: 'אופציה על 17.7 — פגה בעוד יומיים. מתלבטים מול מקום נוסף בשרון.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '13 במאי' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '14 במאי' },
      { icon: CalendarClock, text: 'אופציה נשמרה ל-17.7', time: '15 במאי' },
      { icon: Bell, text: 'תזכורת נשלחה', time: '19 במאי' },
    ],
  },
  {
    id: 'p3', couple: 'ענת & אלון', status: 'sent',
    eventDate: '2026-10-16', guests: 350, amount: 42000,
    sentDate: '2026-05-20', validUntil: '2026-06-10',
    phone: '0541112233',
    payment: { paid: 0, total: 42000, status: 'pending' },
    nextAction: 'קבע פגישה',
    notes: 'חתונה גדולה — 350 אורחים. מעוניינים בסיור נוסף עם ההורים.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '20 במאי' },
    ],
  },
  {
    id: 'p4', couple: 'דנה & איתי', status: 'opened',
    eventDate: '2026-08-21', guests: 180, amount: 25000,
    sentDate: '2026-05-19', validUntil: '2026-06-08', viewedDaysAgo: 1,
    phone: '0509876543', hasOption: true,
    payment: { paid: 0, total: 25000, status: 'pending' },
    nextAction: 'התקשר',
    notes: 'אופציה על 21.8. אוהבים את הגן — מחכים לאישור תקציב מההורים.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '19 במאי' },
      { icon: CalendarClock, text: 'אופציה נשמרה ל-21.8', time: '20 במאי' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '21 במאי' },
    ],
  },
  {
    id: 'p5', couple: 'גיא & תמר', status: 'waiting',
    eventDate: '2026-11-06', guests: 260, amount: 31000,
    sentDate: '2026-05-18', validUntil: '2026-06-01',
    phone: '0526677889', payLink: true, hasOption: true,
    payment: { paid: 5000, total: 31000, status: 'received' },
    nextAction: 'סגור עסקה',
    notes: 'שילמו מקדמת אופציה ₪5,000. ממתינים לטיוטת חוזה.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '18 במאי' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '18 במאי' },
      { icon: CheckCircle, text: 'מקדמת אופציה התקבלה', time: '19 במאי' },
    ],
  },
  {
    id: 'p6', couple: 'נועה & יובל', status: 'followup',
    eventDate: '2026-09-25', guests: 200, amount: 26000,
    sentDate: '2026-05-14', validUntil: '2026-05-28', viewedDaysAgo: 6,
    phone: '0533344556',
    payment: { paid: 0, total: 26000, status: 'late' },
    nextAction: 'שלח תזכורת',
    notes: 'בקשת מקדמה נשלחה לפני שבוע ולא שולמה. לא עונים לטלפון — לנסות וואטסאפ.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '14 במאי' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '16 במאי' },
      { icon: Bell, text: 'תזכורת נשלחה', time: '18 במאי' },
      { icon: AlertTriangle, text: 'בקשת מקדמה באיחור', time: '21 במאי' },
    ],
  },
  {
    id: 'p7', couple: 'שירה & דניאל', status: 'closed',
    eventDate: '2026-06-19', guests: 240, amount: 38000,
    sentDate: '2026-04-20', validUntil: '2026-05-05',
    phone: '0547788990', payLink: true,
    payment: { paid: 15000, total: 38000, status: 'partial' },
    nextAction: '—',
    notes: 'נסגרה! יתרה של ₪23,000 עד שבועיים לפני האירוע.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '20 באפריל' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '21 באפריל' },
      { icon: PhoneCall, text: 'שיחת סגירה', time: '27 באפריל' },
      { icon: Handshake, text: 'העסקה נסגרה', time: '2 במאי' },
      { icon: CheckCircle, text: 'מקדמה ₪15,000 התקבלה', time: '4 במאי' },
    ],
  },
  {
    id: 'p8', couple: 'הדס & נדב', status: 'closed',
    eventDate: '2026-07-03', guests: 190, amount: 29500,
    sentDate: '2026-03-28', validUntil: '2026-04-15',
    phone: '0501122334',
    payment: { paid: 29500, total: 29500, status: 'received' },
    nextAction: '—',
    notes: 'שולם במלואו. עברו לניהול אירוע שוטף.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '28 במרץ' },
      { icon: Handshake, text: 'העסקה נסגרה', time: '6 באפריל' },
      { icon: CheckCircle, text: 'שולם במלואו', time: '10 במאי' },
    ],
  },
  {
    id: 'p9', couple: 'רינת & גיל', status: 'closed',
    eventDate: '2026-08-07', guests: 300, amount: 33000,
    sentDate: '2026-04-05', validUntil: '2026-04-25',
    phone: '0522233445', payLink: true,
    payment: { paid: 10000, total: 33000, status: 'late' },
    nextAction: '—',
    notes: 'תשלום שני היה אמור להתקבל ב-15.5 — טרם התקבל.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '5 באפריל' },
      { icon: Handshake, text: 'העסקה נסגרה', time: '14 באפריל' },
      { icon: CheckCircle, text: 'מקדמה ₪10,000 התקבלה', time: '16 באפריל' },
      { icon: AlertTriangle, text: 'תשלום שני באיחור', time: '15 במאי' },
    ],
  },
  {
    id: 'p10', couple: 'מור & אביב', status: 'lost',
    eventDate: '2026-09-04', guests: 150, amount: 27000,
    sentDate: '2026-04-12', validUntil: '2026-04-30', viewedDaysAgo: 30,
    phone: '0545566778',
    payment: null,
    nextAction: '—',
    notes: 'בחרו מקום אחר בצפון. לשמור קשר — יש להם אחות שמתחתנת ב-2027.',
    timeline: [
      { icon: Send, text: 'הצעה נשלחה', time: '12 באפריל' },
      { icon: Eye, text: 'ההצעה נפתחה', time: '13 באפריל' },
      { icon: X, text: 'סומנה כאבודה', time: '3 במאי' },
    ],
  },
];

const OPTIONS = [
  { id: 'o1', couple: 'רון & מאיה',  date: '2026-07-17', expires: '2026-05-24' },
  { id: 'o2', couple: 'גיא & תמר',   date: '2026-11-06', expires: '2026-05-27' },
  { id: 'o3', couple: 'דנה & איתי',  date: '2026-08-21', expires: '2026-06-02' },
];

const WAITING_COUPLES = [
  { id: 'w1', name: 'אורי & שני',   day: 'שישי', guests: '200–250', phone: '0521010101', suggestion: 'תאריך מתאים: 12 ביוני' },
  { id: 'w2', name: 'מיכל & רועי',  day: 'שבת',  guests: '150–200', phone: '0532020202' },
  { id: 'w3', name: 'יעל & אסף',    day: 'שישי', guests: '300–350', phone: '0543030303', suggestion: 'תאריך מתאים: 19 ביוני' },
  { id: 'w4', name: 'ליאת & עמית',  day: 'שישי / שבת', guests: '180–220', phone: '0504040404' },
  { id: 'w5', name: 'קרן & דור',    day: 'שבת',  guests: '250–300', phone: '0525050505' },
];

const HOT_DATES = [
  { id: 'h1', label: 'שישי · 12 ביוני 2026',  sub: 'עונת שיא · ביקוש גבוה' },
  { id: 'h2', label: 'שישי · 19 ביוני 2026',  sub: 'מתאים ל-2 זוגות ממתינים' },
  { id: 'h3', label: 'שבת · 27 ביוני 2026',   sub: 'מוצ״ש קיצי' },
  { id: 'h4', label: 'שישי · 3 ביולי 2026',   sub: 'פתיחת יולי' },
];

const AI_CHIPS = [
  { id: 'a1', icon: Bell,     text: 'הצעה של לירון & עומר פתוחה 7 ימים — שלח תזכורת', color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)' },
  { id: 'a2', icon: Hourglass, text: 'אופציה של רון & מאיה פגה בעוד יומיים',            color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)' },
  { id: 'a3', icon: Star,     text: '3 זוגות ממתינים מתאימים לתאריכי שישי פנויים ביוני', color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.2)' },
  { id: 'a4', icon: Eye,      text: 'הצעות שנפתחו ולא נענו: 2',                          color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
];

const FILTER_TABS = [
  { key: 'all',      label: 'הכל' },
  { key: 'open',     label: 'פתוחות' },
  { key: 'followup', label: 'דורשות מעקב' },
  { key: 'options',  label: 'אופציות' },
  { key: 'closed',   label: 'נסגרו' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNIS(n) {
  return '₪' + n.toLocaleString('en-US');
}

function fmtDate(str) {
  return new Date(str).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysBetween(fromStr, to = TODAY) {
  return Math.round((to - new Date(fromStr)) / 86400000);
}

function daysUntil(str) {
  return Math.ceil((new Date(str) - TODAY) / 86400000);
}

function ageLabel(days) {
  if (days <= 0) return 'היום';
  if (days === 1) return 'לפני יום';
  if (days === 2) return 'לפני יומיים';
  return `לפני ${days} ימים`;
}

function expiryLabel(days) {
  if (days <= 0) return 'פגה היום';
  if (days === 1) return 'פגה מחר';
  if (days === 2) return 'פגה בעוד יומיים';
  return `פגה בעוד ${days} ימים`;
}

function needsFollowup(p) {
  return p.status === 'followup' || (OPEN_STATUSES.includes(p.status) && daysBetween(p.sentDate) > 5);
}

// ── KPI row ───────────────────────────────────────────────────────────────────

function KpiRow() {
  const kpis = [
    { key: 'open',    icon: FileText,      value: '6', label: 'הצעות פתוחות',        sub: 'בצנרת המכירה',        color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.2)' },
    { key: 'follow',  icon: Bell,          value: '3', label: 'ממתינות למעקב',        sub: 'מעל 5 ימים ללא מענה', color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.22)' },
    { key: 'expire',  icon: Hourglass,     value: '2', label: 'אופציות פגות השבוע',   sub: 'דורש החלטה מיידית',   color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.22)', pulse: true },
    { key: 'waiting', icon: Users,         value: '5', label: 'זוגות ממתינים לתאריך', sub: 'הזדמנויות חדשות',     color: '#0891B2', bg: 'rgba(8,145,178,0.08)',  border: 'rgba(8,145,178,0.2)' },
    { key: 'value',   icon: TrendingUp,    value: '₪186K', label: 'שווי צבר הצעות',   sub: 'סה״כ הצעות פתוחות',   color: '#16A34A', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', primary: true },
  ];
  return (
    <div className="vp-kpi">
      {kpis.map(k => {
        const Icon = k.icon;
        return (
          <div
            key={k.key}
            className={`vp-kpi-card${k.pulse ? ' vp-kpi-card--pulse' : ''}${k.primary ? ' vp-kpi-card--primary' : ''}`}
            style={{ borderColor: k.border, '--vp-kpi-color': k.color }}
          >
            <div className="vp-kpi-icon" style={{ background: k.bg, color: k.color }}>
              <Icon size={18} strokeWidth={2} />
            </div>
            <div className="vp-kpi-body">
              <div className="vp-kpi-val" style={{ color: k.color }} dir="ltr">{k.value}</div>
              <div className="vp-kpi-label">{k.label}</div>
              <div className="vp-kpi-sub">{k.sub}</div>
            </div>
            {k.pulse && <span className="vp-kpi-pulse-dot" />}
          </div>
        );
      })}
    </div>
  );
}

// ── AI strip ──────────────────────────────────────────────────────────────────

function AiStrip() {
  return (
    <div className="vp-ai-strip">
      <div className="vp-ai-brand">
        <Sparkles size={14} />
        Choko AI
        <span className="vp-ai-badge">תובנות מכירה</span>
      </div>
      <div className="vp-ai-chips">
        {AI_CHIPS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="vp-ai-chip" style={{ background: c.bg, borderColor: c.border, color: c.color }}>
              <Icon size={13} />
              <span>{c.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Proposal row ──────────────────────────────────────────────────────────────

function ProposalRow({ p, onOpen }) {
  const st = STATUS[p.status];
  const age = daysBetween(p.sentDate);
  const isClosed = p.status === 'closed' || p.status === 'lost';
  const staleAge = age > 5 && !isClosed;
  const pay = p.payment;
  const payStatus = pay ? PAY_STATUS[pay.status] : null;

  return (
    <div
      className={`vp-row${p.status === 'lost' ? ' vp-row--lost' : ''}`}
      onClick={() => onOpen(p)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen(p)}
    >
      <div className="vp-row-main">
        <div className="vp-row-couple">
          <span className="vp-row-names">{p.couple}</span>
          <span
            className={`vp-badge${p.status === 'followup' ? ' vp-badge--pulse' : ''}`}
            style={{ color: st.color, background: st.bg, borderColor: st.border }}
          >
            {p.status === 'opened' && <Eye size={11} />}
            {st.label}
          </span>
          {p.status === 'opened' && p.viewedDaysAgo != null && (
            <span className="vp-row-viewed">נצפתה {ageLabel(p.viewedDaysAgo)}</span>
          )}
          {p.hasOption && (
            <span className="vp-badge vp-badge--option">
              <CalendarClock size={11} /> אופציה
            </span>
          )}
        </div>
        <div className="vp-row-meta">
          <span className="vp-row-meta-item"><Calendar size={12} /> {fmtDate(p.eventDate)}</span>
          <span className="vp-row-meta-item"><Users size={12} /> ~{p.guests} אורחים</span>
          <span className={`vp-row-age${staleAge ? ' vp-row-age--stale' : ''}`}>
            <Clock size={12} /> {ageLabel(age)}
          </span>
        </div>
        {pay && (
          <div className="vp-row-pay">
            <span className="vp-pay-dot" style={{ background: payStatus.color }} />
            <span className="vp-pay-amounts" dir="ltr">{fmtNIS(pay.paid)} / {fmtNIS(pay.total)}</span>
            <span className="vp-pay-status" style={{ color: payStatus.color }}>{payStatus.label}</span>
            {p.payLink && (
              <button className="vp-pay-link" onClick={e => e.stopPropagation()}>
                <ExternalLink size={11} /> קישור לתשלום חיצוני
              </button>
            )}
          </div>
        )}
      </div>

      <div className="vp-row-side">
        <div className="vp-row-amount" dir="ltr">{fmtNIS(p.amount)}</div>
        {!isClosed && (
          <span className="vp-action-chip">
            <Zap size={11} /> {p.nextAction}
          </span>
        )}
        <div className="vp-row-quick" onClick={e => e.stopPropagation()}>
          <a className="vp-quick-btn" href={`tel:${p.phone}`} title="התקשר">
            <Phone size={14} />
          </a>
          <a
            className="vp-quick-btn vp-quick-btn--wa"
            href={`https://wa.me/972${p.phone.slice(1)}`}
            target="_blank" rel="noreferrer" title="WhatsApp"
          >
            <MessageCircle size={14} />
          </a>
          <button className="vp-quick-btn" onClick={() => onOpen(p)} title="פתח">
            <Eye size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Right column cards ────────────────────────────────────────────────────────

function OptionsCard() {
  return (
    <div className="vp-card">
      <div className="vp-card-title"><CalendarClock size={15} /> אופציות שמורות</div>
      {OPTIONS.map(o => {
        const days = daysUntil(o.expires);
        const tone = days <= 2 ? 'red' : days <= 7 ? 'amber' : 'ok';
        return (
          <div key={o.id} className="vp-option">
            <div className="vp-option-top">
              <div>
                <div className="vp-option-couple">{o.couple}</div>
                <div className="vp-option-date"><Calendar size={11} /> {fmtDate(o.date)}</div>
              </div>
              <span className={`vp-expiry vp-expiry--${tone}`}>
                <Hourglass size={11} /> {expiryLabel(days)}
              </span>
            </div>
            <div className="vp-option-actions">
              <button className="vp-mini-btn vp-mini-btn--ok">אשר</button>
              <button className="vp-mini-btn vp-mini-btn--danger">שחרר</button>
              <button className="vp-mini-btn">הארך</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WaitingCard() {
  return (
    <div className="vp-card">
      <div className="vp-card-title"><Users size={15} /> זוגות ממתינים לתאריך</div>
      {WAITING_COUPLES.map(w => (
        <div key={w.id} className="vp-waiting">
          <div className="vp-waiting-main">
            <div className="vp-waiting-name">{w.name}</div>
            <div className="vp-waiting-meta">מעדיפים {w.day} · {w.guests} אורחים</div>
            {w.suggestion && (
              <span className="vp-suggest-chip"><Star size={11} /> {w.suggestion}</span>
            )}
          </div>
          <a className="vp-quick-btn" href={`tel:${w.phone}`} title="התקשר">
            <Phone size={14} />
          </a>
        </div>
      ))}
    </div>
  );
}

function HotDatesCard() {
  return (
    <div className="vp-card">
      <div className="vp-card-title"><Flame size={15} style={{ color: '#D97706' }} /> תאריכים פנויים חמים</div>
      {HOT_DATES.map(h => (
        <div key={h.id} className="vp-hotdate">
          <div>
            <div className="vp-hotdate-label">{h.label}</div>
            <div className="vp-hotdate-sub">{h.sub}</div>
          </div>
          <button className="vp-mini-btn vp-mini-btn--cta">הצע לזוג</button>
        </div>
      ))}
    </div>
  );
}

// ── Side panel ────────────────────────────────────────────────────────────────

function ProposalPanel({ p, onClose }) {
  const st = STATUS[p.status];
  const pay = p.payment;
  const payStatus = pay ? PAY_STATUS[pay.status] : null;
  const pct = pay && pay.total > 0 ? Math.round((pay.paid / pay.total) * 100) : 0;

  return (
    <>
      <div className="vp-panel-backdrop" onClick={onClose} />
      <aside className="vp-panel" dir="rtl">
        <div className="vp-panel-head">
          <div>
            <div className="vp-panel-couple">{p.couple}</div>
            <div className="vp-panel-amount" dir="ltr">{fmtNIS(p.amount)}</div>
            <span className="vp-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
              {st.label}
            </span>
          </div>
          <button className="vp-panel-close" onClick={onClose} title="סגור">
            <X size={16} />
          </button>
        </div>

        <div className="vp-panel-actions">
          <a className="venue-btn venue-btn--ghost venue-btn--sm" href={`tel:${p.phone}`}>
            <Phone size={13} /> התקשר
          </a>
          <a
            className="venue-btn venue-btn--ghost venue-btn--sm"
            href={`https://wa.me/972${p.phone.slice(1)}`} target="_blank" rel="noreferrer"
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
          <button className="venue-btn venue-btn--ghost venue-btn--sm">
            <Bell size={13} /> שלח תזכורת
          </button>
          <button className="venue-btn venue-btn--primary venue-btn--sm">
            <CheckCircle size={13} /> סמן כנסגרה
          </button>
        </div>

        <div className="vp-panel-section">
          <div className="vp-panel-section-title">פרטי הצעה</div>
          <div className="vp-detail-grid">
            <div className="vp-detail"><span>תאריך אירוע</span><b>{fmtDate(p.eventDate)}</b></div>
            <div className="vp-detail"><span>אורחים (הערכה)</span><b>~{p.guests}</b></div>
            <div className="vp-detail"><span>סכום ההצעה</span><b dir="ltr">{fmtNIS(p.amount)}</b></div>
            <div className="vp-detail"><span>נשלחה בתאריך</span><b>{fmtDate(p.sentDate)}</b></div>
            <div className="vp-detail"><span>בתוקף עד</span><b>{fmtDate(p.validUntil)}</b></div>
            <div className="vp-detail"><span>גיל ההצעה</span><b>{ageLabel(daysBetween(p.sentDate))}</b></div>
          </div>
        </div>

        {pay && (
          <div className="vp-panel-section">
            <div className="vp-panel-section-title">מעקב תשלום</div>
            <div className="vp-pay-track">
              <div className="vp-pay-track-row">
                <span className="vp-pay-amounts" dir="ltr">{fmtNIS(pay.paid)} / {fmtNIS(pay.total)}</span>
                <span className="vp-badge" style={{
                  color: payStatus.color,
                  background: `${payStatus.color}14`,
                  borderColor: `${payStatus.color}33`,
                }}>
                  {payStatus.label}
                </span>
              </div>
              <div className="vp-progress">
                <div className="vp-progress-fill" style={{ width: `${pct}%`, background: payStatus.color }} />
              </div>
              <button className="vp-pay-link">
                <ExternalLink size={12} /> קישור תשלום חיצוני
              </button>
            </div>
          </div>
        )}

        <div className="vp-panel-section">
          <div className="vp-panel-section-title">ציר פעולות</div>
          <div className="vp-timeline">
            {p.timeline.map((t, i) => {
              const Icon = t.icon;
              return (
                <div key={i} className="vp-timeline-item">
                  <span className="vp-timeline-dot"><Icon size={12} /></span>
                  <div className="vp-timeline-body">
                    <div className="vp-timeline-text">{t.text}</div>
                    <div className="vp-timeline-time">{t.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="vp-panel-section">
          <div className="vp-panel-section-title">הערות</div>
          <p className="vp-panel-notes">{p.notes}</p>
        </div>
      </aside>
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function VenueProposals({ venue, navigate }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = PROPOSALS;
    if (tab === 'open')     list = list.filter(p => OPEN_STATUSES.includes(p.status));
    if (tab === 'followup') list = list.filter(needsFollowup);
    if (tab === 'options')  list = list.filter(p => p.hasOption);
    if (tab === 'closed')   list = list.filter(p => p.status === 'closed' || p.status === 'lost');
    const q = search.trim();
    if (q) list = list.filter(p => p.couple.includes(q));
    return list;
  }, [tab, search]);

  return (
    <div className="vp-page" dir="rtl">

      {/* ── Header ── */}
      <div className="vp-header">
        <div>
          <h1 className="vp-title">הצעות ואופציות</h1>
          <p className="vp-subtitle">ניהול הצעות מחיר ותאריכים שמורים · {venue?.name}</p>
        </div>
        <div className="vp-header-actions">
          <div className="vp-search">
            <Search size={14} />
            <input
              className="vp-search-input"
              placeholder="חיפוש זוג…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="venue-btn venue-btn--cta">+ הצעה חדשה</button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <KpiRow />

      {/* ── Choko AI strip ── */}
      <AiStrip />

      {/* ── Main grid ── */}
      <div className="vp-grid">

        {/* Left: proposals list */}
        <div className="vp-list-col">
          <div className="vp-tabs">
            {FILTER_TABS.map(t => (
              <button
                key={t.key}
                className={`vp-tab${tab === t.key ? ' vp-tab--active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="vp-list">
            {filtered.map(p => (
              <ProposalRow key={p.id} p={p} onOpen={setSelected} />
            ))}
            {filtered.length === 0 && (
              <div className="vp-empty">
                <FileText size={22} />
                לא נמצאו הצעות תואמות
              </div>
            )}
          </div>
        </div>

        {/* Right: stacked cards */}
        <div className="vp-side-col">
          <OptionsCard />
          <WaitingCard />
          <HotDatesCard />
        </div>
      </div>

      {/* ── Side panel ── */}
      {selected && <ProposalPanel p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

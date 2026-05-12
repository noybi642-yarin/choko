import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './LiveVenueMode.css';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const EVENT_INFO = {
  title: 'חתונת נוי & ירין',
  date: '15 באוגוסט 2026',
  time: '19:30',
  venue: 'גני האלגנס, פתח תקווה',
  totalInvited: 200,
};

const INITIAL_GUESTS = [
  { id: 'g1',  name: 'דוד לוי',        family: 'לוי',      headCount: 4, tableId: 2,  status: 'arrived',  vip: false, phone: '050-1234567', arrivalTime: '19:35', side: 'bride',  notes: '' },
  { id: 'g2',  name: 'רחל כהן',        family: 'כהן',      headCount: 2, tableId: 1,  status: 'arrived',  vip: true,  phone: '052-2345678', arrivalTime: '19:28', side: 'groom',  notes: 'דודה של הכלה' },
  { id: 'g3',  name: 'משה ברנשטיין',   family: 'ברנשטיין', headCount: 6, tableId: 3,  status: 'partial',  vip: false, phone: '054-3456789', arrivalTime: '19:42', side: 'bride',  notes: '2 מתוך 6 הגיעו' },
  { id: 'g4',  name: 'שרה אברהם',      family: 'אברהם',    headCount: 3, tableId: 4,  status: 'arrived',  vip: false, phone: '053-4567890', arrivalTime: '19:31', side: 'groom',  notes: '' },
  { id: 'g5',  name: 'יוסף מזרחי',     family: 'מזרחי',    headCount: 5, tableId: 5,  status: 'pending',  vip: false, phone: '058-5678901', arrivalTime: null,    side: 'bride',  notes: '' },
  { id: 'g6',  name: 'מרים שפירא',     family: 'שפירא',    headCount: 2, tableId: 1,  status: 'arrived',  vip: true,  phone: '050-6789012', arrivalTime: '19:25', side: 'groom',  notes: 'חבר קרוב של החתן' },
  { id: 'g7',  name: 'אבי גולדברג',    family: 'גולדברג',  headCount: 4, tableId: 6,  status: 'pending',  vip: false, phone: '052-7890123', arrivalTime: null,    side: 'bride',  notes: '' },
  { id: 'g8',  name: 'נעמי ביטון',     family: 'ביטון',    headCount: 8, tableId: 7,  status: 'arrived',  vip: false, phone: '054-8901234', arrivalTime: '19:38', side: 'groom',  notes: '' },
  { id: 'g9',  name: 'יעקב פרץ',       family: 'פרץ',      headCount: 3, tableId: 8,  status: 'pending',  vip: false, phone: '053-9012345', arrivalTime: null,    side: 'bride',  notes: '' },
  { id: 'g10', name: 'אסתר חיימוב',    family: 'חיימוב',   headCount: 4, tableId: 9,  status: 'arrived',  vip: false, phone: '058-0123456', arrivalTime: '19:45', side: 'groom',  notes: '' },
  { id: 'g11', name: 'חיים רוזנברג',   family: 'רוזנברג',  headCount: 2, tableId: 10, status: 'arrived',  vip: true,  phone: '050-1234568', arrivalTime: '19:22', side: 'bride',  notes: 'חבר ותיק של המשפחה' },
  { id: 'g12', name: 'פנינה אשכנזי',   family: 'אשכנזי',   headCount: 6, tableId: 11, status: 'partial',  vip: false, phone: '052-2345679', arrivalTime: '19:50', side: 'groom',  notes: '3 מתוך 6 הגיעו' },
  { id: 'g13', name: 'בנימין קפלן',    family: 'קפלן',     headCount: 4, tableId: 12, status: 'pending',  vip: false, phone: '054-3456780', arrivalTime: null,    side: 'bride',  notes: '' },
  { id: 'g14', name: 'שושנה חזן',      family: 'חזן',      headCount: 3, tableId: 1,  status: 'arrived',  vip: true,  phone: '053-4567891', arrivalTime: '19:20', side: 'groom',  notes: 'VIP - דודה של החתן' },
  { id: 'g15', name: 'אלי ששון',       family: 'ששון',     headCount: 5, tableId: 13, status: 'arrived',  vip: false, phone: '058-5678902', arrivalTime: '19:55', side: 'bride',  notes: '' },
  { id: 'g16', name: 'ורד נחמיאס',     family: 'נחמיאס',   headCount: 2, tableId: 2,  status: 'pending',  vip: false, phone: '050-6789013', arrivalTime: null,    side: 'groom',  notes: '' },
  { id: 'g17', name: 'גדעון עמרם',     family: 'עמרם',     headCount: 4, tableId: 4,  status: 'arrived',  vip: false, phone: '052-7890124', arrivalTime: '19:40', side: 'bride',  notes: '' },
  { id: 'g18', name: 'לאה ויסמן',      family: 'ויסמן',    headCount: 3, tableId: 6,  status: 'pending',  vip: false, phone: '054-8901235', arrivalTime: null,    side: 'groom',  notes: '' },
  { id: 'g19', name: 'נחום דהן',       family: 'דהן',      headCount: 6, tableId: 8,  status: 'arrived',  vip: false, phone: '053-9012346', arrivalTime: '20:01', side: 'bride',  notes: '' },
  { id: 'g20', name: 'ציפורה בן-דוד',  family: 'בן-דוד',   headCount: 4, tableId: 10, status: 'partial',  vip: false, phone: '058-0123457', arrivalTime: '19:58', side: 'groom',  notes: '2 מתוך 4 הגיעו' },
];

const INITIAL_TABLES = [
  { id: 1,  name: 'שולחן VIP',      capacity: 10, occupied: 7,  type: 'vip' },
  { id: 2,  name: 'משפחת הכלה',    capacity: 10, occupied: 6,  type: 'regular' },
  { id: 3,  name: 'משפחת החתן',    capacity: 10, occupied: 4,  type: 'regular' },
  { id: 4,  name: 'חברים קרובים',  capacity: 10, occupied: 7,  type: 'regular' },
  { id: 5,  name: 'עמיתי עבודה',   capacity: 10, occupied: 0,  type: 'regular' },
  { id: 6,  name: 'חברים ישנים',   capacity: 10, occupied: 3,  type: 'regular' },
  { id: 7,  name: 'קרובי משפחה',   capacity: 10, occupied: 8,  type: 'regular' },
  { id: 8,  name: 'שכנים ורעים',   capacity: 10, occupied: 9,  type: 'regular' },
  { id: 9,  name: 'חברי ילדות',    capacity: 10, occupied: 4,  type: 'regular' },
  { id: 10, name: 'צד הכלה',       capacity: 10, occupied: 8,  type: 'regular' },
  { id: 11, name: 'צד החתן',       capacity: 10, occupied: 5,  type: 'regular' },
  { id: 12, name: 'מכרים עסקיים',  capacity: 10, occupied: 0,  type: 'regular' },
  { id: 13, name: 'חברי צבא',      capacity: 10, occupied: 5,  type: 'regular' },
  { id: 14, name: 'רזרבה א׳',      capacity: 10, occupied: 0,  type: 'reserve' },
  { id: 15, name: 'רזרבה ב׳',      capacity: 10, occupied: 0,  type: 'reserve' },
  { id: 16, name: 'רזרבה ג׳',      capacity: 10, occupied: 0,  type: 'reserve' },
];

const INITIAL_ALERTS = [
  { id: 'a1', type: 'vip',     title: 'אורח VIP מתעכב',         body: 'שושנה חזן עדיין לא הגיעה — מוזמנת VIP שנרשמה לפני 2 שעות', time: '20:05', priority: 'red' },
  { id: 'a2', type: 'warning', title: 'שולחן 5 ריק לחלוטין',    body: 'עמיתי עבודה — 0/10 מוזמנים הגיעו. שיחה לארגן מחדש?',        time: '19:58', priority: 'amber' },
  { id: 'a3', type: 'insight', title: 'קצב הגעה גבוה',           body: '23 אורחים הגיעו ב-15 הדקות האחרונות — שיא לשעה זו',          time: '19:55', priority: 'green' },
  { id: 'a4', type: 'action',  title: 'הצע מחדש מקום ישיבה',     body: 'שולחן 12 ריק — שקול להעביר אורחים משולחנות עמוסים',          time: '19:50', priority: 'amber' },
];

const INITIAL_FEED = [
  { id: 'f1', type: 'arrival', icon: '✅', text: 'דוד לוי (4 אנשים) — שולחן 2',          time: '19:35', count: 4 },
  { id: 'f2', type: 'vip',     icon: '⭐', text: 'רחל כהן הגיעה — VIP שולחן 1',         time: '19:28', count: 2 },
  { id: 'f3', type: 'arrival', icon: '✅', text: 'שרה אברהם (3 אנשים) — שולחן 4',        time: '19:31', count: 3 },
  { id: 'f4', type: 'vip',     icon: '⭐', text: 'מרים שפירא הגיעה — VIP שולחן 1',      time: '19:25', count: 2 },
  { id: 'f5', type: 'arrival', icon: '✅', text: 'נעמי ביטון (8 אנשים) — שולחן 7',       time: '19:38', count: 8 },
  { id: 'f6', type: 'arrival', icon: '✅', text: 'אסתר חיימוב (4 אנשים) — שולחן 9',     time: '19:45', count: 4 },
  { id: 'f7', type: 'vip',     icon: '⭐', text: 'שושנה חזן הגיעה — VIP שולחן 1',       time: '19:20', count: 3 },
  { id: 'f8', type: 'arrival', icon: '✅', text: 'חיים רוזנברג (2 אנשים) — שולחן 10',   time: '19:22', count: 2 },
  { id: 'f9', type: 'table',   icon: '🪑', text: 'שולחן 8 הגיע ל-90% תפוסה',            time: '19:50', count: 0 },
  { id: 'f10',type: 'arrival', icon: '✅', text: 'גדעון עמרם (4 אנשים) — שולחן 4',      time: '19:40', count: 4 },
];

const ARRIVAL_POOL = [
  { name: 'אורי שלום',      tableId: 5,  headCount: 4, vip: false },
  { name: 'גלית מורן',      tableId: 6,  headCount: 2, vip: false },
  { name: 'יוני כהן',       tableId: 12, headCount: 5, vip: false },
  { name: 'דנה לוי',        tableId: 3,  headCount: 3, vip: false },
  { name: 'אמיר ברק',       tableId: 9,  headCount: 6, vip: false },
  { name: 'תמר גרין',       tableId: 11, headCount: 2, vip: true  },
  { name: 'נועם פישר',      tableId: 2,  headCount: 4, vip: false },
  { name: 'ליאת שוורץ',     tableId: 7,  headCount: 8, vip: false },
  { name: 'עידן פרידמן',    tableId: 4,  headCount: 3, vip: false },
  { name: 'שיר אלון',       tableId: 13, headCount: 5, vip: true  },
];

const ALERT_POOL = [
  { type: 'insight', title: 'פיק הגעות',         body: 'זוהה גל הגעות — 8 אורחים ב-3 דקות האחרונות', priority: 'green' },
  { type: 'warning', title: 'שולחן עמוס',         body: 'שולחן 7 הגיע לקיבולת מקסימלית (10/10)',       priority: 'amber' },
  { type: 'action',  title: 'הכנה לסעודה',        body: 'מומלץ להתחיל הגשה — 78% מהאורחים נוכחים',    priority: 'green' },
  { type: 'vip',     title: 'VIP הגיע',            body: 'תמר גרין הגיעה — אורחת VIP חשובה',            priority: 'red'   },
  { type: 'insight', title: 'ממוצע זמן קבלה טוב', body: 'ממוצע 45 שניות לאורח — מדהים!',               priority: 'green' },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatTime(date) {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatTimeShort(date) {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── SVG Ring Progress ─────────────────────────────────────────────────────────

function RingProgress({ pct, color, size = 70, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="lvm-ring-svg">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

// ── Table color helper ────────────────────────────────────────────────────────

function tableColor(table) {
  if (table.type === 'vip')     return '#c084fc';
  if (table.type === 'reserve') return '#64748b';
  const pct = table.occupied / table.capacity;
  if (pct === 0)   return '#ef4444';
  if (pct < 0.5)   return '#f59e0b';
  if (pct < 0.9)   return '#22c55e';
  return '#10b981';
}

// ── Feed icon color ───────────────────────────────────────────────────────────

function feedBorderColor(type) {
  switch (type) {
    case 'vip':     return '#f59e0b';
    case 'table':   return '#3b82f6';
    case 'late':    return '#f97316';
    case 'update':  return '#64748b';
    default:        return '#22c55e';
  }
}

// ── Alert colors ──────────────────────────────────────────────────────────────

function alertAccent(type) {
  switch (type) {
    case 'vip':     return { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
    case 'warning': return { border: '#f97316', bg: 'rgba(249,115,22,0.08)' };
    case 'insight': return { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)' };
    case 'action':  return { border: '#a855f7', bg: 'rgba(168,85,247,0.08)' };
    default:        return { border: '#64748b', bg: 'rgba(100,116,139,0.08)' };
  }
}

function alertIcon(type) {
  switch (type) {
    case 'vip':     return '⭐';
    case 'warning': return '⚠️';
    case 'insight': return '💡';
    case 'action':  return '🎯';
    default:        return '🔔';
  }
}

function priorityDotColor(p) {
  if (p === 'red')   return '#ef4444';
  if (p === 'amber') return '#f59e0b';
  return '#22c55e';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LvmHeader({ eventInfo, mode, setMode, theme, setTheme, onBack, currentTime, feed }) {
  return (
    <header className="lvm-header">
      <div className="lvm-header-left">
        <button className="lvm-back-btn" onClick={onBack}>← חזרה</button>
        <div className="lvm-event-meta">
          <h1 className="lvm-event-title">{eventInfo.title}</h1>
          <span className="lvm-event-sub">{eventInfo.date} · {eventInfo.time} · {eventInfo.venue}</span>
        </div>
      </div>

      <div className="lvm-header-center">
        <div className="lvm-live-badge">
          <span className="lvm-live-dot" />
          LIVE
        </div>
        <div className="lvm-clock">{formatTime(currentTime)}</div>
      </div>

      <div className="lvm-header-right">
        <div className="lvm-mode-buttons">
          <button className={`lvm-mode-btn${mode === 'control' ? ' active' : ''}`} onClick={() => setMode('control')}>🎛️ בקרה</button>
          <button className={`lvm-mode-btn${mode === 'hostess' ? ' active' : ''}`} onClick={() => setMode('hostess')}>📱 קבלה</button>
          <button className={`lvm-mode-btn${mode === 'display' ? ' active' : ''}`} onClick={() => setMode('display')}>📺 תצוגה</button>
        </div>
        <button className="lvm-theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

function KpiStrip({ kpis, pulseKpi }) {
  const cards = [
    { icon: '👥', label: 'סה״כ מוזמנים',   value: kpis.totalGuests,  color: '#3b82f6',  pulse: false },
    { icon: '✅', label: 'אישרו הגעה',      value: kpis.confirmed,    color: '#10b981',  pulse: false },
    { icon: '🟢', label: 'נוכחים עכשיו',    value: kpis.arrived,      color: '#22c55e',  pulse: pulseKpi, live: true },
    { icon: '⏳', label: 'ממתינים',          value: kpis.pending,      color: '#f59e0b',  pulse: false },
    { icon: '📊', label: 'תחזית סופית',     value: kpis.estimated,    color: '#a855f7',  pulse: false },
    { icon: '📈', label: 'ניצולת',           value: kpis.occupancy + '%', color: '#f97316', pulse: false },
    { icon: '🪑', label: 'שולחנות פנויים',  value: kpis.openTables,   color: '#64748b',  pulse: false },
    { icon: '🎯', label: 'שולחנות מלאים',   value: kpis.fullTables,   color: '#ec4899',  pulse: false },
    { icon: '⭐', label: 'VIP הגיעו',        value: kpis.vipArrived,   color: '#f59e0b',  pulse: false },
  ];
  return (
    <div className="lvm-kpi-strip">
      {cards.map((c, i) => (
        <div key={i} className={`lvm-kpi-card${c.pulse ? ' lvm-kpi-pulse' : ''}`} style={{ '--kpi-color': c.color }}>
          <div className="lvm-kpi-icon">{c.icon}</div>
          <div className="lvm-kpi-value">
            {c.live && <span className="lvm-kpi-live-dot" />}
            {c.value}
          </div>
          <div className="lvm-kpi-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function AlertsPanel({ alerts }) {
  return (
    <div className="lvm-panel lvm-alerts-panel">
      <div className="lvm-panel-header">
        <span>🤖 התראות AI</span>
        <span className="lvm-badge">{alerts.length}</span>
      </div>
      <div className="lvm-alerts-list">
        {alerts.length === 0 && <div className="lvm-empty">אין התראות כרגע</div>}
        {alerts.map(a => {
          const acc = alertAccent(a.type);
          return (
            <div key={a.id} className="lvm-alert-card lvm-fade-in"
              style={{ borderRightColor: acc.border, background: acc.bg }}>
              <div className="lvm-alert-top">
                <span className="lvm-alert-icon">{alertIcon(a.type)}</span>
                <span className="lvm-alert-title">{a.title}</span>
                <span className="lvm-priority-dot" style={{ background: priorityDotColor(a.priority) }} />
              </div>
              <div className="lvm-alert-body">{a.body}</div>
              <div className="lvm-alert-time">{a.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GuestSearch({ guests, onCheckIn }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return guests.filter(g =>
      g.name.includes(q) || g.family.includes(q) ||
      g.name.toLowerCase().includes(lower) || g.family.toLowerCase().includes(lower)
    ).slice(0, 6);
  }, [q, guests]);

  const statusLabel = (s) => {
    if (s === 'arrived')  return { label: 'הגיע', color: '#22c55e' };
    if (s === 'partial')  return { label: 'חלקי', color: '#f59e0b' };
    return                       { label: 'ממתין', color: '#64748b' };
  };

  return (
    <div className="lvm-panel lvm-search-panel">
      <div className="lvm-panel-header">
        <span>🔍 חיפוש מוזמן</span>
      </div>
      <div className="lvm-search-body">
        <input
          className="lvm-search-input"
          placeholder="שם / משפחה..."
          value={q}
          onChange={e => setQ(e.target.value)}
          dir="rtl"
        />
        <div className="lvm-search-results">
          {results.map(g => {
            const st = statusLabel(g.status);
            return (
              <div key={g.id} className="lvm-search-result-item">
                <div className="lvm-sr-info">
                  <span className="lvm-sr-name">{g.name}</span>
                  {g.vip && <span className="lvm-vip-badge">VIP</span>}
                  <span className="lvm-sr-table">שולחן {g.tableId}</span>
                  <span className="lvm-sr-count">👥 {g.headCount}</span>
                  <span className="lvm-status-badge" style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                </div>
                {g.status === 'pending' && (
                  <button className="lvm-checkin-btn" onClick={() => { onCheckIn(g.id); setQ(''); }}>
                    ✓ צ׳ק-אין
                  </button>
                )}
              </div>
            );
          })}
          {q.trim() && results.length === 0 && <div className="lvm-empty">לא נמצאו תוצאות</div>}
        </div>
      </div>
    </div>
  );
}

function TableMap({ tables }) {
  const regular = tables.filter(t => t.type !== 'reserve');
  const reserve = tables.filter(t => t.type === 'reserve');

  return (
    <div className="lvm-panel lvm-table-panel">
      <div className="lvm-panel-header">
        <span>🗺️ מפת שולחנות</span>
        <div className="lvm-table-legend">
          <span className="lvm-legend-item"><span className="lvm-legend-dot" style={{ background: '#ef4444' }} />ריק</span>
          <span className="lvm-legend-item"><span className="lvm-legend-dot" style={{ background: '#f59e0b' }} />חלקי</span>
          <span className="lvm-legend-item"><span className="lvm-legend-dot" style={{ background: '#22c55e' }} />מלא</span>
          <span className="lvm-legend-item"><span className="lvm-legend-dot" style={{ background: '#c084fc' }} />VIP</span>
          <span className="lvm-legend-item"><span className="lvm-legend-dot" style={{ background: '#64748b' }} />רזרבה</span>
        </div>
      </div>
      <div className="lvm-table-body">
        <div className="lvm-tables-grid">
          {regular.map(t => {
            const pct  = Math.round((t.occupied / t.capacity) * 100);
            const col  = tableColor(t);
            return (
              <div key={t.id} className="lvm-table-card">
                <div className="lvm-table-ring-wrap">
                  <RingProgress pct={pct} color={col} size={72} stroke={6} />
                  <div className="lvm-table-ring-center">
                    <div className="lvm-table-num">{t.id}</div>
                    <div className="lvm-table-occ">{t.occupied}/{t.capacity}</div>
                  </div>
                </div>
                <div className="lvm-table-name">{t.name}</div>
                {t.type === 'vip' && <div className="lvm-table-vip-tag">VIP</div>}
              </div>
            );
          })}
        </div>
        {reserve.length > 0 && (
          <>
            <div className="lvm-reserve-divider">שולחנות רזרבה</div>
            <div className="lvm-tables-grid lvm-reserve-grid">
              {reserve.map(t => (
                <div key={t.id} className="lvm-table-card lvm-table-reserve">
                  <div className="lvm-table-ring-wrap">
                    <RingProgress pct={0} color="#64748b" size={72} stroke={6} />
                    <div className="lvm-table-ring-center">
                      <div className="lvm-table-num">{t.id}</div>
                      <div className="lvm-table-occ">0/{t.capacity}</div>
                    </div>
                  </div>
                  <div className="lvm-table-name">{t.name}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ArrivalsFeed({ feed, newFeedId }) {
  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [feed]);

  return (
    <div className="lvm-panel lvm-feed-panel">
      <div className="lvm-panel-header">
        <span>📡 הגעות בזמן אמת</span>
        <span className="lvm-badge">{feed.length}</span>
      </div>
      <div className="lvm-feed-list" ref={listRef}>
        {feed.map(item => (
          <div
            key={item.id}
            className={`lvm-feed-item${item.id === newFeedId ? ' lvm-feed-new' : ''}`}
            style={{ borderRightColor: feedBorderColor(item.type) }}
          >
            <span className="lvm-feed-icon">{item.icon}</span>
            <div className="lvm-feed-body">
              <div className="lvm-feed-text">
                {item.text}
                {item.type === 'vip' && <span className="lvm-vip-badge" style={{ marginRight: 6 }}>VIP</span>}
              </div>
              <div className="lvm-feed-meta">
                <span>{item.time}</span>
                {item.count > 0 && <span>· {item.count} אנשים</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Display Mode ──────────────────────────────────────────────────────────────

function DisplayMode({ eventInfo, kpis, feed, currentTime, onExit }) {
  const [highlighted, setHighlighted] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHighlighted(h => (h + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  const panels = [
    { label: 'נוכחים עכשיו', value: kpis.arrived, sub: `מתוך ${kpis.totalGuests} מוזמנים`, color: '#22c55e' },
    { label: 'ניצולת האולם',  value: kpis.occupancy + '%', sub: `${kpis.fullTables} שולחנות מלאים`, color: '#a855f7' },
    { label: 'ממתינים',       value: kpis.pending,  sub: `${kpis.confirmed} אישרו הגעה`,   color: '#f59e0b' },
  ];

  return (
    <div className="lvm-display-mode" dir="rtl">
      <button className="lvm-display-exit" onClick={onExit}>✕ יציאה</button>
      <div className="lvm-display-header">
        <div className="lvm-display-live">
          <span className="lvm-live-dot" />
          LIVE
        </div>
        <h1 className="lvm-display-title">{eventInfo.title}</h1>
        <div className="lvm-display-sub">{eventInfo.date} · {eventInfo.venue}</div>
        <div className="lvm-display-clock">{formatTime(currentTime)}</div>
      </div>
      <div className="lvm-display-panels">
        {panels.map((p, i) => (
          <div key={i} className={`lvm-display-panel${highlighted === i ? ' highlighted' : ''}`}
            style={{ '--dp-color': p.color }}>
            <div className="lvm-dp-value">{p.value}</div>
            <div className="lvm-dp-label">{p.label}</div>
            <div className="lvm-dp-sub">{p.sub}</div>
          </div>
        ))}
      </div>
      <div className="lvm-display-counter">
        <span className="lvm-dc-arrived">{kpis.arrived}</span>
        <span className="lvm-dc-sep">/</span>
        <span className="lvm-dc-total">{kpis.totalGuests}</span>
        <div className="lvm-dc-label">אורחים נוכחים</div>
      </div>
      <div className="lvm-display-feed">
        <div className="lvm-df-title">הגעות אחרונות</div>
        {feed.slice(0, 5).map(item => (
          <div key={item.id} className="lvm-df-item">
            <span className="lvm-df-icon">{item.icon}</span>
            <span className="lvm-df-text">{item.text}</span>
            <span className="lvm-df-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hostess Mode ──────────────────────────────────────────────────────────────

function HostessMode({ guests, feed, currentTime, onCheckIn, onExit }) {
  const [tab, setTab]   = useState('search');
  const [q,   setQ]     = useState('');
  const pending = useMemo(() => guests.filter(g => g.status === 'pending'), [guests]);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    return guests.filter(g => g.name.includes(q) || g.family.includes(q)).slice(0, 8);
  }, [q, guests]);

  const statusLabel = (s) => {
    if (s === 'arrived')  return { label: 'הגיע', color: '#22c55e' };
    if (s === 'partial')  return { label: 'חלקי', color: '#f59e0b' };
    return                       { label: 'ממתין', color: '#94a3b8' };
  };

  return (
    <div className="lvm-hostess-mode" dir="rtl">
      <div className="lvm-hostess-header">
        <button className="lvm-back-btn" onClick={onExit}>← חזרה</button>
        <span className="lvm-hostess-title">מצב קבלה</span>
        <span className="lvm-hostess-clock">{formatTimeShort(currentTime)}</span>
      </div>
      <div className="lvm-hostess-tabs">
        <button className={`lvm-htab${tab === 'search'  ? ' active' : ''}`} onClick={() => setTab('search')}>🔍 חיפוש</button>
        <button className={`lvm-htab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>⏳ ממתינים ({pending.length})</button>
      </div>
      <div className="lvm-hostess-body">
        {tab === 'search' && (
          <div className="lvm-hostess-search">
            <input
              className="lvm-hostess-search-input"
              placeholder="חפש מוזמן..."
              value={q}
              onChange={e => setQ(e.target.value)}
              dir="rtl"
              autoFocus
            />
            <div className="lvm-hostess-results">
              {results.map(g => {
                const st = statusLabel(g.status);
                return (
                  <div key={g.id} className="lvm-hostess-guest-card">
                    <div className="lvm-hg-top">
                      <span className="lvm-hg-name">{g.name}</span>
                      {g.vip && <span className="lvm-vip-badge">VIP</span>}
                      <span className="lvm-status-badge" style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                    </div>
                    <div className="lvm-hg-meta">
                      שולחן {g.tableId} · {g.headCount} אנשים
                      {g.notes && ` · ${g.notes}`}
                    </div>
                    {g.status === 'pending' && (
                      <button className="lvm-checkin-btn lvm-checkin-big" onClick={() => { onCheckIn(g.id); setQ(''); }}>
                        ✓ צ׳ק-אין
                      </button>
                    )}
                  </div>
                );
              })}
              {q.trim() && results.length === 0 && <div className="lvm-empty">לא נמצאו תוצאות</div>}
            </div>
          </div>
        )}
        {tab === 'pending' && (
          <div className="lvm-hostess-pending">
            {pending.length === 0 && <div className="lvm-empty lvm-empty-big">כל המוזמנים הגיעו! 🎉</div>}
            {pending.map(g => (
              <div key={g.id} className="lvm-hostess-guest-card">
                <div className="lvm-hg-top">
                  <span className="lvm-hg-name">{g.name}</span>
                  {g.vip && <span className="lvm-vip-badge">VIP</span>}
                </div>
                <div className="lvm-hg-meta">שולחן {g.tableId} · {g.headCount} אנשים</div>
                <button className="lvm-checkin-btn lvm-checkin-big" onClick={() => onCheckIn(g.id)}>
                  ✓ צ׳ק-אין
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LiveVenueMode({ onBack }) {
  const [mode,          setMode]         = useState('control');
  const [theme,         setTheme]        = useState('dark');
  const [guests,        setGuests]       = useState(INITIAL_GUESTS);
  const [tables,        setTables]       = useState(INITIAL_TABLES);
  const [feed,          setFeed]         = useState(INITIAL_FEED);
  const [alerts,        setAlerts]       = useState(INITIAL_ALERTS);
  const [currentTime,   setCurrentTime]  = useState(new Date());
  const [checkedInBase, setCheckedInBase]= useState(47);
  const [pulseKpi,      setPulseKpi]     = useState(false);
  const [newFeedId,     setNewFeedId]    = useState('');
  const arrivalPoolRef = useRef([...ARRIVAL_POOL]);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Arrival simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const pool = arrivalPoolRef.current;
      if (pool.length === 0) return;
      const idx = Math.floor(Math.random() * pool.length);
      const arrival = pool.splice(idx, 1)[0];
      arrivalPoolRef.current = pool;

      const now = formatTimeShort(new Date());
      const id  = uid();
      const newItem = {
        id,
        type: arrival.vip ? 'vip' : 'arrival',
        icon: arrival.vip ? '⭐' : '✅',
        text: `${arrival.name} (${arrival.headCount} אנשים) — שולחן ${arrival.tableId}`,
        time: now,
        count: arrival.headCount,
      };

      setFeed(f => [newItem, ...f].slice(0, 25));
      setNewFeedId(id);
      setCheckedInBase(c => c + 1);
      setPulseKpi(true);
      setTimeout(() => setPulseKpi(false), 1200);

      // Update table occupied count
      setTables(ts => ts.map(t =>
        t.id === arrival.tableId
          ? { ...t, occupied: Math.min(t.occupied + arrival.headCount, t.capacity) }
          : t
      ));

      // 25% chance of adding an alert
      if (Math.random() < 0.25) {
        const alertTemplate = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)];
        const newAlert = { ...alertTemplate, id: uid(), time: now };
        setAlerts(a => [newAlert, ...a].slice(0, 10));
      }
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = useCallback((guestId) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    const now = formatTimeShort(new Date());
    const id  = uid();

    setGuests(gs => gs.map(g => g.id === guestId ? { ...g, status: 'arrived', arrivalTime: now } : g));
    setTables(ts => ts.map(t =>
      t.id === guest.tableId
        ? { ...t, occupied: Math.min(t.occupied + guest.headCount, t.capacity) }
        : t
    ));
    const newItem = {
      id,
      type: guest.vip ? 'vip' : 'arrival',
      icon: guest.vip ? '⭐' : '✅',
      text: `${guest.name} (${guest.headCount} אנשים) — שולחן ${guest.tableId}`,
      time: now,
      count: guest.headCount,
    };
    setFeed(f => [newItem, ...f].slice(0, 25));
    setNewFeedId(id);
    setCheckedInBase(c => c + 1);
    setPulseKpi(true);
    setTimeout(() => setPulseKpi(false), 1200);
  }, [guests]);

  const kpis = useMemo(() => {
    const totalGuests = EVENT_INFO.totalInvited;
    const arrived     = checkedInBase;
    const confirmed   = 178;
    const pending     = totalGuests - arrived;
    const occupancy   = Math.round((arrived / totalGuests) * 100);
    const openTables  = tables.filter(t => t.type !== 'reserve' && t.occupied < t.capacity).length;
    const fullTables  = tables.filter(t => t.type !== 'reserve' && t.occupied >= t.capacity).length;
    const vipArrived  = guests.filter(g => g.vip && g.status === 'arrived').length;
    const estimated   = 186;
    return { totalGuests, arrived, confirmed, pending, occupancy, openTables, fullTables, vipArrived, estimated };
  }, [checkedInBase, tables, guests]);

  if (mode === 'display') {
    return (
      <div className={`lvm-root lvm-${theme}`} dir="rtl">
        <DisplayMode
          eventInfo={EVENT_INFO}
          kpis={kpis}
          feed={feed}
          currentTime={currentTime}
          onExit={() => setMode('control')}
        />
      </div>
    );
  }

  if (mode === 'hostess') {
    return (
      <div className={`lvm-root lvm-${theme}`} dir="rtl">
        <HostessMode
          guests={guests}
          feed={feed}
          currentTime={currentTime}
          onCheckIn={handleCheckIn}
          onExit={() => setMode('control')}
        />
      </div>
    );
  }

  return (
    <div className={`lvm-root lvm-${theme}`} dir="rtl">
      <LvmHeader
        eventInfo={EVENT_INFO}
        mode={mode}
        setMode={setMode}
        theme={theme}
        setTheme={setTheme}
        onBack={onBack}
        currentTime={currentTime}
        feed={feed}
      />
      <KpiStrip kpis={kpis} pulseKpi={pulseKpi} />
      <div className="lvm-content">
        <div className="lvm-col-left">
          <AlertsPanel alerts={alerts} />
          <GuestSearch guests={guests} onCheckIn={handleCheckIn} />
        </div>
        <div className="lvm-col-center">
          <TableMap tables={tables} />
        </div>
        <div className="lvm-col-right">
          <ArrivalsFeed feed={feed} newFeedId={newFeedId} />
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  getVenueWeddings, createVenueWedding, deleteVenueWedding,
} from '../store';
import {
  Calendar, Users, ChevronLeft, ChevronRight, Plus,
  Search, X, Trash2, Check, TrendingUp, AlertTriangle,
  Phone, MessageCircle, FileText, CreditCard, Star,
  Activity, CheckCircle, Clock, Flame, BarChart2,
  Sparkles, Eye, ArrowUpRight, Zap, Bell,
} from 'lucide-react';
import {
  getHolidaysForDate, getMajorHolidayForDate, getHolidaysForMonth,
  getRestrictionForDate,
} from '../utils/israeliHolidays';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = { confirmed: 'מאושר', pending: 'ממתין', option: 'אופציה', cancelled: 'בוטל' };
const MONTHS_HE    = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAYS_HE      = ['א','ב','ג','ד','ה','ו','ש'];
const AVAIL_LABEL  = { available: 'פנוי', option: 'אופציה', booked: 'תפוס' };
const AVAIL_CLS    = { available: 'green', option: 'amber', booked: 'red' };

const MOCK_ACTIVITIES = [
  { id: 1, icon: CreditCard,    text: 'תשלום ₪50,000 התקבל',       sub: 'נוי & ירין',      time: 'לפני שעה',   color: '#16A34A' },
  { id: 2, icon: FileText,      text: 'חוזה נחתם',                  sub: 'שירה & דניאל',    time: 'לפני 3 שעות',color: '#4F46E5' },
  { id: 3, icon: Plus,          text: 'חתונה חדשה נוצרה',           sub: 'ליאת & עמית',     time: 'אתמול',      color: '#7C3AED' },
  { id: 4, icon: Users,         text: 'מספר אורחים עודכן — 220',    sub: 'הדס & נדב',       time: 'אתמול',      color: '#0891B2' },
  { id: 5, icon: Calendar,      text: 'תאריך הועבר מאופציה לאושר',  sub: 'רינת & גיל',      time: 'יומיים',     color: '#D97706' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(d, mode = 'long') {
  if (!d) return '—';
  const opts = mode === 'short'
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(d).toLocaleDateString('he-IL', opts);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function getAvailability(dateStr, weddings) {
  const hits = weddings.filter(w => w.date === dateStr);
  if (!hits.length) return 'available';
  if (hits.some(w => w.status === 'confirmed' || w.status === 'pending')) return 'booked';
  if (hits.some(w => w.status === 'option')) return 'option';
  return 'available';
}

function getSuggestedDates(dateStr, weddings, count = 5) {
  const base    = new Date(dateStr);
  const results = [];
  const seen    = new Set([dateStr]);
  let offset    = 1;
  while (results.length < count && offset <= 120) {
    for (const dir of [1, -1]) {
      if (results.length >= count) break;
      const d   = new Date(base);
      d.setDate(d.getDate() + dir * offset);
      const str = toISODate(d);
      if (seen.has(str)) continue;
      seen.add(str);
      const avail   = getAvailability(str, weddings);
      const holiday = getMajorHolidayForDate(str);
      if (avail === 'available') {
        results.push({ date: str, avail: 'available', holiday: holiday?.nameHe || null });
      } else if (avail === 'option' && results.length < count - 1) {
        results.push({ date: str, avail: 'option', holiday: holiday?.nameHe || null });
      }
    }
    offset++;
  }
  return results.slice(0, count);
}

function getUrgency(w) {
  if (!w || w.status === 'cancelled') return null;
  const days = daysUntil(w.date);
  if (days !== null && days >= 0 && days <= 7) return 'urgent';
  if (w.status === 'pending') return 'attention';
  if (!w.guestCount && days !== null && days >= 0 && days <= 30) return 'attention';
  if (w.status === 'option') return 'option';
  return 'ok';
}

function getNextAction(w) {
  if (!w) return '—';
  if (w.status === 'cancelled') return 'בוטל';
  const days = daysUntil(w.date);
  if (days !== null && days >= 0 && days <= 1) return 'חתונה היום / מחר!';
  if (days !== null && days >= 0 && days <= 7) {
    if (!w.guestCount) return 'רשימת אורחים חסרה';
    if (w.status !== 'confirmed') return 'סגירה דחופה!';
    return 'הכן לאירוע';
  }
  if (!w.guestCount) return 'מספר אורחים חסר';
  if (w.status === 'pending') return 'ממתין לאישור';
  if (w.status === 'option') return 'ממתין לסגירה';
  if (!w.eventId) return 'קישור אירוע חסר';
  return 'מוכן ✓';
}

// ── AddWeddingModal ───────────────────────────────────────────────────────────

function AddWeddingModal({ venueId, onSave, onClose }) {
  const [form, setForm] = useState({
    coupleNames: '', groomName: '', brideName: '',
    date: '', time: '19:30',
    guestCount: '', contactName: '', contactPhone: '', contactEmail: '',
    notes: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    const w = createVenueWedding(venueId, { ...form, guestCount: parseInt(form.guestCount) || 0 });
    onSave(w);
  };

  return (
    <div className="vd-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="vd-modal">
        <div className="vd-modal-title">חתונה חדשה</div>
        <form onSubmit={handleSubmit}>
          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>שם הכלה</label>
              <input className="vd-form-input" value={form.brideName}
                onChange={e => { set('brideName', e.target.value); set('coupleNames', `${e.target.value} & ${form.groomName}`); }}
                placeholder="שם הכלה" required />
            </div>
            <div className="vd-form-field">
              <label>שם החתן</label>
              <input className="vd-form-input" value={form.groomName}
                onChange={e => { set('groomName', e.target.value); set('coupleNames', `${form.brideName} & ${e.target.value}`); }}
                placeholder="שם החתן" required />
            </div>
          </div>
          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>תאריך</label>
              <input className="vd-form-input" type="date" value={form.date}
                onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="vd-form-field">
              <label>שעה</label>
              <input className="vd-form-input" type="time" value={form.time}
                onChange={e => set('time', e.target.value)} />
            </div>
          </div>
          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>מספר מוזמנים</label>
              <input className="vd-form-input" type="number" min="1" value={form.guestCount}
                onChange={e => set('guestCount', e.target.value)} placeholder="200" />
            </div>
            <div className="vd-form-field">
              <label>שם איש קשר</label>
              <input className="vd-form-input" value={form.contactName}
                onChange={e => set('contactName', e.target.value)} placeholder="שם מלא" />
            </div>
          </div>
          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>טלפון</label>
              <input className="vd-form-input" type="tel" value={form.contactPhone}
                onChange={e => set('contactPhone', e.target.value)} placeholder="050-0000000" />
            </div>
            <div className="vd-form-field">
              <label>דוא"ל</label>
              <input className="vd-form-input" type="email" value={form.contactEmail}
                onChange={e => set('contactEmail', e.target.value)} placeholder="couple@example.com" />
            </div>
          </div>
          <div className="vd-form-field">
            <label>הערות</label>
            <input className="vd-form-input" value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="חופה בגן, מוזיקה חיה..." />
          </div>
          <div className="vd-modal-actions">
            <button type="submit" className="venue-btn venue-btn--primary">
              <Plus size={14} /> צור חתונה
            </button>
            <button type="button" className="venue-btn venue-btn--ghost" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── KPI Cards ─────────────────────────────────────────────────────────────────

function KpiCards({ weddings }) {
  const todayStr = toISODate(new Date());
  const now      = new Date();

  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const thisWeekEvents = weddings.filter(w => {
    if (!w.date || w.status === 'cancelled') return false;
    const d = new Date(w.date);
    return d >= now && d <= weekEnd;
  }).length;

  const needsAttention = weddings.filter(w => {
    if (w.status === 'cancelled') return false;
    const u = getUrgency(w);
    return u === 'urgent' || u === 'attention';
  }).length;

  const expectedRevenue = useMemo(() => {
    return weddings
      .filter(w => w.date >= todayStr && w.status !== 'cancelled')
      .reduce((sum, w) => sum + (w.guestCount || 200) * 1400, 0);
  }, [weddings]);

  const hotDates = useMemo(() => {
    const results = [];
    for (let i = 1; i <= 90; i++) {
      if (results.length >= 3) break;
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const day = d.getDay();
      if (day === 5 || day === 6) {
        const ds = toISODate(d);
        if (getAvailability(ds, weddings) === 'available') results.push(ds);
      }
    }
    return results;
  }, [weddings]);

  const occupancy = useMemo(() => {
    const year = now.getFullYear(), month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0, booked = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d).getDay();
      if (day === 5 || day === 6) {
        total++;
        const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if (getAvailability(ds, weddings) === 'booked') booked++;
      }
    }
    return total ? Math.round((booked / total) * 100) : 0;
  }, [weddings]);

  const kpis = [
    {
      key: 'revenue',
      icon: TrendingUp,
      value: `₪${(expectedRevenue / 1000).toFixed(0)}K`,
      label: 'הכנסה צפויה',
      sub: 'מאירועים מאושרים',
      color: '#16A34A',
      bg: 'rgba(22,163,74,0.08)',
      border: 'rgba(22,163,74,0.2)',
    },
    {
      key: 'occupancy',
      icon: BarChart2,
      value: `${occupancy}%`,
      label: 'תפוסת החודש',
      sub: `${occupancy >= 70 ? 'תפוסה גבוהה' : 'יש מקום פנוי'}`,
      color: '#4F46E5',
      bg: 'rgba(79,70,229,0.07)',
      border: 'rgba(79,70,229,0.18)',
    },
    {
      key: 'week',
      icon: Calendar,
      value: String(thisWeekEvents),
      label: 'אירועים השבוע',
      sub: 'ב-7 הימים הקרובים',
      color: '#0891B2',
      bg: 'rgba(8,145,178,0.07)',
      border: 'rgba(8,145,178,0.18)',
    },
    {
      key: 'attention',
      icon: AlertTriangle,
      value: String(needsAttention),
      label: 'דורשים טיפול',
      sub: needsAttention > 0 ? 'לחץ לסינון' : 'הכל תקין',
      color: needsAttention > 0 ? '#DC2626' : '#16A34A',
      bg: needsAttention > 0 ? 'rgba(220,38,38,0.07)' : 'rgba(22,163,74,0.07)',
      border: needsAttention > 0 ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.18)',
      pulse: needsAttention > 0,
    },
    {
      key: 'hotdates',
      icon: Flame,
      value: String(hotDates.length),
      label: 'תאריכים פנויים',
      sub: hotDates[0] ? formatDate(hotDates[0], 'short') + ' הקרוב' : 'בדוק יומן',
      color: '#D97706',
      bg: 'rgba(217,119,6,0.07)',
      border: 'rgba(217,119,6,0.2)',
    },
  ];

  return (
    <div className="vd-kpi-v2">
      {kpis.map(k => {
        const Icon = k.icon;
        return (
          <div
            key={k.key}
            className={`vd-kpi-card-v2${k.pulse ? ' vd-kpi-card-v2--pulse' : ''}`}
            style={{ borderColor: k.border, '--kpi-color': k.color, '--kpi-bg': k.bg }}
          >
            <div className="vd-kpi-v2-icon-wrap" style={{ background: k.bg, color: k.color }}>
              <Icon size={18} strokeWidth={2} />
            </div>
            <div className="vd-kpi-v2-body">
              <div className="vd-kpi-v2-val" style={{ color: k.color }}>{k.value}</div>
              <div className="vd-kpi-v2-label">{k.label}</div>
              <div className="vd-kpi-v2-sub">{k.sub}</div>
            </div>
            {k.pulse && (
              <span className="vd-kpi-v2-pulse-dot" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── AI Insights Panel ─────────────────────────────────────────────────────────

function AiInsights({ weddings }) {
  const todayStr = toISODate(new Date());

  const urgentWeddings = weddings.filter(w => getUrgency(w) === 'urgent');
  const attentionWeddings = weddings.filter(w => getUrgency(w) === 'attention');
  const pendingCount = weddings.filter(w => w.status === 'pending' && w.date >= todayStr).length;

  const hotDates = useMemo(() => {
    const now = new Date();
    const results = [];
    for (let i = 1; i <= 60; i++) {
      if (results.length >= 2) break;
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 5 || d.getDay() === 6) {
        const ds = toISODate(d);
        if (getAvailability(ds, weddings) === 'available') results.push(ds);
      }
    }
    return results;
  }, [weddings]);

  const insights = [
    urgentWeddings.length > 0 && {
      id: 'urgent',
      icon: Zap,
      text: `${urgentWeddings.length} אירוע${urgentWeddings.length > 1 ? 'ים' : ''} דחוף${urgentWeddings.length > 1 ? 'ים' : ''} השבוע`,
      detail: urgentWeddings.map(w => w.coupleNames).join(', '),
      color: '#DC2626',
      bg: 'rgba(220,38,38,0.07)',
      border: 'rgba(220,38,38,0.18)',
    },
    attentionWeddings.length > 0 && {
      id: 'attention',
      icon: Bell,
      text: `${attentionWeddings.length} אירועים ממתינים לטיפול`,
      detail: attentionWeddings.map(w => getNextAction(w)).filter((v, i, a) => a.indexOf(v) === i).join(' · '),
      color: '#D97706',
      bg: 'rgba(217,119,6,0.07)',
      border: 'rgba(217,119,6,0.2)',
    },
    hotDates.length > 0 && {
      id: 'hotdates',
      icon: Star,
      text: `${hotDates.length} תאריכי שישי/שבת פנויים בחודשיים הקרובים`,
      detail: hotDates.map(d => formatDate(d, 'short')).join(' · '),
      color: '#4F46E5',
      bg: 'rgba(79,70,229,0.07)',
      border: 'rgba(79,70,229,0.18)',
    },
    pendingCount > 0 && {
      id: 'pending',
      icon: Clock,
      text: `${pendingCount} הצעות ממתינות לסגירה`,
      detail: 'שלח תזכורת ← פנה לזוגות',
      color: '#7C3AED',
      bg: 'rgba(124,58,237,0.07)',
      border: 'rgba(124,58,237,0.18)',
    },
    {
      id: 'tip',
      icon: Sparkles,
      text: 'ימי חמישי הקרובים אטרקטיביים למכירה',
      detail: 'תפוסת ימי חמישי באוגוסט — 0%',
      color: '#0891B2',
      bg: 'rgba(8,145,178,0.07)',
      border: 'rgba(8,145,178,0.18)',
    },
  ].filter(Boolean);

  return (
    <div className="vd-ai-panel">
      <div className="vd-ai-header">
        <div className="vd-ai-brand">
          <Sparkles size={14} />
          <span>Choko AI</span>
          <span className="vd-ai-badge">תובנות</span>
        </div>
        <span className="vd-ai-updated">עודכן זה עתה</span>
      </div>
      <div className="vd-ai-insights">
        {insights.map(ins => {
          const Icon = ins.icon;
          return (
            <div key={ins.id} className="vd-ai-insight" style={{ background: ins.bg, borderColor: ins.border }}>
              <div className="vd-ai-insight-icon" style={{ color: ins.color }}>
                <Icon size={15} strokeWidth={2.2} />
              </div>
              <div className="vd-ai-insight-body">
                <div className="vd-ai-insight-text" style={{ color: ins.color }}>{ins.text}</div>
                <div className="vd-ai-insight-detail">{ins.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

function ActivityFeed() {
  return (
    <div className="vd-activity-feed">
      <div className="vd-activity-header">
        <div className="vd-activity-title">
          <Activity size={14} />
          פעילות אחרונה
        </div>
        <button className="vd-activity-see-all">הכל</button>
      </div>
      <div className="vd-activity-list">
        {MOCK_ACTIVITIES.map((a, idx) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="vd-activity-item">
              <div className="vd-activity-line-wrap">
                <div className="vd-activity-dot" style={{ background: a.color }} />
                {idx < MOCK_ACTIVITIES.length - 1 && <div className="vd-activity-line" />}
              </div>
              <div className="vd-activity-content">
                <div className="vd-activity-icon-wrap" style={{ background: a.color + '18', color: a.color }}>
                  <Icon size={12} />
                </div>
                <div className="vd-activity-text-wrap">
                  <div className="vd-activity-text">{a.text}</div>
                  <div className="vd-activity-meta">{a.sub} · {a.time}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CRM Table ─────────────────────────────────────────────────────────────────

function CrmTable({ weddings, navigate, onDelete }) {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter,  setMonthFilter]  = useState('all');
  const [sortDir,      setSortDir]      = useState('asc');
  const [quick,        setQuick]        = useState(null);

  const todayStr = toISODate(new Date());
  const now      = new Date();

  const availMonths = useMemo(() => {
    const set = new Set();
    weddings.forEach(w => {
      if (w.date) {
        const d = new Date(w.date);
        set.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
      }
    });
    return [...set].sort();
  }, [weddings]);

  const filtered = useMemo(() => {
    let list = [...weddings];
    if (quick === 'today') {
      list = list.filter(w => w.date === todayStr);
    } else if (quick === 'month') {
      list = list.filter(w => {
        if (!w.date) return false;
        const d = new Date(w.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (quick === 'next30') {
      const end = new Date(now); end.setDate(end.getDate() + 30);
      list = list.filter(w => {
        if (!w.date) return false;
        const d = new Date(w.date);
        return d >= now && d <= end;
      });
    } else if (quick === 'attention') {
      list = list.filter(w => {
        const u = getUrgency(w);
        return u === 'urgent' || u === 'attention';
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.coupleNames?.toLowerCase().includes(q) ||
        w.contactName?.toLowerCase().includes(q) ||
        w.contactPhone?.includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(w => w.status === statusFilter);
    if (monthFilter !== 'all') {
      const [y, m] = monthFilter.split('-').map(Number);
      list = list.filter(w => {
        if (!w.date) return false;
        const d = new Date(w.date);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }
    list.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return sortDir === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    });
    return list;
  }, [weddings, search, statusFilter, monthFilter, sortDir, quick, todayStr]);

  const upcoming = filtered.filter(w => !w.date || w.date >= todayStr);
  const past     = filtered.filter(w => w.date && w.date < todayStr);

  const URGENCY_META = {
    urgent:    { label: 'דחוף!',       cls: 'vd-urg--urgent',    border: '#DC2626' },
    attention: { label: 'דורש טיפול',  cls: 'vd-urg--attention', border: '#D97706' },
    option:    { label: 'אופציה',       cls: 'vd-urg--option',    border: '#7C3AED' },
    ok:        { label: 'מוכן',         cls: 'vd-urg--ok',        border: '#16A34A' },
  };

  const openWhatsApp = (phone, coupleName) => {
    const clean = (phone || '').replace(/\D/g, '');
    const intl  = clean.startsWith('0') ? '972' + clean.slice(1) : clean;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(`שלום, בנוגע לאירוע שלכם ב"גני האלגנס"`)}`);
  };

  const renderRow = (w, muted) => {
    const days    = daysUntil(w.date);
    const holiday = getMajorHolidayForDate(w.date);
    const urgency = !muted ? getUrgency(w) : null;
    const nextAct = !muted ? getNextAction(w) : null;
    const urgMeta = urgency ? URGENCY_META[urgency] : null;

    return (
      <tr
        key={w.id}
        className={`vd-tr${muted ? ' vd-tr--past' : ''}${urgency ? ` vd-tr--${urgency}` : ''}`}
        style={urgMeta && !muted ? { borderRightColor: urgMeta.border } : {}}
        onClick={() => navigate({ page: 'venue-wedding', weddingId: w.id })}
      >
        {/* Date */}
        <td className="vd-td vd-td--date">
          <div className="vd-td-primary">{formatDate(w.date, 'short')}</div>
          {holiday && <div className="vd-td-holiday-tag">{holiday.nameHe}</div>}
          {!muted && days !== null && days >= 0 && days <= 30 && days > 1 &&
            <div className="vd-days-badge">עוד {days}י׳</div>}
          {!muted && days === 0 && <div className="vd-days-badge vd-days-badge--today">היום!</div>}
          {!muted && days === 1 && <div className="vd-days-badge vd-days-badge--urgent">מחר!</div>}
        </td>

        {/* Couple */}
        <td className="vd-td">
          <div className="vd-td-primary">{w.coupleNames}</div>
          <div className="vd-td-sub">{w.contactPhone}</div>
        </td>

        {/* Time */}
        <td className="vd-td vd-td--mono">{w.time || '—'}</td>

        {/* Guests */}
        <td className="vd-td vd-td--center vd-td--mono">
          {w.guestCount
            ? <span>{w.guestCount}</span>
            : <span className="vd-td-missing">חסר</span>}
        </td>

        {/* Status */}
        <td className="vd-td">
          <span className={`vd-status vd-status--${w.status}`}>{STATUS_LABEL[w.status] || w.status}</span>
        </td>

        {/* Urgency + Next Action */}
        {!muted ? (
          <td className="vd-td vd-td--urgency" onClick={e => e.stopPropagation()}>
            {urgMeta && (
              <span className={`vd-urg-badge ${urgMeta.cls}`}>{urgMeta.label}</span>
            )}
            {nextAct && (
              <div className={`vd-next-action${urgency === 'urgent' ? ' vd-next-action--urgent' : ''}`}>
                {nextAct}
              </div>
            )}
          </td>
        ) : (
          <td className="vd-td"><span className="vd-td-sub">—</span></td>
        )}

        {/* Actions */}
        <td className="vd-td vd-td--actions" onClick={e => e.stopPropagation()}>
          <div className="vd-quick-actions">
            {w.contactPhone && (
              <a
                href={`tel:${w.contactPhone}`}
                className="vd-qa-btn vd-qa-btn--phone"
                title={`התקשר: ${w.contactPhone}`}
                onClick={e => e.stopPropagation()}
              >
                <Phone size={11} />
              </a>
            )}
            {w.contactPhone && (
              <button
                className="vd-qa-btn vd-qa-btn--wa"
                title="שלח WhatsApp"
                onClick={e => { e.stopPropagation(); openWhatsApp(w.contactPhone, w.coupleNames); }}
              >
                <MessageCircle size={11} />
              </button>
            )}
            <button
              className="vd-qa-btn vd-qa-btn--open"
              title="פתח אירוע"
              onClick={() => navigate({ page: 'venue-wedding', weddingId: w.id })}
            >
              <Eye size={11} />
              <span>פתח</span>
            </button>
            <button
              className="vd-qa-btn vd-qa-btn--del"
              title="מחק"
              onClick={() => onDelete(w.id)}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="vd-crm">
      {/* Filter bar */}
      <div className="vd-crm-filters">
        <div className="vd-crm-search-wrap">
          <Search size={14} className="vd-crm-search-icon" />
          <input
            className="vd-crm-search"
            placeholder="חיפוש לפי שם / טלפון..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            dir="rtl"
          />
          {search && (
            <button className="vd-crm-search-clear" onClick={() => setSearch('')}><X size={12} /></button>
          )}
        </div>

        <select className="vd-crm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">כל הסטטוסים</option>
          <option value="confirmed">מאושר</option>
          <option value="pending">ממתין</option>
          <option value="option">אופציה</option>
          <option value="cancelled">בוטל</option>
        </select>

        <select className="vd-crm-select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          <option value="all">כל החודשים</option>
          {availMonths.map(mk => {
            const [y, m] = mk.split('-');
            const label  = new Date(y, m - 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
            return <option key={mk} value={mk}>{label}</option>;
          })}
        </select>

        <div className="vd-crm-quick">
          {[
            ['today',     'היום'],
            ['month',     'החודש'],
            ['next30',    '30 יום'],
            ['attention', '⚠ טיפול'],
          ].map(([k, lbl]) => (
            <button
              key={k}
              className={`vd-filter-btn${quick === k ? ' active' : ''}${k === 'attention' ? ' vd-filter-btn--warn' : ''}`}
              onClick={() => setQuick(q => q === k ? null : k)}
            >{lbl}</button>
          ))}
          {(quick || search || statusFilter !== 'all' || monthFilter !== 'all') && (
            <button className="vd-crm-clear-all" onClick={() => {
              setQuick(null); setSearch(''); setStatusFilter('all'); setMonthFilter('all');
            }}>נקה ×</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="vd-crm-table-wrap">
        <table className="vd-crm-table">
          <thead>
            <tr>
              <th className="vd-th">
                <button className="vd-th-sort" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  תאריך {sortDir === 'asc' ? '↑' : '↓'}
                </button>
              </th>
              <th className="vd-th">זוג / לקוח</th>
              <th className="vd-th">שעה</th>
              <th className="vd-th vd-th--center">
                <Users size={12} style={{ display: 'inline', marginLeft: 3 }} />אורחים
              </th>
              <th className="vd-th">סטטוס</th>
              <th className="vd-th">חומרה / פעולה</th>
              <th className="vd-th">פעולות מהירות</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.length === 0 && past.length === 0 ? (
              <tr><td colSpan={7} className="vd-empty-row">לא נמצאו אירועים</td></tr>
            ) : (
              <>
                {upcoming.map(w => renderRow(w, false))}
                {past.length > 0 && (
                  <>
                    <tr className="vd-past-divider-row">
                      <td colSpan={7}>
                        <div className="vd-past-sep">— אירועים שעברו ({past.length}) —</div>
                      </td>
                    </tr>
                    {past.map(w => renderRow(w, true))}
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="vd-crm-footer">
        {filtered.length} אירועים · {upcoming.length} קרובים · {past.length} עברו
      </div>
    </div>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ weddings, selectedDate, onSelectDate }) {
  const today    = toISODate(new Date());
  const [year,   setYear]   = useState(new Date().getFullYear());
  const [month,  setMonth]  = useState(new Date().getMonth());
  const [picker, setPicker] = useState(false);

  const holidays = useMemo(() => {
    const map = {};
    getHolidaysForMonth(year, month).forEach(h => {
      (map[h.date] = map[h.date] || []).push(h);
    });
    return map;
  }, [year, month]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const last  = new Date(year, month + 1, 0).getDate();
    const pad   = (n) => String(n).padStart(2, '0');
    const arr   = Array(first).fill(null);
    for (let d = 1; d <= last; d++) {
      arr.push(`${year}-${pad(month + 1)}-${pad(d)}`);
    }
    return arr;
  }, [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const yearRange = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 1 + i);

  return (
    <div className="vd-cal">
      <div className="vd-cal-nav">
        <button className="vd-cal-arr" onClick={prevMonth}><ChevronRight size={15} /></button>
        <button className="vd-cal-month-btn" onClick={() => setPicker(p => !p)}>
          {MONTHS_HE[month]} {year} {picker ? '▲' : '▼'}
        </button>
        <button className="vd-cal-arr" onClick={nextMonth}><ChevronLeft size={15} /></button>
      </div>

      {picker && (
        <div className="vd-cal-year-picker">
          {yearRange.map(y => (
            <button
              key={y}
              className={`vd-cal-year-btn${y === year ? ' active' : ''}`}
              onClick={() => { setYear(y); setPicker(false); }}
            >{y}</button>
          ))}
        </div>
      )}

      <div className="vd-cal-grid">
        {DAYS_HE.map(d => <div key={d} className="vd-cal-dow">{d}</div>)}
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`_${i}`} />;
          const avail       = getAvailability(dateStr, weddings);
          const dayHols     = holidays[dateStr] || [];
          const majHol      = dayHols.find(h => h.major);
          const restriction = getRestrictionForDate(dateStr);
          const isToday     = dateStr === today;
          const isSel       = dateStr === selectedDate;
          const isPast      = dateStr < today;

          const titleParts = [
            majHol      ? majHol.nameHe      : null,
            restriction ? restriction.nameHe : null,
          ].filter(Boolean);

          return (
            <button
              key={dateStr}
              title={titleParts.length ? titleParts.join(' | ') : undefined}
              onClick={() => onSelectDate(dateStr === selectedDate ? null : dateStr)}
              className={[
                'vd-cal-day',
                `vd-cal-day--${avail}`,
                isPast       ? 'vd-cal-day--past'        : '',
                isToday      ? 'vd-cal-day--today'       : '',
                isSel        ? 'vd-cal-day--selected'    : '',
                majHol       ? 'vd-cal-day--holiday'     : '',
                restriction  ? 'vd-cal-day--restricted'  : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="vd-cal-day-num">{parseInt(dateStr.slice(8), 10)}</span>
              {majHol     && <span className="vd-cal-hol-dot" />}
              {restriction && <span className={`vd-cal-rest-dot vd-cal-rest-dot--${restriction.type}`} />}
            </button>
          );
        })}
      </div>

      <div className="vd-cal-legend">
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--available" />פנוי</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--option" />אופציה</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--booked" />תפוס</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--holiday" />חג</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--restricted" />הגבלה</span>
      </div>
    </div>
  );
}

// ── Day Detail Panel ──────────────────────────────────────────────────────────

function DayPanel({ dateStr, weddings, navigate, onClose }) {
  if (!dateStr) {
    return (
      <div className="vd-day-panel vd-day-panel--empty">
        <Calendar size={28} strokeWidth={1} style={{ opacity: 0.25, marginBottom: 8 }} />
        <div>לחץ על תאריך בלוח לפרטים ופעולות</div>
      </div>
    );
  }

  const avail       = getAvailability(dateStr, weddings);
  const events      = weddings.filter(w => w.date === dateStr);
  const holidays    = getHolidaysForDate(dateStr);
  const restriction = getRestrictionForDate(dateStr);
  const suggestions = avail !== 'available' ? getSuggestedDates(dateStr, weddings, 4) : [];

  return (
    <div className="vd-day-panel">
      <div className="vd-day-panel-head">
        <div className="vd-day-panel-date">{formatDate(dateStr, 'long')}</div>
        <button className="vd-day-panel-close" onClick={onClose}><X size={13} /></button>
      </div>

      <span className={`vd-avail-badge vd-avail-badge--${AVAIL_CLS[avail]}`}>
        {AVAIL_LABEL[avail]}
      </span>

      {holidays.length > 0 && (
        <div className="vd-day-hols">
          {holidays.map((h, i) => (
            <div key={i} className={`vd-day-hol vd-day-hol--${h.type}`}>
              {h.nameHe}{h.approximate ? ' *' : ''}
            </div>
          ))}
          {holidays.some(h => h.approximate) && (
            <div className="vd-day-hol-note">* תאריכים בקירוב</div>
          )}
        </div>
      )}

      {restriction && (
        <div className={`vd-day-restriction vd-day-restriction--${restriction.type}`}>
          <span className="vd-day-rest-icon">⚠️</span>
          <div className="vd-day-rest-text">
            <strong>{restriction.nameHe}</strong>
            <span>{restriction.descHe}</span>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="vd-day-events">
          {events.map(w => (
            <div key={w.id} className="vd-day-event">
              <div className="vd-day-event-couple">{w.coupleNames}</div>
              <div className="vd-day-event-meta">{w.time} · {w.guestCount || '?'} אורחים</div>
              <span className={`vd-status vd-status--${w.status}`}>{STATUS_LABEL[w.status]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Smart CTAs based on availability */}
      <div className="vd-day-cta-row">
        {avail === 'available' && (
          <>
            <button className="vd-day-cta vd-day-cta--primary">
              <Plus size={12} /> צור אירוע
            </button>
            <button className="vd-day-cta vd-day-cta--ghost">
              <ArrowUpRight size={12} /> הצע ללקוח
            </button>
          </>
        )}
        {avail === 'booked' && events.length > 0 && (
          <button
            className="vd-day-cta vd-day-cta--primary"
            onClick={() => navigate({ page: 'venue-wedding', weddingId: events[0].id })}
          >
            <Eye size={12} /> פתח אירוע
          </button>
        )}
        {avail === 'option' && (
          <>
            <button className="vd-day-cta vd-day-cta--primary">
              <CheckCircle size={12} /> אמת אופציה
            </button>
            <button className="vd-day-cta vd-day-cta--ghost">
              <ArrowUpRight size={12} /> הצע חלופות
            </button>
          </>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="vd-day-suggestions">
          <div className="vd-day-sug-title">תאריכים חלופיים זמינים:</div>
          {suggestions.map(s => (
            <div key={s.date} className="vd-sug-row">
              <span className="vd-sug-date">{formatDate(s.date, 'short')}</span>
              {s.holiday && <span className="vd-sug-hol">{s.holiday}</span>}
              <span className={`vd-avail-badge vd-avail-badge--${AVAIL_CLS[s.avail]} vd-avail-badge--sm`}>
                {AVAIL_LABEL[s.avail]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Date Checker ──────────────────────────────────────────────────────────────

function DateChecker({ weddings, onNavigate }) {
  const [date,   setDate]   = useState('');
  const [result, setResult] = useState(null);

  const check = () => {
    if (!date) return;
    const avail       = getAvailability(date, weddings);
    const events      = weddings.filter(w => w.date === date);
    const suggestions = avail !== 'available' ? getSuggestedDates(date, weddings, 5) : [];
    const holiday     = getMajorHolidayForDate(date);
    const restriction = getRestrictionForDate(date);
    setResult({ date, avail, events, suggestions, holiday, restriction });
  };

  const reset = () => { setDate(''); setResult(null); };

  return (
    <div className="vd-checker">
      <div className="vd-checker-row">
        <div className="vd-checker-label">
          <Search size={13} style={{ opacity: 0.6 }} />
          בדיקת זמינות תאריך
        </div>
        <div className="vd-checker-inputs">
          <input
            className="vd-checker-input"
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setResult(null); }}
          />
          <button className="venue-btn venue-btn--primary venue-btn--sm" onClick={check} disabled={!date}>
            בדוק
          </button>
          {result && (
            <button className="venue-btn venue-btn--ghost venue-btn--sm" onClick={reset}>
              <X size={12} /> נקה
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="vd-checker-result">
          <div className="vd-checker-result-top">
            <span className="vd-checker-result-date">{formatDate(result.date, 'long')}</span>
            <span className={`vd-avail-badge vd-avail-badge--${AVAIL_CLS[result.avail]}`}>
              {AVAIL_LABEL[result.avail]}
            </span>
            {result.holiday && (
              <span className="vd-checker-hol">{result.holiday.nameHe}</span>
            )}

            {/* Smart CTAs in checker */}
            <div className="vd-checker-ctas">
              {result.avail === 'available' && (
                <button className="venue-btn venue-btn--primary venue-btn--sm">
                  <Plus size={12} /> צור אירוע לתאריך זה
                </button>
              )}
              {result.avail === 'booked' && result.events.length > 0 && (
                <button
                  className="venue-btn venue-btn--ghost venue-btn--sm"
                  onClick={() => onNavigate?.({ page: 'venue-wedding', weddingId: result.events[0].id })}
                >
                  <Eye size={12} /> פתח אירוע
                </button>
              )}
            </div>
          </div>

          {result.restriction && (
            <div className={`vd-day-restriction vd-day-restriction--${result.restriction.type}`}>
              <span className="vd-day-rest-icon">⚠️</span>
              <div className="vd-day-rest-text">
                <strong>{result.restriction.nameHe}</strong>
                <span>{result.restriction.descHe}</span>
              </div>
            </div>
          )}

          {result.events.length > 0 && (
            <div className="vd-checker-events">
              {result.events.map(w => (
                <div key={w.id} className="vd-checker-event">
                  <span>{w.coupleNames}</span>
                  <span className="vd-td-sub">{w.time} · {w.guestCount} אורחים</span>
                  <span className={`vd-status vd-status--${w.status}`}>{STATUS_LABEL[w.status]}</span>
                </div>
              ))}
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div className="vd-checker-sug-wrap">
              <div className="vd-day-sug-title">תאריכים חלופיים זמינים:</div>
              <div className="vd-checker-sug-list">
                {result.suggestions.map(s => (
                  <div key={s.date} className="vd-sug-row">
                    <span className="vd-sug-date">{formatDate(s.date, 'short')}</span>
                    {s.holiday && <span className="vd-sug-hol">{s.holiday}</span>}
                    <span className={`vd-avail-badge vd-avail-badge--${AVAIL_CLS[s.avail]} vd-avail-badge--sm`}>
                      {AVAIL_LABEL[s.avail]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VenueDashboard({ venue, navigate }) {
  const [weddings,     setWeddings]     = useState(() => getVenueWeddings(venue.id));
  const [showAdd,      setShowAdd]      = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const reload = () => setWeddings(getVenueWeddings(venue.id));

  const handleDelete = id => {
    if (!confirm('למחוק את החתונה?')) return;
    deleteVenueWedding(id);
    reload();
  };

  return (
    <div className="vd-page vd-page--wide">

      {/* ── Header ── */}
      <div className="vd-header">
        <div>
          <h1 className="vd-title">כל החתונות</h1>
          <p className="vd-subtitle">מרכז הפעולות של {venue.name}</p>
        </div>
        <div className="vd-header-actions">
          <button className="venue-btn venue-btn--ghost" onClick={() => navigate({ page: 'live-venue-mode' })}>
            <Activity size={14} /> Live Venue Mode
          </button>
          <button className="venue-btn venue-btn--primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> חתונה חדשה
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards weddings={weddings} />

      {/* ── AI Insights ── */}
      <AiInsights weddings={weddings} />

      {/* ── Date Checker ── */}
      <DateChecker weddings={weddings} onNavigate={navigate} />

      {/* ── Main Layout ── */}
      <div className="vd-main-layout">
        {/* Left: CRM Table */}
        <div className="vd-main-left">
          <CrmTable weddings={weddings} navigate={navigate} onDelete={handleDelete} />
        </div>

        {/* Right: Calendar + Day Panel + Activity */}
        <div className="vd-main-right">
          <MiniCalendar
            weddings={weddings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <DayPanel
            dateStr={selectedDate}
            weddings={weddings}
            navigate={navigate}
            onClose={() => setSelectedDate(null)}
          />
          <ActivityFeed />
        </div>
      </div>

      {showAdd && (
        <AddWeddingModal
          venueId={venue.id}
          onSave={() => { reload(); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

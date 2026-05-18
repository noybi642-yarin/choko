import { useState, useMemo } from 'react';
import {
  getVenueWeddings, createVenueWedding, deleteVenueWedding,
} from '../store';
import {
  Calendar, Users, ChevronLeft, ChevronRight, Plus,
  Search, X, Trash2, Check,
} from 'lucide-react';
import {
  getHolidaysForDate, getMajorHolidayForDate, getHolidaysForMonth,
} from '../utils/israeliHolidays';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = { confirmed: 'מאושר', pending: 'ממתין', option: 'אופציה', cancelled: 'בוטל' };
const MONTHS_HE    = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAYS_HE      = ['א','ב','ג','ד','ה','ו','ש'];

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

  const renderRow = (w, muted) => {
    const days    = daysUntil(w.date);
    const holiday = getMajorHolidayForDate(w.date);
    return (
      <tr
        key={w.id}
        className={`vd-tr${muted ? ' vd-tr--past' : ''}`}
        onClick={() => navigate({ page: 'venue-wedding', weddingId: w.id })}
      >
        <td className="vd-td vd-td--date">
          <div className="vd-td-primary">{formatDate(w.date, 'short')}</div>
          {holiday && <div className="vd-td-holiday-tag">{holiday.nameHe}</div>}
          {!muted && days !== null && days >= 0 && days <= 30 &&
            <div className="vd-days-badge">עוד {days}י׳</div>}
          {!muted && days === 0 && <div className="vd-days-badge vd-days-badge--today">היום!</div>}
        </td>
        <td className="vd-td">
          <div className="vd-td-primary">{w.coupleNames}</div>
          <div className="vd-td-sub">{w.contactPhone}</div>
        </td>
        <td className="vd-td vd-td--mono">{w.time || '—'}</td>
        <td className="vd-td vd-td--center vd-td--mono">{w.guestCount || '—'}</td>
        <td className="vd-td">
          <span className={`vd-status vd-status--${w.status}`}>{STATUS_LABEL[w.status] || w.status}</span>
        </td>
        <td className="vd-td">
          {w.eventId
            ? <span className="vd-event-active"><Check size={11} /> מקושר</span>
            : <span className="vd-td-sub">—</span>}
        </td>
        <td className="vd-td vd-td--actions" onClick={e => e.stopPropagation()}>
          <button className="vd-tr-btn" onClick={() => navigate({ page: 'venue-wedding', weddingId: w.id })}>
            נהל ←
          </button>
          <button className="vd-tr-btn vd-tr-btn--del" onClick={() => onDelete(w.id)}>
            <Trash2 size={11} />
          </button>
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
          {[['today','היום'],['month','החודש'],['next30','30 הימים הקרובים']].map(([k, lbl]) => (
            <button
              key={k}
              className={`vd-filter-btn${quick === k ? ' active' : ''}`}
              onClick={() => setQuick(q => q === k ? null : k)}
            >{lbl}</button>
          ))}
          {(quick || search || statusFilter !== 'all' || monthFilter !== 'all') && (
            <button className="vd-crm-clear-all" onClick={() => {
              setQuick(null); setSearch(''); setStatusFilter('all'); setMonthFilter('all');
            }}>נקה הכל ×</button>
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
                <Users size={12} style={{ display: 'inline', marginLeft: 3 }} />
                אורחים
              </th>
              <th className="vd-th">סטטוס אירוע</th>
              <th className="vd-th">ניהול</th>
              <th className="vd-th">פעולות</th>
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
                        <div className="vd-past-sep">— אירועים שעברו —</div>
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
          const avail    = getAvailability(dateStr, weddings);
          const dayHols  = holidays[dateStr] || [];
          const majHol   = dayHols.find(h => h.major);
          const isToday  = dateStr === today;
          const isSel    = dateStr === selectedDate;
          const isPast   = dateStr < today;

          return (
            <button
              key={dateStr}
              title={majHol ? majHol.nameHe : undefined}
              onClick={() => onSelectDate(dateStr === selectedDate ? null : dateStr)}
              className={[
                'vd-cal-day',
                `vd-cal-day--${avail}`,
                isPast     ? 'vd-cal-day--past'     : '',
                isToday    ? 'vd-cal-day--today'    : '',
                isSel      ? 'vd-cal-day--selected' : '',
                majHol     ? 'vd-cal-day--holiday'  : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="vd-cal-day-num">{parseInt(dateStr.slice(8), 10)}</span>
              {majHol && <span className="vd-cal-hol-dot" />}
            </button>
          );
        })}
      </div>

      <div className="vd-cal-legend">
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--available" />פנוי</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--option" />אופציה</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--booked" />תפוס</span>
        <span className="vd-cal-leg-item"><span className="vd-cal-leg-dot vd-cal-leg-dot--holiday" />חג</span>
      </div>
    </div>
  );
}

// ── Day Detail Panel ──────────────────────────────────────────────────────────

const AVAIL_LABEL = { available: 'פנוי',  option: 'אופציה', booked: 'תפוס' };
const AVAIL_CLS   = { available: 'green', option: 'amber',   booked: 'red'  };

function DayPanel({ dateStr, weddings, onClose }) {
  if (!dateStr) {
    return (
      <div className="vd-day-panel vd-day-panel--empty">
        <Calendar size={28} strokeWidth={1} style={{ opacity: 0.25, marginBottom: 8 }} />
        <div>לחץ על תאריך בלוח לבדיקת זמינות</div>
      </div>
    );
  }

  const avail       = getAvailability(dateStr, weddings);
  const events      = weddings.filter(w => w.date === dateStr);
  const holidays    = getHolidaysForDate(dateStr);
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

      {events.length > 0 && (
        <div className="vd-day-events">
          {events.map(w => (
            <div key={w.id} className="vd-day-event">
              <div className="vd-day-event-couple">{w.coupleNames}</div>
              <div className="vd-day-event-meta">{w.time} · {w.guestCount} אורחים</div>
              <span className={`vd-status vd-status--${w.status}`}>{STATUS_LABEL[w.status]}</span>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="vd-day-suggestions">
          <div className="vd-day-sug-title">הצע תאריכים חלופיים:</div>
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

function DateChecker({ weddings }) {
  const [date,   setDate]   = useState('');
  const [result, setResult] = useState(null);

  const check = () => {
    if (!date) return;
    const avail       = getAvailability(date, weddings);
    const events      = weddings.filter(w => w.date === date);
    const suggestions = avail !== 'available' ? getSuggestedDates(date, weddings, 5) : [];
    const holiday     = getMajorHolidayForDate(date);
    setResult({ date, avail, events, suggestions, holiday });
  };

  const reset = () => { setDate(''); setResult(null); };

  return (
    <div className="vd-checker">
      <div className="vd-checker-row">
        <div className="vd-checker-label">בדיקת זמינות תאריך</div>
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
          </div>

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

  // KPIs
  const todayStr = toISODate(new Date());
  const upcoming = weddings.filter(w => w.date && w.date >= todayStr).length;
  const confirmed = weddings.filter(w => w.status === 'confirmed').length;
  const totalGuests = weddings.reduce((s, w) => s + (w.guestCount || 0), 0);
  const thisMonth = (() => {
    const now = new Date();
    return weddings.filter(w => {
      if (!w.date) return false;
      const d = new Date(w.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  })();

  return (
    <div className="vd-page vd-page--wide">
      {/* Header */}
      <div className="vd-header">
        <div>
          <h1 className="vd-title">כל החתונות</h1>
          <p className="vd-subtitle">ניהול חתונות ואירועים עבור {venue.name}</p>
        </div>
        <button className="venue-btn venue-btn--primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> חתונה חדשה
        </button>
      </div>

      {/* KPIs */}
      <div className="vd-kpi">
        <div className="vd-kpi-card">
          <div className="vd-kpi-val">{weddings.length}</div>
          <div className="vd-kpi-lbl">סה"כ חתונות</div>
        </div>
        <div className="vd-kpi-card vd-kpi-card--accent">
          <div className="vd-kpi-val">{upcoming}</div>
          <div className="vd-kpi-lbl">קרובות</div>
          <div className="vd-kpi-sub">{thisMonth} החודש</div>
        </div>
        <div className="vd-kpi-card">
          <div className="vd-kpi-val">{confirmed}</div>
          <div className="vd-kpi-lbl">מאושרות</div>
        </div>
        <div className="vd-kpi-card vd-kpi-card--gold">
          <div className="vd-kpi-val">{totalGuests.toLocaleString()}</div>
          <div className="vd-kpi-lbl">סה"כ מוזמנים</div>
        </div>
      </div>

      {/* Date checker */}
      <DateChecker weddings={weddings} />

      {/* Main layout */}
      <div className="vd-main-layout">
        <div className="vd-main-left">
          <CrmTable weddings={weddings} navigate={navigate} onDelete={handleDelete} />
        </div>
        <div className="vd-main-right">
          <MiniCalendar
            weddings={weddings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <DayPanel
            dateStr={selectedDate}
            weddings={weddings}
            onClose={() => setSelectedDate(null)}
          />
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

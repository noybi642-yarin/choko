import { useState, useMemo } from 'react';
import { getVenueWeddings, createVenueWedding, deleteVenueWedding } from '../store';
import { Calendar, Users, TrendingUp, Clock, Trash2, ChevronLeft, Plus } from 'lucide-react';

const STATUS_LABEL = {
  confirmed: 'מאושר',
  pending:   'ממתין',
  option:    'אופציה',
  cancelled: 'בוטל',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff;
}

function WeddingCard({ wedding, onOpen, onDelete }) {
  const days = daysUntil(wedding.date);
  const isPast = days !== null && days < 0;

  return (
    <div className="vd-card" onClick={() => onOpen(wedding)}>
      <div className="vd-card-head">
        <div>
          <div className="vd-card-couple">{wedding.coupleNames}</div>
          <div style={{ marginTop: 4 }}>
            <span className={`vd-status vd-status--${wedding.status}`}>
              {STATUS_LABEL[wedding.status] || wedding.status}
            </span>
          </div>
        </div>
        <div className="vd-card-actions">
          <button
            className="vd-card-icon-btn"
            title="מחק חתונה"
            onClick={e => { e.stopPropagation(); onDelete(wedding.id); }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="vd-card-meta">
        <div className="vd-card-meta-row">
          <span className="vd-card-meta-icon"><Calendar size={12}/></span>
          {formatDate(wedding.date)} · {wedding.time}
          {!isPast && days !== null && (
            <span style={{ color: days <= 30 ? '#B45309' : 'inherit', fontWeight: days <= 30 ? 700 : 'inherit' }}>
              &nbsp;· עוד {days} ימים
            </span>
          )}
          {isPast && <span style={{ color: '#94A3B8' }}>&nbsp;· עבר</span>}
        </div>
        <div className="vd-card-meta-row">
          <span className="vd-card-meta-icon"><Users size={12}/></span>
          {wedding.contactName} · {wedding.contactPhone}
        </div>
      </div>

      <div className="vd-card-stats">
        <div className="vd-pill">
          <div className="vd-pill-val">{wedding.guestCount || '—'}</div>
          <div className="vd-pill-lbl">מוזמנים</div>
        </div>
        <div className="vd-pill">
          <div className="vd-pill-val">{wedding.eventId ? 'פעיל' : '—'}</div>
          <div className="vd-pill-lbl">ניהול</div>
        </div>
      </div>

      {wedding.notes && (
        <div style={{ fontSize: 11.5, color: 'var(--venue-mute)', marginBottom: 10, lineHeight: 1.4, fontStyle: 'italic' }}>
          {wedding.notes}
        </div>
      )}

      <div className="vd-card-footer">
        <button className="vd-manage-btn" onClick={e => { e.stopPropagation(); onOpen(wedding); }}>
          נהל חתונה ←
        </button>
      </div>
    </div>
  );
}

// ── Add Wedding Modal ──────────────────────────────────────────────────────────
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
    const wedding = createVenueWedding(venueId, { ...form, guestCount: parseInt(form.guestCount) || 0 });
    onSave(wedding);
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
                placeholder="שם הכלה" required/>
            </div>
            <div className="vd-form-field">
              <label>שם החתן</label>
              <input className="vd-form-input" value={form.groomName}
                onChange={e => { set('groomName', e.target.value); set('coupleNames', `${form.brideName} & ${e.target.value}`); }}
                placeholder="שם החתן" required/>
            </div>
          </div>

          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>תאריך</label>
              <input className="vd-form-input" type="date" value={form.date}
                onChange={e => set('date', e.target.value)} required/>
            </div>
            <div className="vd-form-field">
              <label>שעה</label>
              <input className="vd-form-input" type="time" value={form.time}
                onChange={e => set('time', e.target.value)}/>
            </div>
          </div>

          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>מספר מוזמנים משוער</label>
              <input className="vd-form-input" type="number" min="1" value={form.guestCount}
                onChange={e => set('guestCount', e.target.value)} placeholder="200"/>
            </div>
            <div className="vd-form-field">
              <label>שם איש קשר</label>
              <input className="vd-form-input" value={form.contactName}
                onChange={e => set('contactName', e.target.value)} placeholder="שם מלא"/>
            </div>
          </div>

          <div className="vd-form-row">
            <div className="vd-form-field">
              <label>טלפון</label>
              <input className="vd-form-input" type="tel" value={form.contactPhone}
                onChange={e => set('contactPhone', e.target.value)} placeholder="050-0000000"/>
            </div>
            <div className="vd-form-field">
              <label>דוא"ל</label>
              <input className="vd-form-input" type="email" value={form.contactEmail}
                onChange={e => set('contactEmail', e.target.value)} placeholder="couple@example.com"/>
            </div>
          </div>

          <div className="vd-form-field">
            <label>הערות</label>
            <input className="vd-form-input" value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="חופה בגן, מוזיקה חיה..."/>
          </div>

          <div className="vd-modal-actions">
            <button type="submit" className="venue-btn venue-btn--primary">
              <Plus size={14}/> צור חתונה
            </button>
            <button type="button" className="venue-btn venue-btn--ghost" onClick={onClose}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function VenueDashboard({ venue, navigate }) {
  const [weddings, setWeddings] = useState(() => getVenueWeddings(venue.id));
  const [filter,   setFilter]   = useState('all');
  const [showAdd,  setShowAdd]  = useState(false);

  const reload = () => setWeddings(getVenueWeddings(venue.id));

  const handleDelete = id => {
    if (!confirm('למחוק את החתונה?')) return;
    deleteVenueWedding(id);
    reload();
  };

  const handleSave = () => { reload(); setShowAdd(false); };

  const filtered = useMemo(() => {
    if (filter === 'all') return weddings;
    return weddings.filter(w => w.status === filter);
  }, [weddings, filter]);

  // KPIs
  const now = new Date();
  const upcoming = weddings.filter(w => w.date && new Date(w.date) > now).length;
  const confirmed = weddings.filter(w => w.status === 'confirmed').length;
  const totalGuests = weddings.reduce((s, w) => s + (w.guestCount || 0), 0);
  const thisMonth = weddings.filter(w => {
    if (!w.date) return false;
    const d = new Date(w.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="vd-page">
      <div className="vd-header">
        <div>
          <h1 className="vd-title">כל החתונות</h1>
          <p className="vd-subtitle">ניהול חתונות ואורחים עבור {venue.name}</p>
        </div>
        <button className="venue-btn venue-btn--primary" onClick={() => setShowAdd(true)}>
          <Plus size={14}/> חתונה חדשה
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

      {/* Filters */}
      <div className="vd-filters">
        {[['all','הכל'], ['confirmed','מאושר'], ['pending','ממתין'], ['option','אופציה']].map(([id, lbl]) => (
          <button key={id} className={`vd-filter-btn${filter===id?' active':''}`}
            onClick={() => setFilter(id)}>{lbl}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="vd-grid">
        {filtered.length === 0 ? (
          <div className="vd-empty">
            <div className="vd-empty-icon">
              <Calendar size={48} strokeWidth={1}/>
            </div>
            <div className="vd-empty-title">אין חתונות להצגה</div>
            <div className="vd-empty-sub">לחצו על "חתונה חדשה" כדי להתחיל</div>
          </div>
        ) : (
          filtered.map(w => (
            <WeddingCard
              key={w.id}
              wedding={w}
              onOpen={w => navigate({ page: 'venue-wedding', weddingId: w.id })}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showAdd && (
        <AddWeddingModal
          venueId={venue.id}
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

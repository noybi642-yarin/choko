import { useState, useEffect } from 'react';
import { getEvent, getGuests, addGuest, updateGuestStatus, deleteGuest } from '../store';
import ImportGuests from '../components/ImportGuests';

const STATUS_LABEL  = { coming: 'מגיע/ה', maybe: 'אולי', no: 'לא מגיע/ה', pending: 'ממתין/ה' };
const STATUS_COLOR  = { coming: 'green', maybe: 'yellow', no: 'red', pending: 'gray' };
const STATUS_EMOJI  = { coming: '✅', maybe: '🤔', no: '❌', pending: '⏳' };

const GROUP_PALETTE = [
  '#fff3e0','#e8f5e9','#e3f2fd','#fce4ec','#f3e5f5',
  '#e0f7fa','#fff8e1','#fbe9e7','#e8eaf6','#e0f2f1',
];
const _groupColors = {};
let _ci = 0;
function groupColor(g) {
  if (!g) return 'transparent';
  if (!_groupColors[g]) _groupColors[g] = GROUP_PALETTE[_ci++ % GROUP_PALETTE.length];
  return _groupColors[g];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function StatsBar({ guests }) {
  const total     = guests.length;
  const coming    = guests.filter(g => g.status === 'coming').length;
  const maybe     = guests.filter(g => g.status === 'maybe').length;
  const no        = guests.filter(g => g.status === 'no').length;
  const pending   = guests.filter(g => g.status === 'pending').length;
  const headCount = guests.filter(g => g.status === 'coming').reduce((s, g) => s + (g.guests || 1), 0);

  return (
    <div className="stats-bar">
      <div className="stat-card total"><div className="stat-big">{total}</div><div className="stat-name">סה"כ מוזמנים</div></div>
      <div className="stat-card coming"><div className="stat-big">{coming}</div><div className="stat-name">אישרו הגעה</div></div>
      <div className="stat-card heads"><div className="stat-big">{headCount}</div><div className="stat-name">צפויים להגיע</div></div>
      <div className="stat-card maybe"><div className="stat-big">{maybe}</div><div className="stat-name">אולי</div></div>
      <div className="stat-card no"><div className="stat-big">{no}</div><div className="stat-name">לא מגיעים</div></div>
      <div className="stat-card pending"><div className="stat-big">{pending}</div><div className="stat-name">טרם ענו</div></div>
    </div>
  );
}

function AddGuestForm({ eventId, onAdded }) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [open, setOpen]   = useState(false);

  const submit = (e) => {
    e.preventDefault();
    addGuest(eventId, name.trim(), phone.trim());
    setName(''); setPhone(''); setOpen(false);
    onAdded();
  };

  if (!open) return (
    <button className="add-guest-btn" onClick={() => setOpen(true)}>+ הוסף אורח/ת</button>
  );

  return (
    <form className="add-guest-form" onSubmit={submit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="שם מלא" required />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="טלפון" type="tel" />
      <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>הוסף</button>
      <button type="button" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 14 }} onClick={() => setOpen(false)}>ביטול</button>
    </form>
  );
}

function GuestRow({ guest, eventId, onChange }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus]   = useState(guest.status);
  const [count, setCount]     = useState(guest.guests || 0);

  const save = () => {
    updateGuestStatus(guest.id, status, status === 'coming' ? count : 0);
    setEditing(false);
    onChange();
  };

  const remove = () => {
    if (!confirm(`למחוק את ${guest.name}?`)) return;
    deleteGuest(guest.id);
    onChange();
  };

  const rsvpUrl = `#/rsvp/${eventId}/${guest.id}`;

  return (
    <tr className={`guest-row status-${STATUS_COLOR[guest.status]}`}>
      <td className="guest-name">{guest.name}</td>
      <td className="guest-phone">{guest.phone || '—'}</td>
      <td>
        {guest.group
          ? <span className="group-tag" style={{ background: groupColor(guest.group) }}>{guest.group}</span>
          : <span style={{ color: '#bbb' }}>—</span>}
      </td>
      <td>
        {editing ? (
          <select value={status} onChange={e => setStatus(e.target.value)} className="status-select">
            <option value="pending">⏳ ממתין/ה</option>
            <option value="coming">✅ מגיע/ה</option>
            <option value="maybe">🤔 אולי</option>
            <option value="no">❌ לא מגיע/ה</option>
          </select>
        ) : (
          <span className={`status-badge ${STATUS_COLOR[guest.status]}`}>
            {STATUS_EMOJI[guest.status]} {STATUS_LABEL[guest.status]}
          </span>
        )}
      </td>
      <td className="guest-count">
        {editing && status === 'coming' ? (
          <input type="number" min={1} max={20} value={count} onChange={e => setCount(+e.target.value)}
            style={{ width: 56, textAlign: 'center' }} />
        ) : (
          guest.status === 'coming' ? (guest.guests || 1) + ' אנשים' : '—'
        )}
      </td>
      <td className="guest-actions">
        {editing ? (
          <>
            <button className="icon-btn save" onClick={save} title="שמור">✓</button>
            <button className="icon-btn" onClick={() => { setEditing(false); setStatus(guest.status); setCount(guest.guests||0); }} title="ביטול">✕</button>
          </>
        ) : (
          <>
            <button className="icon-btn" onClick={() => setEditing(true)} title="ערוך">✏️</button>
            <a className="icon-btn rsvp-link" href={rsvpUrl} title="שלח/צפה בהזמנה">📨</a>
            <button className="icon-btn danger" onClick={remove} title="מחק">🗑</button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function EventDetail({ eventId, navigate }) {
  const [event, setEvent]       = useState(null);
  const [guests, setGuests]     = useState([]);
  const [filter, setFilter]     = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [showImport, setShowImport]   = useState(false);

  const load = () => {
    setEvent(getEvent(eventId));
    setGuests(getGuests(eventId));
  };

  useEffect(load, [eventId]);

  if (!event) return <div className="page-content"><p>האירוע לא נמצא.</p></div>;

  const groups = [...new Set(guests.map(g => g.group).filter(Boolean))].sort();

  const filtered = guests.filter(g => {
    const statusOk = filter === 'all' || g.status === filter;
    const groupOk  = groupFilter === 'all' || g.group === groupFilter;
    return statusOk && groupOk;
  });

  const statusTabs = [
    { key: 'all',     label: 'הכל',       count: guests.length },
    { key: 'coming',  label: 'אישרו',      count: guests.filter(g => g.status === 'coming').length },
    { key: 'maybe',   label: 'אולי',       count: guests.filter(g => g.status === 'maybe').length },
    { key: 'no',      label: 'לא מגיעים', count: guests.filter(g => g.status === 'no').length },
    { key: 'pending', label: 'ממתינים',    count: guests.filter(g => g.status === 'pending').length },
  ];

  return (
    <div className="page-content">
      {showImport && (
        <ImportGuests
          eventId={event.id}
          onDone={load}
          onClose={() => setShowImport(false)}
        />
      )}

      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'dashboard' })}>← חזרה</button>
          <h1 className="page-title">{event.title}</h1>
          <p className="page-sub">
            📅 {formatDate(event.date)} · {event.time} &nbsp;|&nbsp; 📍 {event.venue}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => navigate({ page: 'rsvp', eventId: event.id, guestId: 'preview' })}>
            👁 תצוגת אורח
          </button>
          <button className="btn btn-ghost" onClick={() => navigate({ page: 'invite-design', eventId: event.id })}>
            🎨 עצב הזמנה
          </button>
          <button className="btn btn-wa" onClick={() => navigate({ page: 'whatsapp-scheduler', eventId: event.id })}>
            📱 שיגור הזמנות
          </button>
        </div>
      </div>

      <StatsBar guests={guests} />

      <div className="section-card">
        <div className="section-card-header">
          <h2>רשימת אורחים</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost import-btn" onClick={() => setShowImport(true)}>
              📥 ייבוא מאקסל
            </button>
            <AddGuestForm eventId={event.id} onAdded={load} />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="filter-tabs">
          {statusTabs.map(t => (
            <button
              key={t.key}
              className={`filter-tab ${filter === t.key ? 'active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label} <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Group filter chips */}
        {groups.length > 0 && (
          <div className="group-filters">
            <button
              className={`group-chip ${groupFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGroupFilter('all')}
            >
              כל הקבוצות
            </button>
            {groups.map(g => (
              <button
                key={g}
                className={`group-chip ${groupFilter === g ? 'active' : ''}`}
                style={groupFilter === g ? {} : { background: groupColor(g) }}
                onClick={() => setGroupFilter(g === groupFilter ? 'all' : g)}
              >
                {g}
                <span className="tab-count">{guests.filter(gg => gg.group === g).length}</span>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-table">אין אורחים בקטגוריה זו</div>
        ) : (
          <div className="table-wrap">
            <table className="guests-table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>קבוצה</th>
                  <th>סטטוס</th>
                  <th>מספר אנשים</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <GuestRow key={g.id} guest={g} eventId={event.id} onChange={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

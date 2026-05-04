import { useState, useEffect } from 'react';
import { getEvents, getGuests, deleteEvent } from '../store';
import KPISection from '../components/KPISection';

const EVENT_TYPE_LABELS = { wedding: 'חתונה', birthday: 'יום הולדת', bar: 'בר/בת מצווה', other: 'אחר' };
const EVENT_TYPE_EMOJI = { wedding: '💍', birthday: '🎂', bar: '✡️', other: '🎉' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function EventCard({ event, onOpen, onDelete }) {
  const guests = getGuests(event.id);
  const coming = guests.filter(g => g.status === 'coming').reduce((sum, g) => sum + (g.guests || 1), 0);
  const confirmed = guests.filter(g => g.status === 'coming').length;
  const pending = guests.filter(g => g.status === 'pending').length;
  const total = guests.length;

  const pct = total ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="event-card" onClick={() => onOpen(event.id)}>
      <div className="event-card-header">
        <div className="event-type-badge">
          <span>{EVENT_TYPE_EMOJI[event.type] || '🎉'}</span>
          <span>{EVENT_TYPE_LABELS[event.type] || 'אחר'}</span>
        </div>
        <button className="icon-btn danger" onClick={e => { e.stopPropagation(); onDelete(event.id); }} title="מחק אירוע">✕</button>
      </div>

      <h3 className="event-card-title">{event.title}</h3>

      <div className="event-card-meta">
        <div className="meta-row"><span className="meta-icon">📅</span>{formatDate(event.date)} · {event.time}</div>
        <div className="meta-row"><span className="meta-icon">📍</span>{event.venue}</div>
      </div>

      <div className="event-card-stats">
        <div className="stat-pill"><span className="stat-n">{total}</span><span className="stat-l">מוזמנים</span></div>
        <div className="stat-pill coming"><span className="stat-n">{confirmed}</span><span className="stat-l">אישרו</span></div>
        <div className="stat-pill pending"><span className="stat-n">{pending}</span><span className="stat-l">ממתינים</span></div>
        <div className="stat-pill guests"><span className="stat-n">{coming}</span><span className="stat-l">צפויים</span></div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: pct + '%' }}></div>
      </div>
      <div className="progress-label">{pct}% אישרו הגעה</div>
    </div>
  );
}

export default function Dashboard({ user, navigate }) {
  const [events, setEvents] = useState([]);

  const load = () => setEvents(getEvents(user.email));
  useEffect(load, [user.email]);

  const handleDelete = (id) => {
    if (!confirm('למחוק את האירוע?')) return;
    deleteEvent(id);
    load();
  };

  return (
    <div className="page-content aurora-page">
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-layer" />
        <div className="aurora-layer-2" />
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">שלום, {user.name} 👋</h1>
          <p className="page-sub">ניהול האירועים שלך</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate({ page: 'event-create' })}>
          + צור אירוע חדש
        </button>
      </div>

      {events.length > 0 && <KPISection userId={user.email} />}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>אין אירועים עדיין</h3>
          <p>צור את האירוע הראשון שלך ותתחיל לנהל אורחים</p>
          <button className="btn btn-primary" onClick={() => navigate({ page: 'event-create' })}>צור אירוע</button>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              onOpen={id => navigate({ page: 'event-detail', eventId: id })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

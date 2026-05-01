import { useState } from 'react';
import { createEvent } from '../store';

const TYPES = [
  { value: 'wedding',  label: 'חתונה',         emoji: '💍' },
  { value: 'birthday', label: 'יום הולדת',      emoji: '🎂' },
  { value: 'bar',      label: 'בר/בת מצווה',    emoji: '✡️' },
  { value: 'other',    label: 'אחר',             emoji: '🎉' },
];

export default function EventCreate({ user, navigate }) {
  const [type, setType]   = useState('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate]   = useState('');
  const [time, setTime]   = useState('19:30');
  const [venue, setVenue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const ev = createEvent({ type, title, date, time, venue }, user.email);
      navigate({ page: 'event-detail', eventId: ev.id });
    }, 400);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'dashboard' })}>← חזרה</button>
          <h1 className="page-title">אירוע חדש</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>

          <div className="field-group">
            <label className="field-label">סוג האירוע</label>
            <div className="type-grid">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`type-btn ${type === t.value ? 'active' : ''}`}
                  onClick={() => setType(t.value)}
                >
                  <span className="type-emoji">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>שם האירוע</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'wedding' ? 'לדוגמה: חתונת נוי & ירין' : 'שם האירוע'}
              required
            />
          </div>

          <div className="fields-row">
            <div className="field">
              <label>תאריך</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>שעה</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>מקום האירוע</label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="לדוגמה: גני התערוכה, תל אביב"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate({ page: 'dashboard' })}>ביטול</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner"></span> : 'צור אירוע ←'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

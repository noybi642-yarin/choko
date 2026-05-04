import { useState } from 'react';
import { createEvent } from '../store';

const TYPES = [
  { value: 'wedding',  label: 'חתונה',         emoji: '💍' },
  { value: 'birthday', label: 'יום הולדת',      emoji: '🎂' },
  { value: 'bar',      label: 'בר/בת מצווה',    emoji: '✡️' },
  { value: 'other',    label: 'אחר',             emoji: '🎉' },
];

function Field({ label, children, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function EventCreate({ user, navigate }) {
  const [type, setType] = useState('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30');
  const [venue, setVenue] = useState('');

  // Extended fields
  const [venueAddress, setVenueAddress] = useState('');
  const [receptionTime, setReceptionTime] = useState('');
  const [groomsParents, setGroomsParents] = useState('');
  const [bridesParents, setBridesParents] = useState('');
  const [honoree, setHonoree] = useState(''); // birthday / bar name

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const ev = createEvent({
        type, title, date, time, venue,
        venueAddress, receptionTime,
        groomsParents, bridesParents,
        honoree,
      }, user.email);
      navigate({ page: 'event-detail', eventId: ev.id });
    }, 400);
  };

  return (
    <div className="page-content aurora-page">
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-layer" />
        <div className="aurora-layer-2" />
      </div>
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'dashboard' })}>← חזרה</button>
          <h1 className="page-title">אירוע חדש</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>

          {/* Type picker */}
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

          {/* Event name */}
          <Field label="שם האירוע">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'wedding' ? 'לדוגמה: חתונת נוי & ירין' : 'שם האירוע'}
              required
            />
          </Field>

          {/* Wedding-specific: couple / parents */}
          {type === 'wedding' && (
            <>
              <div className="fields-row">
                <Field label="הורי החתן" hint="יופיע על ההזמנה">
                  <input
                    type="text"
                    value={groomsParents}
                    onChange={e => setGroomsParents(e.target.value)}
                    placeholder="שלום ישראלי וישראלה שלום"
                  />
                </Field>
                <Field label="הורי הכלה" hint="יופיע על ההזמנה">
                  <input
                    type="text"
                    value={bridesParents}
                    onChange={e => setBridesParents(e.target.value)}
                    placeholder="יוסי ושמרית כהן"
                  />
                </Field>
              </div>
            </>
          )}

          {/* Birthday / bar honoree */}
          {(type === 'birthday' || type === 'bar') && (
            <Field
              label={type === 'bar' ? 'שם בר/בת המצווה' : 'שם יום ההולדת'}
              hint="יופיע על ההזמנה"
            >
              <input
                type="text"
                value={honoree}
                onChange={e => setHonoree(e.target.value)}
                placeholder={type === 'bar' ? 'יוסי ישראלי' : 'מיכל כהן'}
              />
            </Field>
          )}

          {/* Date & time */}
          <div className="fields-row">
            <Field label="תאריך">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </Field>
            {type === 'wedding' ? (
              <>
                <Field label="קבלת פנים">
                  <input type="time" value={receptionTime} onChange={e => setReceptionTime(e.target.value)} />
                </Field>
                <Field label="חופה וקידושין">
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
                </Field>
              </>
            ) : (
              <Field label="שעה">
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
              </Field>
            )}
          </div>

          {/* Venue */}
          <Field label="שם המקום">
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="לדוגמה: גני התערוכה, תל אביב"
              required
            />
          </Field>
          <Field label="כתובת (אופציונלי)" hint="יופיע על ההזמנה">
            <input
              type="text"
              value={venueAddress}
              onChange={e => setVenueAddress(e.target.value)}
              placeholder="הרוקמים 27, חולון"
            />
          </Field>

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

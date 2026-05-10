import { useState, useEffect } from 'react';
import { getEvent, getGuests, updateGuestStatus, getVenueByEventId } from '../store';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GuestRSVP({ eventId, guestId }) {
  const [event, setEvent]     = useState(null);
  const [guest, setGuest]     = useState(null);
  const [venue, setVenue]     = useState(null);
  const [selected, setSelected] = useState(null);
  const [count, setCount]     = useState(1);
  const [sent, setSent]       = useState(false);
  const [burst, setBurst]     = useState(false);

  useEffect(() => {
    const ev = getEvent(eventId);
    setEvent(ev);
    const v = getVenueByEventId(eventId);
    setVenue(v);
    if (guestId && guestId !== 'preview') {
      const guests = getGuests(eventId);
      const g = guests.find(g => g.id === guestId);
      if (g) { setGuest(g); setSelected(g.status !== 'pending' ? g.status : null); setCount(g.guests || 1); }
    }
  }, [eventId, guestId]);

  if (!event) return (
    <div className="rsvp-page"><div className="rsvp-page-card"><p style={{ textAlign: 'center' }}>ההזמנה לא נמצאה</p></div></div>
  );

  const isPreview = guestId === 'preview';
  const guestName = guest?.name || 'אורח יקר';

  const handleSend = () => {
    if (!selected) return;
    if (!isPreview) {
      updateGuestStatus(guestId, selected, selected === 'coming' ? count : 0);
    }
    setSent(true);
    if (selected === 'coming') { setBurst(true); setTimeout(() => setBurst(false), 2000); }
  };

  return (
    <div className="rsvp-page">
      {isPreview && (
        <div className="preview-banner">
          👁 מצב תצוגה מקדימה — כך האורחים יראו את ההזמנה
          <a href={`#/events/${eventId}`} className="preview-close">✕ סגור</a>
        </div>
      )}

      <div className="rsvp-page-card">
        {/* Venue branding header */}
        {venue && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '18px 24px 14px',
            background: venue.primaryColor + '10',
            borderBottom: `1px solid ${venue.primaryColor}22`,
          }}>
            {venue.logo ? (
              <img src={venue.logo} alt={venue.name}
                style={{ maxWidth: 90, maxHeight: 44, objectFit:'contain' }}/>
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: venue.primaryColor,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight: 800, fontSize: 18, color: 'white',
                fontFamily: 'Playfair Display,Georgia,serif',
              }}>
                {venue.name?.[0]}
              </div>
            )}
            <div style={{ fontSize:13, fontWeight:700, color:'#1a0a12' }}>{venue.name}</div>
            {venue.welcomeText && (
              <div style={{ fontSize:11, color:'#7a5060', textAlign:'center', maxWidth:260, lineHeight:1.5 }}>
                {venue.welcomeText}
              </div>
            )}
          </div>
        )}

        {/* Cover */}
        <div className="rsvp-page-cover" style={venue ? { '--rsvp-accent': venue.primaryColor } : {}}>
          <div className="rsvp-page-cover-inner">
            <div className="rsvp-page-eyebrow">הזמנה לאירוע</div>
            <h1 className="rsvp-page-title">{event.title}</h1>
          </div>
        </div>

        {/* Details */}
        <div className="rsvp-page-body">
          <div className="rsvp-page-details">
            <div className="rsvp-detail-cell">
              <div className="rsvp-detail-icon">📅</div>
              <div>
                <div className="rsvp-detail-label">תאריך</div>
                <div className="rsvp-detail-value">{formatDate(event.date)}</div>
              </div>
            </div>
            <div className="rsvp-detail-cell">
              <div className="rsvp-detail-icon">🕖</div>
              <div>
                <div className="rsvp-detail-label">שעה</div>
                <div className="rsvp-detail-value">{event.time}</div>
              </div>
            </div>
            <div className="rsvp-detail-cell">
              <div className="rsvp-detail-icon">📍</div>
              <div>
                <div className="rsvp-detail-label">מקום</div>
                <div className="rsvp-detail-value">{event.venue}</div>
              </div>
            </div>
          </div>

          {sent ? (
            <div className="rsvp-done">
              <div className="rsvp-done-icon">{selected === 'coming' ? '🎉' : selected === 'maybe' ? '🤔' : '😢'}</div>
              <h2>{selected === 'coming' ? 'תודה! נתראה באירוע' : selected === 'maybe' ? 'תודה, נעדכן אותך' : 'תודה על העדכון'}</h2>
              {selected === 'coming' && <p>אישרת הגעה עבור {count} {count === 1 ? 'אדם' : 'אנשים'} 🥂</p>}
              {burst && (
                <div className="rsvp-confetti">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const colors = ['#ff7a59', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'];
                    return <i key={i} style={{
                      '--dx': (Math.random() * 200 - 100) + 'px',
                      '--dy': (Math.random() * -150 - 50) + 'px',
                      background: colors[i % colors.length],
                      animationDelay: (i * 0.04) + 's',
                    }}></i>;
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="rsvp-page-greeting">שלום {guestName}, נשמח לדעת האם תגיע/י!</p>

              <div className="rsvp-page-opts">
                {[
                  { key: 'coming', emoji: '🎉', label: 'בטח!' },
                  { key: 'maybe',  emoji: '🤔', label: 'אולי' },
                  { key: 'no',     emoji: '😢', label: 'לא יכול/ה' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    className={`rsvp-page-opt ${opt.key} ${selected === opt.key ? 'active' : ''}`}
                    onClick={() => setSelected(opt.key)}
                  >
                    <span className="rsvp-opt-emoji">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              {selected === 'coming' && (
                <div className="rsvp-count-row">
                  <span>כמה אנשים?</span>
                  <div className="rsvp-stepper">
                    <button onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                    <span className="rsvp-count-num">{count}</span>
                    <button onClick={() => setCount(count + 1)}>+</button>
                  </div>
                </div>
              )}

              <button
                className={`rsvp-page-send ${!selected ? 'disabled' : ''}`}
                onClick={handleSend}
                disabled={!selected}
              >
                {isPreview ? '(תצוגה — שליחה לא פעילה)' : 'שלח אישור'}
              </button>
            </>
          )}
        </div>

        <div className="rsvp-page-footer">
          נשלח דרך <strong>choko<span style={{ color: 'var(--coral)' }}>•</span></strong>
        </div>
      </div>
    </div>
  );
}

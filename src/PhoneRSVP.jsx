import { useState, useEffect } from 'react';

export default function PhoneRSVP({ eventType = 'wedding' }) {
  const [selected, setSelected] = useState(null);
  const [guests, setGuests] = useState(2);
  const [sent, setSent] = useState(false);
  const [burst, setBurst] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let raf;
    let start = performance.now();
    const tick = (now) => {
      setTime((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const cycle = time % 10;
    if (cycle < 2) {
      if (selected !== null || sent) {
        setSelected(null); setSent(false); setGuests(2); setBurst(false);
      }
    } else if (cycle >= 2 && cycle < 4) {
      if (selected !== 'coming') setSelected('coming');
    } else if (cycle >= 4 && cycle < 5.5) {
      if (guests !== 3) setGuests(3);
    } else if (cycle >= 6 && cycle < 7.5) {
      if (!sent) { setSent(true); setBurst(true); setTimeout(() => setBurst(false), 1300); }
    }
  }, [time]);

  const eventData = eventType === 'wedding'
    ? { eyebrow: 'הזמנה לחתונה', title: <>נוי <em>&</em> ירין</>, date: '15 אוגוסט', time: '19:30', place: 'גני התערוכה' }
    : eventType === 'birthday'
    ? { eyebrow: 'יום הולדת 30', title: <>יאללה<br />חוגגים <em>!</em></>, date: '22 יוני', time: '21:00', place: 'בר רוטשילד' }
    : { eyebrow: 'בר מצווה', title: <>הבר מצווה <em>של</em> יונתן</>, date: '8 ספטמבר', time: '18:00', place: 'אולמי גליקסון' };

  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-notch"></div>
          <div className="phone-status">
            <span>9:41</span>
            <span className="dots">
              <span className="bars" style={{ height: 10 }}>
                <i style={{ height: 4 }}></i>
                <i style={{ height: 6 }}></i>
                <i style={{ height: 8 }}></i>
                <i style={{ height: 10 }}></i>
              </span>
              <span style={{ marginInlineStart: 6, fontSize: 11 }}>100%</span>
            </span>
          </div>

          <div className="rsvp">
            <div className="rsvp-cover">
              <div className="rsvp-cover-text">
                <div className="rsvp-cover-eyebrow">{eventData.eyebrow}</div>
                <div className="rsvp-cover-title">{eventData.title}</div>
              </div>
            </div>
            <div className="rsvp-body">
              <div className="rsvp-meta">
                <div className="rsvp-meta-cell">
                  <div className="lbl">תאריך</div>
                  <div className="val">{eventData.date}</div>
                </div>
                <div className="rsvp-meta-cell">
                  <div className="lbl">שעה</div>
                  <div className="val">{eventData.time}</div>
                </div>
                <div className="rsvp-meta-cell">
                  <div className="lbl">מקום</div>
                  <div className="val">{eventData.place}</div>
                </div>
              </div>

              <div className="rsvp-q">תגיעו?</div>
              <div className="rsvp-options">
                <div className={`rsvp-opt coming ${selected === 'coming' ? 'is-selected' : ''}`} onClick={() => setSelected('coming')}>
                  <span className="emo">🎉</span>בטח!
                </div>
                <div className={`rsvp-opt maybe ${selected === 'maybe' ? 'is-selected' : ''}`} onClick={() => setSelected('maybe')}>
                  <span className="emo">🤔</span>אולי
                </div>
                <div className={`rsvp-opt no ${selected === 'no' ? 'is-selected' : ''}`} onClick={() => setSelected('no')}>
                  <span className="emo">😢</span>לא
                </div>
              </div>

              {selected === 'coming' && (
                <div className="rsvp-guests">
                  <span className="lbl">כמה אתם?</span>
                  <div className="stepper">
                    <button onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
                    <span className="num">{guests}</span>
                    <button onClick={() => setGuests(guests + 1)}>+</button>
                  </div>
                </div>
              )}

              <button
                className={`rsvp-send ${sent ? 'sent' : ''}`}
                onClick={() => { setSent(true); setBurst(true); setTimeout(() => setBurst(false), 1300); }}
              >
                {sent ? <span><span className="check">✓</span> נשלח! נתראה</span> : 'שליחת אישור'}
              </button>

              {burst && (
                <div className={`confetti-burst ${burst ? 'go' : ''}`}>
                  {Array.from({ length: 14 }).map((_, i) => {
                    const angle = (i / 14) * Math.PI * 2;
                    const dist = 60 + Math.random() * 30;
                    const colors = ['#ff7a59', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'];
                    return (
                      <i key={i} style={{
                        '--dx': Math.cos(angle) * dist + 'px',
                        '--dy': Math.sin(angle) * dist + 'px',
                        background: colors[i % colors.length],
                        animationDelay: (i * 0.02) + 's',
                      }}></i>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

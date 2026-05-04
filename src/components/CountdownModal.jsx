import { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, Heart, CalendarHeart } from 'lucide-react';

// ── Time calculation ─────────────────────────────────────────────────────────
function getTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60))       / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60))             / 1000),
  };
}

// ── Animated digit (CSS flip on key change) ──────────────────────────────────
function Digit({ value }) {
  const str = String(value).padStart(2, '0');
  return (
    // key forces remount → CSS animation replays on every tick
    <span className="cd-digit" key={`${value}-${Date.now()}`}>
      {str}
    </span>
  );
}

// ── Single time unit block ───────────────────────────────────────────────────
function TimeUnit({ value, label }) {
  return (
    <div className="cd-unit">
      <div className="cd-unit-box">
        <Digit value={value} />
      </div>
      <span className="cd-unit-label">{label}</span>
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function CountdownModal({ date, eventTitle, onClose }) {
  const [time, setTime] = useState(() => getTimeLeft(date));

  useEffect(() => {
    setTime(getTimeLeft(date));
    const id = setInterval(() => setTime(getTimeLeft(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isPast = new Date(date) < new Date();

  // Format Hebrew date display
  const hebrewDate = new Date(date).toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="cd-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cd-modal" role="dialog" aria-modal="true">

        {/* Decorative glow blobs */}
        <div className="cd-glow cd-glow-1" aria-hidden="true" />
        <div className="cd-glow cd-glow-2" aria-hidden="true" />

        {/* Close */}
        <button className="cd-close" onClick={onClose} aria-label="סגור">
          <X size={18} />
        </button>

        {/* Badge */}
        <div className="cd-badge">
          <Sparkles size={13} />
          <span>מתרגשים איתכם!!</span>
        </div>

        {/* Title */}
        <h2 className="cd-title">
          {eventTitle || 'האירוע שלכם'}
          <Heart size={22} className="cd-heart" fill="currentColor" />
        </h2>

        {/* Date display */}
        <div className="cd-date-row">
          <CalendarHeart size={15} />
          <span>{hebrewDate}</span>
        </div>

        {isPast ? (
          <p className="cd-past-msg">🎉 האירוע כבר קרה — מזל טוב!</p>
        ) : (
          <>
            {/* Countdown — always LTR so days sit on the left */}
            <div className="cd-units" dir="ltr">
              <TimeUnit value={time.days}    label="ימים" />
              <span className="cd-colon">:</span>
              <TimeUnit value={time.hours}   label="שעות" />
              <span className="cd-colon">:</span>
              <TimeUnit value={time.minutes} label="דקות" />
              <span className="cd-colon">:</span>
              <TimeUnit value={time.seconds} label="שניות" />
            </div>

            <p className="cd-sub">כל יום שעובר קרבנו לרגע הגדול 💛</p>
          </>
        )}

        {/* Dismiss */}
        <button className="cd-btn" onClick={onClose}>
          סיום — בואו נמשיך!
        </button>
      </div>
    </div>
  );
}

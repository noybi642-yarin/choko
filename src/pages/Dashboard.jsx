import '../couple.css';
import { useState, useEffect } from 'react';
import { getEvents } from '../store';
import {
  MapPin, Clock, Send, MessageCircle, Sparkles, Check,
  ListChecks, Milestone, Bell, AlertTriangle, Armchair, Map,
  Palette, Gem,
} from 'lucide-react';

/* ── mock data (store has no RSVP-stats / tasks / messages yet) ── */
const MOCK = {
  rsvp: { confirmed: 148, invited: 200 },
  seating: { done: 8, total: 20 },
  tasks: { done: 12, total: 20 },
};

const MOCK_TASKS = [
  { id: 't1', text: 'אישור תפריט סופי מול האולם', due: 'עוד 3 ימים', prio: '#D97706', done: false },
  { id: 't2', text: 'שליחת תזכורת RSVP למוזמנים', due: 'עוד 5 ימים', prio: '#8B5CF6', done: false },
  { id: 't3', text: 'פגישה עם הצלם — סגירת לוח זמנים', due: 'עוד שבוע', prio: '#8B5CF6', done: false },
  { id: 't4', text: 'בחירת שיר לכניסה לחופה', due: 'עוד שבועיים', prio: '#B08D57', done: false },
  { id: 't5', text: 'מדידת חליפה אחרונה', due: 'הושלם', prio: '#B08D57', done: true },
];

const MOCK_MESSAGES = [
  { id: 'm1', text: 'היי! עדכנו את הצעת התפריט לפי הבקשה שלכם — מחכים לאישור סופי שלכם עד 1 ביוני.', time: 'לפני שעה', unread: true },
  { id: 'm2', text: 'סגרנו את חדר ההתארגנות מ-16:00. צוות התאורה יגיע לסאונד-צ׳ק ב-17:30.', time: 'אתמול', unread: true },
  { id: 'm3', text: 'תודה על הפגישה! שלחנו סיכום עם כל הסיכומים לגבי סידור הרחבה.', time: 'לפני 3 ימים', unread: false },
];

/* ── helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - now) / 86400000));
}

function pct(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

/* ── empty state ── */
function EmptyState({ navigate }) {
  return (
    <div className="cd-page">
      <div className="cd-empty">
        <div className="cd-empty-ico"><Gem size={26} /></div>
        <h1 className="cd-empty-title">בואו נתחיל לתכנן את היום הגדול</h1>
        <p className="cd-empty-sub">צרו את האירוע שלכם וקבלו קוקפיט תכנון מלא — מוזמנים, הושבה, ציר זמן והכל במקום אחד.</p>
        <button className="cd-hero-cta" onClick={() => navigate({ page: 'event-create' })}>
          + צור את האירוע שלכם
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ user, navigate }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEvents(getEvents(user.email));
  }, [user.email]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (events.length === 0) return <EmptyState navigate={navigate} />;

  /* "the wedding" = first upcoming event, else the first one */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = [...events]
    .filter(e => e.date && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const wedding = upcoming[0] || events[0];

  const names = wedding.coupleName || wedding.title || user.name;
  const [nameA, nameB] = names.includes('&') ? names.split('&').map(s => s.trim()) : [names, null];

  const days = daysUntil(wedding.date);
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;

  const rsvpPct = pct(MOCK.rsvp.confirmed, MOCK.rsvp.invited);
  const seatPct = pct(MOCK.seating.done, MOCK.seating.total);
  const taskDone = tasks.filter(t => t.done).length + (MOCK.tasks.done - 1);
  const taskPct = pct(taskDone, MOCK.tasks.total);
  const pending = MOCK.rsvp.invited - MOCK.rsvp.confirmed;

  /* next recommended action */
  const nextAction = rsvpPct < 80
    ? {
        eyebrow: 'הפעולה הבאה שלכם',
        title: `שלחו תזכורת ל-${pending} מוזמנים שטרם אישרו`,
        sub: `אישרתם ${rsvpPct}% מהרשימה — תזכורת אחת בוואטסאפ בדרך כלל מקפיצה את האחוז משמעותית.`,
        cta: 'שליחת תזכורת בוואטסאפ',
        ctaClass: '',
        Icon: Send,
        go: () => navigate({ page: 'whatsapp-scheduler', eventId: wedding.id }),
      }
    : {
        eyebrow: 'הפעולה הבאה שלכם',
        title: `השלימו את סידורי ההושבה — ${MOCK.seating.total - MOCK.seating.done} שולחנות נותרו`,
        sub: 'רוב המוזמנים כבר אישרו הגעה. זה הזמן המושלם לסגור את מפת ההושבה.',
        cta: 'לסידורי הושבה',
        ctaClass: 'violet',
        Icon: Armchair,
        go: () => navigate({ page: 'seating-plan', eventId: wedding.id }),
      };

  const venueName = (wedding.venue || 'גני האלגנס').split(',')[0].trim();

  const toggleTask = (id) =>
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  const timeline = [
    { title: 'סגירת אולם', date: 'הושלם · ינואר', state: 'done' },
    { title: 'הזמנות נשלחו', date: 'הושלם · אפריל', state: 'done' },
    { title: 'אישורי הגעה בתהליך', date: `${rsvpPct}% אישרו · עכשיו`, state: 'current' },
    { title: 'סידורי הושבה', date: `${MOCK.seating.done}/${MOCK.seating.total} שולחנות`, state: '' },
    { title: 'אישור תפריט', date: 'עד 1 ביוני', state: '' },
    { title: 'החתונה 🎉', date: formatDate(wedding.date), state: '' },
  ];

  const stats = [
    {
      num: <>{MOCK.rsvp.confirmed}<small>/{MOCK.rsvp.invited}</small></>,
      label: 'אישורי הגעה', pctVal: rsvpPct, pctText: `${rsvpPct}%`,
      gold: false, link: null,
    },
    {
      num: <>{MOCK.rsvp.invited}</>,
      label: 'מוזמנים ברשימה', pctVal: 100, pctText: '',
      gold: true, link: null,
    },
    {
      num: <>{MOCK.seating.done}<small>/{MOCK.seating.total}</small></>,
      label: 'הושבה — שולחנות', pctVal: seatPct, pctText: `${seatPct}%`,
      gold: false, link: () => navigate({ page: 'seating-plan', eventId: wedding.id }),
    },
    {
      num: <>{taskDone}<small>/{MOCK.tasks.total}</small></>,
      label: 'משימות הושלמו', pctVal: taskPct, pctText: `${taskPct}%`,
      gold: true, link: null,
    },
  ];

  return (
    <div className="cd-page">
      <div className="cd-wrap">

        {/* ── 1. Hero countdown ── */}
        <section className="cd-hero">
          <div className="cd-hero-main">
            <div className="cd-hero-eyebrow">החתונה שלכם</div>
            <h1 className="cd-hero-names">
              {nameB ? <>{nameA}<span className="cd-amp">&amp;</span>{nameB}</> : nameA}
            </h1>
            <div className="cd-hero-date">{formatDate(wedding.date)}</div>
            <button className="cd-hero-cta" onClick={nextAction.go}>
              <nextAction.Icon size={15} />
              הפעולה הבאה שלכם: אישורי הגעה
            </button>
          </div>

          <div className="cd-hero-side">
            <div className="cd-hero-venue">
              <div className="cd-hero-venue-name"><MapPin size={14} /> {wedding.venue}</div>
              {wedding.time && <span className="cd-chip"><Clock size={11} /> {wedding.time}</span>}
            </div>
            <div className="cd-count">
              <div className="cd-count-num">{days}</div>
              <div className="cd-count-label">ימים לחתונה</div>
              <div className="cd-count-units">
                <div className="cd-count-unit"><b>{weeks}</b><span>שבועות</span></div>
                <div className="cd-count-unit"><b>{remDays}</b><span>ימים</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Progress rail ── */}
        <section className="cd-stats">
          {stats.map((s, i) => (
            <div className="cd-card cd-stat" key={i}>
              <div className="cd-stat-top">
                <div className="cd-stat-num">{s.num}</div>
                {s.pctText && <div className="cd-stat-pct">{s.pctText}</div>}
              </div>
              <div className="cd-stat-label">{s.label}</div>
              <div className="cd-bar">
                <div
                  className={`cd-bar-fill${s.gold ? ' gold' : ''}`}
                  style={{ width: mounted ? `${s.pctVal}%` : '0%' }}
                />
              </div>
              <button
                className="cd-stat-link"
                onClick={s.link || undefined}
                disabled={!s.link}
              >
                נהל ←
              </button>
            </div>
          ))}
        </section>

        {/* ── 3. Next recommended action ── */}
        <section className="cd-action">
          <div className="cd-action-ico"><nextAction.Icon size={19} /></div>
          <div className="cd-action-body">
            <div className="cd-action-eyebrow">{nextAction.eyebrow}</div>
            <div className="cd-action-title">{nextAction.title}</div>
            <div className="cd-action-sub">{nextAction.sub}</div>
          </div>
          <button className={`cd-action-cta ${nextAction.ctaClass}`} onClick={nextAction.go}>
            <MessageCircle size={15} />
            {nextAction.cta}
          </button>
        </section>

        {/* ── 4. Two-column grid ── */}
        <div className="cd-grid">

          {/* LEFT column */}
          <div className="cd-col">

            {/* tasks */}
            <div className="cd-card cd-tasks">
              <div className="cd-card-head">
                <div className="cd-card-title"><ListChecks size={15} /> משימות קרובות</div>
              </div>
              <div style={{ height: 10 }} />
              {tasks.map(t => (
                <div className={`cd-task${t.done ? ' done' : ''}`} key={t.id}>
                  <button
                    className={`cd-check${t.done ? ' done' : ''}`}
                    onClick={() => toggleTask(t.id)}
                    aria-label={t.done ? 'בטל סימון' : 'סמן כהושלם'}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>
                  <span className="cd-prio" style={{ background: t.prio }} />
                  <span className="cd-task-text">{t.text}</span>
                  <span className="cd-due">{t.due}</span>
                </div>
              ))}
              <div className="cd-card-foot">
                <button className="cd-foot-link">לכל המשימות ←</button>
              </div>
            </div>

            {/* timeline */}
            <div className="cd-card">
              <div className="cd-card-head">
                <div className="cd-card-title"><Milestone size={15} /> ציר זמן החתונה</div>
              </div>
              <div style={{ height: 18 }} />
              <div className="cd-timeline">
                {timeline.map((item, i) => (
                  <div className={`cd-tl-item ${item.state}`} key={i}>
                    <div className="cd-tl-dot">
                      {item.state === 'done' && <Check size={8} strokeWidth={4} />}
                    </div>
                    <div>
                      <div className="cd-tl-title">{item.title}</div>
                      <div className="cd-tl-date">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="cd-col">

            {/* messages from venue */}
            <div className="cd-card cd-msgs" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="cd-card-head">
                <div className="cd-card-title"><MessageCircle size={15} /> הודעות מהאולם</div>
              </div>
              <div style={{ height: 6 }} />
              {MOCK_MESSAGES.map(m => (
                <div className="cd-msg" key={m.id}>
                  <div className="cd-msg-avatar">{venueName[0]}</div>
                  <div className="cd-msg-body">
                    <div className="cd-msg-top">
                      <div className="cd-msg-from">
                        {venueName}
                        {m.unread && <span className="cd-unread" />}
                      </div>
                      <div className="cd-msg-time">{m.time}</div>
                    </div>
                    <div className="cd-msg-text">{m.text}</div>
                  </div>
                </div>
              ))}
              <button className="cd-msg-reply">השב לאולם</button>
            </div>

            {/* alerts */}
            <div className="cd-card">
              <div className="cd-card-head">
                <div className="cd-card-title"><Bell size={15} /> התראות חשובות</div>
              </div>
              <div style={{ height: 12 }} />
              <div className="cd-alerts">
                <div className="cd-alert amber">
                  <span className="cd-alert-ico"><AlertTriangle size={15} /></span>
                  <span className="cd-alert-text">תפריט טרם אושר — נדרש עד 1 ביוני</span>
                  <button className="cd-alert-cta">לאישור ←</button>
                </div>
                <div className="cd-alert violet">
                  <span className="cd-alert-ico"><Bell size={15} /></span>
                  <span className="cd-alert-text">{pending} מוזמנים טרם ענו להזמנה</span>
                  <button
                    className="cd-alert-cta"
                    onClick={() => navigate({ page: 'whatsapp-scheduler', eventId: wedding.id })}
                  >
                    תזכורת ←
                  </button>
                </div>
              </div>
            </div>

            {/* quick access */}
            <div className="cd-card">
              <div className="cd-card-head">
                <div className="cd-card-title"><Sparkles size={15} /> גישה מהירה</div>
              </div>
              <div style={{ height: 12 }} />
              <div className="cd-quick">
                <button className="cd-quick-tile" onClick={() => navigate({ page: 'invite-design', eventId: wedding.id })}>
                  <Palette size={19} /> עיצוב הזמנה
                </button>
                <button className="cd-quick-tile" onClick={() => navigate({ page: 'seating-plan', eventId: wedding.id })}>
                  <Armchair size={19} /> סידורי הושבה
                </button>
                <button className="cd-quick-tile" onClick={() => navigate({ page: 'venue-canvas', eventId: wedding.id })}>
                  <Map size={19} /> עיצוב אולם
                </button>
                <button className="cd-quick-tile gold" onClick={() => navigate({ page: 'ai-assistant' })}>
                  <Sparkles size={19} /> חברי הטוב AI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Footer strip ── */}
        <div className="cd-footer">
          החתונה של {names}
          <span className="cd-sep">·</span>{venueName}
          <span className="cd-sep">·</span>{formatDate(wedding.date)}
        </div>

      </div>
    </div>
  );
}

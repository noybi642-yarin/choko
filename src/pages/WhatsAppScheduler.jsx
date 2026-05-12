import { useState, useMemo } from 'react';
import { getEvent, getGuests, getCampaigns, createCampaign, deleteCampaign, mockSendCampaign, MESSAGE_TEMPLATES } from '../store';

// ── Constants ──────────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS = [
  { value: 'all',          label: 'כל המוזמנים',  emoji: '👥', desc: 'שולח לרשימה המלאה' },
  { value: 'pending',      label: 'טרם ענו',       emoji: '⏳', desc: 'לא אישרו עדיין' },
  { value: 'coming',       label: 'אישרו הגעה',    emoji: '✅', desc: 'מגיעים בוודאות' },
  { value: 'maybe',        label: 'אולי מגיעים',   emoji: '🤔', desc: 'תשובה לא ודאית' },
  { value: 'bride-side',   label: 'צד כלה',        emoji: '👰', desc: 'קבוצת הכלה' },
  { value: 'groom-side',   label: 'צד חתן',        emoji: '🤵', desc: 'קבוצת החתן' },
];

const SCHEDULE_SLOTS = [
  { id: 'invite',   label: 'הזמנה ראשונה',             emoji: '💌', desc: 'שלח את ההזמנה הראשונית לאורחים',          days: -14, time: '10:00' },
  { id: 'reminder', label: 'תזכורת למי שלא ענה',        emoji: '🔔', desc: 'תזכורת לאורחים שטרם אישרו הגעה',           days: -7,  time: '10:00' },
  { id: 'final',    label: 'תזכורת אחרונה לפני האירוע', emoji: '⏰', desc: 'שלח יום לפני — לאורחים שאישרו',             days: -1,  time: '09:00' },
  { id: 'today',    label: 'ביום האירוע',               emoji: '🎉', desc: 'הודעת בוקר ביום החגיגה',                    days: 0,   time: '08:00' },
  { id: 'thanks',   label: 'הודעת תודה',                emoji: '🙏', desc: 'יום אחרי — תודה על ההגעה',                  days: 1,   time: '11:00' },
];

const STATUS_CFG = {
  draft:     { label: 'טיוטה',   color: '#94a3b8', bg: 'oklch(0.95 0.01 240)' },
  scheduled: { label: 'מתוזמן',  color: '#f59e0b', bg: '#fef9ee' },
  sending:   { label: 'בשליחה',  color: '#6366f1', bg: '#f0f0ff' },
  sent:      { label: 'נשלח',    color: '#25d366', bg: '#edfaf3' },
  failed:    { label: 'נכשל',    color: '#ef4444', bg: '#fff0f0' },
};

const AUDIENCE_FILTER = {
  all:          () => true,
  pending:      g => g.status === 'pending',
  coming:       g => g.status === 'coming',
  maybe:        g => g.status === 'maybe',
  'bride-side': g => g.group === 'צד כלה',
  'groom-side': g => g.group === 'צד חתן',
};

const STEPS = [
  { n: 1, label: 'קהל יעד' },
  { n: 2, label: 'ניסוח הודעה' },
  { n: 3, label: 'תזמון' },
  { n: 4, label: 'אישור' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function interpolate(text, vars) {
  return text
    .replace(/\{\{firstName\}\}/g,   vars.firstName   || 'ישראל')
    .replace(/\{\{coupleNames\}\}/g, vars.coupleNames || 'החתן והכלה')
    .replace(/\{\{eventDate\}\}/g,   vars.eventDate   || 'תאריך האירוע')
    .replace(/\{\{venueName\}\}/g,   vars.venueName   || 'שם המקום')
    .replace(/\{\{rsvpLink\}\}/g,    vars.rsvpLink    || 'https://choko.app/rsvp/...');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function addDays(dateStr, days) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Delivery Ring SVG ──────────────────────────────────────────────────────

function DeliveryRing({ pct = 97, size = 108, stroke = 9 }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="oklch(0.93 0.04 155)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#25d366" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.9s ease' }}
      />
    </svg>
  );
}

// ── WhatsApp Phone Mockup ──────────────────────────────────────────────────

function PhonePreview({ message, includeInviteImage, includeRsvpLink, vars }) {
  const text = interpolate(message || '', vars);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="wa2-phone-wrap">
      <div className="wa2-phone">
        <div className="wa2-phone-notch" />
        <div className="wa2-screen">
          <div className="wa2-wa-header">
            <div className="wa2-wa-back">‹</div>
            <div className="wa2-wa-avatar">ח</div>
            <div className="wa2-wa-info">
              <div className="wa2-wa-name">choko <span style={{ color: '#25d366', fontSize: 9 }}>●</span></div>
              <div className="wa2-wa-status">הודעה אוטומטית</div>
            </div>
            <div className="wa2-wa-more">⋮</div>
          </div>
          <div className="wa2-wa-body">
            <div className="wa2-wa-datesep">היום</div>
            <div className="wa2-wa-bubble-row">
              <div className="wa2-wa-bubble">
                {includeInviteImage && (
                  <div className="wa2-wa-img">
                    <div>💍</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5a3e2b', marginTop: 3 }}>הזמנה לחתונה</div>
                  </div>
                )}
                <div className="wa2-wa-text">{text || 'הודעה תופיע כאן...'}</div>
                {includeRsvpLink && (
                  <div className="wa2-wa-rsvp-btn">✅ אשר/י הגעה</div>
                )}
                <div className="wa2-wa-meta">
                  <span className="wa2-wa-time">{timeStr}</span>
                  <span className="wa2-wa-ticks">✓✓</span>
                </div>
              </div>
            </div>
          </div>
          <div className="wa2-wa-input">
            <div className="wa2-wa-emoji">☺</div>
            <div className="wa2-wa-field">הודעה</div>
            <div className="wa2-wa-mic">🎤</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Funnel Bar ─────────────────────────────────────────────────────────────

function FunnelBar({ label, value, total, color = '#25d366' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="wa2-funnel-row">
      <div className="wa2-funnel-label">{label}</div>
      <div className="wa2-funnel-track">
        <div className="wa2-funnel-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="wa2-funnel-val">{value}</div>
    </div>
  );
}

// ── Message Card ───────────────────────────────────────────────────────────

function MessageCard({ campaign, guests, onDelete, onMockSend }) {
  const cfg = STATUS_CFG[campaign.status] || STATUS_CFG.scheduled;
  const audienceCount = guests.filter(AUDIENCE_FILTER[campaign.audience] || (() => true)).length;
  const isSent = campaign.status === 'sent';
  const s = campaign.stats || {};
  const convPct = s.total > 0 ? Math.round((s.converted / s.total) * 100) : 0;
  const delivPct = s.total > 0 ? Math.round((s.delivered / s.total) * 100) : 0;

  return (
    <div className={`wa2-camp-card${isSent ? ' is-sent' : ''}`}>
      <div className="wa2-camp-top">
        <div className="wa2-camp-left">
          <div className="wa2-camp-dot" style={{ background: cfg.color }} />
          <div>
            <div className="wa2-camp-name">{campaign.name}</div>
            <div className="wa2-camp-meta">
              {campaign.scheduledDate && (
                <span>📅 {formatDate(campaign.scheduledDate)} · {campaign.scheduledTime}</span>
              )}
              <span>👥 {audienceCount} נמענים</span>
            </div>
          </div>
        </div>
        <div className="wa2-camp-right">
          <span className="wa2-camp-badge" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          {campaign.status === 'scheduled' && (
            <button className="wa2-camp-send-btn" onClick={() => onMockSend(campaign.id, audienceCount)}>
              ▶ שלח עכשיו
            </button>
          )}
          <button className="wa2-camp-del-btn" title="מחק" onClick={() => onDelete(campaign.id)}>✕</button>
        </div>
      </div>

      {isSent && (
        <div className="wa2-camp-stats">
          <div className="wa2-camp-ring">
            <DeliveryRing pct={convPct} size={100} stroke={8} />
            <div className="wa2-camp-ring-text">
              <div className="wa2-camp-ring-pct">{convPct}%</div>
              <div className="wa2-camp-ring-lbl">אישרו</div>
            </div>
          </div>
          <div className="wa2-camp-funnel">
            <FunnelBar label="נשלחו"  value={s.sent}      total={s.total} color="#94a3b8" />
            <FunnelBar label="נמסרו"  value={s.delivered} total={s.total} color="#6366f1" />
            <FunnelBar label="הגיבו"  value={s.replied}   total={s.total} color="#f59e0b" />
            <FunnelBar label="אישרו"  value={s.converted} total={s.total} color="#25d366" />
          </div>
          <div className="wa2-conf-badge">
            <span>⭐</span>
            <span>אמינות {delivPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function WhatsAppScheduler({ eventId, navigate }) {
  const [campaigns, setCampaigns] = useState(() => getCampaigns(eventId));
  const event  = getEvent(eventId);
  const guests = getGuests(eventId);

  const [creating, setCreating] = useState(false);
  const [step, setStep]         = useState(1);

  // schedules: one entry per slot, each with enabled + custom date + time
  const initSchedules = () => SCHEDULE_SLOTS.map(s => ({
    ...s,
    enabled: s.id === 'invite',
    customDate: event?.date ? addDays(event.date, s.days) : '',
    useCustom: false,
  }));

  const [form, setForm] = useState({
    name:               '',
    audience:           'all',
    message:            MESSAGE_TEMPLATES[0].message,
    includeInviteImage: false,
    includeRsvpLink:    true,
    consent:            false,
    schedules:          initSchedules(),
  });

  const reload  = () => setCampaigns(getCampaigns(eventId));
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateSchedule = (id, patch) => {
    setForm(f => ({
      ...f,
      schedules: f.schedules.map(s => s.id === id ? { ...s, ...patch } : s),
    }));
  };

  if (!event) return <div className="page-content"><p>האירוע לא נמצא.</p></div>;

  const vars = {
    firstName:   'ישראל',
    coupleNames: event.title,
    eventDate:   formatDate(event.date),
    venueName:   event.venue || 'שם האולם',
    rsvpLink:    `https://choko.app/rsvp/${eventId}`,
  };

  const audienceCount = useMemo(
    () => guests.filter(AUDIENCE_FILTER[form.audience] || (() => true)).length,
    [guests, form.audience]
  );

  const pending    = guests.filter(g => g.status === 'pending').length;
  const coming     = guests.filter(g => g.status === 'coming').length;
  const sentCamps  = campaigns.filter(c => c.status === 'sent').length;
  const schedCamps = campaigns.filter(c => c.status === 'scheduled').length;

  const enabledSchedules = form.schedules.filter(s => s.enabled);

  const handleSchedule = () => {
    if (!form.consent || enabledSchedules.length === 0) return;
    enabledSchedules.forEach(slot => {
      const baseName = form.name || 'הודעה';
      createCampaign({
        eventId,
        name:               `${baseName} — ${slot.label}`,
        audience:           form.audience,
        message:            form.message,
        includeInviteImage: form.includeInviteImage,
        includeRsvpLink:    form.includeRsvpLink,
        scheduledDate:      slot.useCustom ? slot.customDate : (event.date ? addDays(event.date, slot.days) : ''),
        scheduledTime:      slot.time,
      });
    });
    reload();
    setCreating(false);
    setStep(1);
    setForm({ name: '', audience: 'all', message: MESSAGE_TEMPLATES[0].message,
              includeInviteImage: false, includeRsvpLink: true, consent: false,
              schedules: initSchedules() });
  };

  const handleDelete = (id) => {
    if (!confirm('למחוק הודעה זו?')) return;
    deleteCampaign(id);
    reload();
  };

  const handleMockSend = (id, count) => {
    mockSendCampaign(id, count);
    reload();
  };

  const cancelWizard = () => { setCreating(false); setStep(1); };

  // ── Wizard panels ────────────────────────────────────────────────────────

  const Step1 = (
    <div className="wa2-step-body">
      <div className="wa2-step-heading">
        <h2 className="wa2-step-title">בחר קהל יעד</h2>
        <p className="wa2-step-sub">לאיזו קבוצה לשלוח את ההודעה?</p>
      </div>
      <div className="wa2-aud-grid">
        {AUDIENCE_OPTIONS.map(opt => {
          const count = guests.filter(AUDIENCE_FILTER[opt.value] || (() => true)).length;
          return (
            <button
              key={opt.value}
              className={`wa2-aud-card${form.audience === opt.value ? ' active' : ''}`}
              onClick={() => setField('audience', opt.value)}
            >
              <div className="wa2-aud-emoji">{opt.emoji}</div>
              <div className="wa2-aud-label">{opt.label}</div>
              <div className="wa2-aud-desc">{opt.desc}</div>
              <div className={`wa2-aud-count${form.audience === opt.value ? ' active' : ''}`}>{count}</div>
            </button>
          );
        })}
      </div>
      <div className="wa2-step-footer">
        <button className="wa2-cancel-btn" onClick={cancelWizard}>ביטול</button>
        <button className="wa2-next-btn" onClick={() => setStep(2)}>
          המשך · {audienceCount} נמענים →
        </button>
      </div>
    </div>
  );

  const Step2 = (
    <div className="wa2-step-body wa2-with-phone">
      <div className="wa2-step-content">
        <div className="wa2-step-heading">
          <h2 className="wa2-step-title">ניסוח הודעה</h2>
          <p className="wa2-step-sub">בחר תבנית מוכנה או ערוך הודעה מותאמת</p>
        </div>
        <div className="wa2-tpl-scroll">
          {MESSAGE_TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              className={`wa2-tpl-card${form.message === tpl.message ? ' active' : ''}`}
              onClick={() => setField('message', tpl.message)}
            >
              <div className="wa2-tpl-icon">{tpl.emoji}</div>
              <div className="wa2-tpl-name">{tpl.name}</div>
            </button>
          ))}
        </div>
        <div className="wa2-editor">
          <div className="wa2-editor-top">
            <span className="wa2-editor-lbl">✏️ עריכת הודעה</span>
            <div className="wa2-vars-row">
              {['{{firstName}}', '{{coupleNames}}', '{{eventDate}}', '{{venueName}}'].map(v => (
                <button key={v} className="wa2-var-chip" onClick={() => setField('message', form.message + ' ' + v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="wa2-textarea"
            value={form.message}
            onChange={e => setField('message', e.target.value)}
            rows={7}
            placeholder="כתוב את ההודעה שלך כאן..."
          />
        </div>
        <div className="wa2-options-row">
          <div className="wa2-option-group">
            <span className="wa2-option-lbl">תמונת הזמנה:</span>
            <div className="wa2-pill-toggle">
              <button className={`wa2-pill${form.includeInviteImage ? ' active' : ''}`} onClick={() => setField('includeInviteImage', true)}>🖼️ צרף</button>
              <button className={`wa2-pill${!form.includeInviteImage ? ' active' : ''}`} onClick={() => setField('includeInviteImage', false)}>💬 ללא</button>
            </div>
          </div>
          <div className="wa2-option-group">
            <span className="wa2-option-lbl">כפתור אישור הגעה:</span>
            <div className="wa2-pill-toggle">
              <button className={`wa2-pill${form.includeRsvpLink ? ' active' : ''}`} onClick={() => setField('includeRsvpLink', true)}>✅ כן</button>
              <button className={`wa2-pill${!form.includeRsvpLink ? ' active' : ''}`} onClick={() => setField('includeRsvpLink', false)}>לא</button>
            </div>
          </div>
        </div>
        <div className="wa2-step-footer">
          <button className="wa2-cancel-btn" onClick={() => setStep(1)}>← חזרה</button>
          <button className="wa2-next-btn" onClick={() => setStep(3)}>המשך לתזמון →</button>
        </div>
      </div>

      {/* Phone preview — always visible in right column */}
      <div className="wa2-phone-col">
        <div className="wa2-phone-label">תצוגה מקדימה</div>
        <PhonePreview
          message={form.message} includeInviteImage={form.includeInviteImage}
          includeRsvpLink={form.includeRsvpLink} vars={vars}
        />
      </div>
    </div>
  );

  const Step3 = (
    <div className="wa2-step-body wa2-with-phone">
      <div className="wa2-step-content">
        <div className="wa2-step-heading">
          <h2 className="wa2-step-title">תזמון שליחות</h2>
          <p className="wa2-step-sub">הפעל את הסוגים שרוצים לשלוח — אפשר לתזמן מספר שליחות במקביל</p>
        </div>

        <div className="wa2-schedule-slots">
          {form.schedules.map(slot => {
            const defaultDate = event.date ? addDays(event.date, slot.days) : '';
            const displayDate = slot.useCustom ? slot.customDate : defaultDate;
            return (
              <div key={slot.id} className={`wa2-slot-card${slot.enabled ? ' enabled' : ''}`}>
                {/* Top row: toggle + label */}
                <div className="wa2-slot-top">
                  <button
                    className={`wa2-slot-toggle${slot.enabled ? ' on' : ''}`}
                    onClick={() => updateSchedule(slot.id, { enabled: !slot.enabled })}
                    aria-label={slot.enabled ? 'כבה' : 'הפעל'}
                  >
                    <span className="wa2-slot-toggle-knob"/>
                  </button>
                  <span className="wa2-slot-emoji">{slot.emoji}</span>
                  <div className="wa2-slot-info">
                    <div className="wa2-slot-label">{slot.label}</div>
                    <div className="wa2-slot-desc">{slot.desc}</div>
                  </div>
                  {slot.enabled && displayDate && (
                    <div className="wa2-slot-date-badge">{formatDate(displayDate)}</div>
                  )}
                </div>

                {/* Expanded controls when enabled */}
                {slot.enabled && (
                  <div className="wa2-slot-controls">
                    <div className="wa2-slot-ctrl-row">
                      <div className="wa2-slot-field">
                        <label>תאריך שליחה</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="date"
                            value={displayDate}
                            onChange={e => updateSchedule(slot.id, { customDate: e.target.value, useCustom: true })}
                          />
                          {slot.useCustom && defaultDate && (
                            <button
                              className="wa2-slot-reset"
                              onClick={() => updateSchedule(slot.id, { useCustom: false, customDate: defaultDate })}
                              title="אפס לברירת מחדל"
                            >
                              ↩
                            </button>
                          )}
                        </div>
                        {!slot.useCustom && event.date && (
                          <div className="wa2-slot-relative">
                            {slot.days < 0 ? `${Math.abs(slot.days)} ימים לפני האירוע` :
                             slot.days > 0 ? `${slot.days} ימים אחרי האירוע` : 'ביום האירוע'}
                          </div>
                        )}
                      </div>
                      <div className="wa2-slot-field">
                        <label>שעת שליחה</label>
                        <input
                          type="time"
                          value={slot.time}
                          onChange={e => updateSchedule(slot.id, { time: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message name */}
        <div className="wa2-field" style={{ marginTop: 16 }}>
          <label>שם ההודעה (לשימוש פנימי)</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="לדוגמה: הזמנה ראשונה — חתונת נוי וירין"
          />
        </div>

        <div className="wa2-step-footer">
          <button className="wa2-cancel-btn" onClick={() => setStep(2)}>← חזרה</button>
          <button
            className="wa2-next-btn"
            disabled={enabledSchedules.length === 0}
            onClick={() => setStep(4)}
          >
            לאישור סופי ({enabledSchedules.length} שליחות) →
          </button>
        </div>
      </div>

      {/* Phone preview */}
      <div className="wa2-phone-col">
        <div className="wa2-phone-label">תצוגה מקדימה</div>
        <PhonePreview
          message={form.message} includeInviteImage={form.includeInviteImage}
          includeRsvpLink={form.includeRsvpLink} vars={vars}
        />
      </div>
    </div>
  );

  const Step4 = (
    <div className="wa2-step-body wa2-confirm-body">
      <div className="wa2-confirm-left">
        <div className="wa2-step-heading">
          <h2 className="wa2-step-title">אישור ושליחה</h2>
          <p className="wa2-step-sub">בדוק את פרטי ההודעה לפני השליחה</p>
        </div>
        <div className="wa2-summary-card">
          {[
            ['שם',        form.name || 'הודעה חדשה'],
            ['קהל יעד',   `${AUDIENCE_OPTIONS.find(o=>o.value===form.audience)?.label} · ${audienceCount} נמענים`],
            ['הודעה',     `${form.message.slice(0, 55)}…`],
            ['תמונה',     form.includeInviteImage ? '🖼️ מצורפת' : '💬 ללא תמונה'],
            ['אישור הגעה', form.includeRsvpLink ? '✅ כלול' : '—'],
          ].map(([k, v]) => (
            <div key={k} className="wa2-sum-row">
              <span className="wa2-sum-k">{k}</span>
              <span className="wa2-sum-v">{v}</span>
            </div>
          ))}
        </div>

        {/* Enabled schedules summary */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', marginBottom: 8 }}>
            שליחות מתוזמנות ({enabledSchedules.length})
          </div>
          {enabledSchedules.map(slot => {
            const date = slot.useCustom ? slot.customDate : (event.date ? addDays(event.date, slot.days) : '');
            return (
              <div key={slot.id} className="wa2-sum-slot">
                <span>{slot.emoji} {slot.label}</span>
                <span style={{ color: 'var(--ink-mute)', fontSize: 12 }}>
                  {date ? formatDate(date) : '—'} · {slot.time}
                </span>
              </div>
            );
          })}
        </div>

        <label className="wa2-consent">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={e => setField('consent', e.target.checked)}
          />
          <span>אני מאשר/ת שיש לי הרשאה לשלוח הודעות WhatsApp לכל המוזמנים ברשימה</span>
        </label>
        <div className="wa2-step-footer">
          <button className="wa2-cancel-btn" onClick={() => setStep(3)}>← חזרה</button>
          <button
            className={`wa2-schedule-btn${form.consent ? '' : ' disabled'}`}
            disabled={!form.consent}
            onClick={handleSchedule}
          >
            🚀 תזמן שליחה
          </button>
        </div>
      </div>

      <div className="wa2-confidence-panel">
        <div className="wa2-conf-header">📊 צפי ביצועים</div>
        <div className="wa2-conf-ring-wrap">
          <DeliveryRing pct={97} size={120} stroke={10} />
          <div className="wa2-conf-ring-text">
            <div className="wa2-conf-pct">97%</div>
            <div className="wa2-conf-sub">אמינות</div>
          </div>
        </div>
        <div className="wa2-conf-vs">↑ 8% מממוצע התעשייה</div>
        <div className="wa2-conf-metrics">
          {[
            { label: 'אחוז מסירה',  pct: 97, color: '#25d366' },
            { label: 'קצב פתיחה',   pct: 82, color: '#6366f1' },
            { label: 'אישורי הגעה', pct: 54, color: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="wa2-conf-metric-row">
              <div className="wa2-conf-metric-label">
                <span>{m.label}</span>
                <span style={{ color: m.color, fontWeight: 700 }}>{m.pct}%</span>
              </div>
              <div className="wa2-conf-metric-track">
                <div className="wa2-conf-metric-fill" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="wa2-conf-note">
          נתונים מבוססים על ממוצע קמפיינים בתחום האירועים
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-content">

      {/* Header */}
      <div className="wa2-header">
        <div className="wa2-header-left">
          <button className="wa2-back-btn" onClick={() => navigate({ page: 'event-detail', eventId })}>
            ← חזרה
          </button>
          <div>
            <h1 className="wa2-page-title">📱 שליחת הזמנות</h1>
            <div className="wa2-event-name">{event.title}</div>
          </div>
        </div>
        {!creating && (
          <button className="wa2-new-btn" onClick={() => { setCreating(true); setStep(1); }}>
            + ניסוח הודעה חדשה
          </button>
        )}
      </div>

      {/* KPI ribbon */}
      <div className="wa2-ribbon">
        {[
          { n: guests.length,  l: 'מוזמנים',           icon: '👥', cls: '' },
          { n: coming,         l: 'אישרו הגעה',         icon: '✅', cls: 'green' },
          { n: pending,        l: 'טרם ענו',            icon: '⏳', cls: 'amber' },
          { n: schedCamps,     l: 'הודעות מתוזמנות',   icon: '📅', cls: '' },
          { n: sentCamps,      l: 'הודעות שנשלחו',     icon: '✈️', cls: 'green' },
        ].map(item => (
          <div key={item.l} className={`wa2-ribbon-item${item.cls ? ' ' + item.cls : ''}`}>
            <div className="wa2-ribbon-icon">{item.icon}</div>
            <div className="wa2-ribbon-n">{item.n}</div>
            <div className="wa2-ribbon-l">{item.l}</div>
          </div>
        ))}
      </div>

      {/* ── Wizard ─────────────────────────────────────────────────────────── */}
      {creating && (
        <div className="wa2-wizard">
          <div className="wa2-steps-bar">
            {STEPS.map((s, i) => (
              <div key={s.n} className="wa2-step-wrap">
                <button
                  className={`wa2-step-pill${step === s.n ? ' active' : ''}${step > s.n ? ' done' : ''}`}
                  onClick={() => step > s.n && setStep(s.n)}
                >
                  <div className="wa2-step-num">{step > s.n ? '✓' : s.n}</div>
                  <div className="wa2-step-lbl">{s.label}</div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`wa2-step-line${step > s.n ? ' done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && Step1}
          {step === 2 && Step2}
          {step === 3 && Step3}
          {step === 4 && Step4}
        </div>
      )}

      {/* ── Message list ────────────────────────────────────────────────────── */}
      {!creating && (
        <div className="wa2-campaigns">
          <div className="wa2-camps-header">
            <h2 className="wa2-camps-title">הודעות</h2>
            {campaigns.length > 0 && (
              <span className="wa2-camps-count">{campaigns.length}</span>
            )}
          </div>
          {campaigns.length === 0 ? (
            <div className="wa2-empty">
              <div className="wa2-empty-icon">📱</div>
              <div className="wa2-empty-title">אין הודעות עדיין</div>
              <div className="wa2-empty-sub">צור הודעה ראשונה ושלח הזמנות לאורחים בקליק</div>
              <button className="wa2-new-btn" onClick={() => setCreating(true)}>+ ניסוח הודעה חדשה</button>
            </div>
          ) : (
            <div className="wa2-camp-list">
              {campaigns.map(c => (
                <MessageCard
                  key={c.id}
                  campaign={c}
                  guests={guests}
                  onDelete={handleDelete}
                  onMockSend={handleMockSend}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

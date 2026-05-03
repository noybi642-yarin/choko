import { useState, useMemo } from 'react';
import { getEvent, getGuests, getCampaigns, createCampaign, updateCampaign, deleteCampaign, mockSendCampaign, MESSAGE_TEMPLATES } from '../store';

// ── Constants ──────────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS = [
  { value: 'all',        label: 'כל המוזמנים',          emoji: '👥', desc: 'שולח לכולם' },
  { value: 'pending',    label: 'טרם ענו',               emoji: '⏳', desc: 'לא אישרו עדיין' },
  { value: 'coming',     label: 'אישרו הגעה',            emoji: '✅', desc: 'מגיעים בוודאות' },
  { value: 'maybe',      label: 'אולי מגיעים',           emoji: '🤔', desc: 'לא ודאי' },
  { value: 'bride-side', label: 'צד כלה',                emoji: '👰', desc: 'קבוצת כלה' },
  { value: 'groom-side', label: 'צד חתן',                emoji: '🤵', desc: 'קבוצת חתן' },
];

const DATE_PRESETS = [
  { label: 'חודש לפני',     days: -30 },
  { label: 'שבועיים לפני', days: -14 },
  { label: 'שבוע לפני',    days: -7  },
  { label: 'יום לפני',     days: -1  },
  { label: 'ביום האירוע',  days: 0   },
  { label: 'תאריך מותאם', days: null },
];

const STATUS_CONFIG = {
  draft:     { label: 'טיוטה',    color: '#94a3b8', bg: 'oklch(0.95 0.01 240)' },
  scheduled: { label: 'מתוזמן',   color: '#f59e0b', bg: 'oklch(0.98 0.04 85)'  },
  sending:   { label: 'נשלח',     color: '#6366f1', bg: 'oklch(0.96 0.04 270)' },
  sent:      { label: 'נשלח',     color: '#10b981', bg: 'oklch(0.96 0.06 160)' },
  failed:    { label: 'נכשל',     color: '#ef4444', bg: 'oklch(0.97 0.04 20)'  },
};

const AUDIENCE_FILTER = {
  all:        () => true,
  pending:    g => g.status === 'pending',
  coming:     g => g.status === 'coming',
  maybe:      g => g.status === 'maybe',
  'bride-side': g => g.group === 'צד כלה',
  'groom-side': g => g.group === 'צד חתן',
};

function interpolate(text, vars) {
  return text
    .replace(/\{\{firstName\}\}/g, vars.firstName || 'ישראל')
    .replace(/\{\{coupleNames\}\}/g, vars.coupleNames || 'החתן והכלה')
    .replace(/\{\{eventDate\}\}/g, vars.eventDate || 'תאריך האירוע')
    .replace(/\{\{venueName\}\}/g, vars.venueName || 'שם המקום')
    .replace(/\{\{rsvpLink\}\}/g, vars.rsvpLink || 'https://choko.app/rsvp/...');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function addDays(dateStr, days) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── WhatsApp Preview ────────────────────────────────────────────────────────

function WhatsAppPreview({ message, includeInviteImage, includeRsvpLink, vars }) {
  const text = interpolate(message, vars);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="wa-phone-wrap">
      <div className="wa-phone">
        <div className="wa-phone-notch" />
        <div className="wa-screen">
          <div className="wa-header">
            <div className="wa-back">‹</div>
            <div className="wa-avatar-sm">ח</div>
            <div className="wa-contact-info">
              <div className="wa-contact-name">choko<span style={{ color: '#25d366' }}>●</span></div>
              <div className="wa-contact-status">מסר חיצוני</div>
            </div>
            <div className="wa-header-icons">⋮</div>
          </div>
          <div className="wa-body">
            <div className="wa-date-sep">היום</div>
            <div className="wa-bubble-wrap">
              <div className="wa-bubble">
                {includeInviteImage && (
                  <div className="wa-invite-img">
                    <div className="wa-invite-img-inner">
                      <div style={{ fontSize: 28 }}>💍</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#5a3e2b', marginTop: 4 }}>הזמנה לחתונה</div>
                    </div>
                  </div>
                )}
                <div className="wa-bubble-text">{text}</div>
                {includeRsvpLink && (
                  <div className="wa-rsvp-btn">
                    <span>✅</span> אשר/י הגעה
                  </div>
                )}
                <div className="wa-bubble-meta">
                  <span className="wa-time">{timeStr}</span>
                  <span className="wa-ticks">✓✓</span>
                </div>
              </div>
            </div>
          </div>
          <div className="wa-input-bar">
            <div className="wa-input-emoji">☺</div>
            <div className="wa-input-field">הודעה</div>
            <div className="wa-input-mic">🎤</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, guests, event, onDelete, onMockSend }) {
  const cfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.scheduled;
  const audienceCount = guests.filter(AUDIENCE_FILTER[campaign.audience] || (() => true)).length;
  const convRate = campaign.stats?.converted && campaign.stats?.total
    ? Math.round((campaign.stats.converted / campaign.stats.total) * 100)
    : null;

  return (
    <div className="camp-card">
      <div className="camp-card-header">
        <div className="camp-card-left">
          <div className="camp-status-dot" style={{ background: cfg.color }} />
          <div>
            <div className="camp-name">{campaign.name}</div>
            <div className="camp-meta">
              {campaign.scheduledDate && <span>📅 {formatDate(campaign.scheduledDate)} · {campaign.scheduledTime}</span>}
              <span>👥 {audienceCount} נמענים</span>
            </div>
          </div>
        </div>
        <div className="camp-card-right">
          <span className="camp-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          {campaign.status === 'scheduled' && (
            <button className="camp-send-btn" onClick={() => onMockSend(campaign.id, audienceCount)}>
              ▶ שלח עכשיו (סימולציה)
            </button>
          )}
          <button className="camp-del-btn" onClick={() => onDelete(campaign.id)}>✕</button>
        </div>
      </div>
      {campaign.status === 'sent' && (
        <div className="camp-stats-row">
          <div className="camp-stat"><span className="camp-stat-n">{campaign.stats.sent}</span><span className="camp-stat-l">נשלחו</span></div>
          <div className="camp-stat"><span className="camp-stat-n">{campaign.stats.delivered}</span><span className="camp-stat-l">נמסרו</span></div>
          <div className="camp-stat"><span className="camp-stat-n">{campaign.stats.replied}</span><span className="camp-stat-l">הגיבו</span></div>
          <div className="camp-stat success"><span className="camp-stat-n">{campaign.stats.converted}</span><span className="camp-stat-l">אישרו</span></div>
          {convRate !== null && (
            <div className="camp-stat success">
              <span className="camp-stat-n">{convRate}%</span>
              <span className="camp-stat-l">המרה</span>
            </div>
          )}
          <div className="camp-stat failed"><span className="camp-stat-n">{campaign.stats.failed}</span><span className="camp-stat-l">נכשלו</span></div>
        </div>
      )}
    </div>
  );
}

// ── Step indicators ──────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'קהל יעד' },
  { num: 2, label: 'הודעה' },
  { num: 3, label: 'תמונה' },
  { num: 4, label: 'תזמון' },
  { num: 5, label: 'תצוגה מקדימה' },
  { num: 6, label: 'אישור ושיגור' },
];

// ── Main Page ────────────────────────────────────────────────────────────────

export default function WhatsAppScheduler({ eventId, navigate }) {
  const [campaigns, setCampaigns] = useState(() => getCampaigns(eventId));
  const event   = getEvent(eventId);
  const guests  = getGuests(eventId);

  const [creating, setCreating] = useState(false);
  const [step, setStep]         = useState(1);

  // Form state
  const [form, setForm] = useState({
    name:              '',
    audience:          'all',
    templateId:        '',
    message:           MESSAGE_TEMPLATES[0].message,
    includeInviteImage: false,
    includeRsvpLink:   true,
    datePreset:        null,
    scheduledDate:     '',
    scheduledTime:     '10:00',
    consent:           false,
  });

  const reload = () => setCampaigns(getCampaigns(eventId));

  if (!event) return <div className="page-content"><p>האירוע לא נמצא.</p></div>;

  const vars = {
    firstName:   'ישראל',
    coupleNames: event.title,
    eventDate:   formatDate(event.date),
    venueName:   event.venue,
    rsvpLink:    `https://choko.app/rsvp/${eventId}`,
  };

  const audienceCount = useMemo(
    () => guests.filter(AUDIENCE_FILTER[form.audience] || (() => true)).length,
    [guests, form.audience]
  );

  const pending  = guests.filter(g => g.status === 'pending').length;
  const coming   = guests.filter(g => g.status === 'coming').length;
  const sent     = campaigns.filter(c => c.status === 'sent').length;
  const scheduled = campaigns.filter(c => c.status === 'scheduled').length;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePreset = (preset) => {
    setField('datePreset', preset.days);
    if (preset.days !== null && event.date) {
      setField('scheduledDate', addDays(event.date, preset.days));
    } else if (preset.days === null) {
      setField('scheduledDate', '');
    }
  };

  const handleSchedule = () => {
    if (!form.consent) return;
    createCampaign({
      eventId,
      name:              form.name || MESSAGE_TEMPLATES.find(t => t.message === form.message)?.name || 'קמפיין',
      audience:          form.audience,
      message:           form.message,
      includeInviteImage: form.includeInviteImage,
      includeRsvpLink:   form.includeRsvpLink,
      scheduledDate:     form.scheduledDate,
      scheduledTime:     form.scheduledTime,
    });
    reload();
    setCreating(false);
    setStep(1);
    setForm({ name: '', audience: 'all', templateId: '', message: MESSAGE_TEMPLATES[0].message,
              includeInviteImage: false, includeRsvpLink: true, datePreset: null,
              scheduledDate: '', scheduledTime: '10:00', consent: false });
  };

  const handleDelete = (id) => {
    if (!confirm('למחוק קמפיין זה?')) return;
    deleteCampaign(id);
    reload();
  };

  const handleMockSend = (id, count) => {
    mockSendCampaign(id, count);
    reload();
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'event-detail', eventId })}>← חזרה</button>
          <h1 className="page-title">📱 שיגור הזמנות ותזכורות</h1>
          <p className="page-sub">{event.title}</p>
        </div>
        {!creating && (
          <button className="btn btn-primary wa-new-btn" onClick={() => setCreating(true)}>
            + קמפיין חדש
          </button>
        )}
      </div>

      {/* KPI mini-bar */}
      <div className="wa-kpi-bar">
        <div className="wa-kpi-card">
          <div className="wa-kpi-n">{guests.length}</div>
          <div className="wa-kpi-l">מוזמנים</div>
        </div>
        <div className="wa-kpi-card">
          <div className="wa-kpi-n">{coming}</div>
          <div className="wa-kpi-l">אישרו הגעה</div>
        </div>
        <div className="wa-kpi-card warn">
          <div className="wa-kpi-n">{pending}</div>
          <div className="wa-kpi-l">טרם ענו</div>
        </div>
        <div className="wa-kpi-card">
          <div className="wa-kpi-n">{scheduled}</div>
          <div className="wa-kpi-l">קמפיינים מתוזמנים</div>
        </div>
        <div className="wa-kpi-card success">
          <div className="wa-kpi-n">{sent}</div>
          <div className="wa-kpi-l">קמפיינים שנשלחו</div>
        </div>
      </div>

      {/* ── Wizard ── */}
      {creating && (
        <div className="wa-wizard">
          {/* Step progress */}
          <div className="wa-wizard-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className="wa-wizard-step-wrap">
                <div
                  className={`wa-wizard-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
                  onClick={() => step > s.num && setStep(s.num)}
                >
                  <div className="wa-step-num">{step > s.num ? '✓' : s.num}</div>
                  <div className="wa-step-label">{s.label}</div>
                </div>
                {i < STEPS.length - 1 && <div className={`wa-step-line ${step > s.num ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 — Audience */}
          {step === 1 && (
            <div className="wa-step-body">
              <h2 className="wa-step-title">בחר קהל יעד</h2>
              <p className="wa-step-sub">לאילו אורחים לשלוח את ההודעה?</p>
              <div className="wa-audience-grid">
                {AUDIENCE_OPTIONS.map(opt => {
                  const count = guests.filter(AUDIENCE_FILTER[opt.value] || (() => true)).length;
                  return (
                    <button
                      key={opt.value}
                      className={`wa-audience-card ${form.audience === opt.value ? 'active' : ''}`}
                      onClick={() => setField('audience', opt.value)}
                    >
                      <div className="wa-aud-emoji">{opt.emoji}</div>
                      <div className="wa-aud-label">{opt.label}</div>
                      <div className="wa-aud-desc">{opt.desc}</div>
                      <div className="wa-aud-count">{count} אורחים</div>
                    </button>
                  );
                })}
              </div>
              <div className="wa-step-footer">
                <button className="btn btn-ghost" onClick={() => setCreating(false)}>ביטול</button>
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                  המשך ({audienceCount} נמענים) ←
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Message */}
          {step === 2 && (
            <div className="wa-step-body">
              <h2 className="wa-step-title">בחר תבנית הודעה</h2>
              <p className="wa-step-sub">בחר תבנית מוכנה או ערוך הודעה מותאמת אישית</p>

              <div className="wa-template-grid">
                {MESSAGE_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    className={`wa-template-card ${form.message === tpl.message ? 'active' : ''}`}
                    onClick={() => setField('message', tpl.message)}
                  >
                    <div className="wa-tpl-emoji">{tpl.emoji}</div>
                    <div className="wa-tpl-name">{tpl.name}</div>
                  </button>
                ))}
              </div>

              <div className="wa-message-editor">
                <label className="wa-editor-label">
                  ✏️ עריכת הודעה
                  <span className="wa-vars-hint">
                    משתנים: <code>{'{{firstName}}'}</code> <code>{'{{coupleNames}}'}</code> <code>{'{{eventDate}}'}</code> <code>{'{{venueName}}'}</code> <code>{'{{rsvpLink}}'}</code>
                  </span>
                </label>
                <textarea
                  className="wa-message-textarea"
                  value={form.message}
                  onChange={e => setField('message', e.target.value)}
                  rows={8}
                  placeholder="כתוב את ההודעה שלך..."
                />
              </div>

              <div className="wa-step-footer">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← חזרה</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>המשך ←</button>
              </div>
            </div>
          )}

          {/* Step 3 — Invitation image */}
          {step === 3 && (
            <div className="wa-step-body">
              <h2 className="wa-step-title">צרף תמונת הזמנה</h2>
              <p className="wa-step-sub">האם לצרף את ההזמנה המעוצבת להודעה?</p>

              <div className="wa-toggle-cards">
                <button
                  className={`wa-toggle-card ${form.includeInviteImage ? 'active' : ''}`}
                  onClick={() => setField('includeInviteImage', true)}
                >
                  <div className="wa-toggle-icon">🖼️</div>
                  <div className="wa-toggle-label">כן, צרף הזמנה</div>
                  <div className="wa-toggle-desc">מוסיף תמונת הזמנה מעוצבת להודעה</div>
                </button>
                <button
                  className={`wa-toggle-card ${!form.includeInviteImage ? 'active' : ''}`}
                  onClick={() => setField('includeInviteImage', false)}
                >
                  <div className="wa-toggle-icon">💬</div>
                  <div className="wa-toggle-label">לא, רק הודעה</div>
                  <div className="wa-toggle-desc">שלח טקסט בלבד ללא תמונה</div>
                </button>
              </div>

              <div className="wa-rsvp-toggle">
                <label className="wa-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.includeRsvpLink}
                    onChange={e => setField('includeRsvpLink', e.target.checked)}
                    className="wa-checkbox"
                  />
                  <span>כלול כפתור RSVP להגעה</span>
                </label>
              </div>

              <div className="wa-step-footer">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← חזרה</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>המשך ←</button>
              </div>
            </div>
          )}

          {/* Step 4 — Schedule */}
          {step === 4 && (
            <div className="wa-step-body">
              <h2 className="wa-step-title">קבע תאריך ושעה</h2>
              <p className="wa-step-sub">מתי לשלוח את ההודעות?</p>

              <div className="wa-preset-grid">
                {DATE_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    className={`wa-preset-btn ${form.datePreset === preset.days ? 'active' : ''}`}
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                    {preset.days !== null && event.date && (
                      <span className="wa-preset-date">
                        {formatDate(addDays(event.date, preset.days))}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="wa-datetime-row">
                <div className="wa-field">
                  <label>תאריך שליחה</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={e => { setField('scheduledDate', e.target.value); setField('datePreset', null); }}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div className="wa-field">
                  <label>שעת שליחה</label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={e => setField('scheduledTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="wa-field" style={{ marginTop: 16 }}>
                <label>שם הקמפיין (פנימי)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="לדוגמה: הזמנה ראשונה — חתונת נוי וירין"
                />
              </div>

              <div className="wa-step-footer">
                <button className="btn btn-ghost" onClick={() => setStep(3)}>← חזרה</button>
                <button className="btn btn-primary" disabled={!form.scheduledDate} onClick={() => setStep(5)}>
                  לתצוגה מקדימה ←
                </button>
              </div>
            </div>
          )}

          {/* Step 5 — WhatsApp Preview */}
          {step === 5 && (
            <div className="wa-step-body wa-preview-layout">
              <div className="wa-preview-copy">
                <h2 className="wa-step-title">תצוגה מקדימה</h2>
                <p className="wa-step-sub">כך ייראה ההודעה לאורחים שלך</p>
                <div className="wa-preview-summary">
                  <div className="wa-summary-row">
                    <span className="wa-summary-k">קהל יעד:</span>
                    <span className="wa-summary-v">{AUDIENCE_OPTIONS.find(o => o.value === form.audience)?.label} · {audienceCount} אורחים</span>
                  </div>
                  <div className="wa-summary-row">
                    <span className="wa-summary-k">תאריך שליחה:</span>
                    <span className="wa-summary-v">{formatDate(form.scheduledDate)} · {form.scheduledTime}</span>
                  </div>
                  <div className="wa-summary-row">
                    <span className="wa-summary-k">תמונת הזמנה:</span>
                    <span className="wa-summary-v">{form.includeInviteImage ? '✅ כן' : '❌ לא'}</span>
                  </div>
                  <div className="wa-summary-row">
                    <span className="wa-summary-k">כפתור RSVP:</span>
                    <span className="wa-summary-v">{form.includeRsvpLink ? '✅ כן' : '❌ לא'}</span>
                  </div>
                </div>
                <div className="wa-step-footer" style={{ marginTop: 'auto', paddingTop: 24 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(4)}>← חזרה</button>
                  <button className="btn btn-primary" onClick={() => setStep(6)}>לאישור ←</button>
                </div>
              </div>
              <WhatsAppPreview
                message={form.message}
                includeInviteImage={form.includeInviteImage}
                includeRsvpLink={form.includeRsvpLink}
                vars={vars}
              />
            </div>
          )}

          {/* Step 6 — Confirm */}
          {step === 6 && (
            <div className="wa-step-body wa-confirm-body">
              <div className="wa-confirm-icon">🚀</div>
              <h2 className="wa-step-title">מוכן לשיגור?</h2>
              <p className="wa-step-sub">
                מתוזמן לשלוח ל-<strong>{audienceCount}</strong> אורחים ב-{form.scheduledDate && formatDate(form.scheduledDate)} בשעה {form.scheduledTime}
              </p>

              <div className="wa-confirm-card">
                <div className="wa-summary-row"><span className="wa-summary-k">קמפיין:</span><span className="wa-summary-v">{form.name || 'קמפיין חדש'}</span></div>
                <div className="wa-summary-row"><span className="wa-summary-k">קהל:</span><span className="wa-summary-v">{AUDIENCE_OPTIONS.find(o => o.value === form.audience)?.label}</span></div>
                <div className="wa-summary-row"><span className="wa-summary-k">תאריך:</span><span className="wa-summary-v">{formatDate(form.scheduledDate)} · {form.scheduledTime}</span></div>
                <div className="wa-summary-row"><span className="wa-summary-k">נמענים:</span><span className="wa-summary-v">{audienceCount} אורחים</span></div>
              </div>

              <label className="wa-consent-row">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => setField('consent', e.target.checked)}
                  className="wa-checkbox"
                />
                <span>אני מאשר/ת שיש לי הרשאה לשלוח הודעות לכל המוזמנים שהועלו למערכת, ושהם הסכימו לקבל הודעות WhatsApp.</span>
              </label>

              <div className="wa-step-footer">
                <button className="btn btn-ghost" onClick={() => setStep(5)}>← חזרה</button>
                <button
                  className="btn btn-primary wa-schedule-btn"
                  disabled={!form.consent}
                  onClick={handleSchedule}
                >
                  ✅ תזמן שיגור
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaign list */}
      {!creating && (
        <div className="wa-campaigns">
          <div className="wa-campaigns-header">
            <h2 className="wa-campaigns-title">קמפיינים</h2>
            <span className="wa-campaigns-count">{campaigns.length}</span>
          </div>
          {campaigns.length === 0 ? (
            <div className="wa-empty">
              <div className="wa-empty-icon">📱</div>
              <div className="wa-empty-title">אין קמפיינים עדיין</div>
              <div className="wa-empty-sub">צור את הקמפיין הראשון שלך כדי לשלוח הזמנות לאורחים</div>
              <button className="btn btn-primary" onClick={() => setCreating(true)}>+ קמפיין חדש</button>
            </div>
          ) : (
            <div className="wa-camp-list">
              {campaigns.map(c => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  guests={guests}
                  event={event}
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

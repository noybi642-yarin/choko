import { useState, useRef } from 'react';
import { updateVenueBranding } from '../store';
import { Image, Type, Palette, Globe, Save } from 'lucide-react';

function ColorField({ label, value, onChange }) {
  const ref = useRef(null);
  return (
    <div className="vb-color-field">
      <div className="vb-field-label">{label}</div>
      <div className="vb-color-wrap" onClick={() => ref.current?.click()}>
        <div className="vb-color-swatch" style={{ background: value }}/>
        <span className="vb-color-hex">{value}</span>
        <input
          ref={ref}
          type="color"
          className="vb-color-input-native"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Live Preview (simulated RSVP on phone) ────────────────────────────────────
function LivePreview({ venue, form }) {
  const primaryColor = form.primaryColor || venue.primaryColor;
  const logoUrl      = form.logo         || venue.logo;
  const venueName    = form.name         || venue.name;
  const welcomeText  = form.welcomeText  || venue.welcomeText;

  return (
    <div className="vb-preview">
      <div className="vb-preview-label">תצוגה מקדימה — עמוד RSVP של האורחים</div>
      <div className="vb-preview-phone">
        <div className="vb-preview-screen">
          {/* Header with venue branding */}
          <div className="vb-preview-rsvp-header" style={{ background: primaryColor + '12' }}>
            {logoUrl ? (
              <img src={logoUrl} className="vb-preview-logo" alt="לוגו" />
            ) : (
              <div className="vb-preview-logo-placeholder" style={{ background: primaryColor }}>
                {venueName?.[0] || 'V'}
              </div>
            )}
            <div className="vb-preview-venue-name">{venueName}</div>
            <div className="vb-preview-welcome">{welcomeText}</div>
            <div className="vb-preview-divider" style={{ background: primaryColor }}/>
          </div>
          {/* Event info */}
          <div className="vb-preview-body">
            <div className="vb-preview-event-name">נוי & ירין</div>
            <div style={{ display:'flex', gap:6, marginBottom:12, justifyContent:'center', fontSize:11, color:'#7a5060' }}>
              <span>15 באוגוסט 2026</span>
              <span>·</span>
              <span>19:30</span>
            </div>
            <div className="vb-preview-btn" style={{ background: primaryColor, marginBottom: 8 }}>
              אישור הגעה
            </div>
            <div className="vb-preview-btn" style={{
              background: 'transparent',
              border: `2px solid ${primaryColor}`,
              color: primaryColor,
              padding: '9px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              textAlign: 'center',
            }}>
              לא מגיע/ה
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function VenueBranding({ venue, onVenueUpdate }) {
  const [form, setForm] = useState({
    name:           venue.name           || '',
    primaryColor:   venue.primaryColor   || '#7C3AED',
    secondaryColor: venue.secondaryColor || '#5B21B6',
    welcomeText:    venue.welcomeText    || '',
    tagline:        venue.tagline        || '',
    address:        venue.address        || '',
    phone:          venue.phone          || '',
    website:        venue.website        || '',
    logo:           venue.logo           || null,
  });
  const [saved,    setSaved]   = useState(false);
  const [saving,   setSaving]  = useState(false);
  const logoRef = useRef(null);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('logo', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const updated = updateVenueBranding(venue.id, form);
      onVenueUpdate(updated);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="vb-page">
      <div className="vb-header">
        <h1 className="vb-title">הגדרות מיתוג</h1>
        <p className="vb-subtitle">
          עצבו את הנראות של האולם שלכם — הלוגו, הצבעים והטקסט יופיעו בעמוד RSVP של כל זוג
        </p>
      </div>

      <div className="vb-layout">
        <div className="vb-settings">

          {/* Logo */}
          <div className="vb-section">
            <div className="vb-section-title">
              <span className="vb-section-icon"><Image size={15}/></span>
              לוגו האולם
            </div>
            <div className="vb-logo-zone" onClick={() => logoRef.current?.click()}>
              {form.logo ? (
                <>
                  <img src={form.logo} alt="לוגו"/>
                  <button className="vb-logo-remove" onClick={e => { e.stopPropagation(); set('logo', null); }}>
                    הסר לוגו
                  </button>
                </>
              ) : (
                <>
                  <div style={{ color: 'var(--venue-mute)', display:'flex', justifyContent:'center' }}>
                    <Image size={28} strokeWidth={1.2}/>
                  </div>
                  <div className="vb-logo-zone-title">לחצו להעלאת לוגו</div>
                  <div className="vb-logo-zone-sub">PNG · JPG · SVG · עד 2MB</div>
                </>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogoUpload}/>
          </div>

          {/* Colors */}
          <div className="vb-section">
            <div className="vb-section-title">
              <span className="vb-section-icon"><Palette size={15}/></span>
              צבעי מותג
            </div>
            <div className="vb-color-row">
              <ColorField label="צבע ראשי"     value={form.primaryColor}   onChange={v => set('primaryColor', v)}/>
              <ColorField label="צבע משני"     value={form.secondaryColor} onChange={v => set('secondaryColor', v)}/>
            </div>
          </div>

          {/* Texts */}
          <div className="vb-section">
            <div className="vb-section-title">
              <span className="vb-section-icon"><Type size={15}/></span>
              טקסטים
            </div>
            <div className="vb-field">
              <div className="vb-field-label">שם האולם</div>
              <input className="vb-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="גני האלגנס"/>
            </div>
            <div className="vb-field">
              <div className="vb-field-label">טקסט ברוכים הבאים (יופיע בראש עמוד RSVP)</div>
              <textarea className="vb-input vb-textarea" value={form.welcomeText}
                onChange={e => set('welcomeText', e.target.value)}
                placeholder="ברוכים הבאים לגני האלגנס — המקום המושלם לאירוע חלומות"/>
            </div>
            <div className="vb-field">
              <div className="vb-field-label">סיסמת האולם / טאגליין</div>
              <input className="vb-input" value={form.tagline}
                onChange={e => set('tagline', e.target.value)} placeholder="כי כל רגע ראוי לחגיגה"/>
            </div>
          </div>

          {/* Contact info */}
          <div className="vb-section">
            <div className="vb-section-title">
              <span className="vb-section-icon"><Globe size={15}/></span>
              פרטי קשר
            </div>
            <div className="vb-field">
              <div className="vb-field-label">כתובת</div>
              <input className="vb-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="דרך השלום 42, פתח תקווה"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="vb-field">
                <div className="vb-field-label">טלפון</div>
                <input className="vb-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="03-0000000"/>
              </div>
              <div className="vb-field">
                <div className="vb-field-label">אתר אינטרנט</div>
                <input className="vb-input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="www.venue.co.il"/>
              </div>
            </div>
          </div>

          {/* Save bar */}
          <div className="vb-section" style={{ padding:'18px 24px' }}>
            <div className="vb-save-bar">
              <div className="vb-save-hint">
                השינויים יחולו על עמוד RSVP של כל זוג הקשור לאולם
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {saved && (
                  <span className="vb-saved-badge">
                    <Save size={11}/> נשמר
                  </span>
                )}
                <button className="venue-btn venue-btn--primary" onClick={handleSave} disabled={saving}>
                  <Save size={14}/>
                  {saving ? 'שומר...' : 'שמור שינויים'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <LivePreview venue={venue} form={form}/>
      </div>
    </div>
  );
}

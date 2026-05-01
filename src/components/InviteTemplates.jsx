import { useState } from 'react';

// ─── Template definitions ────────────────────────────────────────────────────

export const TEMPLATES = [
  {
    id: 'classic-ivory',
    name: 'קלאסי רומנטי',
    desc: 'אלגנטי ונקי עם מסגרת זהב',
    emoji: '💛',
    bg: '#fdf8f0',
    accent: '#b8960c',
  },
  {
    id: 'modern-dark',
    name: 'מודרני שחור',
    desc: 'מינימליסטי ועוצמתי',
    emoji: '🖤',
    bg: '#1a1a2e',
    accent: '#e0c97f',
  },
  {
    id: 'garden-rose',
    name: 'גן ורדים',
    desc: 'רומנטי ורוד עם אקצנטים ירוקים',
    emoji: '🌸',
    bg: '#fff0f5',
    accent: '#c0567a',
  },
  {
    id: 'midnight-luxe',
    name: 'לייל יוקרה',
    desc: 'כחול לילה עם פרטי זהב',
    emoji: '✨',
    bg: '#0d1b2a',
    accent: '#f4c542',
  },
  {
    id: 'coral-fest',
    name: 'קורל פסטיבלי',
    desc: 'חגיגי וצבעוני לכל אירוע',
    emoji: '🎉',
    bg: '#fff5f0',
    accent: '#e85d3a',
  },
  {
    id: 'sage-garden',
    name: 'גן ירוק',
    desc: 'טבעי ורגוע, בוהו שיק',
    emoji: '🌿',
    bg: '#f2f7f2',
    accent: '#4a7c59',
  },
];

// ─── Shared field renderer ───────────────────────────────────────────────────

function Line({ style }) {
  return <div style={{ height: 1, background: style?.color || '#ccc', opacity: 0.4, margin: '12px 0', ...style }} />;
}

// ─── Template renderers ──────────────────────────────────────────────────────

function ClassicIvory({ data }) {
  return (
    <div style={{
      background: '#fdf8f0',
      padding: '52px 44px',
      fontFamily: 'Georgia, serif',
      textAlign: 'center',
      color: '#3a2a10',
      border: '1px solid #e8d8a0',
      position: 'relative',
      minHeight: 480,
    }}>
      {/* double border frame */}
      <div style={{ position:'absolute', inset:12, border:'1.5px solid #c8a830', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:16, border:'0.5px solid #c8a830', pointerEvents:'none' }} />

      <div style={{ fontSize: 13, letterSpacing: 4, color: '#b8960c', textTransform: 'uppercase', marginBottom: 16 }}>
        {data.eventType}
      </div>

      <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
        {data.coupleNames}
      </div>
      <div style={{ fontSize: 13, color: '#b8960c', letterSpacing: 2, marginBottom: 20 }}>✦ ✦ ✦</div>

      <div style={{ fontSize: 14, lineHeight: 1.8, color: '#5a4020', marginBottom: 20, fontStyle: 'italic' }}>
        {data.subtitle}
      </div>

      <Line style={{ color: '#c8a830', opacity: 0.5 }} />

      <div style={{ fontSize: 16, fontWeight: 600, margin: '16px 0 4px' }}>{data.date}</div>
      <div style={{ fontSize: 14, color: '#7a6040', marginBottom: 4 }}>בשעה {data.time}</div>
      <div style={{ fontSize: 14, color: '#7a6040', marginBottom: 20 }}>📍 {data.venue}</div>

      {data.message && (
        <div style={{ fontSize: 13, fontStyle: 'italic', color: '#7a6040', marginBottom: 16, lineHeight: 1.7 }}>
          {data.message}
        </div>
      )}

      {data.dresscode && (
        <div style={{ fontSize: 12, color: '#b8960c', letterSpacing: 1 }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 12, color: '#b8960c', marginTop: 6 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

function ModernDark({ data }) {
  return (
    <div style={{
      background: '#1a1a2e',
      padding: '52px 44px',
      fontFamily: "'Heebo', sans-serif",
      textAlign: 'center',
      color: '#f0ead8',
      minHeight: 480,
    }}>
      <div style={{ fontSize: 11, letterSpacing: 5, color: '#e0c97f', textTransform: 'uppercase', marginBottom: 24 }}>
        {data.eventType}
      </div>

      <div style={{ fontSize: 38, fontWeight: 800, color: '#e0c97f', lineHeight: 1.15, marginBottom: 10 }}>
        {data.coupleNames}
      </div>

      <div style={{ width: 60, height: 2, background: '#e0c97f', margin: '0 auto 20px' }} />

      <div style={{ fontSize: 14, color: '#b0a898', fontWeight: 300, marginBottom: 28, lineHeight: 1.8 }}>
        {data.subtitle}
      </div>

      <div style={{
        display: 'inline-block',
        border: '1px solid #e0c97f',
        padding: '16px 32px',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e0c97f', marginBottom: 4 }}>{data.date}</div>
        <div style={{ fontSize: 13, color: '#b0a898' }}>{data.time} · {data.venue}</div>
      </div>

      {data.message && (
        <div style={{ fontSize: 13, color: '#9090a0', marginBottom: 14, lineHeight: 1.7 }}>{data.message}</div>
      )}
      {data.dresscode && (
        <div style={{ fontSize: 12, color: '#e0c97f', letterSpacing: 1 }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 12, color: '#9090a0', marginTop: 6 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

function GardenRose({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #fff0f5 0%, #fff8fb 100%)',
      padding: '52px 44px',
      fontFamily: "'Heebo', sans-serif",
      textAlign: 'center',
      color: '#3d1a28',
      minHeight: 480,
      position: 'relative',
    }}>
      {/* Corner flourishes */}
      {['top:8px;right:8px', 'top:8px;left:8px', 'bottom:8px;right:8px', 'bottom:8px;left:8px'].map((pos, i) => (
        <div key={i} style={{ position:'absolute', fontSize:20, lineHeight:1, ...Object.fromEntries(pos.split(';').map(p=>p.split(':'))) }}>🌸</div>
      ))}

      <div style={{ fontSize: 11, letterSpacing: 4, color: '#c0567a', marginBottom: 18 }}>— {data.eventType} —</div>

      <div style={{ fontSize: 36, fontWeight: 800, color: '#8b1a4a', lineHeight: 1.2, marginBottom: 12 }}>
        {data.coupleNames}
      </div>

      <div style={{ fontSize: 13, color: '#c0567a', marginBottom: 18, lineHeight: 1.8 }}>{data.subtitle}</div>

      <div style={{ background: '#c0567a', height: 1, width: 80, margin: '0 auto 18px', opacity: 0.3 }} />

      <div style={{ fontSize: 16, fontWeight: 700, color: '#8b1a4a', marginBottom: 4 }}>{data.date}</div>
      <div style={{ fontSize: 14, color: '#7a3a58', marginBottom: 4 }}>🕐 {data.time}</div>
      <div style={{ fontSize: 14, color: '#7a3a58', marginBottom: 18 }}>📍 {data.venue}</div>

      {data.message && (
        <div style={{ fontSize: 13, color: '#7a4a5a', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 12 }}>{data.message}</div>
      )}
      {data.dresscode && (
        <div style={{ fontSize: 12, color: '#c0567a' }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 12, color: '#9a7080', marginTop: 6 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

function MidnightLuxe({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #0d1b2a 0%, #16213e 100%)',
      padding: '52px 44px',
      fontFamily: "'Heebo', sans-serif",
      textAlign: 'center',
      color: '#f8f0d8',
      minHeight: 480,
    }}>
      <div style={{ fontSize: 24, marginBottom: 8, letterSpacing: 8 }}>✦ ✧ ✦</div>
      <div style={{ fontSize: 11, letterSpacing: 5, color: '#f4c542', textTransform: 'uppercase', marginBottom: 20 }}>
        {data.eventType}
      </div>

      <div style={{ fontSize: 40, fontWeight: 300, color: '#f4c542', lineHeight: 1.2, marginBottom: 8, letterSpacing: 2 }}>
        {data.coupleNames}
      </div>

      <div style={{ fontSize: 13, color: '#a0b4c8', marginBottom: 24, lineHeight: 1.8 }}>{data.subtitle}</div>

      <div style={{
        border: '1px solid rgba(244,197,66,0.35)',
        padding: '18px 28px',
        display: 'inline-block',
        marginBottom: 20,
        background: 'rgba(244,197,66,0.06)',
      }}>
        <div style={{ fontSize: 18, color: '#f4c542', fontWeight: 700, marginBottom: 6 }}>{data.date}</div>
        <div style={{ fontSize: 13, color: '#8090a8' }}>{data.time}</div>
        <div style={{ fontSize: 13, color: '#8090a8', marginTop: 2 }}>{data.venue}</div>
      </div>

      {data.message && (
        <div style={{ fontSize: 13, color: '#8090a8', lineHeight: 1.7, marginBottom: 14 }}>{data.message}</div>
      )}
      {data.dresscode && (
        <div style={{ fontSize: 12, color: '#f4c542', letterSpacing: 1 }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 12, color: '#8090a8', marginTop: 6 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

function CoralFest({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #fff5f0 0%, #fffaf8 100%)',
      padding: '48px 40px',
      fontFamily: "'Heebo', sans-serif",
      textAlign: 'center',
      color: '#2a1a14',
      minHeight: 480,
      border: '3px solid #e85d3a',
    }}>
      <div style={{ fontSize: 30, marginBottom: 12 }}>🎉</div>
      <div style={{
        display: 'inline-block',
        background: '#e85d3a',
        color: 'white',
        padding: '4px 20px',
        borderRadius: 20,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 18,
      }}>
        {data.eventType}
      </div>

      <div style={{ fontSize: 36, fontWeight: 800, color: '#e85d3a', lineHeight: 1.2, marginBottom: 10 }}>
        {data.coupleNames}
      </div>

      <div style={{ fontSize: 14, color: '#7a5040', marginBottom: 20, lineHeight: 1.8 }}>{data.subtitle}</div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        {[['📅', data.date], ['🕐', data.time], ['📍', data.venue]].map(([icon, val], i) => (
          <div key={i} style={{
            background: 'white',
            border: '1.5px solid #ffd0c0',
            borderRadius: 12,
            padding: '8px 16px',
            fontSize: 13,
            color: '#4a2a1a',
          }}>
            {icon} {val}
          </div>
        ))}
      </div>

      {data.message && (
        <div style={{ fontSize: 13, color: '#7a5040', lineHeight: 1.7, marginBottom: 12 }}>{data.message}</div>
      )}
      {data.dresscode && (
        <div style={{ fontSize: 12, color: '#e85d3a', fontWeight: 600 }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 12, color: '#9a7060', marginTop: 6 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

function SageGarden({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #f2f7f2 0%, #f8faf6 100%)',
      padding: '52px 44px',
      fontFamily: "'Heebo', sans-serif",
      textAlign: 'center',
      color: '#1e3828',
      minHeight: 480,
    }}>
      <div style={{ fontSize: 22, marginBottom: 14, letterSpacing: 4 }}>🌿 🌾 🌿</div>
      <div style={{ fontSize: 11, letterSpacing: 4, color: '#4a7c59', marginBottom: 18 }}>
        — {data.eventType} —
      </div>

      <div style={{ fontSize: 36, fontWeight: 700, color: '#2d5c40', lineHeight: 1.2, marginBottom: 10 }}>
        {data.coupleNames}
      </div>

      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #4a7c59, transparent)', margin: '0 auto 18px', width: 120 }} />

      <div style={{ fontSize: 14, color: '#5a7060', marginBottom: 20, lineHeight: 1.8, fontStyle: 'italic' }}>{data.subtitle}</div>

      <div style={{ fontSize: 16, fontWeight: 700, color: '#2d5c40', marginBottom: 4 }}>{data.date}</div>
      <div style={{ fontSize: 14, color: '#4a6050', marginBottom: 4 }}>בשעה {data.time}</div>
      <div style={{ fontSize: 14, color: '#4a6050', marginBottom: 20 }}>📍 {data.venue}</div>

      {data.message && (
        <div style={{ fontSize: 13, color: '#5a7060', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>{data.message}</div>
      )}
      {data.dresscode && (
        <div style={{ fontSize: 12, color: '#4a7c59' }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 12, color: '#7a9080', marginTop: 6 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

const RENDERERS = {
  'classic-ivory':  ClassicIvory,
  'modern-dark':    ModernDark,
  'garden-rose':    GardenRose,
  'midnight-luxe':  MidnightLuxe,
  'coral-fest':     CoralFest,
  'sage-garden':    SageGarden,
};

export function renderTemplate(templateId, data) {
  const C = RENDERERS[templateId];
  if (!C) return null;
  return <C data={data} />;
}

export function TemplateThumbnail({ template, selected, onClick }) {
  const sampleData = {
    eventType: 'חתונה',
    coupleNames: 'נוי & ירין',
    subtitle: 'מזמינים אתכם לחתונתנו',
    date: '15 באוגוסט 2026',
    time: '19:30',
    venue: 'גני התערוכה',
    message: '',
    dresscode: '',
    rsvpDate: '',
  };
  const C = RENDERERS[template.id];

  return (
    <button
      className={`template-thumb-btn ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="template-thumb-preview">
        <div style={{ transform: 'scale(0.32)', transformOrigin: 'top center', width: 312, pointerEvents: 'none' }}>
          <C data={sampleData} />
        </div>
      </div>
      <div className="template-thumb-label">
        <span className="template-thumb-emoji">{template.emoji}</span>
        <div>
          <div className="template-thumb-name">{template.name}</div>
          <div className="template-thumb-desc">{template.desc}</div>
        </div>
      </div>
      {selected && <div className="template-thumb-check">✓</div>}
    </button>
  );
}

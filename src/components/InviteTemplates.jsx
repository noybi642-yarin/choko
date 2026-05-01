// ─── Template definitions ────────────────────────────────────────────────────

export const TEMPLATES = [
  {
    id: 'botanica',
    name: 'בוטניקה',
    desc: 'קרם ועלים ירוקים — הכי פופולרי בקנבה',
    emoji: '🌿',
  },
  {
    id: 'noir-opulence',
    name: 'נואר יוקרה',
    desc: 'שחור עם מסגרת זהב — בלאק טיי',
    emoji: '✦',
  },
  {
    id: 'celestial',
    name: 'שמיים כחולים',
    desc: 'כחול לילה, כוכבים וזהב — רומנטי ועמוק',
    emoji: '🌙',
  },
  {
    id: 'terracotta-arch',
    name: 'טרקוטה ארץ',
    desc: 'אדמה חמה, קשת — בוהו מודרני',
    emoji: '🏺',
  },
  {
    id: 'pure-luxury',
    name: 'לבן נקי',
    desc: 'מינימל מוחלט — כמו כרטיס ניחוח יוקרתי',
    emoji: '◻',
  },
  {
    id: 'dusty-romance',
    name: 'מוב רומנטי',
    desc: 'אפרסק עמוק, שמפניה — עדין ונשי',
    emoji: '🌸',
  },
];

// ─── Shared helpers ──────────────────────────────────────────────────────────

const BASE = {
  fontFamily: "'Heebo', 'Assistant', sans-serif",
  textAlign: 'center',
  direction: 'rtl',
  minHeight: 520,
  boxSizing: 'border-box',
};

// ─── Template 1: Botanica ────────────────────────────────────────────────────
function Botanica({ data }) {
  return (
    <div style={{
      ...BASE,
      background: '#f9f5ef',
      color: '#2d2318',
      padding: '0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top botanical bar */}
      <div style={{
        background: 'linear-gradient(135deg, #6b7c5e, #8a9e70, #6b7c5e)',
        padding: '18px 24px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22, opacity: 0.85 }}>🌿</span>
        <span style={{ color: '#e8f0e0', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 300 }}>
          {data.eventType}
        </span>
        <span style={{ fontSize: 22, opacity: 0.85, transform: 'scaleX(-1)', display:'inline-block' }}>🌿</span>
      </div>

      <div style={{ padding: '36px 40px 40px' }}>
        {/* Names */}
        <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, color: '#2d2318', marginBottom: 6 }}>
          {data.coupleNames}
        </div>

        {/* Botanical divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, #6b7c5e, transparent)' }} />
          <span style={{ fontSize: 16 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #6b7c5e, transparent)' }} />
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 14, color: '#6b7c5e', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 24 }}>
          {data.subtitle}
        </div>

        {/* Date block */}
        <div style={{
          border: '1px solid #c4b89a',
          borderRadius: 4,
          padding: '18px 28px',
          display: 'inline-block',
          marginBottom: 22,
          background: 'rgba(107,124,94,0.07)',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2d2318', marginBottom: 4 }}>{data.date}</div>
          <div style={{ fontSize: 13, color: '#7a6b55' }}>{data.time} · {data.venue}</div>
        </div>

        {data.message && (
          <div style={{ fontSize: 13, color: '#7a6b55', fontStyle: 'italic', lineHeight: 1.75, marginBottom: 14 }}>
            {data.message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          {data.dresscode && (
            <div style={{ fontSize: 12, color: '#6b7c5e', letterSpacing: 1 }}>קוד לבוש: {data.dresscode}</div>
          )}
          {data.rsvpDate && (
            <div style={{ fontSize: 12, color: '#9a8a72' }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
          )}
        </div>
      </div>

      {/* Bottom botanical bar */}
      <div style={{
        background: 'linear-gradient(135deg, #6b7c5e, #8a9e70, #6b7c5e)',
        height: 8,
      }} />
    </div>
  );
}

// ─── Template 2: Noir Opulence ───────────────────────────────────────────────
function NoirOpulence({ data }) {
  return (
    <div style={{
      ...BASE,
      background: '#111111',
      color: '#f2ead8',
      padding: '10px',
    }}>
      {/* Gold frame */}
      <div style={{
        border: '1px solid rgba(212,175,55,0.55)',
        padding: '44px 40px 40px',
        minHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}>
        {/* Corner marks */}
        {[['top:0;right:0','border-top:2px solid #d4af37;border-right:2px solid #d4af37'],
          ['top:0;left:0','border-top:2px solid #d4af37;border-left:2px solid #d4af37'],
          ['bottom:0;right:0','border-bottom:2px solid #d4af37;border-right:2px solid #d4af37'],
          ['bottom:0;left:0','border-bottom:2px solid #d4af37;border-left:2px solid #d4af37'],
        ].map(([pos, border], i) => (
          <div key={i} style={{
            position: 'absolute', width: 20, height: 20,
            ...Object.fromEntries([...pos.split(';'), ...border.split(';')].map(p => {
              const [k, v] = p.split(':');
              return [k?.trim().replace(/-([a-z])/g, (_,c) => c.toUpperCase()), v?.trim()];
            }).filter(([k]) => k))
          }} />
        ))}

        <div style={{ fontSize: 11, letterSpacing: 6, color: '#d4af37', textTransform: 'uppercase', marginBottom: 28, fontWeight: 300 }}>
          {data.eventType}
        </div>

        <div style={{
          fontSize: 44, fontWeight: 200, color: '#ffffff',
          lineHeight: 1.1, marginBottom: 6, letterSpacing: 1,
        }}>
          {data.coupleNames}
        </div>

        {/* Gold rule */}
        <div style={{ width: 64, height: 1, background: '#d4af37', margin: '20px auto' }} />

        <div style={{ fontSize: 13, color: '#a09080', fontWeight: 300, lineHeight: 1.9, marginBottom: 28 }}>
          {data.subtitle}
        </div>

        <div style={{
          border: '1px solid rgba(212,175,55,0.35)',
          padding: '16px 36px',
          marginBottom: 22,
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#d4af37', marginBottom: 6 }}>{data.date}</div>
          <div style={{ fontSize: 12, color: '#807060', letterSpacing: 1 }}>{data.time} · {data.venue}</div>
        </div>

        {data.message && (
          <div style={{ fontSize: 12, color: '#706050', lineHeight: 1.8, marginBottom: 14 }}>{data.message}</div>
        )}
        {data.dresscode && (
          <div style={{ fontSize: 11, color: '#d4af37', letterSpacing: 2, marginBottom: 4 }}>קוד לבוש: {data.dresscode}</div>
        )}
        {data.rsvpDate && (
          <div style={{ fontSize: 11, color: '#606050' }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
        )}
      </div>
    </div>
  );
}

// ─── Template 3: Celestial ───────────────────────────────────────────────────
function Celestial({ data }) {
  const stars = [[8,12],[92,18],[15,75],[88,68],[50,8],[20,40],[80,35],[55,85],[35,55],[70,50]];
  return (
    <div style={{
      ...BASE,
      background: 'radial-gradient(ellipse at 50% 0%, #252060 0%, #0d0d28 55%, #07070f 100%)',
      color: '#f0e8d0',
      padding: '44px 40px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Star field */}
      {stars.map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute',
          left: x + '%', top: y + '%',
          width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
          background: '#f0d880',
          borderRadius: '50%',
          opacity: 0.4 + (i % 4) * 0.15,
        }} />
      ))}

      <div style={{ fontSize: 18, color: '#f0d078', letterSpacing: 6, marginBottom: 18, fontWeight: 300 }}>✦ ✧ ✦</div>

      <div style={{ fontSize: 11, letterSpacing: 5, color: '#a0a8d0', textTransform: 'uppercase', marginBottom: 20, fontWeight: 300 }}>
        {data.eventType}
      </div>

      <div style={{
        fontSize: 44, fontWeight: 700, color: '#f5ead0',
        lineHeight: 1.1, marginBottom: 14,
        textShadow: '0 2px 20px rgba(240,208,120,0.3)',
      }}>
        {data.coupleNames}
      </div>

      {/* Constellation line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px 0 20px' }}>
        <div style={{ width: 40, height: 1, background: 'linear-gradient(to left, #f0d078, transparent)' }} />
        <div style={{ width: 5, height: 5, background: '#f0d078', borderRadius: '50%' }} />
        <div style={{ width: 60, height: 1, background: '#f0d07866' }} />
        <div style={{ width: 5, height: 5, background: '#f0d078', borderRadius: '50%' }} />
        <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, #f0d078, transparent)' }} />
      </div>

      <div style={{ fontSize: 14, color: '#9090b8', lineHeight: 1.85, marginBottom: 28, fontWeight: 300 }}>
        {data.subtitle}
      </div>

      <div style={{
        border: '1px solid rgba(240,208,120,0.3)',
        background: 'rgba(240,208,120,0.06)',
        padding: '18px 32px',
        marginBottom: 20,
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontSize: 18, color: '#f0d078', fontWeight: 600, marginBottom: 6 }}>{data.date}</div>
        <div style={{ fontSize: 12, color: '#8080a0', letterSpacing: 0.5 }}>{data.time}</div>
        <div style={{ fontSize: 12, color: '#8080a0', marginTop: 2 }}>{data.venue}</div>
      </div>

      {data.message && (
        <div style={{ fontSize: 12, color: '#707090', lineHeight: 1.8, marginBottom: 14 }}>{data.message}</div>
      )}
      {data.dresscode && (
        <div style={{ fontSize: 11, color: '#f0d078', letterSpacing: 1 }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 11, color: '#606070', marginTop: 4 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

// ─── Template 4: Terracotta Arch ─────────────────────────────────────────────
function TerracottaArch({ data }) {
  return (
    <div style={{
      ...BASE,
      background: '#f7ede4',
      color: '#2a1a10',
      padding: '0 0 40px',
      overflow: 'hidden',
    }}>
      {/* Arch header */}
      <div style={{
        background: 'linear-gradient(180deg, #b5624b 0%, #c4744e 100%)',
        borderRadius: '0 0 120px 120px',
        padding: '44px 40px 52px',
        marginBottom: 32,
        position: 'relative',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: 'rgba(255,235,220,0.75)', textTransform: 'uppercase', marginBottom: 16, fontWeight: 300 }}>
          {data.eventType}
        </div>
        <div style={{
          fontSize: 42, fontWeight: 800, color: '#fff8f2',
          lineHeight: 1.1,
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}>
          {data.coupleNames}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0 40px' }}>
        <div style={{ fontSize: 14, color: '#8b5e48', fontStyle: 'italic', lineHeight: 1.85, marginBottom: 24 }}>
          {data.subtitle}
        </div>

        {/* Detail pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginBottom: 24 }}>
          {[['📅', data.date], ['🕐', data.time], ['📍', data.venue]].filter(([, v]) => v).map(([icon, val], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(181,98,75,0.09)',
              border: '1px solid rgba(181,98,75,0.2)',
              borderRadius: 40,
              padding: '8px 22px',
              fontSize: 14, color: '#5a3020',
              width: 'fit-content',
            }}>
              <span>{icon}</span>
              <span style={{ fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>

        {data.message && (
          <div style={{ fontSize: 13, color: '#8b6248', lineHeight: 1.75, marginBottom: 14 }}>{data.message}</div>
        )}
        {data.dresscode && (
          <div style={{ fontSize: 12, color: '#b5624b', fontWeight: 600, marginBottom: 4 }}>קוד לבוש: {data.dresscode}</div>
        )}
        {data.rsvpDate && (
          <div style={{ fontSize: 12, color: '#a08070' }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
        )}
      </div>
    </div>
  );
}

// ─── Template 5: Pure Luxury ─────────────────────────────────────────────────
function PureLuxury({ data }) {
  return (
    <div style={{
      ...BASE,
      background: '#ffffff',
      color: '#111111',
      padding: '60px 48px',
      borderTop: '4px solid #111',
      borderBottom: '4px solid #111',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: 8, color: '#888', textTransform: 'uppercase',
        marginBottom: 36, fontWeight: 400,
      }}>
        {data.eventType}
      </div>

      <div style={{
        fontSize: 52, fontWeight: 800, lineHeight: 1.05,
        color: '#111', marginBottom: 28,
        fontFamily: 'Georgia, serif',
      }}>
        {data.coupleNames}
      </div>

      {/* Classic thin rule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 0 28px' }}>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
        <div style={{ width: 4, height: 4, background: '#222', transform: 'rotate(45deg)' }} />
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
      </div>

      <div style={{ fontSize: 14, color: '#555', lineHeight: 2, marginBottom: 36, fontStyle: 'italic' }}>
        {data.subtitle}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
          {data.date}
        </div>
        <div style={{ fontSize: 13, color: '#777', letterSpacing: 1 }}>{data.time}</div>
        <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>{data.venue}</div>
      </div>

      {data.message && (
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>{data.message}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 0 16px' }}>
        <div style={{ flex: 1, height: 1, background: '#eee' }} />
        <div style={{ width: 4, height: 4, background: '#bbb', transform: 'rotate(45deg)' }} />
        <div style={{ flex: 1, height: 1, background: '#eee' }} />
      </div>

      {data.dresscode && (
        <div style={{ fontSize: 11, color: '#999', letterSpacing: 2, marginBottom: 4 }}>קוד לבוש: {data.dresscode}</div>
      )}
      {data.rsvpDate && (
        <div style={{ fontSize: 11, color: '#bbb', letterSpacing: 1 }}>RSVP עד {data.rsvpDate}</div>
      )}
    </div>
  );
}

// ─── Template 6: Dusty Romance ───────────────────────────────────────────────
function DustyRomance({ data }) {
  return (
    <div style={{
      ...BASE,
      background: 'linear-gradient(160deg, #f5edf0 0%, #ede0e6 100%)',
      color: '#2a1520',
      padding: '10px',
    }}>
      <div style={{
        border: '1.5px solid #c4a0b4',
        borderRadius: 2,
        padding: '44px 40px 40px',
        position: 'relative',
      }}>
        {/* Inner border */}
        <div style={{
          position: 'absolute', inset: 6,
          border: '0.5px solid rgba(196,160,180,0.4)',
          borderRadius: 1,
          pointerEvents: 'none',
        }} />

        <div style={{ fontSize: 11, letterSpacing: 5, color: '#c4a0b4', textTransform: 'uppercase', marginBottom: 20, fontWeight: 400 }}>
          {data.eventType}
        </div>

        <div style={{ fontSize: 42, fontWeight: 800, color: '#3d1a2e', lineHeight: 1.1, marginBottom: 10 }}>
          {data.coupleNames}
        </div>

        {/* Ornamental */}
        <div style={{ color: '#c4a0b4', fontSize: 14, letterSpacing: 6, margin: '16px 0' }}>◆ ◇ ◆</div>

        <div style={{ fontSize: 14, color: '#8c6478', fontStyle: 'italic', lineHeight: 1.85, marginBottom: 28 }}>
          {data.subtitle}
        </div>

        <div style={{
          background: 'rgba(196,160,180,0.15)',
          border: '1px solid rgba(196,160,180,0.4)',
          padding: '18px 28px',
          marginBottom: 22,
        }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#3d1a2e', marginBottom: 6 }}>{data.date}</div>
          <div style={{ fontSize: 13, color: '#8c6478' }}>{data.time} · {data.venue}</div>
        </div>

        {data.message && (
          <div style={{ fontSize: 13, color: '#8c7080', lineHeight: 1.75, marginBottom: 14, fontStyle: 'italic' }}>
            {data.message}
          </div>
        )}
        {data.dresscode && (
          <div style={{ fontSize: 12, color: '#c4a0b4', letterSpacing: 1, marginBottom: 4 }}>קוד לבוש: {data.dresscode}</div>
        )}
        {data.rsvpDate && (
          <div style={{ fontSize: 12, color: '#b09098' }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
        )}
      </div>
    </div>
  );
}

// ─── Registry ────────────────────────────────────────────────────────────────

const RENDERERS = {
  'botanica':        Botanica,
  'noir-opulence':   NoirOpulence,
  'celestial':       Celestial,
  'terracotta-arch': TerracottaArch,
  'pure-luxury':     PureLuxury,
  'dusty-romance':   DustyRomance,
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
    subtitle: 'מזמינים אתכם לחגוג איתנו',
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

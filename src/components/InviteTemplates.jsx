// ─── Template list ───────────────────────────────────────────────────────────

export const TEMPLATES = [
  { id: 'israeli-classic', name: 'ישראלי קלאסי',   desc: 'שמות גדולים, שני עמודות, לבן אלגנטי', emoji: '🤍' },
  { id: 'botanica',        name: 'בוטניקה',         desc: 'קרם + פס ירוק עשבוני',               emoji: '🌿' },
  { id: 'noir-opulence',   name: 'נואר יוקרה',      desc: 'שחור מאט, מסגרת זהב',                emoji: '✦' },
  { id: 'celestial',       name: 'שמיים כחולים',    desc: 'כחול לילה, כוכבים וזהב',             emoji: '🌙' },
  { id: 'terracotta-arch', name: 'טרקוטה ארץ',      desc: 'קשת טרקוטה — בוהו מודרני',           emoji: '🏺' },
  { id: 'dusty-romance',   name: 'מוב רומנטי',      desc: 'מוב-אפרסק, מסגרת כפולה',             emoji: '🌸' },
];

// ─── Base styles ─────────────────────────────────────────────────────────────

const BASE = {
  fontFamily: "'Heebo', 'Assistant', sans-serif",
  textAlign: 'center',
  direction: 'rtl',
  boxSizing: 'border-box',
};

// ─── Template 1: Israeli Classic ─────────────────────────────────────────────
// Modeled after real Israeli wedding invitations: white/off-white paper feel,
// big elegant names in the center, two-column ceremony details at the bottom.

function IsraeliClassic({ data }) {
  const hasParents  = data.groomsParents || data.bridesParents;
  const hasTwoTimes = data.receptionTime && data.ceremonyTime;

  return (
    <div style={{
      ...BASE,
      background: '#f8f7f5',
      color: '#1a1a1a',
      minWidth: 320,
      overflow: 'hidden',
    }}>

      {/* ── Floral photo strip (CSS-simulated) ── */}
      <div style={{
        background: 'linear-gradient(180deg, #d8d8d6 0%, #e8e6e2 40%, #f8f7f5 100%)',
        height: 110,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 14,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle petal shapes */}
        {[['-10%','10%',80,90,'rgba(255,255,255,0.7)'],
          ['15%','5%',60,70,'rgba(255,255,255,0.5)'],
          ['60%','8%',70,80,'rgba(255,255,255,0.6)'],
          ['80%','15%',55,65,'rgba(255,255,255,0.5)'],
          ['40%','-5%',65,75,'rgba(255,255,255,0.65)'],
        ].map(([left, top, rx, ry, bg], i) => (
          <div key={i} style={{
            position: 'absolute', left, top,
            width: rx, height: ry,
            background: bg,
            borderRadius: '50%',
            transform: `rotate(${i * 37}deg)`,
          }} />
        ))}
        {/* White roses hint */}
        <div style={{ fontSize: 28, letterSpacing: 8, opacity: 0.85, position:'relative', zIndex:1 }}>
          🤍 🌸 🤍
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '28px 36px 36px' }}>

        {/* Subtitle / opening text */}
        <div style={{
          fontSize: 13, color: '#555', lineHeight: 1.8,
          marginBottom: 20, fontWeight: 300,
          whiteSpace: 'pre-line',
        }}>
          {data.subtitle}
        </div>

        {/* ── BIG NAMES ── */}
        <div style={{
          fontSize: 54, fontWeight: 900,
          color: '#111',
          lineHeight: 1.05,
          marginBottom: 6,
          letterSpacing: -1,
          fontFamily: "'Heebo', sans-serif",
        }}>
          {/* Split names on & to style the ampersand differently */}
          {data.coupleNames.includes('&') ? (() => {
            const [a, b] = data.coupleNames.split('&');
            return (
              <>
                {a?.trim()}
                <span style={{
                  fontWeight: 200,
                  fontSize: '0.75em',
                  color: '#888',
                  margin: '0 6px',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                }}>&</span>
                {b?.trim()}
              </>
            );
          })() : data.coupleNames}
        </div>

        {/* Thin rule */}
        <div style={{ height: 1, background: '#ddd', margin: '20px auto', width: '60%' }} />

        {/* Hebrew date */}
        {data.hebrewDate && (
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{data.hebrewDate}</div>
        )}

        {/* Gregorian date — bold and prominent */}
        <div style={{
          fontSize: 22, fontWeight: 700, letterSpacing: 1,
          color: '#111', marginBottom: 10,
        }}>
          {data.date}
        </div>

        {/* Venue */}
        <div style={{ fontSize: 16, fontWeight: 600, color: '#222', marginBottom: 4 }}>{data.venue}</div>
        {data.venueAddress && (
          <div style={{ fontSize: 13, color: '#777', marginBottom: 4 }}>{data.venueAddress}</div>
        )}

        {data.dresscode && (
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>קוד לבוש: {data.dresscode}</div>
        )}
        {data.rsvpDate && (
          <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>אנא אשרו הגעה עד {data.rsvpDate}</div>
        )}

        {/* ── Ornamental lotus divider ── */}
        {(hasTwoTimes || hasParents) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            margin: '22px auto', width: '80%',
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, #ccc, transparent)' }} />
            <span style={{ fontSize: 18, opacity: 0.55 }}>✿</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #ccc, transparent)' }} />
          </div>
        )}

        {/* ── Two-column section ── */}
        {(hasTwoTimes || hasParents) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr',
            gap: 0,
            textAlign: 'center',
          }}>
            {/* Right column — reception */}
            <div style={{ padding: '0 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 4 }}>קבלת פנים</div>
              {data.receptionTime && (
                <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6 }}>{data.receptionTime}</div>
              )}
              {data.groomsParents && (
                <>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>הורי החתן</div>
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{data.groomsParents}</div>
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ background: '#e0e0e0', width: 1 }} />

            {/* Left column — ceremony */}
            <div style={{ padding: '0 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 4 }}>חופה וקידושין</div>
              {data.ceremonyTime && (
                <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6 }}>{data.ceremonyTime}</div>
              )}
              {data.bridesParents && (
                <>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>הורי הכלה</div>
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{data.bridesParents}</div>
                </>
              )}
            </div>
          </div>
        )}

        {data.message && (
          <div style={{ fontSize: 13, color: '#888', marginTop: 18, fontStyle: 'italic', lineHeight: 1.7 }}>
            {data.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template 2: Botanica ────────────────────────────────────────────────────
function Botanica({ data }) {
  return (
    <div style={{ ...BASE, background: '#f9f5ef', color: '#2d2318', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(135deg, #6b7c5e, #8a9e70, #6b7c5e)',
        padding: '18px 24px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 20, opacity: 0.85 }}>🌿</span>
        <span style={{ color: '#e8f0e0', fontSize: 10, letterSpacing: 4, fontWeight: 300 }}>{data.eventType}</span>
        <span style={{ fontSize: 20, opacity: 0.85, transform:'scaleX(-1)', display:'inline-block' }}>🌿</span>
      </div>
      <div style={{ padding: '32px 36px 36px' }}>
        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, color: '#2d2318', marginBottom: 6 }}>
          {data.coupleNames}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', margin:'14px 0' }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(to left, #6b7c5e, transparent)' }} />
          <span style={{ fontSize:14 }}>✦</span>
          <div style={{ flex:1, height:1, background:'linear-gradient(to right, #6b7c5e, transparent)' }} />
        </div>
        <div style={{ fontSize:13, color:'#6b7c5e', fontStyle:'italic', lineHeight:1.8, marginBottom:22 }}>{data.subtitle}</div>
        <div style={{ border:'1px solid #c4b89a', borderRadius:4, padding:'16px 24px', display:'inline-block', marginBottom:20, background:'rgba(107,124,94,0.07)' }}>
          <div style={{ fontSize:19, fontWeight:700, color:'#2d2318', marginBottom:4 }}>{data.date}</div>
          <div style={{ fontSize:12, color:'#7a6b55' }}>{data.ceremonyTime || data.time} · {data.venue}</div>
          {data.venueAddress && <div style={{ fontSize:11, color:'#9a8a72', marginTop:2 }}>{data.venueAddress}</div>}
        </div>
        {data.dresscode && <div style={{ fontSize:12, color:'#6b7c5e' }}>קוד לבוש: {data.dresscode}</div>}
        {data.rsvpDate && <div style={{ fontSize:12, color:'#9a8a72', marginTop:4 }}>RSVP עד {data.rsvpDate}</div>}
      </div>
      <div style={{ background:'linear-gradient(135deg, #6b7c5e, #8a9e70, #6b7c5e)', height:8 }} />
    </div>
  );
}

// ─── Template 3: Noir Opulence ───────────────────────────────────────────────
function NoirOpulence({ data }) {
  return (
    <div style={{ ...BASE, background:'#111', color:'#f2ead8', padding:'10px' }}>
      <div style={{ border:'1px solid rgba(212,175,55,0.5)', padding:'40px 36px', minHeight:480, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative' }}>
        {[{top:0,right:0},{top:0,left:0},{bottom:0,right:0},{bottom:0,left:0}].map((pos,i)=>(
          <div key={i} style={{ position:'absolute', width:18, height:18, ...pos,
            borderTop: pos.top===0 ? '2px solid #d4af37' : undefined,
            borderBottom: pos.bottom===0 ? '2px solid #d4af37' : undefined,
            borderRight: pos.right===0 ? '2px solid #d4af37' : undefined,
            borderLeft: pos.left===0 ? '2px solid #d4af37' : undefined,
          }} />
        ))}
        <div style={{ fontSize:10, letterSpacing:6, color:'#d4af37', marginBottom:24, fontWeight:300 }}>{data.eventType}</div>
        <div style={{ fontSize:46, fontWeight:200, color:'#fff', lineHeight:1.1, marginBottom:6, letterSpacing:1 }}>{data.coupleNames}</div>
        <div style={{ width:56, height:1, background:'#d4af37', margin:'18px auto' }} />
        <div style={{ fontSize:13, color:'#a09080', fontWeight:300, lineHeight:1.9, marginBottom:24, whiteSpace:'pre-line' }}>{data.subtitle}</div>
        <div style={{ border:'1px solid rgba(212,175,55,0.3)', padding:'14px 32px', marginBottom:20 }}>
          {data.hebrewDate && <div style={{ fontSize:12, color:'#807060', marginBottom:4 }}>{data.hebrewDate}</div>}
          <div style={{ fontSize:18, fontWeight:600, color:'#d4af37', marginBottom:4 }}>{data.date}</div>
          <div style={{ fontSize:12, color:'#807060', letterSpacing:1 }}>{data.ceremonyTime || data.time} · {data.venue}</div>
          {data.venueAddress && <div style={{ fontSize:11, color:'#605040', marginTop:2 }}>{data.venueAddress}</div>}
        </div>
        {data.dresscode && <div style={{ fontSize:11, color:'#d4af37', letterSpacing:2 }}>קוד לבוש: {data.dresscode}</div>}
        {data.rsvpDate && <div style={{ fontSize:11, color:'#606050', marginTop:4 }}>RSVP עד {data.rsvpDate}</div>}
      </div>
    </div>
  );
}

// ─── Template 4: Celestial ───────────────────────────────────────────────────
function Celestial({ data }) {
  const stars = [[8,12],[92,18],[15,75],[88,68],[50,8],[20,40],[80,35],[55,85],[35,55],[70,50]];
  return (
    <div style={{ ...BASE, background:'radial-gradient(ellipse at 50% 0%, #252060 0%, #0d0d28 55%, #07070f 100%)', color:'#f0e8d0', padding:'40px 36px', position:'relative', overflow:'hidden' }}>
      {stars.map(([x,y],i) => (
        <div key={i} style={{ position:'absolute', left:x+'%', top:y+'%', width:i%3===0?3:2, height:i%3===0?3:2, background:'#f0d880', borderRadius:'50%', opacity:0.3+(i%4)*0.18 }} />
      ))}
      <div style={{ fontSize:16, color:'#f0d078', letterSpacing:6, marginBottom:16, fontWeight:300 }}>✦ ✧ ✦</div>
      <div style={{ fontSize:10, letterSpacing:5, color:'#a0a8d0', marginBottom:18, fontWeight:300 }}>{data.eventType}</div>
      <div style={{ fontSize:46, fontWeight:700, color:'#f5ead0', lineHeight:1.1, marginBottom:12, textShadow:'0 2px 20px rgba(240,208,120,0.3)' }}>{data.coupleNames}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, margin:'12px 0 18px' }}>
        <div style={{ width:36, height:1, background:'linear-gradient(to left, #f0d078, transparent)' }} />
        <div style={{ width:5, height:5, background:'#f0d078', borderRadius:'50%' }} />
        <div style={{ width:52, height:1, background:'#f0d07866' }} />
        <div style={{ width:5, height:5, background:'#f0d078', borderRadius:'50%' }} />
        <div style={{ width:36, height:1, background:'linear-gradient(to right, #f0d078, transparent)' }} />
      </div>
      <div style={{ fontSize:13, color:'#9090b8', lineHeight:1.85, marginBottom:24, fontWeight:300, whiteSpace:'pre-line' }}>{data.subtitle}</div>
      <div style={{ border:'1px solid rgba(240,208,120,0.3)', background:'rgba(240,208,120,0.06)', padding:'16px 28px', marginBottom:18 }}>
        {data.hebrewDate && <div style={{ fontSize:11, color:'#8080a0', marginBottom:4 }}>{data.hebrewDate}</div>}
        <div style={{ fontSize:18, color:'#f0d078', fontWeight:600, marginBottom:4 }}>{data.date}</div>
        <div style={{ fontSize:12, color:'#8080a0' }}>{data.ceremonyTime || data.time} · {data.venue}</div>
        {data.venueAddress && <div style={{ fontSize:11, color:'#606070', marginTop:2 }}>{data.venueAddress}</div>}
      </div>
      {data.dresscode && <div style={{ fontSize:11, color:'#f0d078', letterSpacing:1 }}>קוד לבוש: {data.dresscode}</div>}
      {data.rsvpDate && <div style={{ fontSize:11, color:'#606070', marginTop:4 }}>RSVP עד {data.rsvpDate}</div>}
    </div>
  );
}

// ─── Template 5: Terracotta Arch ─────────────────────────────────────────────
function TerracottaArch({ data }) {
  return (
    <div style={{ ...BASE, background:'#f7ede4', color:'#2a1a10', overflow:'hidden' }}>
      <div style={{ background:'linear-gradient(180deg, #b5624b 0%, #c4744e 100%)', borderRadius:'0 0 120px 120px', padding:'40px 36px 48px', marginBottom:28 }}>
        <div style={{ fontSize:10, letterSpacing:5, color:'rgba(255,235,220,0.7)', marginBottom:14, fontWeight:300 }}>{data.eventType}</div>
        <div style={{ fontSize:44, fontWeight:800, color:'#fff8f2', lineHeight:1.1, textShadow:'0 2px 12px rgba(0,0,0,0.15)' }}>{data.coupleNames}</div>
      </div>
      <div style={{ padding:'0 36px 36px' }}>
        <div style={{ fontSize:13, color:'#8b5e48', fontStyle:'italic', lineHeight:1.85, marginBottom:22, whiteSpace:'pre-line' }}>{data.subtitle}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center', marginBottom:22 }}>
          {[[data.hebrewDate,'📅'],[data.date,'📆'],[`${data.receptionTime||data.ceremonyTime||data.time}`,'🕐'],[data.venue,'📍'],[data.venueAddress,'']].filter(([v])=>v).map(([val,icon],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(181,98,75,0.09)', border:'1px solid rgba(181,98,75,0.2)', borderRadius:40, padding:'7px 20px', fontSize:13, color:'#5a3020' }}>
              {icon && <span>{icon}</span>}<span style={{ fontWeight:i<2?600:400 }}>{val}</span>
            </div>
          ))}
        </div>
        {data.dresscode && <div style={{ fontSize:12, color:'#b5624b', fontWeight:600, marginBottom:4 }}>קוד לבוש: {data.dresscode}</div>}
        {data.rsvpDate && <div style={{ fontSize:12, color:'#a08070' }}>RSVP עד {data.rsvpDate}</div>}
      </div>
    </div>
  );
}

// ─── Template 6: Dusty Romance ───────────────────────────────────────────────
function DustyRomance({ data }) {
  return (
    <div style={{ ...BASE, background:'linear-gradient(160deg, #f5edf0 0%, #ede0e6 100%)', color:'#2a1520', padding:'10px' }}>
      <div style={{ border:'1.5px solid #c4a0b4', padding:'40px 36px', position:'relative' }}>
        <div style={{ position:'absolute', inset:6, border:'0.5px solid rgba(196,160,180,0.4)', pointerEvents:'none' }} />
        <div style={{ fontSize:10, letterSpacing:5, color:'#c4a0b4', marginBottom:18, fontWeight:400 }}>{data.eventType}</div>
        <div style={{ fontSize:44, fontWeight:800, color:'#3d1a2e', lineHeight:1.1, marginBottom:10 }}>{data.coupleNames}</div>
        <div style={{ color:'#c4a0b4', fontSize:13, letterSpacing:5, margin:'14px 0' }}>◆ ◇ ◆</div>
        <div style={{ fontSize:13, color:'#8c6478', fontStyle:'italic', lineHeight:1.85, marginBottom:26, whiteSpace:'pre-line' }}>{data.subtitle}</div>
        <div style={{ background:'rgba(196,160,180,0.15)', border:'1px solid rgba(196,160,180,0.4)', padding:'16px 24px', marginBottom:20 }}>
          {data.hebrewDate && <div style={{ fontSize:12, color:'#9a7080', marginBottom:4 }}>{data.hebrewDate}</div>}
          <div style={{ fontSize:19, fontWeight:700, color:'#3d1a2e', marginBottom:4 }}>{data.date}</div>
          <div style={{ fontSize:12, color:'#8c6478' }}>{data.ceremonyTime||data.time} · {data.venue}</div>
          {data.venueAddress && <div style={{ fontSize:11, color:'#a08090', marginTop:2 }}>{data.venueAddress}</div>}
        </div>
        {data.dresscode && <div style={{ fontSize:12, color:'#c4a0b4', letterSpacing:1, marginBottom:4 }}>קוד לבוש: {data.dresscode}</div>}
        {data.rsvpDate && <div style={{ fontSize:12, color:'#b09098' }}>RSVP עד {data.rsvpDate}</div>}
      </div>
    </div>
  );
}

// ─── Registry ────────────────────────────────────────────────────────────────

const RENDERERS = {
  'israeli-classic':  IsraeliClassic,
  'botanica':         Botanica,
  'noir-opulence':    NoirOpulence,
  'celestial':        Celestial,
  'terracotta-arch':  TerracottaArch,
  'dusty-romance':    DustyRomance,
};

export function renderTemplate(templateId, data) {
  const C = RENDERERS[templateId];
  return C ? <C data={data} /> : null;
}

export function TemplateThumbnail({ template, selected, onClick }) {
  const C = RENDERERS[template.id];
  const sample = {
    eventType: 'חתונה', coupleNames: 'נוי & ירין',
    subtitle: 'בלב מלא אהבה ובהתרגשות רבה,\nאנו מזמינים אתכם לחגוג עמנו',
    hebrewDate: 'יום שני, כ"ג בסיוון תשפ"ו', date: '08.06.2026',
    receptionTime: '19:00', ceremonyTime: '20:00',
    venue: 'COYA אומנות האירוח', venueAddress: 'הרוקמים 27, חולון',
    groomsParents: 'רינת ורונן שעשוע', bridesParents: 'ילנה פסחיה',
    message: '', dresscode: '', rsvpDate: '',
  };
  return (
    <button className={`template-thumb-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="template-thumb-preview">
        <div style={{ transform:'scale(0.32)', transformOrigin:'top center', width:312, pointerEvents:'none' }}>
          <C data={sample} />
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

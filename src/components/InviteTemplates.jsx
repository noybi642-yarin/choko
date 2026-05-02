// ─── Template registry ───────────────────────────────────────────────────────

export const TEMPLATES = [
  { id: 'wedding-romantic',  name: 'רומנטי בוטני',      desc: 'פאוניות ואקליפטוס, מסגרת זהב', emoji: '🌸' },
  { id: 'wedding-vintage',   name: 'וינטג׳ ורדים',       desc: 'ורדי שמן, בורגונדי ושמנת',      emoji: '🌹' },
  { id: 'wedding-minimal',   name: 'מינימליסטי מודרני',  desc: 'מגנוליה בקו אחד, שחור-לבן',    emoji: '🤍' },
  { id: 'wedding-garden',    name: 'גן בוטני',           desc: 'ירוק עמוק, פרחי בר ופיות',      emoji: '🌿' },
  { id: 'wedding-artdeco',   name: 'ארט דקו זהב',        desc: 'שחור ושמפניה, גאומטרי 1920',    emoji: '✦' },
  { id: 'challah-soft',      name: 'הפרשת חלה · עדין',  desc: 'חיטה, ורדים ורוד-עפר',          emoji: '🌾' },
  { id: 'challah-boho',      name: 'הפרשת חלה · בוהו',  desc: 'פמפס, טרקוטה, קשת',             emoji: '🏺' },
  { id: 'bachelorette',      name: 'מסיבת רווקות',       desc: 'ורוד דיסקו, כוכבים, טרופי',     emoji: '🪩' },
  { id: 'barmitzvah',        name: 'בר/בת מצווה',        desc: 'נייבי, זהב, מגן דוד',           emoji: '✡️' },
  { id: 'corporate',         name: 'אירוע חברה',          desc: 'ירוק יער, טרקוטה, נחושת',       emoji: '🌱' },
  { id: 'birthday',          name: 'יום הולדת',           desc: 'פוקסיה, דייזי, חגיגי',          emoji: '🌸' },
];

// ─── Shared helper ───────────────────────────────────────────────────────────

function splitNames(coupleNames = '') {
  const parts = coupleNames.split('&').map(s => s.trim());
  return [parts[0] || '', parts[1] || ''];
}

const W = 500, H = 700;

// ─── 1. Wedding Romantic ─────────────────────────────────────────────────────

function WeddingRomantic({ data }) {
  const [nameA, nameB] = splitNames(data.coupleNames);
  const Peony = ({ size = 90, hue = 'rose' }) => {
    const colors = hue === 'rose'
      ? { outer: '#E8B4B8', mid: '#D88C95', inner: '#B86670', center: '#8B3A47' }
      : { outer: '#F4D4D6', mid: '#E8B4B8', inner: '#D88C95', center: '#A85560' };
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
        {[0,60,120,180,240,300].map((deg,i) => <ellipse key={i} cx="50" cy="28" rx="14" ry="22" fill={colors.outer} opacity="0.85" transform={`rotate(${deg} 50 50)`} />)}
        {[30,90,150,210,270,330].map((deg,i) => <ellipse key={i} cx="50" cy="34" rx="11" ry="17" fill={colors.mid} opacity="0.9" transform={`rotate(${deg} 50 50)`} />)}
        {[0,72,144,216,288].map((deg,i) => <ellipse key={i} cx="50" cy="40" rx="7" ry="11" fill={colors.inner} transform={`rotate(${deg} 50 50)`} />)}
        <circle cx="50" cy="50" r="5" fill={colors.center} />
        <circle cx="50" cy="50" r="2.5" fill="#F4E4C1" />
      </svg>
    );
  };
  const EucalyptusBranch = ({ size = 120, rotate = 0, flip = false }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rotate}deg) ${flip ? 'scaleX(-1)' : ''}`, display: 'block' }}>
      <path d="M 10 50 Q 35 45 60 48 T 92 52" stroke="#7A8B6F" strokeWidth="1.2" fill="none" />
      {[{x:18,y:46,r:-25},{x:26,y:54,r:30},{x:36,y:44,r:-20},{x:44,y:53,r:35},{x:54,y:45,r:-30},{x:62,y:53,r:25},{x:72,y:47,r:-15},{x:80,y:53,r:30}]
        .map((l,i) => <ellipse key={i} cx={l.x} cy={l.y} rx="5" ry="8" fill="#9DAE94" opacity="0.85" transform={`rotate(${l.r} ${l.x} ${l.y})`} />)}
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'linear-gradient(180deg,#FBF6F0 0%,#F5EBE0 100%)', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif', color:'#3D2B2E' }}>
      <div style={{ position:'absolute', top:-20, left:-20 }}>
        <div style={{ position:'absolute', top:30, left:30 }}><Peony size={110} /></div>
        <div style={{ position:'absolute', top:80, left:90 }}><Peony size={70} hue="light" /></div>
        <div style={{ position:'absolute', top:-10, left:70 }}><EucalyptusBranch size={140} rotate={20} /></div>
      </div>
      <div style={{ position:'absolute', bottom:-30, right:-30, transform:'rotate(180deg)' }}>
        <div style={{ position:'absolute', top:30, left:30 }}><Peony size={110} /></div>
        <div style={{ position:'absolute', top:80, left:90 }}><Peony size={70} hue="light" /></div>
        <div style={{ position:'absolute', top:-10, left:70 }}><EucalyptusBranch size={140} rotate={20} /></div>
      </div>
      <div style={{ position:'absolute', inset:50, border:'1px solid #C9A961', borderRadius:2, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:56, border:'0.5px solid #C9A961', opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'75px 60px', textAlign:'center' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:11, letterSpacing:'0.15em', color:'#5A4548', lineHeight:1.7, marginBottom:14, whiteSpace:'pre-line' }}>
          {data.subtitle || 'בלב מלא אהבה ובהתרגשות רבה,\nמזמינים אתכם לחגוג עמנו'}
        </div>
        <div style={{ width:60, height:1, background:'#C9A961', margin:'0 auto 16px' }} />
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:46, fontWeight:300, lineHeight:1.05, color:'#3D2B2E', marginBottom:4 }}>{nameA}</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:26, color:'#8B3A47', margin:'2px 0' }}>&amp;</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:46, fontWeight:300, lineHeight:1.05, color:'#3D2B2E', marginBottom:16 }}>{nameB}</div>
        <div style={{ width:60, height:1, background:'#C9A961', margin:'0 auto 14px' }} />
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:30, height:1, background:'#C9A961' }} />
          <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:16, color:'#8B3A47', letterSpacing:'0.1em', textAlign:'center', lineHeight:1.5 }}>
            {data.hebrewDate && <>{data.hebrewDate}<br /></>}{data.date}
          </div>
          <div style={{ width:30, height:1, background:'#C9A961' }} />
        </div>
        {(data.receptionTime || data.ceremonyTime) && (
          <div style={{ marginTop:6, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.2em', color:'#5A4548' }}>
            {[data.receptionTime && `קבלת פנים ${data.receptionTime}`, data.ceremonyTime && `חופה ${data.ceremonyTime}`].filter(Boolean).join(' · ')}
          </div>
        )}
        <div style={{ marginTop:7, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.2em', color:'#7A6064', lineHeight:1.7, textTransform:'uppercase' }}>
          {data.venue}{data.venueAddress ? <><br />{data.venueAddress}</> : ''}
        </div>
        {(data.groomsParents || data.bridesParents) && (
          <div style={{ marginTop:10, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.1em', color:'#5A4548', lineHeight:1.9 }}>
            {data.groomsParents && <>{data.groomsParents}<br /></>}{data.bridesParents}
          </div>
        )}
        {(data.dresscode || data.rsvpDate) && (
          <div style={{ marginTop:8, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:11, color:'#8B3A47', letterSpacing:'0.2em' }}>
            {[data.dresscode && `— ${data.dresscode} —`, data.rsvpDate && `RSVP ${data.rsvpDate}`].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. Wedding Vintage ──────────────────────────────────────────────────────

function WeddingVintage({ data }) {
  const [nameA, nameB] = splitNames(data.coupleNames);
  const VintageRose = ({ size = 100, palette = 'burgundy' }) => {
    const p = palette === 'burgundy' ? { o:'#7A1F2E', m:'#A8364A', i:'#C95A6B', h:'#E8A1AB', c:'#5A1422' }
      : palette === 'blush' ? { o:'#D88C8C', m:'#E8B4B4', i:'#F2D2D2', h:'#F8E5E5', c:'#A85560' }
      : { o:'#C97A4A', m:'#D89878', i:'#E8B89A', h:'#F2D8C0', c:'#8B4A22' };
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        {[0,51,102,153,204,255,306].map((d,i) => <path key={`o${i}`} d="M 50 50 Q 35 25 50 8 Q 65 25 50 50 Z" fill={p.o} transform={`rotate(${d} 50 50)`} opacity="0.92" />)}
        {[25,76,127,178,229,280,331].map((d,i) => <path key={`m${i}`} d="M 50 50 Q 38 30 50 18 Q 62 30 50 50 Z" fill={p.m} transform={`rotate(${d} 50 50)`} />)}
        {[0,72,144,216,288].map((d,i) => <path key={`i${i}`} d="M 50 50 Q 42 35 50 28 Q 58 35 50 50 Z" fill={p.i} transform={`rotate(${d} 50 50)`} />)}
        <circle cx="50" cy="50" r="3" fill={p.c} />
      </svg>
    );
  };
  const Leaf = ({ x, y, rotate=0, size=30, color='#3D5A3F' }) => (
    <svg width={size} height={size*1.6} viewBox="0 0 30 50" style={{ position:'absolute', left:x, top:y, transform:`rotate(${rotate}deg)`, transformOrigin:'center' }}>
      <path d="M 15 5 Q 5 25 15 45 Q 25 25 15 5 Z" fill={color} opacity="0.9" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'radial-gradient(ellipse at center,#F8F1E8 0%,#E8DCC8 100%)', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif' }}>
      <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(45deg,transparent 0,transparent 2px,rgba(122,31,46,0.015) 2px,rgba(122,31,46,0.015) 4px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:-20, left:-30 }}>
        <div style={{ position:'absolute', top:30, left:30 }}><VintageRose size={100} palette="burgundy" /></div>
        <div style={{ position:'absolute', top:90, left:90 }}><VintageRose size={70} palette="blush" /></div>
        <div style={{ position:'absolute', top:20, left:110 }}><VintageRose size={55} palette="peach" /></div>
        <Leaf x={20} y={120} rotate={-30} size={35} />
        <Leaf x={130} y={90} rotate={45} size={28} />
      </div>
      <div style={{ position:'absolute', bottom:-30, right:-30 }}>
        <div style={{ position:'absolute', bottom:30, right:30 }}><VintageRose size={100} palette="burgundy" /></div>
        <div style={{ position:'absolute', bottom:90, right:90 }}><VintageRose size={70} palette="blush" /></div>
        <div style={{ position:'absolute', bottom:20, right:110 }}><VintageRose size={55} palette="peach" /></div>
      </div>
      <div style={{ position:'absolute', inset:60, border:'0.5px solid #7A1F2E', opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'100px 70px', textAlign:'center' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:11, letterSpacing:'0.15em', color:'#5A2030', lineHeight:1.7, marginBottom:16, whiteSpace:'pre-line' }}>
          {data.subtitle || 'בלב מלא אהבה ובהתרגשות רבה,\nמזמינים אתכם לחגוג עמנו'}
        </div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:80, fontWeight:400, lineHeight:0.9, color:'#7A1F2E', letterSpacing:'-0.02em' }}>{nameA}</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:32, color:'#A8364A', margin:'-2px 0' }}>&amp;</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:80, fontWeight:400, lineHeight:0.9, color:'#7A1F2E', letterSpacing:'-0.02em' }}>{nameB}</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px auto 10px' }}>
          <div style={{ width:50, height:0.5, background:'#7A1F2E' }} />
          <svg width="20" height="14" viewBox="0 0 20 14"><path d="M 10 14 L 4 7 Q 4 0 10 4 Q 16 0 16 7 Z" fill="#7A1F2E" /></svg>
          <div style={{ width:50, height:0.5, background:'#7A1F2E' }} />
        </div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:14, color:'#3D2B2E', letterSpacing:'0.1em', lineHeight:1.7 }}>
          {data.hebrewDate && <>{data.hebrewDate}<br /></>}{data.date}
        </div>
        {(data.receptionTime || data.ceremonyTime) && (
          <div style={{ marginTop:4, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.2em', color:'#7A1F2E' }}>
            {[data.receptionTime && `קבלת פנים ${data.receptionTime}`, data.ceremonyTime && `חופה ${data.ceremonyTime}`].filter(Boolean).join(' · ')}
          </div>
        )}
        <div style={{ marginTop:6, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:15, color:'#7A1F2E', lineHeight:1.6 }}>
          {data.venue}{data.venueAddress ? <><br />{data.venueAddress}</> : ''}
        </div>
        {(data.groomsParents || data.bridesParents) && (
          <div style={{ marginTop:10, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.1em', color:'#5A2030', lineHeight:1.9 }}>
            {data.groomsParents && <>{data.groomsParents}<br /></>}{data.bridesParents}
          </div>
        )}
        {(data.dresscode || data.rsvpDate) && (
          <div style={{ marginTop:8, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:11, color:'#A8364A', letterSpacing:'0.2em' }}>
            {[data.dresscode && `— ${data.dresscode} —`, data.rsvpDate && `RSVP ${data.rsvpDate}`].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 3. Wedding Minimal ──────────────────────────────────────────────────────

function WeddingMinimal({ data }) {
  const [nameA, nameB] = splitNames(data.coupleNames);
  const LineMagnolia = ({ size = 280 }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display:'block' }}>
      <defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F5F0E8" /><stop offset="100%" stopColor="#E8DCC8" /></linearGradient></defs>
      <path d="M 100 200 Q 100 160 100 130" stroke="#1A1A1A" strokeWidth="0.8" fill="none" />
      {[{d:"M 100 130 Q 50 110 40 60 Q 60 90 100 130 Z"},{d:"M 100 130 Q 150 110 160 60 Q 140 90 100 130 Z"},{d:"M 100 130 Q 75 80 95 30 Q 105 70 100 130 Z"},{d:"M 100 130 Q 125 80 105 30 Q 95 70 100 130 Z"}]
        .map((p,i) => <path key={i} d={p.d} fill="url(#pf)" stroke="#1A1A1A" strokeWidth="0.6" />)}
      <path d="M 100 110 Q 80 90 85 60 Q 95 85 100 110 Z" fill="#FAF6EE" stroke="#1A1A1A" strokeWidth="0.5" />
      <path d="M 100 110 Q 120 90 115 60 Q 105 85 100 110 Z" fill="#FAF6EE" stroke="#1A1A1A" strokeWidth="0.5" />
      <ellipse cx="100" cy="95" rx="3" ry="6" fill="#7A4A1F" />
      <path d="M 100 175 Q 130 165 145 135 Q 130 155 100 175 Z" fill="#2D2D2D" opacity="0.9" />
      <path d="M 100 165 Q 75 155 60 130 Q 75 150 100 165 Z" fill="#2D2D2D" opacity="0.9" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'#FAF6EE', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif', color:'#1A1A1A' }}>
      <div style={{ position:'absolute', inset:24, border:'0.5px solid #1A1A1A', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:50, left:'50%', transform:'translateX(-50%)' }}><LineMagnolia size={280} /></div>
      <div style={{ position:'absolute', left:44, top:'50%', transform:'translateY(-50%) rotate(-90deg)', transformOrigin:'left center', fontFamily:'"Heebo",sans-serif', fontSize:9, letterSpacing:'0.5em', color:'#1A1A1A', textTransform:'uppercase', whiteSpace:'nowrap' }}>
        {data.hebrewDate || data.date}
      </div>
      <div style={{ position:'absolute', right:44, top:'50%', transform:'translateY(-50%) rotate(90deg)', transformOrigin:'right center', fontFamily:'"Heebo",sans-serif', fontSize:9, letterSpacing:'0.5em', color:'#1A1A1A', textTransform:'uppercase', whiteSpace:'nowrap' }}>
        {data.venue}{data.ceremonyTime ? ` · ${data.ceremonyTime}` : ''}
      </div>
      <div style={{ position:'absolute', bottom:44, left:70, right:70, textAlign:'center' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:9, letterSpacing:'0.5em', textTransform:'uppercase', color:'#1A1A1A', marginBottom:10, whiteSpace:'pre-line' }}>
          {data.subtitle || 'The wedding of'}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:12 }}>
          <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:44, fontStyle:'italic', fontWeight:400, color:'#1A1A1A', lineHeight:1 }}>{nameA}</div>
          <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:22, fontStyle:'italic', color:'#B85542' }}>&amp;</div>
          <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:44, fontStyle:'italic', fontWeight:400, color:'#1A1A1A', lineHeight:1 }}>{nameB}</div>
        </div>
        <div style={{ margin:'10px auto 0', width:1, height:18, background:'#1A1A1A' }} />
        <div style={{ marginTop:10, fontFamily:'"Heebo",sans-serif', fontSize:9, letterSpacing:'0.3em', color:'#1A1A1A', lineHeight:1.7 }}>
          {data.hebrewDate && <>{data.hebrewDate}<br /></>}{data.date}
          {(data.receptionTime || data.ceremonyTime) && (
            <><br />{[data.receptionTime && `קבלת פנים ${data.receptionTime}`, data.ceremonyTime && `חופה ${data.ceremonyTime}`].filter(Boolean).join(' · ')}</>
          )}
          <br />{data.venue}{data.venueAddress ? ` · ${data.venueAddress}` : ''}
        </div>
        {(data.groomsParents || data.bridesParents) && (
          <div style={{ marginTop:8, fontFamily:'"Heebo",sans-serif', fontSize:9, letterSpacing:'0.1em', color:'#1A1A1A', lineHeight:1.8 }}>
            {data.groomsParents && <>{data.groomsParents}<br /></>}{data.bridesParents}
          </div>
        )}
        {(data.dresscode || data.rsvpDate) && (
          <div style={{ marginTop:6, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:10, color:'#B85542', letterSpacing:'0.2em' }}>
            {[data.dresscode && `— ${data.dresscode} —`, data.rsvpDate && `RSVP ${data.rsvpDate}`].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 4. Wedding Garden ───────────────────────────────────────────────────────

function WeddingGarden({ data }) {
  const [nameA, nameB] = splitNames(data.coupleNames);
  const Wildflower = ({ size=70, color='#FFFFFF', center='#3A2A1A' }) => (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {[0,45,90,135,180,225,270,315].map((d,i) => <ellipse key={i} cx="30" cy="14" rx="6" ry="11" fill={color} stroke="#2A4A30" strokeWidth="0.4" transform={`rotate(${d} 30 30)`} />)}
      <circle cx="30" cy="30" r="6" fill={center} />
    </svg>
  );
  const LeafBranch = ({ size=180, rotate=0 }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform:`rotate(${rotate}deg)` }}>
      <path d="M 20 180 Q 70 130 100 80 Q 130 30 180 10" stroke="#2A4A30" strokeWidth="1.2" fill="none" />
      {[{x:30,y:165,r:-45},{x:50,y:140,r:-30},{x:75,y:115,r:-20},{x:95,y:85,r:-15},{x:115,y:60,r:5},{x:145,y:35,r:25},{x:170,y:20,r:40}]
        .map((l,i) => <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}><path d="M 0 0 Q -8 -15 0 -28 Q 8 -15 0 0 Z" fill="#3D6B43" stroke="#1F3A22" strokeWidth="0.3" /></g>)}
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'#1F3A2C', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(245,230,200,0.06) 0%,transparent 70%)' }} />
      <div style={{ position:'absolute', top:-40, left:-30 }}><LeafBranch size={250} rotate={-10} /></div>
      <div style={{ position:'absolute', top:-40, right:-30, transform:'scaleX(-1)' }}><LeafBranch size={250} rotate={-10} /></div>
      <div style={{ position:'absolute', top:30, left:110 }}><Wildflower size={55} color="#F5E6C8" center="#C46B4A" /></div>
      <div style={{ position:'absolute', top:60, right:130 }}><Wildflower size={45} color="#FFFFFF" center="#3A2A1A" /></div>
      <div style={{ position:'absolute', bottom:-50, left:-30, transform:'scaleY(-1)' }}><LeafBranch size={220} rotate={-10} /></div>
      <div style={{ position:'absolute', bottom:-50, right:-40, transform:'scaleY(-1) scaleX(-1)' }}><LeafBranch size={220} rotate={-10} /></div>
      <div style={{ position:'absolute', bottom:40, left:120 }}><Wildflower size={50} color="#F5E6C8" center="#C46B4A" /></div>
      <div style={{ position:'absolute', bottom:80, right:110 }}><Wildflower size={42} color="#FFFFFF" center="#3A2A1A" /></div>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', color:'#F5E6C8' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.2em', color:'#C9A961', lineHeight:1.7, marginBottom:14, whiteSpace:'pre-line' }}>
          {data.subtitle || 'בלב מלא אהבה ובהתרגשות רבה,\nמזמינים אתכם לחגוג עמנו'}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{ width:28, height:0.5, background:'#C9A961' }} />
          <div style={{ width:6, height:6, background:'#C46B4A', borderRadius:'50%' }} />
          <div style={{ width:28, height:0.5, background:'#C9A961' }} />
        </div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:68, fontWeight:400, lineHeight:0.95, color:'#F5E6C8' }}>{nameA}</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:24, color:'#C9A961', margin:'-2px 0' }}>and</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:68, fontWeight:400, lineHeight:0.95, color:'#F5E6C8' }}>{nameB}</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'14px 0 10px' }}>
          <div style={{ width:28, height:0.5, background:'#C9A961' }} />
          <div style={{ width:28, height:0.5, background:'#C9A961' }} />
        </div>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.25em', color:'#F5E6C8', lineHeight:1.9 }}>
          {data.hebrewDate && <>{data.hebrewDate}<br /></>}{data.date}
          {(data.receptionTime || data.ceremonyTime) && (
            <><br />{[data.receptionTime && `קבלת פנים ${data.receptionTime}`, data.ceremonyTime && `חופה ${data.ceremonyTime}`].filter(Boolean).join(' · ')}</>
          )}
          <br /><span style={{ color:'#C9A961' }}>{data.venue}{data.venueAddress ? ` · ${data.venueAddress}` : ''}</span>
        </div>
        {(data.groomsParents || data.bridesParents) && (
          <div style={{ marginTop:10, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.1em', color:'#C9A961', lineHeight:1.9 }}>
            {data.groomsParents && <>{data.groomsParents}<br /></>}{data.bridesParents}
          </div>
        )}
        {(data.dresscode || data.rsvpDate) && (
          <div style={{ marginTop:8, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:11, color:'#C9A961', letterSpacing:'0.2em' }}>
            {[data.dresscode && `— ${data.dresscode} —`, data.rsvpDate && `RSVP ${data.rsvpDate}`].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 5. Wedding Art Deco ─────────────────────────────────────────────────────

function WeddingArtDeco({ data }) {
  const [nameA, nameB] = splitNames(data.coupleNames);
  const initA = nameA[0] || 'N';
  const initB = nameB[0] || 'Y';
  const DecoFan = ({ size=100, color='#C9A961' }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {[0,15,30,45,60,75,90,105,120,135,150,165,180].map((d,i) => <line key={i} x1="50" y1="80" x2={50+40*Math.cos((d-90)*Math.PI/180)} y2={80+40*Math.sin((d-90)*Math.PI/180)} stroke={color} strokeWidth="0.8" />)}
      <path d="M 10 80 Q 50 35 90 80" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 18 80 Q 50 45 82 80" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7" />
      <circle cx="50" cy="80" r="2.5" fill={color} />
    </svg>
  );
  const Sunburst = ({ size=200 }) => (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {Array.from({length:36}).map((_,i) => {
        const angle = i*10*Math.PI/180;
        const inner = i%3===0?30:40, outer = i%3===0?95:80;
        return <line key={i} x1={100+inner*Math.cos(angle)} y1={100+inner*Math.sin(angle)} x2={100+outer*Math.cos(angle)} y2={100+outer*Math.sin(angle)} stroke="#C9A961" strokeWidth={i%3===0?"0.8":"0.4"} opacity={i%3===0?"0.7":"0.4"} />;
      })}
      <circle cx="100" cy="100" r="28" fill="none" stroke="#C9A961" strokeWidth="0.8" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'linear-gradient(180deg,#1A1410 0%,#0D0908 100%)', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif', color:'#F5E6C8' }}>
      <svg width="100%" height="100%" viewBox="0 0 500 700" style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <rect x="22" y="22" width="456" height="656" fill="none" stroke="#C9A961" strokeWidth="1" />
        <rect x="28" y="28" width="444" height="644" fill="none" stroke="#C9A961" strokeWidth="0.4" opacity="0.6" />
        {[{x:28,y:28,r:0},{x:472,y:28,r:90},{x:472,y:672,r:180},{x:28,y:672,r:270}].map((c,i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`}>
            <path d="M 0 0 L 40 0 L 40 4 L 4 4 L 4 40 L 0 40 Z" fill="#C9A961" />
            <circle cx="14" cy="14" r="2" fill="#C9A961" />
          </g>
        ))}
      </svg>
      <div style={{ position:'absolute', top:50, left:'50%', transform:'translateX(-50%) scaleY(-1)' }}><DecoFan size={90} /></div>
      <div style={{ position:'absolute', bottom:50, left:'50%', transform:'translateX(-50%)' }}><DecoFan size={90} /></div>
      <div style={{ position:'absolute', top:210, left:'50%', transform:'translateX(-50%)' }}><Sunburst size={260} /></div>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 70px' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.5em', color:'#C9A961', textTransform:'uppercase', marginBottom:24, whiteSpace:'pre-line', lineHeight:1.7 }}>
          {data.subtitle || '★ The Wedding Of ★'}
        </div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:90, fontWeight:400, color:'#C9A961', lineHeight:1, letterSpacing:'-0.05em', textShadow:'0 0 30px rgba(201,169,97,0.3)' }}>
          {initA} <span style={{ fontSize:68, color:'#F5E6C8' }}>&amp;</span> {initB}
        </div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:24, fontWeight:400, color:'#F5E6C8', letterSpacing:'0.15em', marginTop:12, marginBottom:4 }}>{data.coupleNames}</div>
        <div style={{ margin:'18px auto 12px', width:100, height:1, background:'#C9A961' }} />
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:11, letterSpacing:'0.35em', color:'#F5E6C8', lineHeight:2 }}>
          {data.hebrewDate && <>{data.hebrewDate}<br /></>}{data.date}
          {(data.receptionTime || data.ceremonyTime) && (
            <><br />{[data.receptionTime && `קבלת פנים ${data.receptionTime}`, data.ceremonyTime && `חופה ${data.ceremonyTime}`].filter(Boolean).join(' · ')}</>
          )}
          <br /><span style={{ color:'#C9A961' }}>{data.venue}{data.venueAddress ? ` · ${data.venueAddress}` : ''}</span>
        </div>
        {(data.groomsParents || data.bridesParents) && (
          <div style={{ marginTop:12, fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.15em', color:'#C9A961', lineHeight:1.9 }}>
            {data.groomsParents && <>{data.groomsParents}<br /></>}{data.bridesParents}
          </div>
        )}
        {(data.dresscode || data.rsvpDate) && (
          <div style={{ marginTop:10, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:11, color:'#8B7340', letterSpacing:'0.3em' }}>
            {[data.dresscode && `— ${data.dresscode} —`, data.rsvpDate && `RSVP ${data.rsvpDate}`].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 6. Challah Soft ─────────────────────────────────────────────────────────

function ChallahSoft({ data }) {
  const [nameA] = splitNames(data.coupleNames);
  const WheatStalk = ({ size=140, rotate=0, color='#C9A961' }) => (
    <svg width={size} height={size} viewBox="0 0 100 200" style={{ transform:`rotate(${rotate}deg)`, display:'block' }}>
      <path d="M 50 195 L 50 60" stroke={color} strokeWidth="1" fill="none" />
      {[{y:50,s:0,d:-20},{y:60,s:1,d:20},{y:70,s:0,d:-25},{y:80,s:1,d:25},{y:90,s:0,d:-25},{y:100,s:1,d:25},{y:110,s:0,d:-25},{y:120,s:1,d:25},{y:130,s:0,d:-25},{y:140,s:1,d:25}]
        .map((g,i) => { const cx=g.s===0?42:58; return <g key={i}><ellipse cx={cx} cy={g.y} rx="5" ry="9" fill={color} transform={`rotate(${g.d} ${cx} ${g.y})`} /></g>; })}
      <ellipse cx="50" cy="40" rx="5" ry="10" fill={color} />
    </svg>
  );
  const Rose = ({ size=50, color='#D88C95' }) => (
    <svg width={size} height={size} viewBox="0 0 50 50">
      {[0,60,120,180,240,300].map((d,i) => <ellipse key={i} cx="25" cy="14" rx="6" ry="10" fill={color} opacity="0.85" transform={`rotate(${d} 25 25)`} />)}
      {[30,90,150,210,270,330].map((d,i) => <ellipse key={`m${i}`} cx="25" cy="18" rx="4" ry="7" fill={color} transform={`rotate(${d} 25 25)`} />)}
      <circle cx="25" cy="25" r="3" fill="#8B3A47" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'linear-gradient(180deg,#FAF3E8 0%,#F4E8D5 100%)', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif' }}>
      <div style={{ position:'absolute', top:-10, left:30 }}><WheatStalk size={150} rotate={-25} /></div>
      <div style={{ position:'absolute', top:-10, right:30 }}><WheatStalk size={150} rotate={25} /></div>
      <div style={{ position:'absolute', top:20, left:100 }}><WheatStalk size={130} rotate={-10} color="#B89241" /></div>
      <div style={{ position:'absolute', top:20, right:100 }}><WheatStalk size={130} rotate={10} color="#B89241" /></div>
      <div style={{ position:'absolute', top:40, left:200 }}><Rose size={45} color="#D88C95" /></div>
      <div style={{ position:'absolute', top:80, left:160 }}><Rose size={35} color="#E8B4B8" /></div>
      <div style={{ position:'absolute', top:80, right:160 }}><Rose size={35} color="#C9A6BB" /></div>
      <div style={{ position:'absolute', bottom:30, left:60 }}><Rose size={50} color="#D88C95" /></div>
      <div style={{ position:'absolute', bottom:60, left:30 }}><Rose size={36} color="#C9A6BB" /></div>
      <div style={{ position:'absolute', bottom:30, right:60 }}><Rose size={50} color="#D88C95" /></div>
      <div style={{ position:'absolute', bottom:60, right:30 }}><Rose size={36} color="#E8B4B8" /></div>
      <div style={{ position:'absolute', inset:50, border:'0.5px solid #C9A961', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'180px 70px', textAlign:'center' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:10, letterSpacing:'0.4em', color:'#8B3A47', textTransform:'uppercase', marginBottom:4 }}>בס״ד</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:13, letterSpacing:'0.3em', color:'#A8364A', marginBottom:18 }}>תפילה, ברכה ואהבה</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:42, fontWeight:400, color:'#5A1F2E', lineHeight:1.05, letterSpacing:'0.02em' }}>הפרשת חלה</div>
        <div style={{ margin:'16px auto', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:0.5, background:'#C9A961' }} />
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M 7 0 L 9 5 L 14 7 L 9 9 L 7 14 L 5 9 L 0 7 L 5 5 Z" fill="#C9A961" /></svg>
          <div style={{ width:38, height:0.5, background:'#C9A961' }} />
        </div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:20, color:'#8B3A47', marginBottom:4 }}>לכבוד החתונה של</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:36, fontWeight:400, color:'#5A1F2E', lineHeight:1.1 }}>{nameA || data.coupleNames}</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:20, color:'#A8364A' }}>הכלה</div>
        <div style={{ marginTop:22, fontFamily:'"Heebo",sans-serif', fontSize:12, letterSpacing:'0.2em', color:'#5A1F2E', lineHeight:2 }}>
          {data.hebrewDate || data.date}<br />
          <span style={{ color:'#8B3A47' }}>{data.venue}{data.venueAddress ? ` · ${data.venueAddress}` : ''}</span><br />
          <span style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:15 }}>{data.receptionTime || data.ceremonyTime} · נשמח לראותכן</span>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Challah Boho ─────────────────────────────────────────────────────────

function ChallahBoho({ data }) {
  const [nameA] = splitNames(data.coupleNames);
  const Pampas = ({ size=140, rotate=0, color='#E8D9B0' }) => (
    <svg width={size} height={size} viewBox="0 0 100 200" style={{ transform:`rotate(${rotate}deg)`, display:'block' }}>
      <path d="M 50 195 Q 50 150 50 100" stroke="#9B7A4A" strokeWidth="0.8" fill="none" />
      {Array.from({length:30}).map((_,i) => { const t=i/30, y=100-t*90, x=50+Math.sin(i)*14*(1-t*0.3); return <ellipse key={i} cx={x} cy={y} rx="2" ry="6" fill={color} opacity={0.7-t*0.3} transform={`rotate(${(i*7)%360} ${x} ${y})`} />; })}
    </svg>
  );
  const DriedFlower = ({ size=50, color='#C46B4A' }) => (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <path d="M 25 50 L 25 25" stroke="#7A5A3A" strokeWidth="0.6" />
      {[0,45,90,135,180,225,270,315].map((d,i) => <ellipse key={i} cx="25" cy="14" rx="4" ry="9" fill={color} opacity="0.9" transform={`rotate(${d} 25 25)`} />)}
      <circle cx="25" cy="25" r="3" fill="#5A3A1A" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'#F5EDD9', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 40%,rgba(196,107,74,0.08) 0%,transparent 50%)' }} />
      <svg width={W} height={H} style={{ position:'absolute', inset:0 }}>
        <path d={`M 90 ${H-80} L 90 280 Q 90 130 ${W/2} 130 Q ${W-90} 130 ${W-90} 280 L ${W-90} ${H-80} Z`} fill="none" stroke="#C46B4A" strokeWidth="1.2" />
        <path d={`M 100 ${H-80} L 100 285 Q 100 140 ${W/2} 140 Q ${W-100} 140 ${W-100} 285 L ${W-100} ${H-80} Z`} fill="none" stroke="#C46B4A" strokeWidth="0.5" opacity="0.5" />
      </svg>
      <div style={{ position:'absolute', top:-20, left:-10 }}><Pampas size={150} rotate={-25} /></div>
      <div style={{ position:'absolute', top:-30, left:60 }}><Pampas size={130} rotate={-10} color="#D4A872" /></div>
      <div style={{ position:'absolute', top:-20, right:-10, transform:'scaleX(-1)' }}><Pampas size={150} rotate={-25} /></div>
      <div style={{ position:'absolute', top:-30, right:60, transform:'scaleX(-1)' }}><Pampas size={130} rotate={-10} color="#D4A872" /></div>
      <div style={{ position:'absolute', top:60, left:130 }}><DriedFlower size={48} color="#C46B4A" /></div>
      <div style={{ position:'absolute', top:80, right:130 }}><DriedFlower size={42} color="#D4A064" /></div>
      <div style={{ position:'absolute', top:165, left:110, right:110, bottom:130, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:12, letterSpacing:'0.3em', color:'#7A4A2A', marginBottom:18 }}>A blessing for the bride</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:38, fontWeight:400, color:'#3D2A1F', lineHeight:1 }}>הפרשת חלה</div>
        <div style={{ margin:'16px auto', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:0.5, background:'#C46B4A' }} />
          <div style={{ width:6, height:6, background:'#C46B4A', transform:'rotate(45deg)' }} />
          <div style={{ width:28, height:0.5, background:'#C46B4A' }} />
        </div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:18, color:'#7A4A2A' }}>לכבוד הכלה</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:30, fontWeight:400, color:'#3D2A1F', marginTop:4, letterSpacing:'0.05em' }}>{nameA || data.coupleNames}</div>
        <div style={{ marginTop:16, padding:'8px 0', borderTop:'0.5px solid #C46B4A', borderBottom:'0.5px solid #C46B4A', width:'90%', fontFamily:'"Heebo",sans-serif', fontSize:11, letterSpacing:'0.2em', color:'#3D2A1F', lineHeight:1.9 }}>
          {data.hebrewDate || data.date}{data.receptionTime ? ` · ${data.receptionTime}` : ''}<br />
          <span style={{ color:'#7A4A2A' }}>{data.venue}{data.venueAddress ? ` · ${data.venueAddress}` : ''}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 8. Bachelorette ─────────────────────────────────────────────────────────

function Bachelorette({ data }) {
  const [nameA] = splitNames(data.coupleNames);
  const Palm = ({ size=200, rotate=0, flip=false }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform:`rotate(${rotate}deg) ${flip?'scaleX(-1)':''}`, display:'block' }}>
      <path d="M 100 200 Q 100 150 100 100" stroke="#3D6B43" strokeWidth="2.5" fill="none" />
      {[{d:"M 100 100 Q 60 90 25 70 Q 60 95 100 100 Z",c:'#5A8B3A'},{d:"M 100 100 Q 140 90 175 70 Q 140 95 100 100 Z",c:'#5A8B3A'},{d:"M 100 100 Q 70 75 35 45 Q 75 80 100 100 Z",c:'#7AAB4A'},{d:"M 100 100 Q 130 75 165 45 Q 125 80 100 100 Z",c:'#7AAB4A'}]
        .map((l,i) => <path key={i} d={l.d} fill={l.c} opacity="0.9" />)}
    </svg>
  );
  const Star = ({ x, y, size=16, color='#FFD24A' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ position:'absolute', left:x, top:y }}>
      <path d="M 8 0 L 9.5 6.5 L 16 8 L 9.5 9.5 L 8 16 L 6.5 9.5 L 0 8 L 6.5 6.5 Z" fill={color} />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'linear-gradient(180deg,#FFB8D1 0%,#FF6FA1 45%,#C9417A 100%)', position:'relative', overflow:'hidden', fontFamily:'"Heebo",sans-serif' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 70% 20%,rgba(255,215,100,0.3) 0%,transparent 40%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:-50, left:-60 }}><Palm size={220} rotate={-20} /></div>
      <div style={{ position:'absolute', top:-40, right:-60 }}><Palm size={220} rotate={20} flip /></div>
      <div style={{ position:'absolute', bottom:-80, left:-40 }}><Palm size={180} rotate={-150} /></div>
      <div style={{ position:'absolute', bottom:-80, right:-40 }}><Palm size={180} rotate={150} flip /></div>
      <Star x={70} y={150} size={20} />
      <Star x={420} y={170} size={16} />
      <Star x={50} y={420} size={18} color="#FFFFFF" />
      <Star x={440} y={380} size={14} />
      <Star x={100} y={550} size={12} color="#FFD24A" />
      <Star x={400} y={560} size={14} color="#FFFFFF" />
      <div style={{ position:'absolute', top:210, left:50, right:50, textAlign:'center' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:20, color:'#FFE9A8', letterSpacing:'0.2em' }}>last fling before the</div>
      </div>
      <div style={{ position:'absolute', top:248, left:0, right:0, textAlign:'center' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:500, fontSize:120, lineHeight:0.9, color:'#FFE9A8', letterSpacing:'-0.04em', textShadow:'0 4px 0 rgba(123,31,77,0.3)' }}>ring!</div>
      </div>
      <div style={{ position:'absolute', top:405, left:0, right:0, textAlign:'center' }}>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:26, color:'#FFFFFF', letterSpacing:'0.05em', fontWeight:500 }}>מסיבת רווקות · {nameA || data.coupleNames}</div>
      </div>
      <div style={{ position:'absolute', bottom:80, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#FFE9A8 0%,#FFD24A 100%)', padding:'14px 30px', borderRadius:999, textAlign:'center', boxShadow:'0 6px 0 rgba(123,31,77,0.4)', border:'2px solid #C9A961', whiteSpace:'nowrap' }}>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:11, letterSpacing:'0.4em', color:'#7B1F4D', fontWeight:500 }}>{data.date}</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:17, color:'#7B1F4D', fontWeight:600, marginTop:2 }}>{data.receptionTime || data.ceremonyTime} · {data.venue}</div>
      </div>
      {data.dresscode && <div style={{ position:'absolute', bottom:30, left:0, right:0, textAlign:'center', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:13, color:'#FFE9A8', letterSpacing:'0.4em' }}>✦ {data.dresscode} ✦</div>}
    </div>
  );
}

// ─── 9. Bar/Bat Mitzvah ──────────────────────────────────────────────────────

function BarMitzvah({ data }) {
  const [nameA] = splitNames(data.coupleNames);
  const StarOrnament = ({ size=60, color='#C9A961' }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <g fill="none" stroke={color} strokeWidth="1.2">
        <polygon points="50,10 61,40 92,40 67,58 77,88 50,70 23,88 33,58 8,40 39,40" />
        <circle cx="50" cy="50" r="35" opacity="0.4" />
        <circle cx="50" cy="50" r="20" opacity="0.3" />
      </g>
    </svg>
  );
  const Olive = ({ size=100, rotate=0 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform:`rotate(${rotate}deg)` }}>
      <path d="M 50 90 Q 50 50 50 10" stroke="#C9A961" strokeWidth="0.8" fill="none" opacity="0.7" />
      {[{y:20,s:'l'},{y:30,s:'r'},{y:40,s:'l'},{y:50,s:'r'},{y:60,s:'l'},{y:70,s:'r'},{y:80,s:'l'}]
        .map((l,i) => <ellipse key={i} cx={l.s==='l'?42:58} cy={l.y} rx="3.5" ry="9" fill="#C9A961" opacity="0.8" transform={`rotate(${l.s==='l'?-30:30} ${l.s==='l'?42:58} ${l.y})`} />)}
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'#0F1E3D', position:'relative', overflow:'hidden', fontFamily:'"Frank Ruhl Libre",serif', color:'#F4E4C1' }}>
      <svg width={W} height={H} style={{ position:'absolute', inset:0, opacity:0.25 }}>
        {Array.from({length:60}).map((_,i) => <circle key={i} cx={(i*73+17)%W} cy={(i*137+41)%H} r={(i%4)*0.4+0.5} fill="#F4E4C1" />)}
      </svg>
      <div style={{ position:'absolute', top:40, left:'50%', transform:'translateX(-50%)' }}>
        <svg width={380} height={120} viewBox="0 0 380 120">
          <path d="M 0 120 L 0 50 Q 190 0 380 50 L 380 120" fill="none" stroke="#C9A961" strokeWidth="1" />
          <path d="M 10 120 L 10 52 Q 190 8 370 52 L 370 120" fill="none" stroke="#C9A961" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>
      <div style={{ position:'absolute', top:30, left:30, opacity:0.6 }}><StarOrnament size={50} /></div>
      <div style={{ position:'absolute', top:30, right:30, opacity:0.6 }}><StarOrnament size={50} /></div>
      <div style={{ position:'absolute', bottom:40, left:30 }}><Olive size={110} rotate={-30} /></div>
      <div style={{ position:'absolute', bottom:40, right:30 }}><Olive size={110} rotate={30} /></div>
      <div style={{ position:'absolute', bottom:30, left:70, right:70, height:1, background:'linear-gradient(90deg,transparent,#C9A961 20%,#C9A961 80%,transparent)' }} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 70px', textAlign:'center' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:13, letterSpacing:'0.4em', color:'#C9A961', textTransform:'uppercase', marginBottom:6 }}>בס״ד</div>
        <div style={{ fontFamily:'"Heebo",sans-serif', fontSize:11, letterSpacing:'0.3em', color:'#A89060', marginBottom:24 }}>ויהי בנעם · עלה והצלח</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:52, fontWeight:400, lineHeight:1, color:'#F4E4C1', letterSpacing:'0.02em' }}>{data.eventType || 'בר מצווה'}</div>
        <div style={{ margin:'22px auto', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:38, height:1, background:'#C9A961' }} />
          <div style={{ width:8, height:8, background:'#C9A961', transform:'rotate(45deg)' }} />
          <div style={{ width:38, height:1, background:'#C9A961' }} />
        </div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:44, fontWeight:400, lineHeight:1.1, color:'#F4E4C1', marginBottom:4 }}>{nameA || data.coupleNames}</div>
        {data.subtitle && <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:15, color:'#A89060', marginBottom:20 }}>{data.subtitle}</div>}
        <div style={{ padding:'12px 0', borderTop:'0.5px solid rgba(201,169,97,0.4)', borderBottom:'0.5px solid rgba(201,169,97,0.4)', width:'70%', fontFamily:'"Heebo",sans-serif', fontSize:12, letterSpacing:'0.2em', color:'#F4E4C1', lineHeight:2 }}>
          {data.hebrewDate && <>{data.hebrewDate}<br /></>}
          {data.date}<br />
          <span style={{ color:'#C9A961' }}>{data.venue}{data.ceremonyTime ? ` · ${data.ceremonyTime}` : ''}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 10. Corporate ───────────────────────────────────────────────────────────

function Corporate({ data }) {
  const Fern = ({ size=200, rotate=0, flip=false }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform:`rotate(${rotate}deg) ${flip?'scaleX(-1)':''}`, display:'block' }}>
      <path d="M 100 190 Q 95 100 100 10" stroke="#2D4A3A" strokeWidth="1.5" fill="none" />
      {Array.from({length:18}).map((_,i) => { const y=25+i*9, len=50-Math.abs(i-9)*3; return <g key={i}><path d={`M 100 ${y} Q ${100-len*0.4} ${y-5} ${100-len} ${y-12}`} stroke="#3D5A48" strokeWidth="0.8" fill="none" /><path d={`M 100 ${y} Q ${100+len*0.4} ${y-5} ${100+len} ${y-12}`} stroke="#3D5A48" strokeWidth="0.8" fill="none" /><ellipse cx={100-len} cy={y-12} rx="4" ry="9" fill="#4A6B54" opacity="0.85" transform={`rotate(-30 ${100-len} ${y-12})`} /><ellipse cx={100+len} cy={y-12} rx="4" ry="9" fill="#4A6B54" opacity="0.85" transform={`rotate(30 ${100+len} ${y-12})`} /></g>; })}
    </svg>
  );
  const TerracottaBlossom = ({ size=60 }) => (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {[0,72,144,216,288].map((deg,i) => <ellipse key={i} cx="30" cy="16" rx="8" ry="14" fill="#C46B4A" opacity="0.85" transform={`rotate(${deg} 30 30)`} />)}
      <circle cx="30" cy="30" r="5" fill="#8B3A1F" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'#F8F3E9', position:'relative', overflow:'hidden', fontFamily:'"Heebo",sans-serif', color:'#1F2F26' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:220, background:'#1F3A2C' }} />
      <div style={{ position:'absolute', top:-30, left:-50 }}><Fern size={220} rotate={-15} /></div>
      <div style={{ position:'absolute', top:-30, right:-50 }}><Fern size={220} rotate={15} flip /></div>
      <div style={{ position:'absolute', top:220, left:0, right:0, height:4, background:'#B8923D' }} />
      <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:10, letterSpacing:'0.5em', color:'#B8923D', textTransform:'uppercase', marginBottom:14 }}>— {data.eventType || 'Annual Gathering'} —</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:36, color:'#F8F3E9', fontWeight:300, lineHeight:1, letterSpacing:'0.05em' }}>{data.coupleNames}</div>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:16, color:'#D4B66A', marginTop:8 }}>{data.subtitle || 'A Celebration of the Year'}</div>
      </div>
      <div style={{ position:'absolute', top:240, left:0, right:0, bottom:0, padding:'32px 60px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ marginBottom:14 }}><TerracottaBlossom size={46} /></div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:20, color:'#1F3A2C', textAlign:'center', lineHeight:1.5, fontWeight:300, marginBottom:24, maxWidth:320 }}>{data.message || 'ערב חגיגי לעובדים, שותפים ולקוחות נבחרים'}</div>
        <div style={{ width:'100%', display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:18, padding:'18px 0', borderTop:'1px solid #B8923D', borderBottom:'1px solid #B8923D' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:9, letterSpacing:'0.3em', color:'#8B3A1F', marginBottom:6 }}>תאריך</div>
            <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:18, color:'#1F3A2C' }}>{data.date}</div>
          </div>
          <div style={{ width:1, height:38, background:'#B8923D', opacity:0.4 }} />
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:9, letterSpacing:'0.3em', color:'#8B3A1F', marginBottom:6 }}>שעה</div>
            <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:18, color:'#1F3A2C' }}>{data.ceremonyTime || data.receptionTime}</div>
          </div>
        </div>
        <div style={{ marginTop:18, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:16, color:'#1F3A2C' }}>{data.venue}{data.venueAddress ? ` · ${data.venueAddress}` : ''}</div>
        {data.dresscode && <div style={{ marginTop:'auto', fontSize:9, letterSpacing:'0.3em', color:'#8B3A1F', textTransform:'uppercase' }}>{data.dresscode}{data.rsvpDate ? ` · RSVP by ${data.rsvpDate}` : ''}</div>}
      </div>
    </div>
  );
}

// ─── 11. Birthday ────────────────────────────────────────────────────────────

function Birthday({ data }) {
  const [nameA] = splitNames(data.coupleNames);
  const Daisy = ({ size=120, color='#FFD24A', center='#E85D75' }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {Array.from({length:12}).map((_,i) => <ellipse key={i} cx="50" cy="22" rx="9" ry="20" fill={color} transform={`rotate(${i*30} 50 50)`} />)}
      <circle cx="50" cy="50" r="13" fill={center} />
      <circle cx="50" cy="50" r="6" fill="#FFE9A8" />
    </svg>
  );
  return (
    <div style={{ width:W, height:H, background:'#FFF4E0', position:'relative', overflow:'hidden', fontFamily:'"Heebo",sans-serif' }}>
      <svg width={W} height="180" viewBox={`0 0 ${W} 180`} style={{ position:'absolute', top:0, left:0 }}>
        <path d={`M 0 0 L ${W} 0 L ${W} 130 ${Array.from({length:12}).map((_,i) => { const x=W-(i+0.5)*(W/12); return `Q ${x+W/24} 170 ${x} 130`; }).join(' ')} L 0 130 Z`} fill="#E85D75" />
      </svg>
      {Array.from({length:12}).map((_,i) => <div key={`dot-${i}`} style={{ position:'absolute', top:145, left:22+i*40, width:6, height:6, borderRadius:'50%', background:'#E85D75' }} />)}
      <div style={{ position:'absolute', top:12, left:18 }}><Daisy size={80} color="#FFD24A" center="#E85D75" /></div>
      <div style={{ position:'absolute', top:8, right:30 }}><Daisy size={70} color="#FF8FA3" center="#7B3F5C" /></div>
      <div style={{ position:'absolute', bottom:-20, left:-20 }}><Daisy size={130} color="#FF8FA3" center="#FFD24A" /></div>
      <div style={{ position:'absolute', bottom:-10, right:-10 }}><Daisy size={110} color="#E85D75" center="#FFD24A" /></div>
      <div style={{ position:'absolute', bottom:60, left:90 }}><Daisy size={70} color="#FFD24A" center="#E85D75" /></div>
      <div style={{ position:'absolute', top:40, left:0, right:0, textAlign:'center', color:'#FFF4E0' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:14, letterSpacing:'0.3em', opacity:0.9 }}>come celebrate</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:36, fontWeight:400, marginTop:4 }}>{data.eventType || 'יום הולדת!'}</div>
      </div>
      <div style={{ position:'absolute', top:195, left:60, right:60, textAlign:'center' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:17, color:'#7B3F5C' }}>{data.subtitle || 'חוגגים את'}</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:70, fontWeight:400, color:'#7B3F5C', lineHeight:1, marginTop:8 }}>{nameA || data.coupleNames}</div>
        {data.message && <div style={{ marginTop:14, fontFamily:'"Heebo",sans-serif', fontSize:13, color:'#7B3F5C', lineHeight:1.8 }}>{data.message}</div>}
      </div>
      <div style={{ position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)', background:'#7B3F5C', color:'#FFE9A8', padding:'14px 30px', borderRadius:999, textAlign:'center', fontFamily:'"Heebo",sans-serif', boxShadow:'0 6px 0 #5A2D44', whiteSpace:'nowrap' }}>
        <div style={{ fontSize:11, letterSpacing:'0.3em', opacity:0.7 }}>{data.date}</div>
        <div style={{ fontFamily:'"Frank Ruhl Libre",serif', fontSize:16, marginTop:2 }}>{data.receptionTime || data.ceremonyTime} · {data.venue}</div>
      </div>
    </div>
  );
}

// ─── Registry ────────────────────────────────────────────────────────────────

const RENDERERS = {
  'wedding-romantic': WeddingRomantic,
  'wedding-vintage':  WeddingVintage,
  'wedding-minimal':  WeddingMinimal,
  'wedding-garden':   WeddingGarden,
  'wedding-artdeco':  WeddingArtDeco,
  'challah-soft':     ChallahSoft,
  'challah-boho':     ChallahBoho,
  'bachelorette':     Bachelorette,
  'barmitzvah':       BarMitzvah,
  'corporate':        Corporate,
  'birthday':         Birthday,
};

export function renderTemplate(templateId, data) {
  const C = RENDERERS[templateId];
  return C ? <C data={data} /> : null;
}

export function TemplateThumbnail({ template, selected, onClick }) {
  const C = RENDERERS[template.id];
  const sample = {
    eventType: 'חתונה', coupleNames: 'נוי & ירין',
    subtitle: 'בלב מלא אהבה ובהתרגשות רבה,\nמזמינים אתכם לחגוג עמנו',
    hebrewDate: 'כ"ג בסיוון תשפ"ו', date: '08.06.2026',
    receptionTime: '19:00', ceremonyTime: '20:00',
    venue: 'COYA אומנות האירוח', venueAddress: 'הרוקמים 27, חולון',
    groomsParents: 'שלום ישראלי וישראלה שלום', bridesParents: 'ויוסי ושמרית',
    message: '', dresscode: 'לבוש יום', rsvpDate: '',
  };
  const scale = 0.38;
  return (
    <button className={`template-thumb-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="template-thumb-preview">
        <div style={{ transform:`scale(${scale})`, transformOrigin:'top center', width:W, height:H, pointerEvents:'none', flexShrink:0 }}>
          {C && <C data={sample} />}
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

import { useState, useRef, useCallback, useMemo } from 'react';
import { getGuests } from '../store';
import { Upload, Plus, Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const SHAPES = [
  { id: 'round',   label: 'עגול'    },
  { id: 'oval',    label: 'אליפסה'  },
  { id: 'rect',    label: 'מרובע'   },
  { id: 'banquet', label: 'אבירים'  },
];
const MIN_SEATS = 2;
const MAX_SEATS = 30;
const CANVAS_W  = 1400;
const CANVAS_H  = 900;

// ── Demo metadata ─────────────────────────────────────────────────────────────
const DEMO_SIDE  = {g1:'כלה',g2:'חתן',g3:'כלה',g4:'חתן',g5:'כלה',g6:'חתן',g7:'כלה',g8:'חתן',g9:'כלה',g10:'חתן',g11:'כלה',g12:'חתן'};
const DEMO_GROUP = {g1:'משפחה',g2:'משפחה',g3:'חברים',g4:'עבודה',g5:'משפחה',g6:'חברים',g7:'משפחה',g8:'עבודה',g9:'חברים',g10:'צבא',g11:'משפחה',g12:'אחר'};
const STATUS_COLOR = {coming:'#16A34A',maybe:'#D97706',no:'#EF4444',pending:'#94A3B8'};

// ── SVG tokens ────────────────────────────────────────────────────────────────
const S_FILL   = '#DB2777';
const S_FILL_D = '#9D174D';
const S_EMPTY  = '#F9F5F7';
const S_EMPTY_B= '#E8D5DF';
const T_BORDER = '#E8D5DF';
const T_SEL_B  = '#DB2777';
const T_SEL_F  = '#FDF2F8';
const T_DROP_F = '#EFF6FF';
const T_DROP_B = '#2563EB';

function initials(name) { return name.split(' ').map(w=>w[0]).join('').slice(0,2); }

// ── Shape icon (toolbar preview) ──────────────────────────────────────────────
function ShapeIcon({ type, size = 18 }) {
  const c = 'currentColor';
  switch (type) {
    case 'round':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.5"/>
        <circle cx="9" cy="1.5" r="1.5" fill={c}/>
        <circle cx="9" cy="16.5" r="1.5" fill={c}/>
        <circle cx="1.5" cy="9" r="1.5" fill={c}/>
        <circle cx="16.5" cy="9" r="1.5" fill={c}/>
      </svg>;
    case 'oval':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <ellipse cx="9" cy="9" rx="8" ry="5" stroke={c} strokeWidth="1.5"/>
        <circle cx="9" cy="4" r="1.3" fill={c}/>
        <circle cx="9" cy="14" r="1.3" fill={c}/>
        <circle cx="1" cy="9" r="1.3" fill={c}/>
        <circle cx="17" cy="9" r="1.3" fill={c}/>
      </svg>;
    case 'rect':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke={c} strokeWidth="1.5"/>
        <circle cx="5" cy="1.5" r="1.5" fill={c}/>
        <circle cx="9" cy="1.5" r="1.5" fill={c}/>
        <circle cx="13" cy="1.5" r="1.5" fill={c}/>
        <circle cx="5" cy="16.5" r="1.5" fill={c}/>
        <circle cx="9" cy="16.5" r="1.5" fill={c}/>
        <circle cx="13" cy="16.5" r="1.5" fill={c}/>
      </svg>;
    case 'banquet':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="1" y="7" width="16" height="4" rx="1.5" stroke={c} strokeWidth="1.5"/>
        <circle cx="3" cy="4.5" r="1.5" fill={c}/>
        <circle cx="7" cy="4.5" r="1.5" fill={c}/>
        <circle cx="11" cy="4.5" r="1.5" fill={c}/>
        <circle cx="15" cy="4.5" r="1.5" fill={c}/>
        <circle cx="3" cy="13.5" r="1.5" fill={c}/>
        <circle cx="7" cy="13.5" r="1.5" fill={c}/>
        <circle cx="11" cy="13.5" r="1.5" fill={c}/>
        <circle cx="15" cy="13.5" r="1.5" fill={c}/>
      </svg>;
    default: return null;
  }
}

// ── SVG table components ──────────────────────────────────────────────────────
function RoundTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n   = table.maxSeats;
  const tr  = Math.max(30, 15 + n * 3.8);
  const sr  = 10;
  const sd  = tr + sr + 7;
  const dim = (sd + sr + 4) * 2;
  const cx  = dim/2, cy = dim/2;
  const tF  = isDragOver ? T_DROP_F : isSelected ? T_SEL_F : 'white';
  const tS  = isDragOver ? T_DROP_B : isSelected ? T_SEL_B : T_BORDER;
  const sw  = isSelected || isDragOver ? 2.5 : 1.5;
  return (
    <svg width={dim} height={dim} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <circle cx={cx+1} cy={cy+2} r={tr+1} fill="rgba(0,0,0,0.06)"/>
      <circle cx={cx} cy={cy} r={tr} fill={tF} stroke={tS} strokeWidth={sw}/>
      <circle cx={cx} cy={cy} r={tr*0.65} fill="none" stroke="#F3E8EE" strokeWidth={1} strokeDasharray="3 4"/>
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={Math.max(9,tr*0.27)} fontWeight="700"
        fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">
        {table.name.replace(/^שולחן\s*/,'') || table.name}
      </text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill="#b08090" fontFamily="Inter,sans-serif">
        {seatedGuests.length}/{n}
      </text>
      {Array.from({length:n},(_,i)=>{
        const a = (2*Math.PI*i)/n - Math.PI/2;
        const sx = cx + Math.cos(a)*sd, sy = cy + Math.sin(a)*sd;
        const g = seatedGuests[i];
        return (
          <g key={i}>
            <circle cx={sx} cy={sy} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
            {g ? <text x={sx} y={sy+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
               : <text x={sx} y={sy+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{i+1}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function OvalTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n   = table.maxSeats;
  const rx  = Math.max(56, 20 + n * 5.2);
  const ry  = Math.max(32, 14 + n * 2.6);
  const sr  = 10;
  const pad = sr + 14;
  const svgW = (rx + pad) * 2, svgH = (ry + pad) * 2;
  const cx  = svgW/2, cy = svgH/2;
  const sRx = rx + sr + 8, sRy = ry + sr + 8;
  const tF  = isDragOver ? T_DROP_F : isSelected ? T_SEL_F : 'white';
  const tS  = isDragOver ? T_DROP_B : isSelected ? T_SEL_B : T_BORDER;
  const sw  = isSelected || isDragOver ? 2.5 : 1.5;
  return (
    <svg width={svgW} height={svgH} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <ellipse cx={cx+1} cy={cy+2} rx={rx+1} ry={ry+1} fill="rgba(0,0,0,0.06)"/>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={tF} stroke={tS} strokeWidth={sw}/>
      <ellipse cx={cx} cy={cy} rx={rx*0.68} ry={ry*0.68} fill="none" stroke="#F3E8EE" strokeWidth={1} strokeDasharray="3 4"/>
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={11} fontWeight="700"
        fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">
        {table.name.replace(/^שולחן\s*/,'') || table.name}
      </text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill="#b08090" fontFamily="Inter,sans-serif">
        {seatedGuests.length}/{n}
      </text>
      {Array.from({length:n},(_,i)=>{
        const a = (2*Math.PI*i)/n - Math.PI/2;
        const sx = cx + sRx*Math.cos(a), sy = cy + sRy*Math.sin(a);
        const g = seatedGuests[i];
        return (
          <g key={i}>
            <circle cx={sx} cy={sy} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
            {g ? <text x={sx} y={sy+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
               : <text x={sx} y={sy+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{i+1}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function RectTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n     = table.maxSeats;
  const topN  = Math.ceil(n/2), botN = n - Math.ceil(n/2);
  const sr    = 10, sGap = 27;
  const tableW = Math.max(90, Math.max(topN,botN) * sGap + 20);
  const tableH = 52;
  const pad   = sr + 11;
  const svgW  = tableW + pad*2, svgH = tableH + pad*2;
  const tx = pad, ty = pad;
  const tF  = isDragOver ? T_DROP_F : isSelected ? T_SEL_F : 'white';
  const tS  = isDragOver ? T_DROP_B : isSelected ? T_SEL_B : T_BORDER;
  const sw  = isSelected || isDragOver ? 2.5 : 1.5;
  const seats = [];
  for (let i=0;i<topN;i++) seats.push({x:tx+(tableW/(topN+1))*(i+1), y:ty-sr-4, idx:i});
  for (let i=0;i<botN;i++) seats.push({x:tx+(tableW/(botN+1))*(i+1), y:ty+tableH+sr+4, idx:topN+i});
  return (
    <svg width={svgW} height={svgH} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <rect x={tx+2} y={ty+2} width={tableW} height={tableH} rx={9} fill="rgba(0,0,0,0.07)"/>
      <rect x={tx} y={ty} width={tableW} height={tableH} rx={9} fill={tF} stroke={tS} strokeWidth={sw}/>
      <rect x={tx+5} y={ty+5} width={tableW-10} height={tableH-10} rx={5} fill="none" stroke="#F3E8EE" strokeWidth={1}/>
      <text x={tx+tableW/2} y={ty+tableH/2-3} textAnchor="middle" fontSize={11} fontWeight="700"
        fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">{table.name}</text>
      <text x={tx+tableW/2} y={ty+tableH/2+10} textAnchor="middle" fontSize={9} fill="#b08090" fontFamily="Inter,sans-serif">
        {seatedGuests.length}/{n}
      </text>
      {seats.map(s => {
        const g = seatedGuests[s.idx];
        return (
          <g key={s.idx}>
            <circle cx={s.x} cy={s.y} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
            {g ? <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
               : <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{s.idx+1}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function BanquetTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n     = table.maxSeats;
  const topN  = Math.ceil(n/2), botN = n - topN;
  const sr    = 10, sGap = 30;
  const tableW = Math.max(120, topN * sGap + 16);
  const tableH = 34;
  const pad   = sr + 12;
  const svgW  = tableW + pad*2, svgH = tableH + pad*2;
  const tx = pad, ty = pad;
  const tF  = isDragOver ? T_DROP_F : isSelected ? T_SEL_F : 'white';
  const tS  = isDragOver ? T_DROP_B : isSelected ? T_SEL_B : T_BORDER;
  const sw  = isSelected || isDragOver ? 2.5 : 1.5;
  const seats = [];
  for (let i=0;i<topN;i++) seats.push({x:tx+(tableW/(topN+1))*(i+1), y:ty-sr-5, idx:i});
  for (let i=0;i<botN;i++) seats.push({x:tx+(tableW/(botN+1))*(i+1), y:ty+tableH+sr+5, idx:topN+i});
  return (
    <svg width={svgW} height={svgH} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <rect x={tx+2} y={ty+2} width={tableW} height={tableH} rx={7} fill="rgba(0,0,0,0.07)"/>
      <rect x={tx} y={ty} width={tableW} height={tableH} rx={7} fill={tF} stroke={tS} strokeWidth={sw}/>
      <rect x={tx+5} y={ty+5} width={tableW-10} height={tableH-10} rx={4} fill="none" stroke="#F3E8EE" strokeWidth={1}/>
      <text x={tx+tableW/2} y={ty+tableH/2-2} textAnchor="middle" fontSize={11} fontWeight="700"
        fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">{table.name}</text>
      <text x={tx+tableW/2} y={ty+tableH/2+10} textAnchor="middle" fontSize={8.5} fill="#b08090" fontFamily="Inter,sans-serif">
        {seatedGuests.length}/{n}
      </text>
      {seats.map(s => {
        const g = seatedGuests[s.idx];
        return (
          <g key={s.idx}>
            <circle cx={s.x} cy={s.y} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
            {g ? <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
               : <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{s.idx+1}</text>}
          </g>
        );
      })}
    </svg>
  );
}

const TABLE_SVG = { round: RoundTableSVG, oval: OvalTableSVG, rect: RectTableSVG, banquet: BanquetTableSVG };

// ── CanvasTable wrapper ───────────────────────────────────────────────────────
function CanvasTable({ table, guests, isSelected, isDragging, isDragOver, isHighlighted,
                       onMouseDown, onClick, onDrop, onDragOver, onDragLeave }) {
  const seatedGuests = table.guestIds.map(id => guests.find(g=>g.id===id)).filter(Boolean);
  const Svg = TABLE_SVG[table.shape] || RoundTableSVG;
  return (
    <div
      className={['vc-table', isSelected?'vc-table--sel':'', isDragging?'vc-table--drag':'', isDragOver?'vc-table--drop':'', isHighlighted?'vc-table--highlight':''].join(' ').trim()}
      style={{ left: table.x, top: table.y }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDragOver={e=>{e.preventDefault();onDragOver(table.id);}}
      onDragLeave={onDragLeave}
      onDrop={e=>{e.preventDefault();const gid=e.dataTransfer.getData('guestId');if(gid)onDrop(gid,table.id);}}
    >
      <Svg table={table} seatedGuests={seatedGuests} isSelected={isSelected} isDragOver={isDragOver}/>
    </div>
  );
}

// ── Seat stepper ──────────────────────────────────────────────────────────────
function SeatStepper({ value, onChange, min = MIN_SEATS, max = MAX_SEATS }) {
  return (
    <div className="vc-stepper">
      <button className="vc-stepper-btn" onClick={() => onChange(Math.max(min, value-1))} disabled={value<=min}>−</button>
      <span className="vc-stepper-val">{value}</span>
      <button className="vc-stepper-btn" onClick={() => onChange(Math.min(max, value+1))} disabled={value>=max}>+</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VenueCanvas({ navigate, eventId: propId }) {
  const eid    = propId || 'evt-demo';
  const guests = getGuests(eid).map(g => ({
    ...g, side: DEMO_SIDE[g.id]||'חתן', group: DEMO_GROUP[g.id]||'אחר',
  }));

  const [tables,     setTables]    = useState([]);
  const [seating,    setSeating]   = useState({});
  const [venueImg,   setVenueImg]  = useState(null);
  const [selectedId, setSelected]  = useState(null);
  const [dragOverId, setDragOver]  = useState(null);
  const [dragTable,  setDragTable] = useState(null);
  const [addShape,   setAddShape]  = useState('round');
  const [addSeats,   setAddSeats]  = useState(10);
  const [zoom,       setZoom]      = useState(1);
  const [toast,      setToast]     = useState(null);
  const [searchQuery, setSearch]   = useState('');

  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const selected = tables.find(t => t.id === selectedId) || null;

  const unseated = useMemo(
    () => guests.filter(g => g.status !== 'no' && !seating[g.id]),
    [guests, seating]
  );

  const stats = useMemo(() => ({
    seated: guests.filter(g => seating[g.id]).length,
    total:  guests.filter(g => g.status !== 'no').length,
    tables: tables.length,
    free:   tables.reduce((s,t) => s + (t.maxSeats - t.guestIds.length), 0),
  }), [guests, seating, tables]);

  const showToast = useCallback((msg, type='ok') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Search ──
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const guestHits = guests
      .filter(g => g.name.toLowerCase().includes(q))
      .map(g => {
        const tid  = seating[g.id] || null;
        const tbl  = tid ? tables.find(t => t.id === tid) : null;
        return { kind:'guest', id:g.id, label:g.name, tableId:tid, tableName:tbl?.name || null };
      });
    const tableHits = tables
      .filter(t => t.name.toLowerCase().includes(q))
      .map(t => ({ kind:'table', id:t.id, label:t.name, tableId:t.id,
                   tableName:`${t.guestIds.length}/${t.maxSeats} מוזמנים` }));
    return [...tableHits, ...guestHits];
  }, [searchQuery, guests, seating, tables]);

  const highlightedIds = useMemo(
    () => new Set(searchResults.map(r => r.tableId).filter(Boolean)),
    [searchResults]
  );

  const scrollToTable = useCallback((tableId) => {
    const t = tables.find(x => x.id === tableId);
    if (!t || !wrapRef.current) return;
    const wrap = wrapRef.current;
    wrap.scrollTo({
      left: Math.max(0, t.x * zoom - wrap.clientWidth  / 2 + 80),
      top:  Math.max(0, t.y * zoom - wrap.clientHeight / 2 + 80),
      behavior: 'smooth',
    });
    setSelected(tableId);
    setSearch('');
  }, [tables, zoom]);

  // ── Add table ──
  const addTable = useCallback(() => {
    const n   = tables.length;
    const wrap = wrapRef.current;
    const sx  = wrap ? wrap.scrollLeft/zoom : 0;
    const sy  = wrap ? wrap.scrollTop/zoom  : 0;
    setTables(prev => [...prev, {
      id:       `vt-${Date.now()}`,
      name:     `שולחן ${n+1}`,
      x:        Math.min(CANVAS_W-200, sx + 80 + (n%4)*210),
      y:        Math.min(CANVAS_H-180, sy + 80 + Math.floor(n/4)*230),
      shape:    addShape,
      maxSeats: addSeats,
      guestIds: [],
    }]);
  }, [tables.length, addShape, addSeats, zoom]);

  // ── Update selected table ──
  const updateShape = useCallback((id, shape) =>
    setTables(p => p.map(t => t.id===id ? {...t, shape} : t)), []);

  const updateSeats = useCallback((id, val) =>
    setTables(p => p.map(t => {
      if (t.id !== id) return t;
      const next = Math.max(MIN_SEATS, Math.min(MAX_SEATS, val));
      return {...t, maxSeats: next};
    })), []);

  const updateName = useCallback((id, name) =>
    setTables(p => p.map(t => t.id===id ? {...t, name} : t)), []);

  // ── Delete ──
  const deleteTable = useCallback((id) => {
    const t = tables.find(x => x.id===id);
    setSeating(p => { const n={...p}; (t?.guestIds||[]).forEach(gid=>delete n[gid]); return n; });
    setTables(p => p.filter(x => x.id!==id));
    if (selectedId===id) setSelected(null);
  }, [tables, selectedId]);

  // ── Canvas drag ──
  const onTableMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    const rect = wrapRef.current.getBoundingClientRect();
    const t    = tables.find(x => x.id===id);
    if (!t) return;
    setDragTable({
      id,
      ox: (e.clientX - rect.left)/zoom + wrapRef.current.scrollLeft/zoom - t.x,
      oy: (e.clientY - rect.top) /zoom + wrapRef.current.scrollTop /zoom - t.y,
    });
    setSelected(id);
  }, [tables, zoom]);

  const onCanvasMove = useCallback((e) => {
    if (!dragTable) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX-rect.left)/zoom + wrapRef.current.scrollLeft/zoom - dragTable.ox;
    const y = (e.clientY-rect.top) /zoom + wrapRef.current.scrollTop /zoom - dragTable.oy;
    setTables(p => p.map(t =>
      t.id===dragTable.id
        ? {...t, x:Math.max(0,Math.min(CANVAS_W-160,x)), y:Math.max(0,Math.min(CANVAS_H-160,y))}
        : t
    ));
  }, [dragTable, zoom]);

  const onCanvasUp = useCallback(() => setDragTable(null), []);

  // ── Guest drop ──
  const onGuestDrop = useCallback((gid, tid) => {
    const g = guests.find(x=>x.id===gid), t = tables.find(x=>x.id===tid);
    if (!g||!t||t.guestIds.includes(gid)) return;
    const used = t.guestIds.reduce((s,id)=>{const x=guests.find(y=>y.id===id); return s+Math.max(x?.guests||1,1);},0);
    if (used + Math.max(g.guests||1,1) > t.maxSeats) { showToast(`${t.name} מלא`,'err'); return; }
    setSeating(p => ({...p, [gid]:tid}));
    setTables(p => p.map(x => x.id===tid ? {...x, guestIds:[...x.guestIds, gid]} : x));
    setDragOver(null);
  }, [guests, tables, showToast]);

  const unassign = useCallback((gid, tid) => {
    setSeating(p => {const n={...p}; delete n[gid]; return n;});
    setTables(p => p.map(t => t.id===tid ? {...t, guestIds:t.guestIds.filter(id=>id!==gid)} : t));
  }, []);

  // ── Auto seat ──
  const autoSeat = useCallback(() => {
    if (!tables.length) { showToast('הוסיפו שולחנות תחילה'); return; }
    const eligible = guests.filter(g => g.status==='coming' && !seating[g.id]);
    if (!eligible.length) { showToast('אין מוזמנים לשיבוץ'); return; }
    let tArr = tables.map(t=>({...t}));
    const ns = {...seating};
    let placed = 0, ti = 0;
    eligible.forEach(g => {
      const pax = Math.max(g.guests||1,1);
      while (ti < tArr.length) {
        const t = tArr[ti];
        const used = t.guestIds.reduce((s,id)=>{const x=guests.find(y=>y.id===id); return s+Math.max(x?.guests||1,1);},0);
        if (used+pax <= t.maxSeats) {
          tArr[ti] = {...t, guestIds:[...t.guestIds, g.id]};
          ns[g.id] = t.id; placed++; break;
        }
        ti++;
      }
    });
    setTables(tArr); setSeating(ns);
    showToast(`שובצו ${placed} אורחים`);
  }, [guests, tables, seating, showToast]);

  // ── Upload / zoom ──
  const onUpload = e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = ev => setVenueImg(ev.target.result); r.readAsDataURL(f);
    e.target.value = '';
  };

  const clearAll = () => {
    if (!window.confirm('לנקות את כל האולם?')) return;
    setTables([]); setSeating({}); setSelected(null); setVenueImg(null);
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="vc-page" dir="rtl">
      {toast && <div className={`vc-toast vc-toast--${toast.type}`}>{toast.msg}</div>}

      {/* ── Toolbar ── */}
      <div className="vc-toolbar">
        <div className="vc-tb-left">
          <button className="vc-back-btn" onClick={() => navigate({page:'seating-plan',eventId:eid})}>← הושבת מוזמנים</button>
          <span className="vc-title">תוכנית אולם</span>
        </div>

        <div className="vc-tb-center">
          {/* Shape picker */}
          <div className="vc-tb-group">
            <span className="vc-tb-lbl">צורת שולחן</span>
            <div className="vc-shape-picker">
              {SHAPES.map(s => (
                <button
                  key={s.id}
                  className={`vc-shape-opt${addShape===s.id?' active':''}`}
                  onClick={() => setAddShape(s.id)}
                  title={s.label}
                >
                  <ShapeIcon type={s.id} size={16}/>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seat stepper */}
          <div className="vc-tb-group">
            <span className="vc-tb-lbl">מושבים</span>
            <SeatStepper value={addSeats} onChange={setAddSeats}/>
          </div>

          <button className="vc-add-btn" onClick={addTable}>
            <Plus size={14}/> הוסף שולחן
          </button>
        </div>

        <div className="vc-tb-right">
          <button className="vc-btn-ghost" onClick={() => fileRef.current?.click()} title="סקיצת אולם">
            <Upload size={13}/> סקיצה
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onUpload}/>
          {tables.length > 0 && (
            <button className="vc-btn-auto" onClick={autoSeat}>שיבוץ חכם</button>
          )}
          {tables.length > 0 && (
            <button className="vc-btn-ghost vc-btn-ghost--danger" onClick={clearAll} title="נקה הכל">
              <RotateCcw size={13}/>
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="vc-stats-bar">
        {[
          {val:stats.seated,  lbl:'שובצו'},
          {val:stats.total,   lbl:'סה״כ'},
          {val:stats.tables,  lbl:'שולחנות'},
          {val:stats.free,    lbl:'מקומות פנויים'},
        ].map(s => (
          <div key={s.lbl} className="vc-stat-item">
            <span className="vc-stat-val">{s.val}</span>
            <span className="vc-stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <div className="vc-main">

        {/* Canvas */}
        <div className="vc-canvas-area">
          {/* Zoom controls */}
          <div className="vc-zoom-bar">
            <button className="vc-zoom-btn" onClick={() => setZoom(z=>Math.max(0.4,parseFloat((z-0.15).toFixed(2))))} disabled={zoom<=0.4}>
              <ZoomOut size={13}/>
            </button>
            <span className="vc-zoom-pct" onClick={() => setZoom(1)} title="איפוס">{Math.round(zoom*100)}%</span>
            <button className="vc-zoom-btn" onClick={() => setZoom(z=>Math.min(2,parseFloat((z+0.15).toFixed(2))))} disabled={zoom>=2}>
              <ZoomIn size={13}/>
            </button>
          </div>

          <div
            ref={wrapRef}
            className="vc-canvas-scroll"
            onMouseMove={onCanvasMove}
            onMouseUp={onCanvasUp}
            onMouseLeave={onCanvasUp}
            onClick={() => setSelected(null)}
          >
            <div
              className="vc-canvas"
              style={{width:CANVAS_W, height:CANVAS_H, transform:`scale(${zoom})`, transformOrigin:'0 0'}}
            >
              {venueImg && <img src={venueImg} className="vc-venue-img" alt=""/>}

              {tables.length === 0 && (
                <div className="vc-canvas-empty">
                  <div className="vc-canvas-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="12" r="9"/>
                      <circle cx="12" cy="12" r="3.5"/>
                      <line x1="12" y1="3" x2="12" y2="8.5"/>
                      <line x1="12" y1="15.5" x2="12" y2="21"/>
                      <line x1="3" y1="12" x2="8.5" y2="12"/>
                      <line x1="15.5" y1="12" x2="21" y2="12"/>
                    </svg>
                  </div>
                  <p className="vc-canvas-empty-title">עצבו את תוכנית האולם</p>
                  <p className="vc-canvas-empty-sub">בחרו צורה ומספר מושבים, לחצו "הוסף שולחן" — ואז גררו לסידור הרצוי</p>
                </div>
              )}

              {tables.map(t => (
                <CanvasTable
                  key={t.id}
                  table={t}
                  guests={guests}
                  isSelected={selectedId===t.id}
                  isDragging={dragTable?.id===t.id}
                  isDragOver={dragOverId===t.id}
                  isHighlighted={highlightedIds.has(t.id)}
                  onMouseDown={e => onTableMouseDown(e, t.id)}
                  onClick={e => {e.stopPropagation(); setSelected(t.id);}}
                  onDrop={onGuestDrop}
                  onDragOver={id => setDragOver(id)}
                  onDragLeave={() => setDragOver(null)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="vc-sidebar">

          {/* Inspector — shown when table is selected */}
          {selected ? (
            <div className="vc-inspector">
              <div className="vc-inspector-head">
                <input
                  className="vc-inspector-name"
                  value={selected.name}
                  onChange={e => updateName(selected.id, e.target.value)}
                />
                <button className="vc-inspector-del" onClick={() => deleteTable(selected.id)} title="מחק שולחן">
                  <Trash2 size={13}/>
                </button>
              </div>

              <div className="vc-inspector-row">
                <span className="vc-inspector-lbl">צורה</span>
                <div className="vc-shape-picker vc-shape-picker--sm">
                  {SHAPES.map(s => (
                    <button
                      key={s.id}
                      className={`vc-shape-opt${selected.shape===s.id?' active':''}`}
                      onClick={() => updateShape(selected.id, s.id)}
                      title={s.label}
                    >
                      <ShapeIcon type={s.id} size={14}/>
                    </button>
                  ))}
                </div>
              </div>

              <div className="vc-inspector-row">
                <span className="vc-inspector-lbl">מושבים</span>
                <SeatStepper
                  value={selected.maxSeats}
                  onChange={v => updateSeats(selected.id, v)}
                />
              </div>

              <div className="vc-inspector-divider"/>

              <div className="vc-inspector-guests">
                <span className="vc-inspector-lbl">
                  מוזמנים — {selected.guestIds.length}/{selected.maxSeats}
                </span>
                <div className="vc-assigned-list">
                  {selected.guestIds.map(id => guests.find(g=>g.id===id)).filter(Boolean).map(g => (
                    <div key={g.id} className="vc-assigned-row">
                      <span style={{color: STATUS_COLOR[g.status]||'#94A3B8', fontSize:8}}>●</span>
                      <span className="vc-assigned-name">{g.name}</span>
                      {(g.guests||1)>1 && <span className="vc-assigned-pax">×{g.guests}</span>}
                      <button className="vc-unassign-btn" onClick={() => unassign(g.id, selected.id)}>×</button>
                    </div>
                  ))}
                  {selected.guestIds.length === 0 && (
                    <div className="vc-assigned-empty">גרור אורחים לשולחן זה</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="vc-no-selection">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>לחצו על שולחן לעריכה</span>
            </div>
          )}

          {/* Search bar */}
          <div className="vc-search-bar">
            <div className="vc-search-input-wrap">
              <svg className="vc-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="vc-search-input"
                type="text"
                placeholder="חיפוש אורח או שולחן..."
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
                dir="rtl"
              />
              {searchQuery && (
                <button className="vc-search-clear" onClick={() => setSearch('')}>×</button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="vc-search-results">
                {searchResults.map(r => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    className="vc-search-result"
                    onClick={() => r.tableId ? scrollToTable(r.tableId) : setSearch('')}
                  >
                    <span className={`vc-search-result-kind vc-search-kind--${r.kind}`}>
                      {r.kind === 'table' ? 'שולחן' : 'אורח'}
                    </span>
                    <span className="vc-search-result-label">{r.label}</span>
                    {r.tableName && (
                      <span className="vc-search-result-meta">{r.tableName}</span>
                    )}
                    {r.kind === 'guest' && !r.tableId && (
                      <span className="vc-search-result-unseated">לא שובץ</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="vc-search-empty">לא נמצאו תוצאות</div>
            )}
          </div>

          {/* Unseated guests */}
          <div className="vc-guest-panel">
            <div className="vc-guest-panel-head">
              <span>ממתינים לשיבוץ</span>
              <span className="vc-guest-badge">{unseated.length}</span>
            </div>
            <div className="vc-guest-list">
              {unseated.length === 0 ? (
                <div className="vc-guest-all-done">כל האורחים שובצו</div>
              ) : (
                unseated.map(g => (
                  <div
                    key={g.id}
                    className="vc-guest-chip"
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('guestId', g.id);
                    }}
                  >
                    <span style={{color: STATUS_COLOR[g.status]||'#94A3B8', fontSize:8, flexShrink:0}}>●</span>
                    <span className="vc-chip-name">{g.name}</span>
                    {(g.guests||1)>1 && <span className="vc-chip-pax">×{g.guests}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useMemo } from 'react';
import { getGuests } from '../store';
import { Upload, Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

// ── Demo metadata (same as SeatingPlan) ────────────────────────────────────
const DEMO_SIDE  = { g1:'כלה',g2:'חתן',g3:'כלה',g4:'חתן',g5:'כלה',g6:'חתן',g7:'כלה',g8:'חתן',g9:'כלה',g10:'חתן',g11:'כלה',g12:'חתן' };
const DEMO_GROUP = { g1:'משפחה',g2:'משפחה',g3:'חברים',g4:'עבודה',g5:'מוזמני הורים',g6:'חברים',g7:'משפחה',g8:'עבודה',g9:'חברים',g10:'צבא',g11:'משפחה',g12:'אחר' };

const STATUS_DOT = { coming:'#22c55e', maybe:'#f59e0b', no:'#ef4444', pending:'#94a3b8' };
const STATUS_LBL = { coming:'מגיע',    maybe:'אולי',    no:'לא מגיע', pending:'טרם אישר' };
const GRP_EMOJI  = { 'משפחה':'👨‍👩‍👧','חברים':'👥','עבודה':'💼','צבא':'🎖️','מוזמני הורים':'👴','אחר':'✨' };

const SEAT_OPTIONS = [6, 8, 10, 12, 14];
const CANVAS_W = 1400;
const CANVAS_H = 900;

// ── SVG helpers ─────────────────────────────────────────────────────────────
const GOLD      = 'oklch(0.72 0.09 85)';
const GOLD_DARK = 'oklch(0.58 0.12 78)';
const GOLD_LITE = 'oklch(0.93 0.04 85)';
const SEAT_FILL_EMPTY = 'oklch(0.95 0.01 90)';
const SEAT_STROKE_EMPTY = 'oklch(0.82 0.04 85)';
const TABLE_STROKE = 'oklch(0.82 0.05 82)';
const TABLE_STROKE_SEL = 'oklch(0.62 0.12 78)';
const TABLE_FILL_SEL = 'oklch(0.97 0.03 88)';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2);
}

// ── Round table SVG ──────────────────────────────────────────────────────────
function RoundTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n   = table.maxSeats;
  const tr  = Math.max(30, 14 + n * 4);   // table radius
  const sr  = 10;                           // seat radius
  const sd  = tr + sr + 6;                 // seat centre distance
  const dim = (sd + sr + 3) * 2;           // svg bounding size
  const cx  = dim / 2, cy = dim / 2;

  const ring = isDragOver ? '#60a5fa' : isSelected ? TABLE_STROKE_SEL : TABLE_STROKE;
  const fill = isDragOver ? 'oklch(0.94 0.04 240)' : isSelected ? TABLE_FILL_SEL : 'white';
  const sw   = isSelected || isDragOver ? 2.5 : 1.5;

  return (
    <svg width={dim} height={dim} style={{ display:'block', overflow:'visible', pointerEvents:'none' }}>
      {/* Drop shadow */}
      <circle cx={cx+1} cy={cy+2} r={tr+1} fill="rgba(0,0,0,0.07)" />
      {/* Table top */}
      <circle cx={cx} cy={cy} r={tr} fill={fill} stroke={ring} strokeWidth={sw} />
      {/* Inner decorative ring */}
      <circle cx={cx} cy={cy} r={tr*0.68} fill="none" stroke="oklch(0.91 0.03 85)" strokeWidth={1} strokeDasharray="2.5 3.5" />
      {/* Name */}
      <text x={cx} y={cy-5} textAnchor="middle" fontSize={Math.max(9, tr*0.3)} fontWeight="800"
        fill="oklch(0.22 0.02 260)" fontFamily="Heebo,Assistant,sans-serif" letterSpacing="-0.5">
        {table.name.replace('שולחן ','').replace('שולחן','').trim() || table.name}
      </text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={9}
        fill="oklch(0.58 0.03 260)" fontFamily="Heebo,sans-serif">
        {seatedGuests.length}/{n}
      </text>

      {/* Seats */}
      {Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const sx = cx + Math.cos(angle) * sd;
        const sy = cy + Math.sin(angle) * sd;
        const g  = seatedGuests[i];
        return (
          <g key={i}>
            <circle cx={sx} cy={sy} r={sr}
              fill={g ? GOLD : SEAT_FILL_EMPTY}
              stroke={g ? GOLD_DARK : SEAT_STROKE_EMPTY}
              strokeWidth={1.5}
            />
            {g
              ? <text x={sx} y={sy+3.5} textAnchor="middle" fontSize={7} fill="white"
                  fontWeight="800" fontFamily="Heebo,sans-serif">{initials(g.name)}</text>
              : <text x={sx} y={sy+3.5} textAnchor="middle" fontSize={8}
                  fill="oklch(0.72 0.03 260)" fontFamily="sans-serif">{i+1}</text>
            }
          </g>
        );
      })}
    </svg>
  );
}

// ── Rectangular table SVG ────────────────────────────────────────────────────
function RectTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n        = table.maxSeats;
  const topN     = Math.ceil(n / 2);
  const botN     = Math.floor(n / 2);
  const sr       = 10;
  const seatGap  = 26;
  const tableW   = Math.max(90, Math.max(topN, botN) * seatGap + 20);
  const tableH   = 54;
  const pad      = sr + 10;
  const svgW     = tableW + pad * 2;
  const svgH     = tableH + pad * 2;
  const tx       = pad, ty = pad;

  const ring = isDragOver ? '#60a5fa' : isSelected ? TABLE_STROKE_SEL : TABLE_STROKE;
  const fill = isDragOver ? 'oklch(0.94 0.04 240)' : isSelected ? TABLE_FILL_SEL : 'white';
  const sw   = isSelected || isDragOver ? 2.5 : 1.5;

  // Compute seat positions
  const seats = [];
  for (let i = 0; i < topN; i++)
    seats.push({ x: tx + (tableW / (topN + 1)) * (i + 1), y: ty - sr - 4, idx: i });
  for (let i = 0; i < botN; i++)
    seats.push({ x: tx + (tableW / (botN + 1)) * (i + 1), y: ty + tableH + sr + 4, idx: topN + i });

  return (
    <svg width={svgW} height={svgH} style={{ display:'block', overflow:'visible', pointerEvents:'none' }}>
      {/* Shadow */}
      <rect x={tx+2} y={ty+2} width={tableW} height={tableH} rx={9} fill="rgba(0,0,0,0.08)" />
      {/* Table top */}
      <rect x={tx} y={ty} width={tableW} height={tableH} rx={9}
        fill={fill} stroke={ring} strokeWidth={sw} />
      {/* Inner line */}
      <rect x={tx+6} y={ty+6} width={tableW-12} height={tableH-12} rx={5}
        fill="none" stroke="oklch(0.91 0.03 85)" strokeWidth={1} />
      {/* Label */}
      <text x={tx+tableW/2} y={ty+tableH/2-4} textAnchor="middle" fontSize={11}
        fontWeight="800" fill="oklch(0.22 0.02 260)" fontFamily="Heebo,Assistant,sans-serif">
        {table.name}
      </text>
      <text x={tx+tableW/2} y={ty+tableH/2+10} textAnchor="middle" fontSize={9}
        fill="oklch(0.58 0.03 260)" fontFamily="Heebo,sans-serif">
        {seatedGuests.length}/{n}
      </text>
      {/* Seats */}
      {seats.map(s => {
        const g = seatedGuests[s.idx];
        return (
          <g key={s.idx}>
            <circle cx={s.x} cy={s.y} r={sr}
              fill={g ? GOLD : SEAT_FILL_EMPTY}
              stroke={g ? GOLD_DARK : SEAT_STROKE_EMPTY}
              strokeWidth={1.5}
            />
            {g
              ? <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={7} fill="white"
                  fontWeight="800" fontFamily="Heebo,sans-serif">{initials(g.name)}</text>
              : <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={8}
                  fill="oklch(0.72 0.03 260)">{s.idx+1}</text>
            }
          </g>
        );
      })}
    </svg>
  );
}

// ── Canvas table wrapper (draggable) ─────────────────────────────────────────
function CanvasTable({ table, guests, seating, isSelected, isDragging, isDragOver,
                       onMouseDown, onClick, onDrop, onDragOver, onDragLeave }) {
  const seatedGuests = table.guestIds
    .map(id => guests.find(g => g.id === id)).filter(Boolean);

  const Svg = table.shape === 'round' ? RoundTableSVG : RectTableSVG;

  return (
    <div
      className={[
        'vc-table',
        isSelected  ? 'vc-table--sel'  : '',
        isDragging  ? 'vc-table--drag' : '',
        isDragOver  ? 'vc-table--drop' : '',
      ].join(' ').trim()}
      style={{ left: table.x, top: table.y }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDragOver={e => { e.preventDefault(); onDragOver(table.id); }}
      onDragLeave={onDragLeave}
      onDrop={e => {
        e.preventDefault();
        const gid = e.dataTransfer.getData('guestId');
        if (gid) onDrop(gid, table.id);
      }}
    >
      <Svg
        table={table}
        seatedGuests={seatedGuests}
        isSelected={isSelected}
        isDragOver={isDragOver}
      />
    </div>
  );
}

// ── Guest chip ───────────────────────────────────────────────────────────────
function GuestChip({ guest, onDragStart }) {
  return (
    <div
      className="vc-guest-chip"
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('guestId', guest.id);
        onDragStart && onDragStart(guest.id);
      }}
    >
      <span className="vc-chip-dot" style={{ color: STATUS_DOT[guest.status] || '#94a3b8' }}>●</span>
      <span className="vc-chip-name">{guest.name}</span>
      <span className="vc-chip-meta">
        {GRP_EMOJI[guest.group] || '✨'}
        {(guest.guests || 1) > 1 && <span className="vc-chip-pax">×{guest.guests}</span>}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function VenueCanvas({ navigate, eventId: propId }) {
  const eid       = propId || 'evt-demo';
  const rawGuests = getGuests(eid);
  const guests    = rawGuests.map(g => ({
    ...g,
    side:  DEMO_SIDE[g.id]  || 'חתן',
    group: DEMO_GROUP[g.id] || 'אחר',
  }));

  // ── State ──
  const [venueTables, setVenueTables] = useState([]);
  const [seating, setSeating]         = useState({}); // guestId → tableId
  const [venueImg, setVenueImg]       = useState(null);
  const [selectedId, setSelectedId]   = useState(null);
  const [dragOverId, setDragOverId]   = useState(null);
  const [addShape, setAddShape]       = useState('round');
  const [addSeats, setAddSeats]       = useState(10);
  const [dragTable, setDragTable]     = useState(null);
  const [zoom, setZoom]               = useState(1);
  const [toast, setToast]             = useState(null);

  const canvasWrapRef = useRef(null);
  const fileRef       = useRef(null);

  const selectedTable = venueTables.find(t => t.id === selectedId) || null;
  const unseated = useMemo(
    () => guests.filter(g => g.status !== 'no' && !seating[g.id]),
    [guests, seating]
  );

  // ── Toast ──
  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Add table ──
  const addTable = useCallback(() => {
    const wrap = canvasWrapRef.current;
    const scrollX = wrap ? wrap.scrollLeft : 0;
    const scrollY = wrap ? wrap.scrollTop  : 0;
    const viewW   = wrap ? wrap.offsetWidth  : 600;
    const viewH   = wrap ? wrap.offsetHeight : 400;
    const n       = venueTables.length;

    // Place in grid, offset to visible area
    const col  = n % 4;
    const row  = Math.floor(n / 4);
    const base = { x: scrollX / zoom + 80 + col * 200,
                   y: scrollY / zoom + 80 + row * 220 };

    setVenueTables(prev => [...prev, {
      id:       `vt-${Date.now()}`,
      name:     `שולחן ${n + 1}`,
      x:        Math.min(CANVAS_W - 160, base.x),
      y:        Math.min(CANVAS_H - 160, base.y),
      shape:    addShape,
      maxSeats: addSeats,
      type:     'מעורב',
      guestIds: [],
    }]);
  }, [venueTables.length, addShape, addSeats, zoom]);

  // ── Delete selected ──
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const t = venueTables.find(x => x.id === selectedId);
    setSeating(prev => {
      const n = { ...prev };
      (t?.guestIds || []).forEach(id => delete n[id]);
      return n;
    });
    setVenueTables(prev => prev.filter(x => x.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, venueTables]);

  // ── Clear all ──
  const clearAll = () => {
    if (!window.confirm('לנקות את כל השולחנות?')) return;
    setVenueTables([]);
    setSeating({});
    setSelectedId(null);
    setVenueImg(null);
  };

  // ── Table drag ──
  const handleTableMouseDown = useCallback((e, tableId) => {
    e.stopPropagation();
    const wrap  = canvasWrapRef.current.getBoundingClientRect();
    const table = venueTables.find(t => t.id === tableId);
    if (!table) return;
    setDragTable({
      id:      tableId,
      offsetX: (e.clientX - wrap.left) / zoom + canvasWrapRef.current.scrollLeft / zoom - table.x,
      offsetY: (e.clientY - wrap.top)  / zoom + canvasWrapRef.current.scrollTop  / zoom - table.y,
    });
    setSelectedId(tableId);
  }, [venueTables, zoom]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!dragTable) return;
    const wrap = canvasWrapRef.current.getBoundingClientRect();
    const x = (e.clientX - wrap.left) / zoom
              + canvasWrapRef.current.scrollLeft / zoom - dragTable.offsetX;
    const y = (e.clientY - wrap.top) / zoom
              + canvasWrapRef.current.scrollTop  / zoom - dragTable.offsetY;
    setVenueTables(prev => prev.map(t =>
      t.id === dragTable.id
        ? { ...t, x: Math.max(0, Math.min(CANVAS_W - 140, x)),
                  y: Math.max(0, Math.min(CANVAS_H - 140, y)) }
        : t
    ));
  }, [dragTable, zoom]);

  const handleCanvasMouseUp = useCallback(() => setDragTable(null), []);

  // ── Guest drop onto table ──
  const handleGuestDrop = useCallback((guestId, tableId) => {
    const g = guests.find(x => x.id === guestId);
    const t = venueTables.find(x => x.id === tableId);
    if (!g || !t) return;
    if (t.guestIds.includes(guestId)) return;
    const usedPax = t.guestIds.reduce((s, id) => {
      const x = guests.find(y => y.id === id);
      return s + Math.max(x?.guests || 1, 1);
    }, 0);
    if (usedPax + Math.max(g.guests || 1, 1) > t.maxSeats) {
      showToast(`${t.name} מלא!`, 'err');
      return;
    }
    setSeating(prev => ({ ...prev, [guestId]: tableId }));
    setVenueTables(prev => prev.map(x =>
      x.id === tableId ? { ...x, guestIds: [...x.guestIds, guestId] } : x
    ));
    setDragOverId(null);
  }, [guests, venueTables, showToast]);

  // ── Unassign guest ──
  const unassignGuest = useCallback((guestId, tableId) => {
    setSeating(prev => { const n = { ...prev }; delete n[guestId]; return n; });
    setVenueTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, guestIds: t.guestIds.filter(id => id !== guestId) } : t
    ));
  }, []);

  // ── Auto-seat ──
  const autoSeat = useCallback(() => {
    if (venueTables.length === 0) { showToast('הוסיפו שולחנות תחילה'); return; }
    const eligible = guests.filter(g => g.status === 'coming' && !seating[g.id]);
    if (eligible.length === 0) { showToast('אין מוזמנים לשיבוץ'); return; }

    let tables = venueTables.map(t => ({ ...t }));
    const newSeating = { ...seating };
    let placed = 0;

    // Group by side+group, families first
    const buckets = {};
    eligible.forEach(g => {
      const k = `${g.side}||${g.group}`;
      (buckets[k] = buckets[k] || []).push(g);
    });
    const ordered = Object.values(buckets).sort((a, b) => {
      const rank = g => (g[0].group === 'משפחה' ? 0 : 1);
      return rank(a) - rank(b);
    });

    let ti = 0;
    ordered.flat().forEach(g => {
      const pax = Math.max(g.guests || 1, 1);
      while (ti < tables.length) {
        const t = tables[ti];
        const usedPax = t.guestIds.reduce((s, id) => {
          const x = guests.find(y => y.id === id);
          return s + Math.max(x?.guests || 1, 1);
        }, 0);
        if (usedPax + pax <= t.maxSeats) {
          tables[ti] = { ...t, guestIds: [...t.guestIds, g.id] };
          newSeating[g.id] = t.id;
          placed++;
          break;
        }
        ti++;
      }
    });

    setVenueTables(tables);
    setSeating(newSeating);
    showToast(`✨ שובצו ${placed} מוזמנים`);
  }, [guests, venueTables, seating, showToast]);

  // ── Image upload ──
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setVenueImg(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Zoom ──
  const zoomIn  = () => setZoom(z => Math.min(2,   parseFloat((z + 0.15).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(0.4, parseFloat((z - 0.15).toFixed(2))));
  const zoomReset = () => setZoom(1);

  // ── Stats ──
  const stats = useMemo(() => ({
    seated:  guests.filter(g => seating[g.id]).length,
    total:   guests.filter(g => g.status !== 'no').length,
    tables:  venueTables.length,
    empty:   venueTables.reduce((s, t) => s + (t.maxSeats - t.guestIds.length), 0),
  }), [guests, seating, venueTables]);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="vc-page" dir="rtl">
      {/* Aurora */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-layer" /><div className="aurora-layer-2" />
      </div>

      {/* Toast */}
      {toast && <div className={`vc-toast vc-toast--${toast.type}`}>{toast.msg}</div>}

      {/* ── Toolbar ── */}
      <div className="vc-toolbar">
        <div className="vc-tb-left">
          <button className="vc-back-btn" onClick={() => navigate({ page: 'dashboard' })}>← חזרה</button>
          <h1 className="vc-title">תוכנית אולם</h1>
        </div>

        <div className="vc-tb-center">
          {/* Shape */}
          <div className="vc-tb-group">
            <span className="vc-tb-label">צורה</span>
            <div className="vc-shape-btns">
              <button
                className={`vc-shape-btn${addShape === 'round' ? ' active' : ''}`}
                onClick={() => setAddShape('round')}
                title="עגול"
              ><span className="vc-icon-round" /></button>
              <button
                className={`vc-shape-btn${addShape === 'rect' ? ' active' : ''}`}
                onClick={() => setAddShape('rect')}
                title="מלבן"
              ><span className="vc-icon-rect" /></button>
            </div>
          </div>

          {/* Seats */}
          <div className="vc-tb-group">
            <span className="vc-tb-label">מקומות</span>
            <div className="vc-seat-btns">
              {SEAT_OPTIONS.map(n => (
                <button
                  key={n}
                  className={`vc-seat-btn${addSeats === n ? ' active' : ''}`}
                  onClick={() => setAddSeats(n)}
                >{n}</button>
              ))}
            </div>
          </div>

          <button className="vc-btn-add" onClick={addTable}>
            <Plus size={15} /> הוסף שולחן
          </button>
        </div>

        <div className="vc-tb-right">
          <button className="vc-btn-upload" onClick={() => fileRef.current?.click()} title="העלה סקיצת אולם">
            <Upload size={14} /> סקיצת אולם
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
          {venueTables.length > 0 && (
            <button className="vc-btn-auto" onClick={autoSeat}>✨ שיבוץ חכם</button>
          )}
          {selectedId && (
            <button className="vc-btn-del" onClick={deleteSelected} title="מחק שולחן נבחר">
              <Trash2 size={14} />
            </button>
          )}
          {venueTables.length > 0 && (
            <button className="vc-btn-clear" onClick={clearAll} title="נקה הכל">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="vc-main">

        {/* ── Canvas area ── */}
        <div className="vc-canvas-outer">
          {/* Zoom controls */}
          <div className="vc-zoom-bar">
            <button className="vc-zoom-btn" onClick={zoomOut} disabled={zoom <= 0.4}><ZoomOut size={14}/></button>
            <span className="vc-zoom-pct" onClick={zoomReset}>{Math.round(zoom * 100)}%</span>
            <button className="vc-zoom-btn" onClick={zoomIn}  disabled={zoom >= 2}><ZoomIn size={14}/></button>
          </div>

          <div
            className="vc-canvas-wrap"
            ref={canvasWrapRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={() => setSelectedId(null)}
          >
            <div
              className="vc-canvas"
              style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${zoom})`, transformOrigin: '0 0' }}
            >
              {/* Venue image background */}
              {venueImg && (
                <img src={venueImg} className="vc-venue-img" alt="venue sketch" />
              )}

              {/* Empty state */}
              {venueTables.length === 0 && (
                <div className="vc-canvas-hint">
                  <div className="vc-canvas-hint-icon">🏛️</div>
                  <div className="vc-canvas-hint-title">בנו את תוכנית האולם שלכם</div>
                  <div className="vc-canvas-hint-sub">
                    בחרו צורת שולחן ומספר מקומות → לחצו <strong>הוסף שולחן</strong><br />
                    גררו שולחנות לסידור הרצוי, ואז גררו מוזמנים לשולחן
                  </div>
                </div>
              )}

              {/* Tables */}
              {venueTables.map(t => (
                <CanvasTable
                  key={t.id}
                  table={t}
                  guests={guests}
                  seating={seating}
                  isSelected={selectedId === t.id}
                  isDragging={dragTable?.id === t.id}
                  isDragOver={dragOverId === t.id}
                  onMouseDown={e => handleTableMouseDown(e, t.id)}
                  onClick={e => { e.stopPropagation(); setSelectedId(t.id); }}
                  onDrop={handleGuestDrop}
                  onDragOver={id => setDragOverId(id)}
                  onDragLeave={() => setDragOverId(null)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="vc-sidebar">
          {/* Stats strip */}
          <div className="vc-stats-strip">
            <div className="vc-stat"><span className="vc-stat-val">{stats.seated}</span><span className="vc-stat-lbl">שובצו</span></div>
            <div className="vc-stat"><span className="vc-stat-val">{stats.total}</span><span className="vc-stat-lbl">סה״כ</span></div>
            <div className="vc-stat"><span className="vc-stat-val">{stats.tables}</span><span className="vc-stat-lbl">שולחנות</span></div>
            <div className="vc-stat"><span className="vc-stat-val">{stats.empty}</span><span className="vc-stat-lbl">מקומות פנויים</span></div>
          </div>

          {/* Selected table panel */}
          {selectedTable ? (
            <div className="vc-panel-section">
              <div className="vc-panel-head">
                <span className="vc-panel-name">{selectedTable.name}</span>
                <span className="vc-panel-cap">
                  {selectedTable.guestIds.length}/{selectedTable.maxSeats}
                </span>
              </div>
              <div className="vc-assigned">
                {selectedTable.guestIds
                  .map(id => guests.find(g => g.id === id)).filter(Boolean)
                  .map(g => (
                    <div key={g.id} className="vc-assigned-row">
                      <span style={{ color: STATUS_DOT[g.status] }}>●</span>
                      <span className="vc-assigned-name">{g.name}</span>
                      {(g.guests || 1) > 1 && <span className="vc-assigned-pax">×{g.guests}</span>}
                      <button
                        className="vc-unassign"
                        onClick={() => unassignGuest(g.id, selectedTable.id)}
                        title="הסר"
                      >×</button>
                    </div>
                  ))
                }
                {selectedTable.guestIds.length === 0 && (
                  <div className="vc-drop-hint">גרור מוזמן לכאן ✦</div>
                )}
              </div>
              <div className="vc-divider" />
            </div>
          ) : (
            <div className="vc-no-selection">
              <span>לחצו על שולחן לבחירה</span>
            </div>
          )}

          {/* Unseated guest list */}
          <div className="vc-panel-section vc-panel-section--grow">
            <div className="vc-panel-head">
              <span className="vc-panel-name">מוזמנים שטרם שובצו</span>
              <span className="vc-badge">{unseated.length}</span>
            </div>
            <div className="vc-guest-list">
              {unseated.length === 0
                ? <div className="vc-all-seated">🎉 כולם שובצו!</div>
                : unseated.map(g => (
                    <GuestChip key={g.id} guest={g} />
                  ))
              }
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

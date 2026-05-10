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
const DJ_W = 130, DJ_H = 80;
const DF_W = 240, DF_H = 170;
const BAR_W = 180, BAR_H = 95;

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

// ── Shape icon ────────────────────────────────────────────────────────────────
function ShapeIcon({ type, size = 18 }) {
  const c = 'currentColor';
  switch (type) {
    case 'round':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.5"/>
        <circle cx="9" cy="1.5" r="1.5" fill={c}/><circle cx="9" cy="16.5" r="1.5" fill={c}/>
        <circle cx="1.5" cy="9" r="1.5" fill={c}/><circle cx="16.5" cy="9" r="1.5" fill={c}/>
      </svg>;
    case 'oval':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <ellipse cx="9" cy="9" rx="8" ry="5" stroke={c} strokeWidth="1.5"/>
        <circle cx="9" cy="4" r="1.3" fill={c}/><circle cx="9" cy="14" r="1.3" fill={c}/>
        <circle cx="1" cy="9" r="1.3" fill={c}/><circle cx="17" cy="9" r="1.3" fill={c}/>
      </svg>;
    case 'rect':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke={c} strokeWidth="1.5"/>
        <circle cx="5" cy="1.5" r="1.5" fill={c}/><circle cx="9" cy="1.5" r="1.5" fill={c}/><circle cx="13" cy="1.5" r="1.5" fill={c}/>
        <circle cx="5" cy="16.5" r="1.5" fill={c}/><circle cx="9" cy="16.5" r="1.5" fill={c}/><circle cx="13" cy="16.5" r="1.5" fill={c}/>
      </svg>;
    case 'banquet':
      return <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="1" y="7" width="16" height="4" rx="1.5" stroke={c} strokeWidth="1.5"/>
        <circle cx="3" cy="4.5" r="1.5" fill={c}/><circle cx="7" cy="4.5" r="1.5" fill={c}/>
        <circle cx="11" cy="4.5" r="1.5" fill={c}/><circle cx="15" cy="4.5" r="1.5" fill={c}/>
        <circle cx="3" cy="13.5" r="1.5" fill={c}/><circle cx="7" cy="13.5" r="1.5" fill={c}/>
        <circle cx="11" cy="13.5" r="1.5" fill={c}/><circle cx="15" cy="13.5" r="1.5" fill={c}/>
      </svg>;
    default: return null;
  }
}

// ── Table SVG components ──────────────────────────────────────────────────────
function RoundTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n=table.maxSeats, tr=Math.max(30,15+n*3.8), sr=10, sd=tr+sr+7, dim=(sd+sr+4)*2;
  const cx=dim/2, cy=dim/2;
  const tF=isDragOver?T_DROP_F:isSelected?T_SEL_F:'white';
  const tS=isDragOver?T_DROP_B:isSelected?T_SEL_B:T_BORDER;
  const sw=isSelected||isDragOver?2.5:1.5;
  return (
    <svg width={dim} height={dim} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <circle cx={cx+1} cy={cy+2} r={tr+1} fill="rgba(0,0,0,0.06)"/>
      <circle cx={cx} cy={cy} r={tr} fill={tF} stroke={tS} strokeWidth={sw}/>
      <circle cx={cx} cy={cy} r={tr*0.65} fill="none" stroke="#F3E8EE" strokeWidth={1} strokeDasharray="3 4"/>
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={Math.max(9,tr*0.27)} fontWeight="700"
        fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">{table.name.replace(/^שולחן\s*/,'')||table.name}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill="#b08090" fontFamily="Inter,sans-serif">{seatedGuests.length}/{n}</text>
      {Array.from({length:n},(_,i)=>{
        const a=(2*Math.PI*i)/n-Math.PI/2, sx=cx+Math.cos(a)*sd, sy=cy+Math.sin(a)*sd, g=seatedGuests[i];
        return <g key={i}>
          <circle cx={sx} cy={sy} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
          {g?<text x={sx} y={sy+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
            :<text x={sx} y={sy+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{i+1}</text>}
        </g>;
      })}
    </svg>
  );
}

function OvalTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n=table.maxSeats, rx=Math.max(56,20+n*5.2), ry=Math.max(32,14+n*2.6), sr=10, pad=sr+14;
  const svgW=(rx+pad)*2, svgH=(ry+pad)*2, cx=svgW/2, cy=svgH/2, sRx=rx+sr+8, sRy=ry+sr+8;
  const tF=isDragOver?T_DROP_F:isSelected?T_SEL_F:'white';
  const tS=isDragOver?T_DROP_B:isSelected?T_SEL_B:T_BORDER;
  const sw=isSelected||isDragOver?2.5:1.5;
  return (
    <svg width={svgW} height={svgH} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <ellipse cx={cx+1} cy={cy+2} rx={rx+1} ry={ry+1} fill="rgba(0,0,0,0.06)"/>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={tF} stroke={tS} strokeWidth={sw}/>
      <ellipse cx={cx} cy={cy} rx={rx*0.68} ry={ry*0.68} fill="none" stroke="#F3E8EE" strokeWidth={1} strokeDasharray="3 4"/>
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">{table.name.replace(/^שולחן\s*/,'')||table.name}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill="#b08090" fontFamily="Inter,sans-serif">{seatedGuests.length}/{n}</text>
      {Array.from({length:n},(_,i)=>{
        const a=(2*Math.PI*i)/n-Math.PI/2, sx=cx+sRx*Math.cos(a), sy=cy+sRy*Math.sin(a), g=seatedGuests[i];
        return <g key={i}>
          <circle cx={sx} cy={sy} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
          {g?<text x={sx} y={sy+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
            :<text x={sx} y={sy+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{i+1}</text>}
        </g>;
      })}
    </svg>
  );
}

function RectTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n=table.maxSeats, topN=Math.ceil(n/2), botN=n-Math.ceil(n/2), sr=10, sGap=27;
  const tableW=Math.max(90,Math.max(topN,botN)*sGap+20), tableH=52, pad=sr+11;
  const svgW=tableW+pad*2, svgH=tableH+pad*2, tx=pad, ty=pad;
  const tF=isDragOver?T_DROP_F:isSelected?T_SEL_F:'white';
  const tS=isDragOver?T_DROP_B:isSelected?T_SEL_B:T_BORDER;
  const sw=isSelected||isDragOver?2.5:1.5;
  const seats=[];
  for(let i=0;i<topN;i++) seats.push({x:tx+(tableW/(topN+1))*(i+1),y:ty-sr-4,idx:i});
  for(let i=0;i<botN;i++) seats.push({x:tx+(tableW/(botN+1))*(i+1),y:ty+tableH+sr+4,idx:topN+i});
  return (
    <svg width={svgW} height={svgH} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <rect x={tx+2} y={ty+2} width={tableW} height={tableH} rx={9} fill="rgba(0,0,0,0.07)"/>
      <rect x={tx} y={ty} width={tableW} height={tableH} rx={9} fill={tF} stroke={tS} strokeWidth={sw}/>
      <rect x={tx+5} y={ty+5} width={tableW-10} height={tableH-10} rx={5} fill="none" stroke="#F3E8EE" strokeWidth={1}/>
      <text x={tx+tableW/2} y={ty+tableH/2-3} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">{table.name}</text>
      <text x={tx+tableW/2} y={ty+tableH/2+10} textAnchor="middle" fontSize={9} fill="#b08090" fontFamily="Inter,sans-serif">{seatedGuests.length}/{n}</text>
      {seats.map(s=>{const g=seatedGuests[s.idx]; return <g key={s.idx}>
        <circle cx={s.x} cy={s.y} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
        {g?<text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
          :<text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{s.idx+1}</text>}
      </g>;})}
    </svg>
  );
}

function BanquetTableSVG({ table, seatedGuests, isSelected, isDragOver }) {
  const n=table.maxSeats, topN=Math.ceil(n/2), botN=n-topN, sr=10, sGap=30;
  const tableW=Math.max(120,topN*sGap+16), tableH=34, pad=sr+12;
  const svgW=tableW+pad*2, svgH=tableH+pad*2, tx=pad, ty=pad;
  const tF=isDragOver?T_DROP_F:isSelected?T_SEL_F:'white';
  const tS=isDragOver?T_DROP_B:isSelected?T_SEL_B:T_BORDER;
  const sw=isSelected||isDragOver?2.5:1.5;
  const seats=[];
  for(let i=0;i<topN;i++) seats.push({x:tx+(tableW/(topN+1))*(i+1),y:ty-sr-5,idx:i});
  for(let i=0;i<botN;i++) seats.push({x:tx+(tableW/(botN+1))*(i+1),y:ty+tableH+sr+5,idx:topN+i});
  return (
    <svg width={svgW} height={svgH} style={{display:'block',overflow:'visible',pointerEvents:'none'}}>
      <rect x={tx+2} y={ty+2} width={tableW} height={tableH} rx={7} fill="rgba(0,0,0,0.07)"/>
      <rect x={tx} y={ty} width={tableW} height={tableH} rx={7} fill={tF} stroke={tS} strokeWidth={sw}/>
      <rect x={tx+5} y={ty+5} width={tableW-10} height={tableH-10} rx={4} fill="none" stroke="#F3E8EE" strokeWidth={1}/>
      <text x={tx+tableW/2} y={ty+tableH/2-2} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1a0a12" fontFamily="Playfair Display,Georgia,serif">{table.name}</text>
      <text x={tx+tableW/2} y={ty+tableH/2+10} textAnchor="middle" fontSize={8.5} fill="#b08090" fontFamily="Inter,sans-serif">{seatedGuests.length}/{n}</text>
      {seats.map(s=>{const g=seatedGuests[s.idx]; return <g key={s.idx}>
        <circle cx={s.x} cy={s.y} r={sr} fill={g?S_FILL:S_EMPTY} stroke={g?S_FILL_D:S_EMPTY_B} strokeWidth={1.5}/>
        {g?<text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{initials(g.name)}</text>
          :<text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize={7.5} fill="#b08090" fontFamily="Inter,sans-serif">{s.idx+1}</text>}
      </g>;})}
    </svg>
  );
}

const TABLE_SVG = { round:RoundTableSVG, oval:OvalTableSVG, rect:RectTableSVG, banquet:BanquetTableSVG };

// ── Venue element SVG components ──────────────────────────────────────────────

function DJBoothSVG({ facing, isSelected }) {
  const W = DJ_W, H = DJ_H;
  const tS = isSelected ? '#DB2777' : '#5a4060';
  const sw = isSelected ? 2.5 : 1.5;
  const cy = H / 2 - 6;

  return (
    <svg width={W} height={H} style={{ display:'block', pointerEvents:'none', overflow:'visible' }}>
      {/* Shadow */}
      <rect x={3} y={4} width={W-3} height={H-4} rx={10} fill="rgba(0,0,0,0.18)"/>
      {/* Body */}
      <rect x={0} y={0} width={W-3} height={H-4} rx={10} fill="#16101E" stroke={tS} strokeWidth={sw}/>
      {/* Divider line */}
      <line x1={W/2-2} y1={8} x2={W/2-2} y2={H-10} stroke="#2a2040" strokeWidth={1}/>

      {/* Vinyl record (left half) */}
      {[22,18,14,10,6].map(r => (
        <circle key={r} cx={32} cy={cy} r={r} fill="none" stroke="#2a2040" strokeWidth={0.8}/>
      ))}
      <circle cx={32} cy={cy} r={22} fill="#0D0915"/>
      <circle cx={32} cy={cy} r={18} fill="#111"/>
      <circle cx={32} cy={cy} r={13} fill="#181820"/>
      <circle cx={32} cy={cy} r={9}  fill="#1e1828"/>
      <circle cx={32} cy={cy} r={5}  fill="#DB2777"/>
      <circle cx={32} cy={cy} r={2}  fill="rgba(255,255,255,0.5)"/>
      {/* Tonearm */}
      <line x1={48} y1={cy-18} x2={38} y2={cy+4} stroke="#9D174D" strokeWidth={1.5} strokeLinecap="round"/>
      <circle cx={48} cy={cy-18} r={2.5} fill="#DB2777"/>

      {/* Equalizer bars (right half) */}
      {[{x:70,h:24},{x:81,h:14},{x:92,h:30},{x:103,h:18}].map((b,i) => (
        <rect key={i} x={b.x} y={cy-b.h/2} width={7} height={b.h} rx={2}
          fill={`hsl(${310+i*20},75%,${52+i*6}%)`}/>
      ))}

      {/* Bottom label */}
      <text x={(W-3)/2} y={H-5} textAnchor="middle" fontSize={8} fontWeight="700" letterSpacing="0.8"
        fill={isSelected ? '#DB2777' : '#9D174D'} fontFamily="Inter,sans-serif">
        עמדת דיג׳י
      </text>

      {/* Facing arrow */}
      {facing === 'in' ? (
        <polygon points={`${(W-3)/2},${H-4} ${(W-3)/2-8},${H+6} ${(W-3)/2+8},${H+6}`} fill="#DB2777" opacity={0.85}/>
      ) : (
        <polygon points={`${(W-3)/2},${0} ${(W-3)/2-8},${-10} ${(W-3)/2+8},${-10}`} fill="#DB2777" opacity={0.85}/>
      )}
      {/* Facing label */}
      <text x={(W-3)/2} y={facing==='in' ? H+18 : -13} textAnchor="middle" fontSize={7.5}
        fill="#9D174D" fontFamily="Inter,sans-serif" fontWeight="600">
        {facing === 'in' ? 'פנים פנימה' : 'פנים החוצה'}
      </text>
    </svg>
  );
}

function DanceFloorSVG({ id, facing, isSelected }) {
  const W = DF_W, H = DF_H;
  const tS = isSelected ? '#DB2777' : '#D8B4C8';
  const sw = isSelected ? 2.5 : 1.5;
  const sq = 20;
  const clipId = `df-clip-${id}`;

  const cols = Math.ceil((W - 4) / sq);
  const rows = Math.ceil((H - 4) / sq);
  const squares = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) squares.push({ x: c * sq, y: r * sq });
    }
  }

  const corners = [[18,18],[W-22,18],[18,H-22],[W-22,H-22]];

  return (
    <svg width={W} height={H} style={{ display:'block', pointerEvents:'none', overflow:'visible' }}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={W-4} height={H-4} rx={14}/>
        </clipPath>
      </defs>

      {/* Shadow */}
      <rect x={4} y={5} width={W-4} height={H-4} rx={14} fill="rgba(0,0,0,0.09)"/>
      {/* Floor base */}
      <rect x={0} y={0} width={W-4} height={H-4} rx={14} fill="#FDF8FB"/>
      {/* Parquet / checkerboard */}
      <g clipPath={`url(#${clipId})`} opacity={0.65}>
        {squares.map((s,i) => (
          <rect key={i} x={s.x} y={s.y} width={sq} height={sq} fill="#F0D9E8"/>
        ))}
      </g>
      {/* Border */}
      <rect x={0} y={0} width={W-4} height={H-4} rx={14} fill="none" stroke={tS} strokeWidth={sw}/>
      {/* Inner dashed border */}
      <rect x={9} y={9} width={W-22} height={H-22} rx={8} fill="none"
        stroke={isSelected ? '#DB2777' : '#E8C4D4'} strokeWidth={1} strokeDasharray="5 4" opacity={0.7}/>
      {/* Corner diamonds */}
      {corners.map(([cx,cy],i) => (
        <polygon key={i}
          points={`${cx},${cy-6} ${cx+6},${cy} ${cx},${cy+6} ${cx-6},${cy}`}
          fill={isSelected ? '#DB2777' : '#E8C4D4'}/>
      ))}
      {/* Center label */}
      <text x={(W-4)/2} y={(H-4)/2-6} textAnchor="middle" fontSize={15} fontWeight="700"
        fill={isSelected ? '#DB2777' : '#9D174D'} fontFamily="Playfair Display,Georgia,serif">
        רחבת ריקודים
      </text>
      <text x={(W-4)/2} y={(H-4)/2+12} textAnchor="middle" fontSize={9}
        fill={isSelected ? '#BE185D' : '#b08090'} fontFamily="Inter,sans-serif">
        גררו שולחנות לצידי הרחבה
      </text>

      {/* Facing arrow */}
      {facing === 'in' ? (
        <polygon points={`${(W-4)/2},${H-4} ${(W-4)/2-10},${H+8} ${(W-4)/2+10},${H+8}`} fill="#DB2777" opacity={0.85}/>
      ) : (
        <polygon points={`${(W-4)/2},${0} ${(W-4)/2-10},${-12} ${(W-4)/2+10},${-12}`} fill="#DB2777" opacity={0.85}/>
      )}
      {/* Facing label */}
      <text x={(W-4)/2} y={facing==='in' ? H+22 : -15} textAnchor="middle" fontSize={8.5}
        fill="#9D174D" fontFamily="Inter,sans-serif" fontWeight="600">
        {facing === 'in' ? 'פנים פנימה' : 'פנים החוצה'}
      </text>
    </svg>
  );
}

function BarStationSVG({ facing, isSelected }) {
  const W = BAR_W, H = BAR_H;
  const tS = isSelected ? '#DB2777' : '#92400E';
  const sw = isSelected ? 2.5 : 1.5;
  const counterH = 38, counterY = 20;

  return (
    <svg width={W} height={H} style={{ display:'block', pointerEvents:'none', overflow:'visible' }}>
      {/* Shadow */}
      <rect x={3} y={counterY+3} width={W-6} height={counterH} rx={8} fill="rgba(0,0,0,0.15)"/>
      {/* Counter body */}
      <rect x={0} y={counterY} width={W-6} height={counterH} rx={8} fill="#7C3A0E" stroke={tS} strokeWidth={sw}/>
      {/* Counter top surface (wood grain) */}
      <rect x={0} y={counterY} width={W-6} height={14} rx={8} fill="#A0521E"/>
      <rect x={0} y={counterY+6} width={W-6} height={8} fill="#A0521E"/>
      {/* Wood grain lines */}
      {[14,28,44,60,82,100,118,140].map((x,i) => (
        <line key={i} x1={x} y1={counterY+1} x2={x+8} y2={counterY+13}
          stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeLinecap="round"/>
      ))}
      {/* Shine on counter top */}
      <rect x={6} y={counterY+3} width={W-22} height={3} rx={1.5} fill="rgba(255,255,255,0.18)"/>

      {/* Bottles row */}
      {[22,42,62,82,102,122,142].map((x,i) => {
        const colors = ['#2563EB','#DC2626','#16A34A','#7C3AED','#D97706','#0891B2','#BE185D'];
        const bH = [24,20,26,22,24,18,22][i];
        return (
          <g key={i}>
            {/* Bottle body */}
            <rect x={x} y={counterY-bH} width={8} height={bH} rx={3} fill={colors[i]} opacity={0.85}/>
            {/* Bottle neck */}
            <rect x={x+2} y={counterY-bH-7} width={4} height={8} rx={1.5} fill={colors[i]} opacity={0.7}/>
            {/* Cap */}
            <rect x={x+1.5} y={counterY-bH-9} width={5} height={3} rx={1} fill="rgba(0,0,0,0.4)"/>
          </g>
        );
      })}

      {/* Bar stools (front of counter) */}
      {[18,50,82,114,146].map((x,i) => (
        <g key={i}>
          {/* Stool seat */}
          <ellipse cx={x} cy={counterY+counterH+10} rx={9} ry={4} fill="#C17A3A" stroke="#92400E" strokeWidth={1}/>
          {/* Stool leg */}
          <line x1={x} y1={counterY+counterH+14} x2={x} y2={counterY+counterH+20}
            stroke="#92400E" strokeWidth={2} strokeLinecap="round"/>
        </g>
      ))}

      {/* Label */}
      <text x={(W-6)/2} y={counterY+counterH-5} textAnchor="middle" fontSize={9} fontWeight="700"
        fill={isSelected ? '#DB2777' : '#FDE68A'} fontFamily="Inter,sans-serif" letterSpacing="0.5">
        עמדת בר
      </text>

      {/* Facing arrow */}
      {facing === 'in' ? (
        <polygon points={`${(W-6)/2},${counterY+counterH} ${(W-6)/2-8},${counterY+counterH+12} ${(W-6)/2+8},${counterY+counterH+12}`} fill="#DB2777" opacity={0.85}/>
      ) : (
        <polygon points={`${(W-6)/2},${counterY} ${(W-6)/2-8},${counterY-12} ${(W-6)/2+8},${counterY-12}`} fill="#DB2777" opacity={0.85}/>
      )}
      <text x={(W-6)/2} y={facing==='in' ? counterY+counterH+26 : counterY-15} textAnchor="middle" fontSize={7.5}
        fill="#92400E" fontFamily="Inter,sans-serif" fontWeight="600">
        {facing === 'in' ? 'פנים פנימה' : 'פנים החוצה'}
      </text>
    </svg>
  );
}

// ── CanvasTable wrapper ───────────────────────────────────────────────────────
function CanvasTable({ table, guests, isSelected, isDragging, isDragOver, isHighlighted,
                       onMouseDown, onClick, onDrop, onDragOver, onDragLeave }) {
  const seatedGuests = table.guestIds.map(id => guests.find(g=>g.id===id)).filter(Boolean);
  const Svg = TABLE_SVG[table.shape] || RoundTableSVG;
  return (
    <div
      className={['vc-table', isSelected?'vc-table--sel':'', isDragging?'vc-table--drag':'', isDragOver?'vc-table--drop':'', isHighlighted?'vc-table--highlight':''].join(' ').trim()}
      style={{ left:table.x, top:table.y }}
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

// ── CanvasVenueElement wrapper ────────────────────────────────────────────────
function CanvasVenueElement({ el, isSelected, isDragging, onMouseDown, onClick }) {
  const Svg = el.type === 'dj' ? DJBoothSVG : el.type === 'bar' ? BarStationSVG : DanceFloorSVG;
  return (
    <div
      className={['vc-venue-el', isSelected?'vc-venue-el--sel':'', isDragging?'vc-venue-el--drag':''].join(' ').trim()}
      style={{ left:el.x, top:el.y }}
      onMouseDown={onMouseDown}
      onClick={e => { e.stopPropagation(); onClick(); }}
    >
      <Svg id={el.id} facing={el.facing} isSelected={isSelected}/>
    </div>
  );
}

// ── Seat stepper ──────────────────────────────────────────────────────────────
function SeatStepper({ value, onChange, min=MIN_SEATS, max=MAX_SEATS }) {
  return (
    <div className="vc-stepper">
      <button className="vc-stepper-btn" onClick={() => onChange(Math.max(min, value-1))} disabled={value<=min}>−</button>
      <span className="vc-stepper-val">{value}</span>
      <button className="vc-stepper-btn" onClick={() => onChange(Math.min(max, value+1))} disabled={value>=max}>+</button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function elDimensions(type) {
  if (type === 'dj')  return { w: DJ_W,  h: DJ_H  };
  if (type === 'bar') return { w: BAR_W, h: BAR_H  };
  return { w: DF_W, h: DF_H };
}

function snapX(type, pos) {
  const { w } = elDimensions(type);
  if (pos === 'left')  return 40;
  if (pos === 'right') return CANVAS_W - w - 40;
  return Math.round(CANVAS_W / 2 - w / 2);
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

  // Venue elements
  const [venueEls,   setVenueEls]  = useState([]);
  const [selectedElId, setSelEl]   = useState(null);
  const [dragEl,     setDragEl]    = useState(null);

  const wrapRef = useRef(null);
  const fileRef = useRef(null);

  const selected   = tables.find(t => t.id === selectedId) || null;
  const selectedEl = venueEls.find(e => e.id === selectedElId) || null;

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
    setToast({msg,type}); setTimeout(()=>setToast(null), 2800);
  }, []);

  // ── Search ──
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const guestHits = guests
      .filter(g => g.name.toLowerCase().includes(q))
      .map(g => {
        const tid=seating[g.id]||null, tbl=tid?tables.find(t=>t.id===tid):null;
        return { kind:'guest', id:g.id, label:g.name, tableId:tid, tableName:tbl?.name||null };
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
    wrap.scrollTo({ left:Math.max(0,t.x*zoom-wrap.clientWidth/2+80), top:Math.max(0,t.y*zoom-wrap.clientHeight/2+80), behavior:'smooth' });
    setSelected(tableId); setSelEl(null); setSearch('');
  }, [tables, zoom]);

  // ── Add table ──
  const addTable = useCallback(() => {
    const n=tables.length, wrap=wrapRef.current, sx=wrap?wrap.scrollLeft/zoom:0, sy=wrap?wrap.scrollTop/zoom:0;
    setTables(prev => [...prev, {
      id:`vt-${Date.now()}`, name:`שולחן ${n+1}`,
      x:Math.min(CANVAS_W-200,sx+80+(n%4)*210), y:Math.min(CANVAS_H-180,sy+80+Math.floor(n/4)*230),
      shape:addShape, maxSeats:addSeats, guestIds:[],
    }]);
  }, [tables.length, addShape, addSeats, zoom]);

  // ── Add venue element ──
  const addVenueElement = useCallback((type) => {
    const { h } = elDimensions(type);
    const existing = venueEls.filter(e => e.type === type);
    const yOff = existing.length * (h + 30);
    setVenueEls(prev => [...prev, {
      id: `ve-${Date.now()}`,
      type,
      label: type === 'dj' ? 'עמדת דיג׳י' : type === 'bar' ? 'עמדת בר' : 'רחבת ריקודים',
      x: snapX(type, 'center'),
      y: Math.min(CANVAS_H - h - 40, 40 + yOff),
      facing: 'in',
    }]);
    setSelEl(null); setSelected(null);
  }, [venueEls]);

  // ── Update table ──
  const updateShape = useCallback((id, shape) =>
    setTables(p => p.map(t => t.id===id ? {...t, shape} : t)), []);
  const updateSeats = useCallback((id, val) =>
    setTables(p => p.map(t => t.id!==id ? t : {...t, maxSeats:Math.max(MIN_SEATS,Math.min(MAX_SEATS,val))})), []);
  const updateName  = useCallback((id, name) =>
    setTables(p => p.map(t => t.id===id ? {...t, name} : t)), []);

  // ── Update venue element ──
  const updateElFacing = useCallback((id, facing) =>
    setVenueEls(p => p.map(e => e.id===id ? {...e, facing} : e)), []);

  const snapElToPos = useCallback((id, pos) => {
    const el = venueEls.find(e => e.id === id);
    if (!el) return;
    setVenueEls(p => p.map(e => e.id===id ? {...e, x:snapX(e.type, pos)} : e));
  }, [venueEls]);

  const deleteVenueEl = useCallback((id) => {
    setVenueEls(p => p.filter(e => e.id !== id));
    if (selectedElId === id) setSelEl(null);
  }, [selectedElId]);

  // ── Delete table ──
  const deleteTable = useCallback((id) => {
    const t = tables.find(x => x.id===id);
    setSeating(p => { const n={...p}; (t?.guestIds||[]).forEach(gid=>delete n[gid]); return n; });
    setTables(p => p.filter(x => x.id!==id));
    if (selectedId===id) setSelected(null);
  }, [tables, selectedId]);

  // ── Canvas drag: tables ──
  const onTableMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    setSelEl(null);
    const rect=wrapRef.current.getBoundingClientRect(), t=tables.find(x=>x.id===id);
    if (!t) return;
    setDragTable({ id,
      ox:(e.clientX-rect.left)/zoom+wrapRef.current.scrollLeft/zoom-t.x,
      oy:(e.clientY-rect.top)/zoom+wrapRef.current.scrollTop/zoom-t.y,
    });
    setSelected(id);
  }, [tables, zoom]);

  // ── Canvas drag: venue elements ──
  const onElMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    setSelected(null);
    const rect=wrapRef.current.getBoundingClientRect(), el=venueEls.find(x=>x.id===id);
    if (!el) return;
    setDragEl({ id,
      ox:(e.clientX-rect.left)/zoom+wrapRef.current.scrollLeft/zoom-el.x,
      oy:(e.clientY-rect.top)/zoom+wrapRef.current.scrollTop/zoom-el.y,
    });
    setSelEl(id);
  }, [venueEls, zoom]);

  const onCanvasMove = useCallback((e) => {
    if (dragTable) {
      const rect=wrapRef.current.getBoundingClientRect();
      const x=(e.clientX-rect.left)/zoom+wrapRef.current.scrollLeft/zoom-dragTable.ox;
      const y=(e.clientY-rect.top)/zoom+wrapRef.current.scrollTop/zoom-dragTable.oy;
      setTables(p => p.map(t =>
        t.id===dragTable.id ? {...t, x:Math.max(0,Math.min(CANVAS_W-160,x)), y:Math.max(0,Math.min(CANVAS_H-160,y))} : t
      ));
    }
    if (dragEl) {
      const rect=wrapRef.current.getBoundingClientRect();
      const x=(e.clientX-rect.left)/zoom+wrapRef.current.scrollLeft/zoom-dragEl.ox;
      const y=(e.clientY-rect.top)/zoom+wrapRef.current.scrollTop/zoom-dragEl.oy;
      const el=venueEls.find(e=>e.id===dragEl.id);
      if (!el) return;
      const {w,h}=elDimensions(el.type);
      setVenueEls(p => p.map(e =>
        e.id===dragEl.id ? {...e, x:Math.max(0,Math.min(CANVAS_W-w,x)), y:Math.max(0,Math.min(CANVAS_H-h,y))} : e
      ));
    }
  }, [dragTable, dragEl, zoom, venueEls]);

  const onCanvasUp = useCallback(() => { setDragTable(null); setDragEl(null); }, []);

  // ── Guest drop ──
  const onGuestDrop = useCallback((gid, tid) => {
    const g=guests.find(x=>x.id===gid), t=tables.find(x=>x.id===tid);
    if (!g||!t||t.guestIds.includes(gid)) return;
    const used=t.guestIds.reduce((s,id)=>{const x=guests.find(y=>y.id===id); return s+Math.max(x?.guests||1,1);},0);
    if (used+Math.max(g.guests||1,1)>t.maxSeats) { showToast(`${t.name} מלא`,'err'); return; }
    setSeating(p=>({...p,[gid]:tid}));
    setTables(p=>p.map(x=>x.id===tid?{...x,guestIds:[...x.guestIds,gid]}:x));
    setDragOver(null);
  }, [guests, tables, showToast]);

  const unassign = useCallback((gid, tid) => {
    setSeating(p=>{const n={...p}; delete n[gid]; return n;});
    setTables(p=>p.map(t=>t.id===tid?{...t,guestIds:t.guestIds.filter(id=>id!==gid)}:t));
  }, []);

  // ── Auto seat ──
  const autoSeat = useCallback(() => {
    if (!tables.length) { showToast('הוסיפו שולחנות תחילה'); return; }
    const eligible=guests.filter(g=>g.status==='coming'&&!seating[g.id]);
    if (!eligible.length) { showToast('אין מוזמנים לשיבוץ'); return; }
    let tArr=tables.map(t=>({...t})), ns={...seating}, placed=0, ti=0;
    eligible.forEach(g=>{
      const pax=Math.max(g.guests||1,1);
      while(ti<tArr.length){
        const t=tArr[ti], used=t.guestIds.reduce((s,id)=>{const x=guests.find(y=>y.id===id); return s+Math.max(x?.guests||1,1);},0);
        if(used+pax<=t.maxSeats){tArr[ti]={...t,guestIds:[...t.guestIds,g.id]};ns[g.id]=t.id;placed++;break;}
        ti++;
      }
    });
    setTables(tArr); setSeating(ns); showToast(`שובצו ${placed} אורחים`);
  }, [guests, tables, seating, showToast]);

  // ── Upload / zoom ──
  const onUpload = e => {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>setVenueImg(ev.target.result); r.readAsDataURL(f); e.target.value='';
  };

  const clearAll = () => {
    if (!window.confirm('לנקות את כל האולם?')) return;
    setTables([]); setSeating([]); setSelected(null); setVenueImg(null);
    setVenueEls([]); setSelEl(null);
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
                <button key={s.id} className={`vc-shape-opt${addShape===s.id?' active':''}`}
                  onClick={() => setAddShape(s.id)} title={s.label}>
                  <ShapeIcon type={s.id} size={16}/><span>{s.label}</span>
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

          {/* Venue elements */}
          <div className="vc-tb-sep"/>
          <div className="vc-tb-group">
            <span className="vc-tb-lbl">עיצוב אולם</span>
            <div className="vc-el-row">
              <button className="vc-el-btn" onClick={() => addVenueElement('dj')} title="הוסף עמדת דיג'י">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/>
                </svg>
                דיג׳י
              </button>
              <button className="vc-el-btn" onClick={() => addVenueElement('dancefloor')} title="הוסף רחבת ריקודים">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
                  <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
                </svg>
                רחבה
              </button>
              <button className="vc-el-btn" onClick={() => addVenueElement('bar')} title="הוסף עמדת בר">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16v2H4zM6 8v8M18 8v8M4 16h16" strokeLinecap="round"/>
                  <circle cx="8" cy="20" r="1.5"/><circle cx="16" cy="20" r="1.5"/>
                </svg>
                בר
              </button>
            </div>
          </div>
        </div>

        <div className="vc-tb-right">
          <button className="vc-btn-ghost" onClick={() => fileRef.current?.click()} title="סקיצת אולם">
            <Upload size={13}/> סקיצה
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onUpload}/>
          {tables.length > 0 && <button className="vc-btn-auto" onClick={autoSeat}>שיבוץ חכם</button>}
          {(tables.length > 0 || venueEls.length > 0) && (
            <button className="vc-btn-ghost vc-btn-ghost--danger" onClick={clearAll} title="נקה הכל">
              <RotateCcw size={13}/>
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="vc-stats-bar">
        {[{val:stats.seated,lbl:'שובצו'},{val:stats.total,lbl:'סה״כ'},{val:stats.tables,lbl:'שולחנות'},{val:stats.free,lbl:'מקומות פנויים'}].map(s => (
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
          <div className="vc-zoom-bar">
            <button className="vc-zoom-btn" onClick={() => setZoom(z=>Math.max(0.4,parseFloat((z-0.15).toFixed(2))))} disabled={zoom<=0.4}><ZoomOut size={13}/></button>
            <span className="vc-zoom-pct" onClick={() => setZoom(1)} title="איפוס">{Math.round(zoom*100)}%</span>
            <button className="vc-zoom-btn" onClick={() => setZoom(z=>Math.min(2,parseFloat((z+0.15).toFixed(2))))} disabled={zoom>=2}><ZoomIn size={13}/></button>
          </div>

          <div ref={wrapRef} className="vc-canvas-scroll"
            onMouseMove={onCanvasMove} onMouseUp={onCanvasUp} onMouseLeave={onCanvasUp}
            onClick={() => { setSelected(null); setSelEl(null); }}>
            <div className="vc-canvas"
              style={{width:CANVAS_W, height:CANVAS_H, transform:`scale(${zoom})`, transformOrigin:'0 0'}}>
              {venueImg && <img src={venueImg} className="vc-venue-img" alt=""/>}

              {tables.length === 0 && venueEls.length === 0 && (
                <div className="vc-canvas-empty">
                  <div className="vc-canvas-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>
                      <line x1="12" y1="3" x2="12" y2="8.5"/><line x1="12" y1="15.5" x2="12" y2="21"/>
                      <line x1="3" y1="12" x2="8.5" y2="12"/><line x1="15.5" y1="12" x2="21" y2="12"/>
                    </svg>
                  </div>
                  <p className="vc-canvas-empty-title">עצבו את תוכנית האולם</p>
                  <p className="vc-canvas-empty-sub">הוסיפו שולחנות, רחבת ריקודים ועמדת דיג׳י — ואז גררו לסידור הרצוי</p>
                </div>
              )}

              {/* Venue elements (rendered below tables so tables are on top) */}
              {venueEls.map(el => (
                <CanvasVenueElement
                  key={el.id}
                  el={el}
                  isSelected={selectedElId === el.id}
                  isDragging={dragEl?.id === el.id}
                  onMouseDown={e => onElMouseDown(e, el.id)}
                  onClick={() => { setSelEl(el.id); setSelected(null); }}
                />
              ))}

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
                  onClick={e=>{e.stopPropagation(); setSelected(t.id); setSelEl(null);}}
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

          {/* Inspector: venue element selected */}
          {selectedEl && !selected ? (
            <div className="vc-inspector">
              <div className="vc-inspector-head">
                <span className="vc-inspector-el-label">{selectedEl.label}</span>
                <button className="vc-inspector-del" onClick={() => deleteVenueEl(selectedEl.id)} title="מחק אלמנט">
                  <Trash2 size={13}/>
                </button>
              </div>

              <div className="vc-inspector-row">
                <span className="vc-inspector-lbl">כיוון פנים</span>
                <div className="vc-facing-toggle">
                  <button className={`vc-facing-btn${selectedEl.facing==='in'?' active':''}`}
                    onClick={() => updateElFacing(selectedEl.id, 'in')}>
                    פנים פנימה
                  </button>
                  <button className={`vc-facing-btn${selectedEl.facing==='out'?' active':''}`}
                    onClick={() => updateElFacing(selectedEl.id, 'out')}>
                    פנים החוצה
                  </button>
                </div>
              </div>

              <div className="vc-inspector-row">
                <span className="vc-inspector-lbl">מיקום מהיר</span>
                <div className="vc-pos-snap">
                  <button className="vc-pos-btn" onClick={() => snapElToPos(selectedEl.id, 'right')}>ימין</button>
                  <button className="vc-pos-btn" onClick={() => snapElToPos(selectedEl.id, 'center')}>מרכז</button>
                  <button className="vc-pos-btn" onClick={() => snapElToPos(selectedEl.id, 'left')}>שמאל</button>
                </div>
              </div>

              <div className="vc-inspector-el-note">
                גרור לכל מקום באולם · כיוון הפנים מסמן את הצד הפעיל
              </div>
            </div>

          ) : selected ? (
            /* Inspector: table selected */
            <div className="vc-inspector">
              <div className="vc-inspector-head">
                <input className="vc-inspector-name" value={selected.name}
                  onChange={e => updateName(selected.id, e.target.value)}/>
                <button className="vc-inspector-del" onClick={() => deleteTable(selected.id)} title="מחק שולחן">
                  <Trash2 size={13}/>
                </button>
              </div>

              <div className="vc-inspector-row">
                <span className="vc-inspector-lbl">צורה</span>
                <div className="vc-shape-picker vc-shape-picker--sm">
                  {SHAPES.map(s => (
                    <button key={s.id} className={`vc-shape-opt${selected.shape===s.id?' active':''}`}
                      onClick={() => updateShape(selected.id, s.id)} title={s.label}>
                      <ShapeIcon type={s.id} size={14}/>
                    </button>
                  ))}
                </div>
              </div>

              <div className="vc-inspector-row">
                <span className="vc-inspector-lbl">מושבים</span>
                <SeatStepper value={selected.maxSeats} onChange={v => updateSeats(selected.id, v)}/>
              </div>

              <div className="vc-inspector-divider"/>

              <div className="vc-inspector-guests">
                <span className="vc-inspector-lbl">מוזמנים — {selected.guestIds.length}/{selected.maxSeats}</span>
                <div className="vc-assigned-list">
                  {selected.guestIds.map(id=>guests.find(g=>g.id===id)).filter(Boolean).map(g => (
                    <div key={g.id} className="vc-assigned-row">
                      <span style={{color:STATUS_COLOR[g.status]||'#94A3B8',fontSize:8}}>●</span>
                      <span className="vc-assigned-name">{g.name}</span>
                      {(g.guests||1)>1 && <span className="vc-assigned-pax">×{g.guests}</span>}
                      <button className="vc-unassign-btn" onClick={() => unassign(g.id, selected.id)}>×</button>
                    </div>
                  ))}
                  {selected.guestIds.length === 0 && <div className="vc-assigned-empty">גרור אורחים לשולחן זה</div>}
                </div>
              </div>
            </div>

          ) : (
            <div className="vc-no-selection">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>לחצו על שולחן או אלמנט לעריכה</span>
            </div>
          )}

          {/* Search */}
          <div className="vc-search-bar">
            <div className="vc-search-input-wrap">
              <svg className="vc-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="vc-search-input" type="text" placeholder="חיפוש אורח או שולחן..."
                value={searchQuery} onChange={e => setSearch(e.target.value)} dir="rtl"/>
              {searchQuery && <button className="vc-search-clear" onClick={() => setSearch('')}>×</button>}
            </div>
            {searchResults.length > 0 && (
              <div className="vc-search-results">
                {searchResults.map(r => (
                  <button key={`${r.kind}-${r.id}`} className="vc-search-result"
                    onClick={() => r.tableId ? scrollToTable(r.tableId) : setSearch('')}>
                    <span className={`vc-search-result-kind vc-search-kind--${r.kind}`}>
                      {r.kind==='table'?'שולחן':'אורח'}
                    </span>
                    <span className="vc-search-result-label">{r.label}</span>
                    {r.tableName && <span className="vc-search-result-meta">{r.tableName}</span>}
                    {r.kind==='guest'&&!r.tableId && <span className="vc-search-result-unseated">לא שובץ</span>}
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
                  <div key={g.id} className="vc-guest-chip" draggable
                    onDragStart={e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('guestId',g.id);}}>
                    <span style={{color:STATUS_COLOR[g.status]||'#94A3B8',fontSize:8,flexShrink:0}}>●</span>
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

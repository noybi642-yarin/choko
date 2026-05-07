import { useState, useMemo, useCallback, useEffect } from 'react';
import { getGuests } from '../store';

// ── Extended demo metadata ────────────────────────────────────────────────────
const META = {
  g1:  { side:'כלה', group:'משפחה',  rel:'close',  vip:true,  elderly:false, kids:0 },
  g2:  { side:'חתן', group:'משפחה',  rel:'close',  vip:true,  elderly:false, kids:0 },
  g3:  { side:'כלה', group:'חברים',  rel:'close',  vip:false, elderly:false, kids:0 },
  g4:  { side:'חתן', group:'עבודה',  rel:'medium', vip:false, elderly:false, kids:0 },
  g5:  { side:'כלה', group:'משפחה',  rel:'close',  vip:false, elderly:true,  kids:0 },
  g6:  { side:'חתן', group:'חברים',  rel:'close',  vip:false, elderly:false, kids:0 },
  g7:  { side:'כלה', group:'משפחה',  rel:'medium', vip:false, elderly:true,  kids:0 },
  g8:  { side:'חתן', group:'עבודה',  rel:'medium', vip:false, elderly:false, kids:2 },
  g9:  { side:'כלה', group:'חברים',  rel:'close',  vip:false, elderly:false, kids:0 },
  g10: { side:'חתן', group:'צבא',    rel:'close',  vip:false, elderly:false, kids:0 },
  g11: { side:'כלה', group:'משפחה',  rel:'close',  vip:false, elderly:false, kids:0 },
  g12: { side:'חתן', group:'אחר',    rel:'distant', vip:false,elderly:false, kids:0 },
};

const CONFLICTS = { g1:['g4'], g4:['g1'] };

const AREA_COLORS = {
  'משפחה':         { bg:'#FDF2F8', accent:'#DB2777', dot:'#DB2777' },
  'חברים':         { bg:'#EFF6FF', accent:'#2563EB', dot:'#2563EB' },
  'עבודה':         { bg:'#F5F3FF', accent:'#7C3AED', dot:'#7C3AED' },
  'צבא':           { bg:'#ECFDF5', accent:'#059669', dot:'#059669' },
  'מוזמני הורים':  { bg:'#FFF7ED', accent:'#EA580C', dot:'#EA580C' },
  'מעורב':         { bg:'#F8FAFC', accent:'#64748B', dot:'#64748B' },
  'אחר':           { bg:'#F8FAFC', accent:'#94A3B8', dot:'#94A3B8' },
};

const STATUS_COLOR = { coming:'#16A34A', maybe:'#D97706', no:'#EF4444', pending:'#94A3B8' };
const STATUS_LABEL = { coming:'מגיע', maybe:'אולי', no:'לא מגיע', pending:'ממתין' };

const FILTERS = [
  { id:'all',     label:'הכל' },
  { id:'coming',  label:'מגיעים' },
  { id:'bride',   label:'צד כלה' },
  { id:'groom',   label:'צד חתן' },
  { id:'family',  label:'משפחה' },
  { id:'friends', label:'חברים' },
];

// ── Smart seating algorithm v2 ───────────────────────────────────────────────
function runSmartSeat(guests) {
  const eligible = guests.filter(g => g.status === 'coming' || g.status === 'maybe');
  const TABLE_CAP = 10;
  const tables = [];
  const assignments = {};
  let ti = 0;

  const mkTable = (idx, type, label) => ({
    id:       `tbl-${Date.now()}-${idx}`,
    name:     label || `שולחן ${idx + 1}`,
    maxSeats: TABLE_CAP,
    type:     type || 'מעורב',
    area:     '',
    locked:   false,
    guestIds: [],
    _pax:     0,
  });

  const getOrMake = idx => {
    if (!tables[idx]) tables[idx] = mkTable(idx, 'מעורב');
    return tables[idx];
  };

  const addToTable = (idx, g) => {
    const t = getOrMake(idx);
    const pax = Math.max(g.guests || 1, 1);
    t.guestIds.push(g.id);
    t._pax += pax;
    assignments[g.id] = t.id;
  };

  // 1. VIP first → tables 0..
  const vips = eligible.filter(g => g.vip);
  vips.forEach(g => {
    const pax = Math.max(g.guests || 1, 1);
    const t = getOrMake(ti);
    if (t._pax + pax > TABLE_CAP) ti++;
    addToTable(ti, g);
    getOrMake(ti).type = 'VIP';
  });
  if (vips.length) ti++;

  // 2. Elderly → dedicated table
  const elders = eligible.filter(g => g.elderly && !assignments[g.id]);
  if (elders.length) {
    elders.forEach(g => {
      const pax = Math.max(g.guests || 1, 1);
      const t = getOrMake(ti);
      if (t._pax + pax > TABLE_CAP) ti++;
      addToTable(ti, g);
      getOrMake(ti).type = 'משפחה';
    });
    ti++;
  }

  // 3. Bucket remaining by side + group
  const rest = eligible.filter(g => !assignments[g.id]);
  const buckets = {};
  rest.forEach(g => {
    const k = `${g.side}||${g.group}`;
    (buckets[k] = buckets[k] || []).push(g);
  });

  const ORDER = ['כלה||משפחה','חתן||משפחה','כלה||חברים','חתן||חברים',
                 'כלה||עבודה','חתן||עבודה','כלה||צבא','חתן||צבא'];
  const sortedKeys = [
    ...ORDER.filter(k => buckets[k]),
    ...Object.keys(buckets).filter(k => !ORDER.includes(k)),
  ];

  sortedKeys.forEach(key => {
    const grp  = key.split('||')[1];
    const buck = buckets[key];

    buck.forEach(g => {
      const pax = Math.max(g.guests || 1, 1);
      let t = getOrMake(ti);

      // conflict check
      const hasConflict = t.guestIds.some(id =>
        (CONFLICTS[g.id] || []).includes(id) || (CONFLICTS[id] || []).includes(g.id)
      );
      if (hasConflict || t._pax + pax > TABLE_CAP) { ti++; t = getOrMake(ti); }
      if (t._pax + pax > TABLE_CAP)               { ti++; t = getOrMake(ti); }

      addToTable(ti, g);
      if (t.guestIds.length === 1) t.type = grp;
    });

    if (getOrMake(ti)._pax >= TABLE_CAP * 0.7) ti++;
  });

  return {
    tables: tables
      .filter(t => t.guestIds.length > 0)
      .map(({ _pax, ...t }, i) => ({ ...t, name: `שולחן ${i + 1}` })),
    assignments,
  };
}

// ── Conflict detection ───────────────────────────────────────────────────────
function detectAlerts(guests, tables, assignments) {
  const byId = Object.fromEntries(guests.map(g => [g.id, g]));
  const alerts = [];
  tables.forEach(t => {
    const pax = t.guestIds.reduce((s, id) => s + Math.max(byId[id]?.guests || 1, 1), 0);
    if (pax > t.maxSeats)
      alerts.push({ type:'capacity', tableId:t.id, text:`${t.name} מעל קיבולת (${pax}/${t.maxSeats})` });
    t.guestIds.forEach(gid =>
      (CONFLICTS[gid] || []).forEach(cid => {
        if (t.guestIds.includes(cid))
          alerts.push({ type:'conflict', tableId:t.id, guestId:gid, conflictId:cid,
            text:`${byId[gid]?.name} ו${byId[cid]?.name} שובצו לאותו שולחן` });
      })
    );
  });
  guests
    .filter(g => g.status === 'coming' && !assignments[g.id])
    .forEach(g => alerts.push({ type:'unseated', guestId:g.id, text:`${g.name} אישר/ה הגעה ולא שובץ/ה` }));
  return alerts;
}

// ── GuestRow ─────────────────────────────────────────────────────────────────
function GuestRow({ guest, compact, isDragging, hasConflict, tableId, onDragStart, onDragEnd, onRemove }) {
  const col = AREA_COLORS[guest.group] || AREA_COLORS['אחר'];
  return (
    <div
      className={[
        'sp-chip',
        isDragging  ? 'sp-chip--drag'     : '',
        hasConflict ? 'sp-chip--conflict' : '',
        compact     ? 'sp-chip--compact'  : '',
      ].join(' ').trim()}
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('guestId',   guest.id);
        e.dataTransfer.setData('fromTable', tableId || '');
        onDragStart(guest.id, tableId);
      }}
      onDragEnd={onDragEnd}
    >
      <span className="sp-chip-dot" style={{ color: STATUS_COLOR[guest.status] || '#94a3b8' }}>●</span>
      <span className="sp-chip-name">{guest.name}</span>
      {!compact && (
        <>
          <span className="sp-chip-grp-tag" style={{ background: col.bg, color: col.accent }}>{guest.group}</span>
          <span className="sp-chip-side-tag">{guest.side === 'כלה' ? 'כ' : 'ח'}</span>
        </>
      )}
      {(guest.guests || 1) > 1 && <span className="sp-chip-pax">×{guest.guests}</span>}
      {hasConflict && <span className="sp-chip-conflict-icon" title="התנגשות">!</span>}
      {onRemove && (
        <button className="sp-chip-rm" onClick={e => { e.stopPropagation(); onRemove(guest.id); }}>×</button>
      )}
    </div>
  );
}

// ── TableCard ────────────────────────────────────────────────────────────────
function TableCard({
  table, guests, alerts, isDragOver, draggingId,
  onDrop, onDragOver, onDragLeave, onDelete, onDragStart, onDragEnd, onRemoveGuest, onToggleLock,
}) {
  const tGuests   = table.guestIds.map(id => guests.find(g => g.id === id)).filter(Boolean);
  const usedPax   = tGuests.reduce((s, g) => s + Math.max(g.guests || 1, 1), 0);
  const pct       = Math.min((usedPax / table.maxSeats) * 100, 100);
  const isFull    = usedPax >= table.maxSeats;
  const col       = AREA_COLORS[table.type] || AREA_COLORS['מעורב'];
  const capAlerts = alerts.filter(a => a.type === 'capacity' && a.tableId === table.id);
  const conflSet  = new Set(
    alerts.filter(a => a.tableId === table.id).flatMap(a => [a.guestId, a.conflictId].filter(Boolean))
  );

  return (
    <div
      className={[
        'sp-table-card',
        isDragOver         ? 'sp-table-card--over'  : '',
        capAlerts.length   ? 'sp-table-card--alert' : '',
        table.locked       ? 'sp-table-card--locked': '',
      ].join(' ').trim()}
      onDragOver={e => { e.preventDefault(); onDragOver(table.id); }}
      onDragLeave={onDragLeave}
      onDrop={e => {
        e.preventDefault();
        if (table.locked) return;
        const gid = e.dataTransfer.getData('guestId');
        const ft  = e.dataTransfer.getData('fromTable');
        if (gid) onDrop(gid, table.id, ft);
      }}
    >
      <div className="sp-table-head">
        <div className="sp-table-circle" style={{ background: col.accent }}>
          <span className="sp-table-num">{table.name.replace(/[^0-9]/g, '') || '—'}</span>
        </div>
        <div className="sp-table-meta">
          <div className="sp-table-name">{table.name}</div>
          <div className="sp-table-type" style={{ color: col.accent }}>{table.type}</div>
        </div>
        <div className="sp-table-hd-right">
          <span className={`sp-table-cap${isFull ? ' sp-table-cap--full' : ''}`}>
            {usedPax}/{table.maxSeats}
          </span>
          <button
            className={`sp-table-lock${table.locked ? ' active' : ''}`}
            onClick={() => onToggleLock(table.id)}
            title={table.locked ? 'בטל נעילה' : 'נעל שולחן'}
          >
            {table.locked ? '🔒' : '🔓'}
          </button>
          <button className="sp-table-del" onClick={() => onDelete(table.id)} title="מחק שולחן">✕</button>
        </div>
      </div>

      <div className="sp-table-prog-wrap">
        <div
          className="sp-table-prog"
          style={{ width:`${pct}%`, background: isFull ? '#EF4444' : col.accent }}
        />
      </div>

      <div className="sp-table-chips">
        {tGuests.map(g => (
          <GuestRow
            key={g.id}
            guest={g}
            compact
            tableId={table.id}
            isDragging={draggingId === g.id}
            hasConflict={conflSet.has(g.id)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onRemove={table.locked ? null : () => onRemoveGuest(g.id, table.id)}
          />
        ))}
        {tGuests.length === 0 && !table.locked && (
          <div className="sp-table-hint">גרור אורחים לכאן</div>
        )}
        {table.locked && tGuests.length === 0 && (
          <div className="sp-table-hint sp-table-hint--locked">שולחן נעול</div>
        )}
      </div>
    </div>
  );
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className="sp-loading-overlay">
      <div className="sp-loading-card">
        <div className="sp-loading-ring" />
        <div className="sp-loading-text">
          <span className="sp-loading-title">מארגנים את האורחים</span>
          <span className="sp-loading-sub">מנתחים קרבות, קשרים וצדדים...</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SeatingPlan({ navigate, eventId: propId }) {
  const eid       = propId || 'evt-demo';
  const rawGuests = getGuests(eid);

  const guests = rawGuests.map(g => ({
    ...g,
    ...(META[g.id] || { side:'חתן', group:'אחר', rel:'distant', vip:false, elderly:false }),
    noSeatWith: CONFLICTS[g.id] || [],
  }));

  const [tables,     setTables]    = useState([]);
  const [assigned,   setAssigned]  = useState({});
  const [draggingId, setDragging]  = useState(null);
  const [dragOverId, setDragOver]  = useState(null);
  const [filter,     setFilter]    = useState('all');
  const [mobileTab,  setMobileTab] = useState('guests');
  const [isSeating,  setIsSeating] = useState(false);
  const [toast,      setToast]     = useState(null);

  const alerts = useMemo(
    () => detectAlerts(guests, tables, assigned),
    [guests, tables, assigned]
  );

  const unseated = useMemo(() => {
    const base = guests.filter(g => g.status !== 'no' && !assigned[g.id]);
    const fn = {
      coming:  g => g.status === 'coming',
      maybe:   g => g.status === 'maybe',
      bride:   g => g.side   === 'כלה',
      groom:   g => g.side   === 'חתן',
      family:  g => g.group  === 'משפחה',
      friends: g => g.group  === 'חברים',
    };
    return filter === 'all' ? base : base.filter(fn[filter] || (() => true));
  }, [guests, assigned, filter]);

  const stats = useMemo(() => {
    const eligible = guests.filter(g => g.status !== 'no');
    return {
      total:    eligible.length,
      seated:   eligible.filter(g => assigned[g.id]).length,
      unseated: eligible.filter(g => !assigned[g.id]).length,
      tables:   tables.length,
      alerts:   alerts.length,
    };
  }, [guests, tables, assigned, alerts]);

  const conflictIds = useMemo(
    () => new Set(alerts.flatMap(a => [a.guestId, a.conflictId].filter(Boolean))),
    [alerts]
  );

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const onDragStart = useCallback((gid) => setDragging(gid), []);
  const onDragEnd   = useCallback(() => { setDragging(null); setDragOver(null); }, []);

  const onDrop = useCallback((gid, toId, fromId) => {
    const g  = guests.find(x => x.id === gid);
    const tg = tables.find(t => t.id === toId);
    if (!g || !tg || tg.locked) return;
    const curPax = tg.guestIds.reduce((s, id) => {
      const x = guests.find(y => y.id === id);
      return s + Math.max(x?.guests || 1, 1);
    }, 0);
    if (!tg.guestIds.includes(gid) && curPax + Math.max(g.guests || 1, 1) > tg.maxSeats) {
      showToast(`${tg.name} מלא`, 'error');
      return;
    }
    setAssigned(prev => ({ ...prev, [gid]: toId }));
    setTables(prev => prev.map(t => {
      if (t.id === fromId && fromId !== toId)
        return { ...t, guestIds: t.guestIds.filter(id => id !== gid) };
      if (t.id === toId && !t.guestIds.includes(gid))
        return { ...t, guestIds: [...t.guestIds, gid] };
      return t;
    }));
    setDragging(null); setDragOver(null);
  }, [guests, tables, showToast]);

  const onDropUnseated = useCallback(e => {
    e.preventDefault();
    const gid = e.dataTransfer.getData('guestId');
    const ft  = e.dataTransfer.getData('fromTable');
    if (!gid || !ft) return;
    setAssigned(prev => { const n = { ...prev }; delete n[gid]; return n; });
    setTables(prev => prev.map(t =>
      t.id === ft ? { ...t, guestIds: t.guestIds.filter(id => id !== gid) } : t
    ));
  }, []);

  const onAutoSeat = useCallback(() => {
    setIsSeating(true);
    setTimeout(() => {
      const lockedIds = new Set(tables.filter(t => t.locked).flatMap(t => t.guestIds));
      const result    = runSmartSeat(guests.filter(g => !lockedIds.has(g.id)));
      const lockedTables = tables.filter(t => t.locked);
      setTables([...lockedTables, ...result.tables]);
      setAssigned(prev => {
        const locked = Object.fromEntries(Object.entries(prev).filter(([k]) => lockedIds.has(k)));
        return { ...locked, ...result.assignments };
      });
      setIsSeating(false);
      setMobileTab('tables');
      showToast(
        `${Object.keys(result.assignments).length} אורחים שובצו ל-${result.tables.length} שולחנות לפי צד, קבוצה וקרבה`
      );
    }, 1600);
  }, [guests, tables, showToast]);

  const onAddTable = useCallback(() => {
    const num = tables.length + 1;
    setTables(prev => [...prev, {
      id: `tbl-${Date.now()}`, name:`שולחן ${num}`,
      maxSeats:10, type:'מעורב', locked:false, guestIds:[],
    }]);
  }, [tables.length]);

  const onDeleteTable = useCallback(id => {
    const t = tables.find(x => x.id === id);
    if (!t) return;
    setAssigned(prev => {
      const n = { ...prev };
      t.guestIds.forEach(gid => delete n[gid]);
      return n;
    });
    setTables(prev => prev.filter(x => x.id !== id));
  }, [tables]);

  const onRemoveGuest = useCallback((gid, tid) => {
    setAssigned(prev => { const n = { ...prev }; delete n[gid]; return n; });
    setTables(prev => prev.map(t =>
      t.id === tid ? { ...t, guestIds: t.guestIds.filter(id => id !== gid) } : t
    ));
  }, []);

  const onToggleLock = useCallback(id => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, locked: !t.locked } : t));
  }, []);

  const MOBILE_TABS = [
    { id:'guests',  label:'אורחים',   badge: unseated.length },
    { id:'tables',  label:'שולחנות',  badge: 0 },
    { id:'alerts',  label:'התראות',   badge: alerts.length },
  ];

  return (
    <div className="sp-page" dir="rtl">
      <LoadingOverlay visible={isSeating} />

      {toast && (
        <div className={`sp-toast sp-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <header className="sp-header">
        <div className="sp-header-inner">
          <div className="sp-header-text">
            <h1 className="sp-title">הושבת אורחים</h1>
            <p className="sp-subtitle">תכנון חכם לפי צד, קבוצה, קרבה והגבלות — עם עריכה ידנית מלאה</p>
          </div>
          <div className="sp-header-ctas">
            <button className="sp-btn-ai" onClick={onAutoSeat} disabled={isSeating}>
              {isSeating
                ? <><span className="sp-spin" />מארגן...</>
                : 'סדרו לי שולחנות חכמים'}
            </button>
            <button className="sp-btn-outline" onClick={onAddTable}>+ שולחן חדש</button>
          </div>
        </div>

        <div className="sp-kpi">
          {[
            { val: stats.total,    label:'אורחים לשיבוץ', cls:'' },
            { val: stats.seated,   label:'שובצו',         cls: stats.seated   > 0 ? 'sp-kpi--green'  : '' },
            { val: stats.unseated, label:'ממתינים',       cls: stats.unseated > 0 ? 'sp-kpi--warn'   : '' },
            { val: stats.tables,   label:'שולחנות',       cls:'' },
            { val: stats.alerts,   label:'התראות',        cls: stats.alerts   > 0 ? 'sp-kpi--danger' : '' },
          ].map(k => (
            <div key={k.label} className={`sp-kpi-item ${k.cls}`}>
              <span className="sp-kpi-val">{k.val}</span>
              <span className="sp-kpi-lbl">{k.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="sp-tabs">
        {MOBILE_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sp-tab${mobileTab === tab.id ? ' active' : ''}`}
            onClick={() => setMobileTab(tab.id)}
          >
            {tab.label}
            {tab.badge > 0 && <span className="sp-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* 3-column layout */}
      <div className="sp-layout">

        {/* RIGHT — unseated guests */}
        <aside
          className={`sp-panel sp-panel-r${mobileTab !== 'guests' ? ' sp-mobile-hide' : ''}`}
          onDragOver={e => e.preventDefault()}
          onDrop={onDropUnseated}
        >
          <div className="sp-panel-top">
            <span className="sp-panel-title">ממתינים לשיבוץ</span>
            <span className="sp-badge">{unseated.length}</span>
          </div>
          <div className="sp-filters">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`sp-filter${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}
              >{f.label}</button>
            ))}
          </div>
          <div className="sp-guest-list">
            {unseated.length === 0 ? (
              <div className="sp-empty">
                <div className="sp-empty-icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="sp-empty-msg">כל האורחים שובצו</span>
              </div>
            ) : (
              unseated.map(g => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  isDragging={draggingId === g.id}
                  hasConflict={conflictIds.has(g.id)}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              ))
            )}
          </div>
        </aside>

        {/* CENTER — tables grid */}
        <main className={`sp-canvas${mobileTab !== 'tables' ? ' sp-mobile-hide' : ''}`}>
          {tables.length === 0 ? (
            <div className="sp-canvas-empty">
              <div className="sp-canvas-empty-art">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2" x2="12" y2="8"/>
                  <line x1="12" y1="16" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="8" y2="12"/>
                  <line x1="16" y1="12" x2="22" y2="12"/>
                </svg>
              </div>
              <h3 className="sp-canvas-empty-h">אין שולחנות עדיין</h3>
              <p className="sp-canvas-empty-p">
                לחצו על "סדרו לי שולחנות חכמים" לסידור אוטומטי,<br />
                או הוסיפו שולחן ידנית
              </p>
              <div className="sp-canvas-empty-btns">
                <button className="sp-btn-ai" onClick={onAutoSeat}>סדרו לי שולחנות חכמים</button>
                <button className="sp-btn-outline" onClick={onAddTable}>+ שולחן ידנית</button>
              </div>
            </div>
          ) : (
            <div className="sp-tables-grid">
              {tables.map(t => (
                <TableCard
                  key={t.id}
                  table={t}
                  guests={guests}
                  alerts={alerts}
                  isDragOver={dragOverId === t.id}
                  draggingId={draggingId}
                  onDrop={onDrop}
                  onDragOver={id => setDragOver(id)}
                  onDragLeave={() => setDragOver(null)}
                  onDelete={onDeleteTable}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onRemoveGuest={onRemoveGuest}
                  onToggleLock={onToggleLock}
                />
              ))}
              <button className="sp-add-card" onClick={onAddTable}>
                <span className="sp-add-card-plus">+</span>
                <span>הוסף שולחן</span>
              </button>
            </div>
          )}
        </main>

        {/* LEFT — alerts + actions */}
        <aside className={`sp-panel-l${mobileTab !== 'alerts' ? ' sp-mobile-hide' : ''}`}>

          <div className="sp-actions-block">
            <div className="sp-panel-title">פעולות</div>
            <div className="sp-action-grid">
              {[
                { label:'הדפסה',       fn:() => window.print() },
                { label:'ייצוא Excel', fn:() => showToast('ייצוא — בקרוב') },
                { label:'תצוגת אולם', fn:() => navigate({ page:'venue-canvas', eventId:'evt-demo' }) },
                { label:'שליחה לאולם', fn:() => showToast('בקרוב') },
              ].map(a => (
                <button key={a.label} className="sp-action-btn" onClick={a.fn}>{a.label}</button>
              ))}
            </div>
          </div>

          <div className="sp-conflicts-block">
            <div className="sp-panel-top">
              <span className="sp-panel-title">התראות</span>
              {alerts.length > 0 && <span className="sp-badge sp-badge--red">{alerts.length}</span>}
            </div>
            {alerts.length === 0 ? (
              <div className="sp-ok-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>אין התראות, הכל תקין</span>
              </div>
            ) : (
              <div className="sp-alert-list">
                {alerts.slice(0, 8).map((a, i) => (
                  <div key={i} className={`sp-alert-item sp-alert--${a.type}`}>
                    <span className="sp-alert-text">{a.text}</span>
                  </div>
                ))}
                {alerts.length > 8 && (
                  <div className="sp-alert-more">ועוד {alerts.length - 8}</div>
                )}
              </div>
            )}
          </div>

          <p className="sp-trust">
            ההצעות הן כלי עזר. ניתן לערוך ידנית בכל שלב לפני שליחה לאולם.
          </p>

        </aside>
      </div>
    </div>
  );
}

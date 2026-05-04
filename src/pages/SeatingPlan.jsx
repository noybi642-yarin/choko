import { useState, useMemo, useCallback } from 'react';
import { getGuests } from '../store';

// ── Demo metadata ────────────────────────────────────────────────────────────
const SIDE = {
  g1:'כלה', g2:'חתן', g3:'כלה',  g4:'חתן',  g5:'כלה',  g6:'חתן',
  g7:'כלה', g8:'חתן', g9:'כלה',  g10:'חתן', g11:'כלה', g12:'חתן',
};
const GROUP = {
  g1:'משפחה', g2:'משפחה', g3:'חברים',       g4:'עבודה',
  g5:'מוזמני הורים', g6:'חברים', g7:'משפחה', g8:'עבודה',
  g9:'חברים', g10:'צבא', g11:'משפחה',        g12:'אחר',
};
// Conflict demo: דנה כהן (g1) ↔ יוסי ביטון (g4)
const NO_SEAT = { g1:['g4'], g4:['g1'] };

const STATUS_CFG = {
  coming:  { label:'מגיע ✓',   dot:'#22c55e' },
  maybe:   { label:'אולי',      dot:'#f59e0b' },
  no:      { label:'לא מגיע',  dot:'#ef4444' },
  pending: { label:'טרם אישר', dot:'#94a3b8' },
};
const GRP_EMOJI = {
  'משפחה':'👨‍👩‍👧', 'חברים':'👥', 'עבודה':'💼',
  'צבא':'🎖️', 'מוזמני הורים':'👴', 'אחר':'✨',
};
const TYPE_COLOR = {
  'משפחה':'#C9A84C', 'חברים':'#60a5fa', 'עבודה':'#a78bfa',
  'צבא':'#34d399', 'מוזמני הורים':'#f97316', 'מעורב':'#94a3b8', 'אחר':'#f472b6',
};
const FILTERS = [
  { id:'all',     lbl:'הכל' },
  { id:'coming',  lbl:'מגיעים' },
  { id:'maybe',   lbl:'אולי' },
  { id:'bride',   lbl:'צד כלה' },
  { id:'groom',   lbl:'צד חתן' },
  { id:'family',  lbl:'משפחה' },
  { id:'friends', lbl:'חברים' },
  { id:'work',    lbl:'עבודה' },
];
const TABLE_MAX = 10;
const ALERT_ICON = { capacity:'🔴', conflict:'⚠️', unseated:'⏳', maybe:'🟡' };

// ── Auto-seat algorithm ──────────────────────────────────────────────────────
function runAutoSeat(guests) {
  const eligible = guests.filter(g => g.status === 'coming' || g.status === 'maybe');
  const buckets = {};
  eligible.forEach(g => {
    const k = `${g.side}||${g.group}`;
    (buckets[k] = buckets[k] || []).push(g);
  });
  const ordered = Object.entries(buckets).sort(([a], [b]) => {
    const rank = k => (k.includes('משפחה') ? 0 : 1) * 2 + (k.includes('כלה') ? 0 : 1);
    return rank(a) - rank(b);
  });

  const tables = [];
  let ti = 0;
  const assignments = {};

  const ensureTable = idx => {
    if (!tables[idx]) tables[idx] = {
      id: `tbl-${Date.now()}-${idx}`,
      name: `שולחן ${idx + 1}`,
      maxSeats: TABLE_MAX,
      type: 'מעורב',
      guestIds: [],
      _pax: 0,
    };
    return tables[idx];
  };

  ordered.forEach(([key, bucket]) => {
    const grp = key.split('||')[1];
    bucket.forEach(g => {
      const pax = Math.max(g.guests || 1, 1);
      let t = ensureTable(ti);
      const hasConflict = t.guestIds.some(id => (NO_SEAT[g.id] || []).includes(id));
      if (hasConflict || t._pax + pax > TABLE_MAX) { ti++; t = ensureTable(ti); }
      if (t._pax + pax > TABLE_MAX) { ti++; t = ensureTable(ti); }
      t.guestIds.push(g.id);
      t._pax += pax;
      assignments[g.id] = t.id;
      if (t.guestIds.length === 1) t.type = grp;
    });
    const t = tables[ti];
    if (t && t._pax >= TABLE_MAX * 0.75) ti++;
  });

  return {
    tables: tables.filter(t => t.guestIds.length > 0).map(({ _pax, ...t }) => t),
    assignments,
  };
}

// ── Conflict detection ───────────────────────────────────────────────────────
function detectConflicts(guests, tables, assignments) {
  const byId = Object.fromEntries(guests.map(g => [g.id, g]));
  const alerts = [];
  tables.forEach(t => {
    const pax = t.guestIds.reduce((s, id) => s + Math.max(byId[id]?.guests || 1, 1), 0);
    if (pax > t.maxSeats)
      alerts.push({ type:'capacity', tableId:t.id, text:`${t.name} מעל קיבולת (${pax}/${t.maxSeats})` });
    t.guestIds.forEach(gid =>
      (byId[gid]?.noSeatWith || []).forEach(cid => {
        if (t.guestIds.includes(cid))
          alerts.push({ type:'conflict', tableId:t.id, guestId:gid, conflictId:cid,
            text:`${byId[gid]?.name} ו${byId[cid]?.name} לא יכולים לשבת ביחד ב${t.name}` });
      })
    );
  });
  guests.filter(g => g.status === 'coming' && !assignments[g.id]).forEach(g =>
    alerts.push({ type:'unseated', guestId:g.id, text:`${g.name} מאשר/ת הגעה ולא שובץ/ה` })
  );
  guests.filter(g => g.status === 'maybe' && assignments[g.id]).forEach(g =>
    alerts.push({ type:'maybe', guestId:g.id, text:`${g.name} עדיין לא אישר/ה — שובץ/ה לשולחן` })
  );
  return alerts;
}

// ── GuestChip ────────────────────────────────────────────────────────────────
function GuestChip({ guest, isDragging, hasConflict, compact, tableId, onDragStart, onDragEnd, onRemove }) {
  const sc = STATUS_CFG[guest.status] || STATUS_CFG.pending;
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
      <span className="sp-chip-dot" style={{ color: sc.dot }}>●</span>
      <span className="sp-chip-name">{guest.name}</span>
      {!compact && <span className="sp-chip-grp">{GRP_EMOJI[guest.group] || '✨'}</span>}
      {!compact && (
        <span className="sp-chip-side">{guest.side === 'כלה' ? 'כלה' : 'חתן'}</span>
      )}
      {(guest.guests || 1) > 1 && <span className="sp-chip-pax">×{guest.guests}</span>}
      {hasConflict && <span className="sp-chip-warn" title="התנגשות">⚠️</span>}
      {onRemove && (
        <button className="sp-chip-rm" onClick={e => { e.stopPropagation(); onRemove(guest.id); }}>×</button>
      )}
    </div>
  );
}

// ── TableCard ────────────────────────────────────────────────────────────────
function TableCard({ table, guests, conflicts, isDragOver, draggingId,
                     onDrop, onDragOver, onDragLeave, onDelete, onDragStart, onDragEnd, onRemoveGuest }) {
  const tableGuests  = table.guestIds.map(id => guests.find(g => g.id === id)).filter(Boolean);
  const usedPax      = tableGuests.reduce((s, g) => s + Math.max(g.guests || 1, 1), 0);
  const pct          = Math.min((usedPax / table.maxSeats) * 100, 100);
  const isFull       = usedPax >= table.maxSeats;
  const conflictIds  = new Set(
    conflicts.filter(c => c.tableId === table.id).flatMap(c => [c.guestId, c.conflictId].filter(Boolean))
  );
  const hasCapAlert  = conflicts.some(c => c.type === 'capacity' && c.tableId === table.id);
  const tableNum     = table.name.replace(/[^0-9]/g, '') || (table.name[0] || '?').toUpperCase();
  const circleColor  = TYPE_COLOR[table.type] || '#94a3b8';

  return (
    <div
      className={[
        'sp-table-card',
        isDragOver  ? 'sp-table-card--over'  : '',
        hasCapAlert ? 'sp-table-card--alert' : '',
      ].join(' ').trim()}
      onDragOver={e => { e.preventDefault(); onDragOver(table.id); }}
      onDragLeave={onDragLeave}
      onDrop={e => {
        e.preventDefault();
        const gid = e.dataTransfer.getData('guestId');
        const ft  = e.dataTransfer.getData('fromTable');
        if (gid) onDrop(gid, table.id, ft);
      }}
    >
      <div className="sp-table-head">
        <div
          className="sp-table-circle"
          style={{ background: `radial-gradient(circle at 35% 35%, ${circleColor}dd, ${circleColor}88)` }}
        >
          <span className="sp-table-num">{tableNum}</span>
        </div>
        <div className="sp-table-meta">
          <div className="sp-table-name">{table.name}</div>
          <div className="sp-table-type">{GRP_EMOJI[table.type] || '🍽️'} {table.type}</div>
        </div>
        <div className="sp-table-hd-right">
          <span className={`sp-table-cap${isFull ? ' sp-table-cap--full' : ''}`}>
            {usedPax}/{table.maxSeats}
          </span>
          <button className="sp-table-del" onClick={() => onDelete(table.id)} title="מחק שולחן">✕</button>
        </div>
      </div>

      <div className="sp-table-prog-wrap">
        <div className="sp-table-prog" style={{ width:`${pct}%`, background: isFull ? '#ef4444' : circleColor }} />
      </div>

      <div className="sp-table-chips">
        {tableGuests.map(g => (
          <GuestChip
            key={g.id}
            guest={g}
            compact
            tableId={table.id}
            isDragging={draggingId === g.id}
            hasConflict={conflictIds.has(g.id)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onRemove={() => onRemoveGuest(g.id, table.id)}
          />
        ))}
        {tableGuests.length === 0 && (
          <div className="sp-table-hint">גרור/י מוזמנים לכאן ✦</div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SeatingPlan({ navigate, eventId: propId }) {
  const eid       = propId || 'evt-demo';
  const rawGuests = getGuests(eid);
  const guests    = rawGuests.map(g => ({
    ...g,
    side:       SIDE[g.id]    || 'חתן',
    group:      GROUP[g.id]   || 'אחר',
    noSeatWith: NO_SEAT[g.id] || [],
  }));

  const [tables,    setTables]    = useState([]);
  const [assigned,  setAssigned]  = useState({});   // guestId → tableId
  const [draggingId, setDragging] = useState(null);
  const [dragOverId, setDragOver] = useState(null);
  const [filter,    setFilter]    = useState('all');
  const [mobileTab, setMobileTab] = useState('guests');
  const [isSeating, setIsSeating] = useState(false);
  const [toast,     setToast]     = useState(null);

  // ── Derived state ──
  const conflicts = useMemo(
    () => detectConflicts(guests, tables, assigned),
    [guests, tables, assigned]
  );

  const unseated = useMemo(() => {
    const base = guests.filter(g => g.status !== 'no' && !assigned[g.id]);
    const filters = {
      coming:  g => g.status === 'coming',
      maybe:   g => g.status === 'maybe',
      bride:   g => g.side   === 'כלה',
      groom:   g => g.side   === 'חתן',
      family:  g => g.group  === 'משפחה',
      friends: g => g.group  === 'חברים',
      work:    g => g.group  === 'עבודה',
    };
    return filter === 'all' ? base : base.filter(filters[filter] || (() => true));
  }, [guests, assigned, filter]);

  const stats = useMemo(() => {
    const eligible = guests.filter(g => g.status !== 'no');
    const seatedList = eligible.filter(g => assigned[g.id]);
    const fullTables = tables.filter(t => {
      const pax = t.guestIds.reduce((s, id) => {
        const g = guests.find(x => x.id === id);
        return s + Math.max(g?.guests || 1, 1);
      }, 0);
      return pax >= t.maxSeats;
    });
    return {
      total:   eligible.length,
      seated:  seatedList.length,
      unseated: eligible.length - seatedList.length,
      tables:  tables.length,
      full:    fullTables.length,
      alerts:  conflicts.length,
    };
  }, [guests, tables, assigned, conflicts]);

  const conflictIds = useMemo(
    () => new Set(conflicts.flatMap(c => [c.guestId, c.conflictId].filter(Boolean))),
    [conflicts]
  );

  // ── Handlers ──
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const onDragStart = useCallback((gid) => setDragging(gid), []);
  const onDragEnd   = useCallback(() => { setDragging(null); setDragOver(null); }, []);

  const onDrop = useCallback((gid, toId, fromId) => {
    const g      = guests.find(x => x.id === gid);
    const target = tables.find(t => t.id === toId);
    if (!g || !target) return;
    const currentPax = target.guestIds.reduce((s, id) => {
      const x = guests.find(y => y.id === id);
      return s + Math.max(x?.guests || 1, 1);
    }, 0);
    const gPax = Math.max(g.guests || 1, 1);
    if (!target.guestIds.includes(gid) && currentPax + gPax > target.maxSeats) {
      showToast(`${target.name} מלא! (${currentPax}/${target.maxSeats})`, 'error');
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
    const gid    = e.dataTransfer.getData('guestId');
    const fromId = e.dataTransfer.getData('fromTable');
    if (!gid || !fromId) return;
    setAssigned(prev => { const n = { ...prev }; delete n[gid]; return n; });
    setTables(prev => prev.map(t =>
      t.id === fromId ? { ...t, guestIds: t.guestIds.filter(id => id !== gid) } : t
    ));
  }, []);

  const onAutoSeat = useCallback(() => {
    setIsSeating(true);
    setTimeout(() => {
      const result = runAutoSeat(guests);
      setTables(result.tables);
      setAssigned(result.assignments);
      setIsSeating(false);
      showToast(`✨ שובצו ${Object.keys(result.assignments).length} מוזמנים ל-${result.tables.length} שולחנות — לפי צד, קרבה וקבוצות חברתיות`);
    }, 1400);
  }, [guests, showToast]);

  const onAddTable = useCallback(() => {
    const num = tables.length + 1;
    setTables(prev => [...prev, {
      id: `tbl-${Date.now()}`, name: `שולחן ${num}`,
      maxSeats: TABLE_MAX, type: 'מעורב', guestIds: [],
    }]);
  }, [tables.length]);

  const onDeleteTable = useCallback(tableId => {
    const t = tables.find(x => x.id === tableId);
    if (!t) return;
    setAssigned(prev => { const n = { ...prev }; t.guestIds.forEach(id => delete n[id]); return n; });
    setTables(prev => prev.filter(x => x.id !== tableId));
  }, [tables]);

  const onRemoveGuest = useCallback((gid, tableId) => {
    setAssigned(prev => { const n = { ...prev }; delete n[gid]; return n; });
    setTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, guestIds: t.guestIds.filter(id => id !== gid) } : t
    ));
  }, []);

  const MOBILE_TABS = [
    { id:'guests',  lbl:'מוזמנים' },
    { id:'tables',  lbl:'שולחנות' },
    { id:'alerts',  lbl:'התראות' },
    { id:'summary', lbl:'סיכום' },
  ];

  // ── Render ──
  return (
    <div className="sp-page" dir="rtl">
      {/* ── Aurora background ── */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-layer" />
        <div className="aurora-layer-2" />
      </div>

      {/* ── Toast ── */}
      {toast && <div className={`sp-toast sp-toast--${toast.type}`}>{toast.msg}</div>}

      {/* ── Header ── */}
      <header className="sp-header">
        <div className="sp-header-inner">
          <div className="sp-header-text">
            <h1 className="sp-title">הושבת מוזמנים חכמה</h1>
            <p className="sp-subtitle">סדרו שולחנות בלי דרמות, עם הצעות חכמות והתראות בזמן אמת</p>
          </div>
          <div className="sp-header-ctas">
            <button className="sp-btn-ai" onClick={onAutoSeat} disabled={isSeating}>
              {isSeating
                ? <><span className="sp-spin" />מסדר שולחנות...</>
                : <>✨ סדרו לי שולחנות חכמים</>}
            </button>
            <button className="sp-btn-outline" onClick={onAddTable}>+ הוסף שולחן</button>
          </div>
        </div>

        {/* KPI ribbon */}
        <div className="sp-kpi">
          {[
            { icon:'👥', val:stats.total,    lbl:'לשיבוץ' },
            { icon:'✅', val:stats.seated,   lbl:'שובצו',          cls: stats.seated  > 0 ? 'sp-kpi--green'  : '' },
            { icon:'⏳', val:stats.unseated, lbl:'לא שובצו',       cls: stats.unseated> 0 ? 'sp-kpi--warn'   : '' },
            { icon:'🍽️', val:stats.tables,   lbl:'שולחנות' },
            { icon:'🔒', val:stats.full,     lbl:'שולחנות מלאים' },
            { icon:'⚠️', val:stats.alerts,   lbl:'התראות',         cls: stats.alerts  > 0 ? 'sp-kpi--danger' : '' },
          ].map(k => (
            <div key={k.lbl} className={`sp-kpi-item ${k.cls || ''}`}>
              <span className="sp-kpi-icon">{k.icon}</span>
              <span className="sp-kpi-val">{k.val}</span>
              <span className="sp-kpi-lbl">{k.lbl}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── Mobile tabs ── */}
      <div className="sp-tabs">
        {MOBILE_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sp-tab${mobileTab === tab.id ? ' active' : ''}`}
            onClick={() => setMobileTab(tab.id)}
          >
            {tab.lbl}
            {tab.id === 'alerts' && stats.alerts > 0 && (
              <span className="sp-tab-badge">{stats.alerts}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── 3-column layout ── */}
      <div className="sp-layout">

        {/* ── RIGHT: Unseated guests ── */}
        <aside
          className={`sp-panel sp-panel-r${mobileTab !== 'guests' ? ' sp-panel--hide' : ''}`}
          onDragOver={e => e.preventDefault()}
          onDrop={onDropUnseated}
        >
          <div className="sp-panel-top">
            <span className="sp-panel-title">מוזמנים שטרם שובצו</span>
            <span className="sp-badge">{unseated.length}</span>
          </div>
          <div className="sp-filters">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`sp-filter${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.lbl}
              </button>
            ))}
          </div>
          <div className="sp-guest-list">
            {unseated.length === 0 ? (
              <div className="sp-empty">
                <span className="sp-empty-icon">🎉</span>
                <span className="sp-empty-msg">כל המוזמנים שובצו!</span>
              </div>
            ) : (
              unseated.map(g => (
                <GuestChip
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

        {/* ── CENTER: Table canvas ── */}
        <main className={`sp-canvas${mobileTab !== 'tables' ? ' sp-canvas--hide' : ''}`}>
          {tables.length === 0 ? (
            <div className="sp-canvas-empty">
              <div className="sp-canvas-empty-art">🍽️</div>
              <h3 className="sp-canvas-empty-h">עדיין אין שולחנות</h3>
              <p className="sp-canvas-empty-p">
                לחצו על "סדרו לי שולחנות חכמים" לתכנון אוטומטי,<br />
                או הוסיפו שולחן ידנית
              </p>
              <div className="sp-canvas-empty-btns">
                <button className="sp-btn-ai" onClick={onAutoSeat}>✨ סדרו לי שולחנות חכמים</button>
                <button className="sp-btn-outline" onClick={onAddTable}>+ הוסף שולחן ידנית</button>
              </div>
            </div>
          ) : (
            <div className="sp-tables-grid">
              {tables.map(t => (
                <TableCard
                  key={t.id}
                  table={t}
                  guests={guests}
                  conflicts={conflicts}
                  isDragOver={dragOverId === t.id}
                  draggingId={draggingId}
                  onDrop={onDrop}
                  onDragOver={id => setDragOver(id)}
                  onDragLeave={() => setDragOver(null)}
                  onDelete={onDeleteTable}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onRemoveGuest={onRemoveGuest}
                />
              ))}
              <button className="sp-add-card" onClick={onAddTable}>
                <span className="sp-add-card-plus">+</span>
                <span>הוסף שולחן</span>
              </button>
            </div>
          )}
        </main>

        {/* ── LEFT: Actions + Conflicts ── */}
        <aside className={`sp-panel-l${mobileTab !== 'alerts' && mobileTab !== 'summary' ? ' sp-panel--hide' : ''}`}>

          {/* Actions */}
          <div className="sp-actions-block">
            <div className="sp-panel-title" style={{ marginBottom: 12 }}>פעולות</div>
            <div className="sp-action-grid">
              {[
                { icon:'🖨️', lbl:'הדפסה',       fn:() => window.print() },
                { icon:'📊', lbl:'ייצוא לאקסל', fn:() => showToast('ייצוא לאקסל — בקרוב!') },
                { icon:'🏛️', lbl:'תצוגת אולם',  fn:() => showToast('תצוגת אולם — בקרוב!') },
                { icon:'📨', lbl:'שליחה לאולם', fn:() => showToast('נשלח לאולם! — בקרוב!') },
              ].map(a => (
                <button key={a.lbl} className="sp-action-btn" onClick={a.fn}>
                  <span>{a.icon}</span>
                  <span>{a.lbl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conflicts */}
          <div className="sp-conflicts-block">
            <div className="sp-panel-top">
              <span className="sp-panel-title">התראות</span>
              {conflicts.length > 0 && (
                <span className="sp-badge sp-badge--red">{conflicts.length}</span>
              )}
            </div>
            {conflicts.length === 0 ? (
              <div className="sp-ok-row">
                <span>✅</span>
                <span>אין התראות, הכל תקין!</span>
              </div>
            ) : (
              <div className="sp-alert-list">
                {conflicts.slice(0, 7).map((c, i) => (
                  <div key={i} className={`sp-alert-item sp-alert--${c.type}`}>
                    <span>{ALERT_ICON[c.type] || '⚠️'}</span>
                    <span className="sp-alert-text">{c.text}</span>
                  </div>
                ))}
                {conflicts.length > 7 && (
                  <div className="sp-alert-more">ועוד {conflicts.length - 7} התראות</div>
                )}
              </div>
            )}
          </div>

          {/* Trust copy */}
          <p className="sp-trust">
            ההצעות הן כלי עזר בלבד. תמיד ניתן לערוך ידנית לפני שליחה לאולם.
          </p>
        </aside>

      </div>
    </div>
  );
}

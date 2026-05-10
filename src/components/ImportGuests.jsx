import { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { importGuests } from '../store';

// ── Canonical groups ──────────────────────────────────────────────────────────
export const CANONICAL_GROUPS = [
  'משפחה גרעינית — חתן',
  'משפחה גרעינית — כלה',
  'משפחה מורחבת — חתן',
  'משפחה מורחבת — כלה',
  'חברים קרובים — חתן',
  'חברים קרובים — כלה',
  'VIP — חתן',
  'VIP — כלה',
  'עבודה — חתן',
  'עבודה — כלה',
  'צבא — חתן',
  'צבא — כלה',
  'ילדות — כלה',
  'ילדות — חתן',
  'מוזמני הורים — חתן',
  'מוזמני הורים — כלה',
  'אחר',
];

const TEMPLATE_COLS = [
  { key: 'firstName',  label: 'שם פרטי',       req: true,  example: 'דנה' },
  { key: 'lastName',   label: 'שם משפחה',       req: true,  example: 'כהן' },
  { key: 'phone',      label: 'טלפון',           req: false, example: '050-1234567' },
  { key: 'guests',     label: 'מספר מוזמנים',   req: false, example: '2' },
  { key: 'side',       label: 'צד',              req: false, example: 'כלה / חתן / משותף' },
  { key: 'group',      label: 'קבוצה',           req: false, example: 'משפחה גרעינית — כלה' },
  { key: 'proximity',  label: 'קירבה',           req: false, example: 'קרוב / בינוני / רחוק' },
  { key: 'vip',        label: 'VIP',             req: false, example: 'כן / לא' },
  { key: 'elderly',    label: 'ישיש / נגישות',  req: false, example: 'כן / לא' },
  { key: 'kids',       label: 'ילדים',           req: false, example: '0' },
  { key: 'religious',  label: 'רמת דתיות',      req: false, example: 'חילוני / מסורתי / דתי / חרדי' },
  { key: 'noSitWith',  label: 'לא לשבת עם',     req: false, example: 'שם או טלפון' },
  { key: 'notes',      label: 'הערות',           req: false, example: 'הערה חופשית' },
];

// ── Column aliases ────────────────────────────────────────────────────────────
const ALIASES = {
  firstName:  ['שם פרטי', 'פרטי', 'first name', 'firstname', 'first'],
  lastName:   ['שם משפחה', 'משפחה', 'last name', 'lastname', 'last', 'family', 'surname'],
  fullName:   ['שם מלא', 'שם', 'name', 'full name', 'fullname', 'contact'],
  phone:      ['טלפון', 'נייד', 'פלאפון', 'מספר טלפון', 'phone', 'mobile', 'cell', 'tel'],
  guests:     ['מספר מוזמנים', 'מוזמנים', 'כמות', 'אנשים', 'guests', 'count', 'pax', 'מספר'],
  side:       ['צד', 'side', 'חתן/כלה', 'צד הזוג'],
  group:      ['קבוצה', 'מחלקה', 'סוג', 'group', 'category', 'חבורה'],
  proximity:  ['קירבה', 'proximity', 'קשר', 'relation'],
  vip:        ['vip', 'VIP', 'חשוב', 'חשובים'],
  elderly:    ['ישיש', 'נגישות', 'elderly', 'senior', 'ישישים'],
  kids:       ['ילדים', 'kids', 'children', 'ילד', 'מספר ילדים'],
  religious:  ['רמת דתיות', 'דתיות', 'religious', 'religion', 'דת'],
  noSitWith:  ['לא לשבת עם', 'קונפליקט', 'conflict', 'לא ליד', 'no sit with'],
  notes:      ['הערות', 'הערה', 'notes', 'note', 'comment', 'comments'],
};

const SIDE_COLORS = {
  'כלה':   { background: '#FDF2F8', color: '#DB2777' },
  'חתן':   { background: '#EFF6FF', color: '#2563EB' },
  'משותף': { background: '#F0FDF4', color: '#16A34A' },
};

// ── Parsers ───────────────────────────────────────────────────────────────────
const norm = s => String(s || '').trim().toLowerCase();

function findCol(headers, field) {
  for (const alias of (ALIASES[field] || [])) {
    const i = headers.findIndex(h => norm(h) === norm(alias));
    if (i !== -1) return i;
  }
  return -1;
}

function parseBool(v) {
  const s = norm(v);
  return s === 'כן' || s === 'yes' || s === '1' || s === 'true';
}

function parseSide(v) {
  const s = norm(v);
  if (s.includes('כלה') || s === 'bride') return 'כלה';
  if (s.includes('חתן') || s === 'groom') return 'חתן';
  if (s.includes('משותף') || s === 'both' || s === 'shared') return 'משותף';
  return String(v || '').trim();
}

function parseProximity(v) {
  const s = norm(v);
  if (s.includes('קרוב') || s === 'close') return 'קרוב';
  if (s.includes('בינוני') || s === 'medium') return 'בינוני';
  if (s.includes('רחוק') || s === 'distant' || s === 'far') return 'רחוק';
  return String(v || '').trim();
}

function parseReligious(v) {
  const s = norm(v);
  if (s.includes('חרדי') || s === 'ultra' || s === 'haredi') return 'חרדי';
  if (s.includes('דתי') || s === 'religious') return 'דתי';
  if (s.includes('מסורתי') || s === 'traditional') return 'מסורתי';
  if (s.includes('חילוני') || s === 'secular') return 'חילוני';
  return String(v || '').trim();
}

function detectColMap(headers) {
  const map = {};
  for (const field of Object.keys(ALIASES)) {
    const idx = findCol(headers, field);
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

function parseRows(dataRows, sheetName, colMap) {
  const rows = [];
  for (const rawRow of dataRows) {
    const get = f => colMap[f] !== undefined ? rawRow[colMap[f]] : undefined;

    let name = '';
    if (colMap.firstName !== undefined && colMap.lastName !== undefined) {
      name = `${rawRow[colMap.firstName] || ''} ${rawRow[colMap.lastName] || ''}`.trim();
    } else if (colMap.firstName !== undefined) {
      name = String(rawRow[colMap.firstName] || '').trim();
    } else if (colMap.fullName !== undefined) {
      name = String(rawRow[colMap.fullName] || '').trim();
    }
    if (!name) continue;

    rows.push({
      name,
      phone:          String(get('phone') || '').trim(),
      guests:         parseInt(get('guests')) || 1,
      side:           parseSide(get('side')),
      group:          String(get('group') || sheetName || '').trim(),
      proximity:      parseProximity(get('proximity')),
      vip:            parseBool(get('vip')),
      elderly:        parseBool(get('elderly')),
      kids:           parseInt(get('kids')) || 0,
      religiousLevel: parseReligious(get('religious')),
      noSitWith:      String(get('noSitWith') || '').trim(),
      notes:          String(get('notes') || '').trim(),
    });
  }
  return rows;
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const allRows = [];
        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          if (!raw || raw.length < 2) continue;
          const [headerRow, ...dataRows] = raw;
          const headers = headerRow.map(String);
          const colMap = detectColMap(headers);
          allRows.push(...parseRows(dataRows, sheetName, colMap));
        }
        resolve(allRows);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function generateTemplate() {
  const wb = XLSX.utils.book_new();

  const headers = TEMPLATE_COLS.map(c => c.label);
  const example = TEMPLATE_COLS.map(c => c.example);
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  ws['!cols'] = TEMPLATE_COLS.map(c => ({ wch: Math.max(c.label.length * 2.5, 16) }));
  XLSX.utils.book_append_sheet(wb, ws, 'אורחים');

  const groupsData = [['שמות קבוצות מומלצים'], ...CANONICAL_GROUPS.map(g => [g])];
  const wsG = XLSX.utils.aoa_to_sheet(groupsData);
  wsG['!cols'] = [{ wch: 36 }];
  XLSX.utils.book_append_sheet(wb, wsG, 'קבוצות מומלצות');

  XLSX.writeFile(wb, 'תבנית_אורחים_choko.xlsx');
}

function groupColor(group) {
  if (!group) return { background: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };
  if (group.includes('כלה'))   return { background: '#FDF2F8', color: '#BE185D',  border: '#FBCFE8' };
  if (group.includes('חתן'))   return { background: '#EFF6FF', color: '#1D4ED8',  border: '#BFDBFE' };
  if (group.includes('VIP'))   return { background: '#FFFBEB', color: '#B45309',  border: '#FDE68A' };
  if (group.includes('משפחה')) return { background: '#FFF1F2', color: '#BE123C',  border: '#FECDD3' };
  if (group.includes('חברים') || group.includes('ילדות')) return { background: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
  if (group.includes('עבודה')) return { background: '#F5F3FF', color: '#7C3AED',  border: '#DDD6FE' };
  if (group.includes('צבא'))   return { background: '#ECFDF5', color: '#059669',  border: '#A7F3D0' };
  if (group.includes('הורים')) return { background: '#FFF7ED', color: '#C2410C',  border: '#FED7AA' };
  return { background: '#F8FAFC', color: '#475569', border: '#CBD5E1' };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImportGuests({ eventId, onDone, onClose }) {
  const [step,       setStep]       = useState('upload');
  const [rows,       setRows]       = useState([]);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [imported,   setImported]   = useState(0);
  const [groupEdits, setGroupEdits] = useState({});
  const inputRef = useRef();

  const displayRows = useMemo(
    () => rows.map((r, i) => ({ ...r, group: groupEdits[i] ?? r.group })),
    [rows, groupEdits]
  );

  const groups = useMemo(() => {
    const map = {};
    displayRows.forEach(r => { const g = r.group || 'ללא קבוצה'; map[g] = (map[g] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [displayRows]);

  const vipCount     = displayRows.filter(r => r.vip).length;
  const elderlyCount = displayRows.filter(r => r.elderly).length;
  const totalPax     = displayRows.reduce((s, r) => s + (r.guests || 1), 0);

  const handleFile = async file => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const parsed = await parseExcel(file);
      if (!parsed.length) {
        setError('לא נמצאו אנשי קשר. ודאי שהקובץ מכיל עמודת "שם פרטי" או "שם מלא".');
        setLoading(false);
        return;
      }
      setRows(parsed);
      setGroupEdits({});
      setStep('preview');
    } catch {
      setError('שגיאה בקריאת הקובץ. ודאי שמדובר בקובץ Excel תקין (.xlsx / .xls).');
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    const count = importGuests(eventId, displayRows);
    setImported(count);
    setStep('done');
    onDone();
  };

  const STEPS = ['upload', 'preview', 'done'];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="ig-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ig-modal">

        {/* Header */}
        <div className="ig-header">
          <div>
            <div className="ig-header-title">ייבוא אורחים מ-Excel</div>
            {step === 'preview' && (
              <div className="ig-header-sub">{rows.length} אנשי קשר · {groups.length} קבוצות</div>
            )}
          </div>
          <button className="ig-close" onClick={onClose}>✕</button>
        </div>

        {/* Step indicator */}
        <div className="ig-steps">
          {[['upload','העלה קובץ'],['preview','סקירה ועריכה'],['done','הושלם']].map(([id, label], i) => (
            <div key={id} className={['ig-step', step===id?'ig-step--active':'', stepIdx>i?'ig-step--done':''].join(' ')}>
              <div className="ig-step-dot">{stepIdx > i ? '✓' : i + 1}</div>
              <div className="ig-step-label">{label}</div>
              {i < 2 && <div className="ig-step-line" />}
            </div>
          ))}
        </div>

        {/* ── Upload ── */}
        {step === 'upload' && (
          <div className="ig-body">
            <div
              className={`ig-dropzone${loading ? ' ig-dropzone--loading' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => !loading && inputRef.current.click()}
            >
              {loading
                ? <div className="ig-spinner" />
                : <>
                    <div className="ig-drop-icon">&#8679;</div>
                    <div className="ig-drop-title">גרור קובץ Excel לכאן</div>
                    <div className="ig-drop-sub">או לחץ לבחירת קובץ · .xlsx / .xls</div>
                  </>
              }
            </div>
            <input ref={inputRef} type="file" accept=".xlsx,.xls"
              style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

            {error && <div className="ig-error">{error}</div>}

            <button className="ig-template-btn" onClick={generateTemplate}>
              הורד תבנית Excel
            </button>

            <div className="ig-hint-box">
              <div className="ig-hint-title">עמודות נתמכות</div>
              <div className="ig-hint-cols">
                {TEMPLATE_COLS.map(c => (
                  <span key={c.key} className={`ig-hint-col${c.req ? ' ig-hint-col--req' : ''}`}>
                    {c.label}{c.req ? ' *' : ''}
                  </span>
                ))}
              </div>
              <div className="ig-hint-note">
                כל גיליון (Sheet) יהפוך לקבוצה אוטומטית אם אין עמודת "קבוצה"
              </div>
            </div>
          </div>
        )}

        {/* ── Preview ── */}
        {step === 'preview' && (
          <div className="ig-body ig-body--preview">

            {/* Stats */}
            <div className="ig-stats">
              <div className="ig-stat">
                <div className="ig-stat-val">{displayRows.length}</div>
                <div className="ig-stat-lbl">אנשי קשר</div>
              </div>
              <div className="ig-stat">
                <div className="ig-stat-val">{totalPax}</div>
                <div className="ig-stat-lbl">סה"כ מוזמנים</div>
              </div>
              <div className="ig-stat">
                <div className="ig-stat-val">{groups.length}</div>
                <div className="ig-stat-lbl">קבוצות</div>
              </div>
              {vipCount > 0 && (
                <div className="ig-stat ig-stat--gold">
                  <div className="ig-stat-val">{vipCount}</div>
                  <div className="ig-stat-lbl">VIP</div>
                </div>
              )}
              {elderlyCount > 0 && (
                <div className="ig-stat ig-stat--teal">
                  <div className="ig-stat-val">{elderlyCount}</div>
                  <div className="ig-stat-lbl">נגישות</div>
                </div>
              )}
            </div>

            {/* Group chips */}
            <div className="ig-groups">
              {groups.map(([g, count]) => {
                const c = groupColor(g);
                return (
                  <span key={g} className="ig-group-chip"
                    style={{ background: c.background, color: c.color, borderColor: c.border }}>
                    {g}
                    <span className="ig-group-count">{count}</span>
                  </span>
                );
              })}
            </div>

            {/* Table */}
            <div className="ig-table-wrap">
              <table className="ig-table">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>טלפון</th>
                    <th>קבוצה</th>
                    <th>צד</th>
                    <th>מוזמנים</th>
                    <th>מאפיינים</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.slice(0, 120).map((r, i) => {
                    const gc = groupColor(r.group);
                    return (
                      <tr key={i}>
                        <td className="ig-td-name">
                          {r.name}
                          {r.notes && <span className="ig-note-dot" title={r.notes} />}
                        </td>
                        <td className="ig-td-phone">{r.phone || '—'}</td>
                        <td className="ig-td-group">
                          <select
                            className="ig-group-sel"
                            value={r.group}
                            onChange={e => setGroupEdits(prev => ({ ...prev, [i]: e.target.value }))}
                            style={{ color: gc.color }}
                          >
                            {r.group && !CANONICAL_GROUPS.includes(r.group) && (
                              <option value={r.group}>{r.group}</option>
                            )}
                            {CANONICAL_GROUPS.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>
                        <td className="ig-td-side">
                          {r.side
                            ? <span className="ig-side-badge" style={SIDE_COLORS[r.side] || {}}>{r.side}</span>
                            : <span className="ig-empty">—</span>}
                        </td>
                        <td className="ig-td-pax">{r.guests || 1}</td>
                        <td className="ig-td-tags">
                          {r.vip            && <span className="ig-tag ig-tag--vip">VIP</span>}
                          {r.elderly        && <span className="ig-tag ig-tag--elderly">נגישות</span>}
                          {r.kids > 0       && <span className="ig-tag ig-tag--kids">ילדים</span>}
                          {r.religiousLevel && <span className="ig-tag ig-tag--rel">{r.religiousLevel}</span>}
                          {r.noSitWith      && (
                            <span className="ig-tag ig-tag--conflict" title={`לא ליד: ${r.noSitWith}`}>!</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {displayRows.length > 120 && (
                <div className="ig-table-more">ועוד {displayRows.length - 120} אנשי קשר...</div>
              )}
            </div>

            <div className="ig-preview-actions">
              <button className="ig-btn ig-btn--ghost" onClick={() => setStep('upload')}>
                ← חזרה
              </button>
              <button className="ig-btn ig-btn--primary" onClick={handleConfirm}>
                ייבא {displayRows.length} אנשי קשר
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div className="ig-body ig-body--done">
            <div className="ig-done-ring">
              <div className="ig-done-check">✓</div>
            </div>
            <div className="ig-done-title">ייבוא הושלם בהצלחה</div>
            <div className="ig-done-sub">
              נוספו <strong>{imported}</strong> אנשי קשר לרשימת האורחים.<br />
              כעת ניתן לסדר שולחנות חכם — המערכת תשתמש בכל המידע שייבאת.
            </div>
            <button className="ig-btn ig-btn--primary" onClick={onClose}>
              לרשימת האורחים
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

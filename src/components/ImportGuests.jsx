import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { importGuests } from '../store';

// ── Column name aliases ───────────────────────────────────────────────────────
const FIRST_NAME_KEYS  = ['שם פרטי','פרטי','first name','firstname','first','שם'];
const LAST_NAME_KEYS   = ['שם משפחה','משפחה','last name','lastname','last','family','surname'];
const FULL_NAME_KEYS   = ['שם מלא','שם','name','full name','fullname','contact'];
const PHONE_KEYS       = ['טלפון','נייד','פלאפון','מספר טלפון','phone','mobile','cell','tel'];
const GROUP_KEYS       = ['קבוצה','מחלקה','סוג','group','category','department','type','חבורה'];

function normalize(str) {
  return String(str || '').trim().toLowerCase();
}

function findCol(headers, aliases) {
  for (const alias of aliases) {
    const idx = headers.findIndex(h => normalize(h) === normalize(alias));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseSheet(sheetData, sheetName) {
  if (!sheetData || sheetData.length < 2) return [];
  const [headerRow, ...dataRows] = sheetData;
  const headers = headerRow.map(String);

  const firstIdx  = findCol(headers, FIRST_NAME_KEYS);
  const lastIdx   = findCol(headers, LAST_NAME_KEYS);
  const fullIdx   = findCol(headers, FULL_NAME_KEYS);
  const phoneIdx  = findCol(headers, PHONE_KEYS);
  const groupIdx  = findCol(headers, GROUP_KEYS);

  const rows = [];
  for (const row of dataRows) {
    let name = '';
    if (firstIdx !== -1 && lastIdx !== -1) {
      name = `${row[firstIdx] || ''} ${row[lastIdx] || ''}`.trim();
    } else if (fullIdx !== -1) {
      name = String(row[fullIdx] || '').trim();
    } else if (firstIdx !== -1) {
      name = String(row[firstIdx] || '').trim();
    }
    if (!name) continue;

    const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
    const group = groupIdx !== -1
      ? String(row[groupIdx] || '').trim()
      : sheetName || '';

    rows.push({ name, phone, group });
  }
  return rows;
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const allRows = [];

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          const rows = parseSheet(data, sheetName);
          allRows.push(...rows);
        }
        resolve(allRows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

const GROUP_COLORS = [
  '#e8f4fd','#fef9e7','#eafaf1','#fdf2f8','#f4ecf7',
  '#fef5e4','#eafaf1','#fdedec','#f0f3f4','#e8f8f5',
];
const groupColorMap = {};
let colorIdx = 0;
function groupColor(g) {
  if (!g) return '#f5f5f5';
  if (!groupColorMap[g]) groupColorMap[g] = GROUP_COLORS[colorIdx++ % GROUP_COLORS.length];
  return groupColorMap[g];
}

export default function ImportGuests({ eventId, onDone, onClose }) {
  const [step, setStep]     = useState('upload'); // upload | preview | done
  const [rows, setRows]     = useState([]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const parsed = await parseExcel(file);
      if (parsed.length === 0) {
        setError('לא נמצאו אנשי קשר בקובץ. ודאי שיש עמודות שם + טלפון.');
        setLoading(false);
        return;
      }
      setRows(parsed);
      setStep('preview');
    } catch {
      setError('שגיאה בקריאת הקובץ. ודאי שמדובר בקובץ Excel תקין (.xlsx/.xls).');
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    const count = importGuests(eventId, rows);
    setImported(count);
    setStep('done');
    onDone();
  };

  const groups = [...new Set(rows.map(r => r.group).filter(Boolean))];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box import-modal">
        <div className="modal-header">
          <h2>📥 ייבוא אנשי קשר מאקסל</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {step === 'upload' && (
          <div className="import-upload-step">
            <div
              className={`drop-zone ${loading ? 'loading' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <div className="drop-icon">📊</div>
                  <div className="drop-title">גרור קובץ Excel לכאן</div>
                  <div className="drop-sub">או לחץ לבחירת קובץ</div>
                  <div className="drop-formats">.xlsx · .xls</div>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            {error && <div className="import-error">{error}</div>}

            <div className="import-hint-box">
              <strong>מה הקובץ צריך לכלול?</strong>
              <ul>
                <li>עמודות: <code>שם פרטי</code>, <code>שם משפחה</code>, <code>טלפון</code></li>
                <li>אפשר גם עמודת <code>קבוצה</code> (משפחה, חברים, צבא...)</li>
                <li>כל גיליון (Sheet) יהפוך לקבוצה אוטומטית</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="import-preview-step">
            <div className="preview-summary">
              נמצאו <strong>{rows.length}</strong> אנשי קשר
              {groups.length > 0 && <> ב-<strong>{groups.length}</strong> קבוצות</>}
            </div>

            {groups.length > 0 && (
              <div className="preview-groups">
                {groups.map(g => (
                  <span key={g} className="group-badge" style={{ background: groupColor(g) }}>
                    {g} · {rows.filter(r => r.group === g).length}
                  </span>
                ))}
              </div>
            )}

            <div className="preview-table-wrap">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>טלפון</th>
                    <th>קבוצה</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.phone || '—'}</td>
                      <td>
                        {r.group
                          ? <span className="group-badge" style={{ background: groupColor(r.group) }}>{r.group}</span>
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 50 && (
                <div className="preview-more">ועוד {rows.length - 50} נוספים...</div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setStep('upload')}>← חזרה</button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                ייבא {rows.length} אנשי קשר ←
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="import-done-step">
            <div className="done-icon">✅</div>
            <h3>ייבוא הושלם!</h3>
            <p>נוספו <strong>{imported}</strong> אנשי קשר לרשימת האורחים</p>
            <button className="btn btn-primary" onClick={onClose}>סגור</button>
          </div>
        )}
      </div>
    </div>
  );
}

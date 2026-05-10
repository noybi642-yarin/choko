import { useState } from 'react';
import { getVenueWeddings, updateVenueWedding, getGuests } from '../store';
import {
  ChevronRight, Calendar, Users, Mail, Phone,
  ClipboardList, Layout, MessageSquare, UserCheck, Edit2, Check, X,
} from 'lucide-react';

const STATUS_LABEL = { confirmed:'מאושר', pending:'ממתין', option:'אופציה', cancelled:'בוטל' };
const STATUS_OPTIONS = ['confirmed','pending','option','cancelled'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

// ── Edit field inline ─────────────────────────────────────────────────────────
function EditableField({ label, value, onSave, type = 'text' }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const commit = () => { onSave(val); setEditing(false); };
  const cancel = () => { setVal(value || ''); setEditing(false); };

  return (
    <div className="vw-info-row">
      <div className="vw-info-label">{label}</div>
      {editing ? (
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <input
            style={{
              flex:1, padding:'5px 8px', borderRadius:7, border:'1.5px solid var(--venue-primary)',
              fontSize:13, fontFamily:'Inter,sans-serif', color:'var(--venue-ink)',
            }}
            type={type} value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') cancel(); }}
            autoFocus
          />
          <button onClick={commit} style={{ background:'none', border:'none', cursor:'pointer', color:'#16A34A' }}><Check size={14}/></button>
          <button onClick={cancel} style={{ background:'none', border:'none', cursor:'pointer', color:'#DC2626' }}><X size={14}/></button>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div className="vw-info-value">{value || '—'}</div>
          <button onClick={() => setEditing(true)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--venue-mute)', padding:2 }}>
            <Edit2 size={11}/>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function VenueWedding({ weddingId, venue, navigate }) {
  const allWeddings = getVenueWeddings(venue.id);
  const [wedding, setWedding] = useState(() => allWeddings.find(w => w.id === weddingId) || null);
  const [tab, setTab] = useState('overview');
  const [notes, setNotes] = useState(wedding?.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);

  if (!wedding) {
    return (
      <div className="vw-page">
        <div style={{ textAlign:'center', padding:60, color:'var(--venue-mute)' }}>
          החתונה לא נמצאה
        </div>
      </div>
    );
  }

  const guests = wedding.eventId ? getGuests(wedding.eventId) : [];
  const coming = guests.filter(g => g.status === 'coming').length;
  const pending = guests.filter(g => g.status === 'pending').length;
  const days = daysUntil(wedding.date);

  const updateField = (field, value) => {
    updateVenueWedding(weddingId, { [field]: value });
    setWedding(p => ({ ...p, [field]: value }));
  };

  const saveNotes = () => {
    updateVenueWedding(weddingId, { notes });
    setWedding(p => ({ ...p, notes }));
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const TABS = [
    { id:'overview',  label:'סקירה',   icon:<ClipboardList size={14}/> },
    { id:'guests',    label:'אורחים',  icon:<Users size={14}/> },
    { id:'seating',   label:'הושבה',   icon:<Layout size={14}/> },
    { id:'messages',  label:'הודעות',  icon:<MessageSquare size={14}/> },
  ];

  const FEATURES = [
    {
      icon:  <UserCheck size={20}/>,
      name:  'ניהול אורחים',
      desc:  'רשימת אורחים, אישורי הגעה, ייבוא מ-Excel',
      tab:   'guests',
      page:  wedding.eventId ? { page:'event-detail', eventId:wedding.eventId } : null,
      disabled: !wedding.eventId,
    },
    {
      icon:  <Layout size={20}/>,
      name:  'הושבת מוזמנים',
      desc:  'שיבוץ אורחים חכם לפי קבוצות וקרבה',
      tab:   'seating',
      page:  wedding.eventId ? { page:'seating-plan', eventId:wedding.eventId } : null,
      disabled: !wedding.eventId,
    },
    {
      icon:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
               <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
             </svg>,
      name:  'תוכנית אולם',
      desc:  'עיצוב מפת האולם עם שולחנות ורחבה',
      tab:   'canvas',
      page:  wedding.eventId ? { page:'venue-canvas', eventId:wedding.eventId } : null,
      disabled: !wedding.eventId,
    },
    {
      icon:  <MessageSquare size={20}/>,
      name:  'הודעות WhatsApp',
      desc:  'תזכורות והזמנות אוטומטיות לאורחים',
      tab:   'messages',
      page:  wedding.eventId ? { page:'whatsapp-scheduler', eventId:wedding.eventId } : null,
      disabled: !wedding.eventId,
    },
  ];

  return (
    <div className="vw-page">
      <button className="vw-back" onClick={() => navigate({ page:'venue-dashboard' })}>
        <ChevronRight size={15}/> כל החתונות
      </button>

      {/* Hero */}
      <div className="vw-hero">
        <div className="vw-hero-left">
          <div className="vw-hero-couple">{wedding.coupleNames}</div>
          <div className="vw-hero-meta">
            <div className="vw-hero-meta-item">
              <Calendar size={13}/>
              {formatDate(wedding.date)} · {wedding.time}
              {days !== null && days >= 0 && (
                <span style={{ marginRight: 4, color: days <= 14 ? '#B45309' : 'var(--venue-mute)', fontWeight: days <= 14 ? 700 : 'inherit' }}>
                  · עוד {days} ימים
                </span>
              )}
            </div>
            <span className={`vd-status vd-status--${wedding.status}`}>
              {STATUS_LABEL[wedding.status]}
            </span>
          </div>
        </div>
        <div className="vw-hero-right">
          <select
            value={wedding.status}
            onChange={e => updateField('status', e.target.value)}
            style={{
              padding:'8px 14px', borderRadius:9, border:'1.5px solid rgba(124,58,237,0.2)',
              background:'rgba(124,58,237,0.05)', color:'var(--venue-ink)', fontSize:13,
              fontFamily:'Inter,sans-serif', cursor:'pointer',
            }}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>

      {/* Stats (only if event is linked) */}
      {wedding.eventId && (
        <div className="vw-stats">
          <div className="vw-stat">
            <div className="vw-stat-val">{guests.length}</div>
            <div className="vw-stat-lbl">מוזמנים</div>
          </div>
          <div className="vw-stat">
            <div className="vw-stat-val">{coming}</div>
            <div className="vw-stat-lbl">אישרו</div>
          </div>
          <div className="vw-stat">
            <div className="vw-stat-val">{pending}</div>
            <div className="vw-stat-lbl">ממתינים</div>
          </div>
          <div className="vw-stat">
            <div className="vw-stat-val">
              {guests.length ? Math.round((coming / guests.length) * 100) : 0}%
            </div>
            <div className="vw-stat-lbl">אחוז אישור</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="vw-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`vw-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <>
          <div className="vw-info-grid">
            {/* Wedding details */}
            <div className="vw-info-card">
              <div className="vw-info-card-title">פרטי החתונה</div>
              <EditableField label="שם הכלה"  value={wedding.brideName}  onSave={v => updateField('brideName', v)}/>
              <EditableField label="שם החתן"  value={wedding.groomName}  onSave={v => updateField('groomName', v)}/>
              <EditableField label="תאריך"    value={wedding.date}       onSave={v => updateField('date', v)} type="date"/>
              <EditableField label="שעה"      value={wedding.time}       onSave={v => updateField('time', v)} type="time"/>
              <EditableField label="מוזמנים"  value={String(wedding.guestCount||'')} onSave={v => updateField('guestCount', parseInt(v)||0)} type="number"/>
            </div>

            {/* Contact */}
            <div className="vw-info-card">
              <div className="vw-info-card-title">איש קשר</div>
              <EditableField label="שם"   value={wedding.contactName}  onSave={v => updateField('contactName', v)}/>
              <EditableField label="טלפון" value={wedding.contactPhone} onSave={v => updateField('contactPhone', v)} type="tel"/>
              <EditableField label='דוא"ל' value={wedding.contactEmail} onSave={v => updateField('contactEmail', v)} type="email"/>
            </div>
          </div>

          {/* Notes */}
          <div className="vw-info-card" style={{ marginBottom: 20 }}>
            <div className="vw-info-card-title">הערות</div>
            <textarea
              className="vw-notes-area"
              value={notes}
              onChange={e => { setNotes(e.target.value); setNotesSaved(false); }}
              placeholder="הערות פנימיות על החתונה..."
            />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:10, alignItems:'center' }}>
              {notesSaved && (
                <span style={{ fontSize:11.5, color:'#16A34A', fontWeight:700 }}>נשמר</span>
              )}
              <button className="venue-btn venue-btn--ghost venue-btn--sm" onClick={saveNotes}>
                שמור הערות
              </button>
            </div>
          </div>

          {/* Features */}
          {!wedding.eventId && (
            <div style={{
              background:'rgba(217,119,6,0.07)', border:'1px solid rgba(217,119,6,0.2)',
              borderRadius:12, padding:'14px 18px', marginBottom:16,
              fontSize:13, color:'#92400E', display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ fontSize:16 }}>⚠</span>
              חתונה זו אינה מקושרת לאירוע — יש ליצור אירוע כדי לנהל אורחים והושבה.
            </div>
          )}

          <div className="vw-features">
            {FEATURES.map(f => (
              <div
                key={f.name}
                className={`vw-feature-card${f.disabled?' vw-feature-card--disabled':''}`}
                onClick={() => { if (f.page && !f.disabled) navigate(f.page); }}
              >
                <div className="vw-feature-icon">{f.icon}</div>
                <div className="vw-feature-info">
                  <div className="vw-feature-name">{f.name}</div>
                  <div className="vw-feature-desc">{f.desc}</div>
                </div>
                {!f.disabled && <span className="vw-feature-arrow">←</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Guests tab → navigate to EventDetail */}
      {tab === 'guests' && (
        <div style={{ textAlign:'center', padding:'48px 20px' }}>
          <div style={{ fontSize:40, marginBottom:16, color:'var(--venue-mute)', opacity:0.4 }}>
            <Users size={48} strokeWidth={1}/>
          </div>
          {wedding.eventId ? (
            <>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--venue-ink)', marginBottom:8 }}>
                ניהול אורחים
              </div>
              <div style={{ fontSize:13, color:'var(--venue-mute)', marginBottom:20 }}>
                {guests.length} אורחים · {coming} אישרו · {pending} ממתינים
              </div>
              <button className="venue-btn venue-btn--primary"
                onClick={() => navigate({ page:'event-detail', eventId:wedding.eventId })}>
                פתח ניהול אורחים
              </button>
            </>
          ) : (
            <div style={{ fontSize:13, color:'var(--venue-mute)' }}>
              אין אירוע מקושר לחתונה זו
            </div>
          )}
        </div>
      )}

      {/* Seating tab */}
      {tab === 'seating' && (
        <div style={{ textAlign:'center', padding:'48px 20px' }}>
          <div style={{ fontSize:40, marginBottom:16, color:'var(--venue-mute)', opacity:0.4 }}>
            <Layout size={48} strokeWidth={1}/>
          </div>
          {wedding.eventId ? (
            <>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--venue-ink)', marginBottom:8 }}>הושבת מוזמנים</div>
              <div style={{ fontSize:13, color:'var(--venue-mute)', marginBottom:20 }}>שיבוץ חכם לפי קבוצות וקרבה</div>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button className="venue-btn venue-btn--primary"
                  onClick={() => navigate({ page:'seating-plan', eventId:wedding.eventId })}>
                  הושבת מוזמנים
                </button>
                <button className="venue-btn venue-btn--ghost"
                  onClick={() => navigate({ page:'venue-canvas', eventId:wedding.eventId })}>
                  תוכנית אולם
                </button>
              </div>
            </>
          ) : (
            <div style={{ fontSize:13, color:'var(--venue-mute)' }}>אין אירוע מקושר</div>
          )}
        </div>
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <div style={{ textAlign:'center', padding:'48px 20px' }}>
          <div style={{ marginBottom:16, color:'var(--venue-mute)', display:'flex', justifyContent:'center' }}>
            <MessageSquare size={48} strokeWidth={1}/>
          </div>
          {wedding.eventId ? (
            <>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--venue-ink)', marginBottom:8 }}>הודעות WhatsApp</div>
              <div style={{ fontSize:13, color:'var(--venue-mute)', marginBottom:20 }}>תזכורות והזמנות אוטומטיות</div>
              <button className="venue-btn venue-btn--primary"
                onClick={() => navigate({ page:'whatsapp-scheduler', eventId:wedding.eventId })}>
                פתח מתזמן הודעות
              </button>
            </>
          ) : (
            <div style={{ fontSize:13, color:'var(--venue-mute)' }}>אין אירוע מקושר</div>
          )}
        </div>
      )}
    </div>
  );
}

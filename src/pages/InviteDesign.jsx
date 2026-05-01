import { useState, useRef } from 'react';
import { getEvent } from '../store';
import { TEMPLATES, TemplateThumbnail, renderTemplate } from '../components/InviteTemplates';

const EVENT_TYPE_LABEL = { wedding: 'חתונה', birthday: 'יום הולדת', bar: 'בר/בת מצווה', other: 'אירוע' };

function formatDateHebrew(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Field({ label, name, value, onChange, placeholder, multiline, hint }) {
  return (
    <div className="inv-field">
      <label className="inv-field-label">{label}</label>
      {multiline ? (
        <textarea
          className="inv-field-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className="inv-field-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      {hint && <div className="inv-field-hint">{hint}</div>}
    </div>
  );
}

export default function InviteDesign({ eventId, navigate }) {
  const event = getEvent(eventId);

  const [step, setStep] = useState('pick'); // pick | edit | preview
  const [templateId, setTemplateId] = useState('classic-ivory');
  const [data, setData] = useState(() => ({
    eventType: event ? (EVENT_TYPE_LABEL[event.type] || 'אירוע') : 'אירוע',
    coupleNames: event?.title || '',
    subtitle: event?.type === 'wedding'
      ? 'מזמינים אתכם לחגוג איתנו את שמחת חתונתנו'
      : 'מזמינים אתכם לאירוע המיוחד שלנו',
    date: event ? formatDateHebrew(event.date) : '',
    time: event?.time || '',
    venue: event?.venue || '',
    message: '',
    dresscode: '',
    rsvpDate: '',
  }));
  const previewRef = useRef();

  if (!event) return <div className="page-content"><p>האירוע לא נמצא.</p></div>;

  const handleChange = (e) => {
    setData(d => ({ ...d, [e.target.name]: e.target.value }));
  };

  const handlePrint = () => {
    const content = previewRef.current?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html dir="rtl"><head><meta charset="utf-8">
      <title>הזמנה</title>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;800&display=swap" rel="stylesheet">
      <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#eee;}
      @media print{body{background:white;}}</style>
      </head><body>${content}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'event-detail', eventId })}>← חזרה</button>
          <h1 className="page-title">🎨 עצב הזמנה</h1>
          <p className="page-sub">{event.title}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="inv-steps">
        {[['pick','1','בחר תבנית'],['edit','2','ערוך פרטים'],['preview','3','תצוגה מקדימה']].map(([key,num,label]) => (
          <div
            key={key}
            className={`inv-step ${step === key ? 'active' : ''} ${
              (key === 'edit' && (step === 'edit' || step === 'preview')) ||
              (key === 'preview' && step === 'preview') ? 'done' : ''
            }`}
            onClick={() => (step !== 'pick' || key === 'pick') && setStep(key)}
          >
            <div className="inv-step-num">{num}</div>
            <div className="inv-step-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Step 1: pick template ───────────────────────────────────────────── */}
      {step === 'pick' && (
        <div className="inv-section">
          <div className="template-grid">
            {TEMPLATES.map(t => (
              <TemplateThumbnail
                key={t.id}
                template={t}
                selected={templateId === t.id}
                onClick={() => setTemplateId(t.id)}
              />
            ))}
          </div>
          <div className="inv-footer">
            <button className="btn btn-primary" onClick={() => setStep('edit')}>
              המשך לעריכה ←
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: edit fields ─────────────────────────────────────────────── */}
      {step === 'edit' && (
        <div className="inv-edit-layout">
          <div className="inv-form-col">
            <div className="inv-form-card">
              <h3 className="inv-form-title">פרטי ההזמנה</h3>

              <Field label="סוג האירוע" name="eventType" value={data.eventType} onChange={handleChange}
                placeholder="חתונה / יום הולדת / בר מצווה..." />
              <Field label="שם / שמות" name="coupleNames" value={data.coupleNames} onChange={handleChange}
                placeholder="נוי & ירין" hint="יוצג בכותרת הראשית" />
              <Field label="תת כותרת" name="subtitle" value={data.subtitle} onChange={handleChange}
                placeholder="מזמינים אתכם לחגוג..." multiline />
              <Field label="תאריך" name="date" value={data.date} onChange={handleChange}
                placeholder="15 באוגוסט 2026" />
              <Field label="שעה" name="time" value={data.time} onChange={handleChange}
                placeholder="19:30" />
              <Field label="מקום" name="venue" value={data.venue} onChange={handleChange}
                placeholder="גני התערוכה, תל אביב" />
              <Field label="הודעה אישית" name="message" value={data.message} onChange={handleChange}
                placeholder="נשמח לראותכם!" multiline />
              <Field label="קוד לבוש (אופציונלי)" name="dresscode" value={data.dresscode} onChange={handleChange}
                placeholder="לבוש יום" />
              <Field label="אישור הגעה עד (אופציונלי)" name="rsvpDate" value={data.rsvpDate} onChange={handleChange}
                placeholder="1 באוגוסט 2026" />
            </div>
          </div>

          <div className="inv-preview-col">
            <div className="inv-live-label">תצוגה חיה</div>
            <div className="inv-live-preview">
              {renderTemplate(templateId, data)}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setStep('pick')}>← שנה תבנית</button>
              <button className="btn btn-primary" onClick={() => setStep('preview')}>לתצוגה מלאה ←</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: full preview ────────────────────────────────────────────── */}
      {step === 'preview' && (
        <div className="inv-section">
          <div className="inv-preview-full-wrap">
            <div ref={previewRef} className="inv-preview-full">
              {renderTemplate(templateId, data)}
            </div>
          </div>
          <div className="inv-footer" style={{ gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep('edit')}>← ערוך שוב</button>
            <button className="btn btn-primary" onClick={handlePrint}>🖨️ הדפסה / שמירה כ-PDF</button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            בדפדפנים מודרניים ניתן לבחור "שמור כ-PDF" בתפריט ההדפסה
          </p>
        </div>
      )}
    </div>
  );
}

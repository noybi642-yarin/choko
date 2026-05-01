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
        <textarea className="inv-field-input" name={name} value={value} onChange={onChange}
          placeholder={placeholder} rows={3} />
      ) : (
        <input className="inv-field-input" name={name} value={value} onChange={onChange}
          placeholder={placeholder} />
      )}
      {hint && <div className="inv-field-hint">{hint}</div>}
    </div>
  );
}

function FieldGroup({ title, children }) {
  return (
    <div className="inv-field-group">
      <div className="inv-field-group-title">{title}</div>
      {children}
    </div>
  );
}

export default function InviteDesign({ eventId, navigate }) {
  const event = getEvent(eventId);

  const [step, setStep]         = useState('pick');
  const [templateId, setTemplateId] = useState('wedding-romantic');
  const [data, setData] = useState(() => ({
    eventType:       event ? (EVENT_TYPE_LABEL[event.type] || 'אירוע') : 'אירוע',
    coupleNames:     event?.title || '',
    subtitle:        event?.type === 'wedding'
      ? 'בלב מלא אהבה ובהתרגשות רבה,\nאנו מזמינים אתכם לחגוג עמנו את\nטקס חתונתנו'
      : 'מזמינים אתכם לאירוע המיוחד שלנו',
    hebrewDate:      '',
    date:            event ? formatDateHebrew(event.date) : '',
    receptionTime:   '',
    ceremonyTime:    event?.time || '',
    venue:           event?.venue || '',
    venueAddress:    '',
    groomsParents:   '',
    bridesParents:   '',
    message:         '',
    dresscode:       '',
    rsvpDate:        '',
  }));
  const previewRef = useRef();

  if (!event) return <div className="page-content"><p>האירוע לא נמצא.</p></div>;

  const handleChange = (e) => setData(d => ({ ...d, [e.target.name]: e.target.value }));

  const handlePrint = () => {
    const content = previewRef.current?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html dir="rtl"><head><meta charset="utf-8"><title>הזמנה</title>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@200;300;400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
      <style>*{box-sizing:border-box;}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#e8e8e8;padding:20px;}
      @media print{body{background:white;padding:0;} @page{margin:0;}}</style>
      </head><body>${content}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 700);
  };

  const isWeddingTemplate = ['wedding-romantic','wedding-vintage','wedding-minimal','wedding-garden','wedding-artdeco'].includes(templateId);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'event-detail', eventId })}>← חזרה</button>
          <h1 className="page-title">🎨 עצב הזמנה</h1>
          <p className="page-sub">{event.title}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="inv-steps">
        {[['pick','1','בחר תבנית'],['edit','2','ערוך פרטים'],['preview','3','תצוגה מקדימה']].map(([key,num,label]) => (
          <div key={key}
            className={`inv-step ${step === key ? 'active' : ''} ${
              (key==='edit'&&(step==='edit'||step==='preview'))||(key==='preview'&&step==='preview') ? 'done' : ''
            }`}
            onClick={() => (step !== 'pick' || key === 'pick') && setStep(key)}
          >
            <div className="inv-step-num">{num}</div>
            <div className="inv-step-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 'pick' && (
        <div className="inv-section">
          <div className="template-grid">
            {TEMPLATES.map(t => (
              <TemplateThumbnail key={t.id} template={t} selected={templateId === t.id}
                onClick={() => setTemplateId(t.id)} />
            ))}
          </div>
          <div className="inv-footer">
            <button className="btn btn-primary" onClick={() => setStep('edit')}>המשך לעריכה ←</button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 'edit' && (
        <div className="inv-edit-layout">
          <div className="inv-form-col">
            <div className="inv-form-card">
              <h3 className="inv-form-title">פרטי ההזמנה</h3>

              <FieldGroup title="כללי">
                <Field label="סוג האירוע" name="eventType" value={data.eventType} onChange={handleChange}
                  placeholder="חתונה" />
                <Field label="שמות" name="coupleNames" value={data.coupleNames} onChange={handleChange}
                  placeholder="ירין & עמורה" hint="יוצג גדול במרכז" />
                <Field label="טקסט פתיחה" name="subtitle" value={data.subtitle} onChange={handleChange}
                  placeholder="בלב מלא אהבה..." multiline />
              </FieldGroup>

              <FieldGroup title="תאריך ומקום">
                <Field label="תאריך עברי (אופציונלי)" name="hebrewDate" value={data.hebrewDate} onChange={handleChange}
                  placeholder='יום שני, כ"ג בסיוון תשפ"ו' />
                <Field label="תאריך לועזי" name="date" value={data.date} onChange={handleChange}
                  placeholder="08.06.2026" />
                <Field label="שם המקום" name="venue" value={data.venue} onChange={handleChange}
                  placeholder="COYA אומנות האירוח" />
                <Field label="כתובת" name="venueAddress" value={data.venueAddress} onChange={handleChange}
                  placeholder="הרוקמים 27, חולון" />
              </FieldGroup>

              <FieldGroup title="לוח זמנים">
                <Field label="קבלת פנים" name="receptionTime" value={data.receptionTime} onChange={handleChange}
                  placeholder="19:00" />
                <Field label="חופה וקידושין" name="ceremonyTime" value={data.ceremonyTime} onChange={handleChange}
                  placeholder="20:00" />
              </FieldGroup>

              <FieldGroup title="הורים (אופציונלי)">
                <Field label="הורי החתן" name="groomsParents" value={data.groomsParents} onChange={handleChange}
                  placeholder="רינת ורונן שעשוע" />
                <Field label="הורי הכלה" name="bridesParents" value={data.bridesParents} onChange={handleChange}
                  placeholder="ילנה פסחיה" />
              </FieldGroup>

              <FieldGroup title="נוסף">
                <Field label="קוד לבוש" name="dresscode" value={data.dresscode} onChange={handleChange}
                  placeholder="לבוש יום" />
                <Field label="RSVP עד" name="rsvpDate" value={data.rsvpDate} onChange={handleChange}
                  placeholder="01.06.2026" />
              </FieldGroup>
            </div>
          </div>

          <div className="inv-preview-col">
            <div className="inv-live-label">תצוגה חיה</div>
            <div className="inv-live-preview">{renderTemplate(templateId, data)}</div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="btn btn-ghost" onClick={() => setStep('pick')}>← שנה תבנית</button>
              <button className="btn btn-primary" onClick={() => setStep('preview')}>לתצוגה מלאה ←</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 'preview' && (
        <div className="inv-section">
          <div className="inv-preview-full-wrap">
            <div ref={previewRef} className="inv-preview-full">{renderTemplate(templateId, data)}</div>
          </div>
          <div className="inv-footer" style={{ gap:12 }}>
            <button className="btn btn-ghost" onClick={() => setStep('edit')}>← ערוך שוב</button>
            <button className="btn btn-primary" onClick={handlePrint}>🖨️ הדפסה / שמירה כ-PDF</button>
          </div>
          <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginTop:8 }}>
            בחרו "שמור כ-PDF" בתפריט ההדפסה לקבלת קובץ מוכן לשליחה
          </p>
        </div>
      )}
    </div>
  );
}

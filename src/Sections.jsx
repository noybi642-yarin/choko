import { useState } from 'react';

export function Steps() {
  const steps = [
    { n: '01', icon: '✉️', title: 'יוצרים הזמנה דיגיטלית', desc: 'בוחרים תבנית, מוסיפים תמונה, פרטי האירוע — וההזמנה מוכנה. תוך 3 דקות.', cls: 'alt-1' },
    { n: '02', icon: '📲', title: 'שולחים לאורחים בקליק', desc: 'WhatsApp, SMS או מייל. לכל אורח לינק אישי שמתעדכן בזמן אמת.', cls: 'alt-2' },
    { n: '03', icon: '✨', title: 'עוקבים אחרי האישורים', desc: 'דשבורד חי עם כל מי שאישר, סירב, ואפילו עם דיאטות מיוחדות. בלי אקסלים.', cls: 'alt-3' },
  ];
  return (
    <section className="block steps-block" id="how">
      <div className="container">
        <div className="section-eyebrow">איך זה עובד</div>
        <h2 className="section-title">3 צעדים, <em>אפס</em> כאב ראש</h2>
        <p className="section-sub">אל תרדפו אחרי 200 איש בוואטסאפ. תנו ל-choko לעשות את זה בשבילכם.</p>
        <div className="steps">
          {steps.map(s => (
            <div key={s.n} className={`step ${s.cls}`}>
              <div className="step-icon">{s.icon}</div>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section className="block" id="features">
      <div className="container">
        <div className="section-eyebrow">תכונות</div>
        <h2 className="section-title">כל מה שצריך לאירוע <em>מושלם</em></h2>
        <p className="section-sub">מההזמנה ועד היום שאחרי — choko מלווה אתכם בכל שלב.</p>

        <div className="features">
          <div className="feature feature-1">
            <div>
              <h3>הודעות חכמות לאורחים</h3>
              <p>תזכורות אוטומטיות, ברכות אישיות, ועדכונים בזמן אמת. כל אורח מקבל בדיוק את מה שצריך.</p>
            </div>
            <div className="fv">
              <div className="fv-msg">
                <div className="av">ד</div>
                <div className="body">
                  <div className="name">דנה כהן</div>
                  <div className="txt">הי נוי! אישרתי הגעה ל-3 אנשים 🎉</div>
                </div>
              </div>
              <div className="fv-msg" style={{ marginInlineStart: 24, background: 'oklch(0.94 0.05 35)' }}>
                <div className="av" style={{ background: 'var(--lavender)' }}>ר</div>
                <div className="body">
                  <div className="name">רונן לוי</div>
                  <div className="txt">תודה על התזכורת! מגיע בטח 💃</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature feature-2">
            <div>
              <h3>סטטיסטיקות חיות</h3>
              <p>תראו בכל רגע נתון מי אישר, מי בדרך, ומי עדיין לא ענה.</p>
            </div>
            <div className="fv">
              <div className="fv-stat">
                <div className="fv-stat-cell"><div className="n">186</div><div className="l">אישרו</div></div>
                <div className="fv-stat-cell"><div className="n">42</div><div className="l">אולי</div></div>
                <div className="fv-stat-cell"><div className="n">12</div><div className="l">לא יגיעו</div></div>
              </div>
            </div>
          </div>

          <div className="feature feature-3">
            <div>
              <h3>שיבוץ שולחנות</h3>
              <p>גוררים-משחררים. ככה פשוט.</p>
            </div>
            <div className="fv">
              <div className="fv-chip-row">
                <span className="fv-chip on">שולחן 1</span>
                <span className="fv-chip">משפחה</span>
                <span className="fv-chip">חברים</span>
                <span className="fv-chip on">vip</span>
                <span className="fv-chip">צבא</span>
                <span className="fv-chip">עבודה</span>
              </div>
            </div>
          </div>

          <div className="feature feature-4">
            <div>
              <h3>תזכורות אוטומטיות</h3>
              <p>סופרים אחורה ביחד עם האורחים.</p>
            </div>
            <div className="fv">
              <div className="fv-cal">
                <div className="fv-cal-head">אוגוסט 2026</div>
                <div className="fv-cal-grid">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <i key={i} className={i === 14 ? 'hl' : (i < 3 || i > 22 ? 'dim' : '')}>{(i % 30) + 1}</i>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="feature feature-5">
            <div>
              <h3>אלבום משותף</h3>
              <p>כל התמונות של כולם, במקום אחד.</p>
            </div>
            <div className="fv">
              <div className="fv-photo">[ תמונות מהאירוע ]</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pricing({ onCta }) {
  const tiers = [
    {
      name: 'אירוע אינטימי',
      price: '360',
      per: '₪ לאירוע',
      desc: 'מושלם לחתונות בוטיק, ימי הולדת ואירועים משפחתיים.',
      feats: ['עד 200 מוזמנים', 'הזמנה דיגיטלית מעוצבת', 'אישורי הגעה ללא הגבלה', 'תזכורות אוטומטיות', 'דשבורד מלא'],
      cta: 'בחירת חבילה',
    },
    {
      name: 'אירוע סטנדרטי',
      price: '680',
      per: '₪ לאירוע',
      desc: 'הכי פופולרי. כל מה שצריך לחתונה או בר מצווה רגילים.',
      feats: ['עד 400 מוזמנים', 'כל מה שיש בקטן', 'שיבוץ שולחנות', 'אלבום משותף', 'הודעות מותאמות אישית', 'תמיכת WhatsApp'],
      cta: 'בואו נחגוג',
      featured: true,
    },
    {
      name: 'אירוע גדול',
      price: '1700',
      per: '₪ לאירוע',
      desc: 'לחתונות גדולות ואירועים מרובי משתתפים.',
      feats: ['עד 1,000 מוזמנים', 'כל מה שיש בסטנדרטי', 'דף אירוע מלא', 'הזמנת וידאו מותאמת', 'מנהל אירוע אישי', 'עדיפות בתמיכה'],
      cta: 'יצירת אירוע',
    },
    {
      name: 'חבילה אישית',
      price: 'לפי דרישה',
      per: '',
      desc: 'מעל 1,000 מוזמנים? אירוע מורכב? בנו איתנו חבילה בהתאמה אישית.',
      feats: ['מוזמנים ללא הגבלה', 'אינטגרציות מותאמות', 'מיתוג אישי מלא', 'מנהל פרויקט ייעודי', 'הסכם SLA', 'הדרכה אישית'],
      cta: 'דברו איתנו',
      custom: true,
    },
  ];
  return (
    <section className="block pricing-block" id="pricing">
      <div className="container">
        <div className="section-eyebrow">תמחור</div>
        <h2 className="section-title">מחירים <em>הוגנים</em>. בלי הפתעות.</h2>
        <p className="section-sub">משלמים פעם אחת לכל אירוע. ללא מנויים, ללא דמי שימוש סמויים.</p>
        <div className="prices">
          {tiers.map(t => (
            <div key={t.name} className={`price ${t.featured ? 'featured' : ''} ${t.custom ? 'custom' : ''}`}>
              {t.featured && <div className="price-tag">הכי פופולרי</div>}
              <div className="price-name">{t.name}</div>
              <div className="price-amount">
                <span className={`num ${t.custom ? 'lg' : ''}`}>{t.price}</span>
                {t.per && <span className="per">{t.per}</span>}
              </div>
              <div className="price-desc">{t.desc}</div>
              <ul className="price-feat">
                {t.feats.map(f => <li key={f}>{f}</li>)}
              </ul>
              <a href="#/login" className="price-cta" style={{display:'block',textAlign:'center',textDecoration:'none'}}>{t.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterCTA({ onCta }) {
  const [email, setEmail] = useState('');
  return (
    <>
      <section className="cta-block" id="signup">
        <div className="cta-card">
          <h2>מוכנים להפוך את האירוע <em>שלכם</em><br />לכזה שלא שוכחים?</h2>
          <p>הירשמו עכשיו וצרו את ההזמנה הראשונה שלכם בחינם. בלי אשראי, בלי התחייבות.</p>
          <form className="cta-form" onSubmit={(e) => { e.preventDefault(); window.location.hash = '/login'; }}>
            <input type="email" placeholder="האימייל שלך" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit">בואו נתחיל →</button>
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-links">
          <a href="#">תנאי שימוש</a>
          <a href="#">פרטיות</a>
          <a href="#">תמיכה</a>
          <a href="#">בלוג</a>
          <a href="#">קריירה</a>
        </div>
        <div>© 2026 choko. עשוי באהבה בתל אביב 🧡</div>
      </footer>
    </>
  );
}

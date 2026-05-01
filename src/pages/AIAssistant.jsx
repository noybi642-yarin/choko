import { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `אתה "חברי הטוב AI" — עוזר אישי לזוגות שמתכננים אירועים (חתונות, בר מצוות, ימי הולדת ועוד).
אתה ידידותי, חם, ומבין את הלחץ של תכנון אירוע. אתה עוזר בכל הקשור להזמנות:
- ניסוח טקסט להזמנות (עברית, אנגלית, שתי שפות)
- בחירת ניסוח מתאים לאופי האירוע (רשמי / קז'ואל / שובב)
- פרטים חשובים שלא לשכוח בהזמנה (תאריך, שעה, מקום, RSVP עד תאריך, קוד לבוש)
- עצות על עיצוב ועיתוי שליחת ההזמנות
- תשובות לשאלות נפוצות על ניהול אורחים

ענה תמיד בעברית, בסגנון חברותי ותומך.`;

const STARTERS = [
  'עזור לי לכתוב טקסט להזמנת חתונה',
  'מה חשוב לכלול בהזמנה?',
  'כמה זמן מראש לשלוח הזמנות?',
  'כתוב לי הזמנה לבר מצווה',
  'ניסוח קז\'ואל ליום הולדת 30',
];

function Message({ msg }) {
  return (
    <div className={`ai-message ${msg.role}`}>
      {msg.role === 'assistant' && (
        <div className="ai-avatar">✨</div>
      )}
      <div className="ai-bubble">
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
        ))}
      </div>
      {msg.role === 'user' && (
        <div className="ai-avatar user-avatar">👤</div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="ai-message assistant">
      <div className="ai-avatar">✨</div>
      <div className="ai-bubble typing-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

export default function AIAssistant({ navigate }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'שלום! אני חברי הטוב AI 👋\nאני כאן לעזור לך להכין את ההזמנות המושלמות לאירוע שלך.\nעם מה אוכל לעזור לך היום?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__ANTHROPIC_KEY__ || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'מצטערת, משהו השתבש. נסי שוב!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'אוי, נראה שיש בעיית חיבור 😅\nוודאי שיש חיבור לאינטרנט ונסי שוב.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="page-content ai-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'dashboard' })}>← חזרה</button>
          <h1 className="page-title">✨ חברי הטוב AI</h1>
          <p className="page-sub">עוזר אישי לתכנון הזמנות האירוע שלך</p>
        </div>
      </div>

      <div className="ai-chat-wrap">
        <div className="ai-messages">
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="ai-starters">
            {STARTERS.map((s, i) => (
              <button key={i} className="ai-starter-btn" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form className="ai-input-row" onSubmit={e => { e.preventDefault(); send(); }}>
          <textarea
            className="ai-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="שאל/י אותי הכל על ההזמנות שלך..."
            rows={1}
            disabled={loading}
          />
          <button type="submit" className="ai-send-btn" disabled={loading || !input.trim()}>
            {loading ? <span className="spinner"></span> : '↑'}
          </button>
        </form>
        <p className="ai-hint">Enter לשליחה · Shift+Enter לשורה חדשה</p>
      </div>
    </div>
  );
}

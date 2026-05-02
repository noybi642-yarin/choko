import { useState, useRef, useEffect, useCallback } from 'react';

// Stable session ID for the lifetime of this page mount
function makeSessionId() {
  return 'sess_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

const SESSION_ID = makeSessionId();

const STARTERS = [
  'איך מוסיפים אורחים מאקסל?',
  'מה המחיר לחתונה של 300 אנשים?',
  'איך שולחים תזכורת לאורחים שלא ענו?',
  'אחרי כמה זמן נמחקים הנתונים שלי?',
  'האורח לא קיבל את הקישור — מה לעשות?',
  'איך מארגנים אורחים בקבוצות?',
];

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`support-msg ${isUser ? 'support-msg--user' : 'support-msg--ai'}`}>
      {!isUser && <div className="support-avatar">✨</div>}
      <div className={`support-bubble ${isUser ? 'support-bubble--user' : 'support-bubble--ai'}`}>
        {msg.streaming && msg.content === '' ? (
          <span className="support-typing">
            <span /><span /><span />
          </span>
        ) : (
          msg.content.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))
        )}
        {msg.streaming && msg.content !== '' && (
          <span className="support-cursor" />
        )}
      </div>
      {isUser && <div className="support-avatar support-avatar--user">👤</div>}
    </div>
  );
}

function TicketPrompt({ onOpen, onDismiss }) {
  return (
    <div className="support-ticket-prompt">
      <p>רוצה שאפתח פניה לצוות התמיכה?</p>
      <div className="support-ticket-btns">
        <button className="btn btn-primary btn-sm" onClick={onOpen}>כן, פתח פניה</button>
        <button className="btn btn-ghost btn-sm" onClick={onDismiss}>לא תודה</button>
      </div>
    </div>
  );
}

export default function AIAssistant({ navigate }) {
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      content:
        'שלום! אני חברי הטוב AI 👋\n' +
        'אני כאן לענות על שאלות לגבי שימוש ב-choko.\n' +
        'במה אוכל לעזור לך?',
      streaming: false,
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [error, setError]       = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const abortRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg) =>
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);

  const updateLast = (patch) =>
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
      return copy;
    });

  const send = useCallback(
    async (text) => {
      const userText = (text || input).trim();
      if (!userText || loading) return;
      setInput('');
      setError(null);
      setShowTicket(false);

      // Add user turn
      const userMsg = { role: 'user', content: userText, streaming: false };
      setMessages((prev) => [...prev, { id: Date.now(), ...userMsg }]);

      // Placeholder AI turn
      const aiPlaceholder = { role: 'assistant', content: '', streaming: true };
      setMessages((prev) => [...prev, { id: Date.now() + 1, ...aiPlaceholder }]);
      setLoading(true);

      // Build history for the request (exclude the placeholder)
      const history = [
        ...messages.filter((m) => !m.streaming),
        userMsg,
      ].map(({ role, content }) => ({ role, content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ messages: history, sessionId: SESSION_ID }),
        });

        if (res.status === 429) {
          updateLast({
            content: 'הגעת למגבלת הבקשות. המתן 15 דקות ונסה שוב.',
            streaming: false,
          });
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Parse SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split('\n');
          buf = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            let evt;
            try { evt = JSON.parse(line.slice(6)); } catch { continue; }

            if (evt.type === 'text') {
              fullText += evt.text;
              updateLast({ content: fullText, streaming: true });
            } else if (evt.type === 'done') {
              updateLast({ streaming: false });
              // Show ticket prompt if escalation detected
              const escalated =
                fullText.includes('לא בטוח') ||
                fullText.includes('פניה לתמיכה') ||
                fullText.includes('לא יודע');
              if (escalated) setShowTicket(true);
            } else if (evt.type === 'error') {
              updateLast({ content: evt.message, streaming: false });
              setError(evt.message);
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          updateLast({ content: 'הבקשה בוטלה.', streaming: false });
        } else {
          console.error('[support chat]', err);
          updateLast({
            content: 'אירעה שגיאת חיבור. בדוק את חיבור האינטרנט ונסה שוב.',
            streaming: false,
          });
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [input, loading, messages]
  );

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleOpenTicket = () => {
    setShowTicket(false);
    addMessage({
      role: 'assistant',
      content:
        'אשמח לעזור לפתוח פניה לצוות התמיכה. ' +
        'ספר לי בקצרה מה הבעיה ונעביר אותה הלאה עם כל הפרטים הרלוונטיים.',
      streaming: false,
    });
  };

  const showStarters = messages.length === 1 && !loading;

  return (
    <div className="page-content ai-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate({ page: 'dashboard' })}>
            ← חזרה
          </button>
          <h1 className="page-title">✨ חברי הטוב AI</h1>
          <p className="page-sub">תמיכה חכמה — מבוסס על בסיס ידע רשמי של choko</p>
        </div>
      </div>

      <div className="support-chat-wrap">
        {/* Messages */}
        <div className="support-messages">
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}

          {/* Escalation prompt */}
          {showTicket && (
            <TicketPrompt
              onOpen={handleOpenTicket}
              onDismiss={() => setShowTicket(false)}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Starter chips */}
        {showStarters && (
          <div className="support-starters">
            {STARTERS.map((s) => (
              <button key={s} className="support-starter" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="support-error">⚠️ {error}</div>
        )}

        {/* Input row */}
        <form
          className="support-input-row"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <textarea
            ref={inputRef}
            className="support-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="שאל/י שאלה על שימוש ב-choko..."
            rows={1}
            disabled={loading}
          />
          {loading ? (
            <button type="button" className="support-send-btn stop" onClick={handleStop}>
              ■
            </button>
          ) : (
            <button
              type="submit"
              className="support-send-btn"
              disabled={!input.trim()}
            >
              ↑
            </button>
          )}
        </form>
        <p className="support-hint">
          Enter לשליחה · Shift+Enter לשורה חדשה · מבוסס על בסיס ידע רשמי בלבד
        </p>
      </div>
    </div>
  );
}

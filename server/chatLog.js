/**
 * Chat log writer — stores minimal data for support review.
 * What IS stored: session ID (random), timestamp, topic hint, was_answered flag, turn count.
 * What is NOT stored: actual question text, IP address, user email, personal data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Guess a topic from the assistant's reply for log categorization.
 * Never reads the user's message — only the AI reply.
 */
function detectTopicHint(assistantReply) {
  const r = assistantReply.toLowerCase();
  if (r.includes('אקסל') || r.includes('ייבוא')) return 'import';
  if (r.includes('תשלום') || r.includes('מחיר') || r.includes('חבילה')) return 'pricing';
  if (r.includes('פרטיות') || r.includes('מחיקה') || r.includes('gdpr')) return 'privacy';
  if (r.includes('whatsapp') || r.includes('וואטסאפ') || r.includes('הודעה')) return 'messaging';
  if (r.includes('קבוצה') || r.includes('סינון')) return 'groups';
  if (r.includes('אירוע') && r.includes('יצירת')) return 'event_creation';
  if (r.includes('אישור הגעה') || r.includes('rsvp') || r.includes('סטטוס')) return 'rsvp';
  if (r.includes('בעיה') || r.includes('שגיאה') || r.includes('לא עובד')) return 'troubleshooting';
  if (r.includes('לא בטוח') || r.includes('פניה לתמיכה') || r.includes('לא יודע')) return 'escalated';
  return 'general';
}

/**
 * Write one chat turn to the daily log file.
 * @param {{sessionId: string, turnIndex: number, answered: boolean, assistantReply: string}} entry
 */
export function logChatTurn({ sessionId, turnIndex, answered, assistantReply }) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logFile = path.join(LOG_DIR, `${today}.jsonl`);

  const record = {
    ts: new Date().toISOString(),
    sessionId,          // random UUID per session — not linked to any user
    turn: turnIndex,
    topic: detectTopicHint(assistantReply),
    answered,           // false = escalated to support ticket
  };

  fs.appendFileSync(logFile, JSON.stringify(record) + '\n');
}

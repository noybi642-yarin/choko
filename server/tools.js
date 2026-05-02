/**
 * Tool stubs — ready to wire up real implementations.
 * The AI support agent currently does NOT call these automatically.
 * They are registered so Claude knows they exist but the system prompt
 * instructs it to confirm with the user before any sensitive action.
 *
 * To activate a tool: implement its handler in executeTool() below.
 */

export const SUPPORT_TOOLS = [
  {
    name: 'get_event_status',
    description:
      'מחזיר סטטוס כללי של אירוע: כמה אורחים, כמה אישרו, כמה ממתינים. ' +
      'השתמש רק כשהמשתמש מבקש מידע על האירוע שלו ומזהה את שם האירוע.',
    input_schema: {
      type: 'object',
      properties: {
        event_name: {
          type: 'string',
          description: 'שם האירוע כפי שמופיע במערכת',
        },
      },
      required: ['event_name'],
    },
  },
  {
    name: 'get_guest_count',
    description:
      'מחזיר את מספר האורחים ברשימה, מחולק לפי סטטוס (אישרו / לא מגיעים / ממתינים). ' +
      'השתמש כשהמשתמש שואל כמה אורחים יש לו.',
    input_schema: {
      type: 'object',
      properties: {
        event_id: {
          type: 'string',
          description: 'מזהה האירוע',
        },
        group_filter: {
          type: 'string',
          description: 'סינון לפי קבוצה — אופציונלי',
        },
      },
      required: ['event_id'],
    },
  },
  {
    name: 'open_support_ticket',
    description:
      'פותח פניה לתמיכה הטכנית של choko. ' +
      'השתמש רק אחרי שהמשתמש ביקש במפורש לפתוח פניה ואישר את הפרטים.',
    input_schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'נושא הפניה',
        },
        description: {
          type: 'string',
          description: 'תיאור הבעיה בלשון המשתמש',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'עדיפות: low / medium / high',
        },
      },
      required: ['subject', 'description'],
    },
  },
  {
    name: 'check_payment_status',
    description:
      'בודק סטטוס התשלום של חשבון המשתמש. ' +
      'השתמש רק כשהמשתמש שואל על תשלום ספציפי שלו.',
    input_schema: {
      type: 'object',
      properties: {
        account_email: {
          type: 'string',
          description: 'כתובת האימייל של החשבון',
        },
      },
      required: ['account_email'],
    },
  },
  {
    name: 'resend_invitation',
    description:
      'שולח מחדש את קישור ההזמנה לאורח ספציפי. ' +
      'השתמש רק אחרי שהמשתמש אישר את שם האורח ומספר הטלפון ואישר את השליחה.',
    input_schema: {
      type: 'object',
      properties: {
        guest_name: {
          type: 'string',
          description: 'שם האורח',
        },
        guest_phone: {
          type: 'string',
          description: 'מספר טלפון האורח',
        },
        event_id: {
          type: 'string',
          description: 'מזהה האירוע',
        },
      },
      required: ['guest_name', 'guest_phone', 'event_id'],
    },
  },
];

/**
 * Execute a tool call from the AI.
 * Returns a string result to send back to Claude.
 * @param {string} toolName
 * @param {object} toolInput
 * @returns {Promise<string>}
 */
export async function executeTool(toolName, toolInput) {
  // TODO: implement real tool handlers by connecting to your DB / services
  switch (toolName) {
    case 'get_event_status':
      return JSON.stringify({
        error: 'stub',
        message: 'כלי זה עדיין לא מחובר לבסיס הנתונים האמיתי.',
      });

    case 'get_guest_count':
      return JSON.stringify({
        error: 'stub',
        message: 'כלי זה עדיין לא מחובר לבסיס הנתונים האמיתי.',
      });

    case 'open_support_ticket':
      return JSON.stringify({
        success: false,
        message: 'פתיחת פניות לתמיכה טרם הופעלה. אנא פנו ישירות לתמיכה.',
      });

    case 'check_payment_status':
      return JSON.stringify({
        error: 'stub',
        message: 'בדיקת סטטוס תשלום טרם מחוברת.',
      });

    case 'resend_invitation':
      return JSON.stringify({
        error: 'stub',
        message: 'שליחה מחדש טרם הופעלה. פנו לתמיכה לסיוע.',
      });

    default:
      return JSON.stringify({ error: `כלי לא מוכר: ${toolName}` });
  }
}

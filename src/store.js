const KEY = 'choko_demo_v1';

const DEMO_USER = { email: 'noybi642@gmail.com', name: 'נוי', password: 'demo123' };

const DEMO_EVENT = {
  id: 'evt-demo',
  userId: 'noybi642@gmail.com',
  type: 'wedding',
  title: 'חתונת נוי & ירין',
  coupleName: 'נוי & ירין',
  date: '2026-08-15',
  time: '19:30',
  venue: 'גני התערוכה, תל אביב',
  createdAt: Date.now(),
};

const DEMO_GUESTS = [
  { id: 'g1',  eventId: 'evt-demo', name: 'דנה כהן',      phone: '050-1234567', status: 'coming',  guests: 2 },
  { id: 'g2',  eventId: 'evt-demo', name: 'רונן לוי',      phone: '052-2345678', status: 'coming',  guests: 1 },
  { id: 'g3',  eventId: 'evt-demo', name: 'מיכל אברהם',    phone: '054-3456789', status: 'maybe',   guests: 2 },
  { id: 'g4',  eventId: 'evt-demo', name: 'יוסי ביטון',    phone: '058-4567890', status: 'no',      guests: 0 },
  { id: 'g5',  eventId: 'evt-demo', name: 'שרה גולדברג',   phone: '050-5678901', status: 'coming',  guests: 3 },
  { id: 'g6',  eventId: 'evt-demo', name: 'אבי מזרחי',     phone: '052-6789012', status: 'pending', guests: 0 },
  { id: 'g7',  eventId: 'evt-demo', name: 'רחל פרץ',       phone: '054-7890123', status: 'pending', guests: 0 },
  { id: 'g8',  eventId: 'evt-demo', name: 'משה קץ',        phone: '058-8901234', status: 'coming',  guests: 4 },
  { id: 'g9',  eventId: 'evt-demo', name: 'לאה שמש',       phone: '050-9012345', status: 'pending', guests: 0 },
  { id: 'g10', eventId: 'evt-demo', name: 'ניר דוד',       phone: '052-0123456', status: 'maybe',   guests: 1 },
  { id: 'g11', eventId: 'evt-demo', name: 'תמר הלוי',      phone: '054-1234560', status: 'coming',  guests: 2 },
  { id: 'g12', eventId: 'evt-demo', name: 'גיל ברק',       phone: '058-2345601', status: 'pending', guests: 0 },
];

function getStore() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

function setStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function initStore() {
  const s = getStore();
  if (!s.initialized) {
    setStore({ initialized: true, session: null, events: [DEMO_EVENT], guests: DEMO_GUESTS });
  }
}

export function resetStore() {
  localStorage.removeItem(KEY);
  initStore();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function login(email, password) {
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const s = getStore();
    setStore({ ...s, session: DEMO_USER });
    return DEMO_USER;
  }
  return null;
}

export function logout() {
  const s = getStore();
  setStore({ ...s, session: null });
}

export function getSession() {
  return getStore().session || null;
}

// ── Events ────────────────────────────────────────────────────────────────────

export function getEvents(userId) {
  return (getStore().events || []).filter(e => e.userId === userId);
}

export function getEvent(id) {
  return (getStore().events || []).find(e => e.id === id) || null;
}

export function createEvent(data, userId) {
  const s = getStore();
  const event = { ...data, id: 'evt-' + Date.now(), userId, createdAt: Date.now() };
  setStore({ ...s, events: [...(s.events || []), event] });
  return event;
}

export function updateEvent(id, updates) {
  const s = getStore();
  setStore({
    ...s,
    events: (s.events || []).map(e => e.id === id ? { ...e, ...updates } : e),
  });
}

// ── Message Templates ──────────────────────────────────────────────────────

export const MESSAGE_TEMPLATES = [
  {
    id: 'tpl-invite',
    name: 'הזמנה ראשונה',
    category: 'invitation',
    emoji: '💍',
    message: 'היי {{firstName}} 💍\n\nאנחנו שמחים להזמין אותך לחתונה שלנו!\n\n📅 {{eventDate}}\n📍 {{venueName}}\n\nאשר/י הגעה כאן:\n{{rsvpLink}}\n\nמחכים לחגוג איתך,\n{{coupleNames}}',
  },
  {
    id: 'tpl-reminder-soft',
    name: 'תזכורת עדינה',
    category: 'reminder',
    emoji: '🔔',
    message: 'היי {{firstName}},\n\nרק רצינו להזכיר – האירוע שלנו מתקרב! 😊\n\nעדיין לא אישרת/ת הגעה?\nנשמח לדעת:\n{{rsvpLink}}\n\nתודה,\n{{coupleNames}}',
  },
  {
    id: 'tpl-reminder-last',
    name: 'תזכורת אחרונה',
    category: 'reminder',
    emoji: '⏰',
    message: 'היי {{firstName}},\n\nנותרו עוד כמה ימים! 🎉\n\nזו ההזדמנות האחרונה לאשר הגעה:\n{{rsvpLink}}\n\nמחכים לראותך!\n{{coupleNames}}',
  },
  {
    id: 'tpl-day-of',
    name: 'הודעת יום האירוע',
    category: 'day-of',
    emoji: '🎊',
    message: 'היי {{firstName}} 🎊\n\nהיום זה קורה! מחכים לראותך הערב.\n\n📍 {{venueName}}\n\nנתראה!\n{{coupleNames}}',
  },
  {
    id: 'tpl-thank-you',
    name: 'הודעת תודה אחרי אישור',
    category: 'thank-you',
    emoji: '🙏',
    message: 'היי {{firstName}} 🙏\n\nתודה שאישרת/ת הגעה!\nאנחנו כל כך שמחים שתגיע/י.\n\nנתראה ב{{eventDate}} ב{{venueName}}!\n\nאוהבים,\n{{coupleNames}}',
  },
];

// ── Campaigns ─────────────────────────────────────────────────────────────

export function getCampaigns(eventId) {
  return (getStore().campaigns || []).filter(c => c.eventId === eventId);
}

export function createCampaign(data) {
  const s = getStore();
  const campaign = {
    ...data,
    id: 'camp-' + Date.now(),
    status: 'scheduled',
    stats: { total: 0, sent: 0, delivered: 0, replied: 0, converted: 0, failed: 0 },
    createdAt: Date.now(),
  };
  setStore({ ...s, campaigns: [...(s.campaigns || []), campaign] });
  return campaign;
}

export function updateCampaign(id, updates) {
  const s = getStore();
  setStore({
    ...s,
    campaigns: (s.campaigns || []).map(c => c.id === id ? { ...c, ...updates } : c),
  });
}

export function deleteCampaign(id) {
  const s = getStore();
  setStore({ ...s, campaigns: (s.campaigns || []).filter(c => c.id !== id) });
}

export function mockSendCampaign(id, guestCount) {
  const s = getStore();
  setStore({
    ...s,
    campaigns: (s.campaigns || []).map(c =>
      c.id === id
        ? { ...c, status: 'sent', sentAt: Date.now(), stats: { total: guestCount, sent: guestCount, delivered: Math.round(guestCount * 0.97), replied: Math.round(guestCount * 0.62), converted: Math.round(guestCount * 0.54), failed: Math.round(guestCount * 0.03) } }
        : c
    ),
  });
}

export function deleteEvent(id) {
  const s = getStore();
  setStore({
    ...s,
    events: (s.events || []).filter(e => e.id !== id),
    guests: (s.guests || []).filter(g => g.eventId !== id),
  });
}

// ── Guests ────────────────────────────────────────────────────────────────────

export function getGuests(eventId) {
  return (getStore().guests || []).filter(g => g.eventId === eventId);
}

export function addGuest(eventId, name, phone, group = '') {
  const s = getStore();
  const guest = { id: 'g-' + Date.now(), eventId, name, phone, group, status: 'pending', guests: 0 };
  setStore({ ...s, guests: [...(s.guests || []), guest] });
  return guest;
}

export function importGuests(eventId, rows) {
  // rows: [{ name, phone, group }]
  const s = getStore();
  const now = Date.now();
  const newGuests = rows.map((r, i) => ({
    id: 'g-' + (now + i),
    eventId,
    name: r.name,
    phone: r.phone || '',
    group: r.group || '',
    status: 'pending',
    guests: 0,
  }));
  setStore({ ...s, guests: [...(s.guests || []), ...newGuests] });
  return newGuests.length;
}

export function updateGuestStatus(guestId, status, guestCount) {
  const s = getStore();
  setStore({
    ...s,
    guests: (s.guests || []).map(g =>
      g.id === guestId ? { ...g, status, guests: guestCount ?? g.guests } : g
    ),
  });
}

export function deleteGuest(guestId) {
  const s = getStore();
  setStore({ ...s, guests: (s.guests || []).filter(g => g.id !== guestId) });
}

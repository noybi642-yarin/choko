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

export function addGuest(eventId, name, phone) {
  const s = getStore();
  const guest = { id: 'g-' + Date.now(), eventId, name, phone, status: 'pending', guests: 0 };
  setStore({ ...s, guests: [...(s.guests || []), guest] });
  return guest;
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

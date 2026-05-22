import { useState, useMemo } from 'react';
import {
  Users, Calendar, Phone, MessageCircle, FileText, CheckCircle, Clock,
  Plus, X, Search, Zap, Bell, Star, Sparkles, CreditCard, MoreHorizontal,
  TrendingUp, AlertTriangle, Activity, Check, Mail, ChevronRight, Filter,
  Eye, Edit3, Grip, Hash, Flame, ArrowLeft
} from 'lucide-react';

/* ─────────────────────── STAGES ─────────────────────── */
const STAGES = [
  { key: 'lead',        label: 'ליד',          color: '#64748B', bg: 'rgba(100,116,139,0.09)', border: 'rgba(100,116,139,0.22)' },
  { key: 'meeting',     label: 'פגישה',         color: '#3B82F6', bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.22)'  },
  { key: 'proposal',    label: 'הצעת מחיר',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.22)'  },
  { key: 'contract',    label: 'חוזה',          color: '#F59E0B', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.22)'  },
  { key: 'signed',      label: 'חתימה',         color: '#10B981', bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.22)'  },
  { key: 'advance',     label: 'מקדמה',         color: '#059669', bg: 'rgba(5,150,105,0.07)',   border: 'rgba(5,150,105,0.22)'   },
  { key: 'preparation', label: 'הכנות לאירוע', color: '#0891B2', bg: 'rgba(8,145,178,0.07)',   border: 'rgba(8,145,178,0.22)'   },
  { key: 'rsvp',        label: 'RSVP',          color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',  border: 'rgba(124,58,237,0.22)'  },
  { key: 'seating',     label: 'הושבה',         color: '#4F46E5', bg: 'rgba(79,70,229,0.07)',   border: 'rgba(79,70,229,0.22)'   },
  { key: 'live',        label: 'Live Venue',    color: '#EF4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.22)'   },
  { key: 'closed',      label: 'סגירת אירוע',  color: '#6B7280', bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.22)' },
];

/* ─────────────────────── HELPERS ─────────────────────── */
function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(d, mode = 'long') {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (mode === 'short') {
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function getStage(key) {
  return STAGES.find(s => s.key === key) || STAGES[0];
}

/* ─────────────────────── MOCK DATA ─────────────────────── */
const MOCK_CLIENTS = [
  {
    id: 'c01',
    coupleNames: 'שירה & דניאל',
    brideName: 'שירה',
    groomName: 'דניאל',
    phone: '054-1234567',
    email: 'shira.daniel@gmail.com',
    eventDate: '2026-11-14',
    guestEstimate: 250,
    stage: 'lead',
    urgency: 'attention',
    nextAction: 'תאם פגישה',
    advance: { paid: 0, total: 25000, status: 'none' },
    leadSource: 'המלצה',
    notes: 'מחפשים אולם יוקרתי עם גינה',
    createdAt: '2026-05-20',
    tasks: [
      { id: 't1', text: 'שלח מייל היכרות', done: true },
      { id: 't2', text: 'תאם פגישה ראשונה', done: false },
      { id: 't3', text: 'שלח בריף מחירים', done: false },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-05-20', done: true, type: 'lead' },
    ],
    activity: [
      { id: 'a1', text: 'ליד נכנס דרך המלצה', time: 'לפני יומיים' },
      { id: 'a2', text: 'נשלח מייל היכרות', time: 'אתמול' },
    ],
  },
  {
    id: 'c02',
    coupleNames: 'מיכל & אורן',
    brideName: 'מיכל',
    groomName: 'אורן',
    phone: '052-9876543',
    email: 'michal.oren@gmail.com',
    eventDate: '2026-12-05',
    guestEstimate: 180,
    stage: 'lead',
    urgency: 'ok',
    nextAction: 'מעקב טלפוני',
    advance: { paid: 0, total: 20000, status: 'none' },
    leadSource: 'אתר',
    notes: 'אירוע קטן ואינטימי',
    createdAt: '2026-05-18',
    tasks: [
      { id: 't1', text: 'שיחת מעקב', done: false },
      { id: 't2', text: 'שלח קטלוג', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס מהאתר', date: '2026-05-18', done: true, type: 'lead' },
    ],
    activity: [
      { id: 'a1', text: 'מילא טופס צור קשר', time: 'לפני 4 ימים' },
      { id: 'a2', text: 'נשלח קטלוג', time: 'לפני 3 ימים' },
    ],
  },
  {
    id: 'c03',
    coupleNames: 'טל & עמית',
    brideName: 'טל',
    groomName: 'עמית',
    phone: '050-3334444',
    email: 'tal.amit@gmail.com',
    eventDate: '2027-01-23',
    guestEstimate: 300,
    stage: 'lead',
    urgency: null,
    nextAction: 'תאם פגישה',
    advance: { paid: 0, total: 30000, status: 'none' },
    leadSource: 'גוגל',
    notes: 'חיפוש ראשוני, עוד לא בשל',
    createdAt: '2026-05-15',
    tasks: [
      { id: 't1', text: 'בדוק זמינות תאריך', done: false },
      { id: 't2', text: 'שלח חוברת', done: false },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס מגוגל', date: '2026-05-15', done: true, type: 'lead' },
    ],
    activity: [
      { id: 'a1', text: 'חיפש באתר', time: 'לפני שבוע' },
    ],
  },
  {
    id: 'c04',
    coupleNames: 'אבי & שרה',
    brideName: 'שרה',
    groomName: 'אבי',
    phone: '053-5556677',
    email: 'avi.sara@gmail.com',
    eventDate: '2026-10-30',
    guestEstimate: 220,
    stage: 'lead',
    urgency: 'attention',
    nextAction: 'שיחת טלפון',
    advance: { paid: 0, total: 22000, status: 'none' },
    leadSource: 'אינסטגרם',
    notes: 'מעוניינים בפקג׳ פרימיום',
    createdAt: '2026-05-16',
    tasks: [
      { id: 't1', text: 'שיחת טלפון ראשונית', done: false },
      { id: 't2', text: 'שלח מחירון', done: false },
      { id: 't3', text: 'בדוק זמינות', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס מאינסטגרם', date: '2026-05-16', done: true, type: 'lead' },
    ],
    activity: [
      { id: 'a1', text: 'שלח הודעה באינסטגרם', time: 'לפני 6 ימים' },
      { id: 'a2', text: 'נוסף למערכת', time: 'לפני 6 ימים' },
    ],
  },
  {
    id: 'c05',
    coupleNames: 'רונית & גיל',
    brideName: 'רונית',
    groomName: 'גיל',
    phone: '054-7778899',
    email: 'ronit.gil@gmail.com',
    eventDate: '2027-02-14',
    guestEstimate: 160,
    stage: 'lead',
    urgency: 'ok',
    nextAction: 'שלח קטלוג',
    advance: { paid: 0, total: 18000, status: 'none' },
    leadSource: 'המלצה',
    notes: 'חתונת יום הולדת',
    createdAt: '2026-05-19',
    tasks: [
      { id: 't1', text: 'שלח קטלוג', done: false },
      { id: 't2', text: 'תאם שיחה', done: false },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-05-19', done: true, type: 'lead' },
    ],
    activity: [
      { id: 'a1', text: 'ליד נכנס דרך המלצה', time: 'לפני 3 ימים' },
    ],
  },
  {
    id: 'c06',
    coupleNames: 'נוי & ירין',
    brideName: 'נוי',
    groomName: 'ירין',
    phone: '052-1112233',
    email: 'noy.yarin@gmail.com',
    eventDate: '2026-08-22',
    guestEstimate: 320,
    stage: 'meeting',
    urgency: 'urgent',
    nextAction: 'שלח הצעת מחיר',
    advance: { paid: 0, total: 32000, status: 'none' },
    leadSource: 'גוגל',
    notes: 'פגישה הייתה מוצלחת, ממתינים להצעה',
    createdAt: '2026-05-10',
    tasks: [
      { id: 't1', text: 'הכן הצעת מחיר', done: false },
      { id: 't2', text: 'שלח הצעה', done: false },
      { id: 't3', text: 'בדוק זמינות ספקים', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-05-10', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-05-18', done: true, type: 'meeting', current: true },
    ],
    activity: [
      { id: 'a1', text: 'פגישה ראשונה התקיימה', time: 'לפני 4 ימים' },
      { id: 'a2', text: 'צפו בנרות ומסגרות', time: 'לפני 4 ימים' },
      { id: 'a3', text: 'בקשו הצעת מחיר', time: 'לפני 4 ימים' },
    ],
  },
  {
    id: 'c07',
    coupleNames: 'הדס & נדב',
    brideName: 'הדס',
    groomName: 'נדב',
    phone: '054-4445566',
    email: 'hadas.nadav@gmail.com',
    eventDate: '2026-09-18',
    guestEstimate: 200,
    stage: 'meeting',
    urgency: 'attention',
    nextAction: 'פגישה שנייה',
    advance: { paid: 0, total: 20000, status: 'none' },
    leadSource: 'המלצה',
    notes: 'מעוניינים בבדיקת מגרש חיצוני',
    createdAt: '2026-05-05',
    tasks: [
      { id: 't1', text: 'תאם פגישה שנייה', done: false },
      { id: 't2', text: 'הכן מצגת', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-05-05', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-05-14', done: true, type: 'meeting', current: true },
    ],
    activity: [
      { id: 'a1', text: 'פגישה ראשונה', time: 'לפני 8 ימים' },
      { id: 'a2', text: 'הצגת האולם', time: 'לפני 8 ימים' },
    ],
  },
  {
    id: 'c08',
    coupleNames: 'יעל & אורי',
    brideName: 'יעל',
    groomName: 'אורי',
    phone: '050-6667788',
    email: 'yael.uri@gmail.com',
    eventDate: '2026-10-10',
    guestEstimate: 190,
    stage: 'meeting',
    urgency: 'ok',
    nextAction: 'שלח תפריט',
    advance: { paid: 0, total: 19000, status: 'none' },
    leadSource: 'אתר',
    notes: 'אוהבים את האולם, עדיין שוקלים',
    createdAt: '2026-05-08',
    tasks: [
      { id: 't1', text: 'שלח תפריט', done: false },
      { id: 't2', text: 'שלח תמונות', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-05-08', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-05-20', done: true, type: 'meeting', current: true },
    ],
    activity: [
      { id: 'a1', text: 'פגישה ראשונה', time: 'לפני יומיים' },
      { id: 'a2', text: 'נשלח אלבום תמונות', time: 'אתמול' },
    ],
  },
  {
    id: 'c09',
    coupleNames: 'לירון & עומר',
    brideName: 'לירון',
    groomName: 'עומר',
    phone: '052-3334455',
    email: 'liron.omer@gmail.com',
    eventDate: '2026-07-12',
    guestEstimate: 280,
    stage: 'proposal',
    urgency: 'urgent',
    nextAction: 'מעקב הצעה — 7 ימים',
    advance: { paid: 0, total: 28000, status: 'none' },
    leadSource: 'גוגל',
    notes: 'הצעה נשלחה, ממתינים לתשובה',
    createdAt: '2026-04-28',
    tasks: [
      { id: 't1', text: 'שיחת מעקב', done: false },
      { id: 't2', text: 'עדכן הצעה לפי בקשה', done: false },
      { id: 't3', text: 'שלח הצעה', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-04-28', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-05-05', done: true, type: 'meeting' },
      { id: 'tl3', text: 'נשלחה הצעת מחיר', date: '2026-05-15', done: true, type: 'proposal', current: true },
    ],
    activity: [
      { id: 'a1', text: 'הצעת מחיר נשלחה', time: 'לפני 7 ימים' },
      { id: 'a2', text: 'פגישה שנייה', time: 'לפני 12 ימים' },
      { id: 'a3', text: 'לא ענו לשיחה', time: 'לפני 3 ימים' },
    ],
  },
  {
    id: 'c10',
    coupleNames: 'ענת & אלון',
    brideName: 'ענת',
    groomName: 'אלון',
    phone: '054-8889900',
    email: 'anat.alon@gmail.com',
    eventDate: '2026-08-30',
    guestEstimate: 210,
    stage: 'proposal',
    urgency: 'attention',
    nextAction: 'מעקב הצעה',
    advance: { paid: 0, total: 21000, status: 'none' },
    leadSource: 'המלצה',
    notes: 'שלחה בקשות שינוי',
    createdAt: '2026-05-01',
    tasks: [
      { id: 't1', text: 'עדכן הצעה', done: false },
      { id: 't2', text: 'שלח גרסה מעודכנת', done: false },
      { id: 't3', text: 'פגישה', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-05-01', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-05-08', done: true, type: 'meeting' },
      { id: 'tl3', text: 'נשלחה הצעת מחיר', date: '2026-05-16', done: true, type: 'proposal', current: true },
    ],
    activity: [
      { id: 'a1', text: 'הצעה נשלחה', time: 'לפני 6 ימים' },
      { id: 'a2', text: 'בקשות שינוי התקבלו', time: 'לפני 2 ימים' },
    ],
  },
  {
    id: 'c11',
    coupleNames: 'גיא & תמר',
    brideName: 'תמר',
    groomName: 'גיא',
    phone: '050-1122334',
    email: 'guy.tamar@gmail.com',
    eventDate: '2026-06-27',
    guestEstimate: 240,
    stage: 'contract',
    urgency: 'urgent',
    nextAction: 'שלח חוזה',
    advance: { paid: 0, total: 24000, status: 'none' },
    leadSource: 'אתר',
    notes: 'מסכימים על כל הפרטים, מחכים לחוזה',
    createdAt: '2026-04-20',
    tasks: [
      { id: 't1', text: 'הכן חוזה', done: true },
      { id: 't2', text: 'שלח חוזה לעורך דין', done: false },
      { id: 't3', text: 'שלח לחתימה', done: false },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-04-20', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-04-28', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-05-05', done: true, type: 'proposal' },
      { id: 'tl4', text: 'אישור עקרוני', date: '2026-05-18', done: true, type: 'contract', current: true },
    ],
    activity: [
      { id: 'a1', text: 'אישור עקרוני התקבל', time: 'לפני 4 ימים' },
      { id: 'a2', text: 'סוגרים פרטים אחרונים', time: 'אתמול' },
    ],
  },
  {
    id: 'c12',
    coupleNames: 'עידו & לי',
    brideName: 'לי',
    groomName: 'עידו',
    phone: '052-5566778',
    email: 'ido.li@gmail.com',
    eventDate: '2026-07-25',
    guestEstimate: 230,
    stage: 'contract',
    urgency: 'attention',
    nextAction: 'בדוק חוזה',
    advance: { paid: 0, total: 23000, status: 'none' },
    leadSource: 'גוגל',
    notes: 'חוזה בעריכה',
    createdAt: '2026-04-25',
    tasks: [
      { id: 't1', text: 'עדכן פרטי חוזה', done: false },
      { id: 't2', text: 'שלח לאישור', done: false },
      { id: 't3', text: 'פגישה סגירה', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-04-25', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-05-02', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-05-10', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה בעריכה', date: '2026-05-19', done: true, type: 'contract', current: true },
    ],
    activity: [
      { id: 'a1', text: 'חוזה נשלח לעריכה', time: 'לפני 3 ימים' },
      { id: 'a2', text: 'שינויים קטנים מתבקשים', time: 'אתמול' },
    ],
  },
  {
    id: 'c13',
    coupleNames: 'ביאנקה & יניב',
    brideName: 'ביאנקה',
    groomName: 'יניב',
    phone: '054-9990011',
    email: 'bianka.yaniv@gmail.com',
    eventDate: '2026-09-05',
    guestEstimate: 350,
    stage: 'signed',
    urgency: 'attention',
    nextAction: 'קבל מקדמה',
    advance: { paid: 0, total: 35000, status: 'pending' },
    leadSource: 'המלצה',
    notes: 'חתמו, ממתינים למקדמה',
    createdAt: '2026-04-10',
    tasks: [
      { id: 't1', text: 'שלח הנחיות מקדמה', done: true },
      { id: 't2', text: 'וידוא קבלת מקדמה', done: false },
      { id: 't3', text: 'תאם פגישת תכנון', done: false },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-04-10', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-04-18', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-04-25', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה נחתם', date: '2026-05-10', done: true, type: 'contract' },
      { id: 'tl5', text: 'חתימה רשמית', date: '2026-05-10', done: true, type: 'signed', current: true },
    ],
    activity: [
      { id: 'a1', text: 'חוזה נחתם', time: 'לפני 12 ימים' },
      { id: 'a2', text: 'הנחיות מקדמה נשלחו', time: 'לפני 10 ימים' },
      { id: 'a3', text: 'אין עדכון על מקדמה', time: 'לפני יומיים' },
    ],
  },
  {
    id: 'c14',
    coupleNames: 'מאור & רותם',
    brideName: 'רותם',
    groomName: 'מאור',
    phone: '050-2233445',
    email: 'maor.rotem@gmail.com',
    eventDate: '2026-10-20',
    guestEstimate: 220,
    stage: 'signed',
    urgency: 'ok',
    nextAction: 'שלח אישור תאריך',
    advance: { paid: 0, total: 22000, status: 'pending' },
    leadSource: 'אינסטגרם',
    notes: 'חתמו לאחרונה',
    createdAt: '2026-04-15',
    tasks: [
      { id: 't1', text: 'שלח אישור תאריך', done: false },
      { id: 't2', text: 'פגישת תכנון ראשונה', done: false },
      { id: 't3', text: 'החתמה על חוזה', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-04-15', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה ראשונה', date: '2026-04-22', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-04-30', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה', date: '2026-05-12', done: true, type: 'contract' },
      { id: 'tl5', text: 'חתימה', date: '2026-05-17', done: true, type: 'signed', current: true },
    ],
    activity: [
      { id: 'a1', text: 'חוזה נחתם', time: 'לפני 5 ימים' },
      { id: 'a2', text: 'נשלח מייל ברכה', time: 'לפני 5 ימים' },
    ],
  },
  {
    id: 'c15',
    coupleNames: 'הלה & אמיר',
    brideName: 'הלה',
    groomName: 'אמיר',
    phone: '052-6677889',
    email: 'hila.amir@gmail.com',
    eventDate: '2026-08-08',
    guestEstimate: 280,
    stage: 'advance',
    urgency: 'attention',
    nextAction: 'גבה יתרת מקדמה',
    advance: { paid: 15000, total: 30000, status: 'paid' },
    leadSource: 'המלצה',
    notes: 'שילמו מקדמה ראשונה, ממתינים לשנייה',
    createdAt: '2026-03-20',
    tasks: [
      { id: 't1', text: 'שלח תזכורת יתרה', done: false },
      { id: 't2', text: 'תאם ספקים', done: true },
      { id: 't3', text: 'בדוק תפריט', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-03-20', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה', date: '2026-03-28', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-04-05', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה', date: '2026-04-15', done: true, type: 'contract' },
      { id: 'tl5', text: 'חתימה', date: '2026-04-20', done: true, type: 'signed' },
      { id: 'tl6', text: 'מקדמה ראשונה', date: '2026-05-01', done: true, type: 'advance', current: true },
    ],
    activity: [
      { id: 'a1', text: 'מקדמה ראשונה התקבלה — ₪15,000', time: 'לפני 21 ימים' },
      { id: 'a2', text: 'תאום ספקים', time: 'לפני 10 ימים' },
      { id: 'a3', text: 'תזכורת יתרה נשלחה', time: 'לפני 3 ימים' },
    ],
  },
  {
    id: 'c16',
    coupleNames: 'מיה & רן',
    brideName: 'מיה',
    groomName: 'רן',
    phone: '054-0011223',
    email: 'mia.ran@gmail.com',
    eventDate: '2026-07-03',
    guestEstimate: 300,
    stage: 'preparation',
    urgency: 'urgent',
    nextAction: 'סיים הכנות ספקים',
    advance: { paid: 30000, total: 30000, status: 'paid' },
    leadSource: 'גוגל',
    notes: 'כל התשלומים הושלמו, הכנות לאירוע',
    createdAt: '2026-02-15',
    tasks: [
      { id: 't1', text: 'תאם ספקים אחרונים', done: false },
      { id: 't2', text: 'הכן דף זרימה', done: true },
      { id: 't3', text: 'בדוק ציוד', done: false },
      { id: 't4', text: 'רשימת אורחים סופית', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-02-15', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה', date: '2026-02-22', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-03-01', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה', date: '2026-03-10', done: true, type: 'contract' },
      { id: 'tl5', text: 'חתימה', date: '2026-03-15', done: true, type: 'signed' },
      { id: 'tl6', text: 'מקדמה שולמה', date: '2026-03-25', done: true, type: 'advance' },
      { id: 'tl7', text: 'הכנות לאירוע', date: '2026-06-01', done: true, type: 'preparation', current: true },
    ],
    activity: [
      { id: 'a1', text: 'תשלום מלא התקבל', time: 'לפני חודשיים' },
      { id: 'a2', text: 'דף זרימה הוכן', time: 'לפני שבוע' },
      { id: 'a3', text: 'ספקים מאושרים', time: 'לפני 3 ימים' },
    ],
  },
  {
    id: 'c17',
    coupleNames: 'לאה & דור',
    brideName: 'לאה',
    groomName: 'דור',
    phone: '050-3344556',
    email: 'lea.dor@gmail.com',
    eventDate: '2026-06-20',
    guestEstimate: 200,
    stage: 'rsvp',
    urgency: 'urgent',
    nextAction: 'סיים RSVP — 29 ימים',
    advance: { paid: 20000, total: 20000, status: 'paid' },
    leadSource: 'המלצה',
    notes: 'RSVP בעיצומו',
    createdAt: '2026-01-20',
    tasks: [
      { id: 't1', text: 'שלח תזכורת RSVP', done: true },
      { id: 't2', text: 'סגור רשימה', done: false },
      { id: 't3', text: 'תאם הסעות', done: false },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2026-01-20', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה', date: '2026-01-28', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2026-02-05', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה', date: '2026-02-15', done: true, type: 'contract' },
      { id: 'tl5', text: 'חתימה', date: '2026-02-20', done: true, type: 'signed' },
      { id: 'tl6', text: 'מקדמה', date: '2026-03-01', done: true, type: 'advance' },
      { id: 'tl7', text: 'הכנות לאירוע', date: '2026-05-15', done: true, type: 'preparation' },
      { id: 'tl8', text: 'RSVP פעיל', date: '2026-06-01', done: true, type: 'rsvp', current: true },
    ],
    activity: [
      { id: 'a1', text: 'RSVP נשלח לאורחים', time: 'לפני 3 שבועות' },
      { id: 'a2', text: '120 אורחים אישרו', time: 'לפני שבוע' },
      { id: 'a3', text: 'תזכורת שנייה נשלחה', time: 'לפני 2 ימים' },
    ],
  },
  {
    id: 'c18',
    coupleNames: 'רינת & דן',
    brideName: 'רינת',
    groomName: 'דן',
    phone: '054-6677880',
    email: 'rinat.dan@gmail.com',
    eventDate: '2026-04-15',
    guestEstimate: 250,
    stage: 'closed',
    urgency: null,
    nextAction: 'כתוב ביקורת',
    advance: { paid: 25000, total: 25000, status: 'paid' },
    leadSource: 'גוגל',
    notes: 'אירוע מוצלח! בקשו המלצה',
    createdAt: '2025-11-10',
    tasks: [
      { id: 't1', text: 'שלח מייל תודה', done: true },
      { id: 't2', text: 'בקש ביקורת', done: true },
    ],
    timeline: [
      { id: 'tl1', text: 'ליד נכנס', date: '2025-11-10', done: true, type: 'lead' },
      { id: 'tl2', text: 'פגישה', date: '2025-11-18', done: true, type: 'meeting' },
      { id: 'tl3', text: 'הצעת מחיר', date: '2025-11-25', done: true, type: 'proposal' },
      { id: 'tl4', text: 'חוזה', date: '2025-12-05', done: true, type: 'contract' },
      { id: 'tl5', text: 'חתימה', date: '2025-12-10', done: true, type: 'signed' },
      { id: 'tl6', text: 'מקדמה', date: '2025-12-20', done: true, type: 'advance' },
      { id: 'tl7', text: 'הכנות', date: '2026-03-15', done: true, type: 'preparation' },
      { id: 'tl8', text: 'RSVP', date: '2026-04-01', done: true, type: 'rsvp' },
      { id: 'tl9', text: 'הושבה', date: '2026-04-10', done: true, type: 'seating' },
      { id: 'tl10', text: 'אירוע חי', date: '2026-04-15', done: true, type: 'live' },
      { id: 'tl11', text: 'סגירת אירוע', date: '2026-04-16', done: true, type: 'closed' },
    ],
    activity: [
      { id: 'a1', text: 'אירוע התקיים בהצלחה', time: 'לפני 37 ימים' },
      { id: 'a2', text: 'ביקורת 5 כוכבים התקבלה', time: 'לפני 35 ימים' },
      { id: 'a3', text: 'הומלצו לשני זוגות', time: 'לפני 30 ימים' },
    ],
  },
];

/* ─────────────────────── KPI STRIP ─────────────────────── */
function KpiStrip({ clients }) {
  const active = clients.filter(c => c.stage !== 'closed').length;
  const oneWeekAgo = toISODate(new Date(Date.now() - 7 * 86400000));
  const newLeads = clients.filter(c => c.createdAt >= oneWeekAgo).length;
  const needAttention = clients.filter(c => c.urgency === 'urgent' || c.urgency === 'attention').length;
  const openProposals = clients.filter(c => c.stage === 'proposal').length;

  const kpis = [
    { label: 'לקוחות פעילים', value: active, sub: 'סה״כ בפייפליין', color: '#4F46E5', icon: <Users size={18} /> },
    { label: 'לידים חדשים השבוע', value: newLeads, sub: 'ב-7 ימים אחרונים', color: '#3B82F6', icon: <TrendingUp size={18} /> },
    { label: 'דורשים טיפול', value: needAttention, sub: 'דחוף או תשומת לב', color: '#DC2626', icon: <AlertTriangle size={18} /> },
    { label: 'פגישות השבוע', value: 8, sub: 'מתוכננות', color: '#8B5CF6', icon: <Calendar size={18} /> },
    { label: 'הצעות פתוחות', value: openProposals, sub: 'ממתינות לתשובה', color: '#F59E0B', icon: <FileText size={18} /> },
    { label: 'אחוז סגירה', value: '72%', sub: 'ממוצע 30 יום', color: '#10B981', icon: <CheckCircle size={18} /> },
  ];

  return (
    <div className="vc-kpi-grid">
      {kpis.map((k, i) => (
        <div key={i} className="vc-kpi-card" style={{ '--kpi-color': k.color }}>
          <div className="vc-kpi-icon" style={{ color: k.color }}>{k.icon}</div>
          <div className="vc-kpi-val" style={{ color: k.color }}>{k.value}</div>
          <div className="vc-kpi-label">{k.label}</div>
          <div className="vc-kpi-sub">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── AI STRIP ─────────────────────── */
function AiStrip({ clients }) {
  const urgentCount = clients.filter(c => c.urgency === 'urgent').length;
  const contractCount = clients.filter(c => c.stage === 'contract').length;
  const meetingCount = clients.filter(c => c.stage === 'meeting').length;
  const hasProposal = clients.some(c => c.stage === 'proposal');

  const chips = [
    urgentCount > 0 && {
      label: `${urgentCount} לקוחות דחופים`,
      color: '#DC2626',
      bg: 'rgba(220,38,38,0.08)',
      icon: <Zap size={12} />,
    },
    contractCount >= 2 && {
      label: `${contractCount} זוגות לא חתמו`,
      color: '#D97706',
      bg: 'rgba(217,119,6,0.08)',
      icon: <FileText size={12} />,
    },
    meetingCount > 0 && {
      label: 'פגישות דורשות מעקב',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.08)',
      icon: <Bell size={12} />,
    },
    hasProposal && {
      label: 'הצעה פתוחה כבר 7 ימים',
      color: '#7C3AED',
      bg: 'rgba(124,58,237,0.08)',
      icon: <Clock size={12} />,
    },
    {
      label: 'תאריך פנוי מתאים לזוג ממתין',
      color: '#0891B2',
      bg: 'rgba(8,145,178,0.08)',
      icon: <Sparkles size={12} />,
    },
  ].filter(Boolean);

  return (
    <div className="vc-ai-strip">
      <div className="vc-ai-brand">
        <Sparkles size={14} />
        <span>Choko AI</span>
        <span className="vc-ai-badge">BETA</span>
      </div>
      <div className="vc-ai-chips">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="vc-ai-chip"
            style={{ color: chip.color, background: chip.bg, border: `1px solid ${chip.color}33` }}
          >
            {chip.icon}
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── CLIENT CARD ─────────────────────── */
function ClientCard({ client, onSelect, onDragStart, onDragEnd }) {
  const stage = getStage(client.stage);
  const days = daysUntil(client.eventDate);
  const urgencyColor = client.urgency === 'urgent' ? '#DC2626' : client.urgency === 'attention' ? '#D97706' : client.urgency === 'ok' ? '#16A34A' : 'transparent';
  const waPhone = client.phone ? `https://wa.me/972${client.phone.replace(/\D/g, '').slice(1)}` : '#';

  return (
    <div
      className={`vc-card${client.urgency ? ` vc-card--${client.urgency}` : ''}`}
      style={{ '--urgency-color': urgencyColor }}
      draggable={true}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(client.id); }}
      onDragEnd={onDragEnd}
    >
      <div className="vc-card-inner">
        <div className="vc-card-name">{client.coupleNames}</div>
        <div className="vc-card-row">
          <span className="vc-card-date">
            <Calendar size={11} />
            {formatDate(client.eventDate, 'short')}
          </span>
          {days !== null && (
            <span className="vc-card-days" style={{ color: days < 60 ? '#DC2626' : days < 120 ? '#D97706' : '#64748B' }}>
              {days > 0 ? `${days} ימים` : 'היום'}
            </span>
          )}
        </div>
        {client.guestEstimate && (
          <div className="vc-card-guests">
            <Users size={11} />
            {client.guestEstimate} אורחים
          </div>
        )}
        <div className="vc-card-stage-chip" style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.border}` }}>
          {stage.label}
        </div>
        {client.nextAction && (
          <div className="vc-card-action">
            <ChevronRight size={11} />
            <span>{client.nextAction}</span>
          </div>
        )}
      </div>
      <div className="vc-card-actions">
        <a href={`tel:${client.phone}`} className="vc-card-act-btn" title="התקשר" onClick={e => e.stopPropagation()}>
          <Phone size={13} />
        </a>
        <a href={waPhone} target="_blank" rel="noopener noreferrer" className="vc-card-act-btn" title="WhatsApp" onClick={e => e.stopPropagation()}>
          <MessageCircle size={13} />
        </a>
        <button className="vc-card-act-btn" title="חוזה" onClick={e => e.stopPropagation()}>
          <FileText size={13} />
        </button>
        <button className="vc-card-act-btn vc-card-act-btn--primary" title="פתח" onClick={e => { e.stopPropagation(); onSelect(client); }}>
          <Eye size={13} />
          <span>פתח</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── PIPELINE COLUMN ─────────────────────── */
function PipelineColumn({ stage, clients, onSelect, dragOver, onDragStart, onDragEnd, onDragOver, onDrop }) {
  return (
    <div
      className={`vc-col${dragOver === stage.key ? ' vc-col--drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(stage.key); }}
      onDrop={(e) => { e.preventDefault(); onDrop(stage.key); }}
    >
      <div className="vc-col-accent" style={{ background: stage.color }} />
      <div className="vc-col-head">
        <span className="vc-col-dot" style={{ background: stage.color }} />
        <span className="vc-col-label">{stage.label}</span>
        <span className="vc-col-count" style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.border}` }}>
          {clients.length}
        </span>
      </div>
      <div className="vc-col-body">
        {clients.map(c => (
          <ClientCard
            key={c.id}
            client={c}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {clients.length === 0 && (
          <div className="vc-col-empty">אין לקוחות</div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── PIPELINE BOARD ─────────────────────── */
function PipelineBoard({ clients, setClients, onSelect, searchQuery }) {
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  function handleDragStart(id) { setDragId(id); }
  function handleDragEnd() { setDragId(null); setDragOver(null); }
  function handleDragOver(stageKey) { setDragOver(stageKey); }
  function handleDrop(stageKey) {
    if (!dragId) return;
    setClients(prev => prev.map(c => c.id === dragId ? { ...c, stage: stageKey } : c));
    setDragId(null);
    setDragOver(null);
  }

  return (
    <div className="vc-pipeline">
      {STAGES.map(stage => (
        <PipelineColumn
          key={stage.key}
          stage={stage}
          clients={clients.filter(c => c.stage === stage.key)}
          onSelect={onSelect}
          dragOver={dragOver}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}

/* ─────────────────────── CLIENT SIDE PANEL ─────────────────────── */
function ClientSidePanel({ client, onClose, navigate }) {
  const [activeTab, setActiveTab] = useState('פרטים');
  const [tasks, setTasks] = useState(client.tasks || []);
  const [newTask, setNewTask] = useState('');
  const tabs = ['פרטים', 'ציר זמן', 'משימות', 'פעילות'];
  const stage = getStage(client.stage);
  const days = daysUntil(client.eventDate);
  const waPhone = client.phone ? `https://wa.me/972${client.phone.replace(/\D/g, '').slice(1)}` : '#';

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function addTask() {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: `t_${Date.now()}`, text: newTask.trim(), done: false }]);
    setNewTask('');
  }

  const advanceStatus = client.advance?.status;
  const advanceStatusLabel = advanceStatus === 'paid' ? 'שולם' : advanceStatus === 'pending' ? 'ממתין' : advanceStatus === 'late' ? 'באיחור' : 'טרם נקבע';
  const advanceStatusColor = advanceStatus === 'paid' ? '#10B981' : advanceStatus === 'pending' ? '#F59E0B' : advanceStatus === 'late' ? '#DC2626' : '#6B7280';

  return (
    <div className="vc-panel vc-panel--open">
      <div className="vc-panel-header">
        <div className="vc-panel-header-info">
          <div className="vc-panel-couple">{client.coupleNames}</div>
          <div className="vc-panel-meta">
            <span className="vc-panel-stage-chip" style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.border}` }}>
              {stage.label}
            </span>
            {client.urgency && (
              <span className="vc-panel-urgency" style={{
                color: client.urgency === 'urgent' ? '#DC2626' : client.urgency === 'attention' ? '#D97706' : '#16A34A',
                background: client.urgency === 'urgent' ? 'rgba(220,38,38,0.08)' : client.urgency === 'attention' ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)',
              }}>
                {client.urgency === 'urgent' ? 'דחוף' : client.urgency === 'attention' ? 'תשומת לב' : 'תקין'}
              </span>
            )}
          </div>
        </div>
        <button className="vc-panel-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="vc-panel-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`vc-panel-tab${activeTab === tab ? ' vc-panel-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="vc-panel-content">
        {activeTab === 'פרטים' && (
          <div className="vc-tab-details">
            <div className="vc-detail-section">
              <div className="vc-detail-section-title">פרטי קשר</div>
              <div className="vc-detail-row">
                <Phone size={14} />
                <a href={`tel:${client.phone}`} className="vc-detail-link">{client.phone}</a>
              </div>
              <div className="vc-detail-row">
                <Mail size={14} />
                <a href={`mailto:${client.email}`} className="vc-detail-link">{client.email}</a>
              </div>
              <div className="vc-detail-row">
                <Hash size={14} />
                <span>{client.leadSource}</span>
              </div>
            </div>
            <div className="vc-detail-section">
              <div className="vc-detail-section-title">פרטי אירוע</div>
              <div className="vc-detail-row">
                <Calendar size={14} />
                <span>{formatDate(client.eventDate, 'long')}</span>
              </div>
              {days !== null && (
                <div className="vc-detail-row">
                  <Clock size={14} />
                  <span style={{ color: days < 60 ? '#DC2626' : '#6B7280' }}>{days > 0 ? `עוד ${days} ימים` : 'היום!'}</span>
                </div>
              )}
              {client.guestEstimate && (
                <div className="vc-detail-row">
                  <Users size={14} />
                  <span>{client.guestEstimate} אורחים מוערכים</span>
                </div>
              )}
            </div>
            {client.advance && (
              <div className="vc-detail-section">
                <div className="vc-detail-section-title">תשלום</div>
                <div className="vc-detail-row">
                  <CreditCard size={14} />
                  <span>₪{(client.advance.paid || 0).toLocaleString()} / ₪{(client.advance.total || 0).toLocaleString()}</span>
                  <span className="vc-advance-badge" style={{ color: advanceStatusColor, background: `${advanceStatusColor}15`, border: `1px solid ${advanceStatusColor}33` }}>
                    {advanceStatusLabel}
                  </span>
                </div>
                {client.advance.total > 0 && (
                  <div className="vc-advance-bar">
                    <div
                      className="vc-advance-bar-fill"
                      style={{ width: `${Math.min(100, Math.round((client.advance.paid / client.advance.total) * 100))}%`, background: advanceStatusColor }}
                    />
                  </div>
                )}
              </div>
            )}
            {client.notes && (
              <div className="vc-detail-section">
                <div className="vc-detail-section-title">הערות</div>
                <div className="vc-notes">{client.notes}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ציר זמן' && (
          <div className="vc-tab-timeline">
            {STAGES.map((s, idx) => {
              const entry = client.timeline?.find(t => t.type === s.key);
              const isDone = !!entry?.done;
              const isCurrent = !!entry?.current;
              const itemClass = `vc-tl-item${isDone && !isCurrent ? ' vc-tl-item--done' : ''}${isCurrent ? ' vc-tl-item--current' : ''}${!isDone && !isCurrent ? ' vc-tl-item--pending' : ''}`;
              return (
                <div key={s.key} className={itemClass}>
                  <div className="vc-tl-line-wrap">
                    <div className="vc-tl-dot" style={{
                      background: isCurrent ? s.color : isDone ? '#10B981' : 'var(--venue-border)',
                      borderColor: isCurrent ? s.color : isDone ? '#10B981' : 'var(--venue-mute)',
                    }}>
                      {isCurrent ? <Activity size={9} /> : isDone ? <Check size={9} /> : null}
                    </div>
                    {idx < STAGES.length - 1 && <div className="vc-tl-connector" style={{ background: isDone ? '#10B981' : 'var(--venue-border)' }} />}
                  </div>
                  <div className="vc-tl-body">
                    <div className="vc-tl-label" style={{ color: isCurrent ? s.color : isDone ? 'var(--venue-ink2)' : 'var(--venue-mute)' }}>
                      {s.label}
                      {isCurrent && <span className="vc-tl-current-tag">עכשיו</span>}
                    </div>
                    {entry?.date && (
                      <div className="vc-tl-date">{formatDate(entry.date, 'short')}</div>
                    )}
                    {entry?.text && <div className="vc-tl-note">{entry.text}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'משימות' && (
          <div className="vc-tab-tasks">
            <div className="vc-task-list">
              {tasks.map(task => (
                <div key={task.id} className={`vc-task${task.done ? ' vc-task--done' : ''}`} onClick={() => toggleTask(task.id)}>
                  <div className="vc-task-check">
                    {task.done && <Check size={11} />}
                  </div>
                  <span className="vc-task-text">{task.text}</span>
                </div>
              ))}
            </div>
            <div className="vc-task-add">
              <input
                className="vc-task-input"
                placeholder="הוסף משימה..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
              <button className="vc-task-add-btn" onClick={addTask}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'פעילות' && (
          <div className="vc-tab-activity">
            {(client.activity || []).map(item => (
              <div key={item.id} className="vc-activity-item">
                <div className="vc-activity-dot" />
                <div className="vc-activity-body">
                  <div className="vc-activity-text">{item.text}</div>
                  <div className="vc-activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="vc-panel-quick-actions">
        <a href={`tel:${client.phone}`} className="vc-quick-btn">
          <Phone size={15} />
          <span>התקשר</span>
        </a>
        <a href={waPhone} target="_blank" rel="noopener noreferrer" className="vc-quick-btn">
          <MessageCircle size={15} />
          <span>WhatsApp</span>
        </a>
        <button className="vc-quick-btn">
          <FileText size={15} />
          <span>חוזה</span>
        </button>
        <button className="vc-quick-btn">
          <Grip size={15} />
          <span>הושבה</span>
        </button>
      </div>
    </div>
  );
}


/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function VenueClients({ venue, navigate }) {
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = clients;
    if (filter === 'urgent') list = list.filter(c => c.urgency === 'urgent');
    if (filter === 'attention') list = list.filter(c => c.urgency === 'urgent' || c.urgency === 'attention');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.coupleNames.toLowerCase().includes(q) || c.phone?.includes(q));
    }
    return list;
  }, [clients, filter, search]);

  const filterLabels = { all: 'הכל', urgent: 'דחוף', attention: 'תשומת לב' };

  return (
    <>
      <div className="vc-page">
        <div className="vc-header">
          <div>
            <h1 className="vc-title">לקוחות</h1>
            <p className="vc-subtitle">מרכז ניהול מסע הלקוח של {venue?.name || 'האולם'}</p>
          </div>
          <div className="vc-header-actions">
            <div className="vc-search-wrap">
              <Search size={14} />
              <input
                placeholder="חיפוש לקוח..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="vc-filter-btns">
              {['all', 'urgent', 'attention'].map(f => (
                <button
                  key={f}
                  className={`vc-filter-btn${filter === f ? ' vc-filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>
            <button className="venue-btn venue-btn--cta">
              <Plus size={15} />
              + לקוח חדש
            </button>
          </div>
        </div>

        <KpiStrip clients={clients} />
        <AiStrip clients={clients} />

        <PipelineBoard
          clients={filtered}
          setClients={setClients}
          onSelect={setSelected}
          searchQuery={search}
        />

        {selected && (
          <>
            <div className="vc-backdrop" onClick={() => setSelected(null)} />
            <ClientSidePanel
              client={selected}
              onClose={() => setSelected(null)}
              navigate={navigate}
            />
          </>
        )}
      </div>
    </>
  );
}

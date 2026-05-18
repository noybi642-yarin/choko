// Israeli holiday utility — 2025-2029
//
// Jewish holidays follow the Hebrew lunisolar calendar.
// Gregorian dates are ±1 day accurate (Hebrew day begins at sunset).
//
// Muslim holidays (Eid al-Fitr, Eid al-Adha) are approximate.
// They depend on moon sighting and may shift ±1-2 days from what is listed.
// All approximate entries are flagged with { approximate: true }.
//
// To extend beyond 2029, add a new year block to HOLIDAYS_DB using the
// same shape: { date: 'YYYY-MM-DD', nameHe: string, type: 'jewish'|'national'|'muslim', major: boolean, approximate?: boolean }
//
// Sources: Jewish calendar — hebcal.com / chabad.org
//          Muslim calendar — islamicfinder.org (Israel/Palestine region)

const HOLIDAYS_DB = {
  2025: [
    { date: '2025-03-13', nameHe: 'פורים',              type: 'jewish',   major: true  },
    { date: '2025-03-14', nameHe: 'שושן פורים',         type: 'jewish',   major: false },
    { date: '2025-03-30', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2025-03-31', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2025-04-12', nameHe: 'ערב פסח',            type: 'jewish',   major: true  },
    { date: '2025-04-13', nameHe: 'פסח (יום א׳)',       type: 'jewish',   major: true  },
    { date: '2025-04-14', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2025-04-15', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2025-04-16', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2025-04-17', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2025-04-18', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2025-04-19', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2025-04-20', nameHe: 'אחרון של פסח',       type: 'jewish',   major: true  },
    { date: '2025-04-24', nameHe: 'יום השואה',          type: 'national', major: true  },
    { date: '2025-04-30', nameHe: 'יום הזיכרון',        type: 'national', major: true  },
    { date: '2025-05-01', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2025-05-16', nameHe: 'ל"ג בעומר',          type: 'jewish',   major: false },
    { date: '2025-06-01', nameHe: 'שבועות (יום א׳)',    type: 'jewish',   major: true  },
    { date: '2025-06-02', nameHe: 'שבועות (יום ב׳)',    type: 'jewish',   major: true  },
    { date: '2025-06-06', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2025-06-07', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2025-08-12', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
    { date: '2025-09-22', nameHe: 'ראש השנה (יום א׳)',  type: 'jewish',   major: true  },
    { date: '2025-09-23', nameHe: 'ראש השנה (יום ב׳)',  type: 'jewish',   major: true  },
    { date: '2025-10-01', nameHe: 'יום כיפור',          type: 'jewish',   major: true  },
    { date: '2025-10-06', nameHe: 'סוכות (יום א׳)',     type: 'jewish',   major: true  },
    { date: '2025-10-07', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2025-10-08', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2025-10-09', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2025-10-10', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2025-10-11', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2025-10-12', nameHe: 'הושענא רבא',         type: 'jewish',   major: false },
    { date: '2025-10-13', nameHe: 'שמיני עצרת',         type: 'jewish',   major: true  },
    { date: '2025-10-14', nameHe: 'שמחת תורה',          type: 'jewish',   major: true  },
    { date: '2025-12-14', nameHe: 'חנוכה (נר א׳)',      type: 'jewish',   major: false },
    { date: '2025-12-15', nameHe: 'חנוכה (נר ב׳)',      type: 'jewish',   major: false },
    { date: '2025-12-16', nameHe: 'חנוכה (נר ג׳)',      type: 'jewish',   major: false },
    { date: '2025-12-17', nameHe: 'חנוכה (נר ד׳)',      type: 'jewish',   major: false },
    { date: '2025-12-18', nameHe: 'חנוכה (נר ה׳)',      type: 'jewish',   major: false },
    { date: '2025-12-19', nameHe: 'חנוכה (נר ו׳)',      type: 'jewish',   major: false },
    { date: '2025-12-20', nameHe: 'חנוכה (נר ז׳)',      type: 'jewish',   major: false },
    { date: '2025-12-21', nameHe: 'חנוכה (נר ח׳)',      type: 'jewish',   major: false },
  ],

  2026: [
    { date: '2026-03-03', nameHe: 'פורים',              type: 'jewish',   major: true  },
    { date: '2026-03-04', nameHe: 'שושן פורים',         type: 'jewish',   major: false },
    { date: '2026-03-20', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2026-03-21', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2026-04-01', nameHe: 'ערב פסח',            type: 'jewish',   major: true  },
    { date: '2026-04-02', nameHe: 'פסח (יום א׳)',       type: 'jewish',   major: true  },
    { date: '2026-04-03', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2026-04-04', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2026-04-05', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2026-04-06', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2026-04-07', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2026-04-08', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2026-04-09', nameHe: 'יום השואה',          type: 'national', major: true  },
    { date: '2026-04-21', nameHe: 'יום הזיכרון',        type: 'national', major: true  },
    { date: '2026-04-22', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2026-05-22', nameHe: 'שבועות (יום א׳)',    type: 'jewish',   major: true  },
    { date: '2026-05-23', nameHe: 'שבועות (יום ב׳)',    type: 'jewish',   major: true  },
    { date: '2026-05-27', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2026-05-28', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2026-08-02', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
    { date: '2026-09-11', nameHe: 'ראש השנה (יום א׳)',  type: 'jewish',   major: true  },
    { date: '2026-09-12', nameHe: 'ראש השנה (יום ב׳)',  type: 'jewish',   major: true  },
    { date: '2026-09-20', nameHe: 'יום כיפור',          type: 'jewish',   major: true  },
    { date: '2026-09-25', nameHe: 'סוכות (יום א׳)',     type: 'jewish',   major: true  },
    { date: '2026-09-26', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2026-09-27', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2026-09-28', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2026-09-29', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2026-09-30', nameHe: 'חול המועד סוכות',    type: 'jewish',   major: false },
    { date: '2026-10-01', nameHe: 'הושענא רבא',         type: 'jewish',   major: false },
    { date: '2026-10-02', nameHe: 'שמיני עצרת',         type: 'jewish',   major: true  },
    { date: '2026-10-03', nameHe: 'שמחת תורה',          type: 'jewish',   major: true  },
    { date: '2026-12-03', nameHe: 'חנוכה (נר א׳)',      type: 'jewish',   major: false },
    { date: '2026-12-04', nameHe: 'חנוכה (נר ב׳)',      type: 'jewish',   major: false },
    { date: '2026-12-05', nameHe: 'חנוכה (נר ג׳)',      type: 'jewish',   major: false },
    { date: '2026-12-06', nameHe: 'חנוכה (נר ד׳)',      type: 'jewish',   major: false },
    { date: '2026-12-07', nameHe: 'חנוכה (נר ה׳)',      type: 'jewish',   major: false },
    { date: '2026-12-08', nameHe: 'חנוכה (נר ו׳)',      type: 'jewish',   major: false },
    { date: '2026-12-09', nameHe: 'חנוכה (נר ז׳)',      type: 'jewish',   major: false },
    { date: '2026-12-10', nameHe: 'חנוכה (נר ח׳)',      type: 'jewish',   major: false },
  ],

  2027: [
    { date: '2027-03-09', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2027-03-10', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2027-03-23', nameHe: 'פורים',              type: 'jewish',   major: true  },
    { date: '2027-04-20', nameHe: 'ערב פסח',            type: 'jewish',   major: true  },
    { date: '2027-04-21', nameHe: 'פסח (יום א׳)',       type: 'jewish',   major: true  },
    { date: '2027-04-27', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2027-04-29', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2027-05-16', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2027-05-17', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2027-06-10', nameHe: 'שבועות',             type: 'jewish',   major: true  },
    { date: '2027-08-19', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
    { date: '2027-10-01', nameHe: 'ראש השנה (יום א׳)',  type: 'jewish',   major: true  },
    { date: '2027-10-02', nameHe: 'ראש השנה (יום ב׳)',  type: 'jewish',   major: true  },
    { date: '2027-10-10', nameHe: 'יום כיפור',          type: 'jewish',   major: true  },
    { date: '2027-10-15', nameHe: 'סוכות (יום א׳)',     type: 'jewish',   major: true  },
    { date: '2027-10-22', nameHe: 'שמיני עצרת',         type: 'jewish',   major: true  },
    { date: '2027-10-23', nameHe: 'שמחת תורה',          type: 'jewish',   major: true  },
    { date: '2027-12-22', nameHe: 'חנוכה (נר א׳)',      type: 'jewish',   major: false },
    { date: '2027-12-23', nameHe: 'חנוכה (נר ב׳)',      type: 'jewish',   major: false },
    { date: '2027-12-24', nameHe: 'חנוכה (נר ג׳)',      type: 'jewish',   major: false },
    { date: '2027-12-25', nameHe: 'חנוכה (נר ד׳)',      type: 'jewish',   major: false },
    { date: '2027-12-26', nameHe: 'חנוכה (נר ה׳)',      type: 'jewish',   major: false },
    { date: '2027-12-27', nameHe: 'חנוכה (נר ו׳)',      type: 'jewish',   major: false },
    { date: '2027-12-28', nameHe: 'חנוכה (נר ז׳)',      type: 'jewish',   major: false },
    { date: '2027-12-29', nameHe: 'חנוכה (נר ח׳)',      type: 'jewish',   major: false },
  ],

  2028: [
    { date: '2028-02-27', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2028-02-28', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2028-03-11', nameHe: 'פורים',              type: 'jewish',   major: true  },
    { date: '2028-04-09', nameHe: 'ערב פסח',            type: 'jewish',   major: true  },
    { date: '2028-04-10', nameHe: 'פסח (יום א׳)',       type: 'jewish',   major: true  },
    { date: '2028-04-16', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2028-04-27', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2028-05-05', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2028-05-06', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2028-05-30', nameHe: 'שבועות',             type: 'jewish',   major: true  },
    { date: '2028-08-07', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
    { date: '2028-09-20', nameHe: 'ראש השנה (יום א׳)',  type: 'jewish',   major: true  },
    { date: '2028-09-21', nameHe: 'ראש השנה (יום ב׳)',  type: 'jewish',   major: true  },
    { date: '2028-09-29', nameHe: 'יום כיפור',          type: 'jewish',   major: true  },
    { date: '2028-10-04', nameHe: 'סוכות (יום א׳)',     type: 'jewish',   major: true  },
    { date: '2028-10-11', nameHe: 'שמיני עצרת',         type: 'jewish',   major: true  },
    { date: '2028-10-12', nameHe: 'שמחת תורה',          type: 'jewish',   major: true  },
    { date: '2028-12-10', nameHe: 'חנוכה (נר א׳)',      type: 'jewish',   major: false },
    { date: '2028-12-11', nameHe: 'חנוכה (נר ב׳)',      type: 'jewish',   major: false },
    { date: '2028-12-12', nameHe: 'חנוכה (נר ג׳)',      type: 'jewish',   major: false },
    { date: '2028-12-13', nameHe: 'חנוכה (נר ד׳)',      type: 'jewish',   major: false },
    { date: '2028-12-14', nameHe: 'חנוכה (נר ה׳)',      type: 'jewish',   major: false },
    { date: '2028-12-15', nameHe: 'חנוכה (נר ו׳)',      type: 'jewish',   major: false },
    { date: '2028-12-16', nameHe: 'חנוכה (נר ז׳)',      type: 'jewish',   major: false },
    { date: '2028-12-17', nameHe: 'חנוכה (נר ח׳)',      type: 'jewish',   major: false },
  ],

  2029: [
    { date: '2029-02-16', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2029-02-17', nameHe: 'עיד אל-פיטר',       type: 'muslim',   major: true,  approximate: true },
    { date: '2029-03-01', nameHe: 'פורים',              type: 'jewish',   major: true  },
    { date: '2029-03-31', nameHe: 'פסח (יום א׳)',       type: 'jewish',   major: true  },
    { date: '2029-04-06', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2029-04-25', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2029-04-26', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2029-04-29', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2029-05-19', nameHe: 'שבועות',             type: 'jewish',   major: true  },
    { date: '2029-07-29', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
    { date: '2029-09-09', nameHe: 'ראש השנה (יום א׳)',  type: 'jewish',   major: true  },
    { date: '2029-09-10', nameHe: 'ראש השנה (יום ב׳)',  type: 'jewish',   major: true  },
    { date: '2029-09-18', nameHe: 'יום כיפור',          type: 'jewish',   major: true  },
    { date: '2029-09-23', nameHe: 'סוכות (יום א׳)',     type: 'jewish',   major: true  },
    { date: '2029-09-30', nameHe: 'שמיני עצרת',         type: 'jewish',   major: true  },
    { date: '2029-10-01', nameHe: 'שמחת תורה',          type: 'jewish',   major: true  },
    { date: '2029-12-01', nameHe: 'חנוכה (נר א׳)',      type: 'jewish',   major: false },
    { date: '2029-12-02', nameHe: 'חנוכה (נר ב׳)',      type: 'jewish',   major: false },
    { date: '2029-12-03', nameHe: 'חנוכה (נר ג׳)',      type: 'jewish',   major: false },
    { date: '2029-12-04', nameHe: 'חנוכה (נר ד׳)',      type: 'jewish',   major: false },
    { date: '2029-12-05', nameHe: 'חנוכה (נר ה׳)',      type: 'jewish',   major: false },
    { date: '2029-12-06', nameHe: 'חנוכה (נר ו׳)',      type: 'jewish',   major: false },
    { date: '2029-12-07', nameHe: 'חנוכה (נר ז׳)',      type: 'jewish',   major: false },
    { date: '2029-12-08', nameHe: 'חנוכה (נר ח׳)',      type: 'jewish',   major: false },
  ],
};

export function getHolidaysForDate(dateStr) {
  if (!dateStr) return [];
  const year = parseInt(dateStr.slice(0, 4), 10);
  return (HOLIDAYS_DB[year] || []).filter(h => h.date === dateStr);
}

export function getMajorHolidayForDate(dateStr) {
  return getHolidaysForDate(dateStr).find(h => h.major) || null;
}

export function isMajorHoliday(dateStr) {
  return getHolidaysForDate(dateStr).some(h => h.major);
}

export function getHolidaysForMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return (HOLIDAYS_DB[year] || []).filter(h => h.date.startsWith(prefix));
}

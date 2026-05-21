// Israeli holiday utility — 2025-2029
//
// Jewish holidays follow the Hebrew lunisolar calendar.
// Gregorian dates are ±1 day accurate (Hebrew day begins at sunset).
//
// Muslim holidays (Eid al-Fitr, Eid al-Adha) are approximate.
// They depend on moon sighting and may shift ±1-2 days from what is listed.
// All approximate entries are flagged with { approximate: true }.
//
// TISHA B'AV NOTE: When 9 Av falls on Shabbat the fast is deferred to Sunday.
// This affects 2025 (Aug 2→3) and 2029 (Jul 21→22). Those end-dates are used below.
//
// To extend beyond 2029, add a new year block using the same shape:
//   { date: 'YYYY-MM-DD', nameHe: string, type: 'jewish'|'national'|'muslim',
//     major: boolean, approximate?: boolean }
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
    { date: '2025-07-13', nameHe: 'צום י"ז בתמוז',     type: 'jewish',   major: false },
    { date: '2025-08-03', nameHe: 'תשעה באב',           type: 'jewish',   major: true  }, // deferred from Shabbat Aug 2
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
    { date: '2026-05-05', nameHe: 'ל"ג בעומר',          type: 'jewish',   major: false },
    { date: '2026-05-22', nameHe: 'שבועות (יום א׳)',    type: 'jewish',   major: true  },
    { date: '2026-05-23', nameHe: 'שבועות (יום ב׳)',    type: 'jewish',   major: true  },
    { date: '2026-05-27', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2026-05-28', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2026-07-02', nameHe: 'צום י"ז בתמוז',     type: 'jewish',   major: false },
    { date: '2026-07-23', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
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
    { date: '2027-04-22', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2027-04-23', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2027-04-24', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2027-04-25', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2027-04-26', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2027-04-27', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2027-04-29', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2027-05-16', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2027-05-17', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2027-05-24', nameHe: 'ל"ג בעומר',          type: 'jewish',   major: false },
    { date: '2027-06-10', nameHe: 'שבועות',             type: 'jewish',   major: true  },
    { date: '2027-07-21', nameHe: 'צום י"ז בתמוז',     type: 'jewish',   major: false },
    { date: '2027-08-11', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
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
    { date: '2028-04-11', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2028-04-12', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2028-04-13', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2028-04-14', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2028-04-15', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2028-04-16', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2028-04-27', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2028-05-05', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2028-05-06', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2028-05-13', nameHe: 'ל"ג בעומר',          type: 'jewish',   major: false },
    { date: '2028-05-30', nameHe: 'שבועות',             type: 'jewish',   major: true  },
    { date: '2028-07-10', nameHe: 'צום י"ז בתמוז',     type: 'jewish',   major: false },
    { date: '2028-07-31', nameHe: 'תשעה באב',           type: 'jewish',   major: true  },
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
    { date: '2029-04-01', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2029-04-02', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2029-04-03', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2029-04-04', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2029-04-05', nameHe: 'חול המועד פסח',      type: 'jewish',   major: false },
    { date: '2029-04-06', nameHe: 'שביעי של פסח',       type: 'jewish',   major: true  },
    { date: '2029-04-25', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2029-04-26', nameHe: 'עיד אל-אדחא',       type: 'muslim',   major: true,  approximate: true },
    { date: '2029-04-29', nameHe: 'יום העצמאות',        type: 'national', major: true  },
    { date: '2029-05-03', nameHe: 'ל"ג בעומר',          type: 'jewish',   major: false },
    { date: '2029-05-19', nameHe: 'שבועות',             type: 'jewish',   major: true  },
    { date: '2029-07-01', nameHe: 'צום י"ז בתמוז',     type: 'jewish',   major: false }, // deferred from Shabbat Jun 30
    { date: '2029-07-22', nameHe: 'תשעה באב',           type: 'jewish',   major: true  }, // deferred from Shabbat Jul 21
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

// ── Halachic restrictions (periods when rabbis generally do not officiate) ────
//
// BEIN HAMETZARIM (Three Weeks): from 17 Tammuz to 9 Av (inclusive).
// No weddings are conducted during this period by any stream of Orthodox Judaism.
// The venue may operate normally, but couples should know no rabbi will officiate.
// Note: when 17 Tammuz or 9 Av falls on Shabbat, the restriction starts/ends
// on the deferred (Sunday) date for practical scheduling purposes.
//
// SEFIRAT HAOMER (Counting of the Omer): from the day after last day of Pesach
// through the day before Shavuot.
// Most Orthodox/traditional rabbis do not officiate at weddings during this
// period, EXCEPT on Lag Ba'Omer (day 33) which is universally permitted.
// Customs vary: some permit from Lag Ba'Omer onwards; some Sephardi communities
// have different restrictions. Mark as caution — not an absolute block.

const RESTRICTIONS_DB = {
  beinHametzarim: {
    // { start, end } — both dates inclusive; end = Tisha B'Av (deferred if Shabbat)
    2025: { start: '2025-07-13', end: '2025-08-03' },
    2026: { start: '2026-07-02', end: '2026-07-23' },
    2027: { start: '2027-07-21', end: '2027-08-11' },
    2028: { start: '2028-07-10', end: '2028-07-31' },
    2029: { start: '2029-06-30', end: '2029-07-22' }, // both 17 Tammuz & Tisha B'Av deferred
  },
  sefiratHaOmer: {
    // start = day after last day of Pesach (22 Nisan in Israel)
    // end   = day before Shavuot (5 Sivan)
    // lagBaomer = 18 Iyar — weddings are permitted on this day
    2025: { start: '2025-04-20', end: '2025-05-31', lagBaomer: '2025-05-16' },
    2026: { start: '2026-04-09', end: '2026-05-21', lagBaomer: '2026-05-05' },
    2027: { start: '2027-04-28', end: '2027-06-09', lagBaomer: '2027-05-24' },
    2028: { start: '2028-04-17', end: '2028-05-29', lagBaomer: '2028-05-13' },
    2029: { start: '2029-04-07', end: '2029-05-18', lagBaomer: '2029-05-03' },
  },
};

// ── Public API ─────────────────────────────────────────────────────────────────

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

/**
 * Returns the halachic restriction (if any) for a given date.
 * Returns null if the date has no restriction.
 *
 * Return shape:
 *   { type: 'bein-hametzarim' | 'sefirat-haomer', nameHe: string, descHe: string }
 */
export function getRestrictionForDate(dateStr) {
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);

  const bhm = RESTRICTIONS_DB.beinHametzarim[year];
  if (bhm && dateStr >= bhm.start && dateStr <= bhm.end) {
    return {
      type:   'bein-hametzarim',
      nameHe: 'בין המצרים',
      descHe: 'תקופת אבלות (י"ז בתמוז עד תשעה באב) — רב לא יכול לחתן',
    };
  }

  const sfo = RESTRICTIONS_DB.sefiratHaOmer[year];
  if (sfo && dateStr >= sfo.start && dateStr <= sfo.end) {
    if (dateStr === sfo.lagBaomer) return null; // Lag Ba'Omer is permitted
    return {
      type:   'sefirat-haomer',
      nameHe: 'ספירת העומר',
      descHe: 'ספירת העומר — רוב הרבנים לא מחתנים בתקופה זו (מנהגים משתנים, ל"ג בעומר מותר)',
    };
  }

  return null;
}

/**
 * Returns all restrictions that overlap with a given month.
 * Useful for rendering the calendar month view.
 * Returns array of { type, nameHe, descHe, start, end } objects.
 */
export function getRestrictionsForMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const result = [];

  const bhm = RESTRICTIONS_DB.beinHametzarim[year];
  if (bhm && (bhm.start.startsWith(prefix) || bhm.end.startsWith(prefix) ||
      (bhm.start < prefix + '-01' && bhm.end > prefix + '-31'))) {
    result.push({ ...bhm, type: 'bein-hametzarim', nameHe: 'בין המצרים' });
  }

  const sfo = RESTRICTIONS_DB.sefiratHaOmer[year];
  if (sfo && (sfo.start.startsWith(prefix) || sfo.end.startsWith(prefix) ||
      (sfo.start < prefix + '-01' && sfo.end > prefix + '-31'))) {
    result.push({ ...sfo, type: 'sefirat-haomer', nameHe: 'ספירת העומר' });
  }

  return result;
}

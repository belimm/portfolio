/**
 * Durations from the free-text dates typed in the admin ("Dec 2022", "Eyl 2016", "Present").
 * English and Turkish month names are both understood, by their first three letters. Anything
 * unreadable yields null, and the page just shows no duration for that entry.
 */
const MONTHS: Record<string, number> = {
   jan: 0, oca: 0,
   feb: 1, sub: 1,
   mar: 2,
   apr: 3, nis: 3,
   may: 4,
   jun: 5, haz: 5,
   jul: 6, tem: 6,
   aug: 7, agu: 7,
   sep: 8, eyl: 8,
   oct: 9, eki: 9,
   nov: 10, kas: 10,
   dec: 11, ara: 11,
};

const ONGOING = /present|now|current|ongoing|şu an|su an|devam|halen|günümüz|gunumuz/i;

/** Months since year 0 (year * 12 + month), or null if the text has no year. */
function parseMonthIndex(text: string, fallbackMonth: number): number | null {
   const year = text.match(/\b(19|20)\d{2}\b/)?.[0];
   if (!year) return null;
   const word = text
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .match(/[a-z]{3,}/)?.[0]
      .slice(0, 3);
   const month = word && word in MONTHS ? MONTHS[word] : fallbackMonth;
   return Number(year) * 12 + month;
}

export type Span = { from: number; to: number };

/** The months an entry covers, both ends included ("May 2024 – May 2026" is 25 months). Null if unreadable. */
export function parseSpan(start: string, end: string, now = new Date()): Span | null {
   const from = parseMonthIndex(start, 0);
   if (from === null) return null;
   const to = ONGOING.test(end) ? now.getFullYear() * 12 + now.getMonth() : parseMonthIndex(end, 11);
   if (to === null || to < from) return null;
   return { from, to };
}

export const spanMonths = (span: Span) => span.to - span.from + 1;

/** Total months covered by the spans; overlaps (two jobs at once) count once. */
export function totalMonths(spans: Span[]) {
   const sorted = [...spans].sort((a, b) => a.from - b.from);
   let total = 0;
   let reach = -Infinity;
   for (const { from, to } of sorted) {
      const start = Math.max(from, reach + 1);
      if (to >= start) total += to - start + 1;
      reach = Math.max(reach, to);
   }
   return total;
}

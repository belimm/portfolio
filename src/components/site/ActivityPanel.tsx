'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ContributionDay } from '../../lib/github';
import styles from './Activity.module.css';

export type ActivityLabels = {
   ranges: string; // "{n} months"
   contributions: string;
   activeDays: string;
   longestStreak: string;
   busiestDay: string;
   days: string; // "{n} days"
   perMonth: string;
   less: string;
   more: string;
   cellTooltip: string; // "{count} contributions"
   none: string; // "No contributions"
   showTable: string;
   month: string;
   note: string;
};

type Props = { days: ContributionDay[]; login: string; locale: 'en' | 'tr'; labels: ActivityLabels };

const RANGES = [3, 6, 9, 12] as const;
type Range = (typeof RANGES)[number];

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const DAY_LABEL_W = 26;
const MONTH_LABEL_H = 16;

const fill = (template: string, values: Record<string, string | number>) =>
   template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

const utc = (date: string) => new Date(`${date}T00:00:00Z`);

/** Intensity steps from the whole year's non-zero days, so a range doesn't recolour itself. */
function thresholds(days: ContributionDay[]) {
   const counts = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
   if (counts.length === 0) return [1, 2, 3];
   const q = (p: number) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))];
   return [q(0.25), q(0.5), q(0.75)];
}

const levelOf = (count: number, t: number[]) => (count === 0 ? 0 : count <= t[0] ? 1 : count <= t[1] ? 2 : count <= t[2] ? 3 : 4);

type Tooltip = { x: number; y: number; value: string; label: string } | null;

export default function ActivityPanel({ days, login, locale, labels }: Props) {
   const [range, setRange] = useState<Range>(6);
   const [tooltip, setTooltip] = useState<Tooltip>(null);
   const panelRef = useRef<HTMLDivElement>(null);
   const scrollRef = useRef<HTMLDivElement>(null);

   // When the calendar is wider than the column (phones, 12 months), start at the latest weeks.
   useEffect(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = el.scrollWidth;
   }, [range]);
   const intl = locale === 'tr' ? 'tr-TR' : 'en-GB';

   const levels = useMemo(() => thresholds(days), [days]);
   const formatDay = useMemo(
      () => new Intl.DateTimeFormat(intl, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
      [intl]
   );
   const formatMonth = useMemo(() => new Intl.DateTimeFormat(intl, { month: 'short', timeZone: 'UTC' }), [intl]);
   const formatMonthYear = useMemo(() => new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric', timeZone: 'UTC' }), [intl]);
   const number = useMemo(() => new Intl.NumberFormat(intl), [intl]);

   const view = useMemo(() => {
      const last = utc(days[days.length - 1].date);
      const start = new Date(last);
      start.setUTCMonth(start.getUTCMonth() - range);
      const startIso = start.toISOString().slice(0, 10);
      const inRange = days.filter((d) => d.date > startIso);

      let longest = 0;
      let run = 0;
      for (const d of inRange) {
         run = d.count > 0 ? run + 1 : 0;
         longest = Math.max(longest, run);
      }
      const busiest = inRange.reduce((best, d) => (d.count > best.count ? d : best), inRange[0]);

      // Calendar columns are weeks starting on Sunday, like GitHub's.
      const offset = utc(inRange[0].date).getUTCDay();
      const cells = inRange.map((d, i) => ({ ...d, week: Math.floor((i + offset) / 7), weekday: (i + offset) % 7 }));
      const weekCount = cells[cells.length - 1].week + 1;

      // A month label needs ~3 columns of room; drop any that would collide or run off the end.
      const monthMarks: { week: number; label: string }[] = [];
      for (const c of cells) {
         if (c.date.endsWith('-01') || c === cells[0]) {
            const previous = monthMarks[monthMarks.length - 1];
            const roomLeft = weekCount - c.week;
            if ((!previous || c.week - previous.week >= 3) && roomLeft >= 2) {
               monthMarks.push({ week: c.week, label: formatMonth.format(utc(c.date)) });
            }
         }
      }

      const months = new Map<string, { total: number; active: number }>();
      for (const d of inRange) {
         const key = d.date.slice(0, 7);
         const m = months.get(key) ?? { total: 0, active: 0 };
         m.total += d.count;
         m.active += d.count > 0 ? 1 : 0;
         months.set(key, m);
      }

      return {
         total: inRange.reduce((sum, d) => sum + d.count, 0),
         active: inRange.filter((d) => d.count > 0).length,
         longest,
         busiest,
         cells,
         weekCount,
         monthMarks,
         months: [...months.entries()].map(([key, m]) => ({ key, ...m })),
      };
   }, [days, range, formatMonth]);

   const showTip = (event: React.PointerEvent | React.FocusEvent, value: string, label: string) => {
      const panel = panelRef.current?.getBoundingClientRect();
      const target = (event.currentTarget as Element).getBoundingClientRect();
      if (!panel) return;
      setTooltip({ x: target.left + target.width / 2 - panel.left, y: target.top - panel.top, value, label });
   };

   const countText = (count: number) => (count === 0 ? labels.none : fill(labels.cellTooltip, { count: number.format(count) }));

   // Monthly columns
   const chartH = 120;
   const barMax = Math.max(1, ...view.months.map((m) => m.total));
   const slot = 100 / view.months.length;
   const maxIndex = view.months.findIndex((m) => m.total === barMax);

   return (
      <div className={styles.panel} ref={panelRef} onPointerLeave={() => setTooltip(null)}>
         <div className={styles.toolbar} role="group" aria-label={fill(labels.ranges, { n: '' }).trim()}>
            {RANGES.map((r) => (
               <button
                  key={r}
                  type="button"
                  className={styles.range}
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}>
                  {fill(labels.ranges, { n: r })}
               </button>
            ))}
            <a className={styles.profile} href={`https://github.com/${login}`} target="_blank" rel="noopener noreferrer">
               github.com/{login} ↗
            </a>
         </div>

         <dl className={styles.stats}>
            <div>
               <dt>{labels.contributions}</dt>
               <dd>{number.format(view.total)}</dd>
            </div>
            <div>
               <dt>{labels.activeDays}</dt>
               <dd>{number.format(view.active)}</dd>
            </div>
            <div>
               <dt>{labels.longestStreak}</dt>
               <dd>{fill(labels.days, { n: number.format(view.longest) })}</dd>
            </div>
            <div>
               <dt>{labels.busiestDay}</dt>
               <dd>
                  {number.format(view.busiest.count)}
                  <span className={styles.sub}>{formatDay.format(utc(view.busiest.date))}</span>
               </dd>
            </div>
         </dl>

         <div className={styles.calendarScroll} ref={scrollRef}>
            <svg
               className={styles.calendar}
               width={DAY_LABEL_W + view.weekCount * STEP}
               height={MONTH_LABEL_H + 7 * STEP}
               role="img"
               aria-label={`${labels.contributions}: ${number.format(view.total)}`}>
               {view.monthMarks.map((m) => (
                  <text key={m.week} x={DAY_LABEL_W + m.week * STEP} y={11} className={styles.axis}>
                     {m.label}
                  </text>
               ))}
               {[1, 3, 5].map((weekday) => (
                  <text key={weekday} x={0} y={MONTH_LABEL_H + weekday * STEP + CELL - 2} className={styles.axis}>
                     {new Intl.DateTimeFormat(intl, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 1, weekday + 1)))}
                  </text>
               ))}
               {view.cells.map((c) => (
                  <rect
                     key={c.date}
                     x={DAY_LABEL_W + c.week * STEP}
                     y={MONTH_LABEL_H + c.weekday * STEP}
                     width={CELL}
                     height={CELL}
                     rx={2}
                     className={styles[`l${levelOf(c.count, levels)}`]}
                     onPointerEnter={(e) => showTip(e, countText(c.count), formatDay.format(utc(c.date)))}
                  />
               ))}
            </svg>
         </div>

         <div className={styles.legend} aria-hidden="true">
            <span>{labels.less}</span>
            {[0, 1, 2, 3, 4].map((l) => (
               <i key={l} className={styles[`l${l}`]} />
            ))}
            <span>{labels.more}</span>
         </div>

         <h3 className={styles.chartTitle}>{labels.perMonth}</h3>
         {/* Bars as HTML so their width and rounding stay in pixels whatever the column count. */}
         <div className={styles.barRow} style={{ height: chartH }} role="img" aria-label={labels.perMonth}>
            {view.months.map((m, i) => {
               const label = formatMonthYear.format(utc(`${m.key}-01`));
               const showValue = i === maxIndex || i === view.months.length - 1;
               return (
                  <div
                     key={m.key}
                     className={styles.barSlot}
                     style={{ width: `${slot}%` }}
                     tabIndex={0}
                     aria-label={`${label}: ${countText(m.total)}`}
                     onPointerEnter={(e) => showTip(e, countText(m.total), label)}
                     onFocus={(e) => showTip(e, countText(m.total), label)}
                     onBlur={() => setTooltip(null)}>
                     {showValue && <span className={styles.barValue}>{number.format(m.total)}</span>}
                     <span className={styles.bar} style={{ height: `${(m.total / barMax) * 100}%` }} />
                  </div>
               );
            })}
         </div>
         <div className={styles.barLabels}>
            {view.months.map((m) => (
               <span key={m.key} style={{ width: `${slot}%` }}>
                  {formatMonth.format(utc(`${m.key}-01`))}
               </span>
            ))}
         </div>

         {tooltip && (
            <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }} role="status">
               <strong>{tooltip.value}</strong>
               <span>{tooltip.label}</span>
            </div>
         )}

         <p className={styles.note}>{labels.note}</p>

         <details className={styles.table}>
            <summary>{labels.showTable}</summary>
            <table>
               <thead>
                  <tr>
                     <th scope="col">{labels.month}</th>
                     <th scope="col">{labels.contributions}</th>
                     <th scope="col">{labels.activeDays}</th>
                  </tr>
               </thead>
               <tbody>
                  {view.months.map((m) => (
                     <tr key={m.key}>
                        <th scope="row">{formatMonthYear.format(utc(`${m.key}-01`))}</th>
                        <td>{number.format(m.total)}</td>
                        <td>{number.format(m.active)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </details>
      </div>
   );
}

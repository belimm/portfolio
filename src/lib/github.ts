import 'server-only';

/**
 * GitHub contribution calendar for the GitHub section.
 *
 * Needs GITHUB_TOKEN (a fine-grained token with no permissions is enough: the calendar is public
 * profile data). Private work appears in the calendar as anonymous counts when "Include private
 * contributions on my profile" is on in GitHub. No repository names are ever fetched.
 * Without a token, or if GitHub fails, the section is simply left out.
 */
export type ContributionDay = { date: string; count: number };
export type GithubActivity = { login: string; days: ContributionDay[]; fetchedAt: string };

const QUERY = `
   query ($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
         contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
               weeks { contributionDays { date contributionCount } }
            }
         }
      }
   }`;

export type GithubSummary = {
   total: number;
   active: number;
   longest: number;
   busiest: ContributionDay;
   /** Contributions per 7-day block, oldest first. */
   weekly: number[];
};

/** Stats for the last `months` months, counted the same way as the section's range filter. */
export function summarize(days: ContributionDay[], months: number): GithubSummary {
   const start = new Date(`${days[days.length - 1].date}T00:00:00Z`);
   start.setUTCMonth(start.getUTCMonth() - months);
   const startIso = start.toISOString().slice(0, 10);
   const inRange = days.filter((d) => d.date > startIso);

   let longest = 0;
   let run = 0;
   const weekly: number[] = [];
   inRange.forEach((d, i) => {
      run = d.count > 0 ? run + 1 : 0;
      longest = Math.max(longest, run);
      if (i % 7 === 0) weekly.push(0);
      weekly[weekly.length - 1] += d.count;
   });

   return {
      total: inRange.reduce((sum, d) => sum + d.count, 0),
      active: inRange.filter((d) => d.count > 0).length,
      longest,
      busiest: inRange.reduce((best, d) => (d.count > best.count ? d : best), inRange[0]),
      weekly,
   };
}

/** "https://github.com/belimm" -> "belimm" */
export function githubLogin(profileUrl: string) {
   const match = profileUrl.match(/github\.com\/([A-Za-z0-9-]+)/);
   return process.env.GITHUB_ACTIVITY_LOGIN || match?.[1] || null;
}

export async function getGithubActivity(login: string | null): Promise<GithubActivity | null> {
   const token = process.env.GITHUB_TOKEN;
   if (!token || !login) return null;

   const to = new Date();
   const from = new Date(to);
   from.setUTCFullYear(to.getUTCFullYear() - 1);

   try {
      const res = await fetch('https://api.github.com/graphql', {
         method: 'POST',
         headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({ query: QUERY, variables: { login, from: from.toISOString(), to: to.toISOString() } }),
         // Contributions don't need to be live; refresh a few times a day.
         next: { revalidate: 6 * 60 * 60, tags: ['github'] },
         signal: AbortSignal.timeout(8000),
      });
      const json = await res.json();
      if (!res.ok || json.errors) throw new Error(json.errors?.[0]?.message ?? `GitHub responded ${res.status}`);

      const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks as {
         contributionDays: { date: string; contributionCount: number }[];
      }[];
      const days = weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
      return { login, days, fetchedAt: to.toISOString() };
   } catch (error) {
      console.error('GitHub activity unavailable:', (error as Error).message);
      return null;
   }
}

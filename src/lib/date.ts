import { format, startOfDay, subDays, parseISO, differenceInCalendarDays } from "date-fns";

const DATE_FORMAT = "yyyy-MM-dd";

export function today(): string {
  return format(new Date(), DATE_FORMAT);
}

export function previousDate(date: string): string {
  return format(subDays(parseISO(date), 1), DATE_FORMAT);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMAT);
}

export function calculateStreak(dates: string[]): number {
  const sorted = [...new Set(dates)]
    .map((d) => parseISO(d))
    .sort((a, b) => differenceInCalendarDays(b, a));

  let streak = 0;
  const todayDate = startOfDay(new Date());

  for (const date of sorted) {
    const diff = differenceInCalendarDays(todayDate, date);
    if (diff === streak) {
      streak++;
    } else if (diff > streak) {
      break;
    }
  }

  return streak;
}

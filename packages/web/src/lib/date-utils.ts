import {
  format,
  isToday,
  differenceInDays,
  differenceInWeeks,
  differenceInYears,
} from "date-fns";

export function formatRelativeDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  const daysAgo = differenceInDays(new Date(), date);
  if (daysAgo < 7) {
    return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  }

  const weeksAgo = differenceInWeeks(new Date(), date);
  if (weeksAgo < 52) {
    return `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`;
  }

  const yearsAgo = differenceInYears(new Date(), date);
  return `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
}

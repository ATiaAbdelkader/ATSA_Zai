/**
 * Date helpers — see H7 in the code review.
 *
 * Firestore Timestamps come back from `onSnapshot` as `{ seconds, nanoseconds }`
 * objects with a `.toDate()` method. They are NOT plain strings, even though
 * `AnalysisResult.timestamp` is typed as `string` everywhere in our codebase.
 * Calling `new Date(timestamp)` on a Firestore Timestamp returns `Invalid Date`,
 * which silently broke every chart / "time ago" / CSV export that touched it.
 *
 * `toJSDate` duck-types the input and converts it correctly. `isValidDate`
 * is the companion guard.
 */

type MaybeDateInput = string | number | Date | { toDate?: () => Date } | { seconds?: number; nanoseconds?: number } | null | undefined;

/**
 * Convert any of the supported timestamp shapes to a JS Date.
 * Returns `null` for nullish input or unparseable values.
 */
export function toJSDate(input: MaybeDateInput): Date | null {
  if (input == null) return null;

  // Firestore Timestamp (object with .toDate()).
  if (typeof input === 'object' && input !== null && !(input instanceof Date)) {
    const ts = input as { toDate?: () => Date; seconds?: number; nanoseconds?: number };
    if (typeof ts.toDate === 'function') {
      const d = ts.toDate.call(ts);
      return isValidDate(d) ? d : null;
    }
    if (typeof ts.seconds === 'number') {
      // Raw Firestore timestamp serialised as {seconds, nanoseconds}.
      const d = new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds ?? 0) / 1_000_000));
      return isValidDate(d) ? d : null;
    }
    return null;
  }

  // String / number / Date.
  const d = new Date(input as string | number | Date);
  return isValidDate(d) ? d : null;
}

/** True if `d` is a valid Date (not NaN). */
export function isValidDate(d: Date | null | undefined): d is Date {
  return !!d && d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * Format a date as `YYYY-MM-DD HH:mm` in the user's locale. Returns an
 * empty string for invalid input so the UI shows nothing rather than
 * "Invalid Date".
 */
export function formatDateTime(input: MaybeDateInput): string {
  const d = toJSDate(input);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

/** Format a date as `YYYY-MM-DD`. */
export function formatDate(input: MaybeDateInput): string {
  const d = toJSDate(input);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Human-readable "x ago" string (e.g. "3 days ago", "just now"). */
export function timeAgo(input: MaybeDateInput): string {
  const d = toJSDate(input);
  if (!d) return '';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr ago`;
}

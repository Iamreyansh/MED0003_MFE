export function daysUntilExpiry(
  value: unknown,
  now: Date = new Date(),
): number | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const expiry = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  if (Number.isNaN(expiry.getTime())) {
    return null;
  }
  const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const end = Date.UTC(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate(),
  );
  return Math.round((end - start) / 86_400_000);
}

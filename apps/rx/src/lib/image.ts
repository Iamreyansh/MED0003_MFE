const SAFE_IMAGE = /^https?:\/\//i;

export function isSafeImageUrl(value: unknown): value is string {
  return typeof value === 'string' && SAFE_IMAGE.test(value);
}

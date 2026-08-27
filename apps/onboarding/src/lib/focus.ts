export function focusFirstError(
  root: HTMLElement | null,
  fieldErrors?: Record<string, string>,
): void {
  if (!root || !fieldErrors) {
    return;
  }
  const first = Object.keys(fieldErrors)[0];
  if (!first) {
    return;
  }
  const named = root.querySelector<HTMLElement>(
    `[name="${CSS.escape(first)}"]`,
  );
  if (named) {
    named.focus();
    return;
  }
  const labelled = root.querySelector<HTMLElement>(`#${CSS.escape(first)}`);
  labelled?.focus();
}

export function formatIst(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

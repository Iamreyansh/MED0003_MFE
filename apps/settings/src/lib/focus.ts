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

export function textOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function boolOrFalse(value: unknown): boolean {
  return value === true;
}

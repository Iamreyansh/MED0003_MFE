import { SEARCH_DEBOUNCE_MS } from '@medmate/catalogue-contract';
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(
  value: T,
  delayMs = SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      window.clearTimeout(id);
    };
  }, [delayMs, value]);

  return debounced;
}

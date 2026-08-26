import { Alert, Box } from '@medmate/ui';
import { useLayoutEffect, useRef } from 'react';
import { fadeBanner } from '../../lib/motion';

export function AuthFormError({
  message,
  testId,
}: {
  message?: string;
  testId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (message) {
      fadeBanner(ref.current);
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Box ref={ref}>
      <Alert data-testid={testId}>{message}</Alert>
    </Box>
  );
}

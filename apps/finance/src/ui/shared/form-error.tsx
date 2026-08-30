import { Alert, Box } from '@medmate/ui';

export function FormBanner({
  message,
  testId,
}: {
  message?: string;
  testId?: string;
}) {
  if (!message) {
    return null;
  }
  return (
    <Box>
      <Alert data-testid={testId}>{message}</Alert>
    </Box>
  );
}

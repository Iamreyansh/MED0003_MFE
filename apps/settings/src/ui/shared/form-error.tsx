import { Alert, Box, StatusMessage } from '@medmate/ui';

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

export function SaveNote({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <StatusMessage tone="info">{message}</StatusMessage>;
}

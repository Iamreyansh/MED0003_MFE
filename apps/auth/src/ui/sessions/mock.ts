import type { AuthSessionRow } from '@medmate/auth-contract';

export const SESSION_FIXTURES: AuthSessionRow[] = [
  {
    sessionId: 's1',
    device: 'Chrome',
    ipAddress: '1.1.1.1',
    location: 'Bengaluru, IN',
    lastActiveAt: '26 Aug 2026, 5:30 pm',
    isCurrent: true,
  },
];

import { Badge } from '@medmate/ui';
import { dash } from '../../lib/copy';

export function StatusBadge({ status }: { status: unknown }) {
  const label = dash(status);
  const key = String(status ?? '').toUpperCase();
  if (key === 'RESOLVED' || key === 'CLOSED') {
    return <Badge tone="primary">{label}</Badge>;
  }
  if (key === 'OPEN' || key === 'PENDING') {
    return <Badge>{label}</Badge>;
  }
  return <Badge>{label}</Badge>;
}

import { Badge } from '@medmate/ui';
import { dash } from '../../lib/copy';

export function StatusBadge({ status }: { status: unknown }) {
  const label = dash(status);
  const key = String(status ?? '').toUpperCase();
  if (key === 'PAID' || key === 'APPROVED' || key === 'DISPENSED') {
    return <Badge tone="primary">{label}</Badge>;
  }
  if (
    key === 'PENDING' ||
    key === 'PENDING_REVIEW' ||
    key === 'PARTIAL' ||
    key === 'REJECTED'
  ) {
    return (
      <Badge className="bg-mm-danger/10 text-mm-status-error">{label}</Badge>
    );
  }
  return <Badge>{label}</Badge>;
}

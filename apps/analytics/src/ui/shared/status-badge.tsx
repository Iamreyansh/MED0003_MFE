import { Badge } from '@medmate/ui';
import { dash } from '../../lib/copy';

export function StatusBadge({ status }: { status: unknown }) {
  const label = dash(status);
  const key = String(status ?? '').toUpperCase();
  if (key === 'RELEASED') {
    return <Badge tone="primary">{label}</Badge>;
  }
  if (key === 'HELD' || key === 'FAILED') {
    return (
      <Badge className="bg-mm-danger/10 text-mm-status-error">{label}</Badge>
    );
  }
  return <Badge>{label}</Badge>;
}

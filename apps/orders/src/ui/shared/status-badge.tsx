import { Badge } from '@medmate/ui';
import { dash } from '../../lib/copy';

export function StatusBadge({ status }: { status: unknown }) {
  const label = dash(status);
  const key = String(status ?? '').toUpperCase();
  if (key === 'QUOTED' || key === 'ACCEPTED' || key === 'PACKED') {
    return <Badge tone="primary">{label}</Badge>;
  }
  if (
    key === 'EXPIRED' ||
    key === 'REJECTED' ||
    key === 'OUT_OF_STOCK' ||
    key === 'NOTIFIED'
  ) {
    return (
      <Badge className="bg-mm-danger/10 text-mm-status-error">{label}</Badge>
    );
  }
  return <Badge>{label}</Badge>;
}

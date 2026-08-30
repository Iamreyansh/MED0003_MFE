import { Badge, Text } from '@medmate/ui';

export function RackChip({
  code,
  emptyLabel = '—',
}: {
  code?: string | null;
  emptyLabel?: string;
}) {
  if (!code) {
    return <Text tone="muted">{emptyLabel}</Text>;
  }
  return (
    <Badge className="font-mm-heading tracking-wide" data-slot="rack-chip">
      {code}
    </Badge>
  );
}

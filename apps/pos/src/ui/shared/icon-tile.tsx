import { Box, cn } from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';

export function IconTile({
  icon: Icon,
  tone = 'primary',
}: {
  icon: LucideIcon;
  tone?: 'primary' | 'muted';
}) {
  return (
    <Box
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-mm',
        tone === 'muted'
          ? 'bg-mm-bg text-mm-muted'
          : 'bg-mm-primary-soft text-mm-primary',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </Box>
  );
}

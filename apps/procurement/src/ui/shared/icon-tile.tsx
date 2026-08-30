import { Box, cn } from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';

export function IconTile({
  icon: Icon,
  tone = 'primary',
  size = 'md',
}: {
  icon: LucideIcon;
  tone?: 'primary' | 'muted' | 'danger' | 'contrast';
  size?: 'md' | 'lg';
}) {
  return (
    <Box
      className={cn(
        'flex shrink-0 items-center justify-center rounded-mm',
        size === 'lg' ? 'size-12' : 'size-9',
        tone === 'danger'
          ? 'bg-mm-danger/5 text-mm-status-error'
          : tone === 'muted'
            ? 'bg-mm-bg text-mm-muted'
            : tone === 'contrast'
              ? 'bg-mm-primary-contrast/15 text-mm-primary-contrast'
              : 'bg-mm-primary-soft text-mm-primary',
      )}
    >
      <Icon className={size === 'lg' ? 'size-6' : 'size-5'} aria-hidden />
    </Box>
  );
}

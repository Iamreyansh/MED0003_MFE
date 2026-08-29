import { Box, Label, Text, cn } from '@medmate/ui';
import { RefreshCw } from 'lucide-react';
import { PLANS_COPY } from '../../lib/copy';
import { IconTile } from './icon-tile';

export function AutoRenewSwitch({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <Label
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-mm border px-3 py-2 transition-colors duration-mm ease-mm',
        checked
          ? 'border-mm-primary bg-mm-primary-soft'
          : 'border-mm-border bg-mm-bg',
        disabled ? 'cursor-not-allowed opacity-55' : undefined,
      )}
    >
      <IconTile icon={RefreshCw} tone={checked ? 'primary' : 'muted'} />
      <Box className="min-w-0">
        <Text className="font-mm-heading font-semibold">
          {PLANS_COPY.autoRenew}
        </Text>
        <Text size="sm" tone="muted">
          {checked ? PLANS_COPY.autoRenewOn : PLANS_COPY.autoRenewOff}
        </Text>
      </Box>
      <input
        type="checkbox"
        aria-label={PLANS_COPY.autoRenew}
        checked={checked}
        disabled={disabled}
        className={cn(
          'relative ml-1 h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-full bg-mm-border transition-colors duration-mm ease-mm',
          'before:absolute before:top-0.5 before:left-0.5 before:size-5 before:rounded-full before:bg-mm-surface before:transition-[left] before:duration-mm before:ease-mm',
          'checked:bg-mm-primary checked:before:left-[1.125rem]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus',
          'disabled:cursor-not-allowed',
        )}
        onChange={(event) => {
          onToggle(event.target.checked);
        }}
      />
    </Label>
  );
}

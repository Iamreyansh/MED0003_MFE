import { Box, Button, Flex, Input, Label, VisuallyHidden } from '@medmate/ui';
import { Minus, Plus } from 'lucide-react';
import { COUNTER_COPY } from '../../lib/copy';

export function QtyStepper({
  id,
  value,
  disabled,
  onChange,
  onCommit,
  onStep,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
  onStep: (delta: 1 | -1) => void;
}) {
  return (
    <Flex align="center" gap="1">
      <Button
        type="button"
        variant="ghost"
        className="min-h-9 min-w-9 px-2 py-1"
        aria-label={COUNTER_COPY.decreaseQty}
        disabled={disabled}
        onClick={() => onStep(-1)}
      >
        <Minus className="size-4" aria-hidden />
      </Button>
      <Box className="w-14">
        <Label htmlFor={id}>
          <VisuallyHidden>{COUNTER_COPY.quantity}</VisuallyHidden>
        </Label>
        <Input
          id={id}
          inputMode="numeric"
          value={value}
          disabled={disabled}
          className="min-h-9 px-1 text-center"
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => {
            const related = event.relatedTarget;
            if (
              related instanceof Node &&
              event.currentTarget.closest('tr')?.contains(related)
            ) {
              return;
            }
            onCommit();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onCommit();
            }
          }}
        />
      </Box>
      <Button
        type="button"
        variant="ghost"
        className="min-h-9 min-w-9 px-2 py-1"
        aria-label={COUNTER_COPY.increaseQty}
        disabled={disabled}
        onClick={() => onStep(1)}
      >
        <Plus className="size-4" aria-hidden />
      </Button>
    </Flex>
  );
}

import { Box, Button, Fieldset, Grid } from '@medmate/ui';
import { Delete } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { pressScale, scaleIn } from '../../lib/motion';

const KEYPAD = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '',
  '0',
  '⌫',
] as const;

export function PinPad({
  pin,
  onDigit,
}: {
  pin: string;
  onDigit: (digit: string) => void;
}) {
  const dotsRef = useRef<HTMLParagraphElement>(null);
  const prevLength = useRef(pin.length);

  useLayoutEffect(() => {
    if (pin.length > prevLength.current) {
      scaleIn(dotsRef.current, 0.5);
    }
    prevLength.current = pin.length;
  }, [pin.length]);

  const display = pin.replace(/./g, '•').padEnd(4, '○');

  return (
    <Fieldset>
      <legend className="px-1 text-mm-text">PIN</legend>
      <Box
        as="p"
        ref={dotsRef}
        className="mb-3 text-center font-mm text-2xl tracking-[0.4em] text-mm-text"
        aria-live="polite"
        data-testid="pin-display"
      >
        {display}
      </Box>
      <Grid cols="3" gap="2" role="group" aria-label="PIN keypad">
        {KEYPAD.map((key, index) =>
          key ? (
            <Button
              key={`${key}-${index}`}
              type="button"
              variant="ghost"
              size="lg"
              className="font-semibold"
              aria-label={key === '⌫' ? 'Backspace' : key}
              onClick={(event) => {
                pressScale(event.currentTarget);
                onDigit(key);
              }}
            >
              {key === '⌫' ? <Delete className="size-5" aria-hidden /> : key}
            </Button>
          ) : (
            <Button
              key={`pad-${index}`}
              type="button"
              variant="ghost"
              size="lg"
              aria-hidden="true"
              tabIndex={-1}
              className="opacity-0"
              data-testid="pin-spacer"
              onClick={() => onDigit(key)}
            />
          ),
        )}
      </Grid>
    </Fieldset>
  );
}

import { Flex } from '../elements/Flex';
import { cn } from '../lib/cn';
import { Input } from './Input';
import { Label } from './Label';

export type InputOTPProps = {
  value?: string;
  onChange: (next: string) => void;
  length?: number;
  label: string;
  disabled?: boolean;
};

function takeDigits(raw: string, length: number): string {
  return raw.replace(/\D/g, '').slice(0, length);
}

export function InputOTP({
  value,
  onChange,
  length = 6,
  label,
  disabled = false,
}: InputOTPProps) {
  const digits = value ?? '';
  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-otp`;

  return (
    <Flex direction="column" gap="2" data-slot="input-otp">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        disabled={disabled}
        value={digits}
        onChange={(event) => onChange(takeDigits(event.target.value, length))}
        onPaste={(event) => {
          const next = takeDigits(event.clipboardData.getData('text'), length);
          if (next.length > 0) {
            event.preventDefault();
            onChange(next);
          }
        }}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip-path:inset(50%)] [clip:rect(0,0,0,0)]"
      />
      <Flex
        gap="2"
        role="group"
        aria-label={label}
        onPaste={(event) => {
          const next = takeDigits(event.clipboardData.getData('text'), length);
          if (next.length > 0) {
            event.preventDefault();
            onChange(next);
          }
        }}
      >
        {Array.from({ length }, (_, index) => {
          const filled = digits[index] ?? '';
          const active = index === digits.length;
          return (
            <Input
              key={index}
              inputMode="numeric"
              maxLength={1}
              disabled={disabled}
              className={cn(
                'h-11 w-10 px-0 text-center text-mm-title',
                active ? 'ring-1 ring-mm-primary' : undefined,
              )}
              value={filled}
              aria-label={`${label} digit ${index + 1}`}
              onChange={(event) => {
                const digit = event.target.value.replace(/\D/g, '').slice(-1);
                const chars = digits.split('');
                chars[index] = digit;
                onChange(chars.join('').slice(0, length));
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
}

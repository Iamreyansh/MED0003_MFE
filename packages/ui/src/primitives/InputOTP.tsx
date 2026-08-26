import { Flex } from '../elements/Flex';
import { Text } from '../elements/Text';
import { cn } from '../lib/cn';
import { Input } from './Input';

export type InputOTPProps = {
  value?: string;
  onChange: (next: string) => void;
  length?: number;
  label: string;
  disabled?: boolean;
};

export function InputOTP({
  value,
  onChange,
  length = 6,
  label,
  disabled = false,
}: InputOTPProps) {
  const digits = value ?? '';

  return (
    <Flex direction="column" gap="2" data-slot="input-otp">
      <Text as="span">{label}</Text>
      <Flex gap="2" role="group" aria-label={label}>
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

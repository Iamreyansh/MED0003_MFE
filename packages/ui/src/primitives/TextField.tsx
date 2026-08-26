import { useState, type InputHTMLAttributes } from 'react';
import { Box } from '../elements/Box';
import { Flex } from '../elements/Flex';
import { Text } from '../elements/Text';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({
  label,
  id,
  className,
  error,
  type = 'text',
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const invalid = Boolean(error);
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);
  const resolvedType = isPassword && visible ? 'text' : type;

  return (
    <Flex direction="column" gap="2" className="font-mm text-mm-text">
      <Label htmlFor={inputId}>{label}</Label>
      {isPassword ? (
        <Box className="relative">
          <Input
            id={inputId}
            type={resolvedType}
            aria-invalid={invalid || undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              error ? 'border-mm-danger' : 'border-mm-border',
              'pr-12',
              className,
            )}
            {...props}
          />
          <Flex align="center" className="absolute inset-y-0 right-1">
            <Button
              type="button"
              variant="ghost"
              className="min-h-9 border-0 px-2 py-1 text-sm"
              aria-pressed={visible}
              onClick={() => setVisible((current) => !current)}
            >
              {visible ? 'Hide' : 'Show'}
            </Button>
          </Flex>
        </Box>
      ) : (
        <Input
          id={inputId}
          type={type}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            error ? 'border-mm-danger' : 'border-mm-border',
            className,
          )}
          {...props}
        />
      )}
      {error ? (
        <Text id={errorId} tone="error" size="sm" role="alert">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
}

import { Flex, Label, Text } from '@medmate/ui';
import type { TextareaHTMLAttributes } from 'react';

export function TextareaField({
  label,
  id,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const invalid = Boolean(error);

  return (
    <Flex direction="column" gap="2" className="font-mm text-mm-text">
      <Label htmlFor={inputId}>{label}</Label>
      <textarea
        id={inputId}
        aria-invalid={invalid || undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'min-h-24 w-full rounded-lg border bg-mm-surface px-3 py-2 font-mm text-mm-text transition-colors duration-mm ease-mm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus disabled:cursor-not-allowed disabled:opacity-55',
          error ? 'border-mm-danger' : 'border-mm-border',
          className ?? '',
        ].join(' ')}
        {...props}
      />
      {error ? (
        <Text id={errorId} tone="error" size="sm" role="alert">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
}

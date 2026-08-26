import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      className={cn(
        'min-h-11 w-full rounded-lg border border-mm-border bg-mm-surface px-3 py-2 font-mm text-mm-text transition-colors duration-mm ease-mm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus disabled:cursor-not-allowed disabled:opacity-55',
        className,
      )}
      {...props}
    />
  );
}

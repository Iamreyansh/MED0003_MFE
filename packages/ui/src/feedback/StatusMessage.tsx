import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StatusTone = 'neutral' | 'info' | 'error';

export type StatusMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  tone?: StatusTone;
};

const TONE = {
  neutral: 'text-mm-muted',
  info: 'text-mm-status-info',
  error: 'text-mm-status-error',
} as const;

export function StatusMessage({
  children,
  tone = 'neutral',
  className,
  ...props
}: StatusMessageProps) {
  return (
    <p
      role="status"
      data-slot="status-message"
      className={cn('m-0 font-mm', TONE[tone], className)}
      {...props}
    >
      {children}
    </p>
  );
}

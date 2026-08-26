import type { HTMLAttributes, ReactNode } from 'react';

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
  className = '',
  ...props
}: StatusMessageProps) {
  return (
    <p
      role="status"
      className={`m-0 font-mm ${TONE[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  );
}

import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

const BASE =
  'cursor-pointer rounded-lg px-3 py-2 font-mm text-mm-body transition-colors duration-mm ease-mm disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus';

const VARIANTS = {
  primary:
    'border border-transparent bg-mm-primary text-mm-primary-contrast hover:bg-mm-primary-hover',
  ghost: 'border border-mm-border bg-transparent text-mm-text hover:bg-mm-bg',
  danger:
    'border border-transparent bg-mm-danger text-mm-primary-contrast hover:bg-mm-danger-hover',
} as const;

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${className}`.trim()}
      {...props}
    />
  );
}

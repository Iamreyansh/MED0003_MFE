import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'ghost'
      ? 'mm-button mm-button--ghost'
      : variant === 'danger'
        ? 'mm-button mm-button--danger'
        : 'mm-button';

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`.trim()}
      {...props}
    />
  );
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({
  label,
  id,
  className = '',
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="mm-stack" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={`mm-input ${className}`.trim()}
        {...props}
      />
    </label>
  );
}

export type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <section className={`mm-card ${className}`.trim()} {...props}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

export { Button as MmButton, Card as MmCard, TextField as MmTextField };

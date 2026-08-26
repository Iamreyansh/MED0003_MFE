import type { InputHTMLAttributes } from 'react';

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
    <label
      className="flex flex-col gap-2 font-mm text-mm-text"
      htmlFor={inputId}
    >
      <span>{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-mm-border bg-mm-surface px-3 py-2 font-mm text-mm-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus ${className}`.trim()}
        {...props}
      />
    </label>
  );
}

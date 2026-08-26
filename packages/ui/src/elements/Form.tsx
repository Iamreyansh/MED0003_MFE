import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type FormProps = ComponentPropsWithoutRef<'form'>;

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, ...props },
  ref,
) {
  return (
    <form
      ref={ref}
      data-slot="form"
      className={cn('font-mm', className)}
      {...props}
    />
  );
});

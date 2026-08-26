import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
} from 'react';
import { Flex } from '../elements/Flex';
import { cn } from '../lib/cn';

export type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export type DialogTriggerProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Trigger
>;

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger(props, ref) {
    return (
      <DialogPrimitive.Trigger
        ref={ref}
        data-slot="dialog-trigger"
        {...props}
      />
    );
  },
);

export type DialogPortalProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Portal
>;

export function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export type DialogCloseProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Close
>;

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose(props, ref) {
    return (
      <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />
    );
  },
);

export type DialogOverlayProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
>;

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        data-slot="dialog-overlay"
        className={cn(
          'fixed inset-0 z-20 bg-mm-text/40 transition-opacity duration-mm ease-mm',
          className,
        )}
        {...props}
      />
    );
  },
);

export type DialogContentProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
>;

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, ...props }, ref) {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            'fixed top-1/2 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-mm border border-mm-border bg-mm-surface p-4 font-mm text-mm-text shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus',
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);

export type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <Flex
      direction="column"
      gap="2"
      data-slot="dialog-header"
      className={cn('mb-4', className)}
      {...props}
    />
  );
}

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <Flex
      justify="end"
      gap="2"
      data-slot="dialog-footer"
      className={cn(className)}
      {...props}
    />
  );
}

export type DialogTitleProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Title
        ref={ref}
        data-slot="dialog-title"
        className={cn(
          'm-0 font-mm-heading text-mm-title font-semibold leading-mm',
          className,
        )}
        {...props}
      />
    );
  },
);

export type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn('m-0 font-mm text-mm-muted', className)}
      {...props}
    />
  );
});

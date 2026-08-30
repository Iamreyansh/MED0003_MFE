import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@medmate/ui';
import { useEffect, useState } from 'react';

function isInternalPath(href: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:')) {
    return false;
  }
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function DirtyLeaveGuard({
  dirty,
  onNavigate,
  description = 'Changes have not been saved.',
}: {
  dirty: boolean;
  onNavigate?: (path: string) => void;
  description?: string;
}) {
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) {
      return undefined;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }
      const href = link.getAttribute('href');
      if (!href || !isInternalPath(href)) {
        return;
      }
      const nextPath = new URL(href, window.location.origin).pathname;
      if (nextPath === window.location.pathname) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setPending(href);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  return (
    <Dialog
      open={Boolean(pending)}
      onOpenChange={(open) => {
        if (!open) {
          setPending(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave without saving?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPending(null)}
          >
            Stay
          </Button>
          <Button
            type="button"
            onClick={() => {
              const href = pending;
              setPending(null);
              if (href) {
                onNavigate?.(href);
              }
            }}
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

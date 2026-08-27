import { Box, Spinner, cn } from '@medmate/ui';
import { ImageUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LogoPreview({ url, busy }: { url: string; busy?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = url.trim();
  const showImage = Boolean(src) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <Box
      className={cn(
        'relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-mm border bg-mm-bg',
        showImage ? 'border-mm-border' : 'border-dashed border-mm-border',
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt="Pharmacy logo"
          className="max-h-full max-w-full object-contain p-1.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <Box
          className="flex size-full items-center justify-center bg-mm-primary-soft text-mm-primary"
          aria-hidden
        >
          <ImageUp className="size-8" />
        </Box>
      )}
      {busy ? (
        <Box className="absolute inset-0 flex items-center justify-center bg-mm-surface/80">
          <Spinner size="sm" label="Uploading logo" />
        </Box>
      ) : null}
    </Box>
  );
}

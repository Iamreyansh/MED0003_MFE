import { Box, Flex, Label, Text, TextField, cn } from '@medmate/ui';
import { useState, type ChangeEvent, type DragEvent } from 'react';
import { LogoPreview } from './logo-preview';

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function logoFileError(file: File): string | undefined {
  if (file.size === 0) {
    return 'Choose a PNG or JPG image.';
  }
  if (file.size > MAX_LOGO_BYTES) {
    return 'Logo must be 2 MB or smaller.';
  }
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const typeOk = type === 'image/png' || type === 'image/jpeg';
  const nameOk =
    name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
  if (type) {
    if (!typeOk) {
      return 'Logo must be PNG or JPG.';
    }
    return undefined;
  }
  if (!nameOk) {
    return 'Logo must be PNG or JPG.';
  }
  return undefined;
}

export function LogoField({
  url,
  error,
  disabled,
  busy,
  onUrlChange,
  onFile,
}: {
  url: string;
  error?: string;
  disabled?: boolean;
  busy?: boolean;
  onUrlChange: (value: string) => void;
  onFile: (file: File) => void;
}) {
  const [localError, setLocalError] = useState<string>();
  const [over, setOver] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const shownError = localError;
  const locked = Boolean(disabled || busy);

  function takeFile(file: File | undefined) {
    if (!file || locked) {
      return;
    }
    const nextError = logoFileError(file);
    if (nextError) {
      setLocalError(nextError);
      return;
    }
    setLocalError(undefined);
    onFile(file);
  }

  return (
    <Flex direction="column" gap="3" className="sm:col-span-2">
      <Box
        data-testid="logo-dropzone"
        className={cn(
          'rounded-mm border bg-mm-surface p-4 transition-colors duration-mm',
          over && !locked
            ? 'border-mm-primary bg-mm-primary-soft'
            : 'border-mm-border',
        )}
        onDragEnter={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          if (!locked) {
            setOver(true);
          }
        }}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
        }}
        onDragLeave={() => {
          setOver(false);
        }}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setOver(false);
          takeFile(event.dataTransfer.files[0]);
        }}
      >
        <Flex align="start" gap="4" wrap>
          <LogoPreview url={url} busy={busy} />
          <Flex direction="column" gap="2" className="min-w-0 flex-1">
            <Label htmlFor="pharmacy-logo-file">Pharmacy logo</Label>
            <Text id="pharmacy-logo-hint" size="sm" tone="muted">
              PNG or JPG, up to 2 MB. You do not need a web link.
            </Text>
            <input
              id="pharmacy-logo-file"
              name="pharmacy_logo"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              disabled={locked}
              aria-invalid={shownError ? true : undefined}
              aria-describedby={
                shownError ? 'pharmacy-logo-error' : 'pharmacy-logo-hint'
              }
              className={cn(
                'min-h-11 w-full max-w-full cursor-pointer font-mm text-sm text-mm-text',
                'file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border-0',
                'file:bg-mm-primary file:px-3 file:font-mm file:text-sm file:text-mm-primary-contrast',
                'disabled:cursor-not-allowed disabled:opacity-55',
              )}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                takeFile(file);
              }}
            />
            {busy ? (
              <Text size="sm" tone="muted">
                Uploading…
              </Text>
            ) : null}
          </Flex>
        </Flex>
      </Box>
      {shownError ? (
        <Text id="pharmacy-logo-error" tone="error" size="sm" role="alert">
          {shownError}
        </Text>
      ) : null}
      <details
        className="rounded-mm border border-mm-border bg-mm-bg px-3 py-2"
        onToggle={(event) => {
          setShowLink((event.currentTarget as HTMLDetailsElement).open);
        }}
      >
        <summary className="cursor-pointer font-mm text-sm text-mm-text">
          Have a logo link instead?
        </summary>
        {showLink ? (
          <Box className="pt-3">
            <TextField
              label="Logo URL"
              name="logo_url"
              autoComplete="url"
              value={url.startsWith('blob:') ? '' : url}
              onChange={(event) => {
                setLocalError(undefined);
                onUrlChange(event.target.value);
              }}
              error={url.startsWith('blob:') ? undefined : error}
              disabled={disabled}
            />
          </Box>
        ) : null}
      </details>
    </Flex>
  );
}

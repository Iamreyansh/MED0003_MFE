import { Badge, Box, Flex, Label, Text } from '@medmate/ui';
import { FileUp } from 'lucide-react';
import type { ChangeEvent } from 'react';

export function FileDrop({
  id,
  fileName,
  disabled,
  onChange,
}: {
  id: string;
  fileName?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  return (
    <Flex direction="column" gap="2">
      <Label htmlFor={id}>Document file</Label>
      <Box className="rounded-mm border border-dashed border-mm-border bg-mm-bg p-4">
        <Flex align="center" gap="3" wrap>
          <Box className="flex size-10 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
            <FileUp className="size-5" aria-hidden />
          </Box>
          <Box className="min-w-0 flex-1">
            <input
              id={id}
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              disabled={disabled}
              className="min-h-11 w-full max-w-full cursor-pointer font-mm text-sm text-mm-text disabled:cursor-not-allowed"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                onChange(event.target.files?.[0] ?? null);
              }}
            />
            <Text size="sm" tone="muted" className="mt-1">
              PDF, JPG, or PNG. Type and status only — files are not previewed.
            </Text>
          </Box>
          {fileName ? (
            <Badge className="max-w-full truncate">{fileName}</Badge>
          ) : null}
        </Flex>
      </Box>
    </Flex>
  );
}

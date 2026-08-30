import {
  Box,
  cn,
  Fieldset,
  Flex,
  Heading,
  Text,
  VisuallyHidden,
} from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function SectionBlock({
  id,
  title,
  hint,
  icon: Icon,
  footer,
  headerEnd,
  density = 'default',
  children,
}: {
  id: string;
  title: string;
  hint: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  headerEnd?: ReactNode;
  density?: 'default' | 'compact';
  children: ReactNode;
}) {
  const compact = density === 'compact';
  return (
    <Fieldset
      id={id}
      className="overflow-hidden border-mm-border bg-mm-surface p-0 shadow-sm"
    >
      <Flex
        align="center"
        justify="between"
        gap="2"
        className={cn(
          'border-b border-mm-border',
          compact ? 'px-3 py-2' : 'px-4 py-3',
        )}
      >
        <Flex align="center" gap="2" className="min-w-0">
          {Icon && !compact ? (
            <Box className="flex size-9 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
              <Icon className="size-5" aria-hidden />
            </Box>
          ) : null}
          <Box className="min-w-0">
            <Heading
              level={2}
              className={compact ? 'text-base' : 'text-mm-title'}
            >
              {title}
            </Heading>
            {compact ? (
              <VisuallyHidden>{hint}</VisuallyHidden>
            ) : (
              <Text size="sm" tone="muted">
                {hint}
              </Text>
            )}
          </Box>
        </Flex>
        {headerEnd}
      </Flex>
      <Box className={compact ? 'p-3' : 'p-4'}>{children}</Box>
      {footer ? (
        <Flex
          align="center"
          justify="end"
          gap="3"
          className={cn(
            'border-t border-mm-border bg-mm-bg',
            compact ? 'px-3 py-2' : 'px-4 py-3',
          )}
        >
          {footer}
        </Flex>
      ) : null}
    </Fieldset>
  );
}

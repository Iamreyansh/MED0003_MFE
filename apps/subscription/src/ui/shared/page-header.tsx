import { Badge, Box, Flex, Heading, Text } from '@medmate/ui';
import { Rule } from './rule';

export function PageHeader({
  title,
  helper,
  badge,
  kicker,
}: {
  title: string;
  helper: string;
  badge?: string;
  kicker?: string;
}) {
  return (
    <Box as="header" className="mb-6">
      {kicker ? (
        <Box className="mb-3">
          <Text
            size="sm"
            className="font-mm-heading font-semibold uppercase tracking-[0.18em] text-mm-primary"
          >
            {kicker}
          </Text>
          <Rule />
        </Box>
      ) : null}
      <Flex align="start" justify="between" gap="3">
        <Box className="min-w-0">
          <Heading level={1}>{title}</Heading>
          <Text tone="muted" className="mt-2">
            {helper}
          </Text>
        </Box>
        {badge ? (
          <Badge tone="primary" className="mt-1 shrink-0">
            {badge}
          </Badge>
        ) : null}
      </Flex>
    </Box>
  );
}

import { Badge, Box, Flex, Heading, Text } from '@medmate/ui';

export function PageHeader({
  title,
  helper,
  badge,
}: {
  title: string;
  helper: string;
  badge?: string;
}) {
  return (
    <Box as="header" className="mb-6">
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

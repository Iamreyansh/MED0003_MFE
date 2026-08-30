import { Badge, Box, Flex, Heading, Text } from '@medmate/ui';

export function PageHeader({
  title,
  helper,
  kicker,
}: {
  title: string;
  helper: string;
  kicker?: string;
}) {
  return (
    <Box as="header" className="mb-3">
      <Flex align="center" gap="2" wrap>
        {kicker ? <Badge tone="primary">{kicker}</Badge> : null}
        <Heading level={1} className="text-mm-title">
          {title}
        </Heading>
      </Flex>
      <Text tone="muted" size="sm" className="mt-1">
        {helper}
      </Text>
    </Box>
  );
}

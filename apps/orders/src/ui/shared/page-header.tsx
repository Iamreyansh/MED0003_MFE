import { Box, Flex, Heading, Text } from '@medmate/ui';
import { Rule } from './rule';

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
      {kicker ? (
        <Box className="mb-2">
          <Text
            size="sm"
            className="font-mm-heading font-semibold uppercase tracking-[0.18em] text-mm-primary"
          >
            {kicker}
          </Text>
          <Rule />
        </Box>
      ) : null}
      <Flex align="baseline" gap="3" wrap>
        <Heading level={1} className="text-mm-title">
          {title}
        </Heading>
        <Text size="sm" tone="muted">
          {helper}
        </Text>
      </Flex>
    </Box>
  );
}

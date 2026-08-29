import type { CurrentSubscription } from '@medmate/subscription-contract';
import { Badge, Box, Card, Flex, Text } from '@medmate/ui';
import { BookmarkCheck } from 'lucide-react';
import { PLANS_COPY } from '../../lib/copy';
import { AutoRenewSwitch } from '../shared/auto-renew';
import { IconTile } from '../shared/icon-tile';

export function StatusStrip({
  currentLabel,
  trial,
  canWrite,
  subscription,
  busy,
  disabled,
  onToggleAutoRenew,
}: {
  currentLabel: string;
  trial: boolean;
  canWrite: boolean;
  subscription: CurrentSubscription | null;
  busy: boolean;
  disabled?: boolean;
  onToggleAutoRenew: (enabled: boolean) => void;
}) {
  return (
    <Card>
      <Flex align="center" justify="between" gap="3" wrap>
        <Flex align="center" gap="3" className="min-w-0">
          <IconTile icon={BookmarkCheck} />
          <Box className="min-w-0">
            <Text
              size="sm"
              className="font-mm-heading font-semibold uppercase tracking-[0.14em] text-mm-muted"
            >
              {PLANS_COPY.nowOn}
            </Text>
            <Flex align="center" gap="2" wrap className="mt-1">
              <Badge tone="primary" data-testid="current-plan-chip">
                {PLANS_COPY.current}: {currentLabel}
              </Badge>
              {trial ? (
                <Badge data-testid="trial-badge">{PLANS_COPY.trial}</Badge>
              ) : null}
            </Flex>
          </Box>
        </Flex>
        {canWrite ? (
          <AutoRenewSwitch
            checked={Boolean(subscription?.auto_renew)}
            disabled={busy || disabled}
            onToggle={onToggleAutoRenew}
          />
        ) : null}
      </Flex>
    </Card>
  );
}

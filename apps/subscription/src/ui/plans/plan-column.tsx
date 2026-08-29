import type { PlanCard } from '@medmate/subscription-contract';
import { Badge, Box, Button, Flex, Heading, Text, cn } from '@medmate/ui';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { PLANS_COPY } from '../../lib/copy';
import { IconTile } from '../shared/icon-tile';
import {
  actionLabel,
  annualCell,
  monthlyCell,
  planIcon,
  seatFill,
  type ConfirmKind,
} from './plan-meta';

function MatrixCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Box
      className={cn(
        'flex min-h-14 items-center border-b border-mm-border px-3 py-3',
        className,
      )}
    >
      {children}
    </Box>
  );
}

export function PlanColumn({
  plan,
  title,
  isCurrent,
  kind,
  canWrite,
  busy,
  onSelect,
}: {
  plan: PlanCard;
  title: string;
  isCurrent: boolean;
  kind: ConfirmKind | null;
  canWrite: boolean;
  busy: boolean;
  onSelect: (kind: ConfirmKind, plan: PlanCard) => void;
}) {
  const Icon = planIcon(plan.name);
  const monthly = monthlyCell(plan);
  const annual = annualCell(plan);
  const hasSeats = typeof plan.seat_limit === 'number';
  const modules = plan.included_modules ?? [];

  return (
    <Box
      data-testid={`plan-card-${plan.name}`}
      data-plan-name={plan.name}
      aria-current={isCurrent ? 'true' : undefined}
      className={cn(
        'row-span-5 grid grid-rows-subgrid border-l border-mm-border transition-colors duration-mm ease-mm',
        isCurrent
          ? 'border-t-4 border-t-mm-primary bg-mm-primary-soft'
          : 'hover:bg-mm-bg',
      )}
    >
      <Flex
        direction="column"
        align="start"
        gap="2"
        className={cn(
          'min-h-32 justify-end border-b border-mm-border px-3 py-4',
          isCurrent ? 'bg-mm-primary text-mm-primary-contrast' : undefined,
        )}
      >
        <IconTile icon={Icon} tone={isCurrent ? 'contrast' : 'primary'} />
        <Heading
          level={3}
          className={cn(
            'text-mm-title',
            isCurrent ? 'text-mm-primary-contrast' : undefined,
          )}
        >
          {title}
        </Heading>
        {isCurrent ? (
          <Badge data-testid="plan-current-mark">{PLANS_COPY.current}</Badge>
        ) : null}
      </Flex>
      <MatrixCell>
        <Text
          className={cn(
            'font-mm-heading font-semibold',
            monthly !== '—' && monthly !== 'Contact us / custom'
              ? 'text-mm-display leading-none'
              : undefined,
          )}
        >
          {monthly}
        </Text>
      </MatrixCell>
      <MatrixCell>
        <Text tone="muted">{annual}</Text>
      </MatrixCell>
      <MatrixCell>
        {hasSeats ? (
          <Flex direction="column" align="start" gap="2">
            <Flex gap="1" aria-hidden>
              {seatFill(plan.seat_limit!).map((filled, slot) => (
                <Box
                  key={slot}
                  className={cn(
                    'h-1.5 w-3 rounded-sm',
                    filled ? 'bg-mm-primary' : 'bg-mm-border',
                  )}
                />
              ))}
            </Flex>
            <Text>
              {PLANS_COPY.seats}: {plan.seat_limit}
            </Text>
          </Flex>
        ) : (
          <Text tone="muted">—</Text>
        )}
      </MatrixCell>
      <MatrixCell className="h-full min-h-32 items-stretch self-stretch border-b-0">
        <Flex
          direction="column"
          align="start"
          gap="3"
          className="h-full min-h-full w-full"
        >
          {modules.length ? (
            <Box as="ul" className="m-0 flex list-none flex-col gap-2 p-0">
              {modules.map((moduleName) => (
                <Flex as="li" key={moduleName} align="center" gap="2">
                  <Check
                    className="size-4 shrink-0 text-mm-primary"
                    aria-hidden
                  />
                  <Text>{moduleName}</Text>
                </Flex>
              ))}
            </Box>
          ) : (
            <Text tone="muted">—</Text>
          )}
          {canWrite && kind ? (
            <Button
              type="button"
              className="mt-auto"
              disabled={busy}
              onClick={() => onSelect(kind, plan)}
            >
              {actionLabel(kind)}
            </Button>
          ) : null}
        </Flex>
      </MatrixCell>
    </Box>
  );
}

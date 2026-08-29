import type { PlanCard } from '@medmate/subscription-contract';
import { Box, Text, cn } from '@medmate/ui';
import type { ReactNode } from 'react';
import { PLANS_COPY } from '../../lib/copy';
import { PlanColumn } from './plan-column';
import type { ConfirmKind } from './plan-meta';

export type MatrixPlan = {
  plan: PlanCard;
  title: string;
  isCurrent: boolean;
  kind: ConfirmKind | null;
};

function SpecCell({
  children,
  className,
}: {
  children?: ReactNode;
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

export function ComparisonMatrix({
  plans,
  canWrite,
  busy,
  onSelect,
}: {
  plans: MatrixPlan[];
  canWrite: boolean;
  busy: boolean;
  onSelect: (kind: ConfirmKind, plan: PlanCard) => void;
}) {
  return (
    <Box data-testid="plans-matrix" className="overflow-x-auto">
      <Box className="grid min-w-max grid-flow-col grid-rows-[auto_repeat(4,minmax(3.5rem,auto))] auto-cols-[minmax(11rem,1fr)]">
        <Box className="sticky left-0 z-10 row-span-5 grid grid-rows-subgrid bg-mm-surface">
          <Box className="min-h-32 border-b border-mm-border" />
          <SpecCell>
            <Text size="sm" tone="muted">
              {PLANS_COPY.monthly}
            </Text>
          </SpecCell>
          <SpecCell>
            <Text size="sm" tone="muted">
              {PLANS_COPY.annual}
            </Text>
          </SpecCell>
          <SpecCell>
            <Text size="sm" tone="muted">
              {PLANS_COPY.seats}
            </Text>
          </SpecCell>
          <SpecCell className="items-start border-b-0">
            <Text size="sm" tone="muted">
              {PLANS_COPY.modules}
            </Text>
          </SpecCell>
        </Box>
        {plans.map((item) => (
          <PlanColumn
            key={item.plan.id}
            plan={item.plan}
            title={item.title}
            isCurrent={item.isCurrent}
            kind={item.kind}
            canWrite={canWrite}
            busy={busy}
            onSelect={onSelect}
          />
        ))}
      </Box>
    </Box>
  );
}

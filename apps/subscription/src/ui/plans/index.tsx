import type {
  CurrentSubscription,
  PlanCard,
  SubscriptionFeatureData,
} from '@medmate/subscription-contract';
import {
  cancelCopy,
  currentPlanCode,
  downgradeCopy,
  mapPlanCode,
  planDisplayLabel,
  planLabelFromUnknown,
} from '@medmate/subscription-contract';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Grid,
  Heading,
  PageSection,
  Spinner,
  Stack,
  Text,
} from '@medmate/ui';
import { CircleAlert, Lock, Rows3 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PLANS_COPY } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { IconTile } from '../shared/icon-tile';
import { ComparisonMatrix, type MatrixPlan } from './comparison-matrix';
import { changeKind, type ConfirmKind } from './plan-meta';
import { StatusStrip } from './status-strip';

export function PlansScreen({
  feature,
  onNavigate,
  createIdempotencyKey,
}: {
  feature: SubscriptionFeatureData;
  onNavigate?: (path: string) => void;
  createIdempotencyKey?: () => string;
}) {
  const canWrite = Boolean(feature.canWrite);
  const isStaff = feature.role === 'pharmacy_staff';
  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  );
  const [plansForbidden, setPlansForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind;
    plan?: PlanCard;
  } | null>(null);
  const intentKeys = useRef<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setErrorCode(undefined);
    const result = await feature.onSubmit({ screen: 'plans', action: 'load' });
    setLoading(false);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'Unable to load plans.');
      setErrorCode(result.code);
      return;
    }
    setPlans(result.plans ?? []);
    setSubscription(result.subscription ?? null);
    setPlansForbidden(Boolean(result.plansForbidden));
  }, [feature]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = currentPlanCode(subscription);
  const currentLabel = planLabelFromUnknown(
    subscription?.current_plan ?? subscription?.plan ?? current,
  );
  const pastDue = subscription?.status === 'PAST_DUE';
  const trial = subscription?.status === 'TRIAL';

  const matrixPlans = useMemo<MatrixPlan[]>(
    () =>
      plans.map((plan) => {
        const code = mapPlanCode(plan.name);
        return {
          plan,
          title: code
            ? planDisplayLabel(code)
            : planLabelFromUnknown(plan.name),
          isCurrent: Boolean(code && current === code),
          kind: changeKind(current, code),
        };
      }),
    [current, plans],
  );

  function intentKey(kind: ConfirmKind, planId: string): string {
    const slot = `${kind}:${planId}`;
    if (!intentKeys.current[slot]) {
      intentKeys.current[slot] = createIdempotencyKey
        ? createIdempotencyKey()
        : `intent-${slot}`;
    }
    return intentKeys.current[slot];
  }

  async function runChange(kind: ConfirmKind, plan?: PlanCard) {
    setBusy(true);
    setError(undefined);
    setErrorCode(undefined);
    const result =
      kind === 'cancel'
        ? await feature.onSubmit({ screen: 'plans', action: 'cancel' })
        : kind === 'subscribe'
          ? await feature.onSubmit({
              screen: 'plans',
              action: 'subscribe',
              values: {
                plan_id: plan!.id,
                idempotencyKey: intentKey('subscribe', plan!.id),
              },
            })
          : kind === 'upgrade'
            ? await feature.onSubmit({
                screen: 'plans',
                action: 'upgrade',
                values: {
                  plan_id: plan!.id,
                  idempotencyKey: intentKey('upgrade', plan!.id),
                },
              })
            : await feature.onSubmit({
                screen: 'plans',
                action: 'downgrade',
                values: { plan_id: plan!.id },
              });
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'Unable to change plan.');
      setErrorCode(result.code);
      return;
    }
    setConfirm(null);
    if (result.subscription) {
      setSubscription(result.subscription);
    }
    if (result.plans) {
      setPlans(result.plans);
    }
  }

  async function toggleAutoRenew(enabled: boolean) {
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'plans',
      action: 'autoRenew',
      values: { enabled },
    });
    setBusy(false);
    if (!result.ok) {
      setError(
        result.formError ?? result.code ?? 'Unable to update auto-renew.',
      );
      setErrorCode(result.code);
      return;
    }
    setSubscription(
      result.subscription ?? { ...subscription, auto_renew: enabled },
    );
  }

  if (loading) {
    return (
      <Grid
        data-testid="plans-skeleton"
        aria-busy="true"
        aria-label="Loading plans"
        cols="4"
        gap="4"
      >
        {['a', 'b', 'c', 'd'].map((slot) => (
          <Box
            key={slot}
            className="h-48 animate-pulse rounded-mm border border-mm-border bg-mm-surface"
          />
        ))}
      </Grid>
    );
  }

  const showForbidden =
    plansForbidden || (isStaff && !canWrite && plans.length === 0);

  return (
    <Stack gap="4" data-testid="plans-panel">
      {pastDue ? (
        <Alert data-testid="past-due-banner">
          <Flex align="start" gap="3">
            <IconTile icon={CircleAlert} tone="danger" />
            <Box className="min-w-0">
              {PLANS_COPY.pastDue}{' '}
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate?.('/billing')}
              >
                {PLANS_COPY.payCta}
              </Button>
            </Box>
          </Flex>
        </Alert>
      ) : null}
      {isStaff ? <Text tone="muted">{PLANS_COPY.staffHelper}</Text> : null}
      <StatusStrip
        currentLabel={currentLabel}
        trial={trial}
        canWrite={canWrite}
        subscription={subscription}
        busy={busy}
        disabled={feature.disabled}
        onToggleAutoRenew={(enabled) => {
          void toggleAutoRenew(enabled);
        }}
      />
      <FormBanner
        message={
          error ? `${error}${errorCode ? ` (${errorCode})` : ''}` : undefined
        }
        testId="plans-error"
      />
      {showForbidden ? (
        <Alert data-testid="plans-forbidden">
          <Flex align="start" gap="3">
            <IconTile icon={Lock} tone="danger" />
            <Text>{PLANS_COPY.forbidden}</Text>
          </Flex>
        </Alert>
      ) : null}
      {plans.length === 0 && !plansForbidden ? (
        <Card role="status">
          <Flex align="start" gap="3">
            <IconTile icon={Rows3} tone="muted" />
            <Text>{PLANS_COPY.empty}</Text>
          </Flex>
        </Card>
      ) : plans.length > 0 ? (
        <PageSection className="overflow-hidden p-0">
          <Flex
            align="start"
            justify="between"
            gap="3"
            wrap
            className="border-b border-mm-border px-4 py-3"
          >
            <Box className="min-w-0">
              <Heading level={2}>{PLANS_COPY.catalogue}</Heading>
              <Text size="sm" tone="muted">
                {PLANS_COPY.compareHint}
              </Text>
            </Box>
          </Flex>
          <ComparisonMatrix
            plans={matrixPlans}
            canWrite={canWrite}
            busy={busy}
            onSelect={(kind, plan) => setConfirm({ kind, plan })}
          />
        </PageSection>
      ) : null}
      {canWrite && current && current !== 'FREE' ? (
        <Button
          type="button"
          variant="danger"
          disabled={busy}
          onClick={() => setConfirm({ kind: 'cancel' })}
        >
          {PLANS_COPY.cancel}
        </Button>
      ) : null}
      {busy ? <Spinner data-testid="plans-busy" /> : null}
      <Dialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.kind === 'subscribe'
                ? PLANS_COPY.confirmSubscribe
                : confirm?.kind === 'upgrade'
                  ? PLANS_COPY.confirmUpgrade
                  : confirm?.kind === 'downgrade'
                    ? PLANS_COPY.confirmDowngrade
                    : PLANS_COPY.confirmCancel}
            </DialogTitle>
            <DialogDescription>
              {confirm?.kind === 'downgrade'
                ? downgradeCopy()
                : confirm?.kind === 'cancel'
                  ? cancelCopy()
                  : planLabelFromUnknown(confirm?.plan?.name)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirm(null)}
            >
              {PLANS_COPY.close}
            </Button>
            <Button
              type="button"
              variant={confirm?.kind === 'cancel' ? 'danger' : 'primary'}
              disabled={busy}
              onClick={() => {
                if (confirm) {
                  void runChange(confirm.kind, confirm.plan);
                }
              }}
            >
              {confirm?.kind === 'cancel'
                ? PLANS_COPY.cancel
                : confirm?.kind === 'subscribe'
                  ? PLANS_COPY.subscribe
                  : confirm?.kind === 'upgrade'
                    ? PLANS_COPY.upgrade
                    : PLANS_COPY.downgrade}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

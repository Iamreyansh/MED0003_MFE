import type {
  OnboardingFeatureData,
  RegistrationStatusPayload,
} from '@medmate/onboarding-contract';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Stack,
  StatusMessage,
  Text,
  cn,
} from '@medmate/ui';
import { Check, Circle, FileUp, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isAttentionStatus, statusLabel } from '../../lib/copy';
import { statusProgressStep } from '../../lib/flow';

const STEPS = [
  { id: 'email', label: 'Email verified' },
  { id: 'kyc', label: 'KYC documents' },
  { id: 'review', label: 'HQ review' },
  { id: 'active', label: 'Active' },
] as const;

export function StatusScreen({
  feature,
  onNavigate,
}: {
  feature: OnboardingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [payload, setPayload] = useState<RegistrationStatusPayload | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(action: 'load' | 'refresh' = 'load'): Promise<void> {
    setLoading(true);
    const result = await feature.onSubmit({ screen: 'status', action });
    setLoading(false);
    if (!result.ok) {
      setError(result.formError ?? 'Unable to load registration status.');
      return;
    }
    setError(null);
    setPayload(result.status ?? {});
  }

  useEffect(() => {
    void load('load');
    const interval = Math.max(feature.pollIntervalMs ?? 30_000, 30_000);
    const id = window.setInterval(() => {
      void load('refresh');
    }, interval);
    return () => window.clearInterval(id);
    // Host owns fetch; screen identity is the only trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature.screen]);

  const status = payload?.status;
  const step = statusProgressStep(status, payload?.email_verified);
  const reason = payload?.kyc?.rejection_reason;
  const plan = payload?.plan === 'FREE' ? 'Free' : payload?.plan;
  const uploaded = payload?.kyc?.documents_uploaded;
  const required = payload?.kyc?.documents_required;

  return (
    <Stack gap="4" data-testid="onboarding-status">
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {loading && !payload ? (
        <StatusMessage>Loading registration status…</StatusMessage>
      ) : null}
      {payload ? (
        <>
          <Card className="overflow-hidden p-0">
            <Box className="border-b border-mm-border bg-mm-primary-soft px-5 py-4">
              <Flex align="start" justify="between" gap="3" wrap>
                <Box className="min-w-0">
                  <Text size="sm" tone="muted">
                    Pharmacy
                  </Text>
                  <Text className="mt-1 font-mm-heading text-mm-title font-semibold">
                    {payload.business_name ?? 'Your pharmacy'}
                  </Text>
                  {typeof uploaded === 'number' &&
                  typeof required === 'number' ? (
                    <Text size="sm" tone="muted" className="mt-1">
                      {uploaded} of {required} files on file
                    </Text>
                  ) : null}
                </Box>
                <Flex align="center" gap="2" wrap>
                  <Badge
                    tone={
                      isAttentionStatus(String(status ?? ''))
                        ? 'default'
                        : 'primary'
                    }
                    className={
                      isAttentionStatus(String(status ?? ''))
                        ? 'bg-mm-danger/10 text-mm-danger'
                        : undefined
                    }
                  >
                    {statusLabel(String(status ?? 'PENDING_KYC'))}
                  </Badge>
                  {plan ? <Badge>{plan}</Badge> : null}
                </Flex>
              </Flex>
            </Box>
            <Box className="p-5">
              <Text size="sm" className="mb-4 font-semibold">
                Progress
              </Text>
              <ol className="m-0 flex list-none flex-col gap-0 p-0">
                {STEPS.map((item, index) => {
                  const state =
                    index < step
                      ? 'done'
                      : index === step
                        ? 'current'
                        : 'upcoming';
                  const last = index === STEPS.length - 1;
                  return (
                    <li key={item.id} className="flex gap-3">
                      <Flex direction="column" align="center" className="w-7">
                        <Box
                          aria-hidden
                          className={cn(
                            'flex size-7 items-center justify-center rounded-full',
                            state === 'upcoming'
                              ? 'border border-mm-border text-mm-muted'
                              : 'bg-mm-primary text-mm-primary-contrast',
                            state === 'current'
                              ? 'outline outline-2 outline-offset-2 outline-mm-primary'
                              : undefined,
                          )}
                        >
                          {state === 'done' ? (
                            <Check className="size-4" />
                          ) : state === 'current' ? (
                            <Circle className="size-3 fill-current" />
                          ) : (
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </Box>
                        {last ? null : (
                          <Box
                            aria-hidden
                            className={cn(
                              'my-1 min-h-4 w-px flex-1',
                              index < step ? 'bg-mm-primary' : 'bg-mm-border',
                            )}
                          />
                        )}
                      </Flex>
                      <Box className={last ? 'pb-0' : 'pb-4'}>
                        <Text>
                          {item.label}
                          {state === 'current' ? ' (current)' : ''}
                          {state === 'done' ? ' (done)' : ''}
                        </Text>
                      </Box>
                    </li>
                  );
                })}
              </ol>
            </Box>
          </Card>
          {status === 'PENDING_KYC' ? (
            <Button
              type="button"
              size="lg"
              onClick={() => onNavigate?.('/onboarding/kyc')}
            >
              <FileUp className="mr-2 size-4" aria-hidden />
              Upload KYC documents
            </Button>
          ) : null}
          {status === 'KYC_SUBMITTED' ? (
            <StatusMessage tone="info">
              Documents are with HQ. Marketplace routes stay blocked until the
              pharmacy is active.
            </StatusMessage>
          ) : null}
          {status === 'REJECTED' ? (
            <StatusMessage tone="error">
              {reason
                ? `Rejected: ${reason}`
                : 'KYC was rejected. Upload a corrected pack and resubmit.'}
            </StatusMessage>
          ) : null}
          {status === 'SUSPENDED' ? (
            <StatusMessage tone="error">
              This pharmacy is suspended. Marketplace actions stay blocked.
            </StatusMessage>
          ) : null}
          {status === 'ACTIVE' ? (
            <Button type="button" size="lg" onClick={() => onNavigate?.('/')}>
              Continue to home
            </Button>
          ) : null}
        </>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        disabled={loading}
        onClick={() => {
          void load('refresh');
        }}
      >
        <RefreshCw className="mr-2 size-4" aria-hidden />
        {loading ? 'Refreshing…' : 'Refresh'}
      </Button>
    </Stack>
  );
}

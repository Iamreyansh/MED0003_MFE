import type {
  SaasInvoice,
  SubscriptionFeatureData,
} from '@medmate/subscription-contract';
import { checkoutHref, invoiceIsPaid } from '@medmate/subscription-contract';
import {
  Alert,
  Box,
  Card,
  Flex,
  Heading,
  PageSection,
  Spinner,
  Stack,
  Text,
} from '@medmate/ui';
import { Lock, Receipt } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BILLING_COPY } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { IconTile } from '../shared/icon-tile';
import { InvoiceSlip } from './invoice-slip';

function invoiceIdFromSearch(): string | null {
  return new URLSearchParams(window.location.search).get('invoice_id');
}

export function BillingScreen({
  feature,
  onNavigate,
  createIdempotencyKey,
}: {
  feature: SubscriptionFeatureData;
  onNavigate?: (path: string) => void;
  createIdempotencyKey?: () => string;
}) {
  const canWrite = Boolean(feature.canWrite);
  const [invoices, setInvoices] = useState<SaasInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [sessionHint, setSessionHint] = useState<string | null>(null);
  const intentKeys = useRef<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'billing',
      action: 'load',
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'Unable to load invoices.');
      setErrorCode(result.code);
      return;
    }
    setInvoices(result.invoices ?? []);
  }, [feature]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const invoiceId = invoiceIdFromSearch();
    if (!invoiceId) {
      return;
    }
    let cancelled = false;
    void feature
      .onSubmit({
        screen: 'billing',
        action: 'loadInvoice',
        values: { id: invoiceId },
      })
      .then((result) => {
        if (cancelled || !result.ok) {
          return;
        }
        if (result.invoice) {
          setInvoices((current) => {
            const next = current.filter((row) => row.id !== result.invoice?.id);
            return [result.invoice!, ...next];
          });
          if (!invoiceIsPaid(result.invoice)) {
            setProcessingId(result.invoice.id);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [feature]);

  async function pay(invoiceId: string) {
    if (!intentKeys.current[invoiceId]) {
      intentKeys.current[invoiceId] =
        createIdempotencyKey?.() ?? `pay-${invoiceId}`;
    }
    setBusyId(invoiceId);
    setError(undefined);
    setSessionHint(null);
    const result = await feature.onSubmit({
      screen: 'billing',
      action: 'pay',
      values: {
        invoice_id: invoiceId,
        idempotencyKey: intentKeys.current[invoiceId],
      },
    });
    setBusyId(null);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'Unable to start payment.');
      setErrorCode(result.code);
      return;
    }
    const href = checkoutHref(result.pay);
    if (href) {
      onNavigate?.(href);
      return;
    }
    if (result.pay?.payment_session_id) {
      setSessionHint(BILLING_COPY.sessionOnly);
    }
  }

  if (loading) {
    return (
      <Spinner data-testid="billing-loading" aria-label="Loading invoices" />
    );
  }

  if (errorCode === 'FORBIDDEN' && !canWrite) {
    return (
      <Alert data-testid="billing-forbidden">
        <Flex align="start" gap="3">
          <IconTile icon={Lock} tone="danger" />
          <Text>{BILLING_COPY.forbidden}</Text>
        </Flex>
      </Alert>
    );
  }

  return (
    <Stack gap="4" data-testid="billing-panel">
      <FormBanner
        message={
          error ? `${error}${errorCode ? ` (${errorCode})` : ''}` : undefined
        }
        testId="billing-error"
      />
      {processingId ? (
        <Alert data-testid="billing-processing">
          {BILLING_COPY.processing}
        </Alert>
      ) : null}
      {sessionHint ? (
        <Alert data-testid="billing-session">{sessionHint}</Alert>
      ) : null}
      {invoices.length === 0 ? (
        <Card data-testid="billing-empty" role="status">
          <Flex align="start" gap="3">
            <IconTile icon={Receipt} tone="muted" />
            <Text>{BILLING_COPY.empty}</Text>
          </Flex>
        </Card>
      ) : (
        <PageSection className="overflow-hidden p-0">
          <Box className="border-b border-mm-border px-4 py-3">
            <Heading level={2}>{BILLING_COPY.tableLabel}</Heading>
          </Box>
          <Stack
            as="ul"
            gap="3"
            className="m-0 list-none p-4"
            aria-label={BILLING_COPY.tableLabel}
          >
            {invoices.map((invoice) => (
              <Box as="li" key={invoice.id} className="list-none">
                <InvoiceSlip
                  invoice={invoice}
                  canWrite={canWrite}
                  paying={busyId === invoice.id}
                  onPay={(id) => {
                    void pay(id);
                  }}
                />
              </Box>
            ))}
          </Stack>
        </PageSection>
      )}
    </Stack>
  );
}

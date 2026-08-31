import type { SaasInvoice } from '@medmate/subscription-contract';
import {
  invoiceAmountLabel,
  invoiceIsPaid,
} from '@medmate/subscription-contract';
import { Badge, Box, Button, Card, Flex, Text } from '@medmate/ui';
import { CircleCheck, Receipt } from 'lucide-react';
import { BILLING_COPY } from '../../lib/copy';
import { IconTile } from '../shared/icon-tile';

export function InvoiceSlip({
  invoice,
  canWrite,
  paying,
  paymentsDisabled,
  onPay,
}: {
  invoice: SaasInvoice;
  canWrite: boolean;
  paying: boolean;
  paymentsDisabled?: boolean;
  onPay: (invoiceId: string) => void;
}) {
  const paid = invoiceIsPaid(invoice);
  return (
    <Card data-testid={`invoice-${invoice.id}`}>
      <Flex align="center" justify="between" gap="3" wrap>
        <Flex align="start" gap="3" className="min-w-0">
          <IconTile
            icon={paid ? CircleCheck : Receipt}
            tone={paid ? 'muted' : 'primary'}
          />
          <Box className="min-w-0">
            <Badge>{paid ? BILLING_COPY.settled : BILLING_COPY.open}</Badge>
            <Text className="mt-1 font-mm-heading font-semibold">
              {invoice.id}
            </Text>
            <Text size="sm" tone="muted">
              {invoice.status ?? '—'}
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap="3">
          <Text className="font-mm-heading text-mm-display font-semibold leading-none">
            {invoiceAmountLabel(invoice)}
          </Text>
          {canWrite && !paid && !paymentsDisabled ? (
            <Button
              type="button"
              disabled={paying}
              onClick={() => {
                onPay(invoice.id);
              }}
            >
              {BILLING_COPY.pay}
            </Button>
          ) : null}
          {canWrite && !paid && paymentsDisabled ? (
            <Text size="sm" tone="muted">
              {BILLING_COPY.paymentsDisabled}
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
}

import type {
  DiscountType,
  PaymentMethod,
  PosCart,
  PosReceipt,
} from '@medmate/pos-contract';
import {
  DISCOUNT_TYPES,
  formatInr,
  openAfterFullLoginCopy,
  PAYMENT_METHODS,
  paymentMethodLabel,
} from '@medmate/pos-contract';
import {
  Badge,
  Box,
  Button,
  Fieldset,
  Flex,
  Separator,
  Stack,
  StatusMessage,
  Text,
  TextField,
} from '@medmate/ui';
import { COUNTER_COPY } from '../../lib/copy';
import { ChoiceGroup } from './choice-group';

export function TicketPanel({
  cart,
  phone,
  name,
  discountType,
  discountValue,
  method,
  amountPaid,
  upi,
  doctor,
  paying,
  busy,
  empty,
  scoped,
  receipt,
  onPhoneChange,
  onNameChange,
  onAttach,
  onDiscountTypeChange,
  onDiscountValueChange,
  onApplyDiscount,
  onMethodChange,
  onAmountPaidChange,
  onUpiChange,
  onDoctorChange,
  onCheckout,
  onNavigate,
}: {
  cart: PosCart | null;
  phone: string;
  name: string;
  discountType: DiscountType;
  discountValue: string;
  method: PaymentMethod;
  amountPaid: string;
  upi: string;
  doctor: string;
  paying: boolean;
  busy: boolean;
  empty: boolean;
  scoped: boolean;
  receipt: PosReceipt | null;
  onPhoneChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onAttach: () => void;
  onDiscountTypeChange: (value: DiscountType) => void;
  onDiscountValueChange: (value: string) => void;
  onApplyDiscount: () => void;
  onMethodChange: (value: PaymentMethod) => void;
  onAmountPaidChange: (value: string) => void;
  onUpiChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onCheckout: () => void;
  onNavigate?: (path: string) => void;
}) {
  return (
    <Fieldset className="overflow-hidden border-mm-border bg-mm-surface p-0 shadow-sm lg:sticky lg:top-3">
      <Box className="border-b border-mm-border px-3 py-2">
        <Text className="font-mm-heading font-semibold">
          {COUNTER_COPY.pay}
        </Text>
        <Text size="sm" tone="muted">
          {COUNTER_COPY.payHint}
        </Text>
      </Box>

      <Stack gap="3" className="p-3">
        <Stack gap="2">
          <Text size="sm" className="font-medium">
            {COUNTER_COPY.customer}
          </Text>
          {cart?.customer ? (
            <Badge tone="primary" data-testid="pos-customer">
              {cart.customer.name ?? cart.customer.phone}
            </Badge>
          ) : null}
          <Flex gap="2" className="flex-col sm:flex-row lg:flex-col">
            <Box className="min-w-0 flex-1">
              <TextField
                label={COUNTER_COPY.phone}
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
              />
            </Box>
            <Box className="min-w-0 flex-1">
              <TextField
                label={COUNTER_COPY.name}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </Box>
          </Flex>
          <Button
            type="button"
            variant="ghost"
            className="min-h-9 w-full text-sm"
            onClick={onAttach}
            disabled={busy}
          >
            {COUNTER_COPY.attach}
          </Button>
        </Stack>

        <Separator />

        <Stack gap="2">
          <Text size="sm" tone="muted">
            {COUNTER_COPY.discountHint} {COUNTER_COPY.discountCap}
          </Text>
          <ChoiceGroup
            legend={COUNTER_COPY.discountType}
            name="pos-discount-type"
            value={discountType}
            options={DISCOUNT_TYPES.map((value) => ({
              value,
              label:
                value === 'FLAT_RS' ? COUNTER_COPY.flat : COUNTER_COPY.percent,
            }))}
            onChange={onDiscountTypeChange}
          />
          <Flex gap="2" align="end">
            <Box className="min-w-0 flex-1">
              <TextField
                label={
                  discountType === 'PERCENTAGE'
                    ? COUNTER_COPY.discountPercent
                    : COUNTER_COPY.discountValue
                }
                inputMode="decimal"
                value={discountValue}
                onChange={(event) => onDiscountValueChange(event.target.value)}
              />
            </Box>
            <Button
              type="button"
              variant="ghost"
              className="min-h-9 px-2 text-sm"
              onClick={onApplyDiscount}
              disabled={busy}
            >
              {COUNTER_COPY.applyDiscount}
            </Button>
          </Flex>
        </Stack>

        <Separator />

        <Stack gap="2" data-testid="pos-checkout">
          <ChoiceGroup
            legend={COUNTER_COPY.method}
            name="pos-payment-method"
            value={method}
            options={PAYMENT_METHODS.map((value) => ({
              value,
              label: paymentMethodLabel(value),
            }))}
            onChange={onMethodChange}
          />
          <TextField
            label={COUNTER_COPY.amountPaid}
            inputMode="decimal"
            value={amountPaid}
            onChange={(event) => onAmountPaidChange(event.target.value)}
          />
          {method === 'UPI' ? (
            <TextField
              label={COUNTER_COPY.upi}
              value={upi}
              onChange={(event) => onUpiChange(event.target.value)}
            />
          ) : null}
          {cart?.rx_items_present ? (
            <TextField
              label={COUNTER_COPY.doctor}
              value={doctor}
              onChange={(event) => onDoctorChange(event.target.value)}
            />
          ) : null}
        </Stack>
      </Stack>

      <Box className="border-t border-mm-border bg-mm-bg px-3 py-3">
        <Stack gap="1">
          <Flex align="center" justify="between" gap="2">
            <Text size="sm" tone="muted">
              {COUNTER_COPY.subtotal}
            </Text>
            <Text size="sm">{formatInr(cart?.subtotal)}</Text>
          </Flex>
          <Flex align="center" justify="between" gap="2">
            <Text size="sm" tone="muted">
              {COUNTER_COPY.discount}
            </Text>
            <Text size="sm">{formatInr(cart?.discount_amount)}</Text>
          </Flex>
          <Flex align="center" justify="between" gap="2">
            <Text size="sm" tone="muted">
              {COUNTER_COPY.gst}
            </Text>
            <Text size="sm">{formatInr(cart?.gst_total)}</Text>
          </Flex>
          <Flex align="center" justify="between" gap="2">
            <Text className="font-semibold">{COUNTER_COPY.total}</Text>
            <Text className="font-semibold" data-testid="pos-grand-total">
              {formatInr(cart?.grand_total)}
            </Text>
          </Flex>
        </Stack>
        <Button
          type="button"
          size="lg"
          className="mt-3 w-full"
          onClick={onCheckout}
          disabled={paying || empty}
        >
          {paying ? COUNTER_COPY.retry : COUNTER_COPY.checkout}
        </Button>
      </Box>

      {receipt ? (
        <Stack
          gap="2"
          data-testid="pos-receipt"
          className="border-t border-mm-border bg-mm-primary-soft px-3 py-3"
        >
          <Text size="sm" className="font-medium">
            {COUNTER_COPY.receipt}
          </Text>
          <Text>{receipt.invoice_number ?? receipt.invoice_id}</Text>
          <Text>{formatInr(receipt.grand_total)}</Text>
          {scoped ? (
            <StatusMessage data-testid="pos-pdf-deferred">
              {openAfterFullLoginCopy()}
            </StatusMessage>
          ) : (
            <Button
              type="button"
              className="min-h-9 text-sm"
              onClick={() => onNavigate?.(`/invoices/${receipt.invoice_id}`)}
            >
              {COUNTER_COPY.invoice}
            </Button>
          )}
        </Stack>
      ) : null}
    </Fieldset>
  );
}

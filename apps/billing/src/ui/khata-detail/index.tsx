import type {
  BillingFeatureData,
  KhataDetail,
  RemindChannel,
  RemindTemplate,
  RepayMode,
} from '@medmate/billing-contract';
import {
  formatInr,
  isCustomerNotFound,
  isPlanFeatureLocked,
  isStaffCannotRemind,
  khataLockCopy,
  REMIND_CHANNELS,
  REMIND_TEMPLATES,
  REPAY_MODES,
} from '@medmate/billing-contract';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Spinner,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextField,
} from '@medmate/ui';
import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import {
  KHATA_DETAIL_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
} from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { PlanLock } from '../shared/plan-lock';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function KhataDetailScreen({
  feature,
  onNavigate,
}: {
  feature: BillingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const customerId = feature.customerId ?? '';
  const canRemind = Boolean(feature.canRemind);
  const isStaff = feature.role === 'pharmacy_staff';
  const repayKey = useId();
  const [detail, setDetail] = useState<KhataDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<RepayMode>('CASH');
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState<RemindChannel>('WHATSAPP');
  const [template, setTemplate] = useState<RemindTemplate>('POLITE');
  const [idempotencyKey, setIdempotencyKey] = useState(repayKey);

  const load = useCallback(async () => {
    if (!customerId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'khata-detail',
      action: 'load',
      values: { customerId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      if (isCustomerNotFound(result.code)) {
        setNotFound(true);
        setDetail(null);
        return;
      }
      setError(errorText(result, 'Unable to load khata detail.'));
      return;
    }
    setDetail(result.khata ?? null);
  }, [feature, customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  function openRepay() {
    setAmount(
      detail?.total_outstanding != null ? String(detail.total_outstanding) : '',
    );
    setPaymentMode('CASH');
    setNote('');
    setFieldErrors({});
    setIdempotencyKey(`${repayKey}-${Date.now()}`);
    setRepayOpen(true);
  }

  async function confirmRepay() {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFieldErrors({ amount: 'Enter a valid amount.' });
      return;
    }
    setBusy(true);
    setFieldErrors({});
    const result = await feature.onSubmit({
      screen: 'khata-detail',
      action: 'repay',
      values: {
        customerId,
        amount: parsed,
        payment_mode: paymentMode,
        note: note || undefined,
        idempotencyKey,
      },
    });
    setBusy(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setFieldErrors(result.fieldErrors ?? {});
      setError(errorText(result));
      return;
    }
    setRepayOpen(false);
    await load();
  }

  async function confirmRemind() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'khata-detail',
      action: 'remind',
      values: {
        customerId,
        channel,
        message_template: template,
      },
    });
    setBusy(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      if (isStaffCannotRemind(result.code) || result.code === 'FORBIDDEN') {
        setError(errorText(result, KHATA_DETAIL_COPY.staffRemind));
        setRemindOpen(false);
        return;
      }
      setError(errorText(result));
      return;
    }
    setRemindOpen(false);
  }

  if (loading) {
    return <Spinner size="sm" data-testid="khata-detail-loading" />;
  }
  if (locked) {
    return (
      <PlanLock
        testId="khata-detail-plan-lock"
        message={khataLockCopy()}
        viewPlansLabel={KHATA_DETAIL_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={isStaff}
      />
    );
  }
  if (notFound) {
    return (
      <Text data-testid="khata-not-found" role="status">
        {KHATA_DETAIL_COPY.notFound}
      </Text>
    );
  }

  const unpaid = listOf(detail?.unpaid_bills);
  const ledger = listOf(detail?.ledger);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="khata-detail-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {KHATA_DETAIL_COPY.retry}
        </Button>
      ) : null}
      <Flex
        align="center"
        justify="between"
        gap="3"
        wrap
        className="rounded-mm border border-mm-border bg-mm-surface px-3 py-2"
      >
        <Flex align="center" gap="2" wrap className="min-w-0">
          <Badge data-testid="khata-customer-name" tone="primary">
            {dash(detail?.customer?.name)}
          </Badge>
          <Text data-testid="khata-outstanding" className="tabular-nums">
            {KHATA_DETAIL_COPY.outstanding}:{' '}
            {formatInr(
              detail?.total_outstanding ?? detail?.summary?.total_outstanding,
            )}
          </Text>
          <Text size="sm" tone="muted" className="tabular-nums">
            {KHATA_DETAIL_COPY.overdue}:{' '}
            {formatInr(detail?.summary?.overdue_amount)}
          </Text>
          <Text size="sm" tone="muted" className="tabular-nums">
            {KHATA_DETAIL_COPY.creditLimit}:{' '}
            {formatInr(detail?.customer?.credit_limit)}
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Button type="button" className={compactBtn} onClick={openRepay}>
            {KHATA_DETAIL_COPY.repay}
          </Button>
          {canRemind ? (
            <Button
              type="button"
              variant="ghost"
              className={compactBtn}
              onClick={() => setRemindOpen(true)}
            >
              {KHATA_DETAIL_COPY.remind}
            </Button>
          ) : null}
        </Flex>
      </Flex>
      <SectionBlock
        id="section-unpaid"
        title={KHATA_DETAIL_COPY.unpaid}
        hint={KHATA_DETAIL_COPY.unpaidHint}
        icon={BookOpen}
      >
        {unpaid.length === 0 ? (
          <EmptyState icon={BookOpen} testId="khata-unpaid-empty">
            {KHATA_DETAIL_COPY.unpaidEmpty}
          </EmptyState>
        ) : (
          <Table
            aria-label={KHATA_DETAIL_COPY.unpaid}
            data-testid="khata-unpaid"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaid.map((bill, index) => (
                <TableRow
                  key={bill.invoice_id ?? `${bill.invoice_number}-${index}`}
                >
                  <TableCell>{dash(bill.invoice_number)}</TableCell>
                  <TableCell>{formatIstDate(bill.invoice_date)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(bill.amount)}
                  </TableCell>
                  <TableCell>{dash(bill.days_since)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionBlock>
      <SectionBlock
        id="section-ledger"
        title={KHATA_DETAIL_COPY.ledger}
        hint={KHATA_DETAIL_COPY.ledgerHint}
      >
        {ledger.length === 0 ? (
          <EmptyState icon={BookOpen} testId="khata-ledger-empty">
            {KHATA_DETAIL_COPY.ledgerEmpty}
          </EmptyState>
        ) : (
          <Table
            aria-label={KHATA_DETAIL_COPY.ledger}
            data-testid="khata-ledger"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((entry, index) => (
                <TableRow key={entry.entry_id ?? `${entry.reference}-${index}`}>
                  <TableCell>{formatIstDate(entry.date)}</TableCell>
                  <TableCell>{dash(entry.type)}</TableCell>
                  <TableCell>{dash(entry.reference)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(entry.amount)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(entry.running_balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionBlock>
      <Dialog
        open={repayOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => setRepayOpen(false))
        }
      >
        <DialogContent data-testid="khata-repay-dialog">
          <DialogHeader>
            <DialogTitle>{KHATA_DETAIL_COPY.repayTitle}</DialogTitle>
            <DialogDescription>{KHATA_DETAIL_COPY.repayHint}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void confirmRepay();
            }}
          >
            <Stack gap="2">
              <SelectField
                label={KHATA_DETAIL_COPY.paymentMode}
                name="payment_mode"
                value={paymentMode}
                onChange={(event) =>
                  setPaymentMode(event.target.value as RepayMode)
                }
              >
                {REPAY_MODES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={KHATA_DETAIL_COPY.amount}
                name="amount"
                type="number"
                value={amount}
                error={fieldErrors.amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <TextField
                label={KHATA_DETAIL_COPY.note}
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </Stack>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setRepayOpen(false)}
              >
                {KHATA_DETAIL_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {KHATA_DETAIL_COPY.confirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={remindOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => setRemindOpen(false))
        }
      >
        <DialogContent data-testid="khata-remind-dialog">
          <DialogHeader>
            <DialogTitle>{KHATA_DETAIL_COPY.remindTitle}</DialogTitle>
            <DialogDescription>
              {KHATA_DETAIL_COPY.remindHint}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void confirmRemind();
            }}
          >
            <Stack gap="2">
              <SelectField
                label={KHATA_DETAIL_COPY.channel}
                name="remind_channel"
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as RemindChannel)
                }
              >
                {REMIND_CHANNELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label={KHATA_DETAIL_COPY.template}
                name="message_template"
                value={template}
                onChange={(event) =>
                  setTemplate(event.target.value as RemindTemplate)
                }
              >
                {REMIND_TEMPLATES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </Stack>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setRemindOpen(false)}
              >
                {KHATA_DETAIL_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {KHATA_DETAIL_COPY.remindConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

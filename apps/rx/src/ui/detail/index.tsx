import type { RxDetail, RxFeatureData } from '@medmate/rx-contract';
import {
  isControlledSchedule,
  isInsufficientStock,
  isPlanFeatureLocked,
  isRxNotFound,
  rxLockCopy,
} from '@medmate/rx-contract';
import {
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
} from '@medmate/ui';
import { useCallback, useEffect, useState } from 'react';
import {
  DETAIL_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  yesNo,
} from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { isSafeImageUrl } from '../../lib/image';
import { FormBanner } from '../shared/form-error';
import { PlanLock } from '../shared/plan-lock';
import { SectionBlock, TableShell } from '../shared/section-block';
import { StatusBadge } from '../shared/status-badge';
import { TextareaField } from '../shared/textarea-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function DetailScreen({
  feature,
  onNavigate,
}: {
  feature: RxFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const rxId = feature.rxId ?? '';
  const canMutate = Boolean(feature.canMutateRx);
  const isStaff = feature.role === 'pharmacy_staff';
  const [prescription, setPrescription] = useState<RxDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!rxId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'load',
      values: { rxId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isRxNotFound(result.code)) {
        setNotFound(true);
        setPrescription(null);
        return;
      }
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        setError(result.formError ?? rxLockCopy());
        return;
      }
      setError(errorText(result, 'Unable to load prescription.'));
      return;
    }
    setPrescription(result.prescription ?? null);
  }, [feature, rxId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve() {
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'approve',
      values: { rxId },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    await load();
  }

  async function confirmReject() {
    if (!reason.trim()) {
      setReasonError('Enter a reason.');
      return;
    }
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'reject',
      values: { rxId, reason: reason.trim() },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      setReasonError(result.fieldErrors?.reason);
      return;
    }
    setRejectOpen(false);
    setReason('');
    await load();
  }

  async function confirmDispense() {
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'dispense',
      values: { rxId },
    });
    setBusy(false);
    if (!result.ok) {
      if (isInsufficientStock(result.code)) {
        setError(errorText(result, 'Stock is insufficient to dispense.'));
      } else {
        setError(errorText(result));
      }
      return;
    }
    setDispenseOpen(false);
    await load();
  }

  if (loading) {
    return <Spinner size="sm" data-testid="rx-detail-loading" />;
  }
  if (locked) {
    return (
      <PlanLock
        testId="rx-detail-plan-lock"
        message={error || rxLockCopy()}
        viewPlansLabel={DETAIL_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={isStaff}
      />
    );
  }
  if (notFound) {
    return (
      <FormBanner message={DETAIL_COPY.notFound} testId="rx-detail-not-found" />
    );
  }

  const lines = listOf(prescription?.lines);
  const controlled = prescription
    ? isControlledSchedule(prescription) ||
      lines.some((line) => isControlledSchedule(line))
    : false;
  const pending = String(prescription?.status ?? '') === 'PENDING_REVIEW';
  const approved = String(prescription?.status ?? '') === 'APPROVED';

  return (
    <Stack gap="3">
      <Flex align="center" gap="2" wrap>
        <StatusBadge status={prescription?.status} />
        <Text size="sm" tone="muted">
          {prescription?.rx_id}
        </Text>
      </Flex>
      <FormBanner message={error} testId="rx-detail-error" />
      {error && !prescription ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {DETAIL_COPY.retry}
        </Button>
      ) : null}
      <SectionBlock id="section-rx-schedule" title={DETAIL_COPY.schedule}>
        <Text size="sm">
          {DETAIL_COPY.schedule} H1 {yesNo(prescription?.schedule_h1)} · X{' '}
          {yesNo(prescription?.schedule_x)}
        </Text>
      </SectionBlock>
      <SectionBlock id="section-rx-times" title={DETAIL_COPY.timestamps}>
        <Text size="sm">
          Created {formatIstDate(prescription?.created_at)} · Updated{' '}
          {formatIstDate(prescription?.updated_at)}
        </Text>
      </SectionBlock>
      {isSafeImageUrl(prescription?.image_url) ? (
        <SectionBlock id="section-rx-image" title={DETAIL_COPY.image}>
          <img
            src={prescription.image_url}
            alt={DETAIL_COPY.image}
            data-testid="rx-image"
            className="max-h-80 max-w-full rounded-mm border border-mm-border"
          />
        </SectionBlock>
      ) : null}
      <SectionBlock
        id="section-rx-lines"
        title={DETAIL_COPY.lines}
        hint={DETAIL_COPY.linesHint}
      >
        {lines.length === 0 ? (
          <Text size="sm" tone="muted">
            {DETAIL_COPY.emptyLines}
          </Text>
        ) : (
          <TableShell id="section-rx-lines-table">
            <Table aria-label={DETAIL_COPY.lines} data-testid="rx-lines-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>H1</TableHead>
                  <TableHead>X</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={line.line_id ?? `${index}`}>
                    <TableCell>{dash(line.product_name)}</TableCell>
                    <TableCell className="tabular-nums">
                      {dash(line.quantity)}
                    </TableCell>
                    <TableCell>{yesNo(line.schedule_h1)}</TableCell>
                    <TableCell>{yesNo(line.schedule_x)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>
        )}
      </SectionBlock>
      {canMutate ? (
        <Flex gap="2" wrap>
          {pending ? (
            <Button
              type="button"
              className={compactBtn}
              disabled={busy}
              onClick={() => void approve()}
            >
              {DETAIL_COPY.approve}
            </Button>
          ) : null}
          {pending ? (
            <Button
              type="button"
              variant="ghost"
              className={compactBtn}
              disabled={busy}
              onClick={() => setRejectOpen(true)}
            >
              {DETAIL_COPY.reject}
            </Button>
          ) : null}
          {approved ? (
            <Button
              type="button"
              className={compactBtn}
              disabled={busy}
              onClick={() => setDispenseOpen(true)}
            >
              {DETAIL_COPY.dispense}
            </Button>
          ) : null}
        </Flex>
      ) : null}
      <Dialog
        open={rejectOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => {
            setRejectOpen(false);
            setReasonError(undefined);
          })
        }
      >
        <DialogContent data-testid="rx-reject-dialog">
          <DialogHeader>
            <DialogTitle>{DETAIL_COPY.rejectTitle}</DialogTitle>
            <DialogDescription>{DETAIL_COPY.rejectHelp}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void confirmReject();
            }}
          >
            <TextareaField
              label={DETAIL_COPY.rejectReason}
              name="reason"
              value={reason}
              error={reasonError}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError(undefined);
              }}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setRejectOpen(false)}
              >
                {DETAIL_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {DETAIL_COPY.rejectConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dispenseOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => setDispenseOpen(false))
        }
      >
        <DialogContent data-testid="rx-dispense-dialog">
          <DialogHeader>
            <DialogTitle>{DETAIL_COPY.dispenseTitle}</DialogTitle>
            <DialogDescription>
              {controlled
                ? DETAIL_COPY.controlledHelp
                : DETAIL_COPY.dispenseHelp}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className={compactBtn}
              onClick={() => setDispenseOpen(false)}
            >
              {DETAIL_COPY.cancel}
            </Button>
            <Button
              type="button"
              className={compactBtn}
              disabled={busy}
              onClick={() => void confirmDispense()}
            >
              {DETAIL_COPY.dispenseConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

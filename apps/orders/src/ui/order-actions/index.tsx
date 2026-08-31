import type {
  OrderActionResult,
  OrderHandoff,
  OrdersFeatureData,
  OrdersSubmitSuccess,
  RiderDirectoryRow,
} from '@medmate/orders-contract';
import {
  ORDER_PACKING_STATUSES,
  isInvalidStatusTransition,
  isOrderAlreadyActioned,
  isOrderNotFound,
  isOrdersUuid,
  isPosTokenRestricted,
} from '@medmate/orders-contract';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
  Text,
} from '@medmate/ui';
import { useEffect, useState } from 'react';
import { ACTIONS_COPY, errorText } from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { FormBanner } from '../shared/form-error';
import { InputField } from '../shared/input-field';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';
import { TextareaField } from '../shared/textarea-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function OrderActionsScreen({
  feature,
}: {
  feature: OrdersFeatureData;
}) {
  const orderId = feature.orderId ?? '';
  const validId = isOrdersUuid(orderId);
  const [error, setError] = useState<string | undefined>(
    validId ? feature.formError : ACTIONS_COPY.invalidId,
  );
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [riderId, setRiderId] = useState('');
  const [riderError, setRiderError] = useState<string | undefined>();
  const [riders, setRiders] = useState<RiderDirectoryRow[]>([]);
  const [handoff, setHandoff] = useState<OrderHandoff | null>(null);
  const [cached, setCached] = useState<OrderActionResult | null>(null);
  const [refundNote, setRefundNote] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();

  function mapFailure(result: { code?: string; formError?: string }) {
    if (result.formError) {
      return result.formError;
    }
    if (isOrderNotFound(result.code)) {
      return 'This order was not found.';
    }
    if (isOrderAlreadyActioned(result.code)) {
      return 'This order was already actioned.';
    }
    if (isInvalidStatusTransition(result.code)) {
      return 'That status transition is not allowed.';
    }
    if (isPosTokenRestricted(result.code)) {
      return 'This page needs a full pharmacy session.';
    }
    return errorText(result);
  }

  async function run(
    command: Parameters<OrdersFeatureData['onSubmit']>[0],
    onOk?: (result: OrdersSubmitSuccess) => void,
  ) {
    if (!validId) {
      setError(ACTIONS_COPY.invalidId);
      return;
    }
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit(command);
    setBusy(false);
    if (!result.ok) {
      setError(mapFailure(result));
      return;
    }
    onOk?.(result);
  }

  useEffect(() => {
    if (!validId) {
      return;
    }
    void feature
      .onSubmit({
        screen: 'order-actions',
        action: 'listRiders',
        values: { orderId },
      })
      .then((result) => {
        if (result.ok) {
          setRiders(result.riders ?? []);
        }
      });
    void feature
      .onSubmit({
        screen: 'order-actions',
        action: 'loadHandoff',
        values: { orderId },
      })
      .then((result) => {
        if (result.ok) {
          setHandoff(result.handoff ?? null);
        }
      });
  }, [feature, orderId, validId]);

  return (
    <Stack gap="3">
      <Flex align="center" gap="2" wrap>
        <Text size="sm" data-testid="orders-order-id">
          {orderId || '—'}
        </Text>
        {cached?.status ? <StatusBadge status={cached.status} /> : null}
      </Flex>
      {cached?.status ? (
        <Text size="sm" tone="muted" data-testid="orders-cached-status">
          {ACTIONS_COPY.cachedStatus}
        </Text>
      ) : null}
      <FormBanner message={error} testId="orders-actions-error" />
      {success ? (
        <Text size="sm" data-testid="orders-actions-success">
          {success}
        </Text>
      ) : null}
      {refundNote ? (
        <Text size="sm" data-testid="orders-reject-refund">
          {ACTIONS_COPY.refundCopy}
        </Text>
      ) : null}
      <Flex gap="2" wrap>
        <Button
          type="button"
          className={compactBtn}
          disabled={busy}
          onClick={() =>
            void run(
              {
                screen: 'order-actions',
                action: 'accept',
                values: { orderId },
              },
              (result) => {
                setCached(
                  result.accept ?? { order_id: orderId, status: 'ACCEPTED' },
                );
                setSuccess(ACTIONS_COPY.success);
              },
            )
          }
        >
          {ACTIONS_COPY.accept}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          disabled={busy}
          onClick={() => setRejectOpen(true)}
        >
          {ACTIONS_COPY.reject}
        </Button>
      </Flex>
      <SectionBlock
        id="section-order-status"
        title={ACTIONS_COPY.status}
        hint={ACTIONS_COPY.statusHint}
      >
        <Flex gap="2" wrap>
          {ORDER_PACKING_STATUSES.map((status) => (
            <Button
              key={status}
              type="button"
              variant="ghost"
              className={compactBtn}
              disabled={busy}
              onClick={() =>
                void run(
                  {
                    screen: 'order-actions',
                    action: 'advanceStatus',
                    values: { orderId, status },
                  },
                  (result) => {
                    setCached(result.status ?? { order_id: orderId, status });
                    setSuccess(ACTIONS_COPY.success);
                  },
                )
              }
            >
              {status}
            </Button>
          ))}
        </Flex>
      </SectionBlock>
      {handoff?.pickup_otp ? (
        <SectionBlock
          id="section-order-handoff"
          title={ACTIONS_COPY.handoff}
          hint={ACTIONS_COPY.handoffHint}
        >
          <Text size="lg" data-testid="orders-pickup-otp">
            {handoff.pickup_otp}
          </Text>
        </SectionBlock>
      ) : null}
      <SectionBlock
        id="section-order-rider"
        title={ACTIONS_COPY.rider}
        hint={ACTIONS_COPY.riderHint}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!isOrdersUuid(riderId.trim())) {
              setRiderError('Enter a valid rider UUID.');
              return;
            }
            void run(
              {
                screen: 'order-actions',
                action: 'assignRider',
                values: { orderId, rider_id: riderId.trim() },
              },
              (result) => {
                setCached(
                  result.assign ?? {
                    order_id: orderId,
                    rider_id: riderId.trim(),
                  },
                );
                if (result.assign?.pickup_otp) {
                  setHandoff({
                    order_id: orderId,
                    pickup_otp: result.assign.pickup_otp,
                    rider_id: riderId.trim(),
                  });
                }
                setSuccess(ACTIONS_COPY.success);
              },
            );
          }}
        >
          {riders.length > 0 ? (
            <SelectField
              label={ACTIONS_COPY.riderPick}
              name="rider_pick"
              value={riderId}
              onChange={(event) => {
                setRiderId(event.target.value);
                setRiderError(undefined);
              }}
            >
              <option value="">Select a rider</option>
              {riders.map((rider) => (
                <option key={rider.rider_id} value={rider.rider_id}>
                  {rider.name ?? rider.rider_id}
                </option>
              ))}
            </SelectField>
          ) : null}
          <InputField
            label={ACTIONS_COPY.riderId}
            name="rider_id"
            value={riderId}
            error={riderError}
            onChange={(event) => {
              setRiderId(event.target.value);
              setRiderError(undefined);
            }}
          />
          <Button
            type="submit"
            className={`${compactBtn} mt-2`}
            disabled={busy}
          >
            {ACTIONS_COPY.assign}
          </Button>
        </form>
      </SectionBlock>
      <Dialog
        open={rejectOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => {
            setRejectOpen(false);
            setReasonError(undefined);
          })
        }
      >
        <DialogContent data-testid="orders-reject-dialog">
          <DialogHeader>
            <DialogTitle>{ACTIONS_COPY.rejectTitle}</DialogTitle>
            <DialogDescription>{ACTIONS_COPY.rejectHelp}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(
                {
                  screen: 'order-actions',
                  action: 'reject',
                  values: { orderId, reason: reason.trim() || undefined },
                },
                (result) => {
                  setRejectOpen(false);
                  setReason('');
                  setRefundNote(true);
                  setCached(
                    result.reject ?? { order_id: orderId, status: 'REJECTED' },
                  );
                  setSuccess(ACTIONS_COPY.success);
                },
              );
            }}
          >
            <TextareaField
              label={ACTIONS_COPY.rejectReason}
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
                {ACTIONS_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {ACTIONS_COPY.rejectConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

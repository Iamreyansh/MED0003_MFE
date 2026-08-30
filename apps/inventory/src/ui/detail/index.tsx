import type {
  InventoryBatch,
  InventoryFeatureData,
  InventoryProduct,
} from '@medmate/inventory-contract';
import {
  formatIstDate,
  isPlanFeatureLocked,
  isProductNotFound,
  onlineVisibilityLockCopy,
  parsePositiveQty,
  productDisplayName,
  sortBatchesByExpiry,
} from '@medmate/inventory-contract';
import { planDisplayLabel } from '@medmate/subscription-contract';
import {
  Badge,
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
  Spinner,
  Stack,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextField,
  VisuallyHidden,
} from '@medmate/ui';
import { CalendarClock, Package } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DETAIL_COPY } from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { CheckboxField } from '../shared/checkbox-field';
import { FormBanner } from '../shared/form-error';
import { RackChip } from '../shared/rack-chip';
import { SectionBlock } from '../shared/section-block';

export function DetailScreen({ feature }: { feature: InventoryFeatureData }) {
  const productId = feature.productId ?? '';
  const canWrite = Boolean(feature.canWrite);
  const canPatchDetails = Boolean(feature.canPatchDetails);
  const canWriteOff = Boolean(feature.canWriteOff);
  const canToggleOnline = Boolean(feature.canToggleOnline);
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [formError, setFormError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(false);
  const [rack, setRack] = useState('');
  const [loose, setLoose] = useState(false);
  const [reorder, setReorder] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [qty, setQty] = useState('');
  const [adjusting, setAdjusting] = useState<InventoryBatch | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [writeOff, setWriteOff] = useState<InventoryBatch | null>(null);
  const [writeOffQty, setWriteOffQty] = useState('');
  const [writeOffReason, setWriteOffReason] = useState('');
  const [showLock, setShowLock] = useState(false);

  const load = useCallback(async () => {
    if (!productId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const [detail, batchResult] = await Promise.all([
      feature.onSubmit({
        screen: 'detail',
        action: 'load',
        values: { product_id: productId },
      }),
      feature.onSubmit({
        screen: 'detail',
        action: 'loadBatches',
        values: { product_id: productId },
      }),
    ]);
    setLoading(false);
    if (!detail.ok) {
      if (isProductNotFound(detail.code)) {
        setNotFound(true);
        setProduct(null);
        return;
      }
      setError(detail.formError ?? detail.code ?? 'Unable to load product.');
      return;
    }
    const next = detail.product ?? null;
    setProduct(next);
    setOnline(Boolean(next?.is_online_visible));
    setRack(next?.rack_location_code ?? '');
    setLoose(Boolean(next?.allow_loose_selling));
    setReorder(
      typeof next?.reorder_level === 'number' ? String(next.reorder_level) : '',
    );
    if (batchResult.ok) {
      setBatches(sortBatchesByExpiry(batchResult.batches ?? []));
    }
  }, [feature, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleOnline(next: boolean) {
    if (!canToggleOnline) {
      setShowLock(true);
      return;
    }
    const previous = online;
    setOnline(next);
    setShowLock(false);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'patchProduct',
      values: { product_id: productId, is_online_visible: next },
    });
    if (!result.ok) {
      setOnline(previous);
      if (isPlanFeatureLocked(result.code)) {
        setShowLock(true);
      }
      setFormError(result.formError ?? result.code);
      return;
    }
    if (result.product) {
      setProduct(result.product);
      setOnline(Boolean(result.product.is_online_visible));
    }
  }

  async function saveDetails() {
    setBusy(true);
    setFormError(undefined);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'patchDetails',
      values: {
        product_id: productId,
        allow_loose_selling: loose,
        reorder_level: reorder ? Number(reorder) : undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? result.code);
      return;
    }
    if (result.product) {
      setProduct(result.product);
    }
  }

  async function saveRack() {
    setBusy(true);
    setFormError(undefined);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'patchRack',
      values: { product_id: productId, rack_location_code: rack },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? result.code);
      return;
    }
    if (result.product) {
      setProduct(result.product);
      setRack(result.product.rack_location_code ?? rack);
    }
  }

  async function addBatch() {
    const quantity = parsePositiveQty(qty);
    if (quantity === null) {
      setFieldErrors({ quantity: 'Enter a non-negative quantity.' });
      return;
    }
    setBusy(true);
    setFieldErrors({});
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'addBatch',
      values: {
        product_id: productId,
        batch_number: batchNumber || undefined,
        expiry_date: expiry || undefined,
        quantity,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? result.code);
      return;
    }
    setBatchNumber('');
    setExpiry('');
    setQty('');
    await load();
  }

  async function saveAdjust() {
    const current = adjusting as InventoryBatch;
    const quantity = parsePositiveQty(adjustQty);
    if (quantity === null) {
      setFieldErrors({ quantity: 'Enter a non-negative quantity.' });
      return;
    }
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'adjustBatch',
      values: {
        product_id: productId,
        batch_id: current.batch_id,
        quantity,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? result.code);
      return;
    }
    setAdjusting(null);
    await load();
  }

  async function confirmWriteOff() {
    const current = writeOff as InventoryBatch;
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'detail',
      action: 'writeOff',
      values: {
        product_id: productId,
        batch_id: current.batch_id,
        quantity: writeOffQty ? Number(writeOffQty) : undefined,
        reason: writeOffReason || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(result.formError ?? result.code);
      return;
    }
    setWriteOff(null);
    await load();
  }

  if (loading) {
    return <Spinner data-testid="detail-loading" />;
  }
  if (notFound) {
    return (
      <StatusMessage tone="error" data-testid="inventory-not-found">
        {DETAIL_COPY.notFound}
      </StatusMessage>
    );
  }

  return (
    <Stack gap="4">
      <FormBanner message={error} testId="detail-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {DETAIL_COPY.retry}
        </Button>
      ) : null}
      {product ? (
        <Card data-testid="inventory-product">
          <Flex align="start" justify="between" gap="3" wrap>
            <Stack gap="2" className="min-w-0">
              <Heading level={2}>{productDisplayName(product)}</Heading>
              <Flex align="center" gap="3" wrap>
                <Text tone="muted">{DETAIL_COPY.unitsOnHand}</Text>
                <Text className="font-mm-heading font-semibold tabular-nums">
                  {product.stock_quantity ?? '—'}
                </Text>
                <RackChip
                  code={product.rack_location_code}
                  emptyLabel={DETAIL_COPY.noRack}
                />
              </Flex>
            </Stack>
            <Badge tone={online ? 'primary' : 'default'}>
              {online ? DETAIL_COPY.listed : DETAIL_COPY.hidden}
            </Badge>
          </Flex>
        </Card>
      ) : null}
      <FormBanner message={formError} testId="detail-form-error" />
      <Grid gap="4" className="grid-cols-1 md:grid-cols-2">
        {product ? (
          <SectionBlock
            id="section-listing"
            title={DETAIL_COPY.settingsTitle}
            hint={DETAIL_COPY.settingsHint}
            icon={Package}
            footer={
              canWrite || canPatchDetails ? (
                <Flex gap="2" wrap>
                  {canWrite ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void saveRack()}
                    >
                      {DETAIL_COPY.saveRack}
                    </Button>
                  ) : null}
                  {canPatchDetails ? (
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveDetails()}
                    >
                      {DETAIL_COPY.saveDetails}
                    </Button>
                  ) : null}
                </Flex>
              ) : undefined
            }
          >
            <Stack gap="3">
              <CheckboxField
                id="is_online_visible"
                name="is_online_visible"
                label={DETAIL_COPY.online}
                checked={online}
                disabled={!canWrite}
                onChange={(next) => {
                  void toggleOnline(next);
                }}
              />
              {showLock ? (
                <StatusMessage data-testid="online-lock">
                  {onlineVisibilityLockCopy()} Requires a{' '}
                  {planDisplayLabel('RETAIL_PRO')} plan.
                </StatusMessage>
              ) : null}
              {online && feature.storefrontOnline === false ? (
                <StatusMessage data-testid="storefront-offline-hint">
                  {DETAIL_COPY.storefrontOffline}
                </StatusMessage>
              ) : null}
              <TextField
                label={DETAIL_COPY.rack}
                name="rack_location_code"
                value={rack}
                disabled={!canWrite}
                error={fieldErrors.rack_location_code}
                onChange={(event) => setRack(event.target.value)}
              />
              {canPatchDetails ? (
                <>
                  <CheckboxField
                    id="allow_loose_selling"
                    name="allow_loose_selling"
                    label={DETAIL_COPY.loose}
                    checked={loose}
                    onChange={setLoose}
                  />
                  <TextField
                    label={DETAIL_COPY.reorder}
                    name="reorder_level"
                    type="number"
                    value={reorder}
                    error={fieldErrors.reorder_level}
                    onChange={(event) => setReorder(event.target.value)}
                  />
                </>
              ) : null}
            </Stack>
          </SectionBlock>
        ) : null}
        <Stack gap="4">
          {canWrite ? (
            <SectionBlock
              id="section-add-batch"
              title={DETAIL_COPY.addBatch}
              hint={DETAIL_COPY.batchesHint}
              icon={CalendarClock}
              footer={
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void addBatch()}
                >
                  {DETAIL_COPY.addBatch}
                </Button>
              }
            >
              <Stack gap="3" data-testid="add-batch">
                <TextField
                  label={DETAIL_COPY.batchNumber}
                  name="batch_number"
                  value={batchNumber}
                  onChange={(event) => setBatchNumber(event.target.value)}
                />
                <TextField
                  label={DETAIL_COPY.expiry}
                  name="expiry_date"
                  type="date"
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                />
                <TextField
                  label={DETAIL_COPY.quantity}
                  name="quantity"
                  type="number"
                  value={qty}
                  error={fieldErrors.quantity}
                  onChange={(event) => setQty(event.target.value)}
                />
              </Stack>
            </SectionBlock>
          ) : (
            <StatusMessage>{DETAIL_COPY.readOnlyBatches}</StatusMessage>
          )}
          <SectionBlock
            id="section-batches"
            title={DETAIL_COPY.batches}
            hint={DETAIL_COPY.batchesHint}
            icon={CalendarClock}
          >
            <Table aria-label={DETAIL_COPY.batches} data-testid="batches-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((row) => (
                  <TableRow
                    key={row.batch_id}
                    data-testid={`batch-row-${row.batch_id}`}
                  >
                    <TableCell>{row.batch_number ?? row.batch_id}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatIstDate(row.expiry_date)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.quantity ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Flex gap="2" wrap>
                        {canWrite ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setAdjusting(row);
                              setAdjustQty(String(row.quantity ?? ''));
                              setFieldErrors({});
                            }}
                          >
                            {DETAIL_COPY.adjust}
                          </Button>
                        ) : null}
                        {canWriteOff ? (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                              setWriteOff(row);
                              setWriteOffQty(String(row.quantity ?? ''));
                              setWriteOffReason('');
                            }}
                          >
                            {DETAIL_COPY.writeOff}
                          </Button>
                        ) : null}
                      </Flex>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionBlock>
        </Stack>
      </Grid>

      <Dialog
        open={adjusting !== null}
        onOpenChange={(open) => {
          applyDialogOpen(open, () => setAdjusting(null));
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DETAIL_COPY.adjust}</DialogTitle>
            <DialogDescription>Quantity cannot be negative.</DialogDescription>
          </DialogHeader>
          <TextField
            label={DETAIL_COPY.adjustQuantity}
            name="adjust_quantity"
            type="number"
            value={adjustQty}
            error={fieldErrors.quantity}
            onChange={(event) => setAdjustQty(event.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdjusting(null)}
            >
              {DETAIL_COPY.close}
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void saveAdjust()}
            >
              {DETAIL_COPY.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={writeOff !== null}
        onOpenChange={(open) => {
          applyDialogOpen(open, () => setWriteOff(null));
        }}
      >
        <DialogContent data-testid="writeoff-dialog">
          <DialogHeader>
            <DialogTitle>{DETAIL_COPY.confirmWriteOff}</DialogTitle>
            <DialogDescription>
              {DETAIL_COPY.confirmWriteOffHelp}
            </DialogDescription>
          </DialogHeader>
          <Stack gap="3">
            <TextField
              label={DETAIL_COPY.writeOffQuantity}
              name="writeoff_quantity"
              type="number"
              value={writeOffQty}
              onChange={(event) => setWriteOffQty(event.target.value)}
            />
            <TextField
              label={DETAIL_COPY.reason}
              name="writeoff_reason"
              value={writeOffReason}
              onChange={(event) => setWriteOffReason(event.target.value)}
            />
          </Stack>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWriteOff(null)}
            >
              {DETAIL_COPY.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => void confirmWriteOff()}
            >
              {DETAIL_COPY.writeOff}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

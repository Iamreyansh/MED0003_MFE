import type {
  GrnDetail,
  GrnItem,
  ProcurementFeatureData,
} from '@medmate/procurement-contract';
import {
  formatInr,
  isGrnNotFound,
  parsePositiveQty,
} from '@medmate/procurement-contract';
import {
  Badge,
  Button,
  Card,
  Flex,
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
} from '@medmate/ui';
import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EDITOR_COPY, errorText, listOf, qtyInput } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

export function EditorScreen({
  feature,
  onNavigate,
}: {
  feature: ProcurementFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const grnId = feature.grnId ?? '';
  const canWrite = feature.canWrite !== false;
  const canStockIn = Boolean(feature.canStockIn);
  const [grn, setGrn] = useState<GrnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [formError, setFormError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [productId, setProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [qty, setQty] = useState('');
  const [freeQty, setFreeQty] = useState('0');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [gst, setGst] = useState('');
  const [editQty, setEditQty] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!grnId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const result = await feature.onSubmit({
      screen: 'editor',
      action: 'load',
      values: { grn_id: grnId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isGrnNotFound(result.code)) {
        setNotFound(true);
        setGrn(null);
        return;
      }
      setError(errorText(result, 'Unable to load receipt.'));
      return;
    }
    setGrn(result.grn as GrnDetail | null);
  }, [feature, grnId]);

  useEffect(() => {
    void load();
  }, [load]);

  const stocked = grn?.status === 'STOCKED';
  const items = listOf(grn?.items);

  async function addItem() {
    const quantity = parsePositiveQty(qty);
    if (quantity === null) {
      setFormError('Enter a non-negative quantity.');
      return;
    }
    setBusy(true);
    setFormError(undefined);
    const result = await feature.onSubmit({
      screen: 'editor',
      action: 'addItem',
      values: {
        grn_id: grnId,
        product_id: productId,
        batch_number: batchNumber || undefined,
        expiry_date: expiry || undefined,
        quantity,
        free_quantity: parsePositiveQty(freeQty) ?? 0,
        purchase_price_per_unit: Number(price) || undefined,
        mrp_per_unit: Number(mrp) || undefined,
        gst_pct: Number(gst) || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(errorText(result));
      return;
    }
    setProductId('');
    setBatchNumber('');
    setExpiry('');
    setQty('');
    await load();
  }

  async function saveQty(item: GrnItem) {
    const quantity = parsePositiveQty(
      qtyInput(editQty[item.item_id], item.quantity),
    );
    if (quantity === null) {
      setFormError('Enter a non-negative quantity.');
      return;
    }
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'editor',
      action: 'patchItem',
      values: { grn_id: grnId, item_id: item.item_id, quantity },
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(errorText(result));
      return;
    }
    await load();
  }

  async function removeItem(item: GrnItem) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'editor',
      action: 'deleteItem',
      values: { grn_id: grnId, item_id: item.item_id },
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(errorText(result));
      return;
    }
    await load();
  }

  async function saveAndStock() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'editor',
      action: 'saveAndStock',
      values: { grn_id: grnId },
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(errorText(result));
      return;
    }
    await load();
  }

  if (loading) {
    return <Spinner data-testid="editor-loading" />;
  }
  if (notFound) {
    return (
      <StatusMessage tone="error" data-testid="procurement-not-found">
        {EDITOR_COPY.notFound}
      </StatusMessage>
    );
  }

  return (
    <Stack gap="4">
      <FormBanner message={error} testId="editor-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {EDITOR_COPY.retry}
        </Button>
      ) : null}
      {grn ? (
        <Card data-testid="grn-header">
          <Flex align="start" justify="between" gap="3" wrap>
            <Stack gap="2">
              <Heading level={2}>{grn.invoice_number ?? grn.grn_id}</Heading>
              <Text tone="muted">{grn.distributor?.firm_name ?? '—'}</Text>
            </Stack>
            <Badge>{grn.status ?? '—'}</Badge>
          </Flex>
          {grn.totals ? (
            <Text className="mt-3 tabular-nums">
              {formatInr(grn.totals.grand_total)}
            </Text>
          ) : null}
        </Card>
      ) : null}
      <FormBanner message={formError} testId="editor-form-error" />
      {stocked ? (
        <StatusMessage data-testid="grn-stocked">
          {EDITOR_COPY.stocked}
        </StatusMessage>
      ) : null}
      {!stocked && canWrite ? (
        <Flex gap="3" wrap align="end">
          <TextField
            label={EDITOR_COPY.productId}
            name="product_id"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.batchNumber}
            name="batch_number"
            value={batchNumber}
            onChange={(event) => setBatchNumber(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.expiry}
            name="expiry_date"
            type="date"
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.paidQuantity}
            name="quantity"
            type="number"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.freeQuantity}
            name="free_quantity"
            type="number"
            value={freeQty}
            onChange={(event) => setFreeQty(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.purchasePrice}
            name="purchase_price_per_unit"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.mrp}
            name="mrp_per_unit"
            type="number"
            value={mrp}
            onChange={(event) => setMrp(event.target.value)}
          />
          <TextField
            label={EDITOR_COPY.gst}
            name="gst_pct"
            type="number"
            value={gst}
            onChange={(event) => setGst(event.target.value)}
          />
          <Button type="button" disabled={busy} onClick={() => void addItem()}>
            {EDITOR_COPY.addItem}
          </Button>
        </Flex>
      ) : null}
      <SectionBlock
        id="section-items"
        title={EDITOR_COPY.items}
        hint={EDITOR_COPY.itemsHint}
        icon={ClipboardList}
      >
        <Table aria-label={EDITOR_COPY.items} data-testid="grn-items">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Line total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.item_id}
                data-testid={`grn-item-${item.item_id}`}
              >
                <TableCell>{item.product_name ?? item.product_id}</TableCell>
                <TableCell>{item.batch_number ?? '—'}</TableCell>
                <TableCell>
                  {stocked || !canWrite ? (
                    item.quantity
                  ) : (
                    <TextField
                      label={EDITOR_COPY.quantity}
                      name={`qty-${item.item_id}`}
                      type="number"
                      value={qtyInput(editQty[item.item_id], item.quantity)}
                      onChange={(event) =>
                        setEditQty((current) => ({
                          ...current,
                          [item.item_id]: event.target.value,
                        }))
                      }
                    />
                  )}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatInr(item.line_total)}
                </TableCell>
                <TableCell>
                  <Flex gap="2" wrap>
                    {stocked && item.product_id ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          onNavigate?.(`/inventory/${item.product_id}`)
                        }
                      >
                        {EDITOR_COPY.product}
                      </Button>
                    ) : null}
                    {!stocked && canWrite ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => void saveQty(item)}
                        >
                          {EDITOR_COPY.saveQty}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => void removeItem(item)}
                        >
                          {EDITOR_COPY.delete}
                        </Button>
                      </>
                    ) : null}
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionBlock>
      {canStockIn && !stocked ? (
        <Button
          type="button"
          disabled={busy}
          onClick={() => void saveAndStock()}
        >
          {EDITOR_COPY.saveAndStock}
        </Button>
      ) : null}
      {!canStockIn && !stocked ? (
        <StatusMessage>{EDITOR_COPY.staffHidden}</StatusMessage>
      ) : null}
    </Stack>
  );
}

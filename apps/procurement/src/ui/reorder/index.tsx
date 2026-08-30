import type {
  PageMeta,
  PoLine,
  ProcurementFeatureData,
  PurchaseOrder,
  SuggestionGroup,
} from '@medmate/procurement-contract';
import {
  formatInr,
  isPlanFeatureLocked,
  parsePositiveQty,
  reorderLockCopy,
} from '@medmate/procurement-contract';
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
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  REORDER_COPY,
  dash,
  errorText,
  firstText,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { PlanLock } from '../shared/plan-lock';
import { SectionBlock } from '../shared/section-block';

export function ReorderScreen({
  feature,
  onNavigate,
}: {
  feature: ProcurementFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canAccess = feature.canAccessGrowth !== false;
  const canRefresh = Boolean(feature.canRefreshReorder);
  const canSend = Boolean(feature.canSendPo);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<SuggestionGroup[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(canAccess);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [locked, setLocked] = useState(!canAccess);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<{
    po_id: string;
    po_number?: string | null;
    lines: PoLine[];
    items_count?: number | null;
    estimated_total?: number | null;
    status?: string | null;
  } | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [addProductId, setAddProductId] = useState('');
  const [addQty, setAddQty] = useState('');

  const load = useCallback(async () => {
    if (!canAccess) {
      setLocked(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    const [suggestions, pos] = await Promise.all([
      feature.onSubmit({
        screen: 'reorder',
        action: 'load',
        values: { page, group_by: 'distributor' },
      }),
      feature.onSubmit({
        screen: 'reorder',
        action: 'loadPurchaseOrders',
        values: { page },
      }),
    ]);
    setLoading(false);
    if (!suggestions.ok) {
      if (isPlanFeatureLocked(suggestions.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(suggestions));
      return;
    }
    setLocked(false);
    setGroups(listOf(suggestions.suggestionGroups));
    setMeta(pageMeta(suggestions.meta));
    if (pos.ok) {
      setOrders(listOf(pos.purchaseOrders));
    }
  }, [canAccess, feature, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function refresh() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'reorder',
      action: 'refresh',
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    await load();
  }

  async function createPo(group: SuggestionGroup) {
    const distributorId = group.distributor_id;
    const items = listOf(group.items).map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity ?? 1,
      product_name: item.product_name,
    }));
    if (!distributorId || items.length === 0) {
      setError('Select a distributor group with items.');
      return;
    }
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'reorder',
      action: 'createPo',
      values: { distributor_id: distributorId, items },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setEditor({
      po_id: result.purchaseOrder?.po_id ?? '',
      po_number: result.purchaseOrder?.po_number,
      lines: items,
      items_count: result.purchaseOrder?.items_count,
      estimated_total: result.purchaseOrder?.estimated_total,
      status: result.purchaseOrder?.status ?? 'DRAFT',
    });
  }

  async function patchLine() {
    const current = editor as NonNullable<typeof editor>;
    const quantity = parsePositiveQty(addQty);
    if (!addProductId || quantity === null) {
      setError('Enter a product and quantity.');
      return;
    }
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'reorder',
      action: 'patchPo',
      values: {
        po_id: current.po_id,
        add_items: [{ product_id: addProductId, quantity }],
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setEditor({
      ...current,
      lines: [
        ...current.lines,
        { product_id: addProductId, quantity, product_name: addProductId },
      ],
      items_count:
        result.purchaseOrder?.items_count ?? current.lines.length + 1,
      estimated_total: result.purchaseOrder?.estimated_total,
    });
    setAddProductId('');
    setAddQty('');
  }

  async function sendPo(poId: string) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'reorder',
      action: 'send',
      values: { po_id: poId, channel: 'WHATSAPP' },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setSending(null);
    if (editor?.po_id === poId) {
      setEditor({ ...editor, status: 'SENT' });
    }
    await load();
  }

  async function recordGrn(poId: string) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'reorder',
      action: 'recordGrn',
      values: {
        po_id: poId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    const grnId = result.recordGrn?.grn_id;
    if (grnId) {
      onNavigate?.(`/purchases/${grnId}`);
    }
  }

  if (locked) {
    return (
      <PlanLock
        testId="reorder-plan-lock"
        message={reorderLockCopy()}
        viewPlansLabel={REORDER_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={feature.role === 'pharmacy_staff'}
      />
    );
  }

  return (
    <Stack gap="4">
      <FormBanner message={error} testId="reorder-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {REORDER_COPY.retry}
        </Button>
      ) : null}
      {canRefresh ? (
        <Button type="button" disabled={busy} onClick={() => void refresh()}>
          {REORDER_COPY.refresh}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="reorder-loading" /> : null}
      {!loading && groups.length === 0 ? (
        <EmptyState icon={RefreshCw} testId="reorder-empty">
          {REORDER_COPY.empty}
        </EmptyState>
      ) : null}
      {groups.length > 0 ? (
        <SectionBlock
          id="section-suggestions"
          title={REORDER_COPY.suggestions}
          hint={REORDER_COPY.suggestionsHint}
          icon={RefreshCw}
        >
          <Stack gap="3">
            {groups.map((group) => (
              <Stack
                key={firstText(group.key, group.distributor_id, group.label)}
                gap="2"
              >
                <Text>{firstText(group.label, group.distributor_name)}</Text>
                <Table aria-label={REORDER_COPY.suggestions}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listOf(group.items).map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell>
                          {firstText(item.product_name, item.product_id)}
                        </TableCell>
                        <TableCell>{dash(item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void createPo(group)}
                >
                  {REORDER_COPY.createPo}
                </Button>
              </Stack>
            ))}
          </Stack>
        </SectionBlock>
      ) : null}
      {editor ? (
        <SectionBlock
          id="section-po-editor"
          title={REORDER_COPY.poEditor}
          hint={firstText(editor.po_number, editor.po_id)}
        >
          <Stack gap="3" data-testid="po-editor">
            <Badge>{dash(editor.status)}</Badge>
            <Text className="tabular-nums">
              {editor.items_count} · {formatInr(editor.estimated_total)}
            </Text>
            <Table aria-label={REORDER_COPY.poEditor}>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editor.lines.map((line) => (
                  <TableRow key={`${line.product_id}-${line.quantity}`}>
                    <TableCell>
                      {line.product_name ?? line.product_id}
                    </TableCell>
                    <TableCell>{line.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {editor.status === 'DRAFT' ? (
              <Flex gap="2" wrap align="end">
                <TextField
                  label={REORDER_COPY.productId}
                  name="po_product_id"
                  value={addProductId}
                  onChange={(event) => setAddProductId(event.target.value)}
                />
                <TextField
                  label={REORDER_COPY.quantity}
                  name="po_quantity"
                  type="number"
                  value={addQty}
                  onChange={(event) => setAddQty(event.target.value)}
                />
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void patchLine()}
                >
                  {REORDER_COPY.addLine}
                </Button>
                {canSend && editor.po_id ? (
                  <Button
                    type="button"
                    onClick={() => setSending(editor.po_id)}
                  >
                    {REORDER_COPY.send}
                  </Button>
                ) : null}
              </Flex>
            ) : null}
          </Stack>
        </SectionBlock>
      ) : null}
      {orders.length > 0 ? (
        <SectionBlock
          id="section-pos"
          title={REORDER_COPY.purchaseOrders}
          hint={REORDER_COPY.poHint}
        >
          <Table
            aria-label={REORDER_COPY.purchaseOrders}
            data-testid="po-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((row) => (
                <TableRow key={row.po_id} data-testid={`po-${row.po_id}`}>
                  <TableCell>{row.po_number}</TableCell>
                  <TableCell>{row.distributor_name}</TableCell>
                  <TableCell>
                    <Badge>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(row.estimated_total)}
                  </TableCell>
                  <TableCell>
                    <Flex gap="2" wrap>
                      {row.status === 'DRAFT' && canSend ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setSending(row.po_id)}
                        >
                          {REORDER_COPY.send}
                        </Button>
                      ) : null}
                      {row.status === 'SENT' ? (
                        <Flex gap="2" wrap align="end">
                          <TextField
                            label={REORDER_COPY.invoiceNumber}
                            name={`inv-${row.po_id}`}
                            value={invoiceNumber}
                            onChange={(event) =>
                              setInvoiceNumber(event.target.value)
                            }
                          />
                          <TextField
                            label={REORDER_COPY.invoiceDate}
                            name={`inv-date-${row.po_id}`}
                            type="date"
                            value={invoiceDate}
                            onChange={(event) =>
                              setInvoiceDate(event.target.value)
                            }
                          />
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => void recordGrn(row.po_id)}
                          >
                            {REORDER_COPY.recordGrn}
                          </Button>
                        </Flex>
                      ) : null}
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBlock>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={REORDER_COPY.previous}
        nextLabel={REORDER_COPY.next}
        pageLabel={REORDER_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
      <Dialog
        open={Boolean(sending)}
        onOpenChange={(open) => applyDialogOpen(open, () => setSending(null))}
      >
        <DialogContent data-testid="send-po-dialog">
          <DialogHeader>
            <DialogTitle>{REORDER_COPY.confirmSend}</DialogTitle>
            <DialogDescription>
              {REORDER_COPY.confirmSendHelp}
            </DialogDescription>
          </DialogHeader>
          <Text>{REORDER_COPY.channel}: WhatsApp</Text>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSending(null)}
            >
              {REORDER_COPY.cancel}
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void sendPo(sending as string)}
            >
              {REORDER_COPY.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

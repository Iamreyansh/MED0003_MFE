import type {
  DiscountType,
  PaymentMethod,
  PosCart,
  PosFeatureData,
  PosReceipt,
  PosSearchHit,
  SearchMode,
} from '@medmate/pos-contract';
import {
  MAX_MANUAL_DISCOUNT_PCT,
  isInsufficientStock,
  parseDiscountInput,
  parsePositiveQty,
} from '@medmate/pos-contract';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Stack,
  StatusMessage,
} from '@medmate/ui';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { dropEditQty, mergeDiscount, patchCartLine } from '../../lib/cart-view';
import { COUNTER_COPY, errorText } from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { FormBanner } from '../shared/form-error';
import { CartPanel } from './cart-panel';
import { SearchPanel } from './search-panel';
import { TicketPanel } from './ticket-panel';

const DISCOUNT_CAP_COPY = 'Discount exceeds 30% or ₹500 cap';

export function CounterScreen({
  feature,
  onNavigate,
}: {
  feature: PosFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const resultsId = useId();
  const [cart, setCart] = useState<PosCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('TEXT');
  const [hits, setHits] = useState<PosSearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('FLAT_RS');
  const [discountValue, setDiscountValue] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [upi, setUpi] = useState('');
  const [doctor, setDoctor] = useState('');
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);
  const [editQty, setEditQty] = useState<Record<string, string>>({});
  const [clearOpen, setClearOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmitRef = useRef(feature.onSubmit);
  onSubmitRef.current = feature.onSubmit;
  const cartIdRef = useRef(feature.cartId);
  cartIdRef.current = feature.cartId;
  const qtySeqRef = useRef(0);
  const searchFocusedRef = useRef(false);

  const loadCart = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (!silent) {
      setLoading(true);
    }
    setError(undefined);
    const result = cartIdRef.current
      ? await onSubmitRef.current({
          screen: 'counter',
          action: 'loadCart',
          values: { cart_id: cartIdRef.current },
        })
      : await onSubmitRef.current({ screen: 'counter', action: 'createCart' });
    if (!silent) {
      setLoading(false);
    }
    if (!result.ok) {
      setError(errorText(result, COUNTER_COPY.loading));
      return;
    }
    setCart(result.cart ?? null);
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!loading && !searchFocusedRef.current) {
      searchFocusedRef.current = true;
      document.getElementById('pos-search-input')?.focus();
    }
  }, [loading]);

  async function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setHits([]);
      return;
    }
    setSearching(true);
    setError(undefined);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'search',
      values: { query: trimmed, mode },
    });
    setSearching(false);
    if (!result.ok) {
      setError(errorText(result));
      setHits([]);
      return;
    }
    setHits(result.search?.results ?? []);
  }

  async function addHit(hit: PosSearchHit) {
    setBusy(true);
    setError(undefined);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'addItem',
      values: { product_id: hit.product_id, quantity: 1 },
    });
    setBusy(false);
    if (!result.ok) {
      setError(
        isInsufficientStock(result.code)
          ? (result.formError ?? 'Requested quantity exceeds batch stock')
          : errorText(result),
      );
      return;
    }
    await loadCart({ silent: true });
  }

  async function persistQty(itemId: string, qty: number) {
    qtySeqRef.current += 1;
    const seq = qtySeqRef.current;
    setError(undefined);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'patchItem',
      values: { item_id: itemId, quantity: qty },
    });
    if (seq !== qtySeqRef.current) {
      return;
    }
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setCart((current) => patchCartLine(current, itemId, qty, result.item));
    setEditQty((current) => dropEditQty(current, itemId));
  }

  function commitQty(itemId: string, original: number | null | undefined) {
    const raw = editQty[itemId];
    if (raw === undefined) {
      return;
    }
    const qty = parsePositiveQty(raw);
    if (qty === null) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (qty === original) {
      return;
    }
    void persistQty(itemId, qty);
  }

  function stepQty(
    itemId: string,
    original: number | null | undefined,
    delta: 1 | -1,
  ) {
    const displayed = editQty[itemId] ?? String(original ?? '');
    const trimmed = displayed.trim();
    const numeric = trimmed === '' ? (original ?? 0) : Number(trimmed);
    const base = Number.isFinite(numeric) ? numeric : (original ?? 0);
    const next = base + delta;
    if (next <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    setEditQty((current) => ({ ...current, [itemId]: String(next) }));
    void persistQty(itemId, next);
  }

  async function removeItem(itemId: string) {
    setBusy(true);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'deleteItem',
      values: { item_id: itemId },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    await loadCart({ silent: true });
  }

  async function confirmClear() {
    setBusy(true);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'clearCart',
    });
    setBusy(false);
    setClearOpen(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setReceipt(null);
    await loadCart({ silent: true });
  }

  async function attachCustomer() {
    setBusy(true);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'attachCustomer',
      values: {
        customer_phone: phone.trim(),
        customer_name: name.trim() || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    await loadCart({ silent: true });
  }

  async function applyDiscount() {
    const value = parseDiscountInput(discountValue);
    if (value === null) {
      setError('Discount value must be greater than zero.');
      return;
    }
    if (discountType === 'PERCENTAGE' && value > MAX_MANUAL_DISCOUNT_PCT) {
      setError(DISCOUNT_CAP_COPY);
      return;
    }
    setError(undefined);
    setBusy(true);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'applyDiscount',
      values: { type: discountType, value },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    const discount = result.discount;
    if (discount) {
      setCart((current) => mergeDiscount(current, discount));
      return;
    }
    await loadCart({ silent: true });
  }

  async function checkout() {
    setPaying(true);
    setError(undefined);
    const paid = amountPaid.trim() === '' ? undefined : Number(amountPaid);
    const result = await onSubmitRef.current({
      screen: 'counter',
      action: 'checkout',
      values: {
        payment_method: method,
        amount_paid: Number.isFinite(paid) ? paid : undefined,
        upi_reference: method === 'UPI' ? upi.trim() || undefined : undefined,
        prescribing_doctor: doctor.trim() || undefined,
      },
    });
    setPaying(false);
    if (!result.ok) {
      setReceipt(null);
      setError(errorText(result));
      return;
    }
    setReceipt(result.receipt ?? null);
  }

  const lines = cart?.items ?? [];
  const scoped = feature.tokenScope === 'pos';

  if (loading && !cart) {
    return (
      <StatusMessage data-testid="pos-loading">
        {COUNTER_COPY.loading}
      </StatusMessage>
    );
  }

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="pos-error" />
      <Box className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Stack gap="3">
          <SearchPanel
            resultsId={resultsId}
            query={query}
            mode={mode}
            hits={hits}
            searching={searching}
            busy={busy}
            onQueryChange={setQuery}
            onModeChange={setMode}
            onSearch={() => void runSearch()}
            onAdd={(hit) => void addHit(hit)}
          />
          <CartPanel
            lines={lines}
            editQty={editQty}
            busy={busy}
            onEditQty={(itemId, value) =>
              setEditQty((current) => ({ ...current, [itemId]: value }))
            }
            onCommitQty={commitQty}
            onStepQty={stepQty}
            onRemove={(itemId) => void removeItem(itemId)}
            onClear={() => setClearOpen(true)}
          />
        </Stack>
        <TicketPanel
          cart={cart}
          phone={phone}
          name={name}
          discountType={discountType}
          discountValue={discountValue}
          method={method}
          amountPaid={amountPaid}
          upi={upi}
          doctor={doctor}
          paying={paying}
          busy={busy}
          empty={lines.length === 0}
          scoped={scoped}
          receipt={receipt}
          onPhoneChange={setPhone}
          onNameChange={setName}
          onAttach={() => void attachCustomer()}
          onDiscountTypeChange={setDiscountType}
          onDiscountValueChange={setDiscountValue}
          onApplyDiscount={() => void applyDiscount()}
          onMethodChange={setMethod}
          onAmountPaidChange={setAmountPaid}
          onUpiChange={setUpi}
          onDoctorChange={setDoctor}
          onCheckout={() => void checkout()}
          onNavigate={onNavigate}
        />
      </Box>
      <Dialog
        open={clearOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => setClearOpen(false))
        }
      >
        <DialogContent data-testid="pos-clear-dialog">
          <DialogHeader>
            <DialogTitle>{COUNTER_COPY.confirmClear}</DialogTitle>
            <DialogDescription>
              {COUNTER_COPY.confirmClearHelp}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setClearOpen(false)}
            >
              {COUNTER_COPY.keepCart}
            </Button>
            <Button type="button" onClick={() => void confirmClear()}>
              {COUNTER_COPY.clear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

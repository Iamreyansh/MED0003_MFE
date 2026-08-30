import type {
  BillingFeatureData,
  DiscountType,
  OfferAppliesTo,
  OfferKpi,
  OfferRow,
  OfferStatusFilter,
  OfferValidateResult,
  OfferWrite,
  PageMeta,
} from '@medmate/billing-contract';
import {
  DISCOUNT_TYPES,
  formatInr,
  isPlanFeatureLocked,
  OFFER_APPLIES_TO,
  OFFER_STATUS_FILTERS,
  offersLockCopy,
} from '@medmate/billing-contract';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tag } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  OFFERS_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { CheckboxField } from '../shared/checkbox-field';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { PlanLock } from '../shared/plan-lock';
import { SectionBlock, TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';

const compactBtn = 'min-h-10 px-2 text-sm';

type OfferForm = {
  title: string;
  coupon_code: string;
  discount_type: DiscountType;
  discount_value: string;
  applies_to: OfferAppliesTo;
  valid_from: string;
  valid_until: string;
  max_redemptions: string;
  is_online: boolean;
  is_counter: boolean;
};

const EMPTY_FORM: OfferForm = {
  title: '',
  coupon_code: '',
  discount_type: 'PERCENTAGE',
  discount_value: '',
  applies_to: 'ALL',
  valid_from: '',
  valid_until: '',
  max_redemptions: '',
  is_online: false,
  is_counter: true,
};

function fromRow(row: OfferRow): OfferForm {
  return {
    title: row.title ?? '',
    coupon_code: row.coupon_code ?? '',
    discount_type: row.discount_type === 'FLAT_RS' ? 'FLAT_RS' : 'PERCENTAGE',
    discount_value:
      row.discount_value != null ? String(row.discount_value) : '',
    applies_to:
      row.applies_to === 'CATEGORY' || row.applies_to === 'PRODUCT'
        ? row.applies_to
        : 'ALL',
    valid_from: row.valid_from ?? '',
    valid_until: row.valid_until ?? '',
    max_redemptions:
      row.max_redemptions != null ? String(row.max_redemptions) : '',
    is_online: Boolean(row.is_online),
    is_counter: Boolean(row.is_counter),
  };
}

function toWrite(form: OfferForm): OfferWrite | { error: string } {
  const value = Number(form.discount_value);
  if (!form.title.trim()) {
    return { error: 'title' };
  }
  if (!Number.isFinite(value) || value <= 0) {
    return { error: 'discount_value' };
  }
  if (!form.valid_from || !form.valid_until) {
    return { error: 'valid_from' };
  }
  return {
    title: form.title.trim(),
    coupon_code: form.coupon_code.trim() || undefined,
    discount_type: form.discount_type,
    discount_value: value,
    applies_to: form.applies_to,
    valid_from: form.valid_from,
    valid_until: form.valid_until,
    max_redemptions: form.max_redemptions
      ? Number(form.max_redemptions)
      : undefined,
    is_online: form.is_online,
    is_counter: form.is_counter,
  };
}

export function OffersScreen({
  feature,
  onNavigate,
}: {
  feature: BillingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canMutate = Boolean(feature.canMutateOffers);
  const isStaff = feature.role === 'pharmacy_staff';
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OfferStatusFilter>('ACTIVE');
  const [rows, setRows] = useState<OfferRow[]>([]);
  const [kpi, setKpi] = useState<OfferKpi | null>(null);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<OfferRow | 'create' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OfferRow | null>(null);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [coupon, setCoupon] = useState('');
  const [cartTotal, setCartTotal] = useState('');
  const [validation, setValidation] = useState<OfferValidateResult | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'offers',
      action: 'load',
      values: { page, status },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result, 'Unable to load offers.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.offers));
    setKpi((result.kpi as OfferKpi | null) ?? null);
    setMeta(pageMeta(result.meta));
  }, [feature, page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setEditor('create');
  }

  function openEdit(row: OfferRow) {
    setForm(fromRow(row));
    setFieldErrors({});
    setEditor(row);
  }

  async function saveOffer() {
    const body = toWrite(form);
    if ('error' in body) {
      setFieldErrors({ [body.error]: 'Check this field.' });
      return;
    }
    setBusy(true);
    setFieldErrors({});
    const result =
      editor === 'create'
        ? await feature.onSubmit({
            screen: 'offers',
            action: 'create',
            values: body,
          })
        : await feature.onSubmit({
            screen: 'offers',
            action: 'patch',
            values: {
              offerId: (editor as OfferRow).offer_id,
              ...body,
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
    setEditor(null);
    await load();
  }

  async function toggleOffer(row: OfferRow) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'offers',
      action: 'toggle',
      values: { offerId: row.offer_id },
    });
    setBusy(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result));
      return;
    }
    await load();
  }

  async function confirmDelete() {
    const row = pendingDelete as OfferRow;
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'offers',
      action: 'delete',
      values: { offerId: row.offer_id },
    });
    setBusy(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result));
      return;
    }
    setPendingDelete(null);
    await load();
  }

  async function validateCoupon() {
    const total = Number(cartTotal);
    if (!coupon.trim() || !Number.isFinite(total)) {
      setError('Enter a coupon and cart total.');
      return;
    }
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'offers',
      action: 'validate',
      values: { coupon_code: coupon.trim(), cart_total: total },
    });
    setBusy(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result));
      setValidation(null);
      return;
    }
    setValidation(result.offerValidate ?? null);
  }

  if (locked) {
    return (
      <PlanLock
        testId="offers-plan-lock"
        message={offersLockCopy()}
        viewPlansLabel={OFFERS_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={isStaff}
      />
    );
  }

  return (
    <Stack gap="3">
      <FilterToolbar
        actions={
          canMutate ? (
            <Button type="button" className={compactBtn} onClick={openCreate}>
              {OFFERS_COPY.create}
            </Button>
          ) : null
        }
      >
        <FilterField>
          <SelectField
            label={OFFERS_COPY.status}
            name="status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as OfferStatusFilter);
            }}
          >
            {OFFER_STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
        </FilterField>
      </FilterToolbar>
      {kpi ? (
        <Text data-testid="offers-kpi" size="sm" tone="muted">
          {OFFERS_COPY.kpiActive}: {kpi.active_count ?? 0} ·{' '}
          {OFFERS_COPY.kpiRedemptions}: {kpi.total_redemptions ?? 0}
        </Text>
      ) : null}
      {!canMutate ? (
        <Text data-testid="offers-readonly" role="status">
          {OFFERS_COPY.staffReadOnly}
        </Text>
      ) : null}
      <FormBanner message={error} testId="offers-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {OFFERS_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner size="sm" data-testid="offers-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={Tag} testId="offers-empty">
          {OFFERS_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-offers">
          <Table aria-label={OFFERS_COPY.tableLabel} data-testid="offers-table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                {canMutate ? <TableHead>Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.offer_id}
                  data-testid={`offer-row-${row.offer_id}`}
                >
                  <TableCell className="max-w-[12rem] truncate">
                    {dash(row.title)}
                  </TableCell>
                  <TableCell>{dash(row.coupon_code)}</TableCell>
                  <TableCell>
                    {row.discount_type === 'FLAT_RS'
                      ? formatInr(row.discount_value)
                      : `${row.discount_value ?? '—'}%`}
                  </TableCell>
                  <TableCell>
                    {formatIstDate(row.valid_from)} –{' '}
                    {formatIstDate(row.valid_until)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={row.is_active ? 'ACTIVE' : 'INACTIVE'}
                    />
                  </TableCell>
                  {canMutate ? (
                    <TableCell>
                      <Stack gap="1">
                        <Button
                          type="button"
                          variant="ghost"
                          className={compactBtn}
                          aria-pressed={Boolean(row.is_active)}
                          disabled={busy}
                          onClick={() => void toggleOffer(row)}
                        >
                          {row.is_active
                            ? OFFERS_COPY.toggleOn
                            : OFFERS_COPY.toggleOff}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className={compactBtn}
                          onClick={() => openEdit(row)}
                        >
                          {OFFERS_COPY.edit}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className={compactBtn}
                          onClick={() => setPendingDelete(row)}
                        >
                          {OFFERS_COPY.delete}
                        </Button>
                      </Stack>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={OFFERS_COPY.previous}
        nextLabel={OFFERS_COPY.next}
        pageLabel={OFFERS_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
      <SectionBlock
        id="section-validate"
        title={OFFERS_COPY.validate}
        hint={OFFERS_COPY.validateHint}
      >
        <Stack gap="2">
          <TextField
            label={OFFERS_COPY.coupon}
            name="coupon_code"
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
          />
          <TextField
            label={OFFERS_COPY.cartTotal}
            name="cart_total"
            type="number"
            value={cartTotal}
            onChange={(event) => setCartTotal(event.target.value)}
          />
          <Button
            type="button"
            className={compactBtn}
            disabled={busy}
            onClick={() => void validateCoupon()}
          >
            {OFFERS_COPY.runValidate}
          </Button>
          {validation ? (
            <Text
              data-testid="offer-validate-result"
              role="status"
              className="tabular-nums"
            >
              {validation.is_valid
                ? `${OFFERS_COPY.valid}: ${formatInr(validation.discount_amount)}`
                : `${OFFERS_COPY.invalid}${validation.message ? ` — ${validation.message}` : ''}`}
            </Text>
          ) : null}
        </Stack>
      </SectionBlock>
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => applyDialogOpen(open, () => setEditor(null))}
      >
        <DialogContent data-testid="offer-editor">
          <DialogHeader>
            <DialogTitle>{OFFERS_COPY.editorTitle}</DialogTitle>
            <DialogDescription>{OFFERS_COPY.editorHint}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveOffer();
            }}
          >
            <Stack gap="2">
              <TextField
                label={OFFERS_COPY.title}
                name="title"
                value={form.title}
                error={fieldErrors.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
              <TextField
                label={OFFERS_COPY.coupon}
                name="offer_coupon_code"
                value={form.coupon_code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coupon_code: event.target.value,
                  }))
                }
              />
              <SelectField
                label={OFFERS_COPY.discountType}
                name="discount_type"
                value={form.discount_type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discount_type: event.target.value as DiscountType,
                  }))
                }
              >
                {DISCOUNT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={OFFERS_COPY.discountValue}
                name="discount_value"
                type="number"
                value={form.discount_value}
                error={fieldErrors.discount_value}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discount_value: event.target.value,
                  }))
                }
              />
              <SelectField
                label={OFFERS_COPY.appliesTo}
                name="applies_to"
                value={form.applies_to}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    applies_to: event.target.value as OfferAppliesTo,
                  }))
                }
              >
                {OFFER_APPLIES_TO.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={OFFERS_COPY.validFrom}
                name="valid_from"
                type="date"
                value={form.valid_from}
                error={fieldErrors.valid_from}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    valid_from: event.target.value,
                  }))
                }
              />
              <TextField
                label={OFFERS_COPY.validUntil}
                name="valid_until"
                type="date"
                value={form.valid_until}
                error={fieldErrors.valid_until}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    valid_until: event.target.value,
                  }))
                }
              />
              <TextField
                label={OFFERS_COPY.maxRedemptions}
                name="max_redemptions"
                type="number"
                value={form.max_redemptions}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    max_redemptions: event.target.value,
                  }))
                }
              />
              <CheckboxField
                id="is_online"
                name="is_online"
                label={OFFERS_COPY.online}
                checked={form.is_online}
                onChange={(checked) =>
                  setForm((current) => ({ ...current, is_online: checked }))
                }
              />
              <CheckboxField
                id="is_counter"
                name="is_counter"
                label={OFFERS_COPY.counter}
                checked={form.is_counter}
                onChange={(checked) =>
                  setForm((current) => ({ ...current, is_counter: checked }))
                }
              />
            </Stack>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setEditor(null)}
              >
                {OFFERS_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {OFFERS_COPY.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => setPendingDelete(null))
        }
      >
        <DialogContent data-testid="offer-delete-dialog">
          <DialogHeader>
            <DialogTitle>{OFFERS_COPY.deleteTitle}</DialogTitle>
            <DialogDescription>{OFFERS_COPY.deleteHelp}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className={compactBtn}
              onClick={() => setPendingDelete(null)}
            >
              {OFFERS_COPY.cancel}
            </Button>
            <Button
              type="button"
              className={compactBtn}
              disabled={busy}
              onClick={() => void confirmDelete()}
            >
              {OFFERS_COPY.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

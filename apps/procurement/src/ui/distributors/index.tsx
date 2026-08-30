import type {
  Distributor,
  PageMeta,
  PriceCompareRow,
  ProcurementFeatureData,
  SupplyItem,
} from '@medmate/procurement-contract';
import {
  distributorsLockCopy,
  formatInr,
  isPlanFeatureLocked,
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
  TextField,
} from '@medmate/ui';
import { Building2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  DISTRIBUTORS_COPY,
  dash,
  errorText,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { PlanLock } from '../shared/plan-lock';
import { SectionBlock } from '../shared/section-block';

export function DistributorsScreen({
  feature,
  onNavigate,
}: {
  feature: ProcurementFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canAccess = feature.canAccessGrowth !== false;
  const canMutate = Boolean(feature.canMutateDistributors);
  const canCompare = Boolean(feature.canPriceCompare);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Distributor[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(canAccess);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [locked, setLocked] = useState(!canAccess);
  const [firmName, setFirmName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<Distributor | null>(null);
  const [supply, setSupply] = useState<SupplyItem[]>([]);
  const [compare, setCompare] = useState<PriceCompareRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canAccess) {
      setLocked(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'distributors',
      action: 'load',
      values: { page },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result));
      return;
    }
    setLocked(false);
    setRows(listOf(result.distributors));
    setMeta(pageMeta(result.meta));
  }, [canAccess, feature, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'distributors',
      action: 'create',
      values: { firm_name: firmName, phone, gstin },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setFirmName('');
    setPhone('');
    setGstin('');
    await load();
  }

  async function confirmDelete() {
    const current = removing as Distributor;
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'distributors',
      action: 'delete',
      values: { id: current.id },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setRemoving(null);
    await load();
  }

  async function openSupply(id: string) {
    setSelectedId(id);
    const result = await feature.onSubmit({
      screen: 'distributors',
      action: 'loadSupply',
      values: { id },
    });
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setSupply(listOf(result.supplyItems));
  }

  async function loadCompare() {
    const result = await feature.onSubmit({
      screen: 'distributors',
      action: 'loadPriceCompare',
      values: { only_multi_source: true },
    });
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setCompare(listOf(result.compare));
  }

  async function setPreferred(distributorId: string, productId: string) {
    const result = await feature.onSubmit({
      screen: 'distributors',
      action: 'setPreferred',
      values: { id: distributorId, product_id: productId },
    });
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    await openSupply(distributorId);
  }

  if (locked) {
    return (
      <PlanLock
        testId="distributors-plan-lock"
        message={distributorsLockCopy()}
        viewPlansLabel={DISTRIBUTORS_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={feature.role === 'pharmacy_staff'}
      />
    );
  }

  return (
    <Stack gap="4">
      <FormBanner message={error} testId="distributors-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {DISTRIBUTORS_COPY.retry}
        </Button>
      ) : null}
      {canMutate ? (
        <Flex gap="3" wrap align="end">
          <TextField
            label={DISTRIBUTORS_COPY.firmName}
            name="firm_name"
            value={firmName}
            onChange={(event) => setFirmName(event.target.value)}
          />
          <TextField
            label={DISTRIBUTORS_COPY.phone}
            name="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <TextField
            label={DISTRIBUTORS_COPY.gstin}
            name="gstin"
            value={gstin}
            onChange={(event) => setGstin(event.target.value)}
          />
          <Button type="button" disabled={busy} onClick={() => void create()}>
            {DISTRIBUTORS_COPY.create}
          </Button>
        </Flex>
      ) : null}
      {canCompare ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => void loadCompare()}
        >
          {DISTRIBUTORS_COPY.compare}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="distributors-loading" /> : null}
      {!loading && rows.length === 0 ? (
        <EmptyState icon={Building2} testId="distributors-empty">
          {DISTRIBUTORS_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <SectionBlock
          id="section-distributors"
          title={DISTRIBUTORS_COPY.sectionTitle}
          hint={DISTRIBUTORS_COPY.sectionHint}
          icon={Building2}
        >
          <Table
            aria-label={DISTRIBUTORS_COPY.tableLabel}
            data-testid="distributors-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Firm</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} data-testid={`distributor-${row.id}`}>
                  <TableCell>{row.firm_name}</TableCell>
                  <TableCell>{dash(row.payment_terms_days)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(row.credit_limit)}
                  </TableCell>
                  <TableCell>
                    <Flex gap="2" wrap>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void openSupply(row.id)}
                      >
                        {DISTRIBUTORS_COPY.supply}
                      </Button>
                      {canMutate ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setRemoving(row)}
                        >
                          {DISTRIBUTORS_COPY.delete}
                        </Button>
                      ) : null}
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBlock>
      ) : null}
      {supply.length > 0 ? (
        <Table aria-label={DISTRIBUTORS_COPY.supply} data-testid="supply-table">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Landed</TableHead>
              <TableHead>Preferred</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supply.map((item) => (
              <TableRow key={item.product_id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell className="tabular-nums">
                  {formatInr(item.effective_landed_cost)}
                </TableCell>
                <TableCell>
                  {item.is_preferred_source ? (
                    <Badge>{DISTRIBUTORS_COPY.preferredMark}</Badge>
                  ) : canMutate ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        void setPreferred(selectedId as string, item.product_id)
                      }
                    >
                      {DISTRIBUTORS_COPY.preferred}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
      {compare.length > 0 ? (
        <Table
          aria-label={DISTRIBUTORS_COPY.compareLabel}
          data-testid="price-compare-table"
        >
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Distributor</TableHead>
              <TableHead>Landed</TableHead>
              <TableHead>Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compare.flatMap((row) =>
              listOf(row.distributor_prices).map((price) => (
                <TableRow key={`${row.product_id}-${price.distributor_id}`}>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{price.distributor_name}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(price.effective_landed_cost)}
                  </TableCell>
                  <TableCell>{dash(price.price_rank)}</TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={DISTRIBUTORS_COPY.previous}
        nextLabel={DISTRIBUTORS_COPY.next}
        pageLabel={DISTRIBUTORS_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
      <Dialog
        open={Boolean(removing)}
        onOpenChange={(open) => applyDialogOpen(open, () => setRemoving(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DISTRIBUTORS_COPY.confirmDelete}</DialogTitle>
            <DialogDescription>
              {DISTRIBUTORS_COPY.confirmDeleteHelp}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRemoving(null)}
            >
              {DISTRIBUTORS_COPY.cancel}
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void confirmDelete()}
            >
              {DISTRIBUTORS_COPY.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

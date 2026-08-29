import type {
  CatalogueFeatureData,
  CatalogueMappingRow,
  PageMeta,
} from '@medmate/catalogue-contract';
import {
  isPriceAboveMrp,
  isScheduleXOnlineRejected,
  isUuid,
  mappingDisplayName,
  rupeeLabel,
  scheduleDisplayLabel,
} from '@medmate/catalogue-contract';
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
import { useCallback, useEffect, useState } from 'react';
import { MAPPING_COPY } from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { buildMappingCommand } from '../../lib/mapping-command';
import { CheckboxField } from '../shared/checkbox-field';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';

type Drawer =
  | { kind: 'create'; medicineId: string }
  | { kind: 'edit'; row: CatalogueMappingRow }
  | null;

export function MappingScreen({
  feature,
  onNavigate,
}: {
  feature: CatalogueFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canCreate = Boolean(feature.canCreate);
  const canDelete = Boolean(feature.canDelete);
  const canPatch = feature.canPatch !== false;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CatalogueMappingRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [pendingDelete, setPendingDelete] =
    useState<CatalogueMappingRow | null>(null);
  const [medicineId, setMedicineId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [visible, setVisible] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'mapping',
      action: 'load',
      values: { page, sort: 'name', order: 'asc' },
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'Unable to load mappings.');
      setRows([]);
      return;
    }
    setRows(result.mappings ?? []);
    setMeta(result.meta ?? {});
  }, [feature, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!feature.createFromMedicineId) {
      return;
    }
    setDrawer({ kind: 'create', medicineId: feature.createFromMedicineId });
    setMedicineId(feature.createFromMedicineId);
    setPrice('');
    setStock('');
    setVisible(true);
    setFieldErrors({});
    setFormError(undefined);
  }, [feature.createFromMedicineId]);

  function openCreate() {
    setDrawer({ kind: 'create', medicineId: '' });
    setMedicineId('');
    setPrice('');
    setStock('');
    setVisible(true);
    setFieldErrors({});
    setFormError(undefined);
  }

  function openEdit(row: CatalogueMappingRow) {
    setDrawer({ kind: 'edit', row });
    setMedicineId(row.master_medicine_id);
    setPrice(
      typeof row.pharmacy_price === 'number' ? String(row.pharmacy_price) : '',
    );
    setStock(
      typeof row.stock_quantity === 'number' ? String(row.stock_quantity) : '',
    );
    setVisible(row.is_visible !== false);
    setFieldErrors({});
    setFormError(undefined);
  }

  async function saveDrawer() {
    const command = buildMappingCommand(
      drawer?.kind === 'edit'
        ? { kind: 'edit', mappingId: drawer.row.mapping_id }
        : { kind: 'create', medicineId },
      {
        medicineId,
        pharmacyPrice: Number(price),
        stockQuantity: Number(stock),
        visible,
      },
    );
    if (!command) {
      setFormError('Enter a master medicine ID.');
      return;
    }
    if (drawer?.kind === 'create' && !isUuid(medicineId.trim())) {
      setFieldErrors({
        master_medicine_id: MAPPING_COPY.invalidMedicineId,
      });
      return;
    }
    setBusy(true);
    setFieldErrors({});
    setFormError(undefined);
    const result = await feature.onSubmit(command);
    setBusy(false);
    if (!result.ok) {
      const nextFields = { ...(result.fieldErrors ?? {}) };
      if (isPriceAboveMrp(result.code) && !nextFields.pharmacy_price) {
        nextFields.pharmacy_price =
          result.formError ?? 'Price cannot exceed MRP.';
      }
      setFieldErrors(nextFields);
      setFormError(
        isScheduleXOnlineRejected(result.code)
          ? (result.formError ?? 'Schedule X medicines cannot be sold online.')
          : result.formError,
      );
      return;
    }
    setDrawer(null);
    await load();
  }

  async function confirmDelete(mappingId: string) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'mapping',
      action: 'delete',
      values: { mapping_id: mappingId },
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? result.code);
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
    await load();
  }

  return (
    <Stack gap="4">
      <Text tone="muted" data-testid="mapping-stock-note">
        {MAPPING_COPY.stockNote}{' '}
        <Button
          type="button"
          variant="ghost"
          className="inline-flex min-h-0 px-1 py-0"
          onClick={() => onNavigate?.('/inventory')}
        >
          {MAPPING_COPY.inventory}
        </Button>
      </Text>
      {!canCreate ? (
        <StatusMessage>{MAPPING_COPY.staffView}</StatusMessage>
      ) : (
        <Flex justify="end">
          <Button type="button" onClick={openCreate}>
            {MAPPING_COPY.create}
          </Button>
        </Flex>
      )}
      <FormBanner message={error} testId="mapping-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {MAPPING_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="mapping-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <Card data-testid="mapping-empty" role="status">
          <Stack gap="3">
            <Text>{MAPPING_COPY.empty}</Text>
            <Button type="button" onClick={() => onNavigate?.('/catalogue')}>
              {MAPPING_COPY.searchCta}
            </Button>
          </Stack>
        </Card>
      ) : null}
      {rows.length > 0 ? (
        <Table aria-label={MAPPING_COPY.tableLabel} data-testid="mapping-table">
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>
                <VisuallyHidden>Actions</VisuallyHidden>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.mapping_id}
                data-testid={`mapping-row-${row.mapping_id}`}
              >
                <TableCell>{mappingDisplayName(row)}</TableCell>
                <TableCell>
                  <Badge>{scheduleDisplayLabel(row.schedule)}</Badge>
                </TableCell>
                <TableCell>{rupeeLabel(row.pharmacy_price)}</TableCell>
                <TableCell>{row.stock_quantity ?? '—'}</TableCell>
                <TableCell>
                  {row.is_visible === false ? 'Hidden' : 'Visible'}
                </TableCell>
                <TableCell>
                  <Flex gap="2" wrap>
                    {canPatch ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => openEdit(row)}
                      >
                        {MAPPING_COPY.edit}
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => setPendingDelete(row)}
                      >
                        {MAPPING_COPY.delete}
                      </Button>
                    ) : null}
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={MAPPING_COPY.previous}
        nextLabel={MAPPING_COPY.next}
        pageLabel="Page"
        onPage={setPage}
        disabled={loading}
      />

      <Dialog
        open={drawer !== null}
        onOpenChange={(open) => {
          applyDialogOpen(open, () => setDrawer(null));
        }}
      >
        <DialogContent data-testid="mapping-drawer">
          <DialogHeader>
            <DialogTitle>
              {drawer?.kind === 'edit'
                ? MAPPING_COPY.edit
                : MAPPING_COPY.create}
            </DialogTitle>
            <DialogDescription>
              Price must stay at or below master MRP.
            </DialogDescription>
          </DialogHeader>
          <Stack gap="3">
            <FormBanner message={formError} testId="mapping-form-error" />
            <TextField
              label={MAPPING_COPY.medicineId}
              name="master_medicine_id"
              value={medicineId}
              disabled={drawer?.kind === 'edit'}
              error={fieldErrors.master_medicine_id}
              onChange={(event) => setMedicineId(event.target.value)}
            />
            <TextField
              label={MAPPING_COPY.price}
              name="pharmacy_price"
              type="number"
              inputMode="decimal"
              value={price}
              error={fieldErrors.pharmacy_price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <TextField
              label={MAPPING_COPY.stock}
              name="stock_quantity"
              type="number"
              inputMode="numeric"
              value={stock}
              error={fieldErrors.stock_quantity}
              onChange={(event) => setStock(event.target.value)}
            />
            {drawer?.kind === 'edit' ? (
              <CheckboxField
                id="is_visible"
                name="is_visible"
                label={MAPPING_COPY.visible}
                checked={visible}
                onChange={setVisible}
              />
            ) : null}
          </Stack>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDrawer(null)}
            >
              {MAPPING_COPY.close}
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void saveDrawer()}
            >
              {MAPPING_COPY.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          applyDialogOpen(open, () => setPendingDelete(null));
        }}
      >
        <DialogContent data-testid="mapping-delete-dialog">
          <DialogHeader>
            <DialogTitle>{MAPPING_COPY.confirmDelete}</DialogTitle>
            <DialogDescription>
              {MAPPING_COPY.confirmDeleteHelp}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDelete(null)}
            >
              {MAPPING_COPY.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => void confirmDelete(pendingDelete!.mapping_id)}
            >
              {MAPPING_COPY.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

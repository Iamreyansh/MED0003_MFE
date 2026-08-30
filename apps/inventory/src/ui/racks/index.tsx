import type {
  InventoryFeatureData,
  RackLocation,
  UnlocatedProduct,
} from '@medmate/inventory-contract';
import {
  isRackNotFound,
  productDisplayName,
} from '@medmate/inventory-contract';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Grid,
  Spinner,
  Stack,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextField,
  VisuallyHidden,
} from '@medmate/ui';
import { MapPin, MapPinned, PackagePlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RACKS_COPY, unlocatedHint } from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { RackChip } from '../shared/rack-chip';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';

export function RacksScreen({ feature }: { feature: InventoryFeatureData }) {
  const canManage = Boolean(feature.canManageRacks);
  const canWrite = Boolean(feature.canWrite);
  const [racks, setRacks] = useState<RackLocation[]>([]);
  const [unlocated, setUnlocated] = useState<UnlocatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [formError, setFormError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('');
  const [name, setName] = useState('');
  const [assignProduct, setAssignProduct] = useState('');
  const [assignRack, setAssignRack] = useState('');
  const [pendingDelete, setPendingDelete] = useState<RackLocation | null>(null);
  const [notFound, setNotFound] = useState(false);

  function startWithA1() {
    setCode('A1-01');
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const [list, queue] = await Promise.all([
      feature.onSubmit({ screen: 'racks', action: 'load' }),
      feature.onSubmit({ screen: 'racks', action: 'loadUnlocated' }),
    ]);
    setLoading(false);
    if (!list.ok) {
      if (isRackNotFound(list.code)) {
        setNotFound(true);
        return;
      }
      setError(list.formError ?? list.code ?? 'Unable to load racks.');
      setRacks([]);
      return;
    }
    setRacks(list.racks ?? []);
    if (queue.ok) {
      setUnlocated(queue.unlocated ?? []);
    }
  }, [feature]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createRack() {
    const zoneName = zone.trim();
    if (!zoneName) {
      setFieldErrors({ zone_name: RACKS_COPY.zoneRequired });
      return;
    }
    setBusy(true);
    setFieldErrors({});
    setFormError(undefined);
    const result = await feature.onSubmit({
      screen: 'racks',
      action: 'create',
      values: {
        rack_code: code.trim(),
        zone_name: zoneName,
        description: name.trim() || undefined,
        name: name.trim() || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? result.code);
      return;
    }
    setCode('');
    setZone('');
    setName('');
    await load();
  }

  async function assign() {
    setBusy(true);
    setFormError(undefined);
    const result = await feature.onSubmit({
      screen: 'racks',
      action: 'assign',
      values: { product_id: assignProduct, rack_code: assignRack },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? result.code);
      return;
    }
    setAssignProduct('');
    setAssignRack('');
    await load();
  }

  async function confirmDelete() {
    const current = pendingDelete as RackLocation;
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'racks',
      action: 'delete',
      values: { rack_code: current.rack_code },
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

  if (notFound) {
    return (
      <StatusMessage tone="error" data-testid="rack-not-found">
        {RACKS_COPY.notFound}
      </StatusMessage>
    );
  }

  const shelves = (
    <Stack gap="4">
      <FormBanner message={error} testId="racks-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {RACKS_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="racks-loading" /> : null}
      {!loading && !error && racks.length === 0 ? (
        <EmptyState
          icon={MapPin}
          testId="racks-empty"
          actions={
            canManage ? (
              <Button type="button" onClick={startWithA1}>
                {RACKS_COPY.startWithA1}
              </Button>
            ) : undefined
          }
        >
          {RACKS_COPY.empty}
        </EmptyState>
      ) : null}
      {racks.length > 0 ? (
        <SectionBlock
          id="section-shelves"
          title={RACKS_COPY.shelvesTitle}
          hint={RACKS_COPY.shelvesHint}
          icon={MapPinned}
        >
          <Table aria-label={RACKS_COPY.tableLabel} data-testid="racks-table">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>
                  <VisuallyHidden>Actions</VisuallyHidden>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racks.map((row) => (
                <TableRow
                  key={row.rack_code}
                  data-testid={`rack-row-${row.rack_code}`}
                >
                  <TableCell>
                    <RackChip code={row.rack_code} />
                  </TableCell>
                  <TableCell>{row.zone_name ?? '—'}</TableCell>
                  <TableCell>{row.description ?? row.name ?? '—'}</TableCell>
                  <TableCell className="tabular-nums">
                    {row.medicine_count ?? row.product_count ?? '—'}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => setPendingDelete(row)}
                      >
                        {RACKS_COPY.delete}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBlock>
      ) : null}
    </Stack>
  );

  const tools =
    canManage || canWrite ? (
      <Stack gap="4">
        <FormBanner message={formError} testId="racks-form-error" />
        {canManage ? (
          <SectionBlock
            id="section-create-rack"
            title={RACKS_COPY.create}
            hint={RACKS_COPY.createHint}
            icon={PackagePlus}
            footer={
              <Button
                type="button"
                disabled={busy}
                onClick={() => void createRack()}
              >
                {RACKS_COPY.create}
              </Button>
            }
          >
            <Stack gap="3" data-testid="create-rack">
              <TextField
                label={RACKS_COPY.code}
                name="rack_code"
                value={code}
                error={fieldErrors.rack_code}
                onChange={(event) => setCode(event.target.value)}
              />
              <TextField
                label={RACKS_COPY.zone}
                name="zone_name"
                value={zone}
                error={fieldErrors.zone_name}
                onChange={(event) => setZone(event.target.value)}
              />
              <TextField
                label={RACKS_COPY.name}
                name="description"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Stack>
          </SectionBlock>
        ) : null}
        {canWrite ? (
          <SectionBlock
            id="section-unlocated"
            title={RACKS_COPY.unlocated}
            hint={unlocatedHint(unlocated.length)}
            icon={MapPin}
            footer={
              <Flex gap="2" wrap>
                <Button
                  type="button"
                  disabled={busy || !assignProduct || !assignRack}
                  onClick={() => void assign()}
                >
                  {RACKS_COPY.assign}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      setFormError(undefined);
                      const result = await feature.onSubmit({
                        screen: 'racks',
                        action: 'printLabels',
                        values: {
                          rack_codes: racks.map((row) => row.rack_code),
                        },
                      });
                      setBusy(false);
                      if (!result.ok) {
                        setFormError(result.formError ?? result.code);
                      }
                    })();
                  }}
                >
                  {RACKS_COPY.print}
                </Button>
              </Flex>
            }
          >
            <Stack gap="3" data-testid="assign-unlocated">
              <SelectField
                id="assign-product"
                name="product_id"
                label={RACKS_COPY.product}
                value={assignProduct}
                onChange={(event) => setAssignProduct(event.target.value)}
              >
                <option value="">{RACKS_COPY.selectProduct}</option>
                {unlocated.map((row) => (
                  <option key={row.product_id} value={row.product_id}>
                    {productDisplayName(row)}
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="assign-rack"
                name="rack_code"
                label={RACKS_COPY.rack}
                value={assignRack}
                onChange={(event) => setAssignRack(event.target.value)}
              >
                <option value="">{RACKS_COPY.selectRack}</option>
                {racks.map((row) => (
                  <option key={row.rack_code} value={row.rack_code}>
                    {row.rack_code}
                  </option>
                ))}
              </SelectField>
            </Stack>
          </SectionBlock>
        ) : null}
      </Stack>
    ) : null;

  return (
    <Stack gap="4">
      {tools ? (
        <Grid gap="4" className="grid-cols-1 lg:grid-cols-2">
          {shelves}
          {tools}
        </Grid>
      ) : (
        shelves
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          applyDialogOpen(open, () => setPendingDelete(null));
        }}
      >
        <DialogContent data-testid="rack-delete-dialog">
          <DialogHeader>
            <DialogTitle>{RACKS_COPY.confirmDelete}</DialogTitle>
            <DialogDescription>
              {RACKS_COPY.confirmDeleteHelp}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDelete(null)}
            >
              {RACKS_COPY.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => void confirmDelete()}
            >
              {RACKS_COPY.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

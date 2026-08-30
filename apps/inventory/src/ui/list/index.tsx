import type {
  InventoryFeatureData,
  InventoryProduct,
  InventorySummary,
  PageMeta,
} from '@medmate/inventory-contract';
import { productDisplayName } from '@medmate/inventory-contract';
import {
  Badge,
  Box,
  Button,
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
  TextField,
  VisuallyHidden,
} from '@medmate/ui';
import { Layers, PackageSearch } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LIST_COPY } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { RackChip } from '../shared/rack-chip';
import { SectionBlock } from '../shared/section-block';
import { ListSummary } from './summary';

export function ListScreen({
  feature,
  onNavigate,
}: {
  feature: InventoryFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canWrite = feature.canWrite !== false;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const [list, cards] = await Promise.all([
      feature.onSubmit({
        screen: 'list',
        action: 'load',
        values: { page, search: search.trim() || undefined },
      }),
      feature.onSubmit({ screen: 'list', action: 'loadSummary' }),
    ]);
    setLoading(false);
    if (!list.ok) {
      setError(list.formError ?? list.code ?? 'Unable to load inventory.');
      setRows([]);
      return;
    }
    setRows(list.products ?? []);
    setMeta(list.meta ?? {});
    if (cards.ok) {
      setSummary(cards.summary ?? null);
    }
  }, [feature, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportList() {
    setExporting(true);
    const result = await feature.onSubmit({
      screen: 'list',
      action: 'export',
      values: { format: 'xlsx' },
    });
    setExporting(false);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'Unable to export.');
    }
  }

  return (
    <Stack gap="4">
      {!canWrite ? <StatusMessage>{LIST_COPY.readOnly}</StatusMessage> : null}
      {summary ? (
        <ListSummary
          summary={summary}
          onNearExpiry={() => onNavigate?.('/inventory/expiry')}
        />
      ) : null}
      <Flex justify="between" wrap gap="3" align="end">
        <Box className="min-w-0 flex-1 md:max-w-sm">
          <TextField
            label={LIST_COPY.search}
            name="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
        </Box>
        <Flex gap="2" wrap>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onNavigate?.('/inventory/expiry')}
          >
            {LIST_COPY.expiryCta}
          </Button>
          {canWrite ? (
            <Button
              type="button"
              variant="ghost"
              disabled={exporting}
              onClick={() => void exportList()}
            >
              {LIST_COPY.export}
            </Button>
          ) : null}
        </Flex>
      </Flex>
      <FormBanner message={error} testId="inventory-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {LIST_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="inventory-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          testId="inventory-empty"
          actions={
            <Flex gap="2" wrap>
              <Button type="button" onClick={() => onNavigate?.('/catalogue')}>
                {LIST_COPY.catalogueCta}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate?.('/purchases')}
              >
                {LIST_COPY.purchasesCta}
              </Button>
            </Flex>
          }
        >
          {LIST_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <SectionBlock
          id="section-stock"
          title={LIST_COPY.sectionTitle}
          hint={LIST_COPY.sectionHint}
          icon={Layers}
        >
          <Table
            aria-label={LIST_COPY.tableLabel}
            data-testid="inventory-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Online</TableHead>
                <TableHead>
                  <VisuallyHidden>Open</VisuallyHidden>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.product_id}
                  data-testid={`inventory-row-${row.product_id}`}
                >
                  <TableCell>{productDisplayName(row)}</TableCell>
                  <TableCell className="tabular-nums">
                    {row.stock_quantity ?? '—'}
                  </TableCell>
                  <TableCell>
                    <RackChip code={row.rack_location_code} />
                  </TableCell>
                  <TableCell>
                    <Badge tone={row.is_online_visible ? 'primary' : 'default'}>
                      {row.is_online_visible
                        ? LIST_COPY.listed
                        : LIST_COPY.hidden}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        onNavigate?.(`/inventory/${row.product_id}`)
                      }
                    >
                      Open
                    </Button>
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
        previousLabel={LIST_COPY.previous}
        nextLabel={LIST_COPY.next}
        pageLabel={LIST_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

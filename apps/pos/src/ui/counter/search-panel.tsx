import type { PosSearchHit, SearchMode } from '@medmate/pos-contract';
import { formatInr, SEARCH_MODES } from '@medmate/pos-contract';
import { Box, Button, Flex, Text, TextField } from '@medmate/ui';
import { COUNTER_COPY } from '../../lib/copy';
import { ChoiceGroup } from './choice-group';

export function SearchPanel({
  resultsId,
  query,
  mode,
  hits,
  searching,
  busy,
  onQueryChange,
  onModeChange,
  onSearch,
  onAdd,
}: {
  resultsId: string;
  query: string;
  mode: SearchMode;
  hits: PosSearchHit[] | null;
  searching: boolean;
  busy: boolean;
  onQueryChange: (value: string) => void;
  onModeChange: (mode: SearchMode) => void;
  onSearch: () => void;
  onAdd: (hit: PosSearchHit) => void;
}) {
  return (
    <Box
      id="pos-search"
      className="rounded-mm border border-mm-border bg-mm-surface p-3 shadow-sm"
    >
      <ChoiceGroup
        legend={COUNTER_COPY.mode}
        name="pos-search-mode"
        value={mode}
        options={SEARCH_MODES.map((value) => ({
          value,
          label: value === 'TEXT' ? COUNTER_COPY.text : COUNTER_COPY.barcode,
        }))}
        onChange={onModeChange}
      />
      <Flex gap="2" align="end" className="mt-2">
        <Box className="min-w-0 flex-1">
          <TextField
            id="pos-search-input"
            label={COUNTER_COPY.search}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            role="combobox"
            aria-expanded={hits !== null}
            aria-controls={resultsId}
            aria-autocomplete="list"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSearch();
              }
            }}
          />
        </Box>
        <Button
          type="button"
          className="min-h-11"
          onClick={onSearch}
          disabled={searching}
        >
          {COUNTER_COPY.searchAction}
        </Button>
      </Flex>
      {hits && hits.length === 0 ? (
        <Text
          size="sm"
          tone="muted"
          role="status"
          className="mt-2"
          data-testid="pos-search-empty"
        >
          {COUNTER_COPY.emptySearch}
        </Text>
      ) : null}
      {hits && hits.length > 0 ? (
        <ul
          id={resultsId}
          role="listbox"
          aria-label={COUNTER_COPY.results}
          data-testid="pos-search-results"
          className="mt-2 divide-y divide-mm-border"
        >
          {hits.map((hit) => (
            <li key={hit.product_id} role="option" aria-selected={false}>
              <Flex align="center" justify="between" gap="2" className="py-2">
                <Box className="min-w-0">
                  <Text className="truncate">{hit.name ?? 'Product'}</Text>
                  <Text size="sm" tone="muted">
                    {formatInr(hit.mrp)}
                    {hit.total_stock_units != null
                      ? ` · ${hit.total_stock_units}`
                      : ''}
                  </Text>
                </Box>
                <Button
                  type="button"
                  className="min-h-9 shrink-0 px-2 text-sm"
                  onClick={() => onAdd(hit)}
                  disabled={busy}
                >
                  {COUNTER_COPY.add}
                </Button>
              </Flex>
            </li>
          ))}
        </ul>
      ) : null}
    </Box>
  );
}

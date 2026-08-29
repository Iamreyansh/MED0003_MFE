import type {
  CatalogueFeatureData,
  CatalogueSearchResult,
  PageMeta,
  ScheduleRule,
} from '@medmate/catalogue-contract';
import {
  MIN_QUERY_LENGTH,
  isQueryTooShort,
  rupeeLabel,
  scheduleDisplayLabel,
} from '@medmate/catalogue-contract';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  StatusMessage,
  Text,
  TextField,
} from '@medmate/ui';
import { useCallback, useEffect, useState } from 'react';
import { SEARCH_COPY } from '../../lib/copy';
import { useDebouncedValue } from '../../lib/debounce';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';

export function SearchScreen({
  feature,
  onNavigate,
}: {
  feature: CatalogueFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<CatalogueSearchResult[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [fieldError, setFieldError] = useState<string | undefined>();

  useEffect(() => {
    void feature
      .onSubmit({ screen: 'search', action: 'loadScheduleRules' })
      .then((result) => {
        if (result.ok) {
          setRules(result.scheduleRules ?? []);
        }
      });
  }, [feature]);

  const runSearch = useCallback(
    async (q: string, nextPage: number) => {
      const trimmed = q.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setMeta({});
        setLoading(false);
        setError(undefined);
        setFieldError(undefined);
        return;
      }
      setLoading(true);
      setError(undefined);
      setFieldError(undefined);
      const result = await feature.onSubmit({
        screen: 'search',
        action: 'search',
        values: { q: trimmed, page: nextPage, source: 'ALL' },
      });
      setLoading(false);
      if (!result.ok) {
        if (isQueryTooShort(result.code)) {
          setFieldError(result.formError ?? result.code);
        } else {
          setError(result.formError ?? result.code ?? 'Unable to search.');
        }
        setResults([]);
        return;
      }
      setResults(result.results ?? []);
      setMeta(result.meta ?? {});
    },
    [feature],
  );

  useEffect(() => {
    void runSearch(debounced, page);
  }, [debounced, page, runSearch]);

  function onQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  const trimmed = debounced.trim();
  const tooShort = trimmed.length < MIN_QUERY_LENGTH;
  const canCreate = Boolean(feature.canCreate);

  return (
    <Stack gap="4">
      <TextField
        label={SEARCH_COPY.label}
        name="q"
        value={query}
        autoComplete="off"
        error={fieldError}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <FormBanner message={error} testId="search-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => void runSearch(debounced, page)}
        >
          {SEARCH_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="search-loading" /> : null}
      {tooShort && !loading ? (
        <StatusMessage data-testid="search-hint">
          {SEARCH_COPY.hint}
        </StatusMessage>
      ) : null}
      {!tooShort && !loading && !error && results.length === 0 ? (
        <StatusMessage data-testid="search-empty">
          {SEARCH_COPY.empty}
        </StatusMessage>
      ) : null}
      {results.length > 0 ? (
        <Box
          role="listbox"
          aria-label={SEARCH_COPY.results}
          data-testid="search-results"
        >
          <Stack gap="2">
            {results.map((item) => {
              const mapped = Boolean(item.is_mapped);
              const schedule = scheduleDisplayLabel(item.schedule, rules);
              return (
                <Card
                  key={`${item.medicine_id}-${item.mapping_id ?? 'new'}`}
                  role="option"
                  aria-selected={false}
                  data-testid={`search-result-${item.medicine_id}`}
                >
                  <Flex align="start" justify="between" gap="3" wrap>
                    <Stack gap="1" className="min-w-0">
                      <Text>{item.name}</Text>
                      <Text tone="muted" size="sm">
                        {[item.salt_composition, item.manufacturer]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                      <Flex gap="2" wrap>
                        <Badge data-testid={`schedule-${item.medicine_id}`}>
                          {schedule}
                        </Badge>
                        <Badge
                          tone={mapped ? 'primary' : 'default'}
                          data-testid={`mapped-${item.medicine_id}`}
                        >
                          {mapped ? SEARCH_COPY.mapped : SEARCH_COPY.unmapped}
                        </Badge>
                        <Text tone="muted" size="sm">
                          MRP {rupeeLabel(item.master_mrp)}
                        </Text>
                      </Flex>
                    </Stack>
                    {mapped ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onNavigate?.('/catalogue/mapping')}
                      >
                        {SEARCH_COPY.viewMappings}
                      </Button>
                    ) : canCreate ? (
                      <Button
                        type="button"
                        onClick={() =>
                          onNavigate?.(
                            `/catalogue/mapping?master_medicine_id=${encodeURIComponent(item.medicine_id)}`,
                          )
                        }
                      >
                        {SEARCH_COPY.map}
                      </Button>
                    ) : null}
                  </Flex>
                </Card>
              );
            })}
          </Stack>
        </Box>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={SEARCH_COPY.previous}
        nextLabel={SEARCH_COPY.next}
        pageLabel={SEARCH_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

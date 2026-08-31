import type {
  SupportFeatureData,
  SupportTicket,
} from '@medmate/support-contract';
import { ticketIdOf } from '@medmate/support-contract';
import {
  Box,
  Button,
  Flex,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@medmate/ui';
import { LifeBuoy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TICKET_LIST_COPY, dash, errorText } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { StatusBadge } from '../shared/status-badge';

export function TicketListScreen({
  feature,
  onNavigate,
}: {
  feature: SupportFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SupportTicket[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'ticket-list',
      action: 'load',
      values: { page, limit: 20 },
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load tickets.'));
      return;
    }
    setRows(result.tickets ?? []);
    setHasNext(Boolean(result.meta?.has_next));
  }, [feature, page]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!feature.canUseTickets) {
    return (
      <FormBanner
        message={
          feature.tokenScope === 'pos'
            ? 'This page needs a full pharmacy session.'
            : 'You do not have permission to do that.'
        }
        testId="ticket-list-forbidden"
      />
    );
  }

  if (loading) {
    return (
      <Spinner data-testid="ticket-list-loading" aria-label="Loading tickets" />
    );
  }

  return (
    <>
      <FormBanner message={error} testId="ticket-list-error" />
      <Flex justify="end" className="mb-3">
        <Button type="button" onClick={() => onNavigate?.('/support/new')}>
          {TICKET_LIST_COPY.newTicket}
        </Button>
      </Flex>
      {rows.length === 0 ? (
        <EmptyState icon={LifeBuoy} testId="ticket-list-empty">
          {TICKET_LIST_COPY.empty}
        </EmptyState>
      ) : (
        <Box className="overflow-hidden rounded-mm border border-mm-border bg-mm-surface">
          <Table
            aria-label={TICKET_LIST_COPY.tableLabel}
            data-testid="ticket-list-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const id = ticketIdOf(row);
                return (
                  <TableRow key={id || dash(row.subject)}>
                    <TableCell>{dash(row.subject)}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <Flex justify="end">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={!id}
                          onClick={() => onNavigate?.(`/support/tickets/${id}`)}
                        >
                          {TICKET_LIST_COPY.open}
                        </Button>
                      </Flex>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {page > 1 || hasNext ? (
            <Flex align="center" gap="2" wrap className="p-3">
              <Button
                type="button"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {TICKET_LIST_COPY.previous}
              </Button>
              <Text size="sm" tone="muted">
                {TICKET_LIST_COPY.page} {page}
              </Text>
              <Button
                type="button"
                variant="ghost"
                disabled={!hasNext}
                onClick={() => setPage(page + 1)}
              >
                {TICKET_LIST_COPY.next}
              </Button>
            </Flex>
          ) : null}
        </Box>
      )}
    </>
  );
}

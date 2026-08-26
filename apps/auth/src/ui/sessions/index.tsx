import type { AuthFeatureData, AuthSessionRow } from '@medmate/auth-contract';
import {
  Badge,
  Button,
  Flex,
  PageSection,
  Stack,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@medmate/ui';
import { useCallback, useEffect, useState } from 'react';
import { AuthFormError } from '../shared/form-error';
import { RevokeDialog } from './revoke-dialog';

export function SessionsScreen({ feature }: { feature: AuthFeatureData }) {
  const [rows, setRows] = useState<AuthSessionRow[]>(feature.sessions ?? []);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    feature.sessions ? 'ready' : 'loading',
  );
  const [error, setError] = useState<string | null>(feature.formError ?? null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(
    async (nextPage: number) => {
      setStatus('loading');
      setError(null);
      const result = await feature.onSubmit({
        portalType: 'sessions',
        action: 'list',
        values: { page: nextPage },
      });
      if (!result.ok) {
        setStatus('error');
        setError(result.formError ?? result.code ?? 'UNKNOWN');
        return;
      }
      setRows(result.sessions ?? []);
      setHasNext(result.hasNext === true);
      setPage(result.page ?? nextPage);
      setStatus('ready');
    },
    [feature],
  );

  useEffect(() => {
    if (!feature.sessions) {
      void load(1);
    }
  }, [feature.sessions, load]);

  async function confirmRevoke() {
    const id = pendingId!;
    setRevoking(true);
    const result = await feature.onSubmit({
      portalType: 'sessions',
      action: 'revoke',
      values: { sessionId: id },
    });
    setRevoking(false);
    setPendingId(null);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? 'UNKNOWN');
      return;
    }
    await load(page);
  }

  return (
    <PageSection>
      <Stack gap="4">
        {status === 'loading' ? (
          <StatusMessage>Loading sessions…</StatusMessage>
        ) : null}
        {error ? <AuthFormError message={error} /> : null}
        {status === 'ready' && rows.length === 0 ? (
          <StatusMessage data-testid="sessions-empty">
            No active sessions.
          </StatusMessage>
        ) : null}
        {status === 'ready' && rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Device</TableHead>
                <TableHead scope="col">IP</TableHead>
                <TableHead scope="col">Location</TableHead>
                <TableHead scope="col">Last active</TableHead>
                <TableHead scope="col">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sessionId}>
                  <TableCell>
                    <Flex align="center" gap="2" wrap>
                      <span>{row.device ?? 'Unknown device'}</span>
                      {row.isCurrent ? (
                        <Badge tone="primary">this device</Badge>
                      ) : null}
                    </Flex>
                  </TableCell>
                  <TableCell>{row.ipAddress ?? '—'}</TableCell>
                  <TableCell>{row.location ?? '—'}</TableCell>
                  <TableCell>{row.lastActiveAt ?? '—'}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPendingId(row.sessionId)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
        <Flex gap="2">
          <Button
            type="button"
            variant="ghost"
            disabled={page <= 1 || status === 'loading'}
            onClick={() => void load(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!hasNext || status === 'loading'}
            onClick={() => void load(page + 1)}
          >
            Next
          </Button>
        </Flex>
        <RevokeDialog
          open={Boolean(pendingId)}
          revoking={revoking}
          onCancel={() => setPendingId(null)}
          onConfirm={() => void confirmRevoke()}
        />
      </Stack>
    </PageSection>
  );
}

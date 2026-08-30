import type {
  SupportFeatureData,
  SupportTicket,
  TicketReply,
} from '@medmate/support-contract';
import {
  isForbidden,
  isTicketNotFound,
  replyBodyOf,
} from '@medmate/support-contract';
import { Button, Flex, Spinner, Stack, Text } from '@medmate/ui';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TICKET_COPY, dash, errorText, listOf } from '../../lib/copy';
import { canShowCreatorActions } from '../../lib/ticket';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';
import { StatusBadge } from '../shared/status-badge';
import { TextareaField } from '../shared/textarea-field';

export function TicketDetailScreen({
  feature,
}: {
  feature: SupportFeatureData;
}) {
  const ticketId = feature.ticketId ?? '';
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string | undefined>();
  const [reopenReason, setReopenReason] = useState('');
  const [reopenError, setReopenError] = useState<string | undefined>();
  const [rating, setRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [csatSent, setCsatSent] = useState(false);

  const load = useCallback(async () => {
    if (!ticketId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const result = await feature.onSubmit({
      screen: 'ticket-detail',
      action: 'load',
      values: { ticketId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isTicketNotFound(result.code) || isForbidden(result.code)) {
        setNotFound(true);
        setTicket(null);
        return;
      }
      setError(errorText(result, 'Unable to load ticket.'));
      return;
    }
    setTicket(result.ticket ?? null);
  }, [feature, ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function applyMutation(
    result: Awaited<ReturnType<SupportFeatureData['onSubmit']>>,
  ) {
    if (!result.ok) {
      return result;
    }
    if (result.ticket) {
      setTicket(result.ticket);
      return result;
    }
    const refreshed = await feature.onSubmit({
      screen: 'ticket-detail',
      action: 'load',
      values: { ticketId },
    });
    if (refreshed.ok) {
      setTicket(refreshed.ticket ?? null);
    }
    return result;
  }

  if (!feature.canUseTickets) {
    return (
      <FormBanner
        message={
          feature.tokenScope === 'pos'
            ? 'This page needs a full pharmacy session.'
            : TICKET_COPY.forbidden
        }
        testId="ticket-detail-forbidden"
      />
    );
  }

  if (loading) {
    return (
      <Spinner
        size="sm"
        data-testid="ticket-detail-loading"
        label={TICKET_COPY.loading}
      />
    );
  }
  if (notFound) {
    return (
      <Text data-testid="ticket-not-found" role="status">
        {TICKET_COPY.notFound}
      </Text>
    );
  }

  const replies = listOf<TicketReply>(ticket?.replies);
  const showCreator = canShowCreatorActions(ticket, feature.userId);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="ticket-detail-error" />
      <SectionBlock id="section-ticket" title={dash(ticket?.subject)}>
        <Stack gap="2">
          <StatusBadge status={ticket?.status} />
          <Text data-testid="ticket-description">
            {dash(ticket?.description)}
          </Text>
        </Stack>
      </SectionBlock>
      <SectionBlock
        id="section-replies"
        title={TICKET_COPY.thread}
        icon={MessageSquare}
      >
        {replies.length === 0 ? (
          <Text data-testid="ticket-replies-empty" tone="muted" size="sm">
            {TICKET_COPY.noReplies}
          </Text>
        ) : (
          <Stack gap="2" data-testid="ticket-replies">
            {replies.map((item, index) => (
              <Text
                key={String(item.id ?? index)}
                data-testid={`ticket-reply-${index}`}
              >
                {replyBodyOf(item) || dash(null)}
              </Text>
            ))}
          </Stack>
        )}
      </SectionBlock>
      <SectionBlock
        id="section-reply"
        title={TICKET_COPY.reply}
        footer={
          <Button
            type="button"
            className="min-h-10 px-3 text-sm"
            disabled={busy}
            data-testid="ticket-reply-submit"
            onClick={() => {
              void (async () => {
                if (!reply.trim()) {
                  setReplyError(TICKET_COPY.replyRequired);
                  return;
                }
                setReplyError(undefined);
                setBusy(true);
                const result = await applyMutation(
                  await feature.onSubmit({
                    screen: 'ticket-detail',
                    action: 'reply',
                    values: { ticketId, body: reply.trim() },
                  }),
                );
                setBusy(false);
                if (!result.ok) {
                  setError(errorText(result, TICKET_COPY.forbidden));
                  return;
                }
                setReply('');
              })();
            }}
          >
            {TICKET_COPY.sendReply}
          </Button>
        }
      >
        <TextareaField
          label={TICKET_COPY.replyLabel}
          name="reply"
          value={reply}
          error={replyError}
          onChange={(event) => setReply(event.target.value)}
        />
      </SectionBlock>
      {showCreator ? (
        <>
          <SectionBlock
            id="section-csat"
            title={TICKET_COPY.csat}
            hint={TICKET_COPY.csatHint}
            footer={
              <Button
                type="button"
                className="min-h-10 px-3 text-sm"
                disabled={busy || csatSent || rating === null}
                data-testid="ticket-csat-submit"
                onClick={() => {
                  void (async () => {
                    setBusy(true);
                    const result = await applyMutation(
                      await feature.onSubmit({
                        screen: 'ticket-detail',
                        action: 'csat',
                        values: { ticketId, rating: rating as number },
                      }),
                    );
                    setBusy(false);
                    if (!result.ok) {
                      setError(errorText(result, TICKET_COPY.forbidden));
                      return;
                    }
                    setCsatSent(true);
                  })();
                }}
              >
                {TICKET_COPY.sendCsat}
              </Button>
            }
          >
            <fieldset>
              <legend className="font-mm text-sm text-mm-text">
                {TICKET_COPY.rating}
              </legend>
              <Flex gap="2" wrap className="mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? 'primary' : 'ghost'}
                    className="min-h-10 min-w-10 px-2 text-sm"
                    aria-pressed={rating === value}
                    data-testid={`ticket-csat-${value}`}
                    onClick={() => setRating(value)}
                  >
                    {value}
                  </Button>
                ))}
              </Flex>
            </fieldset>
          </SectionBlock>
          <SectionBlock
            id="section-reopen"
            title={TICKET_COPY.reopen}
            footer={
              <Button
                type="button"
                className="min-h-10 px-3 text-sm"
                disabled={busy}
                data-testid="ticket-reopen-submit"
                onClick={() => {
                  void (async () => {
                    if (!reopenReason.trim()) {
                      setReopenError(TICKET_COPY.reopenRequired);
                      return;
                    }
                    setReopenError(undefined);
                    setBusy(true);
                    const result = await applyMutation(
                      await feature.onSubmit({
                        screen: 'ticket-detail',
                        action: 'reopen',
                        values: { ticketId, reason: reopenReason.trim() },
                      }),
                    );
                    setBusy(false);
                    if (!result.ok) {
                      setError(errorText(result, TICKET_COPY.forbidden));
                      return;
                    }
                    setReopenReason('');
                  })();
                }}
              >
                {TICKET_COPY.reopen}
              </Button>
            }
          >
            <TextareaField
              label={TICKET_COPY.reopenReason}
              name="reopen-reason"
              value={reopenReason}
              error={reopenError}
              onChange={(event) => setReopenReason(event.target.value)}
            />
          </SectionBlock>
        </>
      ) : null}
    </Stack>
  );
}

import type { SupportFeatureData } from '@medmate/support-contract';
import { ticketIdOf } from '@medmate/support-contract';
import { Button, Spinner, Stack } from '@medmate/ui';
import { LifeBuoy } from 'lucide-react';
import { useState } from 'react';
import { TICKET_COPY, errorText } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { InputField } from '../shared/input-field';
import { SectionBlock } from '../shared/section-block';
import { TextareaField } from '../shared/textarea-field';

export function TicketNewScreen({
  feature,
  onNavigate,
}: {
  feature: SupportFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [subjectError, setSubjectError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);

  if (!feature.canUseTickets) {
    return (
      <FormBanner
        message={
          feature.tokenScope === 'pos'
            ? 'This page needs a full pharmacy session.'
            : TICKET_COPY.forbidden
        }
        testId="ticket-new-forbidden"
      />
    );
  }

  async function onCreate() {
    if (!subject.trim()) {
      setSubjectError(TICKET_COPY.subjectRequired);
      setError(undefined);
      return;
    }
    setSubjectError(undefined);
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'ticket-new',
      action: 'create',
      values: {
        subject: subject.trim(),
        description: description.trim() || undefined,
        category: 'PHARMACY',
      },
    });
    setBusy(false);
    if (!result.ok) {
      setSubjectError(result.fieldErrors?.subject);
      setError(errorText(result, TICKET_COPY.forbidden));
      return;
    }
    const id = result.ticketId || ticketIdOf(result.ticket);
    if (id) {
      onNavigate?.(`/support/tickets/${id}`);
    }
  }

  return (
    <SectionBlock
      id="section-ticket-new"
      title={TICKET_COPY.submit}
      icon={LifeBuoy}
      footer={
        <Button
          type="button"
          className="min-h-10 px-3 text-sm"
          disabled={busy}
          data-testid="ticket-create"
          onClick={() => {
            void onCreate();
          }}
        >
          {TICKET_COPY.submit}
        </Button>
      }
    >
      <Stack gap="3">
        <FormBanner message={error} testId="ticket-new-error" />
        {busy ? (
          <Spinner
            size="sm"
            data-testid="ticket-creating"
            label={TICKET_COPY.creating}
          />
        ) : null}
        <InputField
          label={TICKET_COPY.subject}
          name="subject"
          value={subject}
          error={subjectError}
          onChange={(event) => setSubject(event.target.value)}
        />
        <TextareaField
          label={TICKET_COPY.description}
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Stack>
    </SectionBlock>
  );
}

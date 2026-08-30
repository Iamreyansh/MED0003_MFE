import type {
  HelpArticle,
  SupportFeatureData,
} from '@medmate/support-contract';
import { isHelpArticleNotFound } from '@medmate/support-contract';
import { Button, Flex, Spinner, Stack, Text } from '@medmate/ui';
import { useCallback, useEffect, useState } from 'react';
import { HELP_COPY, dash, errorText } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

function raiseTicketPath(authenticated: boolean | undefined): string {
  return authenticated ? '/support/new' : '/login?return=/support/new';
}

export function HelpArticleScreen({
  feature,
  onNavigate,
}: {
  feature: SupportFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const articleId = feature.articleId ?? '';
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [feedback, setFeedback] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!articleId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const result = await feature.onSubmit({
      screen: 'help-article',
      action: 'load',
      values: { articleId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isHelpArticleNotFound(result.code)) {
        setNotFound(true);
        setArticle(null);
        return;
      }
      setError(errorText(result, 'Unable to load article.'));
      return;
    }
    setArticle(result.article ?? null);
  }, [articleId, feature]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendDeflection(helpful: boolean) {
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'help-article',
      action: 'deflection',
      values: { articleId, helpful },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to send feedback.'));
      return;
    }
    setFeedback(HELP_COPY.deflectionSent);
  }

  if (loading) {
    return (
      <Spinner
        size="sm"
        data-testid="help-article-loading"
        label={HELP_COPY.articleLoading}
      />
    );
  }
  if (notFound) {
    return (
      <Stack gap="3" data-testid="help-article-not-found">
        <Text role="status">{HELP_COPY.notFound}</Text>
        <Button
          type="button"
          className="min-h-10 px-3 text-sm"
          data-testid="help-article-back"
          onClick={() => onNavigate?.('/help')}
        >
          {HELP_COPY.back}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="help-article-error" />
      <SectionBlock id="section-article" title={dash(article?.title)}>
        <Text data-testid="help-article-body">{dash(article?.body)}</Text>
      </SectionBlock>
      <Flex gap="2" wrap>
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-3 text-sm"
          data-testid="help-article-helpful"
          disabled={busy}
          onClick={() => {
            void sendDeflection(true);
          }}
        >
          {HELP_COPY.helpful}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-3 text-sm"
          data-testid="help-article-not-helpful"
          disabled={busy}
          onClick={() => {
            void sendDeflection(false);
          }}
        >
          {HELP_COPY.notHelpful}
        </Button>
        <Button
          type="button"
          className="min-h-10 px-3 text-sm"
          data-testid="help-article-raise"
          onClick={() => onNavigate?.(raiseTicketPath(feature.authenticated))}
        >
          {HELP_COPY.raise}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-3 text-sm"
          data-testid="help-article-back"
          onClick={() => onNavigate?.('/help')}
        >
          {HELP_COPY.back}
        </Button>
      </Flex>
      {feedback ? (
        <Text data-testid="help-deflection-sent" role="status">
          {feedback}
        </Text>
      ) : null}
    </Stack>
  );
}

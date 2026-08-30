import type {
  HelpArticleSummary,
  SupportFeatureData,
} from '@medmate/support-contract';
import { articleIdOf } from '@medmate/support-contract';
import { Button, Spinner, Stack } from '@medmate/ui';
import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { HELP_COPY, dash, errorText, listOf } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

function raiseTicketPath(authenticated: boolean | undefined): string {
  return authenticated ? '/support/new' : '/login?return=/support/new';
}

export function HelpScreen({
  feature,
  onNavigate,
}: {
  feature: SupportFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [articles, setArticles] = useState<HelpArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'help',
      action: 'load',
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load help.'));
      setArticles([]);
      return;
    }
    setArticles(listOf(result.articles));
  }, [feature]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="help-error" />
      <Button
        type="button"
        className="min-h-10 px-3 text-sm"
        data-testid="help-raise-ticket"
        onClick={() => onNavigate?.(raiseTicketPath(feature.authenticated))}
      >
        {HELP_COPY.raise}
      </Button>
      {loading ? (
        <Spinner
          size="sm"
          data-testid="help-loading"
          label={HELP_COPY.loading}
        />
      ) : articles.length === 0 ? (
        <EmptyState icon={BookOpen} testId="help-empty">
          {HELP_COPY.empty}
        </EmptyState>
      ) : (
        <SectionBlock id="section-help" title={HELP_COPY.open} icon={BookOpen}>
          <ul data-testid="help-catalogue" className="space-y-2">
            {articles.map((article, index) => {
              const id = articleIdOf(article);
              const title = dash(article.title);
              return (
                <li key={id || String(index)}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-10 w-full justify-start px-2 text-sm"
                    data-testid={`help-article-${id || index}`}
                    disabled={!id}
                    onClick={() => onNavigate?.(`/help/articles/${id}`)}
                  >
                    {title}
                  </Button>
                </li>
              );
            })}
          </ul>
        </SectionBlock>
      )}
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-3 text-sm"
          onClick={() => {
            void load();
          }}
        >
          {HELP_COPY.retry}
        </Button>
      ) : null}
    </Stack>
  );
}

import type {
  FinanceFeatureData,
  SettlementDetail,
} from '@medmate/finance-contract';
import { isSettlementNotFound } from '@medmate/finance-contract';
import { Button, Spinner, Stack, Text } from '@medmate/ui';
import { Landmark } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DETAIL_COPY, errorText } from '../../lib/copy';
import { presentFields } from '../../lib/fields';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

const compactBtn = 'min-h-10 px-2 text-sm';

export function SettlementDetailScreen({
  feature,
  onNavigate,
}: {
  feature: FinanceFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const settlementId = feature.settlementId ?? '';
  const [settlement, setSettlement] = useState<SettlementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    if (!settlementId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const result = await feature.onSubmit({
      screen: 'settlement-detail',
      action: 'load',
      values: { settlementId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isSettlementNotFound(result.code)) {
        setNotFound(true);
        setSettlement(null);
        return;
      }
      setError(errorText(result, 'Unable to load settlement.'));
      return;
    }
    setSettlement(result.settlement ?? null);
  }, [feature, settlementId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Spinner
        size="sm"
        data-testid="settlement-detail-loading"
        label="Loading settlement"
      />
    );
  }
  if (notFound) {
    return (
      <Text data-testid="settlement-not-found" role="status">
        {DETAIL_COPY.notFound}
      </Text>
    );
  }

  const fields = presentFields(settlement);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="settlement-detail-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {DETAIL_COPY.retry}
        </Button>
      ) : null}
      <SectionBlock
        id="section-settlement-fields"
        title={DETAIL_COPY.fields}
        icon={Landmark}
      >
        <dl
          data-testid="settlement-fields"
          className="grid gap-3 sm:grid-cols-2"
        >
          {fields.map((field) => (
            <div key={field.key} data-testid={`settlement-field-${field.key}`}>
              <dt className="text-sm text-mm-muted">{field.label}</dt>
              <dd className="font-medium tabular-nums">{field.value}</dd>
            </div>
          ))}
        </dl>
      </SectionBlock>
      <Button
        type="button"
        className={compactBtn}
        data-testid="settlement-support"
        onClick={() => onNavigate?.('/support/new')}
      >
        {DETAIL_COPY.support}
      </Button>
    </Stack>
  );
}

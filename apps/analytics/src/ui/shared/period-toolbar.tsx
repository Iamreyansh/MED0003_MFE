import {
  ANALYTICS_PERIODS,
  type AnalyticsPeriod,
} from '@medmate/analytics-contract';
import { Button } from '@medmate/ui';
import { SHARED_COPY } from '../../lib/copy';
import { FilterField, FilterToolbar } from './filter-toolbar';
import { SelectField } from './select-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function PeriodToolbar({
  period,
  dateFrom,
  dateTo,
  onPeriod,
  onDateFrom,
  onDateTo,
  onApplyCustom,
}: {
  period: AnalyticsPeriod;
  dateFrom: string;
  dateTo: string;
  onPeriod: (period: AnalyticsPeriod) => void;
  onDateFrom: (value: string) => void;
  onDateTo: (value: string) => void;
  onApplyCustom: () => void;
}) {
  return (
    <FilterToolbar
      actions={
        period === 'CUSTOM' ? (
          <Button
            type="button"
            variant="ghost"
            className={compactBtn}
            onClick={onApplyCustom}
          >
            {SHARED_COPY.apply}
          </Button>
        ) : undefined
      }
    >
      <FilterField>
        <SelectField
          label={SHARED_COPY.period}
          name="period"
          value={period}
          onChange={(event) => onPeriod(event.target.value as AnalyticsPeriod)}
        >
          {ANALYTICS_PERIODS.map((value) => (
            <option key={value} value={value}>
              {value === 'FY' ? 'FY (Apr–Mar)' : value}
            </option>
          ))}
        </SelectField>
      </FilterField>
      {period === 'CUSTOM' ? (
        <>
          <FilterField>
            <label className="flex flex-col gap-2 font-mm text-mm-text">
              <span className="text-sm">{SHARED_COPY.dateFrom}</span>
              <input
                type="date"
                name="date_from"
                value={dateFrom}
                onChange={(event) => onDateFrom(event.target.value)}
                className="min-h-11 rounded-lg border border-mm-border bg-mm-surface px-3 py-2"
              />
            </label>
          </FilterField>
          <FilterField>
            <label className="flex flex-col gap-2 font-mm text-mm-text">
              <span className="text-sm">{SHARED_COPY.dateTo}</span>
              <input
                type="date"
                name="date_to"
                value={dateTo}
                onChange={(event) => onDateTo(event.target.value)}
                className="min-h-11 rounded-lg border border-mm-border bg-mm-surface px-3 py-2"
              />
            </label>
          </FilterField>
        </>
      ) : null}
    </FilterToolbar>
  );
}

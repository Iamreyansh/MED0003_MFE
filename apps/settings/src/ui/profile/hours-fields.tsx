import type { OperatingHour } from '@medmate/settings-contract';
import { Box, Button, Flex, Input, Text, cn } from '@medmate/ui';
import { Copy } from 'lucide-react';
import { DAY_NAMES } from '../../lib/copy';

export type HoursValue = {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function emptyHours(): HoursValue[] {
  return DAY_NAMES.map((_, index) => ({
    day_of_week: index,
    open_time: '09:00',
    close_time: '21:00',
    is_closed: true,
  }));
}

export function hoursFromPayload(
  rows: OperatingHour[] | null | undefined,
): HoursValue[] {
  const base = emptyHours();
  if (!rows) {
    return base;
  }
  for (const row of rows) {
    const day = row.day_of_week;
    if (day < 0 || day > 6) {
      continue;
    }
    base[day] = {
      day_of_week: day,
      open_time: row.open_time ?? '09:00',
      close_time: row.close_time ?? '21:00',
      is_closed: Boolean(row.is_closed),
    };
  }
  return base;
}

export function copyMondayToWeekdays(values: HoursValue[]): HoursValue[] {
  const monday = values.find((row) => row.day_of_week === 0);
  if (!monday) {
    return values;
  }
  return values.map((row) => {
    if (row.day_of_week >= 1 && row.day_of_week <= 4) {
      return {
        ...row,
        open_time: monday.open_time,
        close_time: monday.close_time,
        is_closed: monday.is_closed,
      };
    }
    return row;
  });
}

function dayShort(index: number): string {
  return DAY_SHORT[index] ?? `Day ${index}`;
}

function sameSchedule(left: HoursValue, right: HoursValue): boolean {
  if (left.is_closed && right.is_closed) {
    return true;
  }
  return (
    left.is_closed === right.is_closed &&
    left.open_time === right.open_time &&
    left.close_time === right.close_time
  );
}

export function hoursSummary(values: HoursValue[]): string {
  if (values.length === 0) {
    return 'No hours set';
  }
  const sorted = [...values].sort((a, b) => a.day_of_week - b.day_of_week);
  const spans: Array<{ start: number; end: number; row: HoursValue }> = [];
  for (const row of sorted) {
    const last = spans[spans.length - 1];
    if (
      last &&
      last.end === row.day_of_week - 1 &&
      sameSchedule(last.row, row)
    ) {
      last.end = row.day_of_week;
    } else {
      spans.push({ start: row.day_of_week, end: row.day_of_week, row });
    }
  }
  return spans
    .map((span) => {
      const range =
        span.start === span.end
          ? dayShort(span.start)
          : `${dayShort(span.start)}–${dayShort(span.end)}`;
      if (span.row.is_closed) {
        return `${range} closed`;
      }
      return `${range} ${span.row.open_time}–${span.row.close_time}`;
    })
    .join(' · ');
}

function TimeSlot({
  label,
  name,
  value,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const inputId = name.replace(/\./g, '-');
  return (
    <Box className="min-w-0 flex-1">
      <Input
        id={inputId}
        name={name}
        type="time"
        aria-label={label}
        value={value}
        disabled={disabled}
        className="min-h-11 rounded-none border-0 bg-transparent px-2 tabular-nums"
        onChange={(event) => onChange(event.target.value)}
      />
    </Box>
  );
}

function ClosedSwitch({
  id,
  name,
  day,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  name: string;
  day: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Flex align="center" gap="2" className="min-h-11 shrink-0">
      <Text
        as="span"
        size="sm"
        className={cn(
          'min-w-12 text-right font-medium',
          checked ? 'text-mm-muted' : 'text-mm-primary',
        )}
        aria-hidden
      >
        {checked ? 'Closed' : 'Open'}
      </Text>
      <Box className="relative h-7 w-12 shrink-0">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={`${day} closed`}
          className={cn(
            'h-7 w-12 cursor-pointer appearance-none rounded-full transition-colors duration-mm',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus',
            'disabled:cursor-not-allowed',
            checked ? 'bg-mm-border' : 'bg-mm-primary',
            disabled ? 'opacity-55' : undefined,
          )}
          onChange={(event) => onChange(event.target.checked)}
        />
        <Box
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 size-6 rounded-full bg-mm-surface shadow-sm transition-transform duration-mm',
            checked ? 'translate-x-0' : 'translate-x-5',
          )}
        />
      </Box>
    </Flex>
  );
}

function patchDay(
  values: HoursValue[],
  dayOfWeek: number,
  patch: Partial<HoursValue>,
): HoursValue[] {
  return values.map((item) =>
    item.day_of_week === dayOfWeek ? { ...item, ...patch } : item,
  );
}

export function HoursFields({
  values,
  disabled,
  onChange,
}: {
  values: HoursValue[];
  disabled?: boolean;
  onChange: (next: HoursValue[]) => void;
}) {
  return (
    <Flex direction="column" gap="3">
      <Flex align="center" justify="between" gap="3" wrap>
        <Text size="sm" tone="muted">
          {hoursSummary(values)}
        </Text>
        {disabled ? null : (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 shrink-0 gap-2 px-3 py-1 text-sm"
            onClick={() => onChange(copyMondayToWeekdays(values))}
          >
            <Copy className="size-4" aria-hidden />
            Copy Monday to weekdays
          </Button>
        )}
      </Flex>
      <Box className="overflow-hidden rounded-mm border border-mm-border">
        {values.map((row) => {
          const day = DAY_NAMES[row.day_of_week] ?? `Day ${row.day_of_week}`;
          return (
            <Box
              key={row.day_of_week}
              className="border-b border-mm-border last:border-b-0"
            >
              {row.day_of_week === 5 ? (
                <Text
                  size="sm"
                  tone="muted"
                  className="bg-mm-bg px-3 py-2 font-medium tracking-wide"
                >
                  Weekend
                </Text>
              ) : null}
              <Box
                className={cn(
                  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-3 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto]',
                  row.is_closed ? 'bg-mm-bg' : 'bg-mm-surface',
                )}
              >
                <Text
                  className={cn(
                    'font-semibold',
                    row.is_closed ? 'text-mm-muted' : undefined,
                  )}
                >
                  {day}
                </Text>
                <Box className="col-start-2 row-start-1 sm:col-start-3">
                  <ClosedSwitch
                    id={`hours-${row.day_of_week}-closed`}
                    name={`hours.${row.day_of_week}.is_closed`}
                    day={day}
                    checked={row.is_closed}
                    disabled={disabled}
                    onChange={(checked) =>
                      onChange(
                        patchDay(values, row.day_of_week, {
                          is_closed: checked,
                        }),
                      )
                    }
                  />
                </Box>
                <Flex
                  align="center"
                  gap="0"
                  className={cn(
                    'col-span-2 min-w-0 overflow-hidden rounded-mm border border-mm-border bg-mm-bg sm:col-span-1 sm:col-start-2',
                    row.is_closed ? 'text-mm-muted' : undefined,
                  )}
                >
                  <TimeSlot
                    label={`${day} open`}
                    name={`hours.${row.day_of_week}.open_time`}
                    value={row.open_time}
                    disabled={disabled || row.is_closed}
                    onChange={(open_time) =>
                      onChange(patchDay(values, row.day_of_week, { open_time }))
                    }
                  />
                  <Text
                    size="sm"
                    tone="muted"
                    className="shrink-0 px-1"
                    aria-hidden
                  >
                    to
                  </Text>
                  <TimeSlot
                    label={`${day} close`}
                    name={`hours.${row.day_of_week}.close_time`}
                    value={row.close_time}
                    disabled={disabled || row.is_closed}
                    onChange={(close_time) =>
                      onChange(
                        patchDay(values, row.day_of_week, { close_time }),
                      )
                    }
                  />
                </Flex>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Flex>
  );
}

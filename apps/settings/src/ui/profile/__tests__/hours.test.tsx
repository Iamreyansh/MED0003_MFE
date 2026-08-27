import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  copyMondayToWeekdays,
  emptyHours,
  HoursFields,
  hoursFromPayload,
  hoursSummary,
} from '../hours-fields';

afterEach(() => {
  cleanup();
});

describe('hoursFromPayload', () => {
  it('fills seven days and skips invalid indexes', () => {
    const hours = hoursFromPayload([
      {
        day_of_week: 1,
        open_time: '10:00',
        close_time: '18:00',
        is_closed: false,
      },
      { day_of_week: -1, is_closed: true },
      { day_of_week: 8, is_closed: true },
    ]);
    expect(hours).toHaveLength(7);
    expect(hours[1]).toMatchObject({
      open_time: '10:00',
      close_time: '18:00',
      is_closed: false,
    });
    expect(hours[0]?.is_closed).toBe(true);
    expect(hoursFromPayload(undefined)[0]?.is_closed).toBe(true);
    expect(
      hoursFromPayload([{ day_of_week: 2, is_closed: true }])[2],
    ).toMatchObject({
      open_time: '09:00',
      close_time: '21:00',
      is_closed: true,
    });
  });
});

describe('hoursSummary', () => {
  it('groups consecutive matching days', () => {
    expect(hoursSummary([])).toBe('No hours set');
    const week = emptyHours().map((row) =>
      row.day_of_week <= 4
        ? { ...row, is_closed: false, open_time: '09:00', close_time: '21:00' }
        : row,
    );
    expect(hoursSummary(week)).toBe('Mon–Fri 09:00–21:00 · Sat–Sun closed');
    expect(
      hoursSummary([
        {
          day_of_week: 9,
          open_time: '08:00',
          close_time: '12:00',
          is_closed: false,
        },
      ]),
    ).toBe('Day 9 08:00–12:00');
    const split = emptyHours().map((row) =>
      row.day_of_week === 0
        ? { ...row, is_closed: false, open_time: '08:00', close_time: '18:00' }
        : row.day_of_week === 1
          ? {
              ...row,
              is_closed: false,
              open_time: '10:00',
              close_time: '18:00',
            }
          : row,
    );
    expect(hoursSummary(split)).toContain('Mon 08:00–18:00');
    expect(hoursSummary(split)).toContain('Tue 10:00–18:00');
  });
});

describe('HoursFields', () => {
  it('labels unknown weekdays', () => {
    render(
      <HoursFields
        values={[
          {
            day_of_week: 9,
            open_time: '09:00',
            close_time: '21:00',
            is_closed: false,
          },
        ]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Day 9 open')).toBeTruthy();
    expect(screen.queryByText('Weekend')).toBeNull();
  });

  it('copies Monday onto weekdays', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const values = emptyHours().map((row) =>
      row.day_of_week === 0
        ? { ...row, open_time: '08:00', close_time: '18:00', is_closed: false }
        : row,
    );
    render(<HoursFields values={values} onChange={onChange} />);
    expect(screen.getByText('Weekend')).toBeTruthy();
    expect(screen.getByText(/Mon 08:00–18:00/)).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Copy Monday to weekdays' }),
    );
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0]?.[0] as typeof values;
    expect(next[1]).toMatchObject({
      open_time: '08:00',
      close_time: '18:00',
      is_closed: false,
    });
    expect(next[5]?.is_closed).toBe(true);
    expect(copyMondayToWeekdays([{ ...values[1]! }])).toEqual([
      { ...values[1]! },
    ]);
  });

  it('patches open, close, and closed from the schedule row', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const values = emptyHours().map((row) =>
      row.day_of_week === 0 ? { ...row, is_closed: false } : row,
    );
    render(<HoursFields values={values} onChange={onChange} />);
    await user.click(screen.getByLabelText('Monday closed'));
    expect(onChange.mock.calls[0]?.[0][0]).toMatchObject({ is_closed: true });
    fireEvent.change(screen.getByLabelText('Monday open'), {
      target: { value: '10:00' },
    });
    expect(onChange.mock.calls.at(-1)?.[0][0]).toMatchObject({
      open_time: '10:00',
    });
    fireEvent.change(screen.getByLabelText('Monday close'), {
      target: { value: '20:00' },
    });
    expect(onChange.mock.calls.at(-1)?.[0][0]).toMatchObject({
      close_time: '20:00',
    });
  });

  it('hides copy when hours are read-only', () => {
    render(<HoursFields values={emptyHours()} disabled onChange={vi.fn()} />);
    expect(
      screen.queryByRole('button', { name: 'Copy Monday to weekdays' }),
    ).toBeNull();
  });
});

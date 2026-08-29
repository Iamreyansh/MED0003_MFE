import type {
  CatalogueCommand,
  CatalogueSubmitResult,
} from '@medmate/catalogue-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature, SEARCH_HIT } from '../../../app/__tests__/helpers';
import CatalogueMfe from '../../../app/CatalogueMfe';

afterEach(() => {
  cleanup();
});

function searchSubmit(
  overrides: Partial<
    Record<CatalogueCommand['action'], () => Promise<CatalogueSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: CatalogueCommand): Promise<CatalogueSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'loadScheduleRules') {
        return {
          ok: true,
          scheduleRules: [{ schedule: 'H', full_name: 'Schedule H' }],
        };
      }
      if (command.action === 'search') {
        return SEARCH_HIT;
      }
      return { ok: true };
    },
  );
}

describe('SearchScreen', () => {
  it('keeps an empty query as a hint and does not search one character', async () => {
    const user = userEvent.setup();
    const onSubmit = searchSubmit();
    render(<CatalogueMfe data={data(feature('search', onSubmit))} />);
    expect(await screen.findByTestId('search-hint')).toBeTruthy();
    await user.type(screen.getByLabelText('Search medicines'), 'p');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 350);
    });
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'search'),
    ).toBe(false);
  });

  it('renders listbox results, schedule text, mapped flags, and navigation', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = searchSubmit();
    render(
      <CatalogueMfe
        data={data(feature('search', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await user.type(screen.getByLabelText('Search medicines'), 'paracetamol');
    expect(await screen.findByRole('listbox')).toBeTruthy();
    expect(screen.getByTestId('schedule-med-1')).toHaveTextContent(
      'Schedule H',
    );
    expect(screen.getByTestId('mapped-med-1')).toHaveTextContent('Unmapped');
    expect(screen.getByTestId('mapped-med-2')).toHaveTextContent('Mapped');
    await user.click(screen.getByRole('button', { name: 'Map' }));
    expect(onNavigate).toHaveBeenCalledWith(
      '/catalogue/mapping?master_medicine_id=med-1',
    );
    await user.click(screen.getByRole('button', { name: 'View mappings' }));
    expect(onNavigate).toHaveBeenCalledWith('/catalogue/mapping');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].action === 'search' &&
            'values' in call[0] &&
            call[0].values.page === 2,
        ),
      ).toBe(true);
    });
  });

  it('shows empty, validation, retry, and staff without Map', async () => {
    const user = userEvent.setup();
    const failing = searchSubmit({
      search: async () => ({
        ok: false,
        code: 'QUERY_TOO_SHORT',
        formError: 'q must be at least 2 characters',
      }),
    });
    render(<CatalogueMfe data={data(feature('search', failing))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'para');
    expect(
      await screen.findByText('q must be at least 2 characters'),
    ).toBeTruthy();

    cleanup();
    const empty = searchSubmit({
      search: async () => ({
        ok: true,
        results: [],
        meta: { has_next: false },
      }),
    });
    render(<CatalogueMfe data={data(feature('search', empty))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'zzzz');
    expect(await screen.findByTestId('search-empty')).toBeTruthy();

    cleanup();
    const boom = searchSubmit({
      search: async () => ({
        ok: false,
        code: 'INTERNAL_ERROR',
        formError: 'Search failed',
      }),
    });
    render(<CatalogueMfe data={data(feature('search', boom))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'crocin');
    expect(await screen.findByTestId('search-error')).toHaveTextContent(
      'Search failed',
    );
    await user.click(screen.getByRole('button', { name: 'Retry search' }));
    expect(
      boom.mock.calls.filter((call) => call[0].action === 'search').length,
    ).toBeGreaterThan(1);

    cleanup();
    const staff = searchSubmit();
    render(
      <CatalogueMfe
        data={data(
          feature('search', staff, {
            canCreate: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    await user.type(screen.getByLabelText('Search medicines'), 'crocin');
    expect(await screen.findByTestId('search-results')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Map' })).toBeNull();
  });

  it('uses fallbacks when search returns no payload or code-only errors', async () => {
    const user = userEvent.setup();
    const bare = searchSubmit({
      search: async () => ({ ok: true }),
    });
    render(<CatalogueMfe data={data(feature('search', bare))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'crocin');
    expect(await screen.findByTestId('search-empty')).toBeTruthy();

    cleanup();
    const short = searchSubmit({
      search: async () => ({ ok: false, code: 'QUERY_TOO_SHORT' }),
    });
    render(<CatalogueMfe data={data(feature('search', short))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'para');
    expect(await screen.findByText('QUERY_TOO_SHORT')).toBeTruthy();

    cleanup();
    const boom = searchSubmit({
      search: async () => ({ ok: false }),
    });
    render(<CatalogueMfe data={data(feature('search', boom))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'crocin');
    expect(await screen.findByTestId('search-error')).toHaveTextContent(
      'Unable to search.',
    );
  });

  it('falls back when schedule rules fail to load', async () => {
    const user = userEvent.setup();
    const onSubmit = searchSubmit({
      loadScheduleRules: async () => ({
        ok: false,
        code: 'FORBIDDEN',
        formError: 'no',
      }),
    });
    render(<CatalogueMfe data={data(feature('search', onSubmit))} />);
    await user.type(screen.getByLabelText('Search medicines'), 'crocin');
    expect(await screen.findByTestId('schedule-med-1')).toHaveTextContent(
      'Schedule H',
    );
  });
});

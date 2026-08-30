import type { PosCommand, PosSubmitResult } from '@medmate/pos-contract';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CART_RESULT,
  EMPTY_CART,
  LINED_RESULT,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import PosMfe from '../../../app/PosMfe';

afterEach(() => {
  cleanup();
});

function submit(
  overrides: Partial<
    Record<PosCommand['action'], () => Promise<PosSubmitResult>>
  > = {},
) {
  return vi.fn(async (command: PosCommand): Promise<PosSubmitResult> => {
    const override = overrides[command.action];
    if (override) {
      return override();
    }
    if (command.action === 'createCart' || command.action === 'loadCart') {
      return CART_RESULT;
    }
    if (command.action === 'search') {
      return {
        ok: true,
        search: {
          results: [
            {
              product_id: 'prod-1',
              name: 'Crocin 500mg Tablet',
              mrp: 24,
              total_stock_units: 12,
            },
          ],
        },
      };
    }
    return { ok: true };
  });
}

describe('CounterScreen', () => {
  it('autofocuses search on mount', async () => {
    render(<PosMfe data={data(feature(async () => ({ ok: true })))} />);
    expect(await screen.findByTestId('pos-counter-page')).toBeTruthy();
    expect(document.getElementById('pos-search-input')).toBe(
      document.activeElement,
    );
  });

  it('rejects add when stock is insufficient', async () => {
    const user = userEvent.setup();
    const onSubmit = submit({
      addItem: async () => ({
        ok: false,
        code: 'INSUFFICIENT_STOCK',
        formError: 'Requested quantity exceeds batch stock',
      }),
    });
    render(<PosMfe data={data(feature(onSubmit))} />);
    await screen.findByTestId('pos-cart-empty');
    await user.type(
      screen.getByRole('combobox', { name: 'Search products' }),
      'crocin',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByTestId('pos-search-results')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'exceeds batch stock',
    );
    expect(screen.queryByTestId('pos-receipt')).toBeNull();
  });

  it('shows empty search and attaches a customer', async () => {
    const user = userEvent.setup();
    const onSubmit = submit({
      search: async () => ({ ok: true, search: { results: [] } }),
      attachCustomer: async () => ({
        ok: true,
        customer: { customer_id: 'c1', name: 'Anita', phone: '9999999999' },
      }),
      loadCart: async () => ({
        ok: true,
        cart: {
          cart_id: 'cart-1',
          customer: { customer_id: 'c1', name: 'Anita', phone: '9999999999' },
          items: [],
        },
      }),
    });
    render(<PosMfe data={data(feature(onSubmit))} />);
    await screen.findByTestId('pos-cart-empty');
    await user.type(
      screen.getByRole('combobox', { name: 'Search products' }),
      'none',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByTestId('pos-search-empty')).toBeTruthy();
    await user.type(screen.getByLabelText('Customer phone'), '9999999999');
    await user.type(screen.getByLabelText('Customer name'), 'Anita');
    await user.click(screen.getByRole('button', { name: 'Attach customer' }));
    expect(await screen.findByTestId('pos-customer')).toHaveTextContent(
      'Anita',
    );
  });

  it('confirms clear and keeps checkout disabled while paying', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    let finish: ((value: PosSubmitResult) => void) | undefined;
    const onSubmit = submit({
      loadCart: async () => LINED_RESULT,
      createCart: async () => LINED_RESULT,
      checkout: async () =>
        new Promise<PosSubmitResult>((resolve) => {
          finish = resolve;
        }),
      clearCart: async () => ({ ok: true, cleared: true, cart: EMPTY_CART }),
    });
    render(
      <PosMfe
        data={data(feature(onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('pos-cart-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    expect(screen.getByTestId('pos-clear-dialog')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Keep cart' }));
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
    finish?.({
      ok: true,
      receipt: {
        invoice_id: 'inv-1',
        invoice_number: 'INV-1',
        grand_total: 48,
      },
    });
    expect(await screen.findByTestId('pos-receipt')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open invoice' }));
    expect(onNavigate).toHaveBeenCalledWith('/invoices/inv-1');
  });

  it('does not fetch a PDF under a POS token', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = submit({
      loadCart: async () => LINED_RESULT,
      checkout: async () => ({
        ok: true,
        receipt: {
          invoice_id: 'inv-1',
          invoice_number: 'INV-1',
          invoice_pdf_url: 'https://cdn.medmate.in/x.pdf',
          grand_total: 48,
        },
      }),
    });
    render(
      <PosMfe
        data={data(feature(onSubmit, { tokenScope: 'pos' }), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await screen.findByTestId('pos-cart-table');
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(await screen.findByTestId('pos-pdf-deferred')).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Open invoice' })).toBeNull();
  });

  it('reuses a single checkout while the first is in flight', async () => {
    const user = userEvent.setup();
    let calls = 0;
    const onSubmit = submit({
      loadCart: async () => LINED_RESULT,
      checkout: async () => {
        calls += 1;
        await new Promise((resolve) => {
          window.setTimeout(resolve, 20);
        });
        return {
          ok: true,
          receipt: { invoice_id: 'inv-1', grand_total: 48 },
        };
      },
    });
    render(<PosMfe data={data(feature(onSubmit))} />);
    await screen.findByTestId('pos-checkout');
    const pay = screen.getByRole('button', { name: 'Checkout' });
    await user.click(pay);
    fireEvent.click(pay);
    await screen.findByTestId('pos-receipt');
    expect(calls).toBe(1);
  });

  it('renders optional receipt and quantity fallbacks', async () => {
    const user = userEvent.setup();
    const onSubmit = submit({
      search: async () => ({ ok: true }),
      loadCart: async () => ({
        ok: true,
        cart: {
          cart_id: 'cart-1',
          items: [{ item_id: 'item-1', product_id: 'prod-1' }],
          grand_total: 0,
        },
      }),
      patchItem: async () => ({ ok: true, item: { item_id: 'item-1' } }),
      checkout: async () => ({
        ok: true,
        receipt: { invoice_id: 'inv-9', grand_total: 1 },
      }),
    });
    render(<PosMfe data={data(feature(onSubmit), { capabilities: {} })} />);
    await screen.findByTestId('pos-cart-table');
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: 'x' },
    });
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search products' }),
      'x',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByTestId('pos-search-empty')).toBeTruthy();
    await user.click(screen.getByLabelText('UPI'));
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(await screen.findByTestId('pos-receipt')).toHaveTextContent('inv-9');
    await user.click(screen.getByRole('button', { name: 'Open invoice' }));
  });

  it('updates quantity and removes a line', async () => {
    const user = userEvent.setup();
    const onSubmit = submit({
      loadCart: async () => LINED_RESULT,
      patchItem: async () => ({ ok: true, item: { item_id: 'item-1' } }),
      deleteItem: async () => ({ ok: true, deleted: true }),
    });
    render(<PosMfe data={data(feature(onSubmit))} />);
    await screen.findByTestId('pos-cart-table');
    expect(screen.getByText(/B1/)).toBeTruthy();
    const qty = screen.getByLabelText('Quantity');
    fireEvent.blur(qty);
    await user.clear(qty);
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('pos-error')).toHaveTextContent(
      'greater than zero',
    );
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '2');
    await user.keyboard('{Enter}');
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '4');
    await user.click(screen.getByRole('combobox', { name: 'Search products' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'patchItem' }),
      );
    });
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '1' },
    });
    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(screen.getByTestId('pos-error')).toHaveTextContent(
      'greater than zero',
    );
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: 'x' },
    });
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'patchItem' }),
    );
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'deleteItem' }),
    );
  });

  it('covers search, qty, discount, pay, and error branches', async () => {
    const user = userEvent.setup();
    const onSubmit = submit({
      createCart: async () => ({ ok: false, formError: 'Cannot open cart' }),
      search: async () => ({ ok: false, formError: 'Search failed' }),
      addItem: async () => ({ ok: false, formError: 'Cannot add' }),
      patchItem: async () => ({ ok: false, formError: 'Cannot patch' }),
      deleteItem: async () => ({ ok: false, formError: 'Cannot remove' }),
      clearCart: async () => ({ ok: false, formError: 'Cannot clear' }),
      attachCustomer: async () => ({ ok: false, formError: 'Cannot attach' }),
      applyDiscount: async () => ({ ok: false, formError: 'Cannot discount' }),
      checkout: async () => ({
        ok: false,
        code: 'INSUFFICIENT_STOCK',
        formError: 'Requested quantity exceeds batch stock',
      }),
      loadCart: async () => ({
        ok: true,
        cart: {
          cart_id: 'cart-1',
          customer: { customer_id: 'c1', phone: '9999999999' },
          items: [
            {
              item_id: 'item-1',
              product_id: 'prod-1',
              quantity: 2,
              line_total: 48,
            },
          ],
          rx_items_present: true,
          grand_total: 48,
        },
      }),
    });
    render(
      <PosMfe data={data(feature(onSubmit, { formError: 'Start failed' }))} />,
    );
    expect(await screen.findByTestId('pos-cart-table')).toBeTruthy();
    expect(screen.getByTestId('pos-customer')).toHaveTextContent('9999999999');
    expect(screen.getAllByText('Item').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByTestId('pos-search-empty')).toBeTruthy();
    await user.type(
      screen.getByRole('combobox', { name: 'Search products' }),
      'crocin',
    );
    fireEvent.keyDown(
      screen.getByRole('combobox', { name: 'Search products' }),
      {
        key: 'Tab',
      },
    );
    await user.keyboard('{Enter}');
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Search failed',
    );
    await user.click(screen.getByLabelText('Barcode'));
    await user.click(screen.getByLabelText('Text'));
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '0');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('pos-error')).toHaveTextContent(
      'greater than zero',
    );
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '3');
    await user.keyboard('{Enter}');
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Cannot patch',
    );
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Cannot remove',
    );
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    fireEvent.keyDown(screen.getByTestId('pos-clear-dialog'), {
      key: 'Escape',
    });
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    await user.click(
      within(screen.getByTestId('pos-clear-dialog')).getByRole('button', {
        name: 'Clear cart',
      }),
    );
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Cannot clear',
    );
    await user.click(screen.getByRole('button', { name: 'Attach customer' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Cannot attach',
    );
    await user.click(screen.getByRole('button', { name: 'Apply discount' }));
    expect(screen.getByTestId('pos-error')).toHaveTextContent(
      'greater than zero',
    );
    await user.type(screen.getByLabelText('Discount value'), '5');
    await user.click(screen.getByLabelText('Percentage'));
    await user.click(screen.getByLabelText('Flat rupees'));
    await user.click(screen.getByLabelText('Percentage'));
    await user.click(screen.getByRole('button', { name: 'Apply discount' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Cannot discount',
    );
    await user.click(screen.getByLabelText('UPI'));
    expect(screen.getByLabelText('UPI reference')).toBeTruthy();
    expect(screen.getByLabelText('Prescribing doctor')).toBeTruthy();
    await user.type(screen.getByLabelText('Amount paid'), 'abc');
    await user.clear(screen.getByLabelText('Amount paid'));
    await user.type(screen.getByLabelText('Amount paid'), '50');
    await user.type(screen.getByLabelText('UPI reference'), 'upi-1');
    await user.type(screen.getByLabelText('Prescribing doctor'), 'Dr Rao');
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'exceeds batch',
    );
    expect(screen.queryByTestId('pos-receipt')).toBeNull();
  });

  it('adds unnamed hits and confirms a successful clear', async () => {
    const user = userEvent.setup();
    const onSubmit = submit({
      search: async () => ({
        ok: true,
        search: { results: [{ product_id: 'prod-9' }] },
      }),
      checkout: async () => ({ ok: true }),
      addItem: async () => ({ ok: true, item: { item_id: 'item-9' } }),
      applyDiscount: async () => ({
        ok: true,
        discount: { discount_type: 'FLAT_RS', grand_total: 20 },
      }),
      clearCart: async () => ({
        ok: true,
        cleared: true,
        cart: EMPTY_CART,
      }),
      loadCart: async () => LINED_RESULT,
    });
    render(<PosMfe data={data(feature(onSubmit))} />);
    await screen.findByTestId('pos-cart-table');
    await user.type(
      screen.getByRole('combobox', { name: 'Search products' }),
      'x',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByText(/Product/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await user.type(screen.getByLabelText('Discount value'), '4');
    await user.click(screen.getByRole('button', { name: 'Apply discount' }));
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    await user.click(screen.getByRole('button', { name: 'Keep cart' }));
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    await user.click(
      within(screen.getByTestId('pos-clear-dialog')).getByRole('button', {
        name: 'Clear cart',
      }),
    );
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'clearCart' }),
    );
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(screen.queryByTestId('pos-receipt')).toBeNull();
  });

  it('shows a create-cart failure and a generic add error', async () => {
    const user = userEvent.setup();
    let adds = 0;
    const onSubmit = submit({
      createCart: async () => ({ ok: false, code: 'MODULE_NOT_IN_PLAN' }),
      search: async () => ({
        ok: true,
        search: { results: [{ product_id: 'p1', name: 'Crocin', mrp: 24 }] },
      }),
      addItem: async () => {
        adds += 1;
        if (adds === 1) {
          return { ok: false, code: 'INSUFFICIENT_STOCK' };
        }
        return { ok: false, formError: 'Cannot add' };
      },
    });
    render(<PosMfe data={data(feature(onSubmit, { cartId: undefined }))} />);
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'MODULE_NOT_IN_PLAN',
    );
    await user.type(
      screen.getByRole('combobox', { name: 'Search products' }),
      'crocin',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'exceeds batch stock',
    );
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(await screen.findByTestId('pos-error')).toHaveTextContent(
      'Cannot add',
    );
  });
});

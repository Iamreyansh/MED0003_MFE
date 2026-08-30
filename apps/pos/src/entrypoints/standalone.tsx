/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import type {
  PosCart,
  PosCommand,
  PosFeatureData,
  PosSubmitResult,
  TokenScope,
} from '@medmate/pos-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useRef, useState } from 'react';
import PosMfe from '../app/PosMfe';
import type { PosMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const EMPTY_CART: PosCart = {
  cart_id: 'cart-1',
  status: 'ACTIVE',
  items: [],
  grand_total: 0,
};

function mockSubmit(command: PosCommand, cart: PosCart): PosSubmitResult {
  if (command.action === 'createCart' || command.action === 'loadCart') {
    return { ok: true, cart };
  }
  if (command.action === 'search') {
    if (command.values.query === 'none') {
      return { ok: true, search: { results: [], query: command.values.query } };
    }
    return {
      ok: true,
      search: {
        results: [
          {
            product_id: 'prod-1',
            name: 'Crocin 500mg Tablet',
            mrp: 24,
            auto_add: command.values.mode === 'BARCODE',
          },
        ],
        query: command.values.query,
        mode: command.values.mode,
      },
    };
  }
  if (command.action === 'addItem') {
    if (command.values.product_id === 'prod-stock') {
      return {
        ok: false,
        code: 'INSUFFICIENT_STOCK',
        formError: 'Out of stock',
      };
    }
    return {
      ok: true,
      item: {
        item_id: 'item-1',
        product_name: 'Crocin 500mg Tablet',
        quantity: command.values.quantity,
        line_total: 24 * command.values.quantity,
        cart_grand_total: 24 * command.values.quantity,
      },
      cart: {
        ...cart,
        items: [
          {
            item_id: 'item-1',
            product_id: 'prod-1',
            product_name: 'Crocin 500mg Tablet',
            quantity: command.values.quantity,
            line_total: 24 * command.values.quantity,
          },
        ],
        grand_total: 24 * command.values.quantity,
      },
    };
  }
  if (command.action === 'patchItem') {
    const qty = command.values.quantity ?? 1;
    return {
      ok: true,
      item: {
        item_id: command.values.item_id,
        quantity: qty,
        line_total: 24 * qty,
        cart_grand_total: 24 * qty,
      },
    };
  }
  if (command.action === 'applyDiscount') {
    const subtotal = cart.grand_total ?? 0;
    const amount =
      command.values.type === 'PERCENTAGE'
        ? (subtotal * command.values.value) / 100
        : command.values.value;
    return {
      ok: true,
      discount: {
        discount_type: command.values.type,
        discount_value: command.values.value,
        discount_amount: amount,
        grand_total: Math.max(0, subtotal - amount),
      },
    };
  }
  if (command.action === 'clearCart') {
    return { ok: true, cleared: true, cart: EMPTY_CART };
  }
  if (command.action === 'attachCustomer') {
    return {
      ok: true,
      customer: {
        customer_id: 'cust-1',
        name: command.values.customer_name ?? 'Walk-in',
        phone: command.values.customer_phone,
      },
    };
  }
  if (command.action === 'checkout') {
    return {
      ok: false,
      code: 'INSUFFICIENT_STOCK',
      formError: 'Requested quantity exceeds batch stock',
    };
  }
  return { ok: true, cart };
}

function StandaloneHarness() {
  const [scope, setScope] = useState<TokenScope>('full');
  const [log, setLog] = useState('Ready');
  const cartRef = useRef<PosCart>(EMPTY_CART);
  const [, setTick] = useState(0);

  const feature = useMemo<PosFeatureData>(
    () => ({
      screen: 'counter',
      role: 'pharmacy_owner',
      plan: 'FREE',
      tokenScope: scope,
      cartId: cartRef.current.cart_id,
      canSell: true,
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.action}`);
        const result = mockSubmit(command, cartRef.current);
        if (result.ok && result.cart) {
          cartRef.current = result.cart;
          setTick((n) => n + 1);
        }
        if (result.ok && result.item && command.action === 'patchItem') {
          const qty = command.values.quantity ?? 1;
          cartRef.current = {
            ...cartRef.current,
            grand_total:
              result.item.cart_grand_total ?? cartRef.current.grand_total,
            items: (cartRef.current.items ?? []).map((line) =>
              line.item_id === result.item?.item_id
                ? {
                    ...line,
                    quantity: qty,
                    line_total: result.item.line_total ?? line.line_total,
                  }
                : line,
            ),
          };
          setTick((n) => n + 1);
        }
        if (result.ok && result.discount) {
          cartRef.current = {
            ...cartRef.current,
            discount_type: result.discount.discount_type,
            discount_value: result.discount.discount_value,
            discount_amount: result.discount.discount_amount,
            grand_total: result.discount.grand_total,
          };
          setTick((n) => n + 1);
        }
        if (result.ok && result.customer) {
          cartRef.current = {
            ...cartRef.current,
            customer: {
              customer_id: result.customer.customer_id,
              name: result.customer.name,
              phone: result.customer.phone,
            },
          };
          setTick((n) => n + 1);
        }
        return result;
      },
    }),
    [scope],
  );

  const data = useMemo<PosMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'pos-standalone',
        locale: 'en-IN',
        permissions: [],
      },
      feature,
      capabilities: {
        navigate: (path) => setLog(`navigate:${path}`),
        api: {
          request: async <T = unknown,>() => ({
            ok: true,
            status: 200,
            data: {} as T,
          }),
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="POS standalone harness"
      description="Counter search, cart, customer, and checkout. Hosts keep cartId in memory."
      className="max-w-7xl"
    >
      <Inline wrap className="mb-4">
        <Button
          type="button"
          variant={scope === 'pos' ? 'primary' : 'ghost'}
          onClick={() => setScope('pos')}
        >
          POS token
        </Button>
        <Button
          type="button"
          variant={scope === 'full' ? 'primary' : 'ghost'}
          onClick={() => setScope('full')}
        >
          Full token
        </Button>
      </Inline>
      <PosMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

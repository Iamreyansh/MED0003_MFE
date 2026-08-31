export const ORDERS_SCREENS = [
  'rx-quotes',
  'orders-home',
  'order-actions',
] as const;

export type OrdersScreen = (typeof ORDERS_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type QuoteStatus =
  'NOTIFIED' | 'REVIEWING' | 'QUOTED' | 'OUT_OF_STOCK' | 'EXPIRED' | string;

export type OrderStatus =
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'PACKING'
  | 'PACKED'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'REJECTED'
  | string;

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export type RxQuoteQuery = {
  page?: number;
  limit?: number;
  status?: string;
};

export type RxQuoteRow = {
  quote_id: string;
  status?: QuoteStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
  rx_id?: string | null;
  patient_name?: string | null;
  quoted_price?: number | null;
  mrp?: number | null;
};

export type QuoteResult = {
  quote_id?: string | null;
  status?: QuoteStatus | null;
  quoted_price?: number | null;
};

export type DeclineResult = {
  quote_id?: string | null;
  status?: QuoteStatus | null;
  reason?: string | null;
};

export type OrderActionResult = {
  order_id?: string | null;
  status?: OrderStatus | null;
  rider_id?: string | null;
  pickup_otp?: string | null;
};

export type RiderDirectoryRow = {
  rider_id: string;
  name?: string | null;
  phone?: string | null;
  vehicle_plate?: string | null;
};

export type OrderHandoff = {
  order_id?: string | null;
  order_number?: string | null;
  status?: OrderStatus | null;
  rider_id?: string | null;
  pickup_otp?: string | null;
};

export type OrderInboxQuery = {
  page?: number;
  limit?: number;
  status?: string;
};

export type OrderInboxRow = {
  order_id: string;
  order_number?: string | null;
  status?: OrderStatus | null;
  items_count?: number | null;
  total?: number | string | null;
  created_at?: string | null;
};

export type OrdersCommand =
  | { screen: 'rx-quotes'; action: 'load'; values?: RxQuoteQuery }
  | {
      screen: 'rx-quotes';
      action: 'quote';
      values: { quoteId: string; price: number; notes?: string };
    }
  | {
      screen: 'rx-quotes';
      action: 'decline';
      values: { quoteId: string; reason?: string };
    }
  | { screen: 'orders-home'; action: 'noop' }
  | { screen: 'orders-home'; action: 'load'; values?: OrderInboxQuery }
  | {
      screen: 'order-actions';
      action: 'accept';
      values: { orderId: string };
    }
  | {
      screen: 'order-actions';
      action: 'reject';
      values: { orderId: string; reason?: string };
    }
  | {
      screen: 'order-actions';
      action: 'advanceStatus';
      values: { orderId: string; status: string };
    }
  | {
      screen: 'order-actions';
      action: 'assignRider';
      values: { orderId: string; rider_id: string };
    }
  | {
      screen: 'order-actions';
      action: 'listRiders';
      values: { orderId: string };
    }
  | {
      screen: 'order-actions';
      action: 'loadHandoff';
      values: { orderId: string };
    };

export type OrdersSubmitSuccess = {
  ok: true;
  quotes?: RxQuoteRow[];
  quote?: QuoteResult | null;
  decline?: DeclineResult | null;
  accept?: OrderActionResult | null;
  reject?: OrderActionResult | null;
  status?: OrderActionResult | null;
  assign?: OrderActionResult | null;
  riders?: RiderDirectoryRow[];
  handoff?: OrderHandoff | null;
  orders?: OrderInboxRow[];
  meta?: PageMeta;
};

export type OrdersSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type OrdersSubmitResult = OrdersSubmitSuccess | OrdersSubmitFailure;

export type OrdersFeatureData = {
  screen: OrdersScreen;
  onSubmit: (command: OrdersCommand) => Promise<OrdersSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canMutateOrders?: boolean;
  orderId?: string | null;
  tokenScope?: 'full' | 'pos' | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isOrdersScreen(value: unknown): value is OrdersScreen {
  return (
    typeof value === 'string' &&
    (ORDERS_SCREENS as readonly string[]).includes(value)
  );
}

export function isOrdersFeatureData(
  value: unknown,
): value is OrdersFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<OrdersFeatureData>;
  return (
    isOrdersScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function isPriceAboveMrp(code: unknown): boolean {
  return code === 'PRICE_ABOVE_MRP';
}

export function isOrderNotFound(code: unknown): boolean {
  return code === 'ORDER_NOT_FOUND';
}

export function isOrderAlreadyActioned(code: unknown): boolean {
  return code === 'ORDER_ALREADY_ACTIONED';
}

export function isInvalidStatusTransition(code: unknown): boolean {
  return code === 'INVALID_STATUS_TRANSITION';
}

export function isPosTokenRestricted(code: unknown): boolean {
  return code === 'POS_TOKEN_RESTRICTED';
}

export function isExpiredQuote(status: unknown): boolean {
  return String(status ?? '').toUpperCase() === 'EXPIRED';
}

export function isOrdersUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const QUOTE_STATUS_FILTERS = [
  'NOTIFIED',
  'REVIEWING',
  'QUOTED',
  'OUT_OF_STOCK',
  'EXPIRED',
  '',
] as const;

export const ORDER_PACKING_STATUSES = [
  'ACCEPTED',
  'CONFIRMED',
  'PACKING',
  'PACKED',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
] as const;

import type { PosScreen } from '@medmate/pos-contract';

export const SCREEN_COPY: Record<
  PosScreen,
  { title: string; helper: string; kicker: string }
> = {
  counter: {
    title: 'Point of sale',
    helper: 'Search, bill, and take payment without leaving the keypad.',
    kicker: 'Counter',
  },
};

export function rootTestId(screen: PosScreen): string {
  return `pos-${screen}-page`;
}

export function errorText(
  result: { formError?: string; code?: string },
  fallback = 'Unable to continue.',
): string {
  return result.formError ?? result.code ?? fallback;
}

export const COUNTER_COPY = {
  search: 'Search products',
  searchHint: 'Name, rack, or barcode.',
  mode: 'Search mode',
  text: 'Text',
  barcode: 'Barcode',
  searchAction: 'Search',
  results: 'Search results',
  emptySearch: 'No products match that search.',
  add: 'Add to cart',
  cart: 'Cart',
  cartHint: 'Quantities sync with Core.',
  emptyCart: 'Cart is empty. Search and add a product.',
  quantity: 'Quantity',
  decreaseQty: 'Decrease quantity',
  increaseQty: 'Increase quantity',
  saveQty: 'Update quantity',
  remove: 'Remove',
  clear: 'Clear cart',
  confirmClear: 'Clear this cart?',
  confirmClearHelp: 'All lines will be removed and a new cart starts.',
  keepCart: 'Keep cart',
  customer: 'Customer',
  customerHint: 'Phone is enough for a walk-in.',
  phone: 'Customer phone',
  name: 'Customer name',
  attach: 'Attach customer',
  discount: 'Discount',
  discountHint: 'Core enforces the discount cap.',
  discountType: 'Discount type',
  flat: 'Flat rupees',
  percent: 'Percentage',
  discountValue: 'Discount value',
  applyDiscount: 'Apply discount',
  pay: 'Take payment',
  payHint: 'Stock leaves on checkout.',
  method: 'Payment method',
  amountPaid: 'Amount paid',
  upi: 'UPI reference',
  doctor: 'Prescribing doctor',
  subtotal: 'Subtotal',
  gst: 'GST',
  total: 'Total',
  checkout: 'Checkout',
  retry: 'Retry',
  receipt: 'Receipt',
  invoice: 'Open invoice',
  newSale: 'New sale',
  loading: 'Opening cart…',
} as const;

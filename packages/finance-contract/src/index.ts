export const FINANCE_SCREENS = ['settlements', 'settlement-detail'] as const;

export type FinanceScreen = (typeof FINANCE_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type SettlementStatus = 'PENDING' | 'RELEASED' | 'HELD' | string;

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export type SettlementQuery = {
  page?: number;
  limit?: number;
};

/** Core EPIC-012 STORY-003 list row. All money fields are DTO amounts. */
export type SettlementListRow = {
  settlement_id: string;
  cycle_from?: string | null;
  cycle_to?: string | null;
  gmv?: number | null;
  commission_pct?: number | null;
  commission_deducted?: number | null;
  tcs_deducted?: number | null;
  net_payable?: number | null;
  status?: SettlementStatus | null;
  released_at?: string | null;
};

/** Core settlement detail. Extra present keys render via the label map. */
export type SettlementDetail = SettlementListRow & {
  pharmacy_id?: string | null;
  cycle_id?: string | null;
  order_count?: number | null;
  utr?: string | null;
  payout_reference?: string | null;
  bank_last4?: string | null;
  notes?: string | null;
};

export type FinanceCommand =
  | { screen: 'settlements'; action: 'load'; values?: SettlementQuery }
  | {
      screen: 'settlement-detail';
      action: 'load';
      values: { settlementId: string };
    };

export type FinanceSubmitSuccess = {
  ok: true;
  settlements?: SettlementListRow[];
  settlement?: SettlementDetail | null;
  meta?: PageMeta;
};

export type FinanceSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type FinanceSubmitResult = FinanceSubmitSuccess | FinanceSubmitFailure;

export type FinanceFeatureData = {
  screen: FinanceScreen;
  onSubmit: (command: FinanceCommand) => Promise<FinanceSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canViewSettlements?: boolean;
  settlementId?: string | null;
  tokenScope?: 'full' | 'pos' | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export const SETTLEMENT_MONEY_KEYS = [
  'gmv',
  'commission_deducted',
  'tcs_deducted',
  'net_payable',
] as const;

export const SETTLEMENT_DATE_KEYS = [
  'cycle_from',
  'cycle_to',
  'released_at',
] as const;

export const SETTLEMENT_FIELD_LABELS: Record<string, string> = {
  settlement_id: 'Settlement',
  pharmacy_id: 'Pharmacy',
  cycle_id: 'Cycle',
  cycle_from: 'Cycle from',
  cycle_to: 'Cycle to',
  gmv: 'GMV',
  commission_pct: 'Commission %',
  commission_deducted: 'Commission deducted',
  tcs_deducted: 'TCS deducted',
  net_payable: 'Net payable',
  status: 'Status',
  released_at: 'Released',
  order_count: 'Orders',
  utr: 'UTR',
  payout_reference: 'Payout reference',
  bank_last4: 'Bank last 4',
  notes: 'Notes',
};

export function isFinanceScreen(value: unknown): value is FinanceScreen {
  return (
    typeof value === 'string' &&
    (FINANCE_SCREENS as readonly string[]).includes(value)
  );
}

export function isFinanceFeatureData(
  value: unknown,
): value is FinanceFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<FinanceFeatureData>;
  return (
    isFinanceScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function isSettlementNotFound(code: unknown): boolean {
  return code === 'SETTLEMENT_NOT_FOUND';
}

export function isForbidden(code: unknown): boolean {
  return code === 'FORBIDDEN' || code === 'INSUFFICIENT_PERMISSIONS';
}

export function isPosTokenRestricted(code: unknown): boolean {
  return code === 'POS_TOKEN_RESTRICTED';
}

export function isFinanceUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function isSettlementMoneyKey(key: string): boolean {
  return (SETTLEMENT_MONEY_KEYS as readonly string[]).includes(key);
}

export function isSettlementDateKey(key: string): boolean {
  return (SETTLEMENT_DATE_KEYS as readonly string[]).includes(key);
}

export function settlementFieldLabel(key: string): string {
  return SETTLEMENT_FIELD_LABELS[key] ?? key.replaceAll('_', ' ');
}

export function formatInr(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

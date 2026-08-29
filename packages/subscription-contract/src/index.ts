export const SUBSCRIPTION_SCREENS = ['plans', 'billing'] as const;

export type SubscriptionScreen = (typeof SUBSCRIPTION_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export const PLAN_RANK: Record<PlanCode, number> = {
  FREE: 0,
  STARTER: 1,
  RETAIL_PRO: 2,
  ENTERPRISE: 3,
};

export type SubscriptionLifecycle =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED';

export const PLAN_LOCK_CODES = [
  'PLAN_FEATURE_LOCKED',
  'PLAN_UPGRADE_REQUIRED',
  'MODULE_NOT_IN_PLAN',
] as const;

export type PlanLockCode = (typeof PLAN_LOCK_CODES)[number];

export const PLAN_LOCK_FEATURES = [
  'khata',
  'rx_queue',
  'analytics',
  'distributors',
  'reorder',
  'offers',
  'online_visibility',
] as const;

export type PlanLockFeature = (typeof PLAN_LOCK_FEATURES)[number];

export type PlanCard = {
  id: string;
  name: string;
  price_monthly_rs?: number | null;
  price_annual_rs?: number | null;
  seat_limit?: number | null;
  invoice_cap?: number | null;
  included_modules?: string[] | null;
  custom_price?: boolean;
};

export type CurrentSubscription = {
  current_plan?: string | null;
  plan?: string | null;
  status?: string | null;
  auto_renew?: boolean | null;
  scheduled_plan?: string | null;
  renewal_at?: string | null;
  seat_limit?: number | null;
};

export type PlansLoadPayload = {
  plans?: PlanCard[];
  subscription?: CurrentSubscription | null;
  plansForbidden?: boolean;
};

export type SaasInvoice = {
  id: string;
  status?: string | null;
  amount_rs?: number | null;
  amount_paise?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
};

export type PayPublicFields = {
  payment_link?: string | null;
  checkout_url?: string | null;
  payment_session_id?: string | null;
  order_id?: string | null;
};

export const PAY_SECRET_KEYS =
  /secret|private_key|cashfree_secret|api_key|authorization/i;

export type SubscriptionCommand =
  | { screen: 'plans'; action: 'load' }
  | {
      screen: 'plans';
      action: 'subscribe';
      values: { plan_id: string; idempotencyKey?: string };
    }
  | {
      screen: 'plans';
      action: 'upgrade';
      values: { plan_id: string; idempotencyKey?: string };
    }
  | { screen: 'plans'; action: 'downgrade'; values: { plan_id: string } }
  | { screen: 'plans'; action: 'cancel' }
  | { screen: 'plans'; action: 'autoRenew'; values: { enabled: boolean } }
  | { screen: 'billing'; action: 'load' }
  | { screen: 'billing'; action: 'loadInvoice'; values: { id: string } }
  | {
      screen: 'billing';
      action: 'pay';
      values: { invoice_id: string; idempotencyKey?: string };
    };

export type SubscriptionSubmitSuccess = {
  ok: true;
  plans?: PlanCard[];
  subscription?: CurrentSubscription | null;
  plansForbidden?: boolean;
  invoices?: SaasInvoice[];
  invoice?: SaasInvoice | null;
  pay?: PayPublicFields;
};

export type SubscriptionSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type SubscriptionSubmitResult =
  | SubscriptionSubmitSuccess
  | SubscriptionSubmitFailure;

export type SubscriptionFeatureData = {
  screen: SubscriptionScreen;
  onSubmit: (
    command: SubscriptionCommand,
  ) => Promise<SubscriptionSubmitResult>;
  role?: PharmacyRole | null;
  canWrite?: boolean;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isSubscriptionScreen(
  value: unknown,
): value is SubscriptionScreen {
  return (
    typeof value === 'string' &&
    (SUBSCRIPTION_SCREENS as readonly string[]).includes(value)
  );
}

export function isSubscriptionFeatureData(
  value: unknown,
): value is SubscriptionFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<SubscriptionFeatureData>;
  return (
    isSubscriptionScreen(feature.screen) &&
    typeof feature.onSubmit === 'function'
  );
}

export function mapPlanCode(plan: unknown): PlanCode | null {
  if (
    plan === 'FREE' ||
    plan === 'STARTER' ||
    plan === 'RETAIL_PRO' ||
    plan === 'ENTERPRISE'
  ) {
    return plan;
  }
  if (plan === 'GROWTH') {
    return 'RETAIL_PRO';
  }
  if (plan === 'PRO') {
    return 'ENTERPRISE';
  }
  return null;
}

export function planDisplayLabel(plan: PlanCode): string {
  switch (plan) {
    case 'FREE':
      return 'Free';
    case 'STARTER':
      return 'Starter';
    case 'RETAIL_PRO':
      return 'Growth';
    case 'ENTERPRISE':
      return 'Pro';
  }
}

export function planLabelFromUnknown(plan: unknown): string {
  const mapped = mapPlanCode(plan);
  if (mapped) {
    return planDisplayLabel(mapped);
  }
  if (typeof plan === 'string' && plan.trim()) {
    return plan;
  }
  return 'Unknown';
}

export function currentPlanCode(
  subscription: CurrentSubscription | null | undefined,
): PlanCode | null {
  return mapPlanCode(subscription?.current_plan ?? subscription?.plan);
}

export function isPlanLockCode(code: unknown): code is PlanLockCode {
  return (
    typeof code === 'string' &&
    (PLAN_LOCK_CODES as readonly string[]).includes(code)
  );
}

export function isPermissionDeniedCode(code: unknown): boolean {
  return code === 'INSUFFICIENT_PERMISSIONS' || code === 'FORBIDDEN';
}

export function minimumPlanForFeature(feature: PlanLockFeature): PlanCode {
  if (
    feature === 'analytics' ||
    feature === 'distributors' ||
    feature === 'reorder' ||
    feature === 'offers' ||
    feature === 'online_visibility'
  ) {
    return 'RETAIL_PRO';
  }
  return 'STARTER';
}

export function downgradeCopy(): string {
  return 'This change takes effect at the next renewal.';
}

export function cancelCopy(): string {
  return 'Cancelling ends Growth modules such as analytics, distributors, reorder, offers, and online visibility at the next renewal.';
}

export function enterprisePriceCopy(
  plan: PlanCard,
): string | null {
  if (mapPlanCode(plan.name) !== 'ENTERPRISE') {
    return null;
  }
  if (
    plan.custom_price ||
    plan.price_monthly_rs == null ||
    plan.price_annual_rs == null
  ) {
    return 'Contact us / custom';
  }
  return null;
}

export function publicPayFields(raw: unknown): PayPublicFields {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const source = raw as Record<string, unknown>;
  const out: PayPublicFields = {};
  for (const key of [
    'payment_link',
    'checkout_url',
    'payment_session_id',
    'order_id',
  ] as const) {
    const value = source[key];
    if (typeof value === 'string' && value && !PAY_SECRET_KEYS.test(key)) {
      out[key] = value;
    }
  }
  return out;
}

export function checkoutHref(pay: PayPublicFields | undefined): string | null {
  if (!pay) {
    return null;
  }
  if (typeof pay.payment_link === 'string' && pay.payment_link) {
    return pay.payment_link;
  }
  if (typeof pay.checkout_url === 'string' && pay.checkout_url) {
    return pay.checkout_url;
  }
  return null;
}

export function invoiceIsPaid(invoice: SaasInvoice | null | undefined): boolean {
  if (!invoice) {
    return false;
  }
  const status = invoice.status?.toLowerCase();
  return status === 'paid' || status === 'success' || Boolean(invoice.paid_at);
}

export function invoiceAmountLabel(invoice: SaasInvoice): string {
  if (typeof invoice.amount_rs === 'number') {
    return `₹${invoice.amount_rs}`;
  }
  if (typeof invoice.amount_paise === 'number') {
    return `₹${(invoice.amount_paise / 100).toFixed(2)}`;
  }
  return '—';
}

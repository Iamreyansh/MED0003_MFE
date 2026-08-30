export const RX_SCREENS = ['queue', 'detail', 'drug-register'] as const;

export type RxScreen = (typeof RX_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type RxStatus =
  'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | string;

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export type RxQueueQuery = {
  page?: number;
  limit?: number;
  status?: string;
};

export type RxLine = {
  line_id?: string | null;
  product_name?: string | null;
  generic_name?: string | null;
  strength?: string | null;
  quantity?: number | null;
  dosage?: string | null;
  schedule_h1?: boolean | null;
  schedule_x?: boolean | null;
  schedule?: string | null;
};

export type RxQueueRow = {
  rx_id: string;
  status?: RxStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
  patient_name?: string | null;
  prescriber_name?: string | null;
  schedule_h1?: boolean | null;
  schedule_x?: boolean | null;
  image_url?: string | null;
};

export type RxDetail = {
  rx_id: string;
  status?: RxStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
  reviewed_at?: string | null;
  dispensed_at?: string | null;
  patient_name?: string | null;
  prescriber_name?: string | null;
  schedule_h1?: boolean | null;
  schedule_x?: boolean | null;
  image_url?: string | null;
  lines?: RxLine[];
  reject_reason?: string | null;
};

export type RxApproveResult = {
  rx_id?: string | null;
  status?: RxStatus | null;
};

export type RxRejectResult = {
  rx_id?: string | null;
  status?: RxStatus | null;
  reason?: string | null;
};

export type RxDispenseResult = {
  rx_id?: string | null;
  status?: RxStatus | null;
  cart_id?: string | null;
};

export type DrugRegisterQuery = {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  schedule?: string;
};

export type DrugRegisterRow = {
  entry_id?: string | null;
  dispensed_at?: string | null;
  rx_id?: string | null;
  product_name?: string | null;
  schedule?: string | null;
  schedule_h1?: boolean | null;
  schedule_x?: boolean | null;
  quantity?: number | null;
  patient_name?: string | null;
  prescriber_name?: string | null;
};

export type RetentionRules = {
  guidance?: string | null;
  retention_days?: number | null;
  schedule_h1_days?: number | null;
  schedule_x_days?: number | null;
};

export type RxCommand =
  | { screen: 'queue'; action: 'load'; values?: RxQueueQuery }
  | { screen: 'detail'; action: 'load'; values: { rxId: string } }
  | { screen: 'detail'; action: 'approve'; values: { rxId: string } }
  | {
      screen: 'detail';
      action: 'reject';
      values: { rxId: string; reason: string };
    }
  | { screen: 'detail'; action: 'dispense'; values: { rxId: string } }
  | { screen: 'detail'; action: 'dispenseToBilling'; values: { rxId: string } }
  | { screen: 'drug-register'; action: 'load'; values?: DrugRegisterQuery }
  | { screen: 'drug-register'; action: 'loadRetention' };

export type RxSubmitSuccess = {
  ok: true;
  prescriptions?: RxQueueRow[];
  prescription?: RxDetail | null;
  approve?: RxApproveResult | null;
  reject?: RxRejectResult | null;
  dispense?: RxDispenseResult | null;
  cart_id?: string | null;
  register?: DrugRegisterRow[];
  retention?: RetentionRules | null;
  meta?: PageMeta;
};

export type RxSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type RxSubmitResult = RxSubmitSuccess | RxSubmitFailure;

export type RxFeatureData = {
  screen: RxScreen;
  onSubmit: (command: RxCommand) => Promise<RxSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canMutateRx?: boolean;
  canDispenseToBilling?: boolean;
  canViewRetention?: boolean;
  rxId?: string | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isRxScreen(value: unknown): value is RxScreen {
  return (
    typeof value === 'string' &&
    (RX_SCREENS as readonly string[]).includes(value)
  );
}

export function isRxFeatureData(value: unknown): value is RxFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<RxFeatureData>;
  return isRxScreen(feature.screen) && typeof feature.onSubmit === 'function';
}

export function isRxNotFound(code: unknown): boolean {
  return code === 'RX_NOT_FOUND';
}

export function isInsufficientStock(code: unknown): boolean {
  return code === 'INSUFFICIENT_STOCK';
}

export function isPlanFeatureLocked(code: unknown): boolean {
  return code === 'PLAN_FEATURE_LOCKED' || code === 'MODULE_NOT_IN_PLAN';
}

export function rxLockCopy(): string {
  return 'Prescriptions require the Starter plan.';
}

export function isControlledSchedule(row: {
  schedule_h1?: boolean | null;
  schedule_x?: boolean | null;
  schedule?: string | null;
}): boolean {
  if (row.schedule_h1 || row.schedule_x) {
    return true;
  }
  const schedule = String(row.schedule ?? '').toUpperCase();
  return schedule.includes('H1') || schedule.includes('X');
}

export const RX_STATUS_FILTERS = [
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'DISPENSED',
  '',
] as const;

export const DRUG_REGISTER_SCHEDULE_FILTERS = ['', 'H1', 'X'] as const;

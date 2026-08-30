import {
  formatInr,
  isSettlementDateKey,
  isSettlementMoneyKey,
  settlementFieldLabel,
  type SettlementDetail,
} from '@medmate/finance-contract';
import { dash, formatIstDate } from './copy';

const SKIP_KEYS = new Set(['id']);

export type PresentField = {
  key: string;
  label: string;
  value: string;
};

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  if (typeof value === 'object') {
    return false;
  }
  return true;
}

export function presentFields(detail: SettlementDetail | null): PresentField[] {
  if (!detail) {
    return [];
  }
  return Object.entries(detail)
    .filter(([key, value]) => !SKIP_KEYS.has(key) && isPresent(value))
    .map(([key, value]) => ({
      key,
      label: settlementFieldLabel(key),
      value: formatFieldValue(key, value),
    }));
}

export function formatFieldValue(key: string, value: unknown): string {
  if (isSettlementMoneyKey(key)) {
    return formatInr(value);
  }
  if (isSettlementDateKey(key)) {
    return formatIstDate(value);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return dash(value);
}

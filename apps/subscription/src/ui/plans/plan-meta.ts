import type { PlanCard, PlanCode } from '@medmate/subscription-contract';
import {
  PLAN_RANK,
  enterprisePriceCopy,
  mapPlanCode,
} from '@medmate/subscription-contract';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Building2, Circle, Layers, Store } from 'lucide-react';
import { PLANS_COPY } from '../../lib/copy';

export type ConfirmKind = 'subscribe' | 'upgrade' | 'downgrade' | 'cancel';

export function changeKind(
  current: PlanCode | null,
  target: PlanCode | null,
): ConfirmKind | null {
  if (!target) {
    return null;
  }
  if (!current || current === 'FREE') {
    return target === 'FREE' ? null : 'subscribe';
  }
  if (target === current) {
    return null;
  }
  return PLAN_RANK[target] > PLAN_RANK[current] ? 'upgrade' : 'downgrade';
}

export function priceLine(plan: PlanCard): string {
  const custom = enterprisePriceCopy(plan);
  if (custom) {
    return custom;
  }
  const parts: string[] = [];
  if (typeof plan.price_monthly_rs === 'number') {
    parts.push(`${PLANS_COPY.monthly} ₹${plan.price_monthly_rs}`);
  }
  if (typeof plan.price_annual_rs === 'number') {
    parts.push(`${PLANS_COPY.annual} ₹${plan.price_annual_rs}`);
  }
  return parts.join(' · ') || '—';
}

export function monthlyCell(plan: PlanCard): string {
  const custom = enterprisePriceCopy(plan);
  if (custom) {
    return custom;
  }
  if (typeof plan.price_monthly_rs === 'number') {
    return `₹${plan.price_monthly_rs}`;
  }
  return '—';
}

export function annualCell(plan: PlanCard): string {
  if (enterprisePriceCopy(plan)) {
    return '—';
  }
  if (typeof plan.price_annual_rs === 'number') {
    return `₹${plan.price_annual_rs}`;
  }
  return '—';
}

export function planIcon(name: string): LucideIcon {
  const code = mapPlanCode(name);
  if (code === 'FREE') {
    return Circle;
  }
  if (code === 'STARTER') {
    return Store;
  }
  if (code === 'RETAIL_PRO') {
    return BarChart3;
  }
  if (code === 'ENTERPRISE') {
    return Building2;
  }
  return Layers;
}

export function seatFill(limit: number): boolean[] {
  return [0, 1, 2, 3].map((slot) => slot < Math.min(limit, 4));
}

export function actionLabel(kind: ConfirmKind): string {
  if (kind === 'subscribe') {
    return PLANS_COPY.subscribe;
  }
  if (kind === 'upgrade') {
    return PLANS_COPY.upgrade;
  }
  if (kind === 'downgrade') {
    return PLANS_COPY.downgrade;
  }
  return PLANS_COPY.cancel;
}

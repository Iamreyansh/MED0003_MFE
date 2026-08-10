import {
  MFE_CONTRACT_VERSION,
  type MfeDataEnvelope,
  type TodoFeatureData,
} from '@medmate/contracts';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

export function createTodoEnvelope(
  feature: TodoFeatureData = {},
): MfeDataEnvelope<TodoFeatureData> {
  return {
    contractVersion: MFE_CONTRACT_VERSION,
    context: {
      hostId: 'test-host',
      locale: 'en-IN',
      pharmacyId: 'pharmacy-1',
      userId: 'user-1',
      permissions: ['todo:read', 'todo:write'],
    },
    feature,
  };
}

function Wrapper({ children }: { children: ReactNode }) {
  return children;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: Wrapper, ...options });
}

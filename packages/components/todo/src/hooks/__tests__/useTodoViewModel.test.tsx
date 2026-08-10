import { MfeStoreProvider } from '@medmate/mfe-kit';
import { cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createTodoStore } from '../../store';
import { useTodoViewModel } from '../useTodoViewModel';

afterEach(() => {
  cleanup();
});

describe('useTodoViewModel', () => {
  it('exposes visible items for the active filter', () => {
    const store = createTodoStore({
      initialItems: [
        { id: '1', title: 'A', completed: false },
        { id: '2', title: 'B', completed: true },
      ],
      initialFilter: 'active',
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MfeStoreProvider store={store}>{children}</MfeStoreProvider>
    );

    const { result } = renderHook(() => useTodoViewModel(), { wrapper });
    expect(result.current.visible).toHaveLength(1);
    expect(result.current.visible[0]?.title).toBe('A');
  });
});

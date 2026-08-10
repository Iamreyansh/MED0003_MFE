import { MfeStoreProvider } from '@medmate/mfe-kit';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createTodoStore } from '../../store';
import { useTodoActions } from '../useTodoActions';

afterEach(() => {
  cleanup();
});

describe('useTodoActions', () => {
  it('dispatches draft and filter updates', () => {
    const store = createTodoStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MfeStoreProvider store={store}>{children}</MfeStoreProvider>
    );

    const { result } = renderHook(() => useTodoActions(), { wrapper });
    act(() => {
      result.current.setDraft('Buy milk');
      result.current.setFilter('completed');
    });
    expect(store.getState().todo.draft).toBe('Buy milk');
    expect(store.getState().todo.filter).toBe('completed');
  });
});

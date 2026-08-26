import { configureStore, createSlice } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import { createMfeStoreHooks } from '../hooks';

afterEach(() => {
  cleanup();
});

const slice = createSlice({
  name: 'demo',
  initialState: { label: 'hooks-ok', count: 0 },
  reducers: {
    bump(state) {
      state.count += 1;
      state.label = `count-${state.count}`;
    },
  },
});

type RootState = { demo: { label: string; count: number } };
type Dispatch = ReturnType<
  typeof configureStore<{ demo: typeof slice.reducer }>
>['dispatch'];

const { useAppDispatch, useAppSelector } = createMfeStoreHooks<
  RootState,
  Dispatch
>();

function Demo() {
  const dispatch = useAppDispatch();
  const label = useAppSelector((state) => state.demo.label);
  return (
    <button type="button" onClick={() => dispatch(slice.actions.bump())}>
      {label}
    </button>
  );
}

describe('createMfeStoreHooks', () => {
  it('binds typed selectors and dispatch to the store', () => {
    const store = configureStore({ reducer: { demo: slice.reducer } });
    render(
      <Provider store={store}>
        <Demo />
      </Provider>,
    );
    expect(screen.getByText('hooks-ok')).toBeTruthy();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('count-1')).toBeTruthy();
  });
});

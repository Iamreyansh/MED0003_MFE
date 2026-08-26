import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { createMfeStore } from '../createMfeStore';

const incrementAsync = createAsyncThunk(
  'counter/incrementAsync',
  async () => 1,
);

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(incrementAsync.fulfilled, (state, action) => {
      state.value += action.payload;
    });
  },
});

describe('createMfeStore', () => {
  it('creates a store with reducers and supports thunks', async () => {
    const store = createMfeStore({
      reducer: { counter: counterSlice.reducer },
    });

    store.dispatch(counterSlice.actions.increment());
    expect(store.getState().counter.value).toBe(1);

    await store.dispatch(incrementAsync());
    expect(store.getState().counter.value).toBe(2);
  });
});

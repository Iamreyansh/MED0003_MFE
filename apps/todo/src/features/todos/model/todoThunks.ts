import { createAsyncThunk } from '@reduxjs/toolkit';

/** Async add — demonstrates thunk support for MFE-local side effects. */
export const addTodoThunk = createAsyncThunk(
  'todo/addTodo',
  async (title: string) => title,
);

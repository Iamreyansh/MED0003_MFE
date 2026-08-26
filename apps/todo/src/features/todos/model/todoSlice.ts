import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TodoFilter, TodoItem } from '../../../contract';
import { todoService } from '../api/todoService';
import { TODO_STORE_NAME } from './todoConstants';
import { addTodoThunk } from './todoThunks';
import type { TodoState, TodoStoreSeed } from './todoTypes';

export function createInitialTodoState(input: TodoStoreSeed = {}): TodoState {
  return {
    items: todoService.normalize(input.initialItems),
    filter: input.initialFilter ?? 'all',
    draft: '',
    editingId: null,
    editingTitle: '',
  };
}

const todoSlice = createSlice({
  name: TODO_STORE_NAME,
  initialState: createInitialTodoState(),
  reducers: {
    setDraft(state, action: PayloadAction<string>) {
      state.draft = action.payload;
    },
    setFilter(state, action: PayloadAction<TodoFilter>) {
      state.filter = action.payload;
    },
    toggle(state, action: PayloadAction<string>) {
      state.items = todoService.toggle(state.items, action.payload);
    },
    remove(state, action: PayloadAction<string>) {
      state.items = todoService.remove(state.items, action.payload);
    },
    startEdit(state, action: PayloadAction<TodoItem>) {
      state.editingId = action.payload.id;
      state.editingTitle = action.payload.title;
    },
    setEditingTitle(state, action: PayloadAction<string>) {
      state.editingTitle = action.payload;
    },
    cancelEdit(state) {
      state.editingId = null;
      state.editingTitle = '';
    },
    commitEdit(state) {
      if (!state.editingId) return;
      state.items = todoService.updateTitle(
        state.items,
        state.editingId,
        state.editingTitle,
      );
      state.editingId = null;
      state.editingTitle = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addTodoThunk.fulfilled, (state, action) => {
      state.items = todoService.add(state.items, action.payload);
      state.draft = '';
    });
  },
});

export const todoActions = todoSlice.actions;
export const todoReducer = todoSlice.reducer;

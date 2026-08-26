import { createSelector } from '@reduxjs/toolkit';
import type { TodoItem } from '../../../contract';
import { todoService } from '../api/todoService';
import type { TodoRootState } from './createTodoStore';

export function selectTodoState(state: TodoRootState) {
  return state.todo;
}

export const selectVisibleTodos = createSelector(
  [
    (state: TodoRootState) => state.todo.items,
    (state: TodoRootState) => state.todo.filter,
  ],
  (items, filter): TodoItem[] => todoService.filter(items, filter),
);

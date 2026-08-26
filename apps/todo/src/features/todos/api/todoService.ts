import type { TodoFilter, TodoItem } from '../../../contract';
import {
  addTodo,
  deleteTodo,
  filterTodos,
  normalizeItems,
  toggleTodo,
  updateTodoTitle,
} from '../lib/todoLogic';

/** Domain service — keeps components free of pure logic details. */
export const todoService = {
  normalize(items: readonly TodoItem[] | undefined): TodoItem[] {
    return normalizeItems(items);
  },
  filter(items: readonly TodoItem[], filter: TodoFilter): TodoItem[] {
    return filterTodos(items, filter);
  },
  add(items: readonly TodoItem[], title: string): TodoItem[] {
    return addTodo(items, title);
  },
  toggle(items: readonly TodoItem[], id: string): TodoItem[] {
    return toggleTodo(items, id);
  },
  updateTitle(
    items: readonly TodoItem[],
    id: string,
    title: string,
  ): TodoItem[] {
    return updateTodoTitle(items, id, title);
  },
  remove(items: readonly TodoItem[], id: string): TodoItem[] {
    return deleteTodo(items, id);
  },
};

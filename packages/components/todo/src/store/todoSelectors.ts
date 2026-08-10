import { todoService } from '../services/todoService';
import type { TodoItem } from '../types';
import type { TodoRootState } from './createTodoStore';

export function selectTodoState(state: TodoRootState) {
  return state.todo;
}

export function selectVisibleTodos(state: TodoRootState): TodoItem[] {
  return todoService.filter(state.todo.items, state.todo.filter);
}

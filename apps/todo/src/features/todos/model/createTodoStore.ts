import { createMfeStore, createMfeStoreHooks } from '@medmate/mfe-kit';
import { TODO_STORE_NAME } from './todoConstants';
import { createInitialTodoState, todoReducer } from './todoSlice';
import type { TodoStoreSeed } from './todoTypes';

export function createTodoStore(initial: TodoStoreSeed = {}) {
  return createMfeStore({
    reducer: { [TODO_STORE_NAME]: todoReducer },
    preloadedState: { [TODO_STORE_NAME]: createInitialTodoState(initial) },
  });
}

export type TodoStore = ReturnType<typeof createTodoStore>;
export type TodoRootState = ReturnType<TodoStore['getState']>;
export type TodoDispatch = TodoStore['dispatch'];

export const { useAppDispatch, useAppSelector } = createMfeStoreHooks<
  TodoRootState,
  TodoDispatch
>();

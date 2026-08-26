import { describe, expect, it } from 'vitest';
import {
  addTodoThunk,
  createTodoStore,
  selectTodoState,
  selectVisibleTodos,
  todoActions,
} from '../index';

describe('todoStore', () => {
  it('supports sync actions and thunks', async () => {
    const store = createTodoStore({
      initialItems: [{ id: '1', title: 'A', completed: false }],
      initialFilter: 'all',
    });

    expect(selectTodoState(store.getState()).items).toHaveLength(1);

    store.dispatch(todoActions.setDraft('B'));
    await store.dispatch(addTodoThunk(store.getState().todo.draft));
    expect(store.getState().todo.items).toHaveLength(2);
    expect(store.getState().todo.draft).toBe('');

    store.dispatch(todoActions.setFilter('completed'));
    expect(selectVisibleTodos(store.getState())).toHaveLength(0);
    expect(store.getState().todo.filter).toBe('completed');

    store.dispatch(todoActions.setFilter('all'));
    store.dispatch(todoActions.toggle('1'));
    store.dispatch(
      todoActions.startEdit({ id: '1', title: 'A', completed: true }),
    );
    store.dispatch(todoActions.setEditingTitle('AA'));
    store.dispatch(todoActions.commitEdit());
    expect(store.getState().todo.items[0]?.title).toBe('AA');

    store.dispatch(todoActions.commitEdit());
    store.dispatch(todoActions.cancelEdit());
    store.dispatch(todoActions.remove('1'));
    expect(store.getState().todo.items).toHaveLength(1);
  });
});

import type { TodoFilter, TodoItem } from '../../../contract';
import { useAppDispatch } from './createTodoStore';
import { todoActions } from './todoSlice';
import { addTodoThunk } from './todoThunks';

export function useTodoActions() {
  const dispatch = useAppDispatch();

  return {
    setDraft(value: string) {
      dispatch(todoActions.setDraft(value));
    },
    setFilter(value: TodoFilter) {
      dispatch(todoActions.setFilter(value));
    },
    addFromDraft(draft: string) {
      void dispatch(addTodoThunk(draft));
    },
    toggle(id: string) {
      dispatch(todoActions.toggle(id));
    },
    remove(id: string) {
      dispatch(todoActions.remove(id));
    },
    startEdit(item: TodoItem) {
      dispatch(todoActions.startEdit(item));
    },
    setEditingTitle(value: string) {
      dispatch(todoActions.setEditingTitle(value));
    },
    commitEdit() {
      dispatch(todoActions.commitEdit());
    },
    cancelEdit() {
      dispatch(todoActions.cancelEdit());
    },
  };
}

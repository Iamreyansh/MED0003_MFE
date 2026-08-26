import { useAppSelector } from './createTodoStore';
import { selectVisibleTodos } from './todoSelectors';

export function useTodoViewModel() {
  const items = useAppSelector((state) => state.todo.items);
  const filter = useAppSelector((state) => state.todo.filter);
  const draft = useAppSelector((state) => state.todo.draft);
  const editingId = useAppSelector((state) => state.todo.editingId);
  const editingTitle = useAppSelector((state) => state.todo.editingTitle);
  const visible = useAppSelector(selectVisibleTodos);

  return { items, filter, draft, editingId, editingTitle, visible };
}

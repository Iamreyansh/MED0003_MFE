import type { TodoFilter, TodoItem } from '../../../contract';

export function createTodoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeItems(
  items: readonly TodoItem[] | undefined,
): TodoItem[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title.trim(),
    completed: Boolean(item.completed),
  }));
}

export function filterTodos(
  items: readonly TodoItem[],
  filter: TodoFilter,
): TodoItem[] {
  if (filter === 'active') {
    return items.filter((item) => !item.completed);
  }
  if (filter === 'completed') {
    return items.filter((item) => item.completed);
  }
  return [...items];
}

export function addTodo(items: readonly TodoItem[], title: string): TodoItem[] {
  const trimmed = title.trim();
  if (!trimmed) {
    return [...items];
  }
  return [
    ...items,
    {
      id: createTodoId(),
      title: trimmed,
      completed: false,
    },
  ];
}

export function toggleTodo(items: readonly TodoItem[], id: string): TodoItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, completed: !item.completed } : item,
  );
}

export function updateTodoTitle(
  items: readonly TodoItem[],
  id: string,
  title: string,
): TodoItem[] {
  const trimmed = title.trim();
  if (!trimmed) {
    return [...items];
  }
  return items.map((item) =>
    item.id === id ? { ...item, title: trimmed } : item,
  );
}

export function deleteTodo(items: readonly TodoItem[], id: string): TodoItem[] {
  return items.filter((item) => item.id !== id);
}

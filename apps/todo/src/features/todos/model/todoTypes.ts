import type { TodoFilter, TodoItem } from '../../../contract';

export type TodoState = {
  items: TodoItem[];
  filter: TodoFilter;
  draft: string;
  editingId: string | null;
  editingTitle: string;
};

export type TodoStoreSeed = {
  initialItems?: readonly TodoItem[];
  initialFilter?: TodoFilter;
};

import type { TodoFilter } from '../types';

export const TODO_FILTERS: readonly TodoFilter[] = [
  'all',
  'active',
  'completed',
] as const;

export const TODO_COPY = {
  defaultTitle: 'Todo',
  emptyFilter: 'No todos for this filter.',
  addLabel: 'Add todo',
  newTodoLabel: 'New todo',
  newTodoPlaceholder: 'What needs doing?',
  filterGroupLabel: 'Filter todos',
  listLabel: 'Todo list',
  editLabel: 'Edit todo',
  addButton: 'Add',
  saveButton: 'Save',
  cancelButton: 'Cancel',
  editButton: 'Edit',
  deleteButton: 'Delete',
} as const;

export const TODO_STORE_NAME = 'todo' as const;

import { StatusMessage } from '@medmate/ui';
import type { TodoItem } from '../contract';
import { TODO_COPY } from '../features/todos/model/todoConstants';
import { TodoItemRow } from './TodoItemRow';

type TodoListProps = {
  items: readonly TodoItem[];
  editingId: string | null;
  editingTitle: string;
  onToggle: (id: string) => void;
  onStartEdit: (item: TodoItem) => void;
  onEditingTitleChange: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onRemove: (id: string) => void;
};

export function TodoList({
  items,
  editingId,
  editingTitle,
  onToggle,
  onStartEdit,
  onEditingTitleChange,
  onCommitEdit,
  onCancelEdit,
  onRemove,
}: TodoListProps) {
  return (
    <>
      <ul
        className="m-0 flex list-none flex-col gap-2 p-0"
        aria-label={TODO_COPY.listLabel}
      >
        {items.map((item) => (
          <TodoItemRow
            key={item.id}
            item={item}
            isEditing={editingId === item.id}
            editingTitle={editingTitle}
            onToggle={onToggle}
            onStartEdit={onStartEdit}
            onEditingTitleChange={onEditingTitleChange}
            onCommitEdit={onCommitEdit}
            onCancelEdit={onCancelEdit}
            onRemove={onRemove}
          />
        ))}
      </ul>
      {items.length === 0 ? (
        <StatusMessage>{TODO_COPY.emptyFilter}</StatusMessage>
      ) : null}
    </>
  );
}

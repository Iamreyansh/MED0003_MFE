import { TODO_COPY } from '../constants/todoConstants';
import type { TodoItem } from '../types';
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
      <ul className="todo-mfe__list" aria-label={TODO_COPY.listLabel}>
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
      {items.length === 0 ? <p role="status">{TODO_COPY.emptyFilter}</p> : null}
    </>
  );
}

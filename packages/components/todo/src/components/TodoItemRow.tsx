import { Button, TextField } from '@medmate/ui';
import type { ChangeEvent } from 'react';
import { TODO_COPY } from '../constants/todoConstants';
import type { TodoItem } from '../types';

type TodoItemRowProps = {
  item: TodoItem;
  isEditing: boolean;
  editingTitle: string;
  onToggle: (id: string) => void;
  onStartEdit: (item: TodoItem) => void;
  onEditingTitleChange: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onRemove: (id: string) => void;
};

export function TodoItemRow({
  item,
  isEditing,
  editingTitle,
  onToggle,
  onStartEdit,
  onEditingTitleChange,
  onCommitEdit,
  onCancelEdit,
  onRemove,
}: TodoItemRowProps) {
  return (
    <li className="mm-row todo-mfe__item">
      <input
        type="checkbox"
        checked={item.completed}
        aria-label={`Complete ${item.title}`}
        onChange={() => onToggle(item.id)}
      />
      {isEditing ? (
        <>
          <TextField
            label={TODO_COPY.editLabel}
            value={editingTitle}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onEditingTitleChange(event.target.value)
            }
          />
          <Button onClick={onCommitEdit}>{TODO_COPY.saveButton}</Button>
          <Button variant="ghost" onClick={onCancelEdit}>
            {TODO_COPY.cancelButton}
          </Button>
        </>
      ) : (
        <>
          <span
            style={{
              textDecoration: item.completed ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </span>
          <Button variant="ghost" onClick={() => onStartEdit(item)}>
            {TODO_COPY.editButton}
          </Button>
          <Button variant="danger" onClick={() => onRemove(item.id)}>
            {TODO_COPY.deleteButton}
          </Button>
        </>
      )}
    </li>
  );
}

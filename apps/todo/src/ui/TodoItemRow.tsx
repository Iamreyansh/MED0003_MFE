import { Button, Inline, TextField } from '@medmate/ui';
import type { ChangeEvent } from 'react';
import type { TodoItem } from '../contract';
import { TODO_COPY } from '../features/todos/model/todoConstants';

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
    <li className="list-none">
      <Inline wrap>
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
              className={
                item.completed ? 'text-mm-muted line-through' : undefined
              }
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
      </Inline>
    </li>
  );
}

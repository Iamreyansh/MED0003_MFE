import { Button, TextField } from '@medmate/ui';
import type { ChangeEvent, FormEvent } from 'react';
import { TODO_COPY } from '../features/todos/model/todoConstants';

type TodoFormProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
};

export function TodoForm({ draft, onDraftChange, onSubmit }: TodoFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="flex flex-row items-center gap-2"
      onSubmit={handleSubmit}
      aria-label={TODO_COPY.addLabel}
    >
      <TextField
        label={TODO_COPY.newTodoLabel}
        value={draft}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onDraftChange(event.target.value)
        }
        placeholder={TODO_COPY.newTodoPlaceholder}
      />
      <Button type="submit" disabled={!draft.trim()}>
        {TODO_COPY.addButton}
      </Button>
    </form>
  );
}

import {
  assertMfeDataEnvelope,
  type TodoFilter,
  type TodoItem,
  type TodoMfeProps,
} from '@medmate/contracts';
import { Button, Card, TextField } from '@medmate/ui';
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  addTodo,
  deleteTodo,
  filterTodos,
  normalizeItems,
  toggleTodo,
  updateTodoTitle,
} from '../app/todoLogic';

const FILTERS: readonly TodoFilter[] = ['all', 'active', 'completed'];

export default function TodoMfe({ data }: TodoMfeProps) {
  assertMfeDataEnvelope(data);

  const [items, setItems] = useState<TodoItem[]>(() =>
    normalizeItems(data.feature.initialItems),
  );
  const [filter, setFilter] = useState<TodoFilter>(
    data.feature.initialFilter ?? 'all',
  );
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    data.feature.onChange?.(items);
  }, [items, data.feature]);

  const visible = useMemo(() => filterTodos(items, filter), [items, filter]);
  const title = data.feature.title ?? 'Todo';

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setItems((current) => addTodo(current, draft));
    setDraft('');
  }

  function startEdit(item: TodoItem) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  function commitEdit() {
    // Save is only rendered while editingId is set.
    setItems((current) =>
      updateTodoTitle(current, editingId as string, editingTitle),
    );
    setEditingId(null);
    setEditingTitle('');
  }

  return (
    <Card title={title} className="todo-mfe" data-testid="todo-mfe">
      <p className="todo-mfe__meta">
        Host: {data.context.hostId} · Locale: {data.context.locale}
      </p>

      <form className="mm-row" onSubmit={handleAdd} aria-label="Add todo">
        <TextField
          label="New todo"
          value={draft}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value)
          }
          placeholder="What needs doing?"
        />
        <Button type="submit" disabled={!draft.trim()}>
          Add
        </Button>
      </form>

      <div className="mm-row" role="group" aria-label="Filter todos">
        {FILTERS.map((value) => (
          <Button
            key={value}
            variant={filter === value ? 'primary' : 'ghost'}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <ul className="todo-mfe__list" aria-label="Todo list">
        {visible.map((item) => (
          <li key={item.id} className="mm-row todo-mfe__item">
            <input
              type="checkbox"
              checked={item.completed}
              aria-label={`Complete ${item.title}`}
              onChange={() =>
                setItems((current) => toggleTodo(current, item.id))
              }
            />
            {editingId === item.id ? (
              <>
                <TextField
                  label="Edit todo"
                  value={editingTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setEditingTitle(event.target.value)
                  }
                />
                <Button onClick={commitEdit}>Save</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setEditingTitle('');
                  }}
                >
                  Cancel
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
                <Button variant="ghost" onClick={() => startEdit(item)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    setItems((current) => deleteTodo(current, item.id))
                  }
                >
                  Delete
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p role="status">No todos for this filter.</p>
      ) : null}
    </Card>
  );
}

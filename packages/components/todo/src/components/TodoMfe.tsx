import { assertMfeDataEnvelope } from '@medmate/contracts';
import { MfeStoreProvider } from '@medmate/mfe-kit';
import { Card } from '@medmate/ui';
import { useEffect, useRef } from 'react';
import { TODO_COPY } from '../constants/todoConstants';
import type { TodoMfeProps } from '../contract';
import { useTodoActions } from '../hooks/useTodoActions';
import { useTodoViewModel } from '../hooks/useTodoViewModel';
import { createTodoStore, type TodoStore } from '../store';
import { TodoFilters } from './TodoFilters';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

function TodoMfeView({ data }: TodoMfeProps) {
  const { items, filter, draft, editingId, editingTitle, visible } =
    useTodoViewModel();
  const actions = useTodoActions();
  const title = data.feature.title ?? TODO_COPY.defaultTitle;

  useEffect(() => {
    data.feature.onChange?.(items);
  }, [items, data.feature]);

  return (
    <Card title={title} className="todo-mfe" data-testid="todo-mfe">
      <p className="todo-mfe__meta">
        Host: {data.context.hostId} · Locale: {data.context.locale}
      </p>

      <TodoForm
        draft={draft}
        onDraftChange={actions.setDraft}
        onSubmit={() => actions.addFromDraft(draft)}
      />

      <TodoFilters filter={filter} onChange={actions.setFilter} />

      <TodoList
        items={visible}
        editingId={editingId}
        editingTitle={editingTitle}
        onToggle={actions.toggle}
        onStartEdit={actions.startEdit}
        onEditingTitleChange={actions.setEditingTitle}
        onCommitEdit={actions.commitEdit}
        onCancelEdit={actions.cancelEdit}
        onRemove={actions.remove}
      />
    </Card>
  );
}

export default function TodoMfe({ data }: TodoMfeProps) {
  assertMfeDataEnvelope(data);

  const storeRef = useRef<TodoStore | null>(null);
  storeRef.current ??= createTodoStore({
    initialItems: data.feature.initialItems,
    initialFilter: data.feature.initialFilter,
  });

  return (
    <MfeStoreProvider store={storeRef.current}>
      <TodoMfeView data={data} />
    </MfeStoreProvider>
  );
}

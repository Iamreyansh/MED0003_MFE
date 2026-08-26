import { PageSection, Stack, StatusMessage } from '@medmate/ui';
import { useEffect } from 'react';
import type { TodoMfeProps } from '../contract';
import { TODO_COPY } from '../features/todos/model/todoConstants';
import { useTodoActions } from '../features/todos/model/useTodoActions';
import { useTodoViewModel } from '../features/todos/model/useTodoViewModel';
import { TodoFilters } from '../ui/TodoFilters';
import { TodoForm } from '../ui/TodoForm';
import { TodoList } from '../ui/TodoList';

export function TodoLayout({ data }: TodoMfeProps) {
  const { items, filter, draft, editingId, editingTitle, visible } =
    useTodoViewModel();
  const actions = useTodoActions();
  const title = data.feature.title ?? TODO_COPY.defaultTitle;

  useEffect(() => {
    data.feature.onChange?.(items);
  }, [items, data.feature]);

  return (
    <PageSection title={title} data-testid="todo-mfe">
      <Stack>
        <StatusMessage>
          Host: {data.context.hostId} · Locale: {data.context.locale}
        </StatusMessage>

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
      </Stack>
    </PageSection>
  );
}

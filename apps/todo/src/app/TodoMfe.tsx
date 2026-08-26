import { assertMfeDataEnvelope } from '@medmate/contracts';
import { MfeStoreProvider } from '@medmate/mfe-kit';
import { useRef } from 'react';
import type { TodoMfeProps } from '../contract';
import { createTodoStore, type TodoStore } from '../features/todos/model';
import { TodoLayout } from '../layouts/TodoLayout';

export default function TodoMfe({ data }: TodoMfeProps) {
  assertMfeDataEnvelope(data);

  const storeRef = useRef<TodoStore | null>(null);
  storeRef.current ??= createTodoStore({
    initialItems: data.feature.initialItems,
    initialFilter: data.feature.initialFilter,
  });

  return (
    <MfeStoreProvider store={storeRef.current}>
      <TodoLayout data={data} />
    </MfeStoreProvider>
  );
}

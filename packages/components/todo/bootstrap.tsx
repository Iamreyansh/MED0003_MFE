/**
 * Standalone harness — shared mfe-kit bootstrap only.
 * Styles are imported here for local/dev; federated hosts get styles via index.tsx.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone } from '@medmate/mfe-kit';
import { useMemo, useState } from 'react';
import TodoMfe from './src/components/TodoMfe';
import type { TodoMfeProps } from './src/contract';
import '@medmate/ui/styles.css';
import './src/styles/todo.css';

function StandaloneHarness() {
  const [log, setLog] = useState('Ready');

  const data = useMemo<TodoMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'todo-standalone',
        locale: 'en-IN',
        permissions: ['todo:read', 'todo:write'],
      },
      feature: {
        title: 'Sample Todo MFE',
        initialItems: [
          { id: '1', title: 'Wire Module Federation', completed: true },
          { id: '2', title: 'Pass everything via data', completed: false },
        ],
        onChange: (items) => {
          setLog(`Items: ${items.length}`);
        },
      },
      capabilities: {
        telemetry: {
          track: (event, properties) => {
            setLog(`${event} ${JSON.stringify(properties ?? {})}`);
          },
        },
      },
    }),
    [],
  );

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Todo MFE standalone harness</h1>
      <p>Developers can run this package alone before mounting it in a host.</p>
      <TodoMfe data={data} />
      <p aria-live="polite">{log}</p>
    </main>
  );
}

mountStandalone(<StandaloneHarness />);

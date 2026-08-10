import { MFE_CONTRACT_VERSION, type TodoMfeProps } from '@medmate/contracts';
import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@medmate/ui/styles.css';
import '../styles/todo.css';
import TodoMfe from './TodoMfe';

function StandaloneHarness() {
  const [log, setLog] = useState('Ready');

  const data = useMemo<TodoMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: '__NAME__-standalone',
        locale: 'en-IN',
        permissions: ['todo:read', 'todo:write'],
      },
      feature: {
        title: 'Sample __TITLE__ MFE',
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
      <h1>__TITLE__ MFE standalone harness</h1>
      <p>Developers can run this package alone before mounting it in a host.</p>
      <TodoMfe data={data} />
      <p aria-live="polite">{log}</p>
    </main>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <StandaloneHarness />
  </StrictMode>,
);

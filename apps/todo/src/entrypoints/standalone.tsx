/**
 * Standalone harness — shared mfe-kit bootstrap only.
 * Styles are imported here for local/dev; federated hosts get styles via remote.tsx.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import TodoMfe from '../app/TodoMfe';
import type { TodoMfeProps } from '../contract';
import '@medmate/ui/styles.css';

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
    <StandaloneShell title="Todo MFE standalone harness">
      <TodoMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

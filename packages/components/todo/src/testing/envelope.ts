import { createMfeEnvelope } from '@medmate/test-utils';
import type { TodoFeatureData, TodoMfeProps } from '../contract';

export function createTodoEnvelope(
  feature: TodoFeatureData = {},
): TodoMfeProps['data'] {
  return createMfeEnvelope({
    feature,
    context: {
      permissions: ['todo:read', 'todo:write'],
    },
  });
}

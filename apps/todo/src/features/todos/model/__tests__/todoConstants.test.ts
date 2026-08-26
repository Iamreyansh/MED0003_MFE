import { describe, expect, it } from 'vitest';
import { TODO_COPY, TODO_FILTERS, TODO_STORE_NAME } from '../todoConstants';

describe('todoConstants', () => {
  it('exposes stable filter and copy values', () => {
    expect(TODO_FILTERS).toEqual(['all', 'active', 'completed']);
    expect(TODO_COPY.defaultTitle).toBe('Todo');
    expect(TODO_STORE_NAME).toBe('todo');
  });
});

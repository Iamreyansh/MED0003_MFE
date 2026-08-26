import { describe, expect, it } from 'vitest';
import { todoService } from '../todoService';

describe('todoService', () => {
  it('delegates domain operations', () => {
    const items = todoService.normalize([
      { id: '1', title: ' A ', completed: false },
    ]);
    expect(items[0]?.title).toBe('A');
    expect(todoService.filter(items, 'active')).toHaveLength(1);
    const added = todoService.add(items, 'B');
    expect(added).toHaveLength(2);
    expect(todoService.toggle(added, '1')[0]?.completed).toBe(true);
    expect(todoService.updateTitle(added, '1', 'AA')[0]?.title).toBe('AA');
    expect(todoService.remove(added, '1')).toHaveLength(1);
  });
});

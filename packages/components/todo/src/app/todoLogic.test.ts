import { describe, expect, it, vi } from 'vitest';
import {
  addTodo,
  createTodoId,
  deleteTodo,
  filterTodos,
  normalizeItems,
  toggleTodo,
  updateTodoTitle,
} from './todoLogic';

describe('todoLogic', () => {
  it('creates ids', () => {
    expect(createTodoId().length).toBeGreaterThan(4);
  });

  it('normalizes and filters items', () => {
    expect(normalizeItems(undefined)).toEqual([]);
    const items = normalizeItems([
      { id: '1', title: ' A ', completed: false },
      { id: '2', title: 'B', completed: true },
    ]);
    expect(items[0]?.title).toBe('A');
    expect(filterTodos(items, 'all')).toHaveLength(2);
    expect(filterTodos(items, 'active')).toHaveLength(1);
    expect(filterTodos(items, 'completed')).toHaveLength(1);
  });

  it('adds toggles updates and deletes', () => {
    const base = [{ id: '1', title: 'A', completed: false }];
    expect(addTodo(base, '   ')).toEqual(base);
    const added = addTodo(base, 'B');
    expect(added).toHaveLength(2);
    const toggled = toggleTodo(added, added[1]!.id);
    expect(toggled[1]?.completed).toBe(true);
    expect(updateTodoTitle(toggled, '1', '   ')).toEqual(toggled);
    expect(updateTodoTitle(toggled, '1', 'AA')[0]?.title).toBe('AA');
    expect(deleteTodo(toggled, '1')).toHaveLength(1);
  });

  it('falls back when randomUUID is unavailable', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: undefined,
    });
    expect(createTodoId().startsWith('todo-')).toBe(true);
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: original,
    });
    vi.restoreAllMocks();
  });
});

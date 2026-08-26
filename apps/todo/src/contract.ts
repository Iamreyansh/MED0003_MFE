import type { MfeProps } from '@medmate/contracts';

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type TodoFilter = 'all' | 'active' | 'completed';

export type TodoFeatureData = {
  title?: string;
  initialItems?: readonly TodoItem[];
  initialFilter?: TodoFilter;
  onChange?: (items: readonly TodoItem[]) => void;
};

export type TodoMfeProps = MfeProps<TodoFeatureData>;

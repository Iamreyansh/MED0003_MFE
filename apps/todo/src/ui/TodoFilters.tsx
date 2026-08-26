import { Button, Inline } from '@medmate/ui';
import type { TodoFilter } from '../contract';
import { TODO_COPY, TODO_FILTERS } from '../features/todos/model/todoConstants';

type TodoFiltersProps = {
  filter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
};

export function TodoFilters({ filter, onChange }: TodoFiltersProps) {
  return (
    <Inline role="group" aria-label={TODO_COPY.filterGroupLabel}>
      {TODO_FILTERS.map((value) => (
        <Button
          key={value}
          variant={filter === value ? 'primary' : 'ghost'}
          aria-pressed={filter === value}
          onClick={() => onChange(value)}
        >
          {value}
        </Button>
      ))}
    </Inline>
  );
}

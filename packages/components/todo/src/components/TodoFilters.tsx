import { Button } from '@medmate/ui';
import { TODO_COPY, TODO_FILTERS } from '../constants/todoConstants';
import type { TodoFilter } from '../types';

type TodoFiltersProps = {
  filter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
};

export function TodoFilters({ filter, onChange }: TodoFiltersProps) {
  return (
    <div
      className="mm-row"
      role="group"
      aria-label={TODO_COPY.filterGroupLabel}
    >
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
    </div>
  );
}

import { Box, cn } from '@medmate/ui';

export function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1.5 text-sm font-medium text-mm-text">
        {legend}
      </legend>
      <Box className="grid grid-cols-2 gap-1.5">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'relative flex min-h-9 cursor-pointer items-center justify-center rounded-lg border px-2 text-center text-sm transition-colors duration-mm',
                selected
                  ? 'border-mm-primary bg-mm-primary-soft text-mm-primary'
                  : 'border-mm-border bg-mm-surface text-mm-text hover:bg-mm-bg',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <span className="pointer-events-none">{option.label}</span>
            </label>
          );
        })}
      </Box>
    </fieldset>
  );
}

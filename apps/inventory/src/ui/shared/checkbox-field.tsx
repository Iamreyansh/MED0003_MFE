import { Flex, Label } from '@medmate/ui';

export function CheckboxField({
  id,
  name,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Flex align="center" gap="2">
      <input
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        className="size-4 cursor-pointer accent-mm-primary disabled:cursor-not-allowed"
        onChange={(event) => onChange(event.target.checked)}
      />
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
    </Flex>
  );
}

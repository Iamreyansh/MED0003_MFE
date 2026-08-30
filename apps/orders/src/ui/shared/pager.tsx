import { Button, Flex, Text } from '@medmate/ui';

const compact = 'min-h-10 px-2 text-sm';

export function Pager({
  page,
  hasNext,
  previousLabel,
  nextLabel,
  pageLabel,
  onPage,
  disabled,
}: {
  page: number;
  hasNext: boolean;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  if (page <= 1 && !hasNext) {
    return null;
  }
  return (
    <Flex align="center" gap="2" wrap>
      <Button
        type="button"
        variant="ghost"
        className={compact}
        disabled={disabled || page <= 1}
        onClick={() => onPage(page - 1)}
      >
        {previousLabel}
      </Button>
      <Text size="sm" tone="muted">
        {pageLabel} {page}
      </Text>
      <Button
        type="button"
        variant="ghost"
        className={compact}
        disabled={disabled || !hasNext}
        onClick={() => onPage(page + 1)}
      >
        {nextLabel}
      </Button>
    </Flex>
  );
}

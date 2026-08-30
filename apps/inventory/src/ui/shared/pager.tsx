import { Button, Flex, Text } from '@medmate/ui';

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
    <Flex align="center" gap="3" wrap>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled || page <= 1}
        onClick={() => onPage(page - 1)}
      >
        {previousLabel}
      </Button>
      <Text tone="muted">
        {pageLabel} {page}
      </Text>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled || !hasNext}
        onClick={() => onPage(page + 1)}
      >
        {nextLabel}
      </Button>
    </Flex>
  );
}

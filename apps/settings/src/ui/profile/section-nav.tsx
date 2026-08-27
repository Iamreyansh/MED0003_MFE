import { Box, Flex, cn } from '@medmate/ui';
import { PROFILE_NAV } from '../../lib/copy';

export function SectionNav({ hiddenIds = [] }: { hiddenIds?: string[] }) {
  const items = PROFILE_NAV.filter((item) => !hiddenIds.includes(item.id));
  return (
    <Box as="nav" aria-label="Profile sections" className="lg:sticky lg:top-4">
      <Flex
        gap="2"
        wrap
        className="mb-4 overflow-x-auto pb-1 lg:mb-0 lg:flex-col lg:flex-nowrap lg:overflow-visible"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'shrink-0 cursor-pointer rounded-full border border-mm-border bg-mm-surface px-3 py-1.5 font-mm text-sm font-semibold text-mm-text no-underline transition-colors duration-mm ease-mm hover:border-mm-primary hover:text-mm-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus lg:w-full lg:rounded-mm lg:px-3 lg:py-2',
            )}
          >
            {item.label}
          </a>
        ))}
      </Flex>
    </Box>
  );
}

import type { CompletenessPayload } from '@medmate/settings-contract';
import { completenessSectionId } from '@medmate/settings-contract';
import { Box, Flex, Text } from '@medmate/ui';
import { Gauge } from 'lucide-react';
import { SectionBlock } from '../shared/section-block';

function clampPct(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

export function CompletenessCard({
  completeness,
  fallbackPct,
  note,
}: {
  completeness: CompletenessPayload | null;
  fallbackPct: number;
  note?: string;
}) {
  const pct = clampPct(completeness?.completeness_pct ?? fallbackPct);
  const missing = completeness?.missing_fields ?? [];

  return (
    <SectionBlock
      id="section-completeness"
      title="Profile completeness"
      hint="Missing items jump to the matching section."
      icon={Gauge}
    >
      {note ? <Text className="mb-3">{note}</Text> : null}
      <Flex align="end" justify="between" gap="3" className="mb-3">
        <Box>
          <Text className="font-mm-heading text-mm-display font-semibold leading-none">
            {pct}%
          </Text>
          <Text size="sm" tone="muted" className="mt-1">
            {pct >= 100 ? 'Profile is complete' : 'complete'}
          </Text>
        </Box>
      </Flex>
      <Box
        role="progressbar"
        aria-label="Profile completeness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mb-4 h-2 overflow-hidden rounded-full bg-mm-border"
      >
        <svg className="h-full w-full" aria-hidden="true">
          <rect width={`${pct}%`} height="100%" className="fill-mm-primary" />
        </svg>
      </Box>
      {missing.length === 0 ? (
        <Text tone="muted">No missing fields on this profile.</Text>
      ) : (
        <Box
          as="ul"
          aria-label="Missing profile fields"
          className="m-0 flex list-none flex-wrap gap-2 p-0"
        >
          {missing.map((item) => (
            <Box as="li" key={item.field} className="min-w-0">
              <a
                href={`#${completenessSectionId(item.field)}`}
                className="inline-flex cursor-pointer items-center rounded-full border border-mm-border bg-mm-surface px-3 py-1 font-mm text-sm font-semibold text-mm-text no-underline transition-colors duration-mm ease-mm hover:border-mm-primary hover:text-mm-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus"
              >
                {item.label}
              </a>
              {item.action ? (
                <Text as="span" size="sm" tone="muted">
                  {' '}
                  — {item.action}
                </Text>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
    </SectionBlock>
  );
}

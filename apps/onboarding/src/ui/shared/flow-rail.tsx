import type { OnboardingScreen } from '@medmate/onboarding-contract';
import { Box, Flex, Grid, Text, VisuallyHidden, cn } from '@medmate/ui';
import { Check } from 'lucide-react';
import {
  FLOW_STEPS,
  flowIndex,
  flowState,
  type FlowState,
} from '../../lib/flow';

function suffix(state: FlowState): string {
  if (state === 'current') {
    return ' (current)';
  }
  if (state === 'done') {
    return ' (done)';
  }
  return '';
}

function StepMark({
  index,
  state,
  halo = false,
}: {
  index: number;
  state: FlowState;
  halo?: boolean;
}) {
  return (
    <Box
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-mm ease-mm',
        state === 'upcoming'
          ? 'border border-mm-border bg-mm-surface text-mm-muted'
          : 'bg-mm-primary text-mm-primary-contrast',
        halo && state === 'current'
          ? 'outline outline-2 outline-offset-2 outline-mm-primary'
          : undefined,
      )}
    >
      {state === 'done' ? <Check className="size-4" /> : index + 1}
    </Box>
  );
}

function HorizontalRail({ screen }: { screen: OnboardingScreen }) {
  const current = flowIndex(screen);
  const lastIndex = FLOW_STEPS.length - 1;

  return (
    <Grid as="ol" cols="4" gap="0" className="m-0 list-none p-0">
      {FLOW_STEPS.map((step, index) => {
        const state = flowState(index, current);
        return (
          <Box
            as="li"
            key={step.screen}
            aria-current={state === 'current' ? 'step' : undefined}
            className="min-w-0"
          >
            <Flex align="center" gap="0" className="w-full">
              <Box
                aria-hidden
                className={cn(
                  'h-px min-w-0 flex-1',
                  index === 0
                    ? 'bg-transparent'
                    : index <= current
                      ? 'bg-mm-primary'
                      : 'bg-mm-border',
                )}
              />
              <StepMark index={index} state={state} />
              <Box
                aria-hidden
                className={cn(
                  'h-px min-w-0 flex-1',
                  index === lastIndex
                    ? 'bg-transparent'
                    : index < current
                      ? 'bg-mm-primary'
                      : 'bg-mm-border',
                )}
              />
            </Flex>
            <Text
              as="span"
              className={cn(
                'relative mt-1.5 block truncate px-0.5 text-center text-xs font-semibold leading-tight',
                state === 'upcoming' ? 'text-mm-muted' : 'text-mm-text',
              )}
            >
              {step.label}
              {suffix(state) ? (
                <VisuallyHidden>{suffix(state)}</VisuallyHidden>
              ) : null}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
}

export function FlowRail({
  screen,
  orientation = 'vertical',
}: {
  screen: OnboardingScreen;
  orientation?: 'vertical' | 'horizontal';
}) {
  const current = flowIndex(screen);

  return (
    <Box as="nav" aria-label="Onboarding steps">
      {orientation === 'horizontal' ? (
        <HorizontalRail screen={screen} />
      ) : (
        <Flex as="ol" direction="column" gap="0" className="m-0 list-none p-0">
          {FLOW_STEPS.map((step, index) => {
            const state = flowState(index, current);
            const last = index === FLOW_STEPS.length - 1;
            return (
              <Flex
                as="li"
                key={step.screen}
                align="start"
                gap="2"
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <Flex
                  direction="column"
                  align="center"
                  className="w-7 shrink-0"
                >
                  <StepMark index={index} state={state} halo />
                  {last ? null : (
                    <Box
                      aria-hidden
                      className={cn(
                        'my-1 w-px min-h-4 flex-1',
                        index < current ? 'bg-mm-primary' : 'bg-mm-border',
                      )}
                    />
                  )}
                </Flex>
                <Box className={last ? 'min-w-0' : 'min-w-0 pb-4'}>
                  <Text
                    as="span"
                    className={cn(
                      'block font-semibold',
                      state === 'upcoming' ? 'text-mm-muted' : 'text-mm-text',
                    )}
                  >
                    {step.label}
                    {suffix(state)}
                  </Text>
                  <Text as="span" size="sm" tone="muted" className="block">
                    {step.hint}
                  </Text>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}

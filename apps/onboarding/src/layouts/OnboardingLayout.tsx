import type { OnboardingFeatureData } from '@medmate/onboarding-contract';
import { isOnboardingScreen } from '@medmate/onboarding-contract';
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  StatusMessage,
  Text,
} from '@medmate/ui';
import { Check, HeartPulse } from 'lucide-react';
import type { OnboardingMfeProps } from '../contract';
import { rootTestId, SCREEN_COPY } from '../lib/copy';
import { FLOW_STEPS, flowIndex } from '../lib/flow';
import { KycScreen } from '../ui/kyc';
import { RegisterScreen } from '../ui/register';
import { FlowRail } from '../ui/shared/flow-rail';
import { StatusScreen } from '../ui/status';
import { VerifyScreen } from '../ui/verify';

function BrandPane({ screen }: { screen: OnboardingFeatureData['screen'] }) {
  const copy = SCREEN_COPY[screen];
  return (
    <Flex
      direction="column"
      gap="8"
      className="h-full min-h-full border-r border-mm-border bg-mm-primary-soft p-6 xl:p-8"
    >
      <Flex align="center" gap="3">
        <Box className="flex size-11 shrink-0 items-center justify-center rounded-mm bg-mm-primary text-mm-primary-contrast">
          <HeartPulse className="size-6" aria-hidden />
        </Box>
        <Box className="min-w-0">
          <Text
            as="p"
            size="sm"
            className="font-semibold tracking-wide text-mm-primary"
          >
            {copy.eyebrow}
          </Text>
          <Text size="sm" tone="muted">
            {copy.brandLine}
          </Text>
        </Box>
      </Flex>
      <Box>
        <Text as="p" size="sm" className="mb-4 font-semibold text-mm-text">
          Path to go-live
        </Text>
        <FlowRail screen={screen} />
      </Box>
      <Flex direction="column" gap="4">
        {copy.trust.map((item) => (
          <Flex key={item.title} align="start" gap="3">
            <Box className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mm-primary text-mm-primary-contrast">
              <Check className="size-3" aria-hidden />
            </Box>
            <Box className="min-w-0">
              <Text as="p" className="font-semibold">
                {item.title}
              </Text>
              <Text size="sm" tone="muted">
                {item.body}
              </Text>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

function ScreenFor({
  feature,
  onNavigate,
}: {
  feature: OnboardingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  switch (feature.screen) {
    case 'register':
      return <RegisterScreen feature={feature} onNavigate={onNavigate} />;
    case 'verify':
      return <VerifyScreen feature={feature} />;
    case 'status':
      return <StatusScreen feature={feature} onNavigate={onNavigate} />;
    case 'kyc':
      return <KycScreen feature={feature} onNavigate={onNavigate} />;
  }
}

export function OnboardingLayout({ data }: OnboardingMfeProps) {
  const feature = data.feature;
  if (!isOnboardingScreen(feature.screen)) {
    return (
      <StatusMessage tone="error">Unknown onboarding screen.</StatusMessage>
    );
  }
  const copy = SCREEN_COPY[feature.screen];
  const testId = rootTestId(feature.screen);
  const onNavigate = data.capabilities?.navigate;
  const step = flowIndex(feature.screen) + 1;

  return (
    <Grid
      data-testid={testId}
      gap="0"
      className="min-h-[min(36rem,80dvh)] overflow-hidden rounded-mm border border-mm-border bg-mm-surface lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]"
    >
      <Box className="hidden h-full min-h-full lg:block">
        <BrandPane screen={feature.screen} />
      </Box>
      <Flex align="start" className="p-5 sm:p-6 lg:p-8 xl:p-10">
        <Box data-testid="onboarding-mfe" className={'w-full'}>
          <Box as="header" className="mb-6">
            <Text
              as="p"
              size="sm"
              className="mb-3 font-semibold tracking-wide text-mm-primary lg:hidden"
            >
              {copy.eyebrow}
            </Text>
            <Box className="mb-5 lg:hidden">
              <FlowRail screen={feature.screen} orientation="horizontal" />
            </Box>
            <Flex align="start" justify="between" gap="3">
              <Box className="min-w-0">
                <Heading level={1} className="text-mm-text">
                  {copy.title}
                </Heading>
                <Text tone="muted" className="mt-2">
                  {copy.helper}
                </Text>
              </Box>
              <Badge
                tone="primary"
                className="mt-1 hidden shrink-0 lg:inline-flex"
              >
                Step {step} of {FLOW_STEPS.length}
              </Badge>
            </Flex>
          </Box>
          <ScreenFor feature={feature} onNavigate={onNavigate} />
        </Box>
      </Flex>
    </Grid>
  );
}

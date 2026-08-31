import type { AuthFeatureData } from '@medmate/auth-contract';
import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  StatusMessage,
  Text,
} from '@medmate/ui';
import { HeartPulse } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { AuthMfeProps } from '../contract';
import { resolveCopy, rootTestId } from '../lib/copy';
import { bindTimelineVisibility, fadeUp } from '../lib/motion';
import { AdminLoginScreen } from '../ui/admin-login';
import { OtpLoginScreen } from '../ui/otp-login';
import { PharmacyForgotScreen } from '../ui/pharmacy-forgot';
import { PharmacyLoginScreen } from '../ui/pharmacy-login';
import { PosLoginScreen } from '../ui/pos-login';
import { RegisterOtpScreen } from '../ui/register-otp';
import { SessionsScreen } from '../ui/sessions';
import { TokenPasswordScreen } from '../ui/token-password';

function BrandPane({
  eyebrow,
  brandLine,
}: {
  eyebrow: string;
  brandLine: string;
}) {
  return (
    <Flex
      direction="column"
      justify="end"
      gap="3"
      className="hidden h-full min-h-full bg-mm-primary-soft p-8 lg:flex"
    >
      <Box className="mb-auto flex size-11 items-center justify-center rounded-mm bg-mm-primary text-mm-primary-contrast">
        <HeartPulse className="size-6" aria-hidden />
      </Box>
      <Text
        as="p"
        size="sm"
        className="font-semibold tracking-wide text-mm-primary"
      >
        {eyebrow}
      </Text>
      <Text tone="muted">{brandLine}</Text>
    </Flex>
  );
}

function ScreenFor({
  feature,
  copy,
  onNavigate,
}: {
  feature: AuthFeatureData;
  copy: ReturnType<typeof resolveCopy>;
  onNavigate?: (path: string) => void;
}) {
  switch (feature.portalType) {
    case 'pharmacy':
      return (
        <PharmacyLoginScreen
          feature={feature}
          submitLabel={copy.submitLabel}
          identifierLabel={copy.identifierLabel}
          passwordLabel={copy.passwordLabel}
          posLoginHref={feature.links?.posLogin}
          onNavigate={onNavigate}
        />
      );
    case 'pos':
      return (
        <PosLoginScreen feature={feature} submitLabel={copy.submitLabel} />
      );
    case 'customer-otp':
    case 'rider-otp':
      return (
        <OtpLoginScreen
          feature={feature}
          portalType={feature.portalType}
          identifierLabel={copy.identifierLabel}
          sendLabel={copy.submitLabel}
        />
      );
    case 'admin':
      return (
        <AdminLoginScreen
          feature={feature}
          identifierLabel={copy.identifierLabel}
          passwordLabel={copy.passwordLabel}
          submitLabel={copy.submitLabel}
        />
      );
    case 'admin-invite':
    case 'admin-reset':
    case 'pharmacy-reset':
      return (
        <TokenPasswordScreen
          feature={feature}
          portalType={feature.portalType}
          tokenLabel={copy.identifierLabel}
          passwordLabel={copy.passwordLabel}
          submitLabel={copy.submitLabel}
        />
      );
    case 'pharmacy-forgot':
      return (
        <PharmacyForgotScreen
          feature={feature}
          submitLabel={copy.submitLabel}
          identifierLabel={copy.identifierLabel}
          onNavigate={onNavigate}
        />
      );
    case 'pharmacy-register-otp':
      return (
        <RegisterOtpScreen
          feature={feature}
          identifierLabel={copy.identifierLabel}
          sendLabel={copy.submitLabel}
        />
      );
    case 'sessions':
      return <SessionsScreen feature={feature} />;
    default:
      return (
        <StatusMessage tone="error">Unknown auth portal type.</StatusMessage>
      );
  }
}

export function AuthShell({ data }: AuthMfeProps) {
  const feature = data.feature;
  const copy = resolveCopy(feature.portalType, feature.copy);
  const cardRef = useRef<HTMLDivElement>(null);
  const split =
    feature.portalType !== 'pos' && feature.portalType !== 'sessions';
  const testId = rootTestId(feature.portalType);

  useLayoutEffect(() => {
    fadeUp(cardRef.current);
  }, []);

  useEffect(() => bindTimelineVisibility(), []);

  const heading = (
    <Box as="header" className="mb-6">
      <Text
        as="p"
        size="sm"
        className="font-semibold tracking-wide text-mm-primary lg:hidden"
      >
        {copy.eyebrow}
      </Text>
      <Heading level={1} className="mt-1 text-mm-text">
        {copy.title}
      </Heading>
      <Text tone="muted" className="mt-2">
        {copy.helper}
      </Text>
    </Box>
  );

  const screen = (
    <ScreenFor
      feature={feature}
      copy={copy}
      onNavigate={data.capabilities?.navigate}
    />
  );

  if (!split) {
    return (
      <Box data-testid={testId} className="font-mm text-mm-text">
        <Box
          data-testid="auth-mfe"
          ref={cardRef}
          className={
            feature.portalType === 'pos' ? 'mx-auto w-full max-w-md' : ''
          }
        >
          {heading}
          {feature.portalType === 'pos' ? (
            <Card className="p-6 shadow-sm">{screen}</Card>
          ) : (
            screen
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Grid
      data-testid={testId}
      className="min-h-[min(32rem,80dvh)] overflow-hidden rounded-mm border border-mm-border bg-mm-surface lg:grid-cols-12"
    >
      <Box className="h-full lg:col-span-5">
        <BrandPane eyebrow={copy.eyebrow} brandLine={copy.brandLine} />
      </Box>
      <Flex align="center" className="p-6 lg:col-span-7">
        <Box ref={cardRef} data-testid="auth-mfe" className="w-full max-w-md">
          {heading}
          {screen}
        </Box>
      </Flex>
    </Grid>
  );
}

import type { SettingsFeatureData } from '@medmate/settings-contract';
import { STOREFRONT_EVENT } from '@medmate/settings-contract';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
  StatusMessage,
  Text,
} from '@medmate/ui';
import { Pause, Store } from 'lucide-react';
import { useState } from 'react';
import { storefrontStatusLabel } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';

export function StorefrontScreen({
  feature,
  pharmacyName,
  onEmit,
}: {
  feature: SettingsFeatureData;
  pharmacyName: string;
  onEmit?: (event: string, payload?: unknown) => void;
}) {
  const canWrite = Boolean(feature.canWrite);
  const knownOnline = feature.isOnline;
  const override = Boolean(feature.adminForcedOffline);
  const suspended = feature.pharmacyStatus === 'SUSPENDED';
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);
  const [confirmOffline, setConfirmOffline] = useState(false);
  const [lockedOverride, setLockedOverride] = useState(override);

  const writeBlocked =
    !canWrite || lockedOverride || suspended || feature.disabled;
  const statusWord = storefrontStatusLabel({
    pharmacyStatus: suspended ? 'SUSPENDED' : feature.pharmacyStatus,
    adminForcedOffline: lockedOverride,
    isOnline: knownOnline,
  });
  const online = statusWord === 'Online';
  const StatusIcon = online ? Store : Pause;

  async function patch(isOnline: boolean) {
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'storefront',
      action: 'save',
      values: { is_online: isOnline },
    });
    setBusy(false);
    if (!result.ok) {
      if (result.code === 'ADMIN_OVERRIDE_ACTIVE') {
        setLockedOverride(true);
      }
      setError(
        result.formError ?? result.code ?? 'Unable to update storefront.',
      );
      return;
    }
    onEmit?.(STOREFRONT_EVENT, {
      is_online: result.storefront?.is_online ?? isOnline,
      admin_forced_offline: result.storefront?.admin_forced_offline ?? false,
    });
  }

  const consequence =
    knownOnline === true
      ? 'Customers can find this shop on the marketplace.'
      : knownOnline === false
        ? 'Hidden from the marketplace until you go online again.'
        : 'Current marketplace status is unknown until you set it.';

  return (
    <Stack gap="4" data-testid="storefront-panel">
      {lockedOverride ? (
        <Alert data-testid="storefront-override">
          Admin has forced this pharmacy offline. Contact support.
        </Alert>
      ) : null}
      {suspended ? (
        <Alert data-testid="storefront-suspended">
          Suspended pharmacies cannot go online.
        </Alert>
      ) : null}
      <FormBanner message={error} testId="storefront-error" />
      <Box
        as="section"
        aria-label={statusWord}
        className="rounded-mm border border-mm-border bg-mm-surface p-5 shadow-sm"
      >
        <Flex align="start" gap="4" wrap>
          <Box
            className={
              online
                ? 'flex size-12 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary'
                : 'flex size-12 shrink-0 items-center justify-center rounded-mm bg-mm-bg text-mm-muted'
            }
          >
            <StatusIcon className="size-6" aria-hidden />
          </Box>
          <Box className="min-w-0 flex-1">
            <Text className="font-mm-heading text-mm-display font-semibold leading-none">
              {statusWord}
            </Text>
            <Text tone="muted" className="mt-2">
              {consequence}
            </Text>
            {canWrite ? (
              <Flex gap="3" wrap className="mt-4">
                <Button
                  type="button"
                  variant={knownOnline === true ? 'ghost' : 'primary'}
                  aria-pressed={knownOnline === true}
                  disabled={writeBlocked || busy}
                  onClick={() => {
                    void patch(true);
                  }}
                >
                  Set shop online
                </Button>
                <Button
                  type="button"
                  variant={knownOnline === false ? 'ghost' : 'primary'}
                  aria-pressed={knownOnline === false}
                  disabled={writeBlocked || busy}
                  onClick={() => setConfirmOffline(true)}
                >
                  Set shop offline
                </Button>
              </Flex>
            ) : (
              <StatusMessage className="mt-4">
                Staff can view storefront status. Only the owner can change it.
              </StatusMessage>
            )}
          </Box>
        </Flex>
      </Box>
      <Dialog
        open={confirmOffline}
        onOpenChange={(open) => setConfirmOffline(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take {pharmacyName} offline?</DialogTitle>
            <DialogDescription>
              Customers will not see this shop on the marketplace until you go
              online again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOffline(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmOffline(false);
                void patch(false);
              }}
            >
              Take offline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

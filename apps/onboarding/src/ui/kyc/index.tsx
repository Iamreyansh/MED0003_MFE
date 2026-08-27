import type {
  KycDocumentRow,
  KycListPayload,
  OnboardingFeatureData,
} from '@medmate/onboarding-contract';
import { KYC_DOCUMENT_TYPES } from '@medmate/onboarding-contract';
import {
  Badge,
  Box,
  Button,
  Card,
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
  TextField,
} from '@medmate/ui';
import { FileText, FileUp, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  documentTypeLabel,
  isAttentionStatus,
  statusLabel,
} from '../../lib/copy';
import { formatIst } from '../../lib/focus';
import { FileDrop } from '../shared/file-drop';
import { SelectField } from '../shared/select-field';

const EXPIRY_TYPES = new Set(['DRUG_LICENCE', 'FSSAI_CERTIFICATE']);
const DELETABLE = new Set(['UPLOADED', 'REJECTED']);

function DocumentCard({
  doc,
  canWrite,
  onDelete,
}: {
  doc: KycDocumentRow;
  canWrite: boolean;
  onDelete: (doc: KycDocumentRow) => void;
}) {
  const attention = isAttentionStatus(doc.status) || doc.status === 'REJECTED';
  return (
    <Card className="p-4">
      <Flex align="start" justify="between" gap="3" wrap>
        <Flex align="start" gap="3" className="min-w-0">
          <Box className="flex size-10 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
            <FileText className="size-5" aria-hidden />
          </Box>
          <Box className="min-w-0">
            <Text className="font-semibold">
              {documentTypeLabel(doc.document_type)}
            </Text>
            <Text size="sm" tone="muted">
              {formatIst(doc.uploaded_at)}
            </Text>
            {doc.rejection_reason ? (
              <Text size="sm" tone="error" className="mt-1">
                {doc.rejection_reason}
              </Text>
            ) : null}
          </Box>
        </Flex>
        <Flex align="center" gap="2">
          <Badge
            tone={attention ? 'default' : 'primary'}
            className={attention ? 'bg-mm-danger/10 text-mm-danger' : undefined}
          >
            {statusLabel(doc.status)}
          </Badge>
          {canWrite ? (
            DELETABLE.has(doc.status) ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onDelete(doc)}
              >
                <Trash2 className="mr-1 size-4" aria-hidden />
                Delete
              </Button>
            ) : (
              <Text size="sm" tone="muted">
                Locked
              </Text>
            )
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
}

export function KycScreen({
  feature,
  onNavigate,
}: {
  feature: OnboardingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canWrite = Boolean(feature.canWriteKyc);
  const [payload, setPayload] = useState<KycListPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState('GSTIN_CERTIFICATE');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<KycDocumentRow | null>(
    null,
  );

  async function loadList(): Promise<void> {
    setLoading(true);
    const result = await feature.onSubmit({ screen: 'kyc', action: 'list' });
    setLoading(false);
    if (!result.ok) {
      setError(result.formError ?? 'Unable to load KYC documents.');
      return;
    }
    setError(null);
    setPayload(result.documents ?? { documents: [] });
    setMissing(result.documents?.missing_documents ?? []);
  }

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature.screen]);

  const docs = payload?.documents ?? [];
  const needsExpiry = EXPIRY_TYPES.has(documentType);

  return (
    <Stack gap="4" data-testid="onboarding-kyc">
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {missing.length > 0 ? (
        <Card className="p-4">
          <StatusMessage tone="info">
            Still needed: {missing.map(documentTypeLabel).join(', ')}
          </StatusMessage>
          <Flex gap="2" wrap className="mt-3">
            {missing.map((type) => (
              <Badge key={type}>{documentTypeLabel(type)}</Badge>
            ))}
          </Flex>
        </Card>
      ) : null}
      {loading && !payload ? (
        <StatusMessage>Loading documents…</StatusMessage>
      ) : null}
      {docs.length === 0 && payload ? (
        <Card className="p-6">
          <Flex
            direction="column"
            align="center"
            gap="2"
            className="text-center"
          >
            <Box className="flex size-12 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
              <FileText className="size-6" aria-hidden />
            </Box>
            <StatusMessage>No documents uploaded yet.</StatusMessage>
            <Text size="sm" tone="muted">
              Add GSTIN, drug licence, and PAN. HQ reviews the pack before
              go-live.
            </Text>
          </Flex>
        </Card>
      ) : null}
      {docs.length > 0 ? (
        <Stack gap="3">
          {docs.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              doc={doc}
              canWrite={canWrite}
              onDelete={setPendingDelete}
            />
          ))}
        </Stack>
      ) : null}
      {canWrite ? (
        <Card className="p-5">
          <Text className="mb-1 font-semibold">Add a document</Text>
          <Text size="sm" tone="muted" className="mb-4">
            One file per type. PDF, JPG, or PNG.
          </Text>
          <Stack gap="3">
            <SelectField
              label="Document type"
              name="document_type"
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              disabled={feature.disabled || busy}
            >
              {KYC_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {documentTypeLabel(type)}
                </option>
              ))}
            </SelectField>
            {needsExpiry ? (
              <TextField
                label="Expiry date"
                name="expiry_date"
                type="date"
                value={expiryDate}
                onChange={(event) => setExpiryDate(event.target.value)}
                disabled={feature.disabled || busy}
              />
            ) : null}
            <FileDrop
              key={fileKey}
              id="kyc-file"
              fileName={file?.name}
              disabled={feature.disabled || busy}
              onChange={setFile}
            />
            <Button
              type="button"
              disabled={!file || busy || feature.disabled}
              onClick={() => {
                void (async () => {
                  const selected = file as File;
                  setBusy(true);
                  const result = await feature.onSubmit({
                    screen: 'kyc',
                    action: 'upload',
                    values: {
                      document_type: documentType,
                      file: selected,
                      expiry_date: needsExpiry
                        ? expiryDate || undefined
                        : undefined,
                    },
                  });
                  setBusy(false);
                  if (!result.ok) {
                    setError(result.formError ?? 'Upload failed.');
                    return;
                  }
                  setError(null);
                  setFile(null);
                  setFileKey((key) => key + 1);
                  setPayload(result.documents ?? payload);
                  setMissing(result.documents?.missing_documents ?? []);
                })();
              }}
            >
              {busy ? (
                'Uploading…'
              ) : (
                <>
                  <FileUp className="mr-2 size-4" aria-hidden />
                  Upload document
                </>
              )}
            </Button>
            <Button
              type="button"
              disabled={busy || feature.disabled || !payload?.ready_to_submit}
              onClick={() => setConfirmSubmit(true)}
            >
              Submit KYC pack
            </Button>
          </Stack>
        </Card>
      ) : (
        <StatusMessage>
          Staff can view the pack. Only the owner can upload or submit.
        </StatusMessage>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onNavigate?.('/onboarding/status')}
      >
        Back to status
      </Button>
      <Dialog
        open={confirmSubmit}
        onOpenChange={(open) => setConfirmSubmit(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit KYC for review?</DialogTitle>
            <DialogDescription>
              HQ will review the uploaded pack. You cannot edit verified files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmSubmit(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  const result = await feature.onSubmit({
                    screen: 'kyc',
                    action: 'submit',
                  });
                  setBusy(false);
                  setConfirmSubmit(false);
                  if (!result.ok) {
                    setError(result.formError ?? 'Submit failed.');
                    setMissing(result.missingTypes ?? []);
                    return;
                  }
                  onNavigate?.('/onboarding/status');
                })();
              }}
            >
              {busy ? 'Submitting…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              Only uploaded or rejected files can be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => {
                void (async () => {
                  const doc = pendingDelete as KycDocumentRow;
                  setBusy(true);
                  const result = await feature.onSubmit({
                    screen: 'kyc',
                    action: 'delete',
                    values: { document_id: doc.document_id },
                  });
                  setBusy(false);
                  setPendingDelete(null);
                  if (!result.ok) {
                    setError(result.formError ?? 'Delete failed.');
                    return;
                  }
                  setPayload(result.documents ?? payload);
                  setMissing(result.documents?.missing_documents ?? []);
                })();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

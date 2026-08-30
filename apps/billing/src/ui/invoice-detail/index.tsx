import type {
  BillingFeatureData,
  InvoiceDetail,
  ShareChannel,
} from '@medmate/billing-contract';
import {
  formatInr,
  isInvoiceNotFound,
  SHARE_CHANNELS,
} from '@medmate/billing-contract';
import {
  Badge,
  Button,
  Flex,
  Grid,
  Spinner,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextField,
} from '@medmate/ui';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DETAIL_COPY, dash, errorText, listOf } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';

const compactBtn = 'min-h-10 px-2 text-sm';

export function InvoiceDetailScreen({
  feature,
}: {
  feature: BillingFeatureData;
}) {
  const invoiceId = feature.invoiceId ?? '';
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [channel, setChannel] = useState<ShareChannel>('WHATSAPP');
  const [recipient, setRecipient] = useState('');
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);

  const load = useCallback(async () => {
    if (!invoiceId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setNotFound(false);
    const result = await feature.onSubmit({
      screen: 'invoice-detail',
      action: 'load',
      values: { invoiceId },
    });
    setLoading(false);
    if (!result.ok) {
      if (isInvoiceNotFound(result.code)) {
        setNotFound(true);
        setInvoice(null);
        return;
      }
      setError(errorText(result, 'Unable to load invoice.'));
      return;
    }
    setInvoice(result.invoice ?? null);
  }, [feature, invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function downloadPdf() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'invoice-detail',
      action: 'pdf',
      values: { invoiceId },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
    }
  }

  async function share() {
    setBusy(true);
    setShared(false);
    const result = await feature.onSubmit({
      screen: 'invoice-detail',
      action: 'share',
      values: {
        invoiceId,
        channel,
        recipient_phone_or_email: recipient,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setShared(true);
  }

  if (loading) {
    return <Spinner size="sm" data-testid="invoice-detail-loading" />;
  }
  if (notFound) {
    return (
      <Text data-testid="invoice-not-found" role="status">
        {DETAIL_COPY.notFound}
      </Text>
    );
  }

  const lines = listOf(invoice?.line_items);
  const slabs = listOf(invoice?.gst_breakdown);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="invoice-detail-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {DETAIL_COPY.retry}
        </Button>
      ) : null}
      <Flex
        align="center"
        justify="between"
        gap="3"
        wrap
        className="rounded-mm border border-mm-border bg-mm-surface px-3 py-2"
      >
        <Flex align="center" gap="2" wrap className="min-w-0">
          <Badge data-testid="invoice-number" tone="primary">
            {dash(invoice?.invoice_number)}
          </Badge>
          <StatusBadge status={invoice?.payment_status} />
          <Text data-testid="invoice-customer" size="sm" tone="muted">
            {DETAIL_COPY.customer}: {dash(invoice?.customer?.name)}
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Text className="font-mm-heading font-semibold tabular-nums">
            {formatInr(invoice?.grand_total)}
          </Text>
          <Button
            type="button"
            className={compactBtn}
            disabled={busy}
            onClick={() => void downloadPdf()}
          >
            {DETAIL_COPY.downloadPdf}
          </Button>
        </Flex>
      </Flex>
      <Grid gap="3" className="grid-cols-1 md:grid-cols-[minmax(0,1fr)_18rem]">
        <SectionBlock
          id="section-lines"
          title={DETAIL_COPY.lines}
          icon={FileText}
        >
          <Table aria-label={DETAIL_COPY.lines} data-testid="invoice-lines">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={`${line.product_name ?? 'line'}-${index}`}>
                  <TableCell className="max-w-[14rem] truncate">
                    {dash(line.product_name)}
                  </TableCell>
                  <TableCell>{dash(line.batch_number)}</TableCell>
                  <TableCell>{dash(line.quantity)}</TableCell>
                  <TableCell>{formatInr(line.gst_amount)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(line.line_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBlock>
        <Stack gap="3">
          <SectionBlock id="section-gst" title={DETAIL_COPY.gst}>
            <Table aria-label={DETAIL_COPY.gst} data-testid="invoice-gst">
              <TableHeader>
                <TableRow>
                  <TableHead>Slab</TableHead>
                  <TableHead>Taxable</TableHead>
                  <TableHead>CGST</TableHead>
                  <TableHead>SGST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slabs.map((slab, index) => (
                  <TableRow key={`${slab.slab ?? 'slab'}-${index}`}>
                    <TableCell>{dash(slab.slab)}</TableCell>
                    <TableCell>{formatInr(slab.taxable_amount)}</TableCell>
                    <TableCell>{formatInr(slab.cgst)}</TableCell>
                    <TableCell>{formatInr(slab.sgst)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionBlock>
          <SectionBlock id="section-share" title={DETAIL_COPY.share}>
            <Stack gap="2">
              <SelectField
                label={DETAIL_COPY.channel}
                name="share_channel"
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as ShareChannel)
                }
              >
                {SHARE_CHANNELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={DETAIL_COPY.recipient}
                name="recipient_phone_or_email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
              />
              <Button
                type="button"
                className={compactBtn}
                disabled={busy}
                onClick={() => void share()}
              >
                {DETAIL_COPY.send}
              </Button>
              {shared ? (
                <Text data-testid="invoice-shared" role="status">
                  Shared
                </Text>
              ) : null}
            </Stack>
          </SectionBlock>
        </Stack>
      </Grid>
    </Stack>
  );
}

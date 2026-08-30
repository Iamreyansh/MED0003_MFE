import type { PosCartItem } from '@medmate/pos-contract';
import { formatInr } from '@medmate/pos-contract';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@medmate/ui';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { COUNTER_COPY } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { SectionBlock } from '../shared/section-block';
import { QtyStepper } from './qty-stepper';

export function CartPanel({
  lines,
  editQty,
  busy,
  onEditQty,
  onCommitQty,
  onStepQty,
  onRemove,
  onClear,
}: {
  lines: PosCartItem[];
  editQty: Record<string, string>;
  busy: boolean;
  onEditQty: (itemId: string, value: string) => void;
  onCommitQty: (itemId: string, original: number | null | undefined) => void;
  onStepQty: (
    itemId: string,
    original: number | null | undefined,
    delta: 1 | -1,
  ) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
}) {
  return (
    <SectionBlock
      id="pos-cart"
      title={COUNTER_COPY.cart}
      hint={COUNTER_COPY.cartHint}
      icon={ShoppingCart}
      density="compact"
      headerEnd={
        lines.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            className="min-h-9 px-2 text-sm"
            onClick={onClear}
          >
            {COUNTER_COPY.clear}
          </Button>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <EmptyState icon={ShoppingCart} testId="pos-cart-empty">
          {COUNTER_COPY.emptyCart}
        </EmptyState>
      ) : (
        <Table aria-label={COUNTER_COPY.cart} data-testid="pos-cart-table">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>{COUNTER_COPY.quantity}</TableHead>
              <TableHead>Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.item_id}>
                <TableCell>
                  <Text>{line.product_name ?? 'Item'}</Text>
                  {line.batch_number || line.expiry_date ? (
                    <Text size="sm" tone="muted">
                      {[line.batch_number, line.expiry_date]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  ) : null}
                </TableCell>
                <TableCell>
                  <QtyStepper
                    id={`pos-qty-${line.item_id}`}
                    value={editQty[line.item_id] ?? String(line.quantity ?? '')}
                    disabled={busy}
                    onChange={(value) => onEditQty(line.item_id, value)}
                    onCommit={() => onCommitQty(line.item_id, line.quantity)}
                    onStep={(delta) =>
                      onStepQty(line.item_id, line.quantity, delta)
                    }
                  />
                </TableCell>
                <TableCell>{formatInr(line.line_total)}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 min-w-9 px-2"
                    aria-label={COUNTER_COPY.remove}
                    onClick={() => onRemove(line.item_id)}
                    disabled={busy}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionBlock>
  );
}

import { Inbox } from 'lucide-react';
import { HOME_COPY } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';

export function OrdersHomeScreen() {
  return (
    <EmptyState icon={Inbox} testId="orders-home-guidance">
      {HOME_COPY.guidance}
    </EmptyState>
  );
}

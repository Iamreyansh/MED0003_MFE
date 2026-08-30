import type { SupportTicket } from '@medmate/support-contract';
import { isResolvedStatus } from '@medmate/support-contract';

export function canShowCreatorActions(
  ticket: SupportTicket | null,
  userId: string | null | undefined,
): boolean {
  if (!ticket) {
    return false;
  }
  const customerId =
    typeof ticket.customer_id === 'string' ? ticket.customer_id : '';
  if (!customerId || !userId) {
    return isResolvedStatus(ticket.status);
  }
  return customerId === userId && isResolvedStatus(ticket.status);
}

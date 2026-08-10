import { assertMfeDataEnvelope, type MfeProps } from '@medmate/contracts';
import { Card } from '@medmate/ui';

export type __PASCAL__Feature = {
  title?: string;
  message?: string;
};

export default function __PASCAL__Mfe({ data }: MfeProps<__PASCAL__Feature>) {
  assertMfeDataEnvelope(data);
  const title = data.feature.title ?? '__TITLE__';
  const message =
    data.feature.message ??
    'Replace this stub with your micro-frontend UI. All props arrive via data.';

  return (
    <Card title={title} data-testid="__NAME__-mfe">
      <p>{message}</p>
      <p>
        Host: {data.context.hostId} · Locale: {data.context.locale}
      </p>
    </Card>
  );
}

import { assertMfeDataEnvelope, type MfeProps } from '@medmate/contracts';
import { Card } from '@medmate/ui';
import '@medmate/ui/styles.css';
import { DEFAULT_TITLE } from '../constants/mfeConstants';
import '../styles/mfe.css';

type Feature = { title?: string };
type Props = MfeProps<Feature>;

export default function __PASCAL__Mfe({ data }: Props) {
  assertMfeDataEnvelope(data);
  const title = data.feature.title ?? DEFAULT_TITLE;

  return (
    <Card title={title} data-testid="__NAME__-mfe">
      <p>
        Host: {data.context.hostId} · Locale: {data.context.locale}
      </p>
      <p>
        Implement UI under <code>src/components</code>. Put domain logic in{' '}
        <code>services</code>/<code>utils</code>, shared strings in{' '}
        <code>constants</code>, and optional Redux under <code>store</code>.
      </p>
    </Card>
  );
}

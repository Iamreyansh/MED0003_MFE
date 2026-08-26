import { assertMfeDataEnvelope } from '@medmate/contracts';
import { __PASCAL__Layout } from '../layouts/__PASCAL__Layout';
import type { __PASCAL__MfeProps } from '../contract';

export default function __PASCAL__Mfe({ data }: __PASCAL__MfeProps) {
  assertMfeDataEnvelope(data);
  return <__PASCAL__Layout data={data} />;
}

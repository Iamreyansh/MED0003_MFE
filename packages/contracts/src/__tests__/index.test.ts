import { describe, expect, it } from 'vitest';
import {
  MFE_CONTRACT_VERSION,
  assertMfeDataEnvelope,
  isSupportedContractVersion,
} from '../index';

describe('contracts', () => {
  it('accepts the current contract version', () => {
    expect(isSupportedContractVersion(MFE_CONTRACT_VERSION)).toBe(true);
    expect(isSupportedContractVersion('0.0.0')).toBe(false);
  });

  it('validates a well-formed envelope', () => {
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: {
          hostId: 'pharmacy-portal',
          locale: 'en-IN',
          permissions: ['todo:read'],
        },
        feature: { title: 'Demo' },
      }),
    ).not.toThrow();
  });

  it('rejects invalid envelopes', () => {
    expect(() => assertMfeDataEnvelope(null)).toThrow(/object/);
    expect(() => assertMfeDataEnvelope({})).toThrow(/contractVersion/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: '9.9.9',
        context: { hostId: 'x', locale: 'en', permissions: [] },
        feature: {},
      }),
    ).toThrow(/Unsupported/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
      }),
    ).toThrow(/context/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { hostId: 'x', locale: 'en' },
      }),
    ).toThrow(/permissions/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { locale: 'en', permissions: [] },
      }),
    ).toThrow(/hostId/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { hostId: 'x', permissions: [] },
      }),
    ).toThrow(/locale/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { hostId: 'x', locale: 'en', permissions: [] },
      }),
    ).toThrow(/feature/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { hostId: '', locale: 'en', permissions: [] },
        feature: {},
      }),
    ).toThrow(/hostId/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { hostId: 'x', locale: '', permissions: [] },
        feature: {},
      }),
    ).toThrow(/locale/);
    expect(() =>
      assertMfeDataEnvelope({
        contractVersion: MFE_CONTRACT_VERSION,
        context: { hostId: 'x', locale: 'en', permissions: [1] },
        feature: {},
      } as never),
    ).toThrow(/string codes/);
  });
});

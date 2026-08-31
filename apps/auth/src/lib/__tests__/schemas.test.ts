import { describe, expect, it } from 'vitest';
import {
  adminSchema,
  emailOtpRequestSchema,
  mfaSchema,
  otpSchema,
  pharmacySchema,
  forgotSchema,
  phoneSchema,
  posSchema,
  tokenPasswordSchema,
} from '../schemas';

describe('auth schemas', () => {
  it('accepts valid pharmacy credentials', async () => {
    await expect(
      pharmacySchema.validate({
        identifier: 'priya@srirama.in',
        password: 'Secret123!',
      }),
    ).resolves.toBeTruthy();
  });

  it('rejects invalid pharmacy identifiers', async () => {
    await expect(
      pharmacySchema.validate({ identifier: '', password: 'x' }),
    ).rejects.toThrow(/email or \+91/);
    await expect(
      pharmacySchema.validate({ identifier: 'nope', password: 'x' }),
    ).rejects.toThrow(/Use an email/);
    await expect(
      pharmacySchema.validate({
        identifier: 'priya@srirama.in',
        password: '',
      }),
    ).rejects.toThrow(/password/);
    await expect(
      forgotSchema.validate({ identifier: 'priya@srirama.in' }),
    ).resolves.toBeTruthy();
    await expect(forgotSchema.validate({ identifier: '' })).rejects.toThrow(
      /email or \+91/,
    );
  });

  it('validates pos, phone, otp, admin, and token forms', async () => {
    await expect(
      posSchema.validate({
        pharmacyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        staffId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        pin: '1234',
      }),
    ).resolves.toBeTruthy();
    await expect(
      posSchema.validate({ pharmacyId: 'x', staffId: 'y', pin: '12' }),
    ).rejects.toThrow();
    await expect(
      phoneSchema.validate({ phone: '+919876543210' }),
    ).resolves.toBeTruthy();
    await expect(phoneSchema.validate({ phone: 'bad' })).rejects.toThrow();
    await expect(otpSchema.validate({ otp: '123456' })).resolves.toBeTruthy();
    await expect(otpSchema.validate({ otp: '12' })).rejects.toThrow();
    await expect(
      adminSchema.validate({ email: 'a@b.c', password: 'Secret123' }),
    ).resolves.toBeTruthy();
    await expect(
      adminSchema.validate({ email: 'bad', password: 'x' }),
    ).rejects.toThrow();
    await expect(mfaSchema.validate({ code: '123456' })).resolves.toBeTruthy();
    await expect(mfaSchema.validate({ code: '' })).rejects.toThrow();
    await expect(
      tokenPasswordSchema.validate({ token: 't', password: 'Secret123' }),
    ).resolves.toBeTruthy();
    await expect(
      tokenPasswordSchema.validate({ token: '', password: 'short' }),
    ).rejects.toThrow();
    await expect(
      emailOtpRequestSchema.validate({ email: 'a@b.c' }),
    ).resolves.toBeTruthy();
    await expect(
      emailOtpRequestSchema.validate({ email: 'bad' }),
    ).rejects.toThrow();
  });
});

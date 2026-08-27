import { describe, expect, it } from 'vitest';
import { bankSchema, profileSchema, taxSchema, verifySchema } from '../schemas';

describe('settings schemas', () => {
  it('accepts empty optional profile fields', async () => {
    await expect(
      profileSchema.validate({
        business_name: 'Shop',
        tagline: '',
        logo_url: '',
        phone: '',
        email: '',
        flat: '',
        area: '',
        city: '',
        state: 'Karnataka',
        pincode: '',
      }),
    ).resolves.toBeTruthy();
  });

  it('rejects invalid profile contact values', async () => {
    await expect(
      profileSchema.validate({
        business_name: 'Shop',
        phone: '9876543210',
        email: 'nope',
        pincode: '056001',
        state: 'Atlantis',
      }),
    ).rejects.toBeTruthy();
  });

  it('validates tax, bank, and OTP payloads', async () => {
    await expect(
      taxSchema.validate({
        gstin: '29AABPP1234F1Z5',
        pan_number: 'AABPP1234F',
        fssai_number: '12345678901234',
      }),
    ).resolves.toBeTruthy();
    await expect(taxSchema.validate({ gstin: 'bad' })).rejects.toBeTruthy();
    await expect(
      bankSchema.validate({
        account_holder: 'Priya',
        bank_name: 'HDFC',
        account_number: '123456789012',
        ifsc_code: 'HDFC0001234',
        account_type: 'SAVINGS',
      }),
    ).resolves.toBeTruthy();
    await expect(
      bankSchema.validate({
        account_holder: '',
        bank_name: '',
        account_number: '12',
        ifsc_code: 'bad',
        account_type: 'CURRENT',
      }),
    ).rejects.toBeTruthy();
    await expect(
      verifySchema.validate({ channel: 'EMAIL', otp: '123456' }),
    ).resolves.toBeTruthy();
    await expect(
      verifySchema.validate({ channel: 'PHONE', otp: '12' }),
    ).rejects.toBeTruthy();
  });
});

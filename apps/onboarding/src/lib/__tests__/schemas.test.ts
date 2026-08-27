import { describe, expect, it } from 'vitest';
import { otpSchema, registerSchema } from '../schemas';

describe('onboarding schemas', () => {
  it('accepts a valid register payload', async () => {
    await expect(
      registerSchema.validate({
        owner_name: 'Priya Sharma',
        business_name: 'Sri Rama Medicals',
        phone: '+919876543210',
        email: 'priya@srirama.in',
        password: 'Passw0rd!',
        flat: '12',
        area: 'MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        gstin: '29AABPP1234F1Z5',
        drug_licence_number: 'DL-1',
        fssai_number: '',
        pan_number: 'AABPP1234F',
      }),
    ).resolves.toBeTruthy();
  });

  it('rejects weak fields and optional FSSAI', async () => {
    await expect(otpSchema.validate({ otp: '12' })).rejects.toBeTruthy();
    await expect(
      registerSchema.validate({
        owner_name: 'P',
        business_name: 'S',
        phone: '987',
        email: 'bad',
        password: 'short',
        flat: '',
        area: '',
        city: '',
        state: 'Narnia',
        pincode: '056001',
        gstin: 'GSTIN',
        drug_licence_number: '',
        fssai_number: '123',
        pan_number: 'bad',
      }),
    ).rejects.toBeTruthy();
  });
});

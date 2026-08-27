import {
  isValidAccountNumber,
  isValidEmail,
  isValidFssai,
  isValidGstin,
  isValidIfsc,
  isValidOtp,
  isValidPan,
  isValidPhone,
  isValidPincode,
  normalizeEmail,
  normalizePhone,
} from '@medmate/settings-contract';
import * as Yup from 'yup';
import { INDIAN_STATES } from './states';

export const profileSchema = Yup.object({
  business_name: Yup.string().trim().required('Enter the shop name.'),
  tagline: Yup.string().trim(),
  logo_url: Yup.string().trim(),
  phone: Yup.string()
    .trim()
    .test(
      'phone',
      'Use a +91 mobile number.',
      (value) => !value || isValidPhone(normalizePhone(value)),
    ),
  email: Yup.string()
    .trim()
    .test(
      'email',
      'Enter a valid email.',
      (value) => !value || isValidEmail(normalizeEmail(value)),
    ),
  flat: Yup.string().trim(),
  area: Yup.string().trim(),
  city: Yup.string().trim(),
  state: Yup.string().oneOf(
    ['', ...INDIAN_STATES],
    'Select a valid Indian state.',
  ),
  pincode: Yup.string()
    .trim()
    .test(
      'pincode',
      'Enter a valid Indian pincode.',
      (value) => !value || isValidPincode(value),
    ),
});

export const taxSchema = Yup.object({
  gstin: Yup.string()
    .trim()
    .test(
      'gstin',
      'Enter a 15-character GSTIN.',
      (value) => !value || isValidGstin(value.trim().toUpperCase()),
    ),
  pan_number: Yup.string()
    .trim()
    .test(
      'pan',
      'Enter a valid PAN.',
      (value) => !value || isValidPan(value.trim().toUpperCase()),
    ),
  drug_licence_number: Yup.string().trim(),
  fssai_number: Yup.string()
    .trim()
    .test(
      'fssai',
      'FSSAI must be 14 digits.',
      (value) => !value || isValidFssai(value),
    ),
  registered_pharmacist_name: Yup.string().trim(),
  is_gst_registered: Yup.boolean(),
  e_invoicing_enabled: Yup.boolean(),
  tds_applicable: Yup.boolean(),
  tcs_applicable: Yup.boolean(),
});

export const bankSchema = Yup.object({
  account_holder: Yup.string().trim().required('Enter the account holder.'),
  bank_name: Yup.string().trim().required('Enter the bank name.'),
  account_number: Yup.string()
    .required('Enter the account number.')
    .test('account', 'Enter a 9–18 digit account number.', (value) =>
      Boolean(value && isValidAccountNumber(value.trim())),
    ),
  ifsc_code: Yup.string()
    .required('Enter the IFSC.')
    .test('ifsc', 'Enter a valid IFSC.', (value) =>
      Boolean(value && isValidIfsc(value.trim().toUpperCase())),
    ),
  account_type: Yup.mixed<'CURRENT' | 'SAVINGS'>()
    .oneOf(['CURRENT', 'SAVINGS'])
    .required('Select the account type.'),
});

export const verifySchema = Yup.object({
  channel: Yup.mixed<'PHONE' | 'EMAIL'>()
    .oneOf(['PHONE', 'EMAIL'])
    .required('Select a channel.'),
  otp: Yup.string()
    .required('Enter the 6-digit OTP.')
    .test('otp', 'Enter the 6-digit OTP.', (value) =>
      Boolean(value && isValidOtp(value)),
    ),
});

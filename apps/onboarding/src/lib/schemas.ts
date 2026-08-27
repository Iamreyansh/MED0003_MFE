import {
  isValidEmail,
  isValidFssai,
  isValidGstin,
  isValidOtp,
  isValidPan,
  isValidPassword,
  isValidPhone,
  isValidPincode,
  normalizeEmail,
  normalizePhone,
} from '@medmate/onboarding-contract';
import * as Yup from 'yup';
import { INDIAN_STATES } from './states';

export const registerSchema = Yup.object({
  owner_name: Yup.string()
    .trim()
    .min(2, 'Enter the owner name.')
    .required('Enter the owner name.'),
  business_name: Yup.string()
    .trim()
    .min(2, 'Enter the shop name.')
    .required('Enter the shop name.'),
  phone: Yup.string()
    .required('Enter a +91 mobile number.')
    .test('phone', 'Use a +91 mobile number.', (value) =>
      Boolean(value && isValidPhone(normalizePhone(value))),
    ),
  email: Yup.string()
    .required('Enter the owner email.')
    .test('email', 'Enter a valid email.', (value) =>
      Boolean(value && isValidEmail(normalizeEmail(value))),
    ),
  password: Yup.string()
    .required('Enter a password.')
    .test(
      'password',
      'Use 8+ characters with an uppercase letter, a number, and a symbol.',
      (value) => Boolean(value && isValidPassword(value)),
    ),
  flat: Yup.string().trim().required('Enter the street or flat.'),
  area: Yup.string().trim().required('Enter the area.'),
  city: Yup.string().trim().required('Enter the city.'),
  state: Yup.string()
    .required('Select a state.')
    .oneOf([...INDIAN_STATES], 'Select a valid Indian state.'),
  pincode: Yup.string()
    .required('Enter a 6-digit pincode.')
    .test('pincode', 'Enter a valid Indian pincode.', (value) =>
      Boolean(value && isValidPincode(value.trim())),
    ),
  gstin: Yup.string()
    .required('Enter the GSTIN.')
    .test('gstin', 'Enter a 15-character GSTIN.', (value) =>
      Boolean(value && isValidGstin(value.trim().toUpperCase())),
    ),
  drug_licence_number: Yup.string()
    .trim()
    .required('Enter the drug licence number.'),
  fssai_number: Yup.string()
    .trim()
    .test(
      'fssai',
      'FSSAI must be 14 digits.',
      (value) => !value || isValidFssai(value),
    ),
  pan_number: Yup.string()
    .required('Enter the PAN.')
    .test('pan', 'Enter a valid PAN.', (value) =>
      Boolean(value && isValidPan(value.trim().toUpperCase())),
    ),
});

export const otpSchema = Yup.object({
  otp: Yup.string()
    .required('Enter the 6-digit OTP.')
    .test('otp', 'Enter the 6-digit OTP.', (value) =>
      Boolean(value && isValidOtp(value)),
    ),
});

export type RegisterFormValues = Yup.InferType<typeof registerSchema>;

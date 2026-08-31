import {
  isUuid,
  isValidEmail,
  isValidIdentifier,
  isValidOtp,
  isValidPassword,
  isValidPhone,
  isValidPin,
  normalizeIdentifier,
} from '@medmate/auth-contract';
import * as Yup from 'yup';

export const pharmacySchema = Yup.object({
  identifier: Yup.string()
    .required('Enter your email or +91 mobile number.')
    .test(
      'identifier',
      'Use an email or +91 mobile number.',
      (value) => !value || isValidIdentifier(normalizeIdentifier(value)),
    ),
  password: Yup.string().required('Enter your password.'),
});

export const forgotSchema = Yup.object({
  identifier: Yup.string()
    .required('Enter your email or +91 mobile number.')
    .test(
      'identifier',
      'Use an email or +91 mobile number.',
      (value) => !value || isValidIdentifier(normalizeIdentifier(value)),
    ),
});

export const posSchema = Yup.object({
  pharmacyId: Yup.string()
    .required('Pharmacy and staff IDs are required.')
    .test('uuid', 'Pharmacy and staff IDs are required.', (value) =>
      Boolean(value && isUuid(value)),
    ),
  staffId: Yup.string()
    .required('Pharmacy and staff IDs are required.')
    .test('uuid', 'Pharmacy and staff IDs are required.', (value) =>
      Boolean(value && isUuid(value)),
    ),
  pin: Yup.string()
    .required('Enter a 4-digit PIN.')
    .test('pin', 'Enter a 4-digit PIN.', (value) =>
      Boolean(value && isValidPin(value)),
    ),
});

export const phoneSchema = Yup.object({
  phone: Yup.string()
    .required('Enter a +91 mobile number.')
    .test('phone', 'Use a +91 mobile number.', (value) =>
      Boolean(value && isValidPhone(normalizeIdentifier(value))),
    ),
});

export const otpSchema = Yup.object({
  otp: Yup.string()
    .required('Enter the 6-digit OTP.')
    .test('otp', 'Enter the 6-digit OTP.', (value) =>
      Boolean(value && isValidOtp(value)),
    ),
});

export const adminSchema = Yup.object({
  email: Yup.string()
    .required('Enter your email.')
    .test('email', 'Enter a valid email.', (value) =>
      Boolean(value && isValidEmail(value.trim().toLowerCase())),
    ),
  password: Yup.string().required('Enter your password.'),
});

export const mfaSchema = Yup.object({
  code: Yup.string().required('Enter your authenticator or backup code.'),
});

export const tokenPasswordSchema = Yup.object({
  token: Yup.string().required('Enter the token from your email.'),
  password: Yup.string()
    .required('Enter a new password.')
    .test(
      'password',
      'Use at least 8 characters.',
      (value) => !value || isValidPassword(value),
    ),
});

export const emailOtpRequestSchema = Yup.object({
  email: Yup.string()
    .required('Enter your email.')
    .test('email', 'Enter a valid email.', (value) =>
      Boolean(value && isValidEmail(value.trim().toLowerCase())),
    ),
});

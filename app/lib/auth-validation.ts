export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthMode = 'signin' | 'signup';

export type AuthFormErrors = {
  email?: string;
  password?: string;
};

export type AuthFormInput = {
  mode: AuthMode;
  email: string;
  password: string;
};

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function parseAuthMode(value: string | string[] | undefined): AuthMode {
  return value === 'signup' ? 'signup' : 'signin';
}

export function validateAuthForm(input: AuthFormInput): {
  valid: boolean;
  errors: AuthFormErrors;
} {
  const errors: AuthFormErrors = {};

  if (!input.email) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!input.password) {
    errors.password = 'Password is required.';
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  } else if (input.password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// better-auth's core user schema requires a non-empty `name`; since this
// form only collects email + password, derive a placeholder from the email.
export function deriveNameFromEmail(email: string): string {
  return email.split('@')[0] || email;
}

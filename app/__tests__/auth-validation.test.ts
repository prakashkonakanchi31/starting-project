import { describe, it, expect } from 'vitest';
import {
  deriveNameFromEmail,
  isValidEmail,
  parseAuthMode,
  validateAuthForm,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '@/app/lib/auth-validation';

describe('parseAuthMode', () => {
  it('returns signup only on exact match', () => {
    expect(parseAuthMode('signup')).toBe('signup');
  });

  it.each([undefined, '', 'foo', ['signup', 'x']])('defaults to signin for %j', (value) => {
    expect(parseAuthMode(value)).toBe('signin');
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.com', 'user.name@example.co'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(['', 'no-at-sign', 'missing-domain@', '@missing-local.com'])('rejects %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('validateAuthForm', () => {
  it('rejects a password shorter than the minimum', () => {
    const { valid, errors } = validateAuthForm({
      mode: 'signin',
      email: 'a@b.com',
      password: 'a'.repeat(MIN_PASSWORD_LENGTH - 1),
    });
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  it('rejects a password longer than the maximum', () => {
    const { valid, errors } = validateAuthForm({
      mode: 'signin',
      email: 'a@b.com',
      password: 'a'.repeat(MAX_PASSWORD_LENGTH + 1),
    });
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  it('accepts a valid signup payload', () => {
    const { valid, errors } = validateAuthForm({
      mode: 'signup',
      email: 'a@b.com',
      password: 'password123',
    });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  it('accepts a valid signin payload', () => {
    const { valid, errors } = validateAuthForm({
      mode: 'signin',
      email: 'a@b.com',
      password: 'password123',
    });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });
});

describe('deriveNameFromEmail', () => {
  it('uses the local part before @', () => {
    expect(deriveNameFromEmail('ada@example.com')).toBe('ada');
  });

  it('falls back to the full string if there is no @', () => {
    expect(deriveNameFromEmail('ada')).toBe('ada');
  });
});

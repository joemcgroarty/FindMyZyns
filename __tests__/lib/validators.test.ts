import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateUsername,
  validateDisplayName,
} from '../../lib/validators';

describe('validateEmail', () => {
  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
  });

  it('returns error for invalid email', () => {
    expect(validateEmail('notanemail')).toBe('Please enter a valid email address');
  });

  it('returns null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('returns error for short password', () => {
    expect(validatePassword('1234567')).toBe(
      'Password must be at least 8 characters',
    );
  });

  it('returns null for valid password', () => {
    expect(validatePassword('12345678')).toBeNull();
  });
});

describe('validatePasswordMatch', () => {
  it('returns error for mismatched passwords', () => {
    expect(validatePasswordMatch('abc', 'def')).toBe("Passwords don't match");
  });

  it('returns null for matching passwords', () => {
    expect(validatePasswordMatch('abc', 'abc')).toBeNull();
  });
});

describe('validateUsername', () => {
  it('returns error for empty username', () => {
    expect(validateUsername('')).toBe('Username is required');
  });

  it('returns error for short username', () => {
    expect(validateUsername('ab')).toBe(
      'Username must be at least 3 characters',
    );
  });

  it('returns error for long username', () => {
    expect(validateUsername('a'.repeat(21))).toBe(
      'Username must be at most 20 characters',
    );
  });

  it('returns error for invalid characters', () => {
    expect(validateUsername('AB CD!')).toBe(
      'Only lowercase letters, numbers, and underscores allowed',
    );
  });

  it('returns null for valid username', () => {
    expect(validateUsername('cool_user_42')).toBeNull();
  });
});

describe('validateDisplayName', () => {
  it('returns error for long display name', () => {
    expect(validateDisplayName('a'.repeat(51))).toBe(
      'Display name must be at most 50 characters',
    );
  });

  it('returns null for valid display name', () => {
    expect(validateDisplayName('John Doe')).toBeNull();
  });
});

import { APP_CONFIG } from '@/constants/config';

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < APP_CONFIG.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${APP_CONFIG.PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): string | null {
  if (password !== confirmPassword) return "Passwords don't match";
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username) return 'Username is required';
  if (username.length < APP_CONFIG.MIN_USERNAME_LENGTH) {
    return `Username must be at least ${APP_CONFIG.MIN_USERNAME_LENGTH} characters`;
  }
  if (username.length > APP_CONFIG.MAX_USERNAME_LENGTH) {
    return `Username must be at most ${APP_CONFIG.MAX_USERNAME_LENGTH} characters`;
  }
  if (!APP_CONFIG.USERNAME_REGEX.test(username)) {
    return 'Only lowercase letters, numbers, and underscores allowed';
  }
  return null;
}

export function validateDisplayName(name: string): string | null {
  if (name.length > APP_CONFIG.MAX_DISPLAY_NAME_LENGTH) {
    return `Display name must be at most ${APP_CONFIG.MAX_DISPLAY_NAME_LENGTH} characters`;
  }
  return null;
}

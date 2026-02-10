/**
 * Shared validation functions for both frontend and backend
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (!value) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
  }

  if (value.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be no more than ${maxLength} characters long` };
  }

  return { isValid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, message: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid URL format' };
  }
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, message: 'Phone number must be between 10 and 15 digits' };
  }

  return { isValid: true };
}

/**
 * Combined validation for user registration
 */
export function validateUserRegistration(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors['email'] = emailValidation.message!;
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors['password'] = passwordValidation.message!;
  }

  const firstNameValidation = validateLength(data.firstName, 2, 50, 'First name');
  if (!firstNameValidation.isValid) {
    errors['firstName'] = firstNameValidation.message!;
  }

  const lastNameValidation = validateLength(data.lastName, 2, 50, 'Last name');
  if (!lastNameValidation.isValid) {
    errors['lastName'] = lastNameValidation.message!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

import { isValidWebhookUrl } from "@/utils/securityUtils";

/**
 * Validates a URL string for proper formatting and allowed protocols
 */
export const isValidWebhookUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Validates secret strength with basic security requirements
 * - Minimum 10 characters
 * - At least one number
 * - At least one special character
 */
export const isStrongSecret = (secret: string): boolean => {
  // Minimum length check
  if (secret.length < 10) return false;

  // At least one number check
  const hasNumber = /\d/.test(secret);
  if (!hasNumber) return false;

  // At least one special character check
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(secret);
  if (!hasSpecialChar) return false;

  return true;
};


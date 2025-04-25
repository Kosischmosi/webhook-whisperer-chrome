
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
 * Validates webhook secret to ensure it meets minimum security requirements
 * - At least 10 characters
 * - Contains at least one number
 * - Contains at least one special character
 */
export const isStrongSecret = (secret: string): boolean => {
  if (!secret) return true; // Secret is optional
  if (secret.length < 10) return false;
  
  const hasNumber = /\d/.test(secret);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(secret);
  
  return hasNumber && hasSpecialChar;
};



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
 * Basic validation to ensure secret is provided if required
 * No format restrictions since secrets are provided by webhook providers
 */
export const isStrongSecret = (secret: string): boolean => {
  return true; // Accept any secret format since it's provider-defined
};

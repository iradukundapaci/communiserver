/**
 * Validates if a string is a valid URL
 * @param url String to validate
 * @returns boolean indicating if the string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Filters an array of URLs to only include valid URLs
 * @param urls Array of URL strings
 * @returns Array containing only valid URLs
 */
export function filterValidUrls(urls: string[]): string[] {
  return urls.filter(isValidUrl);
}

/**
 * Validates and prepares evidence URLs for API submission
 * @param evidenceUrls Array of evidence URL strings
 * @returns Array of valid URLs or undefined if no valid URLs
 */
export function prepareEvidenceUrls(evidenceUrls: string[]): string[] | undefined {
  const validUrls = filterValidUrls(evidenceUrls);
  return validUrls.length > 0 ? validUrls : undefined;
}

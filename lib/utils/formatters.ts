/**
 * Formats estimated revenue loss to strictly extract only the percentage or percentage range.
 * Examples:
 * - "85% - 100% in Lost Traffic & Direct Sales" => "85% - 100%"
 * - "18% - 28% in Lost Sales" => "18% - 28%"
 * - "28% - 42% in Lost Sales & Cart Abandonment" => "28% - 42%"
 * - "35%" => "35%"
 */
export function formatRevenueLossPercentage(raw: string | undefined | null): string {
  if (!raw || typeof raw !== "string") return "0%";
  const trimmed = raw.trim();

  // 1. Extract clean percentage range or single percentage: e.g. "85% - 100%", "28%"
  const percentageMatch = trimmed.match(/(\d+(?:\.\d+)?%\s*(?:-\s*\d+(?:\.\d+)?%)?)/);
  if (percentageMatch) {
    return percentageMatch[1].replace(/\s*-\s*/, " - ");
  }

  // 2. Extract currency amount if formatted as dollars
  const currencyMatch = trimmed.match(/(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/);
  if (currencyMatch) {
    return currencyMatch[1].replace(/\s*-\s*/, " - ");
  }

  // 3. Fallback: split on common English preposition phrases
  const firstChunk = trimmed.split(/\s+(?:in|due to|from|of)\s+/i)[0]?.trim();
  return firstChunk || trimmed;
}

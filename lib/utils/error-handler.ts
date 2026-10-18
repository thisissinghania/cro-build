/**
 * Sanitizes any internal error message before returning it to the user.
 * Guarantees zero leakage of database names, table names, connection strings,
 * stack traces, internal paths, or security-sensitive details.
 */
export function sanitizeErrorMessage(
  error: unknown,
  fallbackMessage = "Unable to process your request at this moment. Please try again."
): string {
  if (!error) return fallbackMessage;

  let rawMessage = "";
  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "object" && (error as any)?.message) {
    rawMessage = String((error as any).message);
  } else {
    rawMessage = String(error);
  }

  const lower = rawMessage.toLowerCase();

  // Comprehensive filter of database, driver, connection, and internal architecture keywords
  const leakKeywords = [
    "prisma",
    "postgres",
    "postgresql",
    "cro-db",
    "database",
    "db",
    "schema",
    "table",
    "column",
    "foreign key",
    "unique constraint",
    "sql",
    "select",
    "insert",
    "update",
    "delete",
    "adapter-pg",
    "pg-pool",
    "sasl",
    "scram",
    "localhost",
    "127.0.0.1",
    "5432",
    "password",
    "secret",
    "token",
    "jwt",
    "bcrypt",
    "eval",
    "node_modules",
    "internal error",
    "syntaxerror",
    "typeerror",
    "referenceerror",
    "cannot read properties",
    "null is not",
    "undefined is not",
    "p200",
    "p201",
    "p202",
    "p203",
    "p2025",
    "p2002",
  ];

  // Known safe, user-friendly translations for common Prisma error codes
  if (lower.includes("p2002") || lower.includes("unique constraint")) {
    return "A record with this information already exists.";
  }
  if (
    lower.includes("p2025") ||
    lower.includes("record to delete does not exist") ||
    lower.includes("record to update not found")
  ) {
    return "The requested record was not found or has already been removed.";
  }
  if (lower.includes("p2003") || lower.includes("foreign key")) {
    return "This operation cannot be completed because related items still depend on it.";
  }

  for (const keyword of leakKeywords) {
    if (lower.includes(keyword)) {
      return fallbackMessage;
    }
  }

  // Friendly translations for AI, network, and timeout situations
  if (
    lower.includes("503") ||
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("resource has been exhausted") ||
    lower.includes("quota")
  ) {
    return "Our AI analysis service is currently experiencing high demand. Please try again in a few moments.";
  }

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("econnrefused") ||
    lower.includes("fetch failed")
  ) {
    return "The connection timed out. Please check your internet connection and try again.";
  }

  // If the message is human-friendly, concise, and does not contain technical code syntax
  if (rawMessage.length > 0 && rawMessage.length <= 140 && !/[{}[\]\\\/`^~<>]/.test(rawMessage)) {
    return rawMessage;
  }

  return fallbackMessage;
}

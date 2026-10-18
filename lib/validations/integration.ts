import { z } from "zod";

// Regular expression for validating full website URL or domain name (case-insensitive):
// Supports: example.com, https://example.com, http://example.com, www.example.com, store.myshopify.com
export const websiteUrlRegex =
  /^(?:https?:\/\/)?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[^\s]*)?$/i;

export const WebsiteUrlSchema = z
  .string()
  .trim()
  .min(1, "Website URL is required.")
  .superRefine((val, ctx) => {
    if (!val) return;
    if (!websiteUrlRegex.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Please enter a valid website URL (e.g. example.com or https://example.com)",
      });
    }
  });

export const CreateIntegrationSchema = z.object({
  websiteUrl: WebsiteUrlSchema,
  platformType: z.enum(["CUSTOM_URL", "SHOPIFY", "GA4"]),
});

export type CreateIntegrationInput = z.infer<typeof CreateIntegrationSchema>;

export function isValidWebsiteUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  return WebsiteUrlSchema.safeParse(url.trim()).success;
}

/**
 * Normalizes a URL to its canonical host and path for safe, collision-free duplicate checking.
 * Strips protocols (http/https), leading 'www.', and trailing slashes.
 * e.g. "https://www.example.com/" -> "example.com"
 */
export function extractCanonicalDomain(rawUrl: string): string {
  try {
    let url = (rawUrl || "").trim().toLowerCase();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./i, "");
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${host}${pathname}`;
  } catch {
    return (rawUrl || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/+$/, "");
  }
}

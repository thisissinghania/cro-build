import { z } from "zod";

export const AuditPriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const AuditCategoryEnum = z.enum([
  // Enhanced 2026 Growth Categories
  "AEO_SEO",
  "FUNNEL_LEAKAGE",
  "DESIGN_ERA",
  "TRUST_CREDIBILITY",
  "MARKETING_PSYCHOLOGY",
  "SPEED_TECH",
  // Backwards compatibility categories
  "UI_UX",
  "CHECKOUT",
  "SPEED",
  "PRICING",
  "COPYWRITING",
]);

export const AuditRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: AuditCategoryEnum.or(z.string()),
  priority: AuditPriorityEnum,
  targetPage: z.string().optional().default("Product Page (PDP)"),
  implementationType: z.string().optional().default("Optimization (~1-2h)"),
  suggestedChange: z.string().min(1),
  benefit: z.string().min(1),
  rationale: z.string().min(1),
  effort: z.string().min(1),
  actionableSnippet: z.string().optional(),
});

export const PageFocusBreakdownSchema = z.object({
  pdp: z.number().default(50),
  cart: z.number().default(25),
  homepage: z.number().default(15),
  checkout: z.number().default(10),
});

export const AuditReportDataSchema = z.object({
  overallScore: z.number().min(0).max(100),
  estimatedRevenueLoss: z.string().min(1),
  summary: z.string().min(1),
  // 2026 Growth & Intelligence Diagnostics
  designEraDiagnosis: z.string().optional().default("2017-2019 Template Feel (Needs 2026 Modernization)"),
  aeoReadinessScore: z.number().min(0).max(100).optional().default(42),
  primaryLeakageStage: z.string().optional().default("Product Detail Page (High drop-off due to shipping timeline ambiguity)"),
  trustHealthDiagnosis: z.string().optional().default("Moderate Risk - Lacks founder proof, authentic customer video, & clear guarantee"),
  pageFocusBreakdown: PageFocusBreakdownSchema.optional().default({
    pdp: 55,
    cart: 25,
    homepage: 15,
    checkout: 5,
  }),
  topCustomerObjections: z.array(z.string()).optional().default([
    "Unclear real delivery timeline before reaching checkout",
    "Lack of authentic customer video reviews or creator social proof",
    "Hidden shipping or return shipping policies causing cart hesitation",
  ]),
  recommendations: z.array(AuditRecommendationSchema).min(1),
});

export type AuditRecommendation = z.infer<typeof AuditRecommendationSchema>;
export type AuditReportData = z.infer<typeof AuditReportDataSchema>;

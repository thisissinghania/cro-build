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

export const HeadlineVariantSchema = z.object({
  id: z.string().default("var_a"),
  type: z.string().default("Loss Aversion"),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  psychology: z.string().min(1),
  impact: z.string().min(1),
});

export const FunnelStageSchema = z.object({
  stage: z.string().min(1),
  pct: z.number().default(25),
  reason: z.string().min(1),
  fix: z.string().min(1),
  urgency: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
});

export const CompetitorBenchmarkSchema = z.object({
  competitorNiche: z.string().default("Industry Competitors"),
  competitorScore: z.number().default(88),
  metrics: z.array(
    z.object({
      name: z.string(),
      target: z.boolean(),
      competitor: z.boolean(),
      verdict: z.string(),
    })
  ).optional().default([]),
  advantages: z.array(z.string()).optional().default([]),
  vulnerabilities: z.array(z.string()).optional().default([]),
  winningMoves: z.array(z.string()).optional().default([]),
});

export const AuditReportDataSchema = z.object({
  overallScore: z.number().min(0).max(100),
  estimatedRevenueLoss: z.string().min(1),
  summary: z.string().min(1),
  websiteType: z
    .enum(["LOCAL_SERVICE", "ECOMMERCE", "SAAS_B2B", "AGENCY_PORTFOLIO", "GENERAL_WEBSITE"])
    .optional()
    .default("GENERAL_WEBSITE"),
  businessNiche: z.string().optional().default("General Website"),
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
  generatedHeadlines: z.array(HeadlineVariantSchema).optional().default([]),
  generatedSchemaJsonLd: z.string().optional().default(""),
  generatedFunnelStages: z.array(FunnelStageSchema).optional().default([]),
  competitorBenchmark: CompetitorBenchmarkSchema.optional(),
  recommendations: z.array(AuditRecommendationSchema).min(1),
});

export type AuditRecommendation = z.infer<typeof AuditRecommendationSchema>;
export type AuditReportData = z.infer<typeof AuditReportDataSchema>;
export type HeadlineVariant = z.infer<typeof HeadlineVariantSchema>;
export type FunnelStage = z.infer<typeof FunnelStageSchema>;
export type CompetitorBenchmark = z.infer<typeof CompetitorBenchmarkSchema>;

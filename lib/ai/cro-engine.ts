import { GoogleGenAI } from "@google/genai";
import { AuditReportDataSchema, type AuditReportData } from "@/lib/validations/audit";

export interface CroAuditInput {
  websiteUrl: string;
  platformType: string;
  shopDetails?: {
    name?: string;
    currency?: string;
    domain?: string;
    plan_name?: string;
  };
  products?: Array<{
    title: string;
    price?: string;
    variants_count?: number;
    inventory_quantity?: number;
  }>;
  ordersCount?: number;
  recentOrdersSample?: Array<{
    total_price?: string;
    financial_status?: string;
    cancel_reason?: string | null;
  }>;
}

export async function generateCroAuditWithAI(input: CroAuditInput): Promise<AuditReportData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the world's most elite Conversion Rate Optimization (CRO), AEO (Answer Engine Optimization), and Growth Architect in 2026.
Your job is to conduct an ultra-deep, comprehensive 360-degree audit of the target e-commerce store or website.

TONE & LANGUAGE GUIDELINES:
- Write in crystal-clear, high-converting business English that any real store owner, founder, or marketer immediately understands.
- DO NOT use confusing academic jargon or theoretical psychology terms (avoid words like "Fitts's Law", "semantic chunking", "cognitive load heuristics").
- Instead, ground every explanation in real customer behavior, phone screen usability, lost sales, and purchase hesitations.
- Keep recommendations practical, actionable, and revenue-focused.
- For developers, provide the exact code, JSON-LD, or microcopy snippet inside "actionableSnippet".

STORE CONTEXT:
- Website Domain / Store: ${input.websiteUrl}
- Platform Type: ${input.platformType}
- Store Name: ${input.shopDetails?.name || "E-Commerce Store"}
- Currency: ${input.shopDetails?.currency || "INR"}
- Total Orders Analyzed: ${input.ordersCount || 0}
- Sample Products: ${JSON.stringify(input.products?.slice(0, 8) || [])}
- Sample Orders / Sales: ${JSON.stringify(input.recentOrdersSample?.slice(0, 5) || [])}

YOUR AUDIT MUST ANALYZE THESE 6 CORE GROWTH PILLARS:
1. DESIGN ERA & AESTHETIC MATURITY:
   - What era does this website look and feel like? (e.g., "2016 Dropshipping Template Feel" vs "2026 High-Trust Editorial DTC Brand").
   - Assess visual clutter, dated badges, poor typography, and mobile thumb-zone layout.

2. AEO & AI-FIRST SEARCH DISCOVERY (Generative Engine Optimization):
   - In 2026, buyers search via ChatGPT, Perplexity, and Google Gemini AI Search.
   - Does this site have rich Product & FAQ Schema.org markup so AI engines cite and recommend its products?
   - Is product copy conversational and structured for LLM retrieval?

3. VISITOR TIME-WASTING & FUNNEL LEAKAGE HOTSPOTS:
   - Exactly WHERE in the funnel are visitors abandoning and wasting their time?
   - Identify decision fatigue on PDP, ambiguous delivery timelines, intrusive popups, and friction points.

4. TRUST & CREDIBILITY DEFICIT:
   - Why do first-time cold-traffic visitors hesitate to give their credit card?
   - Lack of founder story, absence of authentic video reviews/UGC, vague return terms.

5. MARKETING PSYCHOLOGY & AOV MULTIPLIERS:
   - Tiered bundles (Buy 2 Get 1 / Free gift threshold in slide-out cart).
   - Post-purchase 1-click upsells, ethical urgency vs spammy fake countdown timers.

6. PAGE ALLOCATION ROADMAP:
   - Which specific page requires 60%+ of the merchant's immediate redesign focus?

JSON OUTPUT FORMAT SPECIFICATION:
Respond with a strict, valid JSON object matching this schema:
{
  "overallScore": <integer 42 to 84 representing conversion efficiency score>,
  "estimatedRevenueLoss": "<e.g. 18% - 28%>",
  "summary": "<comprehensive 3-sentence executive diagnostic summary of conversion leaks and major growth opportunity>",
  "designEraDiagnosis": "<e.g. '2017-2019 Generic Dropshipping Era - Lacks modern 2026 editorial DTC trust'>",
  "aeoReadinessScore": <integer 25 to 70 representing readiness for AI/ChatGPT search recommendations>,
  "primaryLeakageStage": "<exact stage with reason, e.g. 'Product Detail Page (PDP) - High bounce due to delivery timeline ambiguity & decision paralysis'>",
  "trustHealthDiagnosis": "<e.g. 'Critical Trust Deficit - Missing authentic UGC video proof, transparent return policies, and founder credibility'>",
  "pageFocusBreakdown": {
    "pdp": <integer e.g. 55>,
    "cart": <integer e.g. 25>,
    "homepage": <integer e.g. 15>,
    "checkout": <integer e.g. 5>
  },
  "topCustomerObjections": [
    "<objection 1, e.g. 'Will this actually arrive before Friday without surprise fees?'>",
    "<objection 2, e.g. 'Is this a legitimate brand or a cheap dropshipped knockoff?'>",
    "<objection 3, e.g. 'What if it does not fit or breaks - will returning it be a hassle?'>"
  ],
  "recommendations": [
    {
      "id": "<unique string id>",
      "title": "<punchy, authoritative title>",
      "category": "<one of: AEO_SEO, FUNNEL_LEAKAGE, DESIGN_ERA, TRUST_CREDIBILITY, MARKETING_PSYCHOLOGY, SPEED_TECH>",
      "priority": "<one of: HIGH, MEDIUM, LOW>",
      "targetPage": "<one of: Product Detail Page (PDP), Slide-out Cart, Homepage, Checkout, Global Navigation>",
      "implementationType": "<one of: ⚡ Quick Win (<30m), 🛠️ Optimization (~2h), 🚀 Strategic Redesign>",
      "suggestedChange": "<exact concrete, high-level change to execute>",
      "benefit": "<expected business metric impact, e.g. '+24% Checkout Completion' or '+18% AOV'>",
      "rationale": "<deep psychological reason and behavioral data behind why users respond to this>",
      "effort": "<e.g. 'Quick Fix (~20m)', 'Moderate (~2h)', 'Strategic (~1d)'>",
      "actionableSnippet": "<optional exact microcopy, schema snippet, or headline text to paste directly>"
    }
  ]
}

Ensure you provide between 6 and 9 rich, hyper-actionable recommendations. High priority items must address the most catastrophic revenue leaks first.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const rawJson = response.text;
  if (!rawJson) {
    throw new Error("Empty response received from Gemini.");
  }

  const parsed = JSON.parse(rawJson);
  const validated = AuditReportDataSchema.parse(parsed);

  // Sort recommendations by priority (HIGH first, then MEDIUM, then LOW)
  const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  validated.recommendations.sort(
    (a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
  );

  return validated;
}

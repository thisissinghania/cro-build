import { GoogleGenAI } from "@google/genai";
import { jsonrepair } from "jsonrepair";
import { AuditReportDataSchema, type AuditReportData } from "@/lib/validations/audit";
import type { ScrapedSiteAudit } from "@/lib/ai/web-scraper";

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
  scrapedData?: ScrapedSiteAudit | null;
}

export async function generateCroAuditWithAI(input: CroAuditInput): Promise<AuditReportData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const scraped = input.scrapedData;

  const detectedType = scraped?.detectedType || (input.platformType === "SHOPIFY" ? "ECOMMERCE" : "GENERAL_WEBSITE");
  const businessNiche = scraped?.businessNicheSummary || "Online Website";

  // Compile technical evidence from live crawl
  let technicalEvidence = "No live HTML crawl available (using standard heuristics).";
  if (scraped) {
    const p1 = scraped.scannedPages[0];
    const p2 = scraped.scannedPages[1];

    technicalEvidence = `
LIVE CRAWL EVIDENCE (FACTS FROM REAL DOM / HTML):
- Detected Business Model: ${scraped.detectedType} (${scraped.businessNicheSummary})
- Homepage Title: "${p1?.title || 'None'}" (Length: ${p1?.titleLength || 0} chars)
- Homepage Meta Description: "${p1?.metaDescription || 'MISSING! No meta description found'}" (Length: ${p1?.metaDescriptionLength || 0} chars)
- H1 Headings Found: ${JSON.stringify(p1?.h1Tags || [])} (Count: ${p1?.h1Tags.length || 0} - ${p1?.h1Tags.length === 1 ? 'Valid SEO standard' : 'SEO Warning: should have exactly one H1'})
- Schema.org Structured Data: ${p1?.schemasFound.length ? p1.schemasFound.join(", ") : "NO Schema.org JSON-LD found (Severe AEO/Google AI Search visibility penalty!)"}
- Schema Raw Snippet: ${p1?.schemaRawSummary ? p1.schemaRawSummary.slice(0, 300) : "None"}
- Click-to-Call Phone Links: ${scraped.technicalSummary.hasClickToCall ? `Found phone links: ${p1?.phoneLinks.join(', ') || 'Yes'}` : 'NO CLICK-TO-CALL (tel:) LINKS FOUND (Visitors cannot tap to call immediately)'}
- WhatsApp / Instant Chat Links: ${scraped.technicalSummary.hasWhatsAppCta ? 'Found WhatsApp CTA' : 'No WhatsApp chat CTA found'}
- Lead Generation / Contact Forms: ${scraped.technicalSummary.hasLeadCaptureForm ? `Found ${p1?.formsCount || 1} form(s)` : 'No standard contact/quote form found'}
- Primary CTAs / Button Texts: ${JSON.stringify(p1?.primaryButtonTexts.slice(0, 8) || [])}
- Images Missing Alt Attributes: ${scraped.technicalSummary.imagesMissingAltCount} image(s) missing alt tags (Hurts SEO and screen reader accessibility)
- Trust Keywords Present in Body: ${p1?.trustKeywordsFound.length ? p1.trustKeywordsFound.join(", ") : "Minimal/No explicit trust badges or licensing keywords detected"}
- Live Chat Widget: ${p1?.hasLiveChatOrWidget ? "Present" : "None detected"}
- Detected Tech Stack: ${scraped.technicalSummary.detectedTechStacks.join(", ") || "Custom Web / Unknown"}
${p2 ? `- Secondary Funnel Page Scanned (${p2.url}): Title: "${p2.title}", Schemas: ${p2.schemasFound.join(', ') || 'None'}, Forms: ${p2.formsCount}, Phone: ${p2.phoneLinks.length > 0}` : ''}
- Sample Page Copy Snippet: "${scraped.samplePageCopySnippet.slice(0, 700)}"
`;
  }

  const prompt = `
You are the world's most elite 360-degree Conversion Rate Optimization (CRO), AEO (Answer Engine Optimization), Technical SEO, and Digital Growth Architect in 2026.
Your job is to conduct a hyper-tailored, data-backed audit of the target website based on its EXACT business model and live crawl evidence.

IMPORTANT: THIS IS NOT ONLY FOR E-COMMERCE STORES!
The platform audits ANY type of website:
1. LOCAL SERVICES (Plumbers, Electricians, Dentists, HVAC, Contractors, Lawyers, Clinics, Cleaners):
   - Primary Conversion Goal: PHONE CALLS (Click-to-Call on mobile), WHATSAPP INQUIRIES, EMERGENCY FORM SUBMISSIONS, and LOCAL GOOGLE 3-PACK / VOICE SEARCH ("Plumber near me").
   - Friction Points: Phone number not clickable, form has too many fields (more than 3 fields causes 60% drop), vague pricing causing hesitation, no 24/7 or emergency badge, missing local license/insurance proof.
   - AEO & SEO: MUST provide a complete, copy-pasteable Schema.org "LocalBusiness" or "Plumber" or "Service" JSON-LD snippet with telephone, openingHours, priceRange, and areaServed!

2. E-COMMERCE (Physical/Digital Products, Shopify, WooCommerce):
   - Primary Conversion Goal: Online purchases, higher AOV (Average Order Value), and slide-out cart completion.
   - Friction Points: Unclear delivery timelines, missing variant selection ease, lack of UGC/video reviews, hidden shipping fees.
   - AEO & SEO: Schema.org "Product" with "Offer" and "AggregateRating".

3. SAAS & B2B SOFTWARE:
   - Primary Conversion Goal: Free Trial Signups, Book a Demo, Pricing plan selection.
   - Friction Points: Jargon-heavy headlines, forcing credit card for trial, complicated pricing grids on mobile.
   - AEO & SEO: Schema.org "SoftwareApplication".

4. AGENCY / CONSULTING / PORTFOLIO:
   - Primary Conversion Goal: Discovery call bookings, high-ticket project quote inquiries.
   - Friction Points: Generic agency buzzwords, no case studies with real numbers, slow response promise.

TARGET WEBSITE DETAILS:
- Website URL: ${input.websiteUrl}
- Platform Type: ${input.platformType}
- Store Details (if e-com): ${input.shopDetails?.name || 'N/A'} (Currency: ${input.shopDetails?.currency || 'USD'})
- Orders Count (if e-com): ${input.ordersCount || 0}
- Sample Products (if e-com): ${JSON.stringify(input.products?.slice(0, 5) || [])}

${technicalEvidence}

TONE & METHODOLOGY:
- Write in authoritative, direct, high-impact business English that any founder, local business owner, or marketing director instantly understands.
- DO NOT use confusing academic psychology jargon (avoid terms like "Fitts's Law", "heuristic chunking").
- Address real customer psychology: hesitation to call, fear of getting ripped off, emergency urgency, or checkout abandonment.
- Highlight concrete digital marketing fixes (SEO title/meta, Schema code snippet, Click-to-call mobile bar, Google Review integration).
- For every code recommendation, provide the exact snippet inside "actionableSnippet".

AUDIT PILLARS TO ADDRESS IN RECOMMENDATIONS:
1. AEO_SEO (Answer Engine Optimization & Technical SEO):
   - ChatGPT, Google Gemini, and Perplexity AI search visibility.
   - Schema.org markup (Provide exact JSON-LD script snippet ready to paste).
   - Title tag and Meta description corrections.
2. FUNNEL_LEAKAGE (Conversion Leaks & Drop-off Points):
   - Fix primary drop-off (Click-to-call friction, form complexity, or checkout barriers).
3. DESIGN_ERA (2026 UX & Mobile Thumb Zone):
   - Mobile-first layout, sticky emergency CTA, elimination of visual clutter.
4. TRUST_CREDIBILITY (Trust Deficit & Cold Traffic Hesitation):
   - Google Reviews, licensing/insurance proof, authentic guarantees, upfront pricing.
5. MARKETING_PSYCHOLOGY (Revenue & Lead Multipliers):
   - Urgency triggers, tiered bundles, free estimate guarantee, or high-converting microcopy.
6. SPEED_TECH (Technical Bugs & Performance):
   - Images missing alt tags, render-blocking scripts, unclickable links.

JSON OUTPUT FORMAT SPECIFICATION:
Respond with a strict, valid JSON object matching this schema:
{
  "websiteType": "${detectedType}",
  "businessNiche": "${businessNiche}",
  "overallScore": <integer 42 to 85 representing overall digital conversion and discovery score>,
  "estimatedRevenueLoss": "<e.g. '24% - 35% in Lost Calls & Bookings' or '18% - 28% in Lost Sales'>",
  "summary": "<comprehensive 3-sentence executive summary diagnosing conversion leaks and growth potential tailored to their business model>",
  "designEraDiagnosis": "<e.g. '2016 Generic Local Contractor Template - Lacks 2026 mobile thumb-zone urgency & trust'>",
  "aeoReadinessScore": <integer 25 to 70 representing readiness for AI/ChatGPT search recommendations>,
  "primaryLeakageStage": "<exact stage with reason, e.g. 'Mobile Hero Section - Phone number not clickable, cold visitors bounce without calling'>",
  "trustHealthDiagnosis": "<e.g. 'High Skepticism Risk - Lacks verified Google reviews badge, license number, and clear emergency pricing reassurance'>",
  "pageFocusBreakdown": {
    "pdp": <integer e.g. 50 representing primary offer/service page focus>,
    "cart": <integer e.g. 25 representing lead form / cart drawer focus>,
    "homepage": <integer e.g. 15 representing homepage hero & header focus>,
    "checkout": <integer e.g. 10 representing booking confirmation / checkout focus>
  },
  "topCustomerObjections": [
    "<objection 1, tailored to this business, e.g. 'Will they charge an exorbitant hidden diagnostic fee just to show up?'>",
    "<objection 2, e.g. 'Are they actually licensed and insured if something goes wrong?'>",
    "<objection 3, e.g. 'How fast can a technician actually arrive at my doorstep?'>"
  ],
  "generatedHeadlines": [
    {
      "id": "var_a",
      "type": "Loss Aversion (Pain Avoidance)",
      "headline": "<punchy, brand-specific headline focusing on preventing loss/waste/delay>",
      "subheadline": "<high-converting subheadline with concrete timeline and zero-risk guarantee>",
      "psychology": "<psychological reason why this triggers action>",
      "impact": "<expected metric lift, e.g. '+32% Call Rate' or '+28% Signup Rate'>"
    },
    {
      "id": "var_b",
      "type": "Speed & Relief (Urgency)",
      "headline": "<punchy headline promising fast relief, speed, or frictionless setup>",
      "subheadline": "<subheadline clarifying exact next step with zero barrier>",
      "psychology": "<psychological reason for urgent commitment>",
      "impact": "<expected metric lift, e.g. '+24% Inquiries' or '+35% Checkout Starts'>"
    },
    {
      "id": "var_c",
      "type": "Social Proof & Category Authority",
      "headline": "<authoritative headline referencing customer trust, reviews, or industry leadership>",
      "subheadline": "<subheadline highlighting ratings, satisfaction guarantee, and proven track record>",
      "psychology": "<psychological peer validation removing skepticism>",
      "impact": "<expected metric lift, e.g. '+21% Lead Submissions'>"
    }
  ],
  "generatedSchemaJsonLd": "<complete, valid copy-pasteable script tag: <script type=\\"application/ld+json\\">{\\"@context\\": \\"https://schema.org\\", ...}</script> specifically for this business model (LocalBusiness, Product, or SoftwareApplication) using their real domain and niche>",
  "generatedFunnelStages": [
    {
      "stage": "<stage 1 name, e.g. 'Hero CTA / Mobile Click-to-Call Drop-off'>",
      "pct": 38,
      "reason": "<why visitors drop off here>",
      "fix": "<exact engineering or copy fix>",
      "urgency": "HIGH"
    },
    {
      "stage": "<stage 2 name, e.g. 'Lead Form / Product Page Hesitation'>",
      "pct": 27,
      "reason": "<why visitors drop off here>",
      "fix": "<exact fix>",
      "urgency": "HIGH"
    },
    {
      "stage": "<stage 3 name, e.g. 'Social Proof & Trust Skepticism'>",
      "pct": 21,
      "reason": "<why visitors drop off here>",
      "fix": "<exact fix>",
      "urgency": "MEDIUM"
    },
    {
      "stage": "<stage 4 name, e.g. 'Alternative Messaging / Checkout Friction'>",
      "pct": 14,
      "reason": "<why visitors drop off here>",
      "fix": "<exact fix>",
      "urgency": "LOW"
    }
  ],
  "competitorBenchmark": {
    "competitorNiche": "<niche benchmark description, e.g. 'Top 10% Industry Leaders in Austin Plumbing'>",
    "competitorScore": 88,
    "metrics": [
      {
        "name": "Mobile Click-to-Call Link (tel:)",
        "target": false,
        "competitor": true,
        "verdict": "<comparison verdict>"
      },
      {
        "name": "Schema.org (ChatGPT & AI Search Indexing)",
        "target": false,
        "competitor": true,
        "verdict": "<comparison verdict>"
      },
      {
        "name": "Zero-Friction Conversion Funnel",
        "target": false,
        "competitor": true,
        "verdict": "<comparison verdict>"
      },
      {
        "name": "Customer Video Social Proof",
        "target": false,
        "competitor": true,
        "verdict": "<comparison verdict>"
      }
    ],
    "advantages": [
      "<specific design or offering advantage your site currently has>"
    ],
    "vulnerabilities": [
      "<where rival competitors are currently stealing your customers>"
    ],
    "winningMoves": [
      "<concrete move 1 to beat top competitors>",
      "<concrete move 2 to beat top competitors>",
      "<concrete move 3 to beat top competitors>"
    ]
  },
  "recommendations": [
    {
      "id": "<unique string id>",
      "title": "<punchy, authoritative title>",
      "category": "<one of: AEO_SEO, FUNNEL_LEAKAGE, DESIGN_ERA, TRUST_CREDIBILITY, MARKETING_PSYCHOLOGY, SPEED_TECH>",
      "priority": "<one of: HIGH, MEDIUM, LOW>",
      "targetPage": "<e.g. 'Mobile Header & Sticky Bar', 'Contact / Booking Page', 'Service Detail Page', 'Product Detail Page (PDP)', 'Homepage'>",
      "implementationType": "<one of: ⚡ Quick Win (<30m), 🛠️ Optimization (~2h), 🚀 Strategic Redesign>",
      "suggestedChange": "<exact concrete change to execute>",
      "benefit": "<expected business metric impact, e.g. '+35% Inbound Phone Calls' or '+28% Form Completions'>",
      "rationale": "<deep psychological reason and behavioral data behind why visitors respond to this>",
      "effort": "<e.g. 'Quick Fix (~20m)', 'Moderate (~2h)', 'Strategic (~1d)'>",
      "actionableSnippet": "<optional exact HTML/CSS snippet, Schema JSON-LD code, or copy to paste directly>"
    }
  ]
}

CRITICAL JSON FORMATTING & SERIALIZATION RULES:
1. Return ONLY valid RFC 8259 JSON format matching the schema above.
2. In all code snippets inside "actionableSnippet" and "generatedSchemaJsonLd", strictly use SINGLE QUOTES (') for HTML attributes (e.g., <a href='tel:123' class='btn'> instead of double quotes) so double quotes never break the JSON string encoding.
3. Never use raw unescaped newlines inside JSON string properties; escape all newlines with \\n.
4. Ensure you provide between 6 and 9 rich, hyper-actionable recommendations. High priority items must address the most catastrophic conversion and search leaks first.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.25,
      maxOutputTokens: 8192,
    },
  });

  const rawJson = response.text;
  if (!rawJson) {
    throw new Error("Empty response received from Gemini.");
  }

  const parsed = parseAndRepairAiJson(rawJson);

  // Validate and salvage data if minor schema mismatches occur
  let validated: AuditReportData;
  const result = AuditReportDataSchema.safeParse(parsed);
  if (result.success) {
    validated = result.data;
  } else {
    console.warn("Schema validation warnings on AI response:", result.error.format());
    const rawRecs = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
    const sanitizedRecs = rawRecs.map((r: any, idx: number) => ({
      id: r?.id || `rec_${idx + 1}`,
      title: r?.title || "Conversion Rate Optimization Opportunity",
      category: r?.category || "DESIGN_ERA",
      priority: ["HIGH", "MEDIUM", "LOW"].includes(String(r?.priority).toUpperCase())
        ? String(r?.priority).toUpperCase()
        : "MEDIUM",
      targetPage: r?.targetPage || "Product Page (PDP)",
      implementationType: r?.implementationType || "Optimization (~1-2h)",
      suggestedChange: r?.suggestedChange || "Implement recommended conversion fixes.",
      benefit: r?.benefit || "+15% Conversion Rate",
      rationale: r?.rationale || "Reduces visitor hesitation and friction.",
      effort: r?.effort || "Moderate (~2h)",
      actionableSnippet: r?.actionableSnippet || undefined,
    }));

    validated = AuditReportDataSchema.parse({
      ...parsed,
      recommendations: sanitizedRecs.length > 0 ? sanitizedRecs : [
        {
          id: "rec_1",
          title: "Mobile Conversion Optimization",
          category: "DESIGN_ERA",
          priority: "HIGH",
          targetPage: "Homepage & Mobile Header",
          implementationType: "⚡ Quick Win (<30m)",
          suggestedChange: "Streamline mobile CTAs and remove layout friction.",
          benefit: "+20% Inbound Inquiries",
          rationale: "Mobile users bounce quickly when primary actions are hard to reach.",
          effort: "Quick Fix (~20m)",
        }
      ],
    });
  }

  // Sort recommendations by priority (HIGH first, then MEDIUM, then LOW)
  const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  validated.recommendations.sort(
    (a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
  );

  return validated;
}

function parseAndRepairAiJson(rawText: string): any {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI model.");
  }

  let text = rawText.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ...)
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  // 1. Try native JSON.parse
  try {
    return JSON.parse(text);
  } catch (err: any) {
    console.warn("Direct JSON.parse failed. Attempting jsonrepair...", err.message);
  }

  // 2. Try jsonrepair (repairs unescaped quotes inside strings, trailing commas, missing brackets)
  try {
    const repaired = jsonrepair(text);
    return JSON.parse(repaired);
  } catch (repairErr: any) {
    console.warn("jsonrepair attempt 1 failed. Sanitizing unescaped control chars...", repairErr.message);
    const m = repairErr.message.match(/position (\d+)/);
    if (m) {
      const p = parseInt(m[1], 10);
      console.log("SURROUNDING TEXT AT REPAIR ERROR (pos " + p + "):", JSON.stringify(text.slice(Math.max(0, p - 100), Math.min(text.length, p + 100))));
    }
  }

  // 3. Try sanitizing raw newlines/control characters and then repair
  try {
    const sanitized = text
      .replace(/[\u0000-\u001F]+/g, (match) => {
        if (match.includes("\n")) return "\\n";
        if (match.includes("\r")) return "";
        if (match.includes("\t")) return "\\t";
        return "";
      });
    return JSON.parse(jsonrepair(sanitized));
  } catch (finalErr: any) {
    console.error("All JSON repair attempts failed. Raw response preview:", text.slice(0, 1000));
    throw new Error("AI returned malformed JSON response. Please click Re-Analyze to regenerate.");
  }
}

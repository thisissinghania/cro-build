"use client";

import React, { useState, useMemo } from "react";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Code2,
  ShieldAlert,
} from "lucide-react";
import { RecommendationCard } from "@/components/dashboard/audit/recommendation-card";

interface AeoSearchRadarTabProps {
  report: any;
  diagnostics?: any;
  recommendations?: any[];
}

export function AeoSearchRadarTab({
  report,
  diagnostics = {},
  recommendations = [],
}: AeoSearchRadarTabProps) {
  const websiteUrl = report.websiteUrl || "https://yourwebsite.com";
  const websiteType = report.websiteType || diagnostics.websiteType || "GENERAL_WEBSITE";
  const businessNiche = report.businessNiche || diagnostics.businessNiche || "Local Business & Service";
  const aeoScore = report.aeoReadinessScore ?? diagnostics.aeoReadinessScore ?? 42;

  const [copiedSchema, setCopiedSchema] = useState(false);

  // Generate tailored JSON-LD code snippet for this website
  const schemaCode = useMemo(() => {
    if (
      diagnostics?.generatedSchemaJsonLd &&
      typeof diagnostics.generatedSchemaJsonLd === "string" &&
      diagnostics.generatedSchemaJsonLd.trim().length > 20
    ) {
      return diagnostics.generatedSchemaJsonLd;
    }

    let domain = "yourwebsite.com";
    try {
      domain = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`).hostname;
    } catch { }

    if (websiteType === "LOCAL_SERVICE") {
      return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${domain.replace(/\..+/, "").toUpperCase()} Services",
  "image": "https://${domain}/logo.png",
  "@id": "https://${domain}",
  "url": "https://${domain}",
  "telephone": "+1-800-555-0199",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Way",
    "addressLocality": "Metro City",
    "addressRegion": "CA",
    "postalCode": "90210",
    "addressCountry": "US"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "08:00",
    "closes": "20:00"
  }
}
</script>`;
    }

    if (websiteType === "SAAS_B2B") {
      return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "${domain.replace(/\..+/, "").toUpperCase()}",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "url": "https://${domain}",
  "offers": {
    "@type": "Offer",
    "price": "49.00",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "124"
  }
}
</script>`;
    }

    // Default Organization / Product
    return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${domain.replace(/\..+/, "").toUpperCase()}",
  "url": "https://${domain}",
  "logo": "https://${domain}/logo.png",
  "sameAs": [
    "https://facebook.com/${domain}",
    "https://twitter.com/${domain}",
    "https://linkedin.com/company/${domain}"
  ]
}
</script>`;
  }, [websiteUrl, websiteType]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaCode);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  // 4 Essential AEO Entity Signals Data
  const entitySignals = useMemo(() => [
    {
      name: websiteType === "LOCAL_SERVICE" ? "LocalBusiness Schema" : "Organization / Product Schema",
      isActive: false,
      description: "Tells AI search models your exact business name, verified phone number, operating hours, and geo-coordinates in machine-readable JSON-LD.",
      impact: "ChatGPT and Perplexity overlook your website and cite competing stores that have indexed schema."
    },
    {
      name: "FAQPage Structured Data",
      isActive: false,
      description: "Structured Q&A pairs (e.g., pricing, warranties, turnaround times) that conversational AI models pull verbatim into answers.",
      impact: "Voice search engines (Siri, Google Assistant) cannot extract quick answers about your business."
    },
    {
      name: "AggregateRating Markup",
      isActive: false,
      description: "Cryptographic JSON-LD representation of your Google / Trustpilot star ratings and verified review count.",
      impact: "AI models default to assuming zero customer ratings and recommend higher-rated competitors."
    },
    {
      name: "Viewport & Clean HTML Semantics",
      isActive: true,
      description: "Mobile viewport meta tags, semantic HTML5 landmarks, and valid DOM hierarchy allowing AI crawlers to parse page text accurately.",
      impact: "Clean semantic structure enables LLM web scrapers to read product and offer details without rendering errors."
    }
  ], [websiteType]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Top AEO Score & Overview Card (Using Primary Indigo & Emerald Green, No Shadow) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/90 via-white to-emerald-50/70 border border-indigo-200/80 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] bg-indigo-100 text-indigo-800 text-xs font-semibold border border-indigo-200">
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                Answer Engine Optimization (AEO)
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500">
                ChatGPT, Perplexity &amp; Gemini Discovery
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-1.5">
              AI Answer Engine Visibility &amp; Citation Health
            </h3>
            <p className="text-[16px] text-zinc-600 max-w-2xl leading-relaxed">
              In 2026, millions of customers ask AI chatbots rather than scrolling Google links.
              If your site lacks Schema.org JSON-LD and structured entity markup, AI models will recommend your competitors instead.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-indigo-200/70 flex flex-col items-center justify-center min-w-[200px] sm:min-w-[220px] shrink-0">
            <span className="text-xs uppercase font-bold text-zinc-400 mb-1">
              AI Readiness Score
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-4xl font-bold text-indigo-600 tracking-tight">
                {aeoScore}
              </span>
              <span className="text-base font-bold text-zinc-400">/100</span>
            </div>
            <span className="inline-flex items-center justify-center h-[24px] text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 rounded-[4px] mt-2 border border-indigo-200 whitespace-nowrap">
              {aeoScore >= 75 ? "High AI Visibility" : "Critical Citations Missing"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Live AI Query Simulation (No Outer White Box, No Shadow, Standard Badges) */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900 leading-tight">
            Live AI Query Simulation (What Chatbots Say)
          </h4>
          <p className="text-[16px] text-zinc-500 mt-0.5">
            Simulating prompt response on ChatGPT / Perplexity for your niche.
          </p>
        </div>

        {/* Clean Direct Chat Flow */}
        <div className="space-y-3">
          {/* Mock Chat Prompt */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
              User
            </span>
            <p className="text-[16px] font-medium text-zinc-800">
              &quot;Recommend the most trusted {businessNiche.toLowerCase()} with fast response, verified reviews, and transparent pricing.&quot;
            </p>
          </div>

          {/* Mock LLM Answer */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/40 rounded-xl border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center justify-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-indigo-600 text-white shrink-0">
                  AI
                </span>
                <span className="font-bold text-sm text-indigo-950 truncate">
                  Perplexity / ChatGPT Simulated Response
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Your Website Overlooked
              </span>
            </div>

            <p className="text-[16px] text-zinc-700 leading-relaxed">
              &quot;Based on indexed structured entities and verified customer rating signals, the top-recommended providers are
              <strong className="text-zinc-900"> [Competitor A]</strong> and <strong className="text-zinc-900">[Competitor B]</strong>. Both feature verified LocalBusiness schema, transparent dispatch pricing, and verified aggregate review ratings.&quot;
            </p>

            <div className="pt-3 border-t border-indigo-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 text-sm leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-rose-800">
                  Reason your site was not cited:{" "}
                  <span className="font-medium text-rose-900">
                    Missing Schema.org JSON-LD &amp; NAP consistency.
                  </span>
                </span>
              </div>
              <span className="text-zinc-500 font-medium text-xs sm:text-sm whitespace-nowrap shrink-0">
                Fix below to get indexed within 7–14 days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AEO Entity Markup Checklist (No Shadow, Standard Badges) */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-zinc-900">
              AEO Entity Markup Checklist
            </h4>
            <p className="text-[16px] text-zinc-500 mt-0.5">
              The 4 mandatory technical signals AI engines require before citing a business.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            4 Essential AI Signals
          </span>
        </div>

        {/* 4 Cards Matching Previous Tabs (No Shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entitySignals.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 bg-white border border-zinc-200/60 rounded-xl flex flex-col justify-between"
            >
              <div>
                {/* Top Row: #index + Signal Name on Left, Status Badge on Right */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-[24px] rounded-[4px] bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center font-bold text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <h5 className="font-bold text-zinc-900 text-base truncate">{item.name}</h5>
                  </div>
                  {item.isActive ? (
                    <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Validated Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 whitespace-nowrap shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Missing from &lt;head&gt;
                    </span>
                  )}
                </div>

                {/* Description Paragraph (Standard 16px font matching other tabs) */}
                <p className="text-[16px] text-zinc-600 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Bottom Box (Identical to Fast Fix / Market Advantage in other tabs) */}
              {item.isActive ? (
                <div className="flex items-start gap-2.5 bg-emerald-50/60 p-3 sm:p-3.5 rounded-lg border border-emerald-100 text-sm text-emerald-950 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-800 mr-1.5">AI Advantage:</span>
                    <span className="text-emerald-900 font-medium">{item.impact}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 bg-rose-50/60 p-3 sm:p-3.5 rounded-lg border border-rose-100 text-sm text-rose-950 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-800 mr-1.5">AI Penalty:</span>
                    <span className="text-rose-900 font-medium">{item.impact}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ready-to-Inject Schema.org JSON-LD Script Box (No Shadow) */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900">
            Ready-to-Paste Schema.org JSON-LD Script
          </h4>
          <p className="text-[16px] text-zinc-500 mt-0.5">
            Copy and paste this snippet directly inside your website&apos;s &lt;head&gt; tag to activate AI search discovery.
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-semibold text-zinc-300">Generated JSON-LD Schema</span>
            </div>

            <button
              onClick={handleCopySchema}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shrink-0 shadow-none"
            >
              {copiedSchema ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy JSON-LD Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-zinc-900 rounded-xl overflow-x-auto text-xs text-indigo-300 font-mono leading-relaxed border border-zinc-800">
            <code>{schemaCode}</code>
          </pre>
        </div>
      </div>

      {/* 5. Targeted AI Search & Schema Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4 pt-2 sm:pt-4">
          <div>
            <h4 className="text-xl font-bold text-zinc-900">
              Targeted AEO &amp; AI Search Fixes ({recommendations.length})
            </h4>
            <p className="text-[16px] text-zinc-500 mt-0.5">
              Specific structured data, FAQ, and citation fixes to get indexed and recommended by ChatGPT &amp; Perplexity.
            </p>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <RecommendationCard key={rec.id || idx} rec={rec} index={idx} noShadow />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

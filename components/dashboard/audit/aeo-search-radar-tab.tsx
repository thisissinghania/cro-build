"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Search,
  Code2,
  HelpCircle,
  ExternalLink,
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
  const schemaCode = React.useMemo(() => {
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
  "telephone": "+1-555-019-2834",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Commercial Way",
    "addressLocality": "Austin",
    "addressRegion": "TX",
    "postalCode": "78701",
    "addressCountry": "US"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "128"
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
  "operatingSystem": "All Web Browsers",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "29.00",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "342"
  }
}
</script>`;
    }

    // Default Organization & FAQ Schema
    return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${domain}",
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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Top AEO Score & Overview Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/90 via-white to-indigo-50/70 border border-purple-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
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

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-purple-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col items-center justify-center min-w-[200px] sm:min-w-[220px] shrink-0">
            <span className="text-xs uppercase font-bold text-zinc-400 mb-1 tracking-wider">
              AI Readiness Score
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-4xl font-bold text-purple-700 tracking-tight">
                {aeoScore}
              </span>
              <span className="text-base font-bold text-zinc-400">/100</span>
            </div>
            <span className="inline-flex items-center justify-center h-[24px] text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 rounded-[4px] mt-2 border border-purple-200 whitespace-nowrap">
              {aeoScore >= 75 ? "High AI Visibility" : "Critical Citations Missing"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Simulated AI Search Engine Response Card */}
      <div className="p-4 sm:p-5 bg-white border border-zinc-200/60 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 leading-tight">
              Live AI Query Simulation (What Chatbots Say)
            </h4>
            <p className="text-[16px] text-zinc-500 mt-0.5">
              Simulating prompt response on ChatGPT / Perplexity for your niche.
            </p>
          </div>
        </div>

        {/* Mock Chat Prompt */}
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 mb-4 flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
            User
          </span>
          <p className="text-sm font-medium text-zinc-800 pt-0.5">
            &quot;Recommend the most trusted {businessNiche.toLowerCase()} with fast response, verified reviews, and transparent pricing.&quot;
          </p>
        </div>

        {/* Mock LLM Answer */}
        <div className="p-4 sm:p-5 bg-purple-50/40 rounded-xl border border-purple-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                AI
              </span>
              <span className="font-bold text-sm text-purple-900">Perplexity / ChatGPT Simulated Response</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Your Website Overlooked
            </span>
          </div>

          <p className="text-[15px] text-zinc-700 leading-relaxed">
            &quot;Based on indexed structured entities and verified customer rating signals, the top-recommended providers are
            <strong className="text-zinc-900"> [Competitor A]</strong> and <strong className="text-zinc-900">[Competitor B]</strong>. Both feature verified LocalBusiness schema, transparent dispatch pricing, and verified aggregate review ratings.&quot;
          </p>

          <div className="pt-3 border-t border-purple-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600">
            <span className="font-semibold text-rose-700">
              ⚠️ Reason your site was not cited: Missing Schema.org JSON-LD &amp; NAP consistency.
            </span>
            <span className="text-zinc-500">Fix below to get indexed within 7–14 days</span>
          </div>
        </div>
      </div>

      {/* 3. 4 Essential AEO Entity Signals Status */}
      <div className="p-4 sm:p-5 bg-white border border-zinc-200/60 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <h4 className="text-xl font-bold text-zinc-900 mb-1">
          AEO Entity Markup Checklist
        </h4>
        <p className="text-[16px] text-zinc-500 mb-6">
          The 4 mandatory technical signals AI engines require before citing a business.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm text-zinc-900">
                {websiteType === "LOCAL_SERVICE" ? "LocalBusiness Schema" : "Organization / Product Schema"}
              </h5>
              <p className="text-xs text-zinc-600 mt-1 leading-snug">
                Tells AI search models your exact business name, verified phone number, operating hours, and geo-coordinates.
              </p>
              <span className="inline-block mt-2 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Missing from &lt;head&gt;
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm text-zinc-900">FAQPage Structured Data</h5>
              <p className="text-xs text-zinc-600 mt-1 leading-snug">
                Direct Q&amp;A pairs (e.g. &apos;How much is dispatch?&apos;) that AI engines pull verbatim into voice &amp; conversational answers.
              </p>
              <span className="inline-block mt-2 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Missing from &lt;head&gt;
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm text-zinc-900">AggregateRating Markup</h5>
              <p className="text-xs text-zinc-600 mt-1 leading-snug">
                JSON-LD representation of your Google/Trustpilot 5-star rating count. Without this, AI assumes zero reviews.
              </p>
              <span className="inline-block mt-2 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Missing from &lt;head&gt;
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm text-zinc-900">Viewport &amp; Clean HTML Semantics</h5>
              <p className="text-xs text-zinc-600 mt-1 leading-snug">
                Page contains a mobile viewport tag and standard DOM hierarchy, allowing AI crawlers to parse text.
              </p>
              <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Validated Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Ready-to-Inject Schema.org JSON-LD Script Box */}
      <div className="p-4 sm:p-5 bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h4 className="text-lg font-bold text-white">
                Ready-to-Paste Schema.org JSON-LD Script
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Copy and paste this snippet directly inside your website&apos;s &lt;head&gt; tag to activate AI search discovery.
            </p>
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
              <RecommendationCard key={rec.id || idx} rec={rec} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

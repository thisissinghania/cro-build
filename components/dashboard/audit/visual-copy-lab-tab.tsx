"use client";

import React, { useState } from "react";
import {
  Palette,
  Copy,
  Check,
} from "lucide-react";
import { RecommendationCard } from "@/components/dashboard/audit/recommendation-card";

interface VisualCopyLabTabProps {
  report: any;
  diagnostics?: any;
  recommendations?: any[];
}

export function VisualCopyLabTab({
  report,
  diagnostics = {},
  recommendations = [],
}: VisualCopyLabTabProps) {
  const websiteUrl = report.websiteUrl || "https://yourwebsite.com";
  const websiteType = report.websiteType || diagnostics.websiteType || "GENERAL_WEBSITE";
  const businessNiche = report.businessNiche || diagnostics.businessNiche || "Service Provider";

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 3 Psychological Headline Variants Tailored to Business Model
  const headlineVariants = React.useMemo(() => {
    if (
      diagnostics?.generatedHeadlines &&
      Array.isArray(diagnostics.generatedHeadlines) &&
      diagnostics.generatedHeadlines.length > 0
    ) {
      return diagnostics.generatedHeadlines;
    }

    if (websiteType === "LOCAL_SERVICE") {
      return [
        {
          id: "var_a",
          type: "Loss Aversion (Pain Avoidance)",
          headline: "Don't Let a Small Emergency Turn Into a Thousands-Dollar Disaster.",
          subheadline: "Licensed, certified local experts arriving at your doorstep in under 45 minutes. Upfront flat-rate pricing with zero surprise dispatch fees.",
          psychology: "Homeowners act 3x faster when reminded of escalating repair costs if delayed.",
          impact: "+32% Call Rate",
        },
        {
          id: "var_b",
          type: "Speed & Relief (Urgency)",
          headline: "Fast, Reliable & Honest Emergency Service — On-Site in 45 Minutes.",
          subheadline: "Need help right now? Call our 24/7 emergency dispatch line for immediate priority scheduling and a free quote.",
          psychology: "Removes anxiety by promising an exact arrival time and immediate human availability.",
          impact: "+26% Immediate Inquiries",
        },
        {
          id: "var_c",
          type: "Social Proof & Local Trust",
          headline: "The #1 Rated Service Specialists Trusted by 500+ Local Homeowners.",
          subheadline: "Backed by 4.9 stars across Google & Yelp. Fully licensed, insured, and 100% satisfaction guaranteed on every single job.",
          psychology: "Skeptical buyers look for neighborhood peer validation before inviting strangers into their home.",
          impact: "+21% Form Submissions",
        },
      ];
    }

    if (websiteType === "SAAS_B2B") {
      return [
        {
          id: "var_a",
          type: "Outcome Driven (Efficiency)",
          headline: "Cut 12 Hours of Manual Work Every Week Without Adding Headcount.",
          subheadline: "The automated platform designed for high-growth teams. Get started in 2 minutes with zero developer setup required.",
          psychology: "Managers buy hours saved and reduced labor costs, not software features.",
          impact: "+29% Free Trial Starts",
        },
        {
          id: "var_b",
          type: "Frictionless Trial (Zero Risk)",
          headline: "Start Automating Today — Free Forever, No Credit Card Required.",
          subheadline: "Experience why 10,000+ modern teams run their daily operations on our cloud platform. Cancel or upgrade anytime.",
          psychology: "Eliminates commitment fear and fear of unauthorized credit card charges.",
          impact: "+38% Signup Rate",
        },
        {
          id: "var_c",
          type: "Category Authority",
          headline: "The Modern Operating System for Fast-Moving Businesses.",
          subheadline: "Rated 4.8/5 on G2 Crowd. Built for speed, bank-grade encryption security, and seamless API integrations.",
          psychology: "Enterprise buyers seek market leader validation to reduce career risk.",
          impact: "+18% Enterprise Demo Bookings",
        },
      ];
    }

    // Default & E-commerce
    return [
      {
        id: "var_a",
        type: "Loss Aversion (Limited Drop)",
        headline: "Premium Quality Engineered to Last — Limited Batch Now in Stock.",
        subheadline: "Crafted with hospital-grade materials. Order today with free priority shipping before the seasonal drop sells out.",
        psychology: "Fear of missing out (FOMO) triggers immediate cart checkout without hesitation.",
        impact: "+24% Add-to-Cart Lift",
      },
      {
        id: "var_b",
        type: "Risk-Free Trial (Confidence)",
        headline: "Experience the Difference or It's 100% On Us for 30 Days.",
        subheadline: "Try it completely risk-free. If you don't fall in love, return it for a full refund with free prepaid return shipping.",
        psychology: "Shifts all buying risk from the consumer onto the brand, eliminating purchase hesitation.",
        impact: "+34% Checkout Completion",
      },
      {
        id: "var_c",
        type: "Creator & Social Proof",
        headline: "Over 50,000 Verified 5-Star Reviews Can't Be Wrong.",
        subheadline: "Featured on Forbes, Vogue, and GQ. Discover why customers are ditching traditional alternatives for our award-winning design.",
        psychology: "Mass consensus reduces product quality skepticism.",
        impact: "+19% Conversion Rate",
      },
    ];
  }, [websiteType]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Header Card (No Shadow, Standard Badges, Stat Box on Right) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/70 border border-indigo-200/80 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] bg-indigo-100 text-indigo-800 text-xs font-semibold border border-indigo-200">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                Visual &amp; Copywriting Laboratory
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500">
                2026 High-Converting Redesign Blueprint
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-1.5">
              Conversion Redesign &amp; Psychological Copy Variants
            </h3>
            <p className="text-[16px] text-zinc-600 max-w-2xl leading-relaxed">
              Google Analytics tells you people bounced. Our Visual Lab shows you what your hero layout and headlines should actually look like to capture immediate conversions.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-indigo-200/70 flex flex-col items-center justify-center min-w-[200px] sm:min-w-[220px] shrink-0">
            <span className="text-xs uppercase font-bold text-zinc-400 mb-1">
              Est. Conversion Lift
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-600 tracking-tight">
                +140%
              </span>
              <span className="text-xs font-bold text-emerald-700">Lift</span>
            </div>
            <span className="inline-flex items-center justify-center h-[24px] text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 rounded-[4px] mt-2 border border-indigo-200 whitespace-nowrap">
              {headlineVariants.length} A/B Variants Ready
            </span>
          </div>
        </div>
      </div>

      {/* 2. Psychological Headline A/B Test Variants Generator (No Outer White Box, No Shadow) */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900 leading-tight">
            3 Psychological Headline Variants (Ready to A/B Test)
          </h4>
          <p className="text-[16px] text-zinc-500 mt-0.5">
            Engineered using behavioral psychology principles. Click to copy and test on your website.
          </p>
        </div>

        <div className="space-y-4">
          {headlineVariants.map((item: any) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 bg-white rounded-xl border border-zinc-200/70 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                    {item.type}
                  </span>
                  <span className="inline-flex items-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
                    {item.impact}
                  </span>
                </div>

                <h5 className="text-lg font-bold text-zinc-900 leading-snug">
                  &quot;{item.headline}&quot;
                </h5>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {item.subheadline}
                </p>

                <div className="text-sm text-zinc-600 leading-relaxed">
                  <span className="text-zinc-800 font-semibold mr-1">Why this works:</span>
                  <span className="text-zinc-600">{item.psychology}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(`${item.headline}\n${item.subheadline}`, item.id)}
                className="inline-flex items-center justify-center gap-1.5 h-[44px] px-4 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedKey === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Copy Headline</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Targeted UX, Design & Copywriting Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4 pt-2 sm:pt-4">
          <div>
            <h4 className="text-xl font-bold text-zinc-900">
              Targeted UX, Design &amp; Copywriting Fixes ({recommendations.length})
            </h4>
            <p className="text-[16px] text-zinc-500 mt-0.5">
              Specific visual layout, trust proof, and psychological copy improvements to boost conversions.
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

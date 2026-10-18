"use client";

import React, { useMemo } from "react";
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
  Sparkles,
} from "lucide-react";
import { RecommendationCard } from "@/components/dashboard/audit/recommendation-card";
import { formatRevenueLossPercentage } from "@/lib/utils/formatters";

interface RevenueLeakageTabProps {
  report: any;
  diagnostics?: any;
  recommendations: any[];
}

export function RevenueLeakageTab({
  report,
  diagnostics = {},
  recommendations,
}: RevenueLeakageTabProps) {
  const websiteType = report.websiteType || diagnostics.websiteType || "GENERAL_WEBSITE";
  const businessNiche = report.businessNiche || diagnostics.businessNiche || "Business";
  const estLossString = report.estimatedRevenueLoss || "$2,400/mo";

  // Parse baseline numeric loss if present
  const parsedLoss = parseInt(estLossString.replace(/[^0-9]/g, ""), 10) || 2400;

  // Projected Financial Recovery Baseline
  const monthlyVisitors = websiteType === "LOCAL_SERVICE" ? 1200 : websiteType === "SAAS_B2B" ? 3500 : 5000;
  const avgLeadValue = websiteType === "LOCAL_SERVICE" ? 250 : websiteType === "SAAS_B2B" ? 99 : 65;
  const currentCr = 1.6;
  const targetLift = 45; // +45% relative lift from recommendations

  // Calculation logic
  const currentConversions = Math.round((monthlyVisitors * currentCr) / 100);
  const currentRevenue = Math.round(currentConversions * avgLeadValue);

  const improvedCr = Number((currentCr * (1 + targetLift / 100)).toFixed(2));
  const projectedConversions = Math.round((monthlyVisitors * improvedCr) / 100);
  const projectedRevenue = Math.round(projectedConversions * avgLeadValue);
  const additionalMonthlyRevenue = projectedRevenue - currentRevenue;
  const annualAdditionalRevenue = additionalMonthlyRevenue * 12;

  // Dynamic Leakage Stages
  const leakageStages = useMemo(() => {
    if (
      diagnostics?.generatedFunnelStages &&
      Array.isArray(diagnostics.generatedFunnelStages) &&
      diagnostics.generatedFunnelStages.length > 0
    ) {
      return diagnostics.generatedFunnelStages.map((s: any) => ({
        stage: s.stage,
        pct: s.pct || 25,
        loss: Math.round(parsedLoss * ((s.pct || 25) / 100)),
        reason: s.reason,
        fix: s.fix,
        urgency: s.urgency || "HIGH",
      }));
    }

    if (websiteType === "LOCAL_SERVICE") {
      return [
        {
          stage: "Emergency Click-to-Call Drop-off",
          pct: 38,
          loss: Math.round(parsedLoss * 0.38),
          reason: "Visitors with urgent plumbing/repair needs bounce within 6 seconds if there is no floating 1-tap phone button.",
          fix: "Deploy persistent floating call button with 24/7 emergency dispatch badge.",
          urgency: "HIGH",
        },
        {
          stage: "Quote Form Friction & Fatigue",
          pct: 27,
          loss: Math.round(parsedLoss * 0.27),
          reason: "Forms with more than 4 fields or asking for full address upfront suffer 62% abandonment.",
          fix: "Switch to a 2-step estimate form (Job Type + Phone Number only).",
          urgency: "HIGH",
        },
        {
          stage: "Credibility & License Skepticism",
          pct: 21,
          loss: Math.round(parsedLoss * 0.21),
          reason: "Homeowners fear unlicensed contractors. Missing Google 5-star badge above fold causes immediate back-button clicks.",
          fix: "Place verified Google rating + license number directly beneath the main CTA.",
          urgency: "MEDIUM",
        },
        {
          stage: "No Instant WhatsApp / SMS Option",
          pct: 14,
          loss: Math.round(parsedLoss * 0.14),
          reason: "Millennial and busy working clients prefer messaging over voice calls during work hours.",
          fix: "Add a 1-click WhatsApp or SMS inquiry button with instant automated reply.",
          urgency: "LOW",
        },
      ];
    }

    if (websiteType === "SAAS_B2B") {
      return [
        {
          stage: "Pricing Ambiguity & Forced Demo",
          pct: 36,
          loss: Math.round(parsedLoss * 0.36),
          reason: "Buyers abandon when pricing is hidden behind a mandatory 'Talk to Sales' wall.",
          fix: "Add transparent self-serve starter tier and interactive pricing calculator.",
          urgency: "HIGH",
        },
        {
          stage: "Signup Onboarding Friction",
          pct: 29,
          loss: Math.round(parsedLoss * 0.29),
          reason: "Requiring credit card upfront or company domain emails reduces signup rates by 54%.",
          fix: "Offer 1-click Google OAuth signup with zero credit card required.",
          urgency: "HIGH",
        },
        {
          stage: "Lack of Interactive Product Demo",
          pct: 20,
          loss: Math.round(parsedLoss * 0.2),
          reason: "Buyers want to see the UI before signing up. Static text fails to prove product value.",
          fix: "Embed a 60-second interactive click-through demo or GIF preview.",
          urgency: "MEDIUM",
        },
        {
          stage: "Compliance & Security Hesitation",
          pct: 15,
          loss: Math.round(parsedLoss * 0.15),
          reason: "Enterprise users look for SOC2, GDPR, and clear data deletion policies.",
          fix: "Add compliance security seals and transparent cancellation guarantee in footer.",
          urgency: "LOW",
        },
      ];
    }

    // Default & E-commerce
    return [
      {
        stage: "Product Detail Page Hesitation",
        pct: 42,
        loss: Math.round(parsedLoss * 0.42),
        reason: "Unclear delivery timelines and missing video social proof create decision paralysis.",
        fix: "Add zip code delivery estimator and user-generated video review carousel.",
        urgency: "HIGH",
      },
      {
        stage: "Cart Abandonment (No Sticky Bar)",
        pct: 28,
        loss: Math.round(parsedLoss * 0.28),
        reason: "Mobile shoppers lose the CTA when scrolling through long product descriptions.",
        fix: "Implement a sticky floating bottom Add-to-Cart bar with variant selector.",
        urgency: "HIGH",
      },
      {
        stage: "Unexpected Shipping & Tax Surprise",
        pct: 18,
        loss: Math.round(parsedLoss * 0.18),
        reason: "Shipping fee discovered for the first time at checkout causes 48% of cart drop-offs.",
        fix: "Display dynamic free shipping progress bar inside slide-out cart drawer.",
        urgency: "MEDIUM",
      },
      {
        stage: "Trust & Return Policy Ambiguity",
        pct: 12,
        loss: Math.round(parsedLoss * 0.12),
        reason: "Shoppers worry about complicated return processes if the product doesn't fit.",
        fix: "Add '30-Day Hassle-Free Returns & Free Exchanges' badge below checkout button.",
        urgency: "LOW",
      },
    ];
  }, [websiteType, parsedLoss]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Top Executive Loss Headline Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/90 via-white to-amber-50/70 border border-rose-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                Capital Leakage Identified
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500">
                Audited for {report.websiteUrl}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-1.5">
              Estimated Monthly Revenue Bleeding
            </h3>
            <p className="text-[16px] text-zinc-600 max-w-2xl leading-relaxed">
              Based on your current conversion signals, traffic patterns, and high-friction exit points,
              your website is currently missing out on substantial revenue every single month.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-rose-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col items-center justify-center min-w-[200px] sm:min-w-[220px] shrink-0 text-center">
            <span className="text-xs uppercase font-bold text-zinc-400 mb-1">
              Monthly Loss
            </span>
            <span className="text-3xl sm:text-4xl font-bold text-rose-600 tracking-tight my-0.5">
              {formatRevenueLossPercentage(estLossString)}
            </span>
            <span className="inline-flex items-center justify-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 mt-2 whitespace-nowrap">
              ~${annualAdditionalRevenue.toLocaleString()} Lost Per Year
            </span>
          </div>
        </div>
      </div>

      {/* 2. Projected Financial Recovery Impact (Direct Clean Strip - No Sliders, No Nested White Box) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-emerald-50/60 border border-indigo-100/90 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Column 1: Current Run-Rate */}
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-zinc-500 mb-1">
              Current Monthly Run-Rate
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-800 my-0.5">
              ${currentRevenue.toLocaleString()}
            </div>
            <span className="text-xs font-semibold text-zinc-500 mt-1 block">
              {currentConversions} orders / mo ({currentCr}% CR)
            </span>
          </div>

          {/* Column 2: Optimized Run-Rate */}
          <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-indigo-200/60 sm:pl-5 pt-3 sm:pt-0">
            <span className="text-xs uppercase font-bold text-indigo-700 mb-1">
              Optimized Target Run-Rate
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-700 my-0.5">
              ${projectedRevenue.toLocaleString()}
            </div>
            <span className="text-xs font-semibold text-indigo-600 mt-1 block">
              {projectedConversions} orders / mo ({improvedCr}% CR with fixes)
            </span>
          </div>

          {/* Column 3: Projected Profit Recovered */}
          <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-emerald-200/60 sm:pl-5 pt-3 sm:pt-0">
            <span className="text-xs uppercase font-bold text-emerald-800 mb-1">
              Projected Monthly Profit Recovered
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 my-0.5 flex items-baseline gap-1">
              +${additionalMonthlyRevenue.toLocaleString()}
              <span className="text-xs font-bold text-emerald-700">/mo</span>
            </div>
            <span className="text-xs font-semibold text-emerald-800 mt-1 block">
              +${annualAdditionalRevenue.toLocaleString()} / year in additional revenue
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Leakage Culprits Breakdown (Where money is lost) */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-zinc-900">
              The 4 Specific Conversion Bleed Hotspots
            </h4>
            <p className="text-[16px] text-zinc-500 mt-0.5">
              Exact customer journey drop-off zones causing this estimated revenue loss.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-zinc-100 text-zinc-700">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            100% Total Funnel Leakage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leakageStages.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-4 sm:p-5 bg-white border border-zinc-200/60 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-[24px] rounded-[4px] bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <h5 className="font-bold text-zinc-900 text-base truncate">{item.stage}</h5>
                  </div>
                  <span className="inline-flex items-center justify-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shrink-0">
                    ~${item.loss}/mo Loss
                  </span>
                </div>

                <p className="text-[16px] text-zinc-600 leading-relaxed mb-4">
                  {item.reason}
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-emerald-50/60 p-3 sm:p-3.5 rounded-lg border border-emerald-100 text-sm text-emerald-950 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-800 mr-1.5">Fast Fix:</span>
                  <span className="text-emerald-900 font-medium">{item.fix}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Targeted Funnel & Checkout Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4 pt-2 sm:pt-4">
          <div>
            <h4 className="text-xl font-bold text-zinc-900">
              Targeted Funnel &amp; Checkout Fixes ({recommendations.length})
            </h4>
            <p className="text-[16px] text-zinc-500 mt-0.5">
              Specific actionable engineering and copy fixes to plug drop-offs in your conversion funnel.
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

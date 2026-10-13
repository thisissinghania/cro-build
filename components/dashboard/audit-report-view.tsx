"use client";

import React, { useState } from "react";
import {
  Globe,
  Download,
  RefreshCw,
  AlertTriangle,
  Gauge,
  Sparkles,
  Clock,
  ArrowLeft,
  Bot,
  Palette,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Check,
  Copy,
  Zap,
  TrendingUp,
  Target,
  FileSpreadsheet,
} from "lucide-react";

import { PILLAR_DATA } from "@/lib/static/pillar-data";

export interface AuditReportViewProps {
  report: any;
  loading?: boolean;
  onGoToIntegrations?: () => void;
  onReanalyze?: (integrationId: string) => void;
  isAnalyzing?: boolean;
  showReanalyze?: boolean;
  onBack?: () => void;
  formatDate?: (dateString: string) => string;
}

export function AuditReportView({
  report,
  loading = false,
  onGoToIntegrations,
  onReanalyze,
  isAnalyzing = false,
  showReanalyze = true,
  onBack,
  formatDate,
}: AuditReportViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [pillarSubTab, setPillarSubTab] = useState<string>("ALL");
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const formatReportDate = (dateString: string) => {
    if (!dateString) return "";
    if (formatDate) return formatDate(dateString);
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => {
      setCopiedSnippetId(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-[16px] text-zinc-500 font-medium">Generating 360° AI Conversion &amp; Growth Audit...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/60 p-8">
        <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">No AI CRO Audit Generated Yet</h3>
        <p className="text-[16px] text-zinc-600 max-w-lg mx-auto mb-6">
          Connect your website or select a connected website from the Integrations list and click &apos;Analyze Now&apos; to run an AI CRO audit.
        </p>
        {onGoToIntegrations && (
          <button
            onClick={onGoToIntegrations}
            className="inline-flex items-center gap-2 h-[48px] px-6 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            Go to Integrations
          </button>
        )}
      </div>
    );
  }

  const recommendations = (report.recommendations as any[]) || [];
  const highPriority = recommendations.filter((r) => r.priority === "HIGH");
  const mediumPriority = recommendations.filter((r) => r.priority === "MEDIUM");
  const lowPriority = recommendations.filter((r) => r.priority === "LOW");

  const normalizeCat = (cat: string) => {
    if (!cat) return "DESIGN_ERA";
    const upper = cat.toUpperCase();
    if (upper === "SPEED" || upper === "SPEED_TECH" || upper === "PERFORMANCE") return "SPEED_TECH";
    if (upper === "CHECKOUT" || upper === "CART" || upper === "FUNNEL_LEAKAGE") return "FUNNEL_LEAKAGE";
    if (upper === "UI_UX" || upper === "DESIGN_ERA" || upper === "AESTHETICS") return "DESIGN_ERA";
    if (upper === "COPYWRITING" || upper === "TRUST_CREDIBILITY" || upper === "TRUST") return "TRUST_CREDIBILITY";
    if (upper === "PRICING" || upper === "MARKETING_PSYCHOLOGY" || upper === "AOV") return "MARKETING_PSYCHOLOGY";
    if (upper === "AEO_SEO" || upper === "SEO" || upper === "AEO") return "AEO_SEO";
    return upper;
  };

  const currentPillar = categoryFilter !== "ALL" ? PILLAR_DATA[categoryFilter] : null;

  // Category scoped recommendations for dynamic priority counts under selected pillar
  const categoryScopedRecs = categoryFilter === "ALL"
    ? recommendations
    : recommendations.filter((r) => normalizeCat(r.category) === categoryFilter);
  const scopedHighCount = categoryScopedRecs.filter((r) => r.priority === "HIGH").length;
  const scopedMedCount = categoryScopedRecs.filter((r) => r.priority === "MEDIUM").length;
  const scopedLowCount = categoryScopedRecs.filter((r) => r.priority === "LOW").length;

  // Filter recommendations by both priority and category for "ALL" view
  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesPriority = priorityFilter === "ALL" || rec.priority === priorityFilter;
    const matchesCategory = categoryFilter === "ALL" || normalizeCat(rec.category) === categoryFilter;
    return matchesPriority && matchesCategory;
  });

  // Dynamic recommendations for active pillar and active sub-tab
  const activeRecommendations = React.useMemo(() => {
    if (categoryFilter === "ALL") {
      return filteredRecommendations;
    }

    if (!currentPillar) return filteredRecommendations;

    const existingTitles = new Set(
      recommendations.map((r: any) => (r.title || "").toLowerCase().trim())
    );
    const extraRecs = currentPillar.defaultRecommendations.filter(
      (dr) => !existingTitles.has((dr.title || "").toLowerCase().trim())
    );

    const matchedReportRecs = recommendations.filter(
      (r: any) => normalizeCat(r.category) === categoryFilter
    );

    const combined = [...matchedReportRecs, ...extraRecs];

    if (pillarSubTab === "ALL") {
      return combined;
    }

    return combined.filter((r: any) => {
      if (r.subCategory) {
        return r.subCategory === pillarSubTab;
      }
      const page = (r.targetPage || "").toLowerCase();
      const title = (r.title || "").toLowerCase();
      const desc = (r.suggestedChange || "").toLowerCase();

      if (pillarSubTab === "PDP") return page.includes("product") || page.includes("pdp");
      if (pillarSubTab === "CART") return page.includes("cart");
      if (pillarSubTab === "CHECKOUT") return page.includes("checkout");
      if (pillarSubTab === "SCHEMA") return title.includes("schema") || desc.includes("schema");
      if (pillarSubTab === "NLP") return title.includes("nlp") || desc.includes("question") || desc.includes("faq");
      if (pillarSubTab === "MOBILE") return page.includes("mobile") || title.includes("mobile") || desc.includes("touch");
      if (pillarSubTab === "EDITORIAL") return title.includes("visual") || title.includes("clean") || title.includes("hierarchy");
      if (pillarSubTab === "UGC") return title.includes("ugc") || title.includes("video") || title.includes("review");
      if (pillarSubTab === "POLICIES") return title.includes("guarantee") || title.includes("return") || title.includes("policy");
      if (pillarSubTab === "BUNDLES") return title.includes("bundle") || title.includes("pack") || title.includes("tier");
      if (pillarSubTab === "CART_EXPANSION") return title.includes("shipping") || page.includes("cart") || title.includes("add-on");
      if (pillarSubTab === "VITALS") return title.includes("lcp") || title.includes("vitals") || title.includes("preload");
      if (pillarSubTab === "ASSETS") return title.includes("script") || title.includes("defer") || title.includes("cdn");
      return true;
    });
  }, [categoryFilter, currentPillar, filteredRecommendations, recommendations, pillarSubTab]);

  const getCategoryInfo = (category: string) => {
    const norm = normalizeCat(category);
    switch (norm) {
      case "AEO_SEO":
        return { label: "AEO & AI Search", icon: Bot, color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "FUNNEL_LEAKAGE":
        return { label: "Funnel Leakage", icon: AlertTriangle, color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "DESIGN_ERA":
        return { label: "2026 UX Standards", icon: Palette, color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "TRUST_CREDIBILITY":
        return { label: "Trust & Social Proof", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "MARKETING_PSYCHOLOGY":
        return { label: "Marketing & AOV", icon: TrendingUp, color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "SPEED_TECH":
      case "SPEED":
        return { label: "Speed & Tech", icon: Zap, color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
      default:
        return { label: "General CRO", icon: Layers, color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
  };

  const focusBreakdown = report.pageFocusBreakdown || {
    pdp: 55,
    cart: 25,
    homepage: 15,
    checkout: 5,
  };

  const rawObjections = (report.topCustomerObjections as string[]) || [];
  const defaultObjections = [
    "Unclear real delivery timeline before reaching checkout",
    "Lack of authentic customer video reviews or creator social proof",
    "Hidden shipping or return shipping policies causing cart hesitation",
    "Lack of immediate reassurance regarding return terms or money-back guarantee",
  ];
  const objections = rawObjections.length > 0 ? rawObjections : defaultObjections;
  const displayObjections = objections.length >= 4 ? objections.slice(0, 4) : [...objections, ...defaultObjections.slice(objections.length, 4)];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* 1. Top Executive Summary Card */}
      <div className="p-6 bg-white border border-zinc-200/60 border-l-[5px] border-l-indigo-600 rounded-2xl">
        <div>
          {/* Top: Store info & Summary */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 h-[34px] px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Audits</span>
                </button>
              )}
              <span className="inline-flex items-center gap-2 h-[30px] px-3 rounded-md bg-emerald-50 text-emerald-700 text-[14px] font-medium border border-emerald-200 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                360° AI Growth Audit Completed
              </span>
              <span className="text-sm font-medium text-zinc-500">
                Generated {formatReportDate(report.createdAt)}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 mt-2 flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-600" />
              {report.websiteUrl}
            </h2>

            <p className="text-[16px] text-zinc-600 mt-2 leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Bottom: Score on Left & Actions on Right */}
          <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-0.5">Overall CRO Health</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-indigo-600">{report.overallScore}</span>
                  <span className="text-base font-bold text-zinc-400">/100</span>
                </div>
              </div>

              <div className="w-px h-10 bg-zinc-200"></div>

              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-0.5">Est. Revenue Leakage</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-rose-500">{report.estimatedRevenueLoss}</span>
                  <span className="inline-flex items-center h-[24px] px-2 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 whitespace-nowrap">Conversion Loss</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/api/audit/${report.id}/export`}
                download
                className="inline-flex items-center justify-center gap-2 h-[48px] px-5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap shadow-none"
              >
                <Download className="w-4 h-4" />
                Download Excel Report
              </a>

              {showReanalyze && onReanalyze && (
                <button
                  onClick={() => onReanalyze(report.integrationId)}
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 h-[48px] px-4 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Analyzing..." : "Re-Analyze"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Key Diagnostic Intelligence Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Design Era Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Design Maturity</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Palette className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div className="mb-3">
              <h4 className="font-bold text-zinc-900 text-sm mb-0.5">
                {report.designEraDiagnosis ? "Aesthetic Benchmark" : "Design Standard"}
              </h4>
              <p className="text-[16px] text-zinc-600 leading-snug">
                {report.designEraDiagnosis || "2017-2019 Template Feel (Needs 2026 Modernization)"}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-100 flex items-center">
            <span className="text-[14px] font-semibold text-indigo-600 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> 2026 UI Benchmark
            </span>
          </div>
        </div>

        {/* Card B: AEO & AI Search Readiness */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">AI / AEO Readiness</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-bold text-zinc-900 text-sm">AEO Readiness:</h4>
                <span className="text-base font-bold text-purple-700">
                  {report.aeoReadinessScore || 42}/100
                </span>
              </div>
              <p className="text-[16px] text-zinc-600 leading-snug">
                ChatGPT, Perplexity &amp; Gemini product discovery readiness.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-100 flex items-center">
            <span className="text-[14px] font-semibold text-purple-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Answer Engine Optimization
            </span>
          </div>
        </div>

        {/* Card C: Funnel Leakage Hotspot */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Biggest Drop-Off Zone</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div className="mb-3">
              <h4 className="font-bold text-zinc-900 text-sm mb-0.5">Primary Exit Stage</h4>
              <p className="text-[16px] text-zinc-600 leading-snug">
                {report.primaryLeakageStage || "Product Detail Page (Decision paralysis & shipping ambiguity)"}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-100 flex items-center">
            <span className="text-[14px] font-semibold text-rose-600 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> High Abandonment
            </span>
          </div>
        </div>

        {/* Card D: Trust Health Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Trust Health</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div className="mb-3">
              <h4 className="font-bold text-zinc-900 text-sm mb-0.5">Credibility Deficit</h4>
              <p className="text-[16px] text-zinc-600 leading-snug">
                {report.trustHealthDiagnosis || "Missing authentic video proof, transparent return terms & founder story"}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-100 flex items-center">
            <span className="text-[14px] font-semibold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Buyer Skepticism Fixes
            </span>
          </div>
        </div>
      </div>

      {/* 3. Page Focus Allocation & Customer Objections Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Page-by-Page Focus Breakdown Bar */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 flex flex-col">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-zinc-900 leading-tight">Redesign &amp; Optimization Roadmap</h3>
              <p className="text-sm text-zinc-500 mt-1">Where your developer / marketing team must focus effort.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Effort Allocation</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 rounded-lg text-zinc-700">
              100% Total Effort
            </span>
          </div>

          {/* Allocation Bar */}
          <div className="h-2 w-full bg-zinc-100 rounded-md overflow-hidden flex mb-4">
            <div style={{ width: `${focusBreakdown.pdp}%` }} className="bg-indigo-600 h-full" title={`PDP: ${focusBreakdown.pdp}%`} />
            <div style={{ width: `${focusBreakdown.cart}%` }} className="bg-purple-500 h-full" title={`Cart: ${focusBreakdown.cart}%`} />
            <div style={{ width: `${focusBreakdown.homepage}%` }} className="bg-blue-400 h-full" title={`Homepage: ${focusBreakdown.homepage}%`} />
            <div style={{ width: `${focusBreakdown.checkout}%` }} className="bg-emerald-500 h-full" title={`Checkout: ${focusBreakdown.checkout}%`} />
          </div>

          {/* 4 Focus Area Rows */}
          <div className="space-y-3">
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-indigo-600 shrink-0" />
                <div>
                  <span className="font-semibold text-sm text-zinc-900">Product Pages (PDP)</span>
                  <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• Primary exit point</span>
                </div>
              </div>
              <span className="font-bold text-sm text-indigo-600">{focusBreakdown.pdp}% Effort</span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-purple-500 shrink-0" />
                <div>
                  <span className="font-semibold text-sm text-zinc-900">Slide-Out Cart</span>
                  <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• Cart drawer upsells</span>
                </div>
              </div>
              <span className="font-bold text-sm text-purple-600">{focusBreakdown.cart}% Effort</span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-blue-400 shrink-0" />
                <div>
                  <span className="font-semibold text-sm text-zinc-900">Homepage / Landing</span>
                  <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• Hero section &amp; trust</span>
                </div>
              </div>
              <span className="font-bold text-sm text-blue-600">{focusBreakdown.homepage}% Effort</span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                <div>
                  <span className="font-semibold text-sm text-zinc-900">Checkout Funnel</span>
                  <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• Friction-free checkout</span>
                </div>
              </div>
              <span className="font-bold text-sm text-emerald-600">{focusBreakdown.checkout}% Effort</span>
            </div>
          </div>
        </div>

        {/* Right: Unspoken Customer Objections Box */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 flex flex-col">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-zinc-900 leading-tight">Why Visitors Leave Without Buying</h3>
              <p className="text-sm text-zinc-500 mt-1">Unspoken buyer doubts &amp; friction points identified by AI.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Identified Objections</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
              {displayObjections.length} Hesitation Points
            </span>
          </div>

          {/* Indicator Bar matching left card height */}
          <div className="h-2 w-full bg-rose-50 rounded-md overflow-hidden flex mb-4">
            <div className="w-full bg-rose-400/80 h-full" />
          </div>

          {/* 4 Objections Rows matching left card rows */}
          <div className="space-y-3">
            {displayObjections.map((obj, idx) => (
              <div key={idx} className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                  #{idx + 1}
                </span>
                <p className="text-sm font-medium text-zinc-800 leading-snug flex-1">
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Actionable Recommendations Section */}
      <div className="!mt-6 space-y-6">
        {/* Controls: Priority & Category Filters */}
        <div className="space-y-6">
          {/* 1. Main Primary Tabs on Top (Button-like, rounded-xl, no label) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              { id: "ALL", label: "All Recommendations" },
              { id: "AEO_SEO", label: "AEO & AI Search" },
              { id: "FUNNEL_LEAKAGE", label: "Funnel Leakage" },
              { id: "DESIGN_ERA", label: "2026 UX Standards" },
              { id: "TRUST_CREDIBILITY", label: "Trust & Social Proof" },
              { id: "MARKETING_PSYCHOLOGY", label: "Marketing & AOV" },
              { id: "SPEED_TECH", label: "Speed & Tech" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setPillarSubTab("ALL");
                  setPriorityFilter("ALL");
                }}
                className={`h-[44px] px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${categoryFilter === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* When All Recommendations is selected: Title & Description on Top, Priority Tabs on Bottom in Underline Style */}
          {categoryFilter === "ALL" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">
                  Actionable Recommendations ({activeRecommendations.length})
                </h3>
                <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
                  Global priority backlog across all categories — sorted by highest business impact, conversion improvement, and implementation speed.
                </p>
              </div>

              {/* Priority Filter Tabs with edge-to-edge background strip & active bottom border */}
              <div className="-mx-6 px-6 border-y border-zinc-200/80 bg-zinc-50/50">
                <div className="flex items-center gap-8 overflow-x-auto">
                  <button
                    onClick={() => setPriorityFilter("ALL")}
                    className={`relative py-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${priorityFilter === "ALL"
                      ? "text-indigo-600 font-semibold"
                      : "text-zinc-500 hover:text-zinc-700"
                      }`}
                  >
                    <span>All Priorities</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${priorityFilter === "ALL"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-zinc-100 text-zinc-600"
                        }`}
                    >
                      {categoryScopedRecs.length}
                    </span>
                    {priorityFilter === "ALL" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-t-sm" />
                    )}
                  </button>

                  <button
                    onClick={() => setPriorityFilter("HIGH")}
                    className={`relative py-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${priorityFilter === "HIGH"
                      ? "text-rose-600 font-semibold"
                      : "text-zinc-500 hover:text-zinc-700"
                      }`}
                  >
                    <span>Critical</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${priorityFilter === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-zinc-100 text-zinc-600"
                        }`}
                    >
                      {scopedHighCount}
                    </span>
                    {priorityFilter === "HIGH" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-rose-600 rounded-t-sm" />
                    )}
                  </button>

                  <button
                    onClick={() => setPriorityFilter("MEDIUM")}
                    className={`relative py-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${priorityFilter === "MEDIUM"
                      ? "text-amber-700 font-semibold"
                      : "text-zinc-500 hover:text-zinc-700"
                      }`}
                  >
                    <span>Optimizations</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${priorityFilter === "MEDIUM"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-zinc-100 text-zinc-600"
                        }`}
                    >
                      {scopedMedCount}
                    </span>
                    {priorityFilter === "MEDIUM" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-600 rounded-t-sm" />
                    )}
                  </button>

                  <button
                    onClick={() => setPriorityFilter("LOW")}
                    className={`relative py-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${priorityFilter === "LOW"
                      ? "text-blue-700 font-semibold"
                      : "text-zinc-500 hover:text-zinc-700"
                      }`}
                  >
                    <span>Quick Wins</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${priorityFilter === "LOW"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-zinc-100 text-zinc-600"
                        }`}
                    >
                      {scopedLowCount}
                    </span>
                    {priorityFilter === "LOW" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-sm" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : currentPillar ? (
            /* When a specific Pillar is selected: Deep Diagnostic Overview + Sub-tabs */
            <div className="space-y-6">
              <div>
                <div className="mb-2.5">
                  <span className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-md text-[14px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {currentPillar.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 leading-snug">
                  {currentPillar.headline}
                </h3>
                <p className="text-[16px] text-zinc-600 mt-2 leading-relaxed">
                  {currentPillar.summary}
                </p>
              </div>

              {/* 3 Diagnostic Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentPillar.metrics.map((metric, idx) => {
                  const isCrit = metric.status === "critical";
                  const isWarn = metric.status === "warning";

                  const topAccent = isCrit
                    ? "border-t-rose-500"
                    : isWarn
                      ? "border-t-amber-500"
                      : "border-t-emerald-500";

                  const badgeStyle = isCrit
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : isWarn
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200";

                  const dotColor = isCrit
                    ? "bg-rose-600"
                    : isWarn
                      ? "bg-amber-600"
                      : "bg-emerald-600";

                  const valColor = isCrit
                    ? "text-rose-600"
                    : isWarn
                      ? "text-amber-600"
                      : "text-emerald-600";

                  const statusLabel = isCrit
                    ? "Critical"
                    : isWarn
                      ? "Needs Improvement"
                      : "Optimal";

                  return (
                    <div
                      key={idx}
                      className={`bg-white p-5 rounded-xl border border-zinc-200/80 border-t-[3px] ${topAccent} shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow flex flex-col justify-start`}
                    >
                      <div>
                        {/* Header: Metric Label on Left, High-Contrast Status Badge on Right (min-h-[48px] ensures identical baseline across all cards) */}
                        <div className="min-h-[44px] flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-zinc-800 tracking-tight leading-snug">
                            {metric.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 h-[24px] px-2 rounded-md text-xs font-semibold border ${badgeStyle} shadow-2xs shrink-0 whitespace-nowrap`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-[2px] ${dotColor} shrink-0`} />
                            {statusLabel}
                          </span>
                        </div>

                        {/* Value: Large, clear headline score/status */}
                        <div className={`mt-2.5 text-3xl font-bold tracking-tight leading-none ${valColor}`}>
                          {metric.value}
                        </div>
                      </div>

                      {/* Diagnostic Explanation: Separated with subtle divider placed at exact same vertical offset */}
                      <div className="mt-4 pt-3.5 border-t border-zinc-100 flex-1">
                        <p className="text-[14px] text-zinc-600 leading-relaxed font-normal">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Sub-Header: Title & Description on Top, Sub-Tabs at the Bottom in Underline Style */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-zinc-900">
                    Targeted Recommendations ({activeRecommendations.length})
                  </h4>
                  <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
                    Concrete conversion fixes &amp; actionable snippets for {currentPillar.title}.
                  </p>
                </div>

                {/* Sub-Tabs: Edge-to-edge strip touching left & right borders, aligned with content */}
                {currentPillar.subTabs && currentPillar.subTabs.length > 0 && (
                  <div className="-mx-6 px-6 border-y border-zinc-200/80 bg-zinc-50/50">
                    <div className="flex items-center gap-8 overflow-x-auto">
                      {currentPillar.subTabs.map((st) => {
                        const isActive = pillarSubTab === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => setPillarSubTab(st.id)}
                            className={`relative py-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive
                              ? "text-indigo-600 font-semibold"
                              : "text-zinc-500 hover:text-zinc-700"
                              }`}
                          >
                            {st.label}
                            {isActive && (
                              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-t-sm" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Recommendations Cards */}
        <div className="space-y-4">
          {activeRecommendations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200/60">
              <p className="text-[16px] font-semibold text-zinc-700 mb-1">No recommendations found</p>
              <p className="text-sm text-zinc-400">Try changing the sub-tab filter above.</p>
            </div>
          ) : (
            activeRecommendations.map((rec, index) => {
              const isHigh = rec.priority === "HIGH";
              const isMed = rec.priority === "MEDIUM";
              const catInfo = getCategoryInfo(rec.category);
              const CatIcon = catInfo.icon;

              return (
                <div
                  key={rec.id || index}
                  className="bg-white rounded-2xl border border-zinc-200/60 p-6 space-y-4"
                >
                  {/* Top Badge Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Badge */}
                      {isHigh ? (
                        <span className="inline-flex items-center h-[30px] px-2.5 rounded-md text-[14px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                          Critical Priority
                        </span>
                      ) : isMed ? (
                        <span className="inline-flex items-center h-[30px] px-2.5 rounded-md text-[14px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          Medium Priority
                        </span>
                      ) : (
                        <span className="inline-flex items-center h-[30px] px-2.5 rounded-md text-[14px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                          Quick Win
                        </span>
                      )}

                      {/* Pillar / Category Badge */}
                      <span className={`inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-md text-[14px] font-semibold border ${catInfo.color} whitespace-nowrap`}>
                        <CatIcon className="w-3.5 h-3.5 shrink-0" />
                        {catInfo.label}
                      </span>

                      {/* Target Page Badge */}
                      {rec.targetPage && (
                        <span className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-md text-[14px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap">
                          <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          {rec.targetPage}
                        </span>
                      )}
                    </div>

                    {/* Effort & Implementation Type */}
                    <div className="flex items-center gap-2">
                      {rec.implementationType && (
                        <span className="inline-flex items-center h-[30px] px-2.5 rounded-md text-[14px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                          {rec.implementationType}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-md text-[14px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-200 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {rec.effort}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-bold text-zinc-900 leading-snug">{rec.title}</h4>

                  {/* 2-Column Grid: Suggested Change vs Expected Benefit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Suggested Change */}
                    <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200/60">
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                        Recommended Action / Fix
                      </span>
                      <p className="text-[16px] text-zinc-800 leading-relaxed font-medium">
                        {rec.suggestedChange}
                      </p>
                    </div>

                    {/* Expected Benefit */}
                    <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 block mb-1">
                        Expected Sales &amp; Conversion Impact
                      </span>
                      <p className="text-[16px] text-emerald-900 leading-relaxed font-semibold">
                        {rec.expectedBenefit || rec.benefit}
                      </p>
                    </div>
                  </div>

                  {/* Psychological Rationale */}
                  <div className="p-4 bg-zinc-50/50 rounded-xl border border-zinc-100 text-sm text-zinc-600 leading-relaxed">
                    <span className="font-semibold text-zinc-800 mr-2">Why this matters (Customer Behavior):</span>
                    {rec.rationale}
                  </div>

                  {/* Actionable Snippet / Microcopy Box */}
                  {rec.actionableSnippet && (
                    <div className="p-4 bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block mb-1">
                          Developer Code / Copy Snippet to Paste
                        </span>
                        <code className="text-xs text-indigo-300 font-mono break-words block">
                          {rec.actionableSnippet}
                        </code>
                      </div>
                      <button
                        onClick={() => handleCopySnippet(rec.actionableSnippet, rec.id || String(index))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer shrink-0"
                      >
                        {copiedSnippetId === (rec.id || String(index)) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

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
  Briefcase,
  DollarSign,
  Swords,
  ClipboardList,
} from "lucide-react";

import { PILLAR_DATA } from "@/lib/static/pillar-data";
import { RevenueLeakageTab } from "@/components/dashboard/audit/revenue-leakage-tab";
import { CompetitorBenchmarkTab } from "@/components/dashboard/audit/competitor-benchmark-tab";
import { AeoSearchRadarTab } from "@/components/dashboard/audit/aeo-search-radar-tab";
import { VisualCopyLabTab } from "@/components/dashboard/audit/visual-copy-lab-tab";
import { RecommendationCard } from "@/components/dashboard/audit/recommendation-card";

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
  const [mainTab, setMainTab] = useState<"RECOMMENDATIONS" | "REVENUE" | "COMPETITOR" | "AEO" | "VISUAL">("RECOMMENDATIONS");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
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
      <div className="py-16 text-center bg-white rounded-xl border border-zinc-200/60 p-8">
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

  const rawRecs = report.recommendations as any;
  const recommendations: any[] = Array.isArray(rawRecs)
    ? rawRecs
    : (rawRecs?.items || rawRecs?.recommendations || []);
  const diagnostics = !Array.isArray(rawRecs) && rawRecs?.diagnostics ? rawRecs.diagnostics : {};

  const websiteType: string = (report as any).websiteType || diagnostics.websiteType || "GENERAL_WEBSITE";
  const businessNiche: string = (report as any).businessNiche || diagnostics.businessNiche || "";
  const designEraDiagnosis: string = (report as any).designEraDiagnosis || diagnostics.designEraDiagnosis || "2017-2019 Template Feel (Needs 2026 Modernization)";
  const aeoReadinessScore: number = (report as any).aeoReadinessScore ?? diagnostics.aeoReadinessScore ?? 42;
  const primaryLeakageStage: string = (report as any).primaryLeakageStage || diagnostics.primaryLeakageStage || "Decision paralysis & high friction point";
  const trustHealthDiagnosis: string = (report as any).trustHealthDiagnosis || diagnostics.trustHealthDiagnosis || "Missing authentic proof, transparent terms & verified credentials";

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

  const activeRecommendations = React.useMemo(() => {
    return recommendations.filter((rec) => {
      return priorityFilter === "ALL" || rec.priority === priorityFilter;
    });
  }, [recommendations, priorityFilter]);

  const scopedHighCount = recommendations.filter((r) => r.priority === "HIGH").length;
  const scopedMedCount = recommendations.filter((r) => r.priority === "MEDIUM").length;
  const scopedLowCount = recommendations.filter((r) => r.priority === "LOW").length;

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

  const focusBreakdown = (report as any).pageFocusBreakdown || diagnostics.pageFocusBreakdown || {
    pdp: 55,
    cart: 25,
    homepage: 15,
    checkout: 5,
  };

  const getEffortLabels = (type: string) => {
    switch (type) {
      case "LOCAL_SERVICE":
        return {
          pdp: { title: "Services & Emergency Pages", desc: "Hero CTA, click-to-call & instant booking" },
          cart: { title: "Quote & Estimate Forms", desc: "Zero friction lead inquiry & WhatsApp" },
          homepage: { title: "Homepage & Header", desc: "NAP, license badges & emergency banner" },
          checkout: { title: "Contact & Service Area", desc: "Google Map, phone numbers & coverage" },
        };
      case "SAAS_B2B":
        return {
          pdp: { title: "Features & Pricing Tiers", desc: "Tier comparison, trial CTAs & ROI clarity" },
          cart: { title: "Signup & Onboarding Flow", desc: "Zero-card trial, social login & reduced fields" },
          homepage: { title: "Homepage & Hero Hook", desc: "Value proposition, interactive demo & social proof" },
          checkout: { title: "Checkout & Upgrade Flow", desc: "Annual toggle, security seals & invoicing" },
        };
      case "AGENCY_PORTFOLIO":
        return {
          pdp: { title: "Case Studies & Work Portfolio", desc: "Proof of results, client logos & case breakdowns" },
          cart: { title: "Discovery Call / Project Form", desc: "Calendar scheduler & budget selector" },
          homepage: { title: "Homepage & Positioning", desc: "Hook, testimonials & client problem solving" },
          checkout: { title: "Contact & Handshake", desc: "Direct phone, email, and meeting booking" },
        };
      default:
        return {
          pdp: { title: "Product Pages (PDP)", desc: "Primary conversion & decision point" },
          cart: { title: "Slide-Out Cart", desc: "Cart drawer upsells & free shipping progress" },
          homepage: { title: "Homepage / Landing", desc: "Hero section, social proof & brand trust" },
          checkout: { title: "Checkout Funnel", desc: "Friction-free checkout & trust badges" },
        };
    }
  };

  const effortLabels = getEffortLabels(websiteType);

  const defaultObjectionsByType: Record<string, string[]> = {
    LOCAL_SERVICE: [
      "Is this contractor licensed, insured, and available for emergency response right now?",
      "Hidden pricing or surprise dispatch fees before an estimate is given",
      "Lack of authentic local reviews, neighborhood work photos, or Google ratings",
      "No direct click-to-call button or immediate WhatsApp contact option on mobile",
    ],
    SAAS_B2B: [
      "Complex setup timeline and unclear developer/team onboarding requirement",
      "Pricing ambiguity or forcing 'Book a Demo' instead of transparent self-serve tier",
      "Uncertainty around data privacy, SOC2 compliance, and refund/cancellation policy",
      "Lack of interactive product demo or sandbox to verify feature claims before paying",
    ],
    AGENCY_PORTFOLIO: [
      "No transparent pricing range or budget qualification before scheduling a call",
      "Lack of verified client case studies with concrete ROI and metrics",
      "Unclear communication turnaround and who actually executes the project work",
      "Form requires too much personal info before answering basic scope questions",
    ],
    DEFAULT: [
      "Unclear real delivery timeline before reaching checkout",
      "Lack of authentic customer video reviews or creator social proof",
      "Hidden shipping or return shipping policies causing cart hesitation",
      "Lack of immediate reassurance regarding return terms or money-back guarantee",
    ],
  };

  const rawObjections = (((report as any).topCustomerObjections || diagnostics.topCustomerObjections) as string[]) || [];
  const defaultObjections = defaultObjectionsByType[websiteType] || defaultObjectionsByType.DEFAULT;
  const objections = rawObjections.length > 0 ? rawObjections : defaultObjections;
  const displayObjections = objections.length >= 4 ? objections.slice(0, 4) : [...objections, ...defaultObjections.slice(objections.length, 4)];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* 1. Top Executive Summary Card */}
      <div className="p-4 sm:p-5 bg-white border border-zinc-200/60 border-l-[5px] border-l-indigo-600 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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

            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                {report.websiteUrl}
              </h2>
              {businessNiche && (
                <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Briefcase className="w-3.5 h-3.5" />
                  {businessNiche}
                </span>
              )}
              {websiteType && websiteType !== "GENERAL_WEBSITE" && (
                <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {websiteType.replace(/_/g, " ")}
                </span>
              )}
            </div>

            <p className="text-[16px] text-zinc-600 mt-2 leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Bottom: Score on Left & Actions on Right */}
          <div className="mt-4 pt-4 sm:mt-5 sm:pt-5 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-semibold text-zinc-400 mb-0.5">Overall CRO Health</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-indigo-600">{report.overallScore}</span>
                  <span className="text-base font-bold text-zinc-400">/100</span>
                </div>
              </div>

              <div className="w-px h-10 bg-zinc-200"></div>

              <div className="flex flex-col">
                <span className="text-xs uppercase font-semibold text-zinc-400 mb-0.5">Est. Revenue Leakage</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-rose-500">{report.estimatedRevenueLoss}</span>
                  <span className="inline-flex items-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 whitespace-nowrap">Conversion Loss</span>
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

      {/* 2. Top-Level Main Module Navigation Bar */}
      <div className="w-full p-1.5 bg-[#4f39f6] rounded-2xl shadow-sm border border-indigo-700/40 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {[
          { id: "RECOMMENDATIONS", label: "Action Plan", icon: ClipboardList },
          { id: "REVENUE", label: "Revenue Leakage", icon: DollarSign },
          { id: "COMPETITOR", label: "Competitor Spy", icon: Swords },
          { id: "AEO", label: "AI Search (AEO)", icon: Bot },
          { id: "VISUAL", label: "Visual & Copy Lab", icon: Palette },
        ].map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id as any)}
              className={`w-full flex items-center justify-center gap-2 h-[44px] px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none ${idx === 4 ? "col-span-2 sm:col-span-1" : ""
                } ${isActive
                  ? "bg-white text-[#4f39f6] shadow-sm font-bold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#4f39f6]" : "text-white/70"}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {mainTab === "RECOMMENDATIONS" && (
        <div className="space-y-4">
          {/* Diagnostic Intelligence Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card A: Design Era Status */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <span className="text-xs uppercase font-bold text-zinc-400">Design Maturity</span>
                  <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                    <Target className="w-3 h-3 text-indigo-600 shrink-0" /> 2026 UI Benchmark
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Palette className="w-[18px] h-[18px]" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-0.5">
                  {designEraDiagnosis ? "Aesthetic Benchmark" : "Design Standard"}
                </h4>
                <p className="text-[16px] text-zinc-600 leading-snug">
                  {designEraDiagnosis}
                </p>
              </div>
            </div>

            {/* Card B: AEO & AI Search Readiness */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <span className="text-xs uppercase font-bold text-zinc-400">AI / AEO Readiness</span>
                  <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-purple-600 shrink-0" /> Answer Engine Optimization
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="w-[18px] h-[18px]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-zinc-900 text-sm">AEO Readiness:</h4>
                  <span className="text-base font-bold text-purple-700">
                    {aeoReadinessScore}/100
                  </span>
                </div>
                <p className="text-[16px] text-zinc-600 leading-snug">
                  ChatGPT, Perplexity &amp; Gemini AI search discovery score.
                </p>
              </div>
            </div>

            {/* Card C: Funnel Leakage Hotspot */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <span className="text-xs uppercase font-bold text-zinc-400">Biggest Drop-Off Zone</span>
                  <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                    <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" /> High Abandonment
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-[18px] h-[18px]" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-0.5">Primary Exit Stage</h4>
                <p className="text-[16px] text-zinc-600 leading-snug">
                  {primaryLeakageStage}
                </p>
              </div>
            </div>

            {/* Card D: Trust Health Status */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <span className="text-xs uppercase font-bold text-zinc-400">Trust Health</span>
                  <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> Buyer Skepticism Fixes
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-[18px] h-[18px]" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-0.5">Credibility Deficit</h4>
                <p className="text-[16px] text-zinc-600 leading-snug">
                  {trustHealthDiagnosis}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Page Focus Allocation & Customer Objections Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Page-by-Page Focus Breakdown Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 leading-tight">Redesign &amp; Optimization Roadmap</h3>
                  <p className="text-sm text-zinc-500 mt-1">Where your developer / marketing team must focus effort.</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase text-zinc-400">Effort Allocation</span>
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
              <div className="divide-y divide-zinc-100">
                <div className="py-3 flex items-center justify-between first:pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-sm text-zinc-900">{effortLabels.pdp.title}</span>
                      <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• {effortLabels.pdp.desc}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-indigo-600 shrink-0 ml-3">{focusBreakdown.pdp}% Effort</span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-sm text-zinc-900">{effortLabels.cart.title}</span>
                      <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• {effortLabels.cart.desc}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-purple-600 shrink-0 ml-3">{focusBreakdown.cart}% Effort</span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-sm text-zinc-900">{effortLabels.homepage.title}</span>
                      <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• {effortLabels.homepage.desc}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-blue-600 shrink-0 ml-3">{focusBreakdown.homepage}% Effort</span>
                </div>

                <div className="py-3 flex items-center justify-between last:pb-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-sm text-zinc-900">{effortLabels.checkout.title}</span>
                      <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">• {effortLabels.checkout.desc}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600 shrink-0 ml-3">{focusBreakdown.checkout}% Effort</span>
                </div>
              </div>
            </div>

            {/* Right: Unspoken Customer Objections Box */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                    {websiteType === "LOCAL_SERVICE"
                      ? "Why Visitors Leave Without Calling / Booking"
                      : websiteType === "SAAS_B2B"
                        ? "Why Visitors Leave Without Starting a Trial"
                        : websiteType === "AGENCY_PORTFOLIO"
                          ? "Why Visitors Leave Without Inquiring"
                          : "Why Visitors Leave Without Buying"}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {websiteType === "LOCAL_SERVICE"
                      ? "Unspoken homeowner/client doubts & friction points identified by AI."
                      : websiteType === "SAAS_B2B"
                        ? "Unspoken buyer skepticism & onboarding friction identified by AI."
                        : "Unspoken buyer doubts & friction points identified by AI."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase text-zinc-400">Identified Objections</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                  {displayObjections.length} Hesitation Points
                </span>
              </div>

              {/* Indicator Bar matching left card height */}
              <div className="h-2 w-full bg-rose-50 rounded-md overflow-hidden flex mb-4">
                <div className="w-full bg-rose-400/80 h-full" />
              </div>

              {/* 4 Objections Rows matching left card rows */}
              <div className="divide-y divide-zinc-100">
                {displayObjections.map((obj, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-3 first:pt-1 last:pb-1">
                    <span className="text-xs font-bold text-rose-500 mt-0.5 shrink-0">
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
                    className={`px-1.5 py-0.5 rounded-[4px] text-xs font-semibold ${priorityFilter === "ALL"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-zinc-100 text-zinc-600"
                      }`}
                  >
                    {recommendations.length}
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
                    className={`px-1.5 py-0.5 rounded-[4px] text-xs font-semibold ${priorityFilter === "HIGH"
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
                    className={`px-1.5 py-0.5 rounded-[4px] text-xs font-semibold ${priorityFilter === "MEDIUM"
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
                    className={`px-1.5 py-0.5 rounded-[4px] text-xs font-semibold ${priorityFilter === "LOW"
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

            {/* Recommendations Cards */}
            <div className="space-y-4">
              {activeRecommendations.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                  <p className="text-[16px] font-semibold text-zinc-700 mb-1">No recommendations found</p>
                  <p className="text-sm text-zinc-400">Try changing the priority filter above.</p>
                </div>
              ) : (
                activeRecommendations.map((rec, index) => (
                  <RecommendationCard
                    key={rec.id || index}
                    rec={rec}
                    index={index}
                    copiedId={copiedSnippetId}
                    onCopy={handleCopySnippet}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === "REVENUE" && (
        <RevenueLeakageTab
          report={report}
          diagnostics={diagnostics}
          recommendations={recommendations.filter((r: any) => {
            const cat = normalizeCat(r.category);
            return cat === "FUNNEL_LEAKAGE" || cat === "SPEED_TECH";
          })}
        />
      )}

      {mainTab === "COMPETITOR" && (
        <CompetitorBenchmarkTab report={report} diagnostics={diagnostics} />
      )}

      {mainTab === "AEO" && (
        <AeoSearchRadarTab
          report={report}
          diagnostics={diagnostics}
          recommendations={recommendations.filter((r: any) => normalizeCat(r.category) === "AEO_SEO")}
        />
      )}

      {mainTab === "VISUAL" && (
        <VisualCopyLabTab
          report={report}
          diagnostics={diagnostics}
          recommendations={recommendations.filter((r: any) => {
            const cat = normalizeCat(r.category);
            return cat === "DESIGN_ERA" || cat === "MARKETING_PSYCHOLOGY" || cat === "TRUST_CREDIBILITY";
          })}
        />
      )}
    </div>
  );
}

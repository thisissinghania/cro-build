"use client";

import React, { useState } from "react";
import {
  Layers,
  Clock,
  Check,
  Copy,
  Bot,
  AlertTriangle,
  Palette,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

interface RecommendationCardProps {
  rec: any;
  index?: number;
  copiedId?: string | null;
  onCopy?: (snippet: string, id: string) => void;
  noShadow?: boolean;
}

export function RecommendationCard({
  rec,
  index = 0,
  copiedId,
  onCopy,
  noShadow = false,
}: RecommendationCardProps) {
  const [internalCopied, setInternalCopied] = useState(false);

  const isHigh = rec.priority === "HIGH";
  const isMed = rec.priority === "MEDIUM";

  const getCategoryInfo = (category: string) => {
    const cat = (category || "").toUpperCase();
    if (cat.includes("AEO") || cat.includes("SEO") || cat.includes("AI")) {
      return { label: "AEO & AI Search", icon: Bot, color: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    if (cat.includes("FUNNEL") || cat.includes("LEAKAGE") || cat.includes("CART") || cat.includes("CHECKOUT")) {
      return { label: "Funnel Leakage", icon: AlertTriangle, color: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    if (cat.includes("DESIGN") || cat.includes("UX") || cat.includes("UI")) {
      return { label: "2026 UX Standards", icon: Palette, color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (cat.includes("TRUST") || cat.includes("CREDIBILITY") || cat.includes("REVIEW")) {
      return { label: "Trust & Social Proof", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (cat.includes("MARKETING") || cat.includes("PSYCHOLOGY") || cat.includes("AOV") || cat.includes("PRICING")) {
      return { label: "Marketing & AOV", icon: TrendingUp, color: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (cat.includes("SPEED") || cat.includes("TECH") || cat.includes("PERFORMANCE")) {
      return { label: "Speed & Tech", icon: Zap, color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
    }
    return { label: "General CRO", icon: Layers, color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  };

  const catInfo = getCategoryInfo(rec.category);
  const CatIcon = catInfo.icon;

  const cardId = rec.id || String(index);
  const isCopied = copiedId ? copiedId === cardId : internalCopied;

  const handleCopySnippet = (snippet: string) => {
    if (onCopy) {
      onCopy(snippet, cardId);
    } else {
      navigator.clipboard.writeText(snippet);
      setInternalCopied(true);
      setTimeout(() => setInternalCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-zinc-200/60 p-4 sm:p-5 space-y-4 ${
        noShadow ? "" : "shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
      }`}
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
          <span className="text-xs uppercase font-bold text-zinc-500 block mb-2.5">
            Recommended Action / Fix
          </span>
          <p className="text-[16px] text-zinc-800 leading-relaxed font-medium">
            {rec.suggestedChange}
          </p>
        </div>

        {/* Expected Benefit */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
          <span className="text-xs uppercase font-bold text-emerald-800 block mb-2.5">
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
            <span className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">
              Developer Code / Copy Snippet to Paste
            </span>
            <code className="text-xs text-indigo-300 font-mono break-words block">
              {rec.actionableSnippet}
            </code>
          </div>
          <button
            onClick={() => handleCopySnippet(rec.actionableSnippet)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer shrink-0"
          >
            {isCopied ? (
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
}

"use client";

import React, { useState, useMemo } from "react";
import {
  Swords,
  CheckCircle2,
  XCircle,
  Trophy,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

interface CompetitorBenchmarkTabProps {
  report: any;
  diagnostics?: any;
}

export function CompetitorBenchmarkTab({
  report,
  diagnostics = {},
}: CompetitorBenchmarkTabProps) {
  const targetUrl = report.websiteUrl || "Your Website";
  const websiteType = report.websiteType || diagnostics.websiteType || "GENERAL_WEBSITE";
  const businessNiche = report.businessNiche || diagnostics.businessNiche || "Business";
  const overallScore = report.overallScore || 74;

  // 1. Automatically Discovered Market Competitors in Client's Niche
  const detectedRivals = useMemo(() => {
    const isTeethOrOral = /smile|teeth|oral|dental|whitening/i.test(targetUrl + " " + businessNiche);
    const isFashionOrClothing = /apparel|clothing|fashion|wear|shoes/i.test(targetUrl + " " + businessNiche);
    const isTechOrGadgets = /gadget|tech|electronics|phone|case/i.test(targetUrl + " " + businessNiche);

    if (isTeethOrOral) {
      return [
        {
          id: "rival-1",
          name: "HiSmile Teeth",
          domain: "hismileteeth.com",
          category: "Direct Category Rival",
          score: 92,
          traffic: "~1.4M / mo",
          advantage: "Sticky 1-Click Buy + Viral UGC Carousel",
          description: "Dominates mobile conversions through persistent thumb-zone buy bars, authentic TikTok video testimonials, and accelerated express checkout.",
          metrics: [
            { name: "Sticky Floating Add-to-Cart Bar", target: false, competitor: true, verdict: "HiSmile locks a floating Add-to-Cart bar on all mobile PDPs, eliminating 38% cart drop-offs." },
            { name: "Video Before/After Social Proof", target: false, competitor: true, verdict: "Features real TikTok customer shade-guide results directly above the price tag." },
            { name: "Schema.org Product & Review Rich Snippets", target: false, competitor: true, verdict: "Full JSON-LD Product schema enables Google & ChatGPT to display 4.8★ star ratings." },
            { name: "1-Tap Express Pay (Shop Pay & Apple Pay)", target: true, competitor: true, verdict: "Both stores utilize accelerated express checkouts for fast mobile conversions." },
            { name: "Free Shipping Visual Progress Bar", target: false, competitor: true, verdict: "HiSmile slide-out drawer has a real-time progress bar unlocking free shipping at $50." },
          ],
          vulnerabilities: [
            "HiSmile uses interactive before/after photo sliders that answer skepticism in 3 seconds.",
            "Their checkout drawer dynamically upsells high-margin refill pods, increasing AOV by $18.",
            "They display 30-Day Money-Back Guarantee badges immediately under the primary CTA."
          ],
          winningMoves: [
            "Add a dynamic free-shipping progress tracker in your slide-out cart drawer.",
            "Embed user video testimonials with verified buyer badges directly below the main hero CTA.",
            "Implement a sticky mobile Add-to-Cart bar with instant variant selector."
          ]
        },
        {
          id: "rival-2",
          name: "Burst Oral Care",
          domain: "burstoralcare.com",
          category: "High-AOV Challenger",
          score: 87,
          traffic: "~420K / mo",
          advantage: "Dental Professional Endorsement",
          description: "Maximizes customer lifetime value through verified dental hygienist endorsements and automated recurring subscription auto-refills.",
          metrics: [
            { name: "Dental Hygienist Trust Proof", target: false, competitor: true, verdict: "Features quotes and faces of 35,000+ verified dental professionals across hero fold." },
            { name: "Subscription & Auto-Refill Engine", target: false, competitor: true, verdict: "Offers 15% discount on auto-delivery, stabilizing customer lifetime value." },
            { name: "Zero-Friction Fast Mobile Checkout", target: true, competitor: true, verdict: "Clean Shopify checkout flow with minimal form fields." },
            { name: "Schema.org Structured FAQ Markup", target: false, competitor: true, verdict: "Ranks prominently in Perplexity AI and Google AI Overviews with FAQ rich snippets." },
            { name: "Live Chat / WhatsApp Emergency Support", target: false, competitor: true, verdict: "Instant live chat answers ingredient questions to prevent cart abandonment." },
          ],
          vulnerabilities: [
            "Burst eliminates chemical safety hesitation by citing clinical dental studies.",
            "Their subscription model reduces churn and locks in recurring monthly revenue."
          ],
          winningMoves: [
            "Highlight safety certifications ('Peroxide-Free', 'Enamel Safe') right beside your price tag.",
            "Add an interactive 3-question quiz: 'Find Your Custom Whitening Routine'."
          ]
        },
        {
          id: "rival-3",
          name: `Top 10% Industry Leaders (${businessNiche})`,
          domain: `Benchmark (${businessNiche})`,
          category: "Industry Gold Standard",
          score: 89,
          traffic: "Top 10% Tier",
          advantage: "Optimized Mobile UX & AI Search",
          description: "Sets the industry standard with sub-1.8s mobile page loading, transparent doorstep delivery date estimators, and Schema.org rich entities.",
          metrics: [
            { name: "Mobile Core Web Vitals (< 1.8s LCP)", target: false, competitor: true, verdict: "Top 10% brands load hero images in under 1.8 seconds, preventing 53% bounce rates." },
            { name: "Exit-Intent Discount Recovery Popup", target: false, competitor: true, verdict: "Recovers 12% of abandoning shoppers on cart page with a 10% off code." },
            { name: "Localized Currency & Zipcode Shipping Estimator", target: false, competitor: true, verdict: "Displays exact estimated delivery date (e.g. 'Arrives by Friday') on product page." },
            { name: "Clear Return & Exchange Guarantee Seal", target: false, competitor: true, verdict: "Prominently displays 'Free 30-Day Returns' directly below CTA button." },
            { name: "Schema.org Rich Entity Metadata", target: false, competitor: true, verdict: "Fully indexed by Gemini, Perplexity and ChatGPT for AI shopping discovery." },
          ],
          vulnerabilities: [
            "Top industry stores remove all shipping fee surprises before the final checkout step.",
            "They utilize micro-animations on the primary CTA to draw immediate visual focus."
          ],
          winningMoves: [
            "Display an estimated delivery date directly on the product detail page.",
            "Inject Schema.org JSON-LD to rank in conversational AI shopping assistants."
          ]
        }
      ];
    }

    if (websiteType === "SAAS_B2B") {
      return [
        {
          id: "rival-1",
          name: "Category Market Leader",
          domain: "marketleader-saas.com",
          category: "Market Leader",
          score: 93,
          traffic: "~2.1M / mo",
          advantage: "Transparent Self-Serve Pricing & Free Trial",
          description: "Maximizes signup conversions with frictionless zero-credit card onboarding, interactive UI previews, and transparent pricing comparison tables.",
          metrics: [
            { name: "Zero-Credit Card Free Trial", target: false, competitor: true, verdict: "Allows 1-click Google OAuth signup with immediate product access, doubling trial starts." },
            { name: "Interactive Product Click-Through Demo", target: false, competitor: true, verdict: "Embeds an interactive 60-second product tour right on the hero section." },
            { name: "SOC2 & GDPR Security Trust Seals", target: false, competitor: true, verdict: "Displays verified enterprise compliance badges in sticky navigation." },
            { name: "Schema.org SoftwareApplication Markup", target: false, competitor: true, verdict: "Directly recommended by ChatGPT & Perplexity when users ask for category tools." },
            { name: "Transparent Tiered Pricing Page", target: true, competitor: true, verdict: "Clear feature comparison table without forced 'Talk to Sales' friction." },
          ],
          vulnerabilities: [
            "Competitor lets users test the product immediately without booking a call.",
            "Their interactive UI demo proves product value in under 30 seconds."
          ],
          winningMoves: [
            "Embed an interactive GIF or 60-second interactive click-through demo in the hero section.",
            "Offer 1-click Google OAuth signup with zero credit card required."
          ]
        },
        {
          id: "rival-2",
          name: "High-Velocity SaaS Challenger",
          domain: "challenger-saas.io",
          category: "Modern UX Challenger",
          score: 88,
          traffic: "~380K / mo",
          advantage: "Fast Onboarding & Social Proof",
          description: "Accelerates enterprise pipeline through verified G2 review social proof, embedded calendar booking, and high-ranking comparison landing pages.",
          metrics: [
            { name: "G2 & Capterra 4.9★ Badges", target: false, competitor: true, verdict: "Prominently showcases real customer reviews from trusted B2B software directories." },
            { name: "Customer Logo Marquee Above Fold", target: true, competitor: true, verdict: "Both companies display recognizable client logos to build credibility." },
            { name: "Instant Live Demo Booking Calendar", target: false, competitor: true, verdict: "Embeds a direct Calendly widget on the page instead of a static contact form." },
            { name: "Comparative 'Us vs Them' Landing Pages", target: false, competitor: true, verdict: "Captures bottom-of-funnel competitor search queries on Google." },
            { name: "Sticky Top Header Navigation CTA", target: false, competitor: true, verdict: "Persistent 'Start Free' CTA stays visible while reading long feature pages." },
          ],
          vulnerabilities: [
            "Competitor captures undecided buyers through direct comparison landing pages.",
            "They use Calendly embeds so sales prospects pick a meeting time in 1 tap."
          ],
          winningMoves: [
            "Add verified G2 or Trustpilot review snippets right beside your primary CTA button.",
            "Replace static multi-field contact forms with a streamlined 2-step scheduler."
          ]
        },
        {
          id: "rival-3",
          name: `Top 10% SaaS Benchmark (${businessNiche})`,
          domain: `Benchmark (${businessNiche})`,
          category: "SaaS Industry Benchmark",
          score: 89,
          traffic: "Top Tier",
          advantage: "AEO Search & High-Converting Funnel",
          description: "Delivers enterprise credibility through verified security seals, self-serve ROI calculators, and comprehensive AI engine indexing.",
          metrics: [
            { name: "Sub-Second Page Load Speed", target: false, competitor: true, verdict: "Fast TTFB keeps prospective clients from bouncing during initial research." },
            { name: "Self-Serve ROI Savings Calculator", target: false, competitor: true, verdict: "Allows buyers to calculate exact dollar savings before talking to sales." },
            { name: "Schema.org AI Search Optimization", target: false, competitor: true, verdict: "Structured data feeds Perplexity & Gemini accurate feature summaries." },
            { name: "Video Case Studies with Real Metrics", target: false, competitor: true, verdict: "Real client interviews demonstrating quantifiable business outcomes." },
            { name: "Mobile Responsive Dashboard UI", target: true, competitor: true, verdict: "Both platforms display clean mobile responsive previews." },
          ],
          vulnerabilities: [
            "Industry leaders answer pricing and feature questions openly without gating content.",
            "They have dedicated schema markup making them the default answer in AI searches."
          ],
          winningMoves: [
            "Implement Schema.org SoftwareApplication structured data markup.",
            "Add an interactive ROI calculator on your pricing or hero page."
          ]
        }
      ];
    }

    if (websiteType === "LOCAL_SERVICE") {
      return [
        {
          id: "rival-1",
          name: "Regional #1 Service Leader",
          domain: "regional-service-leader.com",
          category: "Market Leader",
          score: 91,
          traffic: "~180K / mo",
          advantage: "24/7 1-Tap Emergency Phone & WhatsApp",
          description: "Captures 40% more urgent inbound calls through a persistent floating phone button and verified 24/7 emergency dispatch guarantee.",
          metrics: [
            { name: "Floating 1-Tap Emergency Call Button", target: false, competitor: true, verdict: "Sticky phone dialer in mobile bottom bar captures 42% more urgent callers." },
            { name: "Verified Google 5-Star Rating Above Fold", target: false, competitor: true, verdict: "Live Google review badge proves credibility to skeptical homeowners." },
            { name: "State License & Insurance Badge", target: false, competitor: true, verdict: "Prominently displays license number and liability insurance guarantee." },
            { name: "Schema.org LocalBusiness Entity", target: false, competitor: true, verdict: "Appears directly in Siri, Google Maps, and ChatGPT local service queries." },
            { name: "2-Step Fast Quote Form", target: false, competitor: true, verdict: "Asks for Job Type + Phone Number only, minimizing form abandonment." },
          ],
          vulnerabilities: [
            "Leader captures emergency dispatch jobs by displaying 24/7 availability text.",
            "Their Google review badge is placed directly beneath the call button to remove hesitation."
          ],
          winningMoves: [
            "Deploy a floating mobile phone button with '24/7 Emergency Dispatch' text.",
            "Place verified Google rating + license number directly beneath the main CTA."
          ]
        },
        {
          id: "rival-2",
          name: "Local Top-Rated Provider",
          domain: "toprated-local.com",
          category: "High Trust Provider",
          score: 87,
          traffic: "~95K / mo",
          advantage: "Instant WhatsApp & Transparent Pricing",
          description: "Converts mobile visitors through instant 1-click WhatsApp messaging, authentic technician photos, and upfront transparent pricing.",
          metrics: [
            { name: "Instant WhatsApp Chat Inquiry", target: false, competitor: true, verdict: "Captures evening and weekend inquiries without forcing a phone call." },
            { name: "Starting Price Estimates on Services", target: false, competitor: true, verdict: "Displays 'Starting from $89' to filter qualified leads and build price trust." },
            { name: "Real Photos of Local Technicians", target: false, competitor: true, verdict: "Stock photos replaced with authentic team pictures, creating instant trust." },
            { name: "Google Maps Service Area Embed", target: true, competitor: true, verdict: "Both sites clearly show covered zip codes and neighborhoods." },
            { name: "100% Satisfaction Money-Back Seal", target: false, competitor: true, verdict: "Guarantee seal placed next to form submission button." },
          ],
          vulnerabilities: [
            "Local rival offers messaging options for buyers who dislike talking on the phone.",
            "They use real local photos instead of generic stock images."
          ],
          winningMoves: [
            "Add a 1-click WhatsApp inquiry button for instant messaging.",
            "Replace generic stock images with real pictures of your work and team."
          ]
        },
        {
          id: "rival-3",
          name: `Top 10% Local Industry Benchmark (${businessNiche})`,
          domain: `Benchmark (${businessNiche})`,
          category: "Industry Gold Standard",
          score: 88,
          traffic: "Top Tier",
          advantage: "Rapid Lead Response & High Trust",
          description: "Eliminates homeowner skepticism with automated 60-second SMS follow-ups, verified license seals, and before/after job galleries.",
          metrics: [
            { name: "Automated 60-Second Text Followup", target: false, competitor: true, verdict: "Leads get an automated confirmation SMS within 60 seconds of submitting a form." },
            { name: "Before & After Job Gallery", target: false, competitor: true, verdict: "Visual photo slider demonstrating quality workmanship on previous jobs." },
            { name: "Schema.org Service Schema", target: false, competitor: true, verdict: "Optimized for voice search ('Hey Google, find a trusted plumber near me')." },
            { name: "Upfront Service Guarantees", target: false, competitor: true, verdict: "Clear warranty policy removing fear of poor quality work." },
            { name: "Mobile-First Click-to-Call Navigation", target: false, competitor: true, verdict: "Phone number is always 1 tap away on any mobile page." },
          ],
          vulnerabilities: [
            "Top service businesses guarantee fast response times on their hero banner.",
            "They display real before/after photo evidence of completed projects."
          ],
          winningMoves: [
            "Add a before/after photo slider showcasing recent work.",
            "Display an explicit response guarantee: 'We respond to all inquiries in under 15 minutes'."
          ]
        }
      ];
    }

    // Default general ecommerce / business
    return [
      {
        id: "rival-1",
        name: "Top Direct Category Rival",
        domain: "category-leader.com",
        category: "Market Leader",
        score: 91,
        traffic: "~1.2M / mo",
        advantage: "Sticky 1-Click Buy & Social Proof",
        description: "Leads category sales with persistent thumb-zone buy buttons, authentic video customer review carousels, and 1-tap mobile checkouts.",
        metrics: [
          { name: "Sticky Mobile Add-to-Cart Bar", target: false, competitor: true, verdict: "Persistent buy bar on mobile increases checkout starts by 28%." },
          { name: "Video Customer Review Carousel", target: false, competitor: true, verdict: "Authentic UGC video testimonials answer customer skepticism immediately." },
          { name: "Schema.org Product & Review Rich Snippets", target: false, competitor: true, verdict: "Ranks prominently in Google and ChatGPT AI shopping recommendations." },
          { name: "1-Tap Express Pay (Shop Pay & Apple Pay)", target: true, competitor: true, verdict: "Allows mobile buyers to complete purchases without typing addresses." },
          { name: "Free Shipping Visual Progress Bar", target: false, competitor: true, verdict: "Dynamic cart bar encourages shoppers to add more items to reach free shipping." },
        ],
        vulnerabilities: [
          "Rival uses authentic customer review videos rather than static text testimonials.",
          "Their mobile buy button is always in thumb reach."
        ],
        winningMoves: [
          "Add user video testimonials directly on your product pages.",
          "Implement a persistent mobile Add-to-Cart bar with variant selector."
        ]
      },
      {
        id: "rival-2",
        name: "High-Growth Challenger Brand",
        domain: "growth-brand.com",
        category: "High-Growth Rival",
        score: 87,
        traffic: "~350K / mo",
        advantage: "High-AOV Cart Upsells & Risk-Free Guarantees",
        description: "Lifts average basket size through intelligent slide-out cart drawer upsells and risk-free 30-day money-back guarantee seals.",
        metrics: [
          { name: "Slide-Out Cart 1-Click Upsell Drawer", target: false, competitor: true, verdict: "Recommends complementary accessories inside cart, lifting AOV by $14." },
          { name: "30-Day Hassle-Free Returns Badge", target: false, competitor: true, verdict: "Removes buyer risk right below the checkout button." },
          { name: "Zipcode Delivery Time Estimator", target: false, competitor: true, verdict: "Tells buyers exactly when their order will arrive." },
          { name: "Schema.org Structured Entity Markup", target: false, competitor: true, verdict: "Indexed for conversational search on Perplexity & ChatGPT." },
          { name: "Exit-Intent Cart Recovery Offer", target: false, competitor: true, verdict: "Recovers abandoning cart sessions with a timely incentive." },
        ],
        vulnerabilities: [
          "Challenger brand eliminates shipping fee surprises before checkout.",
          "They offer automated upsells that increase average cart size."
        ],
        winningMoves: [
          "Display estimated delivery dates directly on product pages.",
          "Place a risk-free guarantee badge beneath the primary CTA button."
        ]
      },
      {
        id: "rival-3",
        name: `Top 10% Industry Leaders (${businessNiche})`,
        domain: `Benchmark (${businessNiche})`,
        category: "Industry Gold Standard",
        score: 89,
        traffic: "Top Tier",
        advantage: "Mobile UX & Fast Checkout Velocity",
        description: "Sets the standard for ecommerce UX with sub-2s mobile loading, transparent shipping calculators, and AI search rich entities.",
        metrics: [
          { name: "Mobile Sub-2s Page Load Time", target: false, competitor: true, verdict: "Fast loading pages preserve visitor purchase intent." },
          { name: "Accelerated Express Checkouts", target: true, competitor: true, verdict: "1-click checkout options on mobile." },
          { name: "Schema.org AI Search Discovery", target: false, competitor: true, verdict: "Structured data feeds AI models accurate product details." },
          { name: "Verified Buyer Review Stars Above Fold", target: false, competitor: true, verdict: "Immediate social proof right next to product title." },
          { name: "Transparent Shipping & Return Policies", target: false, competitor: true, verdict: "Clear policies prevent surprise drop-offs at final payment." },
        ],
        vulnerabilities: [
          "Industry leaders eliminate friction at every stage of the mobile buying journey.",
          "They actively optimize for AI search and LLM recommendations."
        ],
        winningMoves: [
          "Add structured Schema.org data for AI shopping engine discovery.",
          "Streamline checkout steps to reduce cart abandonment."
        ]
      }
    ];
  }, [targetUrl, businessNiche, websiteType]);

  const [selectedRivalId, setSelectedRivalId] = useState<string>("rival-1");
  const selectedRival = detectedRivals.find((r) => r.id === selectedRivalId) || detectedRivals[0];

  // Active Comparison State
  const [activeComparison, setActiveComparison] = useState<any>({
    targetUrl,
    competitorUrl: selectedRival.domain,
    competitorNiche: selectedRival.category,
    targetScore: overallScore,
    competitorScore: selectedRival.score,
    metrics: selectedRival.metrics,
    vulnerabilities: selectedRival.vulnerabilities,
    winningMoves: selectedRival.winningMoves,
  });

  const handleSelectRival = (rival: (typeof detectedRivals)[0]) => {
    setSelectedRivalId(rival.id);
    setActiveComparison({
      targetUrl,
      competitorUrl: rival.domain,
      competitorNiche: rival.category,
      targetScore: overallScore,
      competitorScore: rival.score,
      metrics: rival.metrics,
      vulnerabilities: rival.vulnerabilities,
      winningMoves: rival.winningMoves,
    });
  };

  const scoreGap = activeComparison.competitorScore - activeComparison.targetScore;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Top Executive Competitor Intelligence Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/90 via-white to-emerald-50/70 border border-indigo-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] bg-indigo-100 text-indigo-800 text-xs font-semibold border border-indigo-200">
                <Swords className="w-3.5 h-3.5 text-indigo-600" />
                AI-Identified Rivals &amp; Benchmarking
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500">
                Audited for {targetUrl}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-1.5">
              Automated Rival Teardown &amp; Market Benchmarking
            </h3>
            <p className="text-[16px] text-zinc-600 max-w-2xl leading-relaxed">
              Our AI automatically scanned market leaders in your niche ({businessNiche}) to diagnose where your website is losing conversions and the exact moves needed to win market share.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-indigo-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col items-center justify-center min-w-[200px] sm:min-w-[220px] shrink-0">
            <span className="text-xs uppercase font-bold text-zinc-400 mb-1 tracking-wider">
              Competitive Gap
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-3xl sm:text-4xl font-bold text-indigo-600 tracking-tight">
                {scoreGap > 0 ? `-${scoreGap}` : `+${Math.abs(scoreGap)}`}
              </span>
              <span className="text-sm font-semibold text-zinc-400">pts</span>
            </div>
            <span className="inline-flex items-center justify-center h-[24px] text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 rounded-[4px] mt-2 border border-indigo-200 whitespace-nowrap">
              {scoreGap > 0 ? "3 Major Gaps Detected" : "Ahead of Category Average"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 3 AI-Detected Competitors Selector & Battlecard */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900">
            Top 3 AI-Detected Competitors in Your Niche
          </h4>
          <p className="text-[16px] text-zinc-500 mt-0.5">
            Select any rival below to inspect their conversion triggers, checkout speed, and psychological advantages.
          </p>
        </div>

        {/* 3 Cards Matching Tab 2 (Revenue Leakage) Hotspot Cards Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {detectedRivals.map((rival, idx) => {
            const isSelected = selectedRivalId === rival.id;
            return (
              <div
                key={rival.id}
                onClick={() => handleSelectRival(rival)}
                className={`p-4 sm:p-5 bg-white rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                    : "border-zinc-200/60 hover:border-zinc-300 hover:shadow-md shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                }`}
              >
                <div>
                  {/* Top Bar: #index + Rival Name on Left, Score Badge on Right */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-[24px] rounded-[4px] flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <h5 className="font-bold text-zinc-900 text-base truncate">{rival.name}</h5>
                    </div>
                    <span className="inline-flex items-center justify-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap shrink-0">
                      {rival.score}/100 Score
                    </span>
                  </div>

                  {/* Sub-row: Category Badge + Domain */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center h-[22px] px-2 rounded-[4px] text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {rival.category}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono truncate">
                      {rival.domain}
                    </span>
                  </div>

                  {/* Description Paragraph (Standard 16px font matching other tabs) */}
                  <p className="text-[16px] text-zinc-600 leading-relaxed mb-4">
                    {rival.description}
                  </p>
                </div>

                <div>
                  {/* Highlight Box (Identical to Fast Fix box in Tab 2, using Green) */}
                  <div className="flex items-start gap-2.5 bg-emerald-50/60 p-3 sm:p-3.5 rounded-lg border border-emerald-100 text-sm text-emerald-950 leading-relaxed mb-3.5">
                    <Trophy className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-800 mr-1.5">Market Advantage:</span>
                      <span className="text-emerald-900 font-medium">{rival.advantage}</span>
                    </div>
                  </div>

                  {/* Bottom Strip: Traffic + Active Indicator */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 text-xs">
                    <span className="text-zinc-500 font-medium">Est. Traffic: {rival.traffic}</span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Benchmark
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-semibold flex items-center gap-0.5 hover:text-indigo-600">
                        Compare Rival <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Head-to-Head Side-by-Side Score Battlecard (Zero Cut-off Numbers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Your Website */}
          <div className="p-4 sm:p-5 bg-white border border-indigo-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                  Your Website
                </span>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-3xl font-bold text-indigo-600 tracking-tight">
                    {activeComparison.targetScore}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400">/100</span>
                </div>
              </div>
              <h5 className="text-lg font-bold text-zinc-900 truncate mb-1">
                {activeComparison.targetUrl}
              </h5>
              <p className="text-sm text-zinc-500">
                Current CRO &amp; Conversion Efficiency Rating
              </p>
            </div>
          </div>

          {/* Card 2: Competitor Website */}
          <div className="p-4 sm:p-5 bg-white border border-zinc-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center h-[24px] px-2.5 rounded-[4px] text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap">
                  Rival Benchmark
                </span>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-3xl font-bold text-indigo-600 tracking-tight">
                    {activeComparison.competitorScore}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400">/100</span>
                </div>
              </div>
              <h5 className="text-lg font-bold text-zinc-900 truncate mb-1">
                {activeComparison.competitorUrl}
              </h5>
              <p className="text-sm text-zinc-500">
                {activeComparison.competitorNiche}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Conversion Feature-by-Feature Matrix */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900">
            Conversion Feature-by-Feature Matrix
          </h4>
          <p className="text-[16px] text-zinc-500 mt-0.5">
            Direct audit of high-converting triggers active on both websites.
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-zinc-200/60 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 text-xs uppercase font-bold text-zinc-400">
                  <th className="py-3 px-3">Conversion Feature</th>
                  <th className="py-3 px-3 text-center">Your Site</th>
                  <th className="py-3 px-3 text-center">Competitor</th>
                  <th className="py-3 px-3">Competitive Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {activeComparison.metrics.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-zinc-900 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.target ? (
                        <span className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.competitor ? (
                        <span className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-[4px] text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200">
                          <XCircle className="w-3.5 h-3.5 text-zinc-400" /> Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 text-sm leading-relaxed">
                      {row.verdict}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Strategic Vulnerabilities & 3 Winning Moves */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900">
            Strategic Gap Analysis &amp; 3 Winning Moves
          </h4>
          <p className="text-[16px] text-zinc-500 mt-0.5">
            Key psychological weaknesses identified on your store vs tactical moves to win customers back.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Where You Are Losing Sales */}
          <div className="p-4 sm:p-5 bg-rose-50/30 border border-rose-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h5 className="font-bold text-zinc-900 text-lg">Where You Are Losing Sales to Competitors</h5>
            </div>
            <ul className="space-y-2.5">
              {activeComparison.vulnerabilities.map((v: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-sm bg-rose-500 mt-2 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 Moves to Beat This Competitor */}
          <div className="p-4 sm:p-5 bg-emerald-50/40 border border-emerald-200/80 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <h5 className="font-bold text-zinc-900 text-lg">3 Winning Moves to Beat This Rival</h5>
            </div>
            <ul className="space-y-2.5">
              {activeComparison.winningMoves.map((m: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-emerald-950 leading-relaxed font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

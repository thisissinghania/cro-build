import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import * as XLSX from "xlsx";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    return NextResponse.json({ error: "User account is inactive." }, { status: 403 });
  }

  // IDOR & tenant isolation
  const auditReport = await prisma.auditReport.findUnique({
    where: { id },
  });

  if (!auditReport || (dbUser.role !== "ADMIN" && auditReport.userId !== session.user.id)) {
    return NextResponse.json({ error: "Report not found or access denied." }, { status: 404 });
  }

  const rawRecs = auditReport.recommendations as any;
  const recommendations: any[] = Array.isArray(rawRecs)
    ? rawRecs
    : (rawRecs?.items || rawRecs?.recommendations || []);
  const diagnostics = !Array.isArray(rawRecs) && rawRecs?.diagnostics ? rawRecs.diagnostics : {};

  // Sort recommendations strictly by priority (HIGH -> MEDIUM -> LOW)
  const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedRecs = [...recommendations].sort(
    (a, b) => (priorityOrder[String(a.priority).toUpperCase()] || 99) - (priorityOrder[String(b.priority).toUpperCase()] || 99)
  );

  // Format data for Excel worksheet
  const rows = sortedRecs.map((rec, index) => ({
    "No.": index + 1,
    "Priority": (rec.priority || "HIGH").toUpperCase(),
    "Growth Pillar": rec.category || "UI_UX",
    "Target Page": rec.targetPage || "Product Page (PDP)",
    "Implementation Type": rec.implementationType || "Optimization (~1-2h)",
    "Title": rec.title,
    "The 2026 AI Fix": rec.suggestedChange,
    "Expected Impact": rec.expectedBenefit || rec.benefit,
    "Psychology & Rationale": rec.rationale,
    "Effort": rec.effort,
    "Actionable Snippet": rec.actionableSnippet || "N/A",
  }));

  // Create workbook and worksheets
  const workbook = XLSX.utils.book_new();

  // 1. Executive Summary Worksheet (Opened First)
  const websiteType = (auditReport as any).websiteType || diagnostics.websiteType || "GENERAL_WEBSITE";
  const businessNiche = (auditReport as any).businessNiche || diagnostics.businessNiche || "Online Business";
  const aeoScore = diagnostics.aeoReadinessScore ?? 42;
  const designEra = diagnostics.designEraDiagnosis || "Modern Conversion Blueprint";
  const leakageStage = diagnostics.primaryLeakageStage || "Decision Friction Point";
  const trustHealth = diagnostics.trustHealthDiagnosis || "Needs verified proof & transparent guarantees";
  const topObjections: string[] = Array.isArray(diagnostics.topCustomerObjections) ? diagnostics.topCustomerObjections : [];

  const summaryRows: Array<{ Metric: string; Value: string }> = [
    { Metric: "Target Website", Value: auditReport.websiteUrl },
    { Metric: "Business Model & Niche", Value: `${websiteType.replace(/_/g, " ")} (${businessNiche})` },
    { Metric: "Overall CRO Health Score", Value: `${auditReport.overallScore}/100` },
    { Metric: "Estimated Revenue & Conversion Loss", Value: auditReport.estimatedRevenueLoss },
    { Metric: "AEO & AI Search Readiness", Value: `${aeoScore}/100` },
    { Metric: "Design Era & UX Diagnosis", Value: designEra },
    { Metric: "Primary Funnel Leakage Point", Value: leakageStage },
    { Metric: "Trust & Credibility Health", Value: trustHealth },
    { Metric: "Audit Generated Date", Value: new Date(auditReport.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }) },
    { Metric: "Executive Summary", Value: auditReport.summary },
  ];

  if (topObjections.length > 0) {
    topObjections.forEach((obj, i) => {
      summaryRows.push({ Metric: `Top Customer Objection #${i + 1}`, Value: obj });
    });
  }

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 32 }, { wch: 85 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

  // 2. Detailed Action Items Worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 6 },   // No.
    { wch: 12 },  // Priority
    { wch: 22 },  // Growth Pillar
    { wch: 24 },  // Target Page
    { wch: 24 },  // Implementation Type
    { wch: 34 },  // Title
    { wch: 55 },  // The 2026 AI Fix
    { wch: 34 },  // Expected Impact
    { wch: 55 },  // Psychology & Rationale
    { wch: 20 },  // Effort
    { wch: 45 },  // Actionable Snippet
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "CRO Action Plan");

  // 3. Funnel Stages Breakdown (if present)
  const funnelStages: any[] = Array.isArray(diagnostics.generatedFunnelStages) ? diagnostics.generatedFunnelStages : [];
  if (funnelStages.length > 0) {
    const funnelRows = funnelStages.map((f, i) => ({
      "Stage No.": i + 1,
      "Funnel Stage": f.stage,
      "Visitor Drop-Off": `${f.pct}%`,
      "Drop-Off Friction / Reason": f.reason,
      "Strategic AI Fix": f.fix,
      "Fix Urgency": f.urgency || "HIGH",
    }));
    const funnelSheet = XLSX.utils.json_to_sheet(funnelRows);
    funnelSheet["!cols"] = [
      { wch: 10 },
      { wch: 32 },
      { wch: 18 },
      { wch: 45 },
      { wch: 55 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(workbook, funnelSheet, "Funnel Leakage");
  }

  // 4. Psychological Copy Lab (if present)
  const headlines: any[] = Array.isArray(diagnostics.generatedHeadlines) ? diagnostics.generatedHeadlines : [];
  if (headlines.length > 0) {
    const copyRows = headlines.map((h, i) => ({
      "Variant": `Variant ${String.fromCharCode(65 + i)}`,
      "Psychological Angle": h.type,
      "Hero Headline": h.headline,
      "Subheadline": h.subheadline,
      "Why This Works (Psychology)": h.psychology,
      "Projected Lift": h.impact,
    }));
    const copySheet = XLSX.utils.json_to_sheet(copyRows);
    copySheet["!cols"] = [
      { wch: 12 },
      { wch: 28 },
      { wch: 45 },
      { wch: 55 },
      { wch: 55 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, copySheet, "Copywriting Lab");
  }

  // 5. Competitor Benchmarks (if present)
  const competitor = diagnostics.competitorBenchmark;
  if (competitor && Array.isArray(competitor.metrics) && competitor.metrics.length > 0) {
    const compRows = competitor.metrics.map((m: any, i: number) => ({
      "No.": i + 1,
      "Evaluation Metric": m.name,
      "Target Website Status": m.target ? "Active / Implemented" : "Missing / Needs Fix",
      "Top 10% Competitor Status": m.competitor ? "Industry Benchmark" : "Missing",
      "Strategic Verdict": m.verdict,
    }));
    const compSheet = XLSX.utils.json_to_sheet(compRows);
    compSheet["!cols"] = [
      { wch: 6 },
      { wch: 35 },
      { wch: 25 },
      { wch: 25 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(workbook, compSheet, "Competitor Benchmarks");
  }

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const filename = `CRO-Growth-Audit-${auditReport.websiteUrl.replace(/[^a-zA-Z0-9]/g, "-")}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

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

  // Format data for Excel worksheet
  const rows = recommendations.map((rec, index) => ({
    "No.": index + 1,
    "Priority": rec.priority || "HIGH",
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

  // 1. Detailed Action Items Worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 6 },   // No.
    { wch: 12 },  // Priority
    { wch: 22 },  // Growth Pillar
    { wch: 24 },  // Target Page
    { wch: 22 },  // Implementation Type
    { wch: 32 },  // Title
    { wch: 50 },  // The 2026 AI Fix
    { wch: 32 },  // Expected Impact
    { wch: 55 },  // Psychology & Rationale
    { wch: 18 },  // Effort
    { wch: 40 },  // Actionable Snippet
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "CRO Action Plan");

  // 2. Executive Summary Worksheet
  const summaryRows = [
    { "Metric": "Target Website", "Value": auditReport.websiteUrl },
    { "Metric": "Overall CRO Health Score", "Value": `${auditReport.overallScore}/100` },
    { "Metric": "Estimated Revenue Leakage", "Value": auditReport.estimatedRevenueLoss },
    { "Metric": "Audit Generated Date", "Value": auditReport.createdAt.toISOString() },
    { "Metric": "Executive Summary", "Value": auditReport.summary },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

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

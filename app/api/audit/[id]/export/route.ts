import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { generateAuditExcelBuffer } from "@/lib/utils/excel";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
  const id = resolvedParams?.id;
  if (!id) {
    return NextResponse.json({ error: "Audit ID is required." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    return NextResponse.json({ error: "User account is inactive." }, { status: 403 });
  }

  try {
    // IDOR & tenant isolation
    const auditReport = await prisma.auditReport.findUnique({
      where: { id },
    });

    if (!auditReport || (dbUser.role !== "ADMIN" && auditReport.userId !== session.user.id)) {
      return NextResponse.json({ error: "Report not found or access denied." }, { status: 404 });
    }

    const { buffer, filename } = generateAuditExcelBuffer(auditReport);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(uint8.byteLength),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Export route error:", error);
    return NextResponse.json(
      { error: "Unable to generate Excel export at this time." },
      { status: 500 }
    );
  }
}

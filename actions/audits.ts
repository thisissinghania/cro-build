"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateAuditExcelBuffer } from "@/lib/utils/excel";
import { sanitizeErrorMessage } from "@/lib/utils/error-handler";

export async function getAuditsAction(payload: {
  skip: number;
  take: number;
  search: string;
  from?: string;
  to?: string;
  status?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    return { error: "User account is inactive." };
  }

  const { skip, take, search, from, to } = payload;

  try {
    const whereClause: any = {
      ...(dbUser.role !== "ADMIN" ? { userId: session.user.id } : {}),
      ...(search
        ? {
            OR: [
              {
                websiteUrl: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              ...(dbUser.role === "ADMIN"
                ? [
                    {
                      user: {
                        name: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                    {
                      user: {
                        email: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                  ]
                : []),
            ],
          }
        : {}),
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = toDate;
      }
    }

    const [audits, total] = await Promise.all([
      prisma.auditReport.findMany({
        where: whereClause,
        select: {
          id: true,
          userId: true,
          integrationId: true,
          websiteUrl: true,
          overallScore: true,
          estimatedRevenueLoss: true,
          summary: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
          integration: {
            select: { platformType: true },
          },
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditReport.count({ where: whereClause }),
    ]);

    // Serialize plain JSON objects for client
    const serializedAudits = JSON.parse(JSON.stringify(audits));

    return {
      data: {
        audits: serializedAudits,
        total,
        role: dbUser.role,
      },
    };
  } catch (error) {
    console.error("Error fetching audits:", error);
    return { error: "Failed to fetch audit reports." };
  }
}

export async function getAuditByIdAction(auditId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    return { error: "User account is inactive." };
  }

  try {
    const audit = await prisma.auditReport.findUnique({
      where: { id: auditId },
      include: {
        user: {
          select: { name: true, email: true },
        },
        integration: {
          select: { platformType: true },
        },
      },
    });

    if (!audit) {
      return { error: "Audit report not found." };
    }

    if (dbUser.role !== "ADMIN" && audit.userId !== session.user.id) {
      return { error: "Access denied. You can only view your own reports." };
    }

    return { data: JSON.parse(JSON.stringify(audit)) };
  } catch (error: any) {
    console.error("Error fetching audit by ID:", error);
    return { error: "Failed to load audit details." };
  }
}

export async function deleteAuditAction(auditId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    return { error: "User account is inactive." };
  }

  // IDOR & tenant isolation check
  const targetAudit = await prisma.auditReport.findUnique({
    where: { id: auditId },
    select: { userId: true, integrationId: true, websiteUrl: true, createdAt: true },
  });

  if (!targetAudit) {
    return { error: "Audit report not found." };
  }

  if (dbUser.role !== "ADMIN" && targetAudit.userId !== session.user.id) {
    return { error: "Access denied. You can only delete your own reports." };
  }

  try {
    // 1. Preserve immutable daily audit usage log so deleting a report never resets the daily limit
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      if (new Date(targetAudit.createdAt) >= startOfDay && (prisma as any).auditUsageLog?.create) {
        await (prisma as any).auditUsageLog.create({
          data: {
            userId: targetAudit.userId,
            integrationId: targetAudit.integrationId,
            websiteUrl: targetAudit.websiteUrl,
            createdAt: targetAudit.createdAt,
          },
        });
      }
    } catch (logErr) {
      console.warn("Audit usage log preservation note:", logErr);
    }

    // 2. Delete the audit report
    await prisma.auditReport.delete({
      where: { id: auditId },
    });

    // 3. Decrement auditsGenerated on the integration only if greater than 0
    if (targetAudit.integrationId) {
      await prisma.integration
        .updateMany({
          where: {
            id: targetAudit.integrationId,
            auditsGenerated: { gt: 0 },
          },
          data: { auditsGenerated: { decrement: 1 } },
        })
        .catch(() => {});
    }

    revalidatePath("/dashboard/audits");
    revalidatePath("/dashboard/integrations");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting audit report:", error);
    return { error: sanitizeErrorMessage(error, "Unable to delete the audit report. Please try again.") };
  }
}

export async function exportAuditReportAction(auditId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    return { error: "User account is inactive." };
  }

  const auditReport = await prisma.auditReport.findUnique({
    where: { id: auditId },
  });

  if (!auditReport) {
    return { error: "Audit report not found." };
  }

  if (dbUser.role !== "ADMIN" && auditReport.userId !== session.user.id) {
    return { error: "Access denied. You can only export your own reports." };
  }

  try {
    const { buffer, filename } = generateAuditExcelBuffer(auditReport);
    return {
      success: true,
      base64: buffer.toString("base64"),
      filename,
    };
  } catch (err: any) {
    console.error("Error exporting audit report:", err);
    return { error: "Failed to generate Excel report." };
  }
}

"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
        include: {
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
    select: { userId: true, integrationId: true },
  });

  if (!targetAudit) {
    return { error: "Audit report not found." };
  }

  if (dbUser.role !== "ADMIN" && targetAudit.userId !== session.user.id) {
    return { error: "Access denied. You can only delete your own reports." };
  }

  try {
    await prisma.auditReport.delete({
      where: { id: auditId },
    });

    // Optionally decrement auditsGenerated on the integration if greater than 0
    await prisma.integration
      .update({
        where: { id: targetAudit.integrationId },
        data: { auditsGenerated: { decrement: 1 } },
      })
      .catch(() => {});

    revalidatePath("/dashboard/audits");
    revalidatePath("/dashboard/integrations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting audit report:", error);
    return { error: "Failed to delete audit report." };
  }
}

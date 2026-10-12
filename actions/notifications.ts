"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "AUDIT" | "INTEGRATION" | "ALERT";
  target: string;
  date: string;
  url: string;
  read?: boolean;
}

export interface GetNotificationsPayload {
  search?: string;
  type?: "ALL" | "AUDIT" | "INTEGRATION" | "ALERT";
  from?: string;
  to?: string;
  skip?: number;
  take?: number;
}

export async function getNotificationsAction(payload: GetNotificationsPayload = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, data: [], total: 0, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true, notificationsReadAt: true, readNotificationIds: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return { success: false, data: [], total: 0, error: "User is inactive" };
    }

    const readAt = dbUser.notificationsReadAt ? new Date(dbUser.notificationsReadAt).getTime() : 0;
    const readIds = new Set(dbUser.readNotificationIds || []);

    const isUser = dbUser.role === "USER";
    const { search = "", type = "ALL", from = "", to = "", skip = 0, take = 10 } = payload;

    const [audits, integrations] = await Promise.all([
      prisma.auditReport.findMany({
        where: isUser ? { userId: dbUser.id } : {},
        orderBy: { createdAt: "desc" },
      }),
      prisma.integration.findMany({
        where: isUser ? { userId: dbUser.id } : {},
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const allItems: NotificationItem[] = [];

    // Map audits into notifications
    audits.forEach((a) => {
      const blockersCount = Array.isArray(a.recommendations) ? a.recommendations.length : 0;
      const isAuditRead = a.createdAt.getTime() <= readAt || readIds.has(`audit-${a.id}`);
      allItems.push({
        id: `audit-${a.id}`,
        title: "AI CRO Audit Completed",
        message: `Analysis completed with an overall score of ${a.overallScore}/100 and ${blockersCount} actionable conversion blockers.`,
        type: "AUDIT",
        target: a.websiteUrl,
        date: a.createdAt.toISOString(),
        url: "/dashboard/audits",
        read: isAuditRead,
      });

      if (a.overallScore < 70) {
        const isAlertRead = a.createdAt.getTime() <= readAt || readIds.has(`alert-${a.id}`);
        allItems.push({
          id: `alert-${a.id}`,
          title: "Conversion Leakage Warning",
          message: `Estimated revenue loss of ${a.estimatedRevenueLoss} detected. High priority UX fixes recommended.`,
          type: "ALERT",
          target: a.websiteUrl,
          date: a.createdAt.toISOString(),
          url: "/dashboard/audits",
          read: isAlertRead,
        });
      }
    });

    // Map integrations into notifications
    integrations.forEach((i) => {
      const isIntRead = i.createdAt.getTime() <= readAt || readIds.has(`integration-${i.id}`);
      allItems.push({
        id: `integration-${i.id}`,
        title: "Website Connected",
        message: `Successfully connected ${i.websiteUrl} via ${i.platformType === "SHOPIFY" ? "Shopify App" : i.platformType === "GA4" ? "Google Analytics 4" : "Custom Link"}.`,
        type: "INTEGRATION",
        target: i.websiteUrl,
        date: i.createdAt.toISOString(),
        url: "/dashboard/integrations?tab=list",
        read: isIntRead,
      });
    });

    // Sort chronologically descending
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply Filters
    let filtered = allItems;

    // 1. Search Filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q) ||
          item.target.toLowerCase().includes(q)
      );
    }

    // 2. Type Filter
    if (type && type !== "ALL") {
      filtered = filtered.filter((item) => item.type === type);
    }

    // 3. Date Filters
    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((item) => new Date(item.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => new Date(item.date) <= toDate);
    }

    const total = filtered.length;
    const pagedData = filtered.slice(skip, skip + take);

    return {
      success: true,
      data: pagedData,
      total,
    };
  } catch (error: any) {
    console.error("getNotificationsAction error:", error);
    return { success: false, data: [], total: 0, error: "Failed to fetch notifications" };
  }
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isActive: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return { success: false, error: "User is inactive" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationsReadAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error: any) {
    console.error("markAllNotificationsReadAction error:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isActive: true, readNotificationIds: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return { success: false, error: "User is inactive" };
    }

    const existingIds = dbUser.readNotificationIds || [];
    if (!existingIds.includes(notificationId)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          readNotificationIds: [...existingIds, notificationId],
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error: any) {
    console.error("markNotificationReadAction error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

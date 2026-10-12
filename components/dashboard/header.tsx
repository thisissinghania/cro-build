import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SidebarToggle } from "./sidebar-toggle";
import { HeaderSearch } from "./header-search";
import { HeaderNotifications, type HeaderNotificationItem } from "./header-notifications";
import { HeaderProfile } from "./header-profile";

function formatTimeAgo(date: Date | string) {
  const diffMs = new Date().getTime() - new Date(date).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export async function Header() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, isActive: true, notificationsReadAt: true, readNotificationIds: true },
  });

  const isUser = dbUser?.role === "USER";

  // Fetch real notifications from database
  const [audits, integrations] = await Promise.all([
    prisma.auditReport.findMany({
      where: isUser ? { userId: session.user.id } : {},
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.integration.findMany({
      where: isUser ? { userId: session.user.id } : {},
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const readAt = dbUser?.notificationsReadAt ? new Date(dbUser.notificationsReadAt).getTime() : 0;
  const readIds = new Set(dbUser?.readNotificationIds || []);

  const notifications: (HeaderNotificationItem & { createdAtMs: number })[] = [];

  // Generate audit notifications
  audits.forEach((a) => {
    const blockersCount = Array.isArray(a.recommendations) ? a.recommendations.length : 0;
    const aTime = a.createdAt.getTime();
    const isAuditRead = aTime <= readAt || readIds.has(`audit-${a.id}`);

    notifications.push({
      id: `audit-${a.id}`,
      title: "AI CRO Audit Generated",
      message: `Audit completed for ${a.websiteUrl} with Score ${a.overallScore}/100 and ${blockersCount} conversion blockers.`,
      type: "audit",
      timeAgo: formatTimeAgo(a.createdAt),
      url: "/dashboard/audits",
      read: isAuditRead,
      createdAtMs: aTime,
    });

    if (a.overallScore < 70) {
      const isAlertRead = aTime <= readAt || readIds.has(`alert-${a.id}`);
      notifications.push({
        id: `alert-${a.id}`,
        title: "Conversion Leakage Alert",
        message: `Estimated revenue loss of ${a.estimatedRevenueLoss} identified on ${a.websiteUrl}. High priority fixes recommended.`,
        type: "alert",
        timeAgo: formatTimeAgo(a.createdAt),
        url: "/dashboard/audits",
        read: isAlertRead,
        createdAtMs: aTime,
      });
    }
  });

  // Generate integration notifications
  integrations.forEach((i) => {
    const iTime = i.createdAt.getTime();
    const isIntRead = iTime <= readAt || readIds.has(`integration-${i.id}`);

    notifications.push({
      id: `integration-${i.id}`,
      title: "Website Connected",
      message: `Successfully connected ${i.websiteUrl} (${i.platformType === "SHOPIFY" ? "Shopify" : i.platformType === "GA4" ? "GA4" : "Custom Link"}).`,
      type: "integration",
      timeAgo: formatTimeAgo(i.createdAt),
      url: "/dashboard/integrations?tab=list",
      read: isIntRead,
      createdAtMs: iTime,
    });
  });

  // Sort all notifications chronologically descending
  notifications.sort((a, b) => b.createdAtMs - a.createdAtMs);

  return (
    <header className="flex items-center justify-between h-20 px-6 sm:px-8 bg-white border-b border-zinc-200/60 sticky top-0 z-30">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <SidebarToggle />
      </div>

      {/* Center: Live Debounced Header Search */}
      <div className="flex-1 flex justify-center px-4">
        <HeaderSearch />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 justify-end">
        <HeaderNotifications notifications={notifications} />

        <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block" />

        <HeaderProfile
          user={{
            name: dbUser?.name || session.user?.name,
            email: dbUser?.email || session.user?.email,
            role: dbUser?.role || session.user?.role,
          }}
        />
      </div>
    </header>
  );
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: "website" | "audit" | "page";
  url: string;
  badge?: string;
}

export interface SearchResults {
  websites: SearchResultItem[];
  audits: SearchResultItem[];
  pages: SearchResultItem[];
}

const STATIC_PAGES = [
  { title: "Dashboard Overview", subtitle: "Main conversion metrics and charts", url: "/dashboard", type: "page" as const },
  { title: "Integrations", subtitle: "Connect Shopify, GA4, and custom websites", url: "/dashboard/integrations", type: "page" as const },
  { title: "AI Audits", subtitle: "Review and export CRO audit recommendations", url: "/dashboard/audits", type: "page" as const },
  { title: "Account Settings", subtitle: "Manage personal details and password", url: "/dashboard/settings", type: "page" as const },
];

export async function searchGlobalAction(query: string): Promise<{ success: boolean; data: SearchResults; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, data: { websites: [], audits: [], pages: [] }, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return { success: false, data: { websites: [], audits: [], pages: [] }, error: "User deactivated or not found" };
    }

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { success: true, data: { websites: [], audits: [], pages: [] } };
    }

    const isUser = dbUser.role === "USER";

    // 1. Search Integrations (Websites)
    const integrations = await prisma.integration.findMany({
      where: {
        ...(isUser ? { userId: dbUser.id } : {}),
        OR: [
          { websiteUrl: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    // 2. Search AI Audits
    const audits = await prisma.auditReport.findMany({
      where: {
        ...(isUser ? { userId: dbUser.id } : {}),
        OR: [
          { websiteUrl: { contains: trimmed, mode: "insensitive" } },
          { summary: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        websiteUrl: true,
        overallScore: true,
        estimatedRevenueLoss: true,
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    // 3. Search Quick Pages
    const matchedPages: SearchResultItem[] = STATIC_PAGES.filter(
      (p) => p.title.toLowerCase().includes(trimmed) || p.subtitle.toLowerCase().includes(trimmed)
    ).map((p, idx) => ({
      id: `page-${idx}`,
      title: p.title,
      subtitle: p.subtitle,
      type: "page",
      url: p.url,
    }));

    const matchedWebsites: SearchResultItem[] = integrations.map((i) => ({
      id: i.id,
      title: i.websiteUrl,
      subtitle: `Platform: ${i.platformType === "SHOPIFY" ? "Shopify" : i.platformType === "GA4" ? "Google Analytics" : "Custom URL"}`,
      type: "website",
      url: "/dashboard/integrations?tab=list",
      badge: i.status === "ACTIVE" ? "Active" : "Syncing",
    }));

    const matchedAudits: SearchResultItem[] = audits.map((a) => ({
      id: a.id,
      title: `Audit: ${a.websiteUrl}`,
      subtitle: `Score: ${a.overallScore}/100 • Est. Loss: ${a.estimatedRevenueLoss}`,
      type: "audit",
      url: "/dashboard/audits",
      badge: `${a.overallScore}/100`,
    }));

    return {
      success: true,
      data: {
        websites: matchedWebsites,
        audits: matchedAudits,
        pages: matchedPages,
      },
    };
  } catch (error: any) {
    console.error("searchGlobalAction error:", error);
    return { success: false, data: { websites: [], audits: [], pages: [] }, error: "Unable to perform search at this moment." };
  }
}

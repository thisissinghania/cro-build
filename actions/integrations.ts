"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateCroAuditWithAI } from "@/lib/ai/cro-engine";

export async function getIntegrationsAction(payload: {
  skip: number;
  take: number;
  search: string;
  from?: string;
  to?: string;
  platformType?: string;
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

  const { skip, take, search, from, to, platformType } = payload;

  try {
    const whereClause: any = {
      ...(dbUser.role !== "ADMIN" ? { userId: session.user.id } : {}),
      ...(search
        ? {
          websiteUrl: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
        : {}),
      ...(platformType && platformType !== "ALL" ? { platformType } : {}),
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

    const [integrations, total] = await Promise.all([
      prisma.integration.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.integration.count({ where: whereClause }),
    ]);

    return { data: { integrations, total } };
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return { error: "Failed to fetch integrations." };
  }
}

export async function createIntegrationAction(payload: {
  websiteUrl: string;
  platformType: "CUSTOM_URL" | "SHOPIFY" | "GA4";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });

  if (!dbUser?.isActive) {
    return { error: "User account is inactive." };
  }

  try {
    // Validate simple URL format
    if (!payload.websiteUrl || payload.websiteUrl.length < 3) {
      return { error: "Please enter a valid URL or store name." };
    }

    const newIntegration = await prisma.integration.create({
      data: {
        userId: session.user.id,
        websiteUrl: payload.websiteUrl,
        platformType: payload.platformType,
        status: payload.platformType === "CUSTOM_URL" ? "ACTIVE" : "SYNCING",
      },
    });

    revalidatePath("/dashboard/integrations");
    return { success: true, data: newIntegration };
  } catch (error) {
    console.error("Error creating integration:", error);
    return { error: "Failed to connect integration." };
  }
}

export async function runAnalysisAction(integrationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });

  if (!dbUser?.isActive) {
    return { error: "User account is inactive." };
  }

  // IDOR & tenant isolation: Verify the integration belongs to this user
  const targetIntegration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
      userId: session.user.id,
    },
  });

  if (!targetIntegration) {
    return { error: "Integration not found or access denied." };
  }

  // Strict concurrency control: Only 1 website analysis allowed at a time per user
  const ongoingAnalysis = await prisma.integration.findFirst({
    where: {
      userId: session.user.id,
      status: "SYNCING",
    },
  });

  if (ongoingAnalysis) {
    return {
      error: `An analysis is already in progress for ${ongoingAnalysis.websiteUrl}. Please wait until it completes.`,
    };
  }

  try {
    // 1. Lock: Set status to SYNCING
    await prisma.integration.update({
      where: { id: integrationId },
      data: { status: "SYNCING" },
    });

    // 2. Fetch real data from Shopify if applicable
    let shopDetails = undefined;
    let products: any[] = [];
    let ordersCount = 0;
    let recentOrdersSample: any[] = [];

    if (targetIntegration.platformType === "SHOPIFY" && targetIntegration.shopifyAccessToken) {
      try {
        const [shopRes, prodRes, ordRes] = await Promise.allSettled([
          fetch(`https://${targetIntegration.websiteUrl}/admin/api/2024-01/shop.json`, {
            headers: {
              "X-Shopify-Access-Token": targetIntegration.shopifyAccessToken,
              "Content-Type": "application/json",
            },
          }),
          fetch(`https://${targetIntegration.websiteUrl}/admin/api/2024-01/products.json?limit=10`, {
            headers: {
              "X-Shopify-Access-Token": targetIntegration.shopifyAccessToken,
              "Content-Type": "application/json",
            },
          }),
          fetch(`https://${targetIntegration.websiteUrl}/admin/api/2024-01/orders.json?status=any&limit=5`, {
            headers: {
              "X-Shopify-Access-Token": targetIntegration.shopifyAccessToken,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (shopRes.status === "fulfilled" && shopRes.value.ok) {
          const sData = await shopRes.value.json();
          if (sData?.shop) {
            shopDetails = {
              name: sData.shop.name,
              currency: sData.shop.currency,
              domain: sData.shop.domain,
              plan_name: sData.shop.plan_name,
            };
          }
        }

        if (prodRes.status === "fulfilled" && prodRes.value.ok) {
          const pData = await prodRes.value.json();
          if (Array.isArray(pData?.products)) {
            products = pData.products.map((p: any) => ({
              title: p.title,
              price: p.variants?.[0]?.price,
              variants_count: p.variants?.length,
            }));
          }
        }

        if (ordRes.status === "fulfilled" && ordRes.value.ok) {
          const oData = await ordRes.value.json();
          if (Array.isArray(oData?.orders)) {
            ordersCount = oData.orders.length;
            recentOrdersSample = oData.orders.map((o: any) => ({
              total_price: o.total_price,
              financial_status: o.financial_status,
              cancel_reason: o.cancel_reason,
            }));
          }
        }
      } catch (shopErr) {
        console.error("Error communicating with Shopify API:", shopErr);
      }
    }

    // 3. Generate CRO Audit using AI Engine (Gemini 3.8 Flash)
    const auditData = await generateCroAuditWithAI({
      websiteUrl: targetIntegration.websiteUrl,
      platformType: targetIntegration.platformType,
      shopDetails,
      products,
      ordersCount,
      recentOrdersSample,
    });

    // 4. Save AuditReport in PostgreSQL
    const savedReport = await prisma.auditReport.create({
      data: {
        userId: session.user.id,
        integrationId: targetIntegration.id,
        websiteUrl: targetIntegration.websiteUrl,
        overallScore: auditData.overallScore,
        estimatedRevenueLoss: auditData.estimatedRevenueLoss,
        summary: auditData.summary,
        recommendations: auditData.recommendations as any,
      },
    });

    // 5. Unlock & increment audits count
    const updated = await prisma.integration.update({
      where: { id: integrationId },
      data: {
        status: "ACTIVE",
        auditsGenerated: { increment: 1 },
      },
    });

    revalidatePath("/dashboard/integrations");
    return { success: true, data: updated, auditReport: savedReport };
  } catch (error: any) {
    console.error("Error running analysis:", error);
    // Release lock on error
    await prisma.integration.update({
      where: { id: integrationId },
      data: { status: "ACTIVE" },
    }).catch(() => {});
    return { error: error?.message || "Failed to run analysis. Please try again." };
  }
}

export async function getLatestAuditReportAction(integrationId?: string) {
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
    const whereClause: any = {
      ...(dbUser.role !== "ADMIN" ? { userId: session.user.id } : {}),
      ...(integrationId ? { integrationId } : {}),
    };

    const report = await prisma.auditReport.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        integration: {
          select: {
            websiteUrl: true,
            platformType: true,
          },
        },
      },
    });

    return { data: report };
  } catch (error) {
    console.error("Error fetching latest audit report:", error);
    return { error: "Failed to fetch audit report." };
  }
}


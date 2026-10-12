import { Suspense } from "react";
import { IntegrationsClient } from "@/components/dashboard/integrations-client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Integrations | CROBuild",
  description: "Manage your connected websites and analytics.",
};

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string };
}) {
  const session = await auth();

  let role = "USER";
  let initialReport = null;

  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = resolvedParams?.tab === "list" ? "list" : "latest";

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });
    if (dbUser) role = dbUser.role;

    if (dbUser?.isActive) {
      const rawReport = await prisma.auditReport.findFirst({
        where: dbUser.role !== "ADMIN" ? { userId: session.user.id } : {},
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

      if (rawReport) {
        initialReport = JSON.parse(JSON.stringify(rawReport));
      }
    }
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading integrations...</div>}>
      <IntegrationsClient
        role={role}
        initialReport={initialReport}
        initialTab={initialTab}
      />
    </Suspense>
  );
}

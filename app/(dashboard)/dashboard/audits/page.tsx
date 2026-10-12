import { AuditsClient } from "@/components/dashboard/audits-client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "AI Audits | CROBuild",
  description: "Manage AI-generated conversion rate optimization reports.",
};

export default async function AuditsPage() {
  const session = await auth();

  let role = "USER";
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (dbUser) role = dbUser.role;
  }

  return <AuditsClient role={role} />;
}

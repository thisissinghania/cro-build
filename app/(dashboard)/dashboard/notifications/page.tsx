import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getNotificationsAction } from "@/actions/notifications";
import { NotificationsClient } from "@/components/dashboard/notifications-client";

export const metadata = {
  title: "Notifications | CROBuild",
  description: "View and filter your real-time AI audit generations and website alerts.",
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });

  if (!dbUser?.isActive) {
    redirect("/auth/login");
  }

  // Initial server load with first 10 records
  const initialResult = await getNotificationsAction({
    skip: 0,
    take: 10,
  });

  return (
    <NotificationsClient
      initialNotifications={initialResult.data || []}
      initialTotal={initialResult.total || 0}
    />
  );
}

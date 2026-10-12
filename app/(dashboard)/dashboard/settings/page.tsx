import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata = {
  title: "Settings | CROBuild",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  // Fetch full user details from the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
    }
  });

  if (!user) {
    redirect("/");
  }

  return <SettingsForm user={user} />;
}

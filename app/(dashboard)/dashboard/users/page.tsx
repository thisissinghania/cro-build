import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UsersClient } from "@/components/dashboard/users-client";

export const metadata = {
  title: "User Management | CROBuild",
};

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  // Double check admin role
  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (adminUser?.role !== "ADMIN") {
    // Regular users cannot see the User Management page
    redirect("/dashboard");
  }

  // Fetch initial paginated users and total count in parallel (Page 1, 10 limits)
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: 0,
      take: 10,
    }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  return (
    <UsersClient 
      initialUsers={users} 
      totalUsersCount={totalCount} 
    />
  );
}

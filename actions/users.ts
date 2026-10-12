"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const deleteUserAction = async (userId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthorized access!" };
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (adminUser?.role !== "ADMIN") {
      return { error: "Only administrators can delete users." };
    }

    if (adminUser.id === userId) {
      return { error: "You cannot delete your own account." };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/dashboard/users");
    return { success: "User deleted successfully." };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user." };
  }
};

export const toggleUserStatusAction = async (userId: string, isActive: boolean) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthorized access!" };
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (adminUser?.role !== "ADMIN") {
      return { error: "Only administrators can update users." };
    }

    if (adminUser.id === userId) {
      return { error: "You cannot deactivate your own account." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/dashboard/users");
    return { success: `User has been ${isActive ? "activated" : "deactivated"}.` };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { error: "Failed to update user status." };
  }
};

export const getUsersAction = async (payload: {
  query: string;
  page: number;
  limit: number;
  from: string;
  to: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthorized access!" };
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (adminUser?.role !== "ADMIN") {
      return { error: "Only administrators can view users." };
    }

    const { query, page, limit, from, to } = payload;
    const skip = (page - 1) * limit;

    const where: any = { role: "USER" };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true, users, totalCount };
  } catch (error) {
    console.error("Get users error:", error);
    return { error: "Failed to fetch users." };
  }
};

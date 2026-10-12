"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export const updateSettingsAction = async (values: any) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthorized access!" };
    }

    const { fullName, email, phone, address, password } = values;

    // Check if the current user is active in the DB
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isActive: true },
    });

    if (!currentUser || !currentUser.isActive) {
      return { error: "Your account is deactivated. Changes cannot be saved." };
    }

    // Check if updating email and if it belongs to someone else
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return { error: "Email is already in use by another account!" };
      }
    }

    const dataToUpdate: any = {
      name: fullName,
      email,
      phone,
      address,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return { success: "Settings updated successfully!" };
  } catch (error) {
    console.error("Update settings error:", error);
    return { error: "Something went wrong while updating settings." };
  }
};

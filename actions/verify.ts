"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const verifyEmailAction = async (token: string) => {
  try {
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return { error: "Token has expired!" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!existingUser) {
      return { error: "Email does not exist!" };
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      }
    });

    await prisma.verificationToken.delete({
      where: { id: existingToken.id }
    });

    return { success: "Email verified successfully! You can now log in." };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};

export const updatePasswordAction = async (values: any, token?: string | null) => {
  try {
    if (!token) {
      return { error: "Missing token!" };
    }

    const { password } = values;

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return { error: "Token has expired!" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!existingUser) {
      return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });

    return { success: "Password updated successfully!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};

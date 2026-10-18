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
      await prisma.verificationToken.delete({ where: { id: existingToken.id } }).catch(() => {});
      return { error: "This confirmation link has expired. Please request a new confirmation email." };
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
    console.error("Email verification error:", error);
    return { error: "Unable to verify your email at this time. Please request a new confirmation link." };
  }
};

export const updatePasswordAction = async (values: any, token?: string | null) => {
  try {
    if (!token) {
      return { error: "Reset token is missing. Please use the link provided in your email." };
    }

    const { password } = values || {};
    if (!password || typeof password !== "string" || password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return { error: "Invalid or expired reset link. Please request a new password reset." };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      await prisma.passwordResetToken.delete({ where: { id: existingToken.id } }).catch(() => {});
      return { error: "This password reset link has expired. Please request a new one." };
    }

    const tokenEmail = existingToken.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: tokenEmail }
    });

    if (!existingUser) {
      return { error: "Account not found for this email address." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });

    // Clear any active rate limits or lockouts for this email so user can immediately log in
    await prisma.rateLimit.deleteMany({
      where: {
        ip: {
          endsWith: `:${tokenEmail}`,
        },
      },
    }).catch(() => {});

    return { success: "Password updated successfully! You can now log in." };
  } catch (error) {
    console.error("Password update error:", error);
    return { error: "Unable to update your password at this time. Please try again." };
  }
};

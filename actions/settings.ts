"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { settingsSchema } from "@/lib/validations/settings";
import { sanitizeErrorMessage } from "@/lib/utils/error-handler";

export const updateSettingsAction = async (values: any) => {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    const sessionEmail = session?.user?.email;

    if (!sessionUserId && !sessionEmail) {
      return { error: "Unauthorized access!" };
    }

    // Strict Zod validation
    const validation = settingsSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Invalid settings input provided." };
    }

    const { fullName, email, phone, address, currentPassword, password } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    // Check if the current user is active in the DB
    const currentUser = await prisma.user.findFirst({
      where: sessionUserId ? { id: sessionUserId } : { email: sessionEmail! },
      select: { id: true, email: true, password: true, isActive: true },
    });

    if (!currentUser || !currentUser.isActive) {
      return { error: "Your account is deactivated. Changes cannot be saved." };
    }

    // Check if updating email and if it belongs to someone else
    let isChangingEmail = false;
    if (cleanEmail && cleanEmail !== currentUser.email?.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingUser && existingUser.id !== currentUser.id) {
        return { error: "Email is already in use by another account!" };
      }
      isChangingEmail = true;
    }

    // Security re-authentication: Verify current password if user is attempting to change password OR change primary email
    if ((password && password.trim()) || isChangingEmail) {
      if (!currentPassword) {
        return {
          error: isChangingEmail
            ? "Please enter your current password to confirm changing your email address."
            : "Please enter your current password to set a new password.",
        };
      }
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return { error: "The current password you entered is incorrect." };
      }
    }

    // If changing email, verify email delivery BEFORE committing to prevent orphaned accounts
    if (isChangingEmail) {
      try {
        const token = await generateVerificationToken(cleanEmail);
        await sendVerificationEmail(token.email, token.token, fullName || "");
      } catch (mailErr) {
        console.error("Failed to send verification email for changed address:", mailErr);
        return { error: "Unable to send confirmation email to the new address. Settings have not been changed." };
      }
    }

    const dataToUpdate: any = {
      name: fullName,
      phone,
      address,
    };

    if (isChangingEmail) {
      dataToUpdate.email = cleanEmail;
      dataToUpdate.emailVerified = null; // Revoke verified status until verified
    }

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: dataToUpdate,
    });

    if (isChangingEmail) {
      return {
        success: "Settings updated! A verification email has been sent to your new email address. Please verify it.",
      };
    }

    return { success: "Settings updated successfully!" };
  } catch (error: any) {
    console.error("Update settings error:", error);
    return { error: sanitizeErrorMessage(error, "Something went wrong while updating settings.") };
  }
};

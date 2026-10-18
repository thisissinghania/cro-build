"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import { headers } from "next/headers";
import { sanitizeErrorMessage } from "@/lib/utils/error-handler";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validations/auth";

export const signupAction = async (values: any) => {
  try {
    const validation = signupSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Invalid registration details." };
    }

    const { fullName, email, phone, address, password, captcha } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    // Verify Captcha Manually here for signup (since NextAuth only handles login)
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captcha}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return { error: "Captcha verification failed. Are you a bot?" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { error: "Email is already registered!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email: cleanEmail,
        phone,
        address,
        password: hashedPassword,
      },
    });

    try {
      const verificationToken = await generateVerificationToken(cleanEmail);
      await sendVerificationEmail(verificationToken.email, verificationToken.token, newUser.name || "");
    } catch (emailError: any) {
      await prisma.user.delete({ where: { id: newUser.id } });
      console.error("Email sending failed:", emailError);
      return { error: "Unable to send confirmation email at this moment. Please check your email address and try again." };
    }

    return { success: "Confirmation email sent! Please check your inbox to activate your account." };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: sanitizeErrorMessage(error, "Unable to complete account registration. Please try again.") };
  }
};

export const loginAction = async (values: any) => {
  let ip = "127.0.0.1";
  try {
    // Safely get IP address
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  } catch (e) {
    // Ignore headers error
  }

  try {
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Please enter valid email and password." };
    }

    const { email, password } = validation.data;
    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `${ip}:${cleanEmail}`;

    // Rate Limiting Logic per IP + Email
    const rateLimit = await prisma.rateLimit.upsert({
      where: { ip: rateLimitKey },
      update: {},
      create: { ip: rateLimitKey },
    });

    if (rateLimit.lockedUntil && new Date(rateLimit.lockedUntil) > new Date()) {
      return { error: "Too many failed attempts on this account. Please wait 1 hour or reset your password." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!existingUser || !existingUser.email || !existingUser.password) {
      const newAttempts = rateLimit.attempts + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : null;
      await prisma.rateLimit.update({
        where: { ip: rateLimitKey },
        data: { attempts: newAttempts, lockedUntil },
      });
      return { error: "Invalid credentials!" };
    }

    if (!existingUser.isActive) {
      return { error: "Your account has been deactivated." };
    }

    // 1. Verify password hash BEFORE resetting attempts to prevent brute-force counter bypass
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      const newAttempts = rateLimit.attempts + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : null;
      await prisma.rateLimit.update({
        where: { ip: rateLimitKey },
        data: { attempts: newAttempts, lockedUntil },
      });
      return { error: "Invalid credentials!" };
    }

    // 2. Admins bypass email verification; standard users must have verified email
    if (!existingUser.emailVerified && existingUser.role !== "ADMIN") {
      // Cooldown check (60s) to prevent Resend API quota exhaustion and inbox flooding
      const recentToken = await prisma.verificationToken.findFirst({
        where: { email: cleanEmail },
      });

      let tokenRecentlySent = false;
      if (recentToken) {
        const msLeft = new Date(recentToken.expires).getTime() - Date.now();
        if (msLeft > 3540 * 1000) {
          tokenRecentlySent = true;
        }
      }

      if (!tokenRecentlySent) {
        try {
          const verificationToken = await generateVerificationToken(cleanEmail);
          await sendVerificationEmail(verificationToken.email, verificationToken.token, existingUser.name || "");
        } catch (mailErr) {
          console.warn("Failed to resend verification email:", mailErr);
        }
      }

      return { error: "Please verify your email first. A confirmation link has been sent to your inbox." };
    }

    // Credentials verified! Reset failed attempts
    await prisma.rateLimit.update({
      where: { ip: rateLimitKey },
      data: { attempts: 0, lockedUntil: null },
    });

    await signIn("credentials", {
      email: cleanEmail,
      password,
      redirectTo: "/dashboard",
    });

    return { success: "Logged in successfully!" };
  } catch (error: any) {
    if (error instanceof AuthError || error?.type === "CredentialsSignin" || error?.type === "CallbackRouteError") {
      // Increment failed attempt on NextAuth error
      const cleanEmail = (values.email || "").trim().toLowerCase();
      const rateLimitKey = `${ip}:${cleanEmail}`;
      const rl = await prisma.rateLimit.findUnique({ where: { ip: rateLimitKey } });
      if (rl) {
        const newAttempts = rl.attempts + 1;
        const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : null;
        await prisma.rateLimit.update({
          where: { ip: rateLimitKey },
          data: { attempts: newAttempts, lockedUntil },
        });
      }

      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password!" };
        case "CallbackRouteError":
          return { error: error.cause?.err?.message || "Invalid credentials provided!" };
        default:
          return { error: "Something went wrong during login!" };
      }
    }
    throw error;
  }
};

export const forgotPasswordAction = async (values: { email: string; captcha: string }) => {
  try {
    const validation = forgotPasswordSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Invalid request." };
    }

    const { email, captcha } = validation.data;

    // Verify Captcha
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captcha}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return { error: "Captcha verification failed. Are you a bot?" };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for recent reset request cooldown (60 seconds)
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: { email: cleanEmail },
    });

    if (recentToken) {
      // Tokens expire in 1 hour (3600s). If more than 3540s left, request was made < 60s ago
      const msLeft = new Date(recentToken.expires).getTime() - Date.now();
      if (msLeft > 3540 * 1000) {
        return { error: "A password reset link was recently sent. Please wait 60 seconds before requesting another." };
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, isActive: true },
    });

    // Prevent Email Enumeration: Always return a generic success message
    if (!existingUser || !existingUser.isActive) {
      return { success: "If an account is associated with this email, a password reset link has been sent." };
    }

    const passwordResetToken = await generatePasswordResetToken(cleanEmail);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token, existingUser.name || "");

    return { success: "If an account is associated with this email, a password reset link has been sent." };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: sanitizeErrorMessage(error, "Unable to process password reset at this moment. Please try again.") };
  }
};

export const checkEmailExistsAction = async (email: string) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!existingUser;
  } catch (error) {
    return false;
  }
};

export const logoutAction = async () => {
  await signOut({ redirectTo: "/" });
};


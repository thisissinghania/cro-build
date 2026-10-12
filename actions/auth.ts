"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import { headers } from "next/headers";

export const signupAction = async (values: any) => {
  try {
    const { fullName, email, phone, address, password, captcha } = values;

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
      where: { email },
    });

    if (existingUser) {
      return { error: "Email is already registered!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        phone,
        address,
        password: hashedPassword,
      },
    });

    try {
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token, newUser.name || "");
    } catch (emailError: any) {
      await prisma.user.delete({ where: { id: newUser.id } });
      console.error("Email sending failed:", emailError);
      return { error: "Email sending failed: " + (emailError?.message || String(emailError)) };
    }

    return { success: "Confirmation email sent! Please check your inbox to activate your account." };
  } catch (error: any) {
    console.error(error);
    return { error: "Something went wrong! " + (error?.message || "Internal Error") };
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
    // Rate Limiting Logic
    const rateLimit = await prisma.rateLimit.upsert({
      where: { ip },
      update: {},
      create: { ip },
    });

    if (rateLimit.lockedUntil && new Date(rateLimit.lockedUntil) > new Date()) {
      return { error: "Too many failed attempts. Your IP is blocked for 1 hour." };
    }

    const { email, password } = values;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser || !existingUser.email || !existingUser.password) {
      const newAttempts = rateLimit.attempts + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : null;
      await prisma.rateLimit.update({
        where: { ip },
        data: { attempts: newAttempts, lockedUntil },
      });
      return { error: "Invalid credentials!" };
    }

    if (!existingUser.isActive) {
      return { error: "Your account has been deactivated." };
    }

    // Admins bypass email verification
    if (!existingUser.emailVerified && existingUser.role !== "ADMIN") {
      const verificationToken = await generateVerificationToken(existingUser.email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token, existingUser.name || "");
      return { error: "Please verify your email first. A new confirmation link has been sent to your inbox." };
    }

    // Reset attempts on successful login BEFORE signIn (because signIn throws a redirect)
    await prisma.rateLimit.update({
      where: { ip },
      data: { attempts: 0, lockedUntil: null },
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: "Logged in successfully!" };
  } catch (error: any) {
    if (error instanceof AuthError || error?.type === "CredentialsSignin" || error?.type === "CallbackRouteError") {
      // Increment failed attempt on NextAuth error
      const rl = await prisma.rateLimit.findUnique({ where: { ip } });
      if (rl) {
        const newAttempts = rl.attempts + 1;
        const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : null;
        await prisma.rateLimit.update({
          where: { ip },
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
    const { email, captcha } = values;

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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token, existingUser.name || "");

    return { success: "Reset link sent! Please check your email inbox." };
  } catch (error) {
    return { error: "Something went wrong!" };
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


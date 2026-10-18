import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Vercel Cron will automatically hit this GET request
export async function GET(req: Request) {
  try {
    // SECURITY: Strictly require CRON_SECRET authorization header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the date exactly 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Delete inactive unverified signups older than 24 hours that NEVER connected any integration or audit
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        emailVerified: null,
        role: "USER",
        createdAt: {
          lt: twentyFourHoursAgo,
        },
        integrations: { none: {} },
        auditReports: { none: {} },
      },
    });

    // 2. Clean up expired verification tokens
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: { lt: new Date() },
      },
    });

    // 3. Clean up expired password reset tokens
    const deletedResetTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: { lt: new Date() },
      },
    });

    // 4. Clean up stale, unlocked rate limit rows older than 24 hours
    const deletedRateLimits = await prisma.rateLimit.deleteMany({
      where: {
        updatedAt: { lt: twentyFourHoursAgo },
        OR: [
          { lockedUntil: null },
          { lockedUntil: { lt: new Date() } },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cron job executed successfully.`,
      stats: {
        deletedUnverifiedUsers: deletedUsers.count,
        deletedExpiredVerificationTokens: deletedVerificationTokens.count,
        deletedExpiredResetTokens: deletedResetTokens.count,
        deletedStaleRateLimits: deletedRateLimits.count,
      },
    });
  } catch (error) {
    console.error("[CRON_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

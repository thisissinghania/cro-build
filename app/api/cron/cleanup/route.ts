import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Vercel Cron will automatically hit this GET request
export async function GET(req: Request) {
  try {
    // SECURITY: Optional (Check if the request comes from Vercel)
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the date exactly 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Delete all users who were created more than 24 hours ago AND haven't verified their email
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        emailVerified: null,
        role: "USER", // STRICTLY ONLY USER ROLE! Admins will NOT be deleted.
        createdAt: {
          lt: twentyFourHoursAgo, // lt means "less than" (older than 24 hours)
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cron job executed successfully. Deleted ${deletedUsers.count} unverified accounts.`,
    });
  } catch (error) {
    console.error("[CRON_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  let stateUserId = searchParams.get("state");

  if (!stateUserId) {
    const session = await auth();
    stateUserId = session?.user?.id || null;
  }

  if (!shop || !code || !stateUserId) {
    return NextResponse.json({ error: "Missing required parameters from Shopify or unauthenticated user session." }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Shopify API credentials are not configured." }, { status: 500 });
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("No access token received from Shopify.");
    }

    const user = await prisma.user.findUnique({
      where: { id: stateUserId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Unauthorized or account is deactivated." }, { status: 403 });
    }

    const existingIntegration = await prisma.integration.findFirst({
      where: {
        userId: stateUserId,
        websiteUrl: shop,
        platformType: "SHOPIFY",
      },
    });

    if (existingIntegration) {
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          shopifyAccessToken: String(accessToken),
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.integration.create({
        data: {
          userId: stateUserId,
          websiteUrl: shop,
          platformType: "SHOPIFY",
          status: "ACTIVE",
          shopifyAccessToken: String(accessToken),
        },
      });
    }

    // Redirect the user back to the dashboard integrations page
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    return NextResponse.redirect(`${protocol}://${host}/dashboard/integrations`);

  } catch (error) {
    console.error("Shopify OAuth Error:", error);
    return NextResponse.json({ error: "An error occurred during Shopify OAuth." }, { status: 500 });
  }
}

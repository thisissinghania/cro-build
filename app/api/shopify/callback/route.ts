import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop")?.trim().toLowerCase();
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const hmac = searchParams.get("hmac");

  const shopifyDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shop || !shopifyDomainRegex.test(shop)) {
    return NextResponse.json(
      { error: "Invalid Shopify shop domain provided in callback." },
      { status: 400 }
    );
  }

  const cookieState = req.cookies.get("shopify_oauth_state")?.value;

  // 1. Strict CSRF verification: State must match the HTTP-only secure cookie
  if (!returnedState || !cookieState || returnedState !== cookieState) {
    return NextResponse.json(
      { error: "Invalid OAuth state or CSRF detected. Please re-initiate Shopify connection from the dashboard." },
      { status: 403 }
    );
  }

  // Extract verified userId from the state nonce:userId pair
  const stateParts = cookieState.split(":");
  const stateUserId = stateParts.length >= 2 ? stateParts[1] : null;

  if (!code || !stateUserId) {
    return NextResponse.json(
      { error: "Missing required parameters from Shopify or invalid state payload." },
      { status: 400 }
    );
  }

  // 2. Mandatory cryptographic HMAC validation
  if (!hmac) {
    return NextResponse.json(
      { error: "Missing mandatory HMAC signature parameter from Shopify." },
      { status: 400 }
    );
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Shopify API credentials are not configured." },
      { status: 500 }
    );
  }

  const map = new Map<string, string>();
  searchParams.forEach((val, key) => {
    if (key !== "hmac" && key !== "signature") {
      map.set(key, val);
    }
  });

  const message = Array.from(map.keys())
    .sort()
    .map((k) => `${k}=${map.get(k)}`)
    .join("&");

  const generatedHash = crypto
    .createHmac("sha256", clientSecret)
    .update(message)
    .digest("hex");

  if (
    generatedHash.length !== hmac.length ||
    !crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac))
  ) {
    return NextResponse.json({ error: "Invalid HMAC signature from Shopify." }, { status: 400 });
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

    // Redirect the user back to the dashboard integrations page and clear the OAuth cookie
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const response = NextResponse.redirect(`${protocol}://${host}/dashboard/integrations`);
    response.cookies.delete("shopify_oauth_state");
    return response;
  } catch (error) {
    console.error("Shopify OAuth Error:", error);
    return NextResponse.json({ error: "An error occurred during Shopify OAuth." }, { status: 500 });
  }
}

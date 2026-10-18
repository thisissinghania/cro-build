import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop")?.trim().toLowerCase();

  const shopifyDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shop || !shopifyDomainRegex.test(shop)) {
    return NextResponse.json(
      { error: "Invalid Shopify store domain. Must be in the format your-store.myshopify.com" },
      { status: 400 }
    );
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Shopify Client ID is not configured." }, { status: 500 });
  }

  // Scopes required for analytics and auditing
  const scopes = "read_orders,read_products,read_analytics,read_discounts,read_inventory,read_themes,read_content";

  // Create the redirect URL to our callback endpoint
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host");
  const redirectUri = `${protocol}://${host}/api/shopify/callback`;

  // Generate cryptographically secure random state nonce to prevent CSRF attacks
  const nonce = crypto.randomBytes(16).toString("hex");
  const stateValue = `${nonce}:${session.user.id}`;

  // Construct the Shopify OAuth authorization URL
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(stateValue)}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("shopify_oauth_state", stateValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes expiry
  });

  return response;
}

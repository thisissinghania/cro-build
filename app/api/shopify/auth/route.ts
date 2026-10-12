import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Shop parameter is missing" }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Shopify Client ID is not configured." }, { status: 500 });
  }

  // Scopes required for analytics and auditing
  const scopes = "read_orders,read_products,read_analytics,read_discounts,read_inventory,read_themes,read_content"; 
  
  // Create the redirect URL to our callback endpoint
  // Using absolute URL based on the request's origin
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host");
  const redirectUri = `${protocol}://${host}/api/shopify/callback`;

  // Construct the Shopify OAuth authorization URL
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${session.user.id}`;

  return NextResponse.redirect(authUrl);
}

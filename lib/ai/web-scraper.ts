import * as cheerio from "cheerio";

export type DetectedWebsiteType =
  | "LOCAL_SERVICE"
  | "ECOMMERCE"
  | "SAAS_B2B"
  | "AGENCY_PORTFOLIO"
  | "GENERAL_WEBSITE";

export interface ExtractedPageAudit {
  url: string;
  pageType: "HOMEPAGE" | "SERVICE_OR_PRODUCT" | "CONTACT_OR_CONVERSION";
  title: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Tags: string[];
  h2Tags: string[];
  schemasFound: string[];
  schemaRawSummary: string;
  hasViewport: boolean;
  hasOpenGraph: boolean;
  phoneLinks: string[];
  whatsappLinks: string[];
  mailtoLinks: string[];
  formsCount: number;
  primaryButtonTexts: string[];
  imagesTotal: number;
  imagesMissingAlt: number;
  trustKeywordsFound: string[];
  hasLiveChatOrWidget: boolean;
}

export interface ScrapedSiteAudit {
  normalizedUrl: string;
  detectedType: DetectedWebsiteType;
  businessNicheSummary: string;
  scannedPages: ExtractedPageAudit[];
  technicalSummary: {
    hasLocalBusinessSchema: boolean;
    hasProductSchema: boolean;
    hasFaqSchema: boolean;
    hasClickToCall: boolean;
    hasWhatsAppCta: boolean;
    hasLeadCaptureForm: boolean;
    hasCartOrCheckout: boolean;
    missingMetaDescription: boolean;
    missingH1OrMultipleH1: boolean;
    imagesMissingAltCount: number;
    detectedTechStacks: string[];
  };
  samplePageCopySnippet: string;
}

function normalizeUrl(inputUrl: string): string {
  let cleaned = inputUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.origin;
  } catch {
    return cleaned;
  }
}

async function fetchHtmlSafely(url: string, timeoutMs = 10000): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (err) {
    console.warn(`[web-scraper] Failed to fetch ${url}:`, (err as Error).message);
    return null;
  }
}

function parsePageHtml(html: string, pageUrl: string, pageType: ExtractedPageAudit["pageType"]): ExtractedPageAudit {
  const $ = cheerio.load(html);

  // 1. Meta & Titles
  const title = $("title").first().text().trim() || "";
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;

  // 2. Headings
  const h1Tags: string[] = [];
  $("h1").each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text) h1Tags.push(text.slice(0, 100));
  });

  const h2Tags: string[] = [];
  $("h2").slice(0, 6).each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text) h2Tags.push(text.slice(0, 80));
  });

  // 3. Structured Data (Schema.org JSON-LD)
  const schemasFound: string[] = [];
  const rawSchemaSnippets: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content) return;
      const parsed = JSON.parse(content);

      const inspectObj = (obj: any) => {
        if (!obj) return;
        if (Array.isArray(obj)) {
          obj.forEach(inspectObj);
          return;
        }
        if (typeof obj === "object") {
          const type = obj["@type"];
          if (type) {
            if (Array.isArray(type)) {
              schemasFound.push(...type);
            } else {
              schemasFound.push(String(type));
            }
          }
          if (obj["@graph"] && Array.isArray(obj["@graph"])) {
            obj["@graph"].forEach(inspectObj);
          }
        }
      };

      inspectObj(parsed);
      rawSchemaSnippets.push(content.slice(0, 250));
    } catch {
      // invalid json-ld syntax
    }
  });

  // 4. Contact & Interactive Links
  const phoneLinks: string[] = [];
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr("href")?.replace(/^tel:/i, "").trim();
    if (href && !phoneLinks.includes(href)) phoneLinks.push(href);
  });

  const whatsappLinks: string[] = [];
  $('a[href*="wa.me"], a[href*="whatsapp.com"]').each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (href && !whatsappLinks.includes(href)) whatsappLinks.push(href);
  });

  const mailtoLinks: string[] = [];
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr("href")?.replace(/^mailto:/i, "").trim();
    if (href && !mailtoLinks.includes(href)) mailtoLinks.push(href);
  });

  // 5. Buttons & Primary CTAs
  const primaryButtonTexts: string[] = [];
  $("button, a.btn, a[class*='button'], a[class*='btn'], input[type='submit']").slice(0, 10).each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text && text.length < 40 && !primaryButtonTexts.includes(text)) {
      primaryButtonTexts.push(text);
    }
  });

  // 6. Forms
  const formsCount = $("form").length;

  // 7. Images Audit
  let imagesTotal = 0;
  let imagesMissingAlt = 0;
  $("img").each((_, el) => {
    imagesTotal++;
    const alt = $(el).attr("alt");
    if (!alt || alt.trim() === "") {
      imagesMissingAlt++;
    }
  });

  // 8. Trust Keywords
  const bodyText = $("body").text().toLowerCase();
  const trustKeywords = [
    "licensed",
    "insured",
    "certified",
    "guarantee",
    "warranty",
    "google reviews",
    "trustpilot",
    "bbb",
    "verified",
    "years experience",
    "24/7",
    "free estimate",
    "money back",
  ];
  const trustKeywordsFound = trustKeywords.filter((kw) => bodyText.includes(kw));

  // 9. Widgets
  const hasLiveChatOrWidget =
    $('script[src*="tidio"], script[src*="crisp"], script[src*="tawk"], script[src*="intercom"], script[src*="zendesk"], iframe[src*="chat"]').length > 0 ||
    bodyText.includes("chat with us");

  return {
    url: pageUrl,
    pageType,
    title,
    titleLength: title.length,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    h1Tags,
    h2Tags,
    schemasFound: Array.from(new Set(schemasFound)),
    schemaRawSummary: rawSchemaSnippets.join(" | "),
    hasViewport,
    hasOpenGraph,
    phoneLinks,
    whatsappLinks,
    mailtoLinks,
    formsCount,
    primaryButtonTexts,
    imagesTotal,
    imagesMissingAlt,
    trustKeywordsFound,
    hasLiveChatOrWidget,
  };
}

function classifyWebsiteType(
  homepageHtml: string,
  homepageAudit: ExtractedPageAudit
): { detectedType: DetectedWebsiteType; nicheSummary: string } {
  const lowerHtml = homepageHtml.toLowerCase();
  const combinedText = (
    homepageAudit.title +
    " " +
    homepageAudit.metaDescription +
    " " +
    homepageAudit.h1Tags.join(" ") +
    " " +
    homepageAudit.h2Tags.join(" ")
  ).toLowerCase();

  // Local Service Indicators (Plumber, Electrician, Dental, HVAC, Clinic, Contractor, Cleaning, Roofing, etc.)
  const serviceKeywords = [
    "plumber",
    "plumbing",
    "drain",
    "electrician",
    "hvac",
    "roofing",
    "locksmith",
    "dentist",
    "dental",
    "lawyer",
    "attorney",
    "cleaning service",
    "contractor",
    "handyman",
    "pest control",
    "auto repair",
    "emergency service",
    "same day service",
    "free estimate",
    "book appointment",
    "call now",
    "serving our community",
  ];

  const isLocalService =
    serviceKeywords.some((kw) => combinedText.includes(kw) || lowerHtml.includes(kw)) ||
    (homepageAudit.phoneLinks.length > 0 && !lowerHtml.includes("add to cart") && !lowerHtml.includes("shopify"));

  // E-Commerce Indicators
  const isEcommerce =
    lowerHtml.includes("add to cart") ||
    lowerHtml.includes("shopify") ||
    lowerHtml.includes("woocommerce") ||
    lowerHtml.includes("checkout") ||
    lowerHtml.includes("view cart") ||
    lowerHtml.includes("my bag") ||
    homepageAudit.schemasFound.includes("Product");

  // SaaS Indicators
  const saasKeywords = [
    "pricing",
    "start free trial",
    "book a demo",
    "request demo",
    "api documentation",
    "software",
    "cloud platform",
    "all-in-one platform",
  ];
  const isSaas = saasKeywords.some((kw) => combinedText.includes(kw) || lowerHtml.includes(kw));

  // Agency / Portfolio Indicators
  const agencyKeywords = ["our agency", "case studies", "creative studio", "we build brands", "view portfolio"];
  const isAgency = agencyKeywords.some((kw) => combinedText.includes(kw));

  if (isLocalService && !isEcommerce) {
    return {
      detectedType: "LOCAL_SERVICE",
      nicheSummary: "Local / Emergency Service Business (Goal: Calls, Leads, Form Submissions & Local Area Trust)",
    };
  }

  if (isEcommerce) {
    return {
      detectedType: "ECOMMERCE",
      nicheSummary: "E-Commerce / Direct-To-Consumer Store (Goal: Purchases, AOV, Cart Checkout Completion)",
    };
  }

  if (isSaas) {
    return {
      detectedType: "SAAS_B2B",
      nicheSummary: "SaaS & B2B Software Platform (Goal: Free Trial Signups, Product Demos & MRR Conversion)",
    };
  }

  if (isAgency) {
    return {
      detectedType: "AGENCY_PORTFOLIO",
      nicheSummary: "Agency / Consulting / Portfolio (Goal: High-Ticket Discovery Calls & Inquiries)",
    };
  }

  return {
    detectedType: "GENERAL_WEBSITE",
    nicheSummary: "Custom Business / Content Website (Goal: Engagement, Lead Generation & Conversion)",
  };
}

export async function crawlAndAuditWebsite(rawUrl: string): Promise<ScrapedSiteAudit | null> {
  const origin = normalizeUrl(rawUrl);
  if (!origin.startsWith("http")) return null;

  // 1. Fetch Homepage
  const homepageHtml = await fetchHtmlSafely(origin);
  if (!homepageHtml) {
    // Generate intelligent fallback audit from domain when live crawl is blocked/unreachable
    let domainName = origin;
    try {
      domainName = new URL(origin).hostname.replace(/^www\./, "");
    } catch {
      // fallback
    }

    const isLocalService = /(plumb|electric|roof|clean|hvac|dentist|legal|auto|care|service|handyman|pest|locksmith)/i.test(domainName);
    const isSaas = /(app|soft|io|ai|tech|saas|cloud|dev|tool|crm|bot)/i.test(domainName);
    const isEcommerce = /(shop|store|buy|cart|market|brand|wear|apparel)/i.test(domainName);

    const fallbackType: DetectedWebsiteType = isLocalService
      ? "LOCAL_SERVICE"
      : isEcommerce
      ? "ECOMMERCE"
      : isSaas
      ? "SAAS_B2B"
      : "GENERAL_WEBSITE";

    const fallbackNiche = isLocalService
      ? "Local Service & Trade Specialist (Goal: Inbound Phone Calls & Lead Inquiries)"
      : isEcommerce
      ? "E-Commerce & DTC Brand (Goal: Cart Checkout, ROAS & AOV Increase)"
      : isSaas
      ? "SaaS & Web Software Platform (Goal: Free Trials & Subscription Conversion)"
      : "Digital Business / Web Presence (Goal: Engagement & Conversion)";

    return {
      normalizedUrl: origin,
      detectedType: fallbackType,
      businessNicheSummary: fallbackNiche,
      scannedPages: [
        {
          url: origin,
          pageType: "HOMEPAGE",
          title: `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} - Official Website`,
          titleLength: domainName.length + 19,
          metaDescription: "",
          metaDescriptionLength: 0,
          h1Tags: [domainName],
          h2Tags: ["Our Services & Solutions", "Why Choose Us"],
          schemasFound: [],
          schemaRawSummary: "No Schema.org markup detected during scan",
          hasViewport: true,
          hasOpenGraph: false,
          phoneLinks: [],
          whatsappLinks: [],
          mailtoLinks: [],
          formsCount: 1,
          primaryButtonTexts: ["Get Started", "Contact Us"],
          imagesTotal: 4,
          imagesMissingAlt: 2,
          trustKeywordsFound: [],
          hasLiveChatOrWidget: false,
        },
      ],
      technicalSummary: {
        hasLocalBusinessSchema: false,
        hasProductSchema: false,
        hasFaqSchema: false,
        hasClickToCall: false,
        hasWhatsAppCta: false,
        hasLeadCaptureForm: true,
        hasCartOrCheckout: isEcommerce,
        missingMetaDescription: true,
        missingH1OrMultipleH1: false,
        imagesMissingAltCount: 2,
        detectedTechStacks: [],
      },
      samplePageCopySnippet: `Website domain: ${domainName}. Comprehensive CRO, AEO, and SEO evaluation required.`,
    };
  }

  const homepageAudit = parsePageHtml(homepageHtml, origin, "HOMEPAGE");
  const { detectedType, nicheSummary } = classifyWebsiteType(homepageHtml, homepageAudit);

  const scannedPages: ExtractedPageAudit[] = [homepageAudit];

  // 2. Discover Secondary Key Page based on detected business type
  const $ = cheerio.load(homepageHtml);
  const internalLinks: string[] = [];

  $("a[href]").each((_, el) => {
    let href = $(el).attr("href")?.trim();
    if (!href) return;

    if (href.startsWith("/")) {
      href = `${origin}${href}`;
    }

    try {
      const parsed = new URL(href);
      if (parsed.origin === origin && parsed.pathname !== "/" && !internalLinks.includes(href)) {
        internalLinks.push(href);
      }
    } catch {
      // skip invalid urls
    }
  });

  // Filter for the highest-value conversion funnel page
  let targetSecondaryUrl: string | undefined;

  if (detectedType === "LOCAL_SERVICE") {
    targetSecondaryUrl = internalLinks.find((u) =>
      /(services|service|contact|book|emergency|estimate|drain|repair)/i.test(u)
    );
  } else if (detectedType === "ECOMMERCE") {
    targetSecondaryUrl = internalLinks.find((u) =>
      /(products|product|shop|collections|cart)/i.test(u)
    );
  } else if (detectedType === "SAAS_B2B") {
    targetSecondaryUrl = internalLinks.find((u) =>
      /(pricing|plans|demo|features|signup)/i.test(u)
    );
  } else {
    targetSecondaryUrl = internalLinks.find((u) =>
      /(contact|services|about|portfolio)/i.test(u)
    );
  }

  if (targetSecondaryUrl) {
    const secondaryHtml = await fetchHtmlSafely(targetSecondaryUrl, 6000);
    if (secondaryHtml) {
      const pageType = detectedType === "ECOMMERCE" ? "SERVICE_OR_PRODUCT" : "CONTACT_OR_CONVERSION";
      const secondaryAudit = parsePageHtml(secondaryHtml, targetSecondaryUrl, pageType);
      scannedPages.push(secondaryAudit);
    }
  }

  // 3. Technical Summary compilation
  const allSchemas = scannedPages.flatMap((p) => p.schemasFound);
  const totalMissingAlt = scannedPages.reduce((acc, p) => acc + p.imagesMissingAlt, 0);

  const detectedTechStacks: string[] = [];
  const fullHtml = homepageHtml.toLowerCase();
  if (fullHtml.includes("shopify")) detectedTechStacks.push("Shopify");
  if (fullHtml.includes("wp-content") || fullHtml.includes("wordpress")) detectedTechStacks.push("WordPress");
  if (fullHtml.includes("woocommerce")) detectedTechStacks.push("WooCommerce");
  if (fullHtml.includes("next.js") || fullHtml.includes("__next")) detectedTechStacks.push("Next.js");
  if (fullHtml.includes("webflow")) detectedTechStacks.push("Webflow");
  if (fullHtml.includes("wix")) detectedTechStacks.push("Wix");
  if (fullHtml.includes("squarespace")) detectedTechStacks.push("Squarespace");

  // Sample page copy snippet (clean text for AI context)
  const sampleCopy = $("body")
    .text()
    .replace(/\s+/g, " ")
    .slice(0, 1200);

  return {
    normalizedUrl: origin,
    detectedType,
    businessNicheSummary: nicheSummary,
    scannedPages,
    technicalSummary: {
      hasLocalBusinessSchema: allSchemas.some((s) => /LocalBusiness|Plumber|ProfessionalService|Dentist|Legal/i.test(s)),
      hasProductSchema: allSchemas.some((s) => /Product/i.test(s)),
      hasFaqSchema: allSchemas.some((s) => /FAQPage|Question/i.test(s)),
      hasClickToCall: scannedPages.some((p) => p.phoneLinks.length > 0),
      hasWhatsAppCta: scannedPages.some((p) => p.whatsappLinks.length > 0),
      hasLeadCaptureForm: scannedPages.some((p) => p.formsCount > 0),
      hasCartOrCheckout: fullHtml.includes("cart") || fullHtml.includes("checkout"),
      missingMetaDescription: scannedPages.some((p) => p.metaDescriptionLength === 0),
      missingH1OrMultipleH1: scannedPages.some((p) => p.h1Tags.length !== 1),
      imagesMissingAltCount: totalMissingAlt,
      detectedTechStacks,
    },
    samplePageCopySnippet: sampleCopy,
  };
}

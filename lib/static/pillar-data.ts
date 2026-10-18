export interface PillarMetric {
  label: string;
  value: string;
  status: "critical" | "warning" | "good";
  description: string;
}

export interface PillarSubTab {
  id: string;
  label: string;
}

export interface PillarRecommendation {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  targetPage: string;
  implementationType: string;
  suggestedChange: string;
  expectedBenefit: string;
  rationale: string;
  effort: string;
  actionableSnippet?: string;
}

export interface PillarDetail {
  id: string;
  title: string;
  badge: string;
  headline: string;
  summary: string;
  metrics: PillarMetric[];
  subTabs: PillarSubTab[];
  defaultRecommendations: PillarRecommendation[];
}

export const PILLAR_DATA: Record<string, PillarDetail> = {
  AEO_SEO: {
    id: "AEO_SEO",
    title: "AEO & AI Search Discovery",
    badge: "AI Visibility Score: 42/100 • Critical Need",
    headline: "Getting Recommended Inside ChatGPT, Perplexity & Google AI",
    summary:
      "Today, millions of shoppers search for products directly inside ChatGPT, Perplexity, and Google AI. If your store doesn't have clear structured product data and simple Q&A descriptions, AI tools cannot recommend your products to shoppers.",
    metrics: [
      {
        label: "Store Data in Code",
        value: "Missing",
        status: "critical",
        description: "Search engines and AI cannot automatically read your live stock, pricing, and ratings.",
      },
      {
        label: "AI Recommendation Score",
        value: "38 / 100",
        status: "warning",
        description: "Your product copy doesn't answer direct buyer questions, so AI tools skip recommending your store.",
      },
      {
        label: "Customer FAQ Coverage",
        value: "Low",
        status: "critical",
        description: "No quick answers on product pages for shipping times, sizing, or money-back guarantees.",
      },
    ],
    subTabs: [
      { id: "ALL", label: "All AI Fixes" },
      { id: "SCHEMA", label: "Store Code & Schema" },
      { id: "NLP", label: "Q&A Descriptions" },
    ],
    defaultRecommendations: [
      {
        id: "aeo-rec-1",
        title: "Add Structured Product & FAQ Code for Google & AI Search",
        category: "AEO_SEO",
        subCategory: "SCHEMA",
        priority: "HIGH",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Add standard Schema.org structured data (JSON-LD) to product pages. This tells Google and ChatGPT your live price, in-stock status, and answers to top customer questions.",
        expectedBenefit: "+35% More Visibility in Google & ChatGPT Recommendations",
        rationale:
          "When shoppers ask AI 'What is the best [product] to buy?', AI bots verify structured store data first to confirm product legitimacy and live inventory before recommending it.",
        effort: "Quick Fix (~25m)",
        actionableSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.title }}",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "price": "{{ product.price }}"
  }
}
</script>`,
      },
      {
        id: "aeo-rec-2",
        title: "Turn Product Descriptions into Simple Q&A Blocks",
        category: "AEO_SEO",
        subCategory: "NLP",
        priority: "MEDIUM",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "🛠️ Optimization (~2h)",
        suggestedChange:
          "Replace long walls of text with 3 simple questions: 'Who is this for?', 'What problem does it solve?', and 'How fast does it work?'",
        expectedBenefit: "+22% Higher Customer Engagement & Lower Bounce Rate",
        rationale:
          "Phone shoppers don't read long paragraphs. They scan for quick answers. Clear Q&A makes purchase decisions effortless and helps AI recommend your products.",
        effort: "Moderate (~1.5h)",
        actionableSnippet:
          "<h3>Who is this for?</h3><p>Designed for busy people who want visible results within 14 days without harsh chemicals.</p>",
      },
      {
        id: "aeo-rec-3",
        title: "Add a Quick FAQ Accordion Right Below the Buy Button",
        category: "AEO_SEO",
        subCategory: "NLP",
        priority: "LOW",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Add an easy drop-down answering shipping times, sizing accuracy, and refund policy right beneath the 'Add to Cart' button.",
        expectedBenefit: "+14% Faster Purchases & Less Cart Abandonment",
        rationale:
          "Unresolved questions right before clicking buy cause shoppers to leave. Answering their doubts on the spot keeps them moving toward checkout.",
        effort: "Quick Fix (~30m)",
        actionableSnippet:
          "Frequently Asked: How long does shipping take? Orders ship within 24 hours and arrive in 3-5 business days with live SMS tracking.",
      },
    ],
  },

  FUNNEL_LEAKAGE: {
    id: "FUNNEL_LEAKAGE",
    title: "Funnel Leakage & Abandonment Diagnostics",
    badge: "Biggest Drop-Off: Product Pages (58%)",
    headline: "Where You Are Losing Buyers & Abandoned Carts",
    summary:
      "Visitors arrive on your product pages with high buying intent, but over 58% leave before adding anything to cart. The main causes are missing sticky buy buttons on mobile, unclear delivery dates, and slow checkout forms.",
    metrics: [
      {
        label: "Product Page Drop-off",
        value: "58% Leave",
        status: "critical",
        description: "Shoppers read through your product details, but leave without clicking 'Add to Cart'.",
      },
      {
        label: "Cart-to-Checkout Drop-off",
        value: "28% Leave",
        status: "warning",
        description: "Shoppers add items to cart, but abandon when they see hidden shipping fees or long checkout forms.",
      },
      {
        label: "Mobile Sticky Buy Button",
        value: "Missing",
        status: "critical",
        description: "On phones, when shoppers scroll down to view photos and reviews, the buy button disappears off screen.",
      },
    ],
    subTabs: [
      { id: "ALL", label: "All Funnel Fixes" },
      { id: "PDP", label: "Product Page (PDP)" },
      { id: "CART", label: "Slide-Out Cart" },
      { id: "CHECKOUT", label: "Checkout Flow" },
    ],
    defaultRecommendations: [
      {
        id: "funnel-rec-1",
        title: "Add a Floating Sticky 'Add to Cart' Bar on Mobile Phones",
        category: "FUNNEL_LEAKAGE",
        subCategory: "PDP",
        priority: "HIGH",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Show a clean bar at the bottom of mobile screens that stays visible as users scroll down, showing the price and an immediate 'Add to Cart' button.",
        expectedBenefit: "+19% Increase in Mobile Add-to-Cart Conversions",
        rationale:
          "Over 75% of your traffic is on phones. When shoppers scroll down to read specs and reviews, having to scroll all the way back up to buy causes frustration and drop-off.",
        effort: "Quick Fix (~20m)",
        actionableSnippet:
          "<div class='fixed bottom-0 inset-x-0 bg-white border-t p-3 flex items-center justify-between z-50 shadow-lg'><span class='font-bold text-lg'>{{ product.price }}</span><button class='bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold'>Add to Cart</button></div>",
      },
      {
        id: "funnel-rec-2",
        title: "Add 1-Click Fast Express Checkout (Shop Pay / Apple Pay / UPI)",
        category: "FUNNEL_LEAKAGE",
        subCategory: "CART",
        priority: "MEDIUM",
        targetPage: "Slide-out Cart",
        implementationType: "🛠️ Optimization (~2h)",
        suggestedChange:
          "Put branded 1-click accelerated checkout buttons directly inside the slide-out cart drawer above the normal checkout button.",
        expectedBenefit: "+24% Higher Checkout Completion & 30s Faster Checkout",
        rationale:
          "Nobody likes typing billing addresses, 16-digit card numbers, and OTPs on a phone keyboard. 1-click wallet payments eliminate 80% of form friction.",
        effort: "Moderate (~1h)",
        actionableSnippet:
          "Fast 1-Click Checkout: [Shop Pay] [Apple Pay] [Google Pay] — 100% Encrypted & Secure",
      },
      {
        id: "funnel-rec-3",
        title: "Show Guaranteed Delivery Date Right Near the Buy Button",
        category: "FUNNEL_LEAKAGE",
        subCategory: "PDP",
        priority: "LOW",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Display a clear delivery timeline under the price: 'Order within 3 hours to get delivery by Thursday, Oct 16 with live tracking'.",
        expectedBenefit: "+12% Faster Purchase Decision & Reduced Cart Hesitation",
        rationale:
          "Vague shipping terms like 'Standard Shipping' make buyers hesitate. Giving an exact arrival date reassures them and creates urgency to buy now.",
        effort: "Quick Fix (~20m)",
        actionableSnippet:
          "🚚 Order within the next 4 hours for guaranteed delivery by Friday, with real-time SMS tracking.",
      },
    ],
  },

  DESIGN_ERA: {
    id: "DESIGN_ERA",
    title: "2026 UX Standards & Aesthetic Maturity",
    badge: "Design Feel: Older Template • Needs Upgrade",
    headline: "Modern Look, Mobile Feel & Ease of Use",
    summary:
      "Your store currently looks like an older e-commerce template. Modern shoppers judge product quality by how clean and professional the website feels. Upgrading to clean spacing, easy-to-tap buttons, and modern typography instantly increases trust.",
    metrics: [
      {
        label: "Mobile Tap Friendliness",
        value: "Needs Work",
        status: "warning",
        description: "Buttons, color swatches, and size selectors are too small, causing mis-taps on phones.",
      },
      {
        label: "Visual Clutter Score",
        value: "High Clutter",
        status: "critical",
        description: "Outdated clip-art badges, bright rainbow icons, and cramped text distract shoppers from the product.",
      },
      {
        label: "Text & Font Quality",
        value: "Inconsistent",
        status: "warning",
        description: "Mixed font sizes and hard-to-read text create fatigue for scanning mobile shoppers.",
      },
    ],
    subTabs: [
      { id: "ALL", label: "All UX Fixes" },
      { id: "MOBILE", label: "Mobile Friendly" },
      { id: "EDITORIAL", label: "Clean Design" },
    ],
    defaultRecommendations: [
      {
        id: "design-rec-1",
        title: "Make Buttons and Size Selectors Bigger for Easy Mobile Tapping",
        category: "DESIGN_ERA",
        subCategory: "MOBILE",
        priority: "HIGH",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Increase size pills, color swatches, and quantity selectors to at least 48px height so phone users can tap easily with their thumb.",
        expectedBenefit: "+16% Smoother Mobile Shopping & Fewer Mis-clicks",
        rationale:
          "Small, cramped buttons frustrate mobile shoppers. Making touch targets thumb-friendly prevents accidental clicks and keeps the shopping flow smooth.",
        effort: "Quick Fix (~30m)",
        actionableSnippet:
          "className='h-[48px] px-4 rounded-xl border border-zinc-200 flex items-center justify-center font-medium cursor-pointer'",
      },
      {
        id: "design-rec-2",
        title: "Clean Up the Design by Removing Cluttered Badges",
        category: "DESIGN_ERA",
        subCategory: "EDITORIAL",
        priority: "MEDIUM",
        targetPage: "Homepage",
        implementationType: "🚀 Strategic Redesign",
        suggestedChange:
          "Remove generic clip-art security locks and bright rainbow badges. Use clean, minimal monochrome trust chips with modern fonts and generous spacing.",
        expectedBenefit: "+21% Higher Brand Trust & Premium Perception",
        rationale:
          "Shoppers associate cheap-looking graphics with untrustworthy dropshipping sites. A clean, minimalist layout makes your brand look established and premium.",
        effort: "Strategic (~2h)",
        actionableSnippet:
          "Replace generic security icons with sleek monochrome chips: '🛡️ 100% Certified Authentic' & '📦 Dispatched in 24 Hours'.",
      },
      {
        id: "design-rec-3",
        title: "Add Swipeable Photo Gallery with Short Video Clips on Mobile",
        category: "DESIGN_ERA",
        subCategory: "MOBILE",
        priority: "LOW",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "🛠️ Optimization (~2h)",
        suggestedChange:
          "Allow customers to easily swipe through product photos on phones, and include 1-2 short video clips showing the product in real life.",
        expectedBenefit: "+28% Higher Customer Engagement & Less Uncertainty",
        rationale:
          "Modern shoppers are used to Instagram and TikTok reels. Seeing a real video of the product builds 3x more confidence than static photos alone.",
        effort: "Moderate (~1.5h)",
      },
    ],
  },

  TRUST_CREDIBILITY: {
    id: "TRUST_CREDIBILITY",
    title: "Trust, Proof & Social Credibility Deficit",
    badge: "First-Time Buyer Trust: Low",
    headline: "Customer Trust, Video Proof & Clear Guarantees",
    summary:
      "First-time visitors who discover your brand through ads don't know you yet and naturally feel cautious. Without real customer video reviews, transparent return policies, and clear guarantees, they hesitate to enter their payment details.",
    metrics: [
      {
        label: "Real Customer Video Proof",
        value: "0 Videos",
        status: "critical",
        description: "No real customer unboxing or review videos on product pages.",
      },
      {
        label: "Return Policy Clarity",
        value: "Hidden in Footer",
        status: "critical",
        description: "Customers cannot easily see how simple it is to return or exchange an item.",
      },
      {
        label: "Customer Review Authenticity",
        value: "Unverified Text",
        status: "warning",
        description: "Reviews only show plain text without customer photos or verified buyer badges.",
      },
    ],
    subTabs: [
      { id: "ALL", label: "All Trust Signals" },
      { id: "UGC", label: "Reviews & Videos" },
      { id: "POLICIES", label: "Guarantees & Returns" },
    ],
    defaultRecommendations: [
      {
        id: "trust-rec-1",
        title: "Show 3-4 Real Customer Video Reviews on Product Pages",
        category: "TRUST_CREDIBILITY",
        subCategory: "UGC",
        priority: "HIGH",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "🛠️ Optimization (~2h)",
        suggestedChange:
          "Add a horizontal row of short customer videos or unboxing reels directly under the main product photos showing real people using the product.",
        expectedBenefit: "+32% More Sales from First-Time Visitors",
        rationale:
          "Shoppers today are skeptical of written text reviews because anyone can write them. Real customer videos are impossible to fake and build instant credibility.",
        effort: "Moderate (~1h)",
        actionableSnippet:
          "<div class='grid grid-cols-2 sm:grid-cols-4 gap-3 my-6'><div class='rounded-xl overflow-hidden aspect-[9/16] bg-zinc-100'>[Customer Video Reel 1]</div></div>",
      },
      {
        id: "trust-rec-2",
        title: "Highlight a '30-Day Money-Back Guarantee' Right Under the Buy Button",
        category: "TRUST_CREDIBILITY",
        subCategory: "POLICIES",
        priority: "MEDIUM",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Place a clear reassurance chip right beneath the Add to Cart button: '🛡️ 30-Day Money-Back Guarantee — If you don't love it, get a full refund, no questions asked.'",
        expectedBenefit: "+18% Fewer Hesitant Drop-Offs at Checkout",
        rationale:
          "When a customer knows they can easily return the product if they aren't satisfied, they feel safe and take the risk of buying.",
        effort: "Quick Fix (~20m)",
        actionableSnippet:
          "🛡️ 30-Day Risk-Free Trial: Love it or receive a 100% full refund with prepaid return shipping.",
      },
      {
        id: "trust-rec-3",
        title: "Show a 'Trusted by 10,000+ Customers' Counter in the Top Bar",
        category: "TRUST_CREDIBILITY",
        subCategory: "POLICIES",
        priority: "LOW",
        targetPage: "Global Navigation",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Add a clean announcement in the header: '⭐ Loved by over 14,000+ happy customers nationwide | Easy 30-Day Returns'.",
        expectedBenefit: "+8% Higher Brand Confidence Across the Store",
        rationale:
          "People feel safe doing what others have already done. Showing that thousands have bought before removes fear.",
        effort: "Quick Fix (~15m)",
        actionableSnippet:
          "⭐ Rated 4.9/5 by 14,200+ Verified Buyers | Free Delivery on Orders Above $50",
      },
    ],
  },

  MARKETING_PSYCHOLOGY: {
    id: "MARKETING_PSYCHOLOGY",
    title: "Marketing Psychology & Average Order Value (AOV)",
    badge: "Order Value Potential: +24% Higher",
    headline: "Increasing Order Value with Bundles & Cart Offers",
    summary:
      "Over 80% of your orders contain only a single item. By offering simple quantity discounts (e.g. 'Buy 2 Get 15% Off') and a Free Shipping progress bar in the cart, you can easily increase your revenue per order without spending any extra money on ads.",
    metrics: [
      {
        label: "Multi-Item Orders",
        value: "Only 14%",
        status: "critical",
        description: "Almost all customers buy just 1 single item instead of bundles or sets.",
      },
      {
        label: "Cart Drawer Upsells",
        value: "0 Offers",
        status: "critical",
        description: "You don't show any small add-ons or matching accessories when people open their cart.",
      },
      {
        label: "Free Shipping Goal Bar",
        value: "Missing",
        status: "warning",
        description: "No progress bar in the cart showing customers how close they are to free delivery.",
      },
    ],
    subTabs: [
      { id: "ALL", label: "All Order Value Boosts" },
      { id: "BUNDLES", label: "Quantity Bundles" },
      { id: "CART_EXPANSION", label: "Cart Upsells" },
    ],
    defaultRecommendations: [
      {
        id: "mktg-rec-1",
        title: "Offer Quantity Discount Bundles ('Buy 2 Save 15%', 'Buy 3 Save 25%')",
        category: "MARKETING_PSYCHOLOGY",
        subCategory: "BUNDLES",
        priority: "HIGH",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "🛠️ Optimization (~2h)",
        suggestedChange:
          "Replace standard quantity boxes with attractive bundle options: '1 Item (Standard)', '2 Items (Save 15% - Most Popular)', '3 Items (Save 25% - Best Deal)'. Pre-select the 2-item option.",
        expectedBenefit: "+26% Higher Average Order Value (AOV) on Every Sale",
        rationale:
          "Customers love feeling like they are getting a smart deal. Offering a discount on 2 or 3 units encourages them to spend more in a single purchase.",
        effort: "Moderate (~1h)",
        actionableSnippet:
          "<div class='border-2 border-indigo-600 rounded-xl p-3 bg-indigo-50/50 flex justify-between items-center'><span class='font-bold'>2x Pack (Most Popular)</span><span class='text-indigo-600 font-bold'>Save 15%</span></div>",
      },
      {
        id: "mktg-rec-2",
        title: "Add an Interactive Free Shipping Progress Bar Inside the Cart Drawer",
        category: "MARKETING_PSYCHOLOGY",
        subCategory: "CART_EXPANSION",
        priority: "MEDIUM",
        targetPage: "Slide-out Cart",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Show an animated progress bar at the top of the cart drawer: 'You are only $12 away from Free Express Shipping!'. When they add another item, show 'Unlocked!'.",
        expectedBenefit: "+19% Higher Cart Size & Fewer Abandoned Carts",
        rationale:
          "Shoppers hate paying for shipping. If adding a small $10-$15 accessory gets them free shipping, they will almost always add it.",
        effort: "Quick Fix (~30m)",
        actionableSnippet:
          "<div class='bg-zinc-100 h-2 rounded-full overflow-hidden'><div class='bg-emerald-500 h-full' style='width: 75%'></div></div><p class='text-xs mt-1 text-zinc-600'>Add $12 more for Free Express Delivery!</p>",
      },
      {
        id: "mktg-rec-3",
        title: "Add a 1-Click Complementary Accessory Checkbox on the Product Page",
        category: "MARKETING_PSYCHOLOGY",
        subCategory: "CART_EXPANSION",
        priority: "LOW",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Show an easy checkbox below the buy button for a popular $10 accessory or refill pack with 'Frequently bought together'.",
        expectedBenefit: "+14% Higher Attach Rate on Accessories",
        rationale:
          "When an add-on is inexpensive and clearly useful with the main product, buyers add it on impulse without overthinking.",
        effort: "Quick Fix (~30m)",
      },
    ],
  },

  SPEED_TECH: {
    id: "SPEED_TECH",
    title: "Speed, Core Web Vitals & Technical Infrastructure",
    badge: "Mobile Load Time: 2.8s • Needs Speedup",
    headline: "Store Loading Speed on Mobile Phones",
    summary:
      "Every second of delay on mobile phones causes up to 10% of customers to leave before the page even loads. Heavy uncompressed product photos and too many background app scripts are slowing down your store on cellular networks.",
    metrics: [
      {
        label: "Mobile Page Load Time",
        value: "2.8s Delay",
        status: "critical",
        description: "Photos take too long to download on mobile 4G/5G connections.",
      },
      {
        label: "Visual Screen Stability",
        value: "Stable",
        status: "good",
        description: "Page elements stay in place while loading without jumping around.",
      },
      {
        label: "Background App Scripts",
        value: "12 App Tags",
        status: "warning",
        description: "Too many tracking apps and popup scripts are loading at the same time.",
      },
    ],
    subTabs: [
      { id: "ALL", label: "All Speed Fixes" },
      { id: "VITALS", label: "Page Speed" },
      { id: "ASSETS", label: "Images & App Scripts" },
    ],
    defaultRecommendations: [
      {
        id: "speed-rec-1",
        title: "Compress Main Product Images into Fast Modern Web Formats (WebP / AVIF)",
        category: "SPEED_TECH",
        subCategory: "VITALS",
        priority: "HIGH",
        targetPage: "Product Detail Page (PDP)",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Automatically convert high-resolution product photos into modern WebP format (50% lighter without losing quality) and tell the browser to load the main hero image first.",
        expectedBenefit: "-0.9s Faster Mobile Load Time & +11% Higher Mobile Conversions",
        rationale:
          "The main product image is the heaviest item on the page. Making it load instantly stops impatient mobile buyers from pressing back.",
        effort: "Quick Fix (~25m)",
        actionableSnippet:
          "<link rel='preload' as='image' href='{{ product.featured_image | image_url: width: 800, format: 'webp' }}'>",
      },
      {
        id: "speed-rec-2",
        title: "Delay Non-Essential Tracking Apps Until After the Page Loads",
        category: "SPEED_TECH",
        subCategory: "ASSETS",
        priority: "MEDIUM",
        targetPage: "Global Navigation",
        implementationType: "🛠️ Optimization (~2h)",
        suggestedChange:
          "Set non-critical tracking tags (chat widgets, heatmap trackers, popups) to load only after the main product and buy button have appeared.",
        expectedBenefit: "+35% Faster Button Responsiveness on Mobile Phones",
        rationale:
          "When multiple apps fight to run code at the same time, the mobile screen freezes for 1-2 seconds, causing frustrated 'rage clicks' from buyers.",
        effort: "Moderate (~1h)",
        actionableSnippet:
          "<script src='https://analytics.example.com/tag.js' defer loading='lazy'></script>",
      },
      {
        id: "speed-rec-3",
        title: "Turn On Fast Cloud Caching for Instant Page Navigation",
        category: "SPEED_TECH",
        subCategory: "ASSETS",
        priority: "LOW",
        targetPage: "Global Navigation",
        implementationType: "⚡ Quick Win (<30m)",
        suggestedChange:
          "Enable CDN edge caching (e.g. Cloudflare) so repeat visitors and shoppers browsing multiple products experience instant page loads.",
        expectedBenefit: "-400ms Server Wait Time on Page Transitions",
        rationale:
          "When a customer clicks between different products in your store, instantaneous page loads make your store feel fast, smooth, and trustworthy like Amazon.",
        effort: "Quick Fix (~20m)",
      },
    ],
  },
};

// shop.js
// Insaanon (real buyers) ke liye — har service ki apni alag SEO-optimized page
// (behtar Google ranking ke liye), NOWPayments crypto checkout, order tracking,
// aur Pinterest ke liye pin images generate karta hai.
// x402 wale /agent/:id/:service routes se ALAG hai — wo developers/AI-agents ke
// liye hai, yeh normal logon ke liye jo browser se aate hain.

import { SERVICES } from "./services.js";
import { ImageResponse } from "workers-og";

const SITE_NAME = "AgentSwarm AI";

// Har service ka SEO-friendly copy (Pinterest/Google dono ke liye)
const MARKETING_COPY = {
  jobpack: {
    headline: "Get a Job-Winning Cover Letter in 60 Seconds",
    keywords: "cover letter generator, AI job application, interview prep, resume help",
    metaTitle: "AI Cover Letter Generator — Job Application Pack",
    metaDesc: "Paste a job description and your resume, get a tailored cover letter plus 5 interview-prep questions in seconds. Pay with crypto, $5.",
  },
  listing: {
    headline: "Turn Any Product Into a Best-Selling Listing",
    keywords: "product listing writer, Amazon SEO title, e-commerce copywriting, Daraz Shopify listing",
    metaTitle: "AI Product Listing Writer — SEO Titles & Descriptions",
    metaDesc: "Turn basic product details into an SEO-optimized title, description, and 5 bullet points ready for Amazon, Daraz, or Shopify. $5, instant delivery.",
  },
  social: {
    headline: "A Full Week of Social Captions in One Click",
    keywords: "social media captions, content calendar, hashtag generator, small business marketing",
    metaTitle: "AI Social Media Caption Generator — 7-Day Content Pack",
    metaDesc: "Get 7 days of social media captions and hashtags for your business, generated instantly by AI. $5, no design skills needed.",
  },
  pitch: {
    headline: "Explain Your Startup Idea Like a Pro",
    keywords: "business pitch generator, startup one-pager, elevator pitch, pitch deck text",
    metaTitle: "AI Business Pitch Generator — Startup One-Pager",
    metaDesc: "Turn a rough idea into a clear problem/solution/market pitch paragraph in seconds. Perfect for pitch decks and applications. $5.",
  },
  resume: {
    headline: "Turn Your Resume Into an ATS-Beating Machine",
    keywords: "resume rewriter, ATS resume, resume bullet points, professional resume AI",
    metaTitle: "AI Resume Rewriter — ATS-Friendly Bullet Points",
    metaDesc: "Paste your current resume, get professional, ATS-friendly bullet points instantly. $5, ready to paste into any resume template.",
  },
  linkedin: {
    headline: "A LinkedIn Profile That Actually Gets You Noticed",
    keywords: "LinkedIn headline generator, LinkedIn About section, LinkedIn profile optimization, personal branding AI",
    metaTitle: "AI LinkedIn Profile Optimizer — Headline & About Section",
    metaDesc: "Get a compelling LinkedIn headline and About section written by AI in seconds, based on your background. $5.",
  },
  speech: {
    headline: "A Heartfelt Wedding Speech, Written in Seconds",
    keywords: "wedding speech writer, best man speech, maid of honor speech, event speech generator",
    metaTitle: "AI Wedding & Event Speech Writer",
    metaDesc: "Get a warm, ready-to-read wedding or event speech written by AI based on your details. $5, instant delivery.",
  },
  script: {
    headline: "A YouTube Script That Hooks Viewers in 3 Seconds",
    keywords: "YouTube script writer, video script generator, content creator tools, video hook writer",
    metaTitle: "AI YouTube Script Writer — Hook, Body & Outro",
    metaDesc: "Get a complete YouTube video script with a strong hook, structured body, and CTA outro. $5, instant delivery.",
  },
  email: {
    headline: "A 3-Email Sequence That Sells, Written For You",
    keywords: "email sequence writer, welcome email generator, sales email copywriter, email marketing AI",
    metaTitle: "AI Email Sequence Writer — Welcome & Sales Emails",
    metaDesc: "Get a 3-email welcome/sales sequence written by AI for your business or product. $5, instant delivery.",
  },
  bio: {
    headline: "A Bio That Actually Sounds Like You",
    keywords: "bio writer, Instagram bio generator, author bio, professional bio AI",
    metaTitle: "AI Personal Bio Writer — Short & Long Bio",
    metaDesc: "Get a short social-media bio and a longer website/author bio written by AI, based on who you are. $5.",
  },
};

function pageShell({ title, description, keywords, canonical, bodyHtml, jsonLd, ogImage, price, pinterestVerify }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${price ? "product" : "website"}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}
${price ? `<meta property="product:price:amount" content="${price}">
<meta property="product:price:currency" content="USD">
<meta property="og:price:amount" content="${price}">
<meta property="og:price:currency" content="USD">
<meta property="og:availability" content="instock">` : ""}
${pinterestVerify ? `<meta name="p:domain_verify" content="${pinterestVerify}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${canonical}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background: #fafafa; color: #1a1a1a; }
  h1 { font-size: 1.8rem; } p.tagline { color: #555; }
  .card { background: #fff; border: 1px solid #e2e2e2; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .card h2 { margin-top: 0; font-size: 1.2rem; }
  .desc { color: #444; font-size: 0.92rem; }
  .price { font-weight: bold; font-size: 1.1rem; color: #16794b; }
  textarea { width: 100%; box-sizing: border-box; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; min-height: 100px; }
  button { margin-top: 10px; background: #16794b; color: #fff; border: none; padding: 12px 18px; border-radius: 8px; cursor: pointer; font-size: 1rem; width: 100%; }
  button:hover { background: #125e3a; }
  .status { margin-top: 8px; font-size: 0.9rem; color: #555; }
  a { color: #16794b; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function checkoutScript(service) {
  return `<script>
    document.getElementById('buy-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = e.target.input.value;
      const statusEl = document.getElementById('status');
      statusEl.textContent = 'Creating secure payment link...';
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: '${service}', input })
        });
        const data = await res.json();
        if (data.invoice_url) {
          window.location.href = data.invoice_url;
        } else {
          statusEl.textContent = 'Error: ' + (data.error || 'could not start checkout');
        }
      } catch (err) {
        statusEl.textContent = 'Error creating payment. Please try again.';
      }
    });
  </script>`;
}

function renderIndexPage(baseUrl, pinterestVerify) {
  const cards = Object.entries(SERVICES)
    .map(([key, s]) => {
      const m = MARKETING_COPY[key];
      return `
      <div class="card">
        <h2><a href="/shop/${key}">${m.headline}</a></h2>
        <p class="desc">${s.description.split(" Body:")[0]}</p>
        <p class="price">${s.price}</p>
        <p style="font-size:0.78rem;color:#888;margin-top:-6px;">Crypto payments only (pay with any coin — or buy instantly with your card via MoonPay)</p>
        <a href="/shop/${key}"><button type="button">View & Buy</button></a>
      </div>`;
    })
    .join("\n");

  return pageShell({
    title: `${SITE_NAME} — AI Documents Delivered Instantly`,
    description: "Instant AI-powered documents — cover letters, resumes, product listings, social content, LinkedIn profiles & business pitches, delivered in seconds. Pay with crypto.",
    keywords: "AI cover letter, AI resume, AI product listing, AI LinkedIn profile, AI business pitch, pay with crypto",
    canonical: `${baseUrl}/shop`,
    pinterestVerify,
    bodyHtml: `<h1>${SITE_NAME}</h1>
    <p class="tagline">Instant AI-powered documents. Pay with crypto — no account needed.</p>
    <p style="font-size:0.85rem;color:#666;">New to crypto? You can buy a small amount instantly with your card via <a href="https://www.moonpay.com/buy" target="_blank" rel="noopener">MoonPay</a>.</p>
    ${cards}`,
  });
}

function renderServicePage(baseUrl, key, pinterestVerify) {
  const s = SERVICES[key];
  const m = MARKETING_COPY[key];
  if (!s || !m) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: m.metaTitle,
    description: m.metaDesc,
    offers: {
      "@type": "Offer",
      price: s.price.replace("$", ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  const bodyHtml = `
  <p><a href="/shop">&larr; All services</a></p>
  <div class="card" id="${key}">
    <h1>${m.headline}</h1>
    <p class="desc">${s.description.split(" Body:")[0]}</p>
    <p class="price">${s.price}</p>
    <p style="font-size:0.78rem;color:#888;margin-top:-6px;">💰 Crypto payments — any coin accepted</p>
    <div style="font-size:0.85rem;color:#555;margin-top:12px;background:#f5f7f5;border-radius:8px;padding:14px;line-height:1.6;">
      <strong>Don't have crypto? How to pay with your card (legal, 2 minutes):</strong>
      <ol style="margin:6px 0 0 18px;padding:0;">
        <li>Open <a href="https://www.moonpay.com/buy" target="_blank" rel="noopener">MoonPay</a> (or your wallet app's "Buy" button)</li>
        <li>Buy a small amount of USDC or SOL with your Visa/Mastercard</li>
        <li>It lands in your wallet in ~2 minutes</li>
        <li>Come back here and click "Pay with Crypto" below</li>
      </ol>
    </div>
    <form id="buy-form" style="margin-top:16px;">
      <textarea name="input" placeholder="Paste your details here..." required></textarea>
      <button type="submit">Pay with Crypto — ${s.price}</button>
    </form>
    <div class="status" id="status"></div>
    <p style="font-size:0.85rem;color:#555;margin-top:20px;line-height:1.5;">
      ${m.metaDesc} Trusted by freelancers, small business owners, and job seekers
      who want a professional result without the wait or the high freelancer fees.
    </p>
  </div>
  ${checkoutScript(key)}`;

  return pageShell({
    title: m.metaTitle,
    description: m.metaDesc,
    keywords: m.keywords,
    price: s.price.replace("$", ""),
    ogImage: `${baseUrl}/pin-image/${key}`,
    canonical: `${baseUrl}/shop/${key}`,
    pinterestVerify,
    bodyHtml,
    jsonLd,
  });
}

function renderOrderPage(order) {
  let body;
  if (!order) {
    body = `<p>Order not found. If you just paid, please wait a minute and refresh.</p>`;
  } else if (order.status === "complete") {
    body = `<h2>Your result is ready ✅</h2><pre style="white-space:pre-wrap;background:#fff;padding:16px;border-radius:8px;border:1px solid #e2e2e2;">${(order.result || "").replace(/</g, "&lt;")}</pre>`;
  } else {
    body = `<p>⏳ Payment received, generating your content... this page updates automatically.</p>
    <script>setTimeout(() => window.location.reload(), 5000);</script>`;
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order — ${SITE_NAME}</title>
  <style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:40px auto;padding:16px;}</style>
  </head><body>${body}</body></html>`;
}

// NOWPayments IPN signature verify: HMAC-SHA512 over sorted-key JSON, hex-encoded
async function verifyNowPaymentsSignature(bodyText, signatureHeader, ipnSecret) {
  if (!signatureHeader || !ipnSecret) return false;
  const parsed = JSON.parse(bodyText);
  const sortedStr = JSON.stringify(sortKeysDeep(parsed));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(ipnSecret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(sortedStr));
  const hex = [...new Uint8Array(sigBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === signatureHeader;
}

function sortKeysDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortKeysDeep(obj[k]);
        return acc;
      }, {});
  }
  return obj;
}

export function registerShopRoutes(app) {
  // Index page — sab services list karta hai
  app.get("/shop", (c) => {
    const baseUrl = new URL(c.req.url).origin;
    return c.html(renderIndexPage(baseUrl, c.env.PINTEREST_VERIFY_CODE));
  });
  // Trailing-slash version bhi register karo — Pinterest verification isay maangta hai
  app.get("/shop/", (c) => {
    const baseUrl = new URL(c.req.url).origin;
    return c.html(renderIndexPage(baseUrl, c.env.PINTEREST_VERIFY_CODE));
  });

  // Har service ki apni alag SEO page — behtar Google ranking ke liye
  app.get("/shop/:service", (c) => {
    const baseUrl = new URL(c.req.url).origin;
    const html = renderServicePage(baseUrl, c.req.param("service"), c.env.PINTEREST_VERIFY_CODE);
    if (!html) return c.text("Service not found", 404);
    return c.html(html);
  });

  // robots.txt + sitemap.xml for SEO
  app.get("/robots.txt", (c) =>
    c.text("User-agent: *\nAllow: /\nSitemap: " + new URL(c.req.url).origin + "/sitemap.xml")
  );
  app.get("/sitemap.xml", (c) => {
    const base = new URL(c.req.url).origin;
    const urls = ["/shop", ...Object.keys(SERVICES).map((k) => `/shop/${k}`)]
      .map((path) => `<url><loc>${base}${path}</loc></url>`)
      .join("");
    return c.text(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
      200,
      { "Content-Type": "application/xml" }
    );
  });

  // Checkout: order KV mein save, NOWPayments invoice banata hai
  app.post("/api/checkout", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { service, input } = body;
    if (!SERVICES[service] || !input) {
      return c.json({ error: "Invalid service or missing input" }, 400);
    }
    const orderId = crypto.randomUUID();
    const baseUrl = new URL(c.req.url).origin;
    const priceNum = parseFloat(SERVICES[service].price.replace("$", ""));

    await c.env.LEDGER_KV.put(
      `order:${orderId}`,
      JSON.stringify({ service, input, status: "pending", created: Date.now() })
    );

    const npRes = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": c.env.NOWPAYMENTS_API_KEY },
      body: JSON.stringify({
        price_amount: priceNum,
        price_currency: "usd",
        order_id: orderId,
        order_description: SERVICES[service].label,
        ipn_callback_url: `${baseUrl}/webhook/nowpayments`,
        success_url: `${baseUrl}/order/${orderId}`,
        cancel_url: `${baseUrl}/shop/${service}`,
      }),
    });

    if (!npRes.ok) {
      const errText = await npRes.text();
      return c.json({ error: "Payment gateway error: " + errText }, 502);
    }
    const npData = await npRes.json();
    return c.json({ invoice_url: npData.invoice_url });
  });

  // NOWPayments webhook (IPN) — payment confirm hote hi yahan call aati hai
  app.post("/webhook/nowpayments", async (c) => {
    const bodyText = await c.req.text();
    const signature = c.req.header("x-nowpayments-sig") || "";
    const valid = await verifyNowPaymentsSignature(bodyText, signature, c.env.NOWPAYMENTS_IPN_SECRET);
    if (!valid) {
      return c.json({ error: "invalid signature" }, 401);
    }
    const payload = JSON.parse(bodyText);
    const orderId = payload.order_id;
    const status = payload.payment_status;

    if (["confirmed", "finished"].includes(status)) {
      const raw = await c.env.LEDGER_KV.get(`order:${orderId}`);
      if (raw) {
        const order = JSON.parse(raw);
        if (order.status !== "complete") {
          const prompt = SERVICES[order.service].buildPrompt({ input: order.input });
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${c.env.GROQ_API_KEY}` },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              max_tokens: 500,
            }),
          });
          const groqData = await groqRes.json();
          const result = groqData.choices?.[0]?.message?.content?.trim() || "";
          order.status = "complete";
          order.result = result;
          await c.env.LEDGER_KV.put(`order:${orderId}`, JSON.stringify(order));

          const key = "earnings:shop";
          const current = parseFloat((await c.env.LEDGER_KV.get(key)) || "0");
          const priceNum = parseFloat(SERVICES[order.service].price.replace("$", ""));
          await c.env.LEDGER_KV.put(key, (current + priceNum).toFixed(6));
        }
      }
    }
    return c.json({ received: true });
  });

  // Order status page
  app.get("/order/:id", async (c) => {
    const raw = await c.env.LEDGER_KV.get(`order:${c.req.param("id")}`);
    const order = raw ? JSON.parse(raw) : null;
    return c.html(renderOrderPage(order));
  });

  // Pinterest pin image (1000x1500 PNG) — koi alag image-hosting service nahi chahiye
  app.get("/pin-image/:service", async (c) => {
    const service = c.req.param("service");
    const m = MARKETING_COPY[service];
    const s = SERVICES[service];
    if (!m || !s) return c.text("not found", 404);

    // Har din thodi variation (fresh pin design signal Pinterest ke liye) — 4 color
    // schemes rotate hote hain date ke hisaab se
    const GRADIENTS = [
      "linear-gradient(135deg, #16794b, #0c4a2c)",
      "linear-gradient(135deg, #1d4ed8, #0b1f6b)",
      "linear-gradient(135deg, #b91c1c, #5c0e0e)",
      "linear-gradient(135deg, #7c3aed, #3b0f8c)",
    ];
    const dayIndex = new Date().getDate() % GRADIENTS.length;
    const background = GRADIENTS[dayIndex];

    return new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "1000px",
            height: "1500px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background,
            color: "#fff",
            fontFamily: "sans-serif",
            padding: "80px",
            textAlign: "center",
          },
          children: [
            {
              type: "div",
              props: { style: { fontSize: "64px", fontWeight: "bold", lineHeight: 1.2 }, children: m.headline },
            },
            {
              type: "div",
              props: {
                style: { fontSize: "48px", marginTop: "60px", background: "#fff", color: "#16794b", padding: "20px 40px", borderRadius: "20px", fontWeight: "bold" },
                children: s.price,
              },
            },
            {
              type: "div",
              props: { style: { fontSize: "28px", marginTop: "30px", opacity: 0.85 }, children: "💰 Crypto payments only" },
            },
          ],
        },
      },
      { width: 1000, height: 1500 }
    );
  });
}

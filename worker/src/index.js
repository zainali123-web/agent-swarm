// index.js — Cloudflare Worker
// Har agent ka apna route hai: /agent/:id/:service
// Payment na aane per x402 middleware khud 402 response de deta hai (payment instructions ke saath).
// Payment verify hone ke baad hi Groq call hoti hai aur result return hota hai + earning KV mein log hoti hai.
//
// SETUP ZAROORI: is file ko chalane se pehle README.md ke steps follow karein
// (wallet address, Groq key, KV namespace — sab wrangler secrets/vars mein set karne hain)

import { Hono } from "hono";
import { paymentMiddleware } from "@x402/hono";
import { SERVICES } from "./services.js";
import { registerShopRoutes } from "./shop.js";

const app = new Hono();

// ---- Insaanon (real buyers) ke liye shop, checkout, order-tracking, aur
// Pinterest pin-image routes yahan register hote hain ----
registerShopRoutes(app);

// ---- Health check (free, no payment needed) ----
app.get("/", (c) =>
  c.json({
    status: "alive",
    services: Object.entries(SERVICES).map(([key, s]) => ({
      route_pattern: `/agent/:id/${key}`,
      label: s.label,
      price: s.price,
      description: s.description,
    })),
  })
);

// ---- Payment-gated agent service routes ----
// Har service ke liye ek dynamic price wala route banate hain
for (const [serviceKey, service] of Object.entries(SERVICES)) {
  const routePath = `/agent/:id/${serviceKey}`;

  app.use(
    routePath,
    async (c, next) => {
      // Per-request wallet address env se, taake sab ek hi wallet mein aaye
      const middleware = paymentMiddleware(
        {
          [routePath]: {
            price: service.price,
            network: c.env.X402_NETWORK || "eip155:8453", // Base mainnet; testing ke liye eip155:84532 (base-sepolia)
          },
        },
        {
          payTo: c.env.SERVER_WALLET_ADDRESS,
          facilitator: { url: c.env.FACILITATOR_URL || "https://x402.org/facilitator" },
        }
      );
      return middleware(c, next);
    }
  );

  app.post(routePath, async (c) => {
    const agentId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const inputCheck = typeof body === "string" ? body : body.input || body.text || "";

    if (!inputCheck) {
      return c.json({ error: "Missing 'input' in request body" }, 400);
    }

    // Agent zinda hai ya nahi (balance 0 ho chuka?) — check KV
    const aliveFlag = await c.env.LEDGER_KV.get(`alive:${agentId}`);
    if (aliveFlag === "dead") {
      return c.json({ error: `Agent ${agentId} is terminated (balance reached $0).` }, 410);
    }

    // ---- Groq API call: asal kaam yahan hota hai ----
    const prompt = service.buildPrompt(body);
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${c.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!groqRes.ok) {
      return c.json({ error: "Upstream AI call failed" }, 502);
    }

    const groqData = await groqRes.json();
    const result = groqData.choices?.[0]?.message?.content?.trim() || "";

    // ---- Earning log karo KV mein (agent ki lifetime earning badhao) ----
    const key = `earnings:${agentId}`;
    const current = parseFloat((await c.env.LEDGER_KV.get(key)) || "0");
    const priceNum = parseFloat(service.price.replace("$", ""));
    await c.env.LEDGER_KV.put(key, (current + priceNum).toFixed(6));

    return c.json({ agent: agentId, service: serviceKey, result });
  });
}

// ---- Protected endpoint jo brain.py (GitHub Actions) periodically read karega ----
app.get("/internal/ledger", async (c) => {
  if (c.req.header("x-internal-secret") !== c.env.INTERNAL_SECRET) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const list = await c.env.LEDGER_KV.list({ prefix: "earnings:" });
  const snapshot = {};
  for (const k of list.keys) {
    snapshot[k.name.replace("earnings:", "")] = parseFloat(await c.env.LEDGER_KV.get(k.name));
  }
  return c.json(snapshot);
});

// ---- Internal endpoint jisse brain.py kisi agent ko "dead" mark kar sakta hai (balance 0) ----
app.post("/internal/kill/:id", async (c) => {
  if (c.req.header("x-internal-secret") !== c.env.INTERNAL_SECRET) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await c.env.LEDGER_KV.put(`alive:${c.req.param("id")}`, "dead");
  return c.json({ killed: c.req.param("id") });
});

export default app;

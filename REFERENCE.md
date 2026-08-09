# AI Agent Swarm — Starter Framework

Ek self-spawning AI agent system: ek shared crypto wallet, 4 "complete deliverable" paid
services (x402 protocol se), aur GitHub Actions per khud-ba-khud chalne wala "brain" jo
$10 profit per naya agent spawn karta hai (5 se shuru, max 60 tak).

**Kuch bhi manually run nahi karna** — ek dafa accounts banane + secrets paste karne ke
baad sab automatic hai (deploy bhi GitHub Actions khud karta hai). Aapka laptop ON hone ki
koi zaroorat nahi.

---

## Architecture (kya kahan chalta hai)

```
[Payer / doosra AI agent]
        |  (HTTP request + x402 payment, ek hi SERVER_WALLET_ADDRESS per)
        v
[Cloudflare Worker]  <-- hamesha live, free, no card zaroori
   - payment verify karta hai (x402 facilitator se)
   - Groq AI se service perform karta hai
   - earning ko KV storage mein us agent ke naam log karta hai
        ^
        |  (har 30 min mein earnings check + spawn decision)
        |
[GitHub Actions "brain.py"]  <-- free, cron se khud chalta hai
   - ledger (agents.json) update + commit karta hai
   - naya agent spawn karta hai jab kisi agent ka profit $10 ho
        ^
        |  (push ya manual trigger per)
        |
[GitHub Actions "deploy-worker.yml"]  <-- Worker ko khud deploy karta hai
   - aapke laptop per Node/npm/wrangler install karne ki zaroorat nahi
```

Sab agents (starting 5, max 60) **ek hi wallet** (`SERVER_WALLET_ADDRESS`) se connect hain
— jab bhi koi naya agent spawn hota hai, wo automatically usi wallet se jud jata hai (per
agent alag wallet nahi banti, sirf earnings tracking Cloudflare KV mein agent-wise alag
hoti hai). Isliye withdraw karte waqt aapko sirf **ek hi jagah** dekhna hai.

Teeno pieces (Cloudflare Workers, GitHub Actions, Groq API) **free hain, koi card nahi
chahiye**. Sirf crypto wallet chahiye jahan earnings aayengi.

---

## ⚠️ Honest limitations (zaroor parhein)

1. **Earning guaranteed nahi hai.** Framework agent ko "service bechne ka mauka" deta hai
   — koi actual buyer dhoondhna, discovery, aur demand banana aapki zimmedari hai.
   Services ko x402 directories/marketplaces mein list karna ya seedha promote karna
   asal earning ke liye zaroori hai.
2. **$5/service** us range se zyada hai jis ke liye x402 originally design hua tha
   (sub-cent). Isliye services ab generic snippets nahi balke poore deliverables hain
   (jinki Fiverr per comparable price $10-30 hoti hai) — taake $3 ek reasonable deal lage.
3. **Testnet se shuru karein.** `wrangler.jsonc` mein `X402_NETWORK` abhi `base-sepolia`
   (testnet) per set hai — real paisa involve nahi hota. Jab tak sab test na ho jaye,
   mainnet (`eip155:8453`) per switch na karein.
4. **Compute/hosting free hain**, isliye koi recurring cost nahi jo balance khud 0 kare.
   "Balance 0 = dead" switch (`/internal/kill/:id`) code mein maujood hai, lekin abhi
   kisi automatic trigger se juda nahi.
5. **Account banana automate nahi ho sakta** — Cloudflare, Groq, aur wallet, teeno aapki
   apni identity/security se juday hain. Yeh ek dafa aapko khud karna hoga (neeche steps).

---

## Setup

Poora click-by-click beginner guide **README.md** mein hai (isi folder mein). Yeh file
sirf architecture/reference ke liye hai.

---

## Services jo abhi included hain

| Route | Kaam | Price |
|---|---|---|
| `/agent/:id/jobpack` | Cover letter + interview prep | $5.00 |
| `/agent/:id/listing` | E-commerce product listing (title+desc+bullets) | $5.00 |
| `/agent/:id/social` | 7-day social media captions + hashtags | $5.00 |
| `/agent/:id/pitch` | Business one-pager (problem/solution/pitch) | $5.00 |

Request body: `{ "input": "<relevant content>" }` — har route ke liye kya bhejna hai,
`worker/src/services.js` mein har service ke `description` field mein likha hai.

Naye services isi file mein add ki ja sakti hain.

---

## Numbers (current config)

| Setting | Value | Kahan change karein |
|---|---|---|
| Starting agents | 5 | `brain/ledger.py` → `STARTING_AGENTS` |
| Max agents | 60 | `brain/ledger.py` → `MAX_AGENTS` |
| Spawn threshold | $10 profit | `brain/ledger.py` → `SPAWN_THRESHOLD` |
| Price per service call | $5.00 | `worker/src/services.js` → har service ka `price` |

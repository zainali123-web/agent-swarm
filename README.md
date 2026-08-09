# Setup Guide — Shuru se Aakhir tak (har click yahan hai)

Yeh guide maan kar chal rahi hai aapko **kuch bhi pata nahi**. Har step mein bilkul batya
gaya hai kahan tap/click karna hai. Total time: ~20-25 minute, ek dafa.

**Kya-kya chahiye (sab free):** Trust Wallet (aapke paas already hai), GitHub account,
Cloudflare account, Groq account.

**Quick links (sab isi guide mein neeche bhi hain):**

| Website | Link |
|---|---|
| GitHub signup | https://github.com/signup |
| Cloudflare signup | https://dash.cloudflare.com/sign-up |
| Cloudflare API Tokens | https://dash.cloudflare.com/profile/api-tokens |
| Groq console | https://console.groq.com |

---

## STEP 1: Apna wallet address nikalein (Trust Wallet mein already hai)

Aapke screenshot mein maine dekha — aapke paas **already ek Ethereum address hai**,
naya banane ki zaroorat nahi. Base network bhi Ethereum jaisa hi address format use
karta hai, isliye yehi address dono jagah kaam karega.

1. Trust Wallet app kholein → **"Receive"** per tap karein
2. List mein **"ETH — Ethereum"** wali row dhoondein (jaisa aapke screenshot mein
   `0x724e1...02E1fc` dikh raha hai)
3. Us row ke **right side mein do overlapping squares wala icon** (copy icon) per tap
   karein — address copy ho jayega
4. Kahin paste kar ke rakh lein (Notes app mein) — pura address dikhna chahiye, jaisa
   `0x724e1a...........02E1fc` (beech mein poore characters, sirf screenshot mein short
   dikhta hai)

**Optional (Base network dikhne ke liye):** Trust Wallet mein "Base" network alag se
add kar sakte hain taake balance seedha app mein dikhe:
- Wallet home per **"+"** ya **"Manage Crypto"** per tap karein
- Search mein **"Base"** likhein, us per tap kar ke enable/add kar dein
- Yeh sirf **dikhane** ke liye hai — address wahi rahega jo already copy kiya

⚠️ Kabhi bhi "Secret Phrase"/"Private Key" kisi ko na dein — sirf yeh `0x...` address
chahiye, jo public/safe hai share karna.

---

## STEP 2: GitHub account banayein aur code upload karein

**Link: https://github.com/signup**

1. Upar wale link per jayein, email/password se account banayein (free hai)
2. Login hone ke baad, upar-right corner mein **"+"** icon per tap karein → **"New
   repository"**
3. Repository ka naam likhein (jaise `agent-swarm`), **"Public"** select karein (private
   nahi — pehle discuss ho chuka hai ke public isliye behtar hai kyunke Actions minutes
   free/unlimited rehti hain)
4. **"Create repository"** per tap karein
5. Ab jo zip file maine di thi, usay apne phone/computer mein **extract/unzip** karein
6. Naye repo page per, **"uploading an existing file"** wala link dikhega (ya "Add file"
   → "Upload files") — us per tap karein
7. Extract ki hui files/folders ko drag-drop karein ya "choose your files" se select
   karein (poora folder structure — `.github`, `worker`, `brain`, sab kuch)
8. Neeche scroll kar ke **"Commit changes"** per tap karein

✅ Ab aapka code GitHub per hai.

---

## STEP 3: Cloudflare account banayein

**Link: https://dash.cloudflare.com/sign-up**

1. Upar wale link per jayein, **"Sign up"** per tap karein (email/password, free, koi
   card nahi)
2. Login hone ke baad:

   **API Token banayein:**
   - Link: https://dash.cloudflare.com/profile/api-tokens
   - **"Create Token"** per tap karein
   - **"Edit Cloudflare Workers"** template dhoondein, uske saamne **"Use template"**
     per tap karein
   - Neeche **"Continue to summary"** phir **"Create Token"** per tap karein
   - Jo token dikhega, usay **copy** kar ke Notes app mein paste kar dein (yeh sirf
     ek dafa dikhta hai!)

   **KV namespace banayein (yeh aapki agents ki earnings store karega):**
   - Left menu mein **"Workers & Pages"** per tap karein
   - **"KV"** tab per tap karein (ya left menu mein "KV" dhoondein)
   - **"Create a namespace"** per tap karein
   - Naam `LEDGER_KV` likhein, **"Add"** per tap karein
   - Jo **ID** dikhega (lamba code), usay bhi copy kar ke Notes mein save kar lein

---

## STEP 4: Groq account banayein (free AI)

**Link: https://console.groq.com**

1. Upar wale link per jayein, **"Sign up"** per tap karein (email se, free)
2. Login hone ke baad, left menu mein **"API Keys"** per tap karein
3. **"Create API Key"** per tap karein, naam kuch bhi de dein
4. Jo key dikhegi, usay **copy** kar ke Notes mein save kar lein (yeh bhi ek hi dafa
   dikhti hai!)

---

## STEP 5: 2 files GitHub per edit karein (apni values daalne ke liye)

1. Apne GitHub repo mein jayein, folder `worker` kholein, phir file
   **`wrangler.jsonc`** per tap karein
2. Upar-right corner mein **pencil (edit) icon** per tap karein
3. Yeh do lines dhoondein aur replace karein:
   - `"SERVER_WALLET_ADDRESS": "0xYOUR_WALLET_ADDRESS_HERE"` → apni Step 1 wali
     `0x...` address se replace karein
   - `"id": "YOUR_KV_NAMESPACE_ID_HERE"` → apni Step 3 wali KV ID se replace karein
4. Neeche **"Commit changes"** per tap karein

---

## STEP 6: GitHub Secrets add karein (aapki saari keys yahan jati hain)

1. Repo mein **"Settings"** tab per tap karein (upar, sabse right)
2. Left menu mein **"Secrets and variables"** → **"Actions"** per tap karein
3. **"New repository secret"** per tap karein — yeh 4 secrets ek-ek kar ke banayein:

   | Name (bilkul yehi likhein) | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | Step 3 wala token |
   | `GROQ_API_KEY` | Step 4 wali key |
   | `INTERNAL_SECRET` | koi bhi random lamba text khud bana lein, jaise `myagent2026secret99xyz` |
   | `WORKER_URL` | abhi ke liye koi bhi kuch bhi likh dein (jaise `pending`) — Step 8 mein isay update karenge |

   Har ek ke liye: naam type karein → value paste karein → **"Add secret"** tap karein

---

## STEP 7: Deploy karein (khud-ba-khud)

1. Repo mein **"Actions"** tab per tap karein (upar)
2. Left side mein **"Deploy Worker"** workflow dikhega, us per tap karein
3. Right side mein **"Run workflow"** button dikhega (dropdown ke saath) — us per tap
   karein, phir dobara **"Run workflow"** confirm karein
4. 1-2 minute wait karein, phir page refresh karein — ek green checkmark ✅ dikhna
   chahiye. Agar red ❌ ho, us run per tap kar ke error dekh sakte hain

---

## STEP 8: Worker ka URL nikalein aur WORKER_URL secret update karein

1. Usi "Deploy Worker" run per tap karein jo abhi chala
2. **"deploy"** job per tap karein, phir **"Deploy to Cloudflare Workers"** step kholein
3. Yahan ek URL dikhega jaisa: `https://agent-swarm-worker.<kuch-naam>.workers.dev`
   — poora copy kar lein
4. Wapis **Settings → Secrets and variables → Actions** jayein
5. `WORKER_URL` secret ke saamne pencil icon per tap karein, **"Update secret"**, aur
   copy kiya hua URL paste kar dein (last mein `/` na lagayein), **"Update secret"**
   per tap karein

---

## STEP 9: Test karein

1. Jo URL Step 8 mein mila, usay apne phone ke browser mein khol kar dekhein — ek JSON
   list dikhni chahiye 4 services ki (jobpack, listing, social, pitch)
2. Wapis Actions tab mein jayein, **"Agent Swarm Cycle"** workflow per tap karein,
   **"Run workflow"** se manually chalayein
3. 1 minute baad `brain/agents.json` file kholein (repo mein) — 5 agents dikhne
   chahiye, aur thodi der baad `"registered": true` bhi ho jayega har agent ke liye

---

## ✅ Ab sab khatam — kabhi kuch manually nahi karna

- Har 30 minute mein brain khud chalega, agents ki earning check karega
- Jab koi agent $10 profit kamaye, naya agent khud spawn hoga (60 tak)
- Har naya agent khud 402 Index per register ho jayega — buyers khud dhoond sakenge
- Sab earnings aapki ek hi wallet (Step 1 wali) mein jama hongi

Kabhi bhi withdraw karna ho, seedha apni Trust Wallet ke us Ethereum/Base address per
check karein — jo bhi kamai hui hogi wahin dikhegi.

---

## Kuch atak jaye to

- Agar koi step samajh na aaye ya error aaye, wo screenshot/error message yahan paste
  kar dein, main dekh kar batauunga kya karna hai
- `REFERENCE.md` file mein technical details, numbers, aur limitations hain agar
  zyada samajhna ho

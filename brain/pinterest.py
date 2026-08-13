"""
pinterest.py
Har service (10 total) ke liye ek Pinterest pin banata hai — jo /shop/<service> page
ka link deta hai (jahan real log crypto se khareed sakte hain).

Seedha Pinterest API use nahi kar rahe (uska Developer App + OAuth review mushkil hai)
— iski jagah **Buffer** (buffer.com) use kar rahe hain: ek bara, globally-accessible,
established platform. Pinterest ko Buffer dashboard mein ek click se "Connect" karna
hai, phir seedha GraphQL API se post karte hain. Free plan: 3 channels, kaafi hai.

ENV VARS chahiye (GitHub Actions secrets se aate hain):
  BUFFER_API_KEY     Buffer -> publish.buffer.com/settings/api se (Personal Access token)
  BUFFER_CHANNEL_ID   Connected Pinterest channel ki ID (Buffer dashboard/API se milti hai)
  SHOP_URL            e.g. https://agent-swarm-worker.<subdomain>.workers.dev
  GROQ_API_KEY         caption text banane ke liye
"""

import os
import sys
import random
import datetime
import requests

BUFFER_API_KEY = os.environ.get("BUFFER_API_KEY", "")
BUFFER_CHANNEL_ID = os.environ.get("BUFFER_CHANNEL_ID", "")
SHOP_URL = os.environ.get("SHOP_URL", "").rstrip("/")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Har service ko uske topic ke hisaab se ek alag board per bhejte hain (na ke sab ek
# generic board mein) — Pinterest SEO research (2026) confirm karti hai ke "jis board
# mein pehli baar pin jati hai, wahi Pinterest ko batata hai content kis topic ka hai."
# In 4 boards ko Pinterest/Buffer mein ek dafa manually banana hoga (jaisa
# "AI Tools & Templates" banaya tha) — bilkul yehi naam se.
BOARD_MAP = {
    "jobpack": "Career & Job Search Tools",
    "resume": "Career & Job Search Tools",
    "linkedin": "Career & Job Search Tools",
    "listing": "Business & E-commerce Tools",
    "pitch": "Business & E-commerce Tools",
    "email": "Business & E-commerce Tools",
    "social": "Content Creator Tools",
    "script": "Content Creator Tools",
    "bio": "Content Creator Tools",
    "speech": "Life Events Writing",
}

SERVICES = {
    "jobpack": {"title": "AI Cover Letter Generator — Job-Winning in 60 Seconds",
                "topic": "getting a tailored cover letter and interview prep instantly using AI, for job seekers"},
    "listing": {"title": "AI Product Listing Writer — SEO Titles That Sell",
                "topic": "turning basic product details into a polished, SEO-friendly e-commerce listing using AI"},
    "social": {"title": "7 Days of Social Captions — Generated Instantly",
               "topic": "getting a full week of social media captions and hashtags for a small business using AI"},
    "pitch": {"title": "Turn Your Startup Idea Into a Pitch in Seconds",
              "topic": "turning a rough startup idea into a clear one-pager pitch using AI"},
    "resume": {"title": "AI Resume Rewriter — ATS-Friendly Bullet Points",
               "topic": "rewriting a resume into professional, ATS-friendly bullet points instantly using AI"},
    "linkedin": {"title": "AI LinkedIn Profile Optimizer — Get Noticed",
                 "topic": "getting a compelling LinkedIn headline and About section written by AI"},
    "speech": {"title": "AI Wedding & Event Speech Writer",
               "topic": "getting a heartfelt wedding or event speech written instantly by AI"},
    "script": {"title": "AI YouTube Script Writer",
               "topic": "getting a complete YouTube video script with hook, body, and outro written by AI"},
    "email": {"title": "AI Email Sequence Writer",
              "topic": "getting a 3-email welcome/sales sequence written instantly by AI for a business"},
    "bio": {"title": "AI Personal Bio Writer",
            "topic": "getting a short and long personal bio written by AI for social media or a website"},
}


EMOJIS = ["✨", "🚀", "💡", "🔥", "📌", "⭐", "🎯", "💬", "🌟", "👇", "🙌", "✅"]


def generate_caption(topic, link):
    """Groq se ek chhota, engaging Pinterest caption banata hai — crypto-aware audience
    (freelancers/Web3 users) ko primarily target karta hai, card-users ke liye bhi soft
    mention karta hai, aur end mein 3-5 relevant hashtags deta hai (Pinterest discovery
    ke liye zaroori hain)."""
    prompt = (
        f"Write a short, engaging Pinterest pin description (max 2 sentences) "
        f"about {topic}. Frame it for an audience that is comfortable with crypto/Web3 "
        f"(e.g., freelancers, crypto users) and mention payment is via crypto — but also "
        f"add a brief, friendly note that even without crypto, you can pay by buying a "
        f"small amount instantly with a card. End with a soft call-to-action, then on a "
        f"new line add 4 relevant, professional Pinterest hashtags (e.g. #AITools "
        f"#Freelancer #SideHustle #CryptoPayments style — pick ones relevant to the topic). "
        f"Output ONLY the description and hashtags, nothing else."
    )
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"},
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 100,
        },
        timeout=30,
    )
    resp.raise_for_status()
    caption = resp.json()["choices"][0]["message"]["content"].strip()
    # Random emoji guarantee karta hai ke text kabhi bhi purane/deleted post se
    # byte-for-byte match na kare — Buffer ka duplicate-detection isay bypass kar
    # deta hai (Groq ki apni randomness per akela depend nahi karte)
    return f"{random.choice(EMOJIS)} {caption} {link}"


def post_pin(service_key, meta):
    link = f"{SHOP_URL}/shop/{service_key}"
    caption = generate_caption(meta["topic"], link)
    # Date query-param jodne se URL har din unique ban jata hai — Buffer ka duplicate
    # detection isay purane (delete ho chuke) post se "alag" samajhta hai
    today = datetime.date.today().isoformat()
    image_url = f"{SHOP_URL}/pin-image/{service_key}?v={today}"

    query = """
    mutation CreatePin($channelId: ChannelId!, $text: String!, $imageUrl: String!, $board: String!, $title: String!, $link: String!) {
      createPost(input: {
        text: $text,
        channelId: $channelId,
        schedulingType: automatic,
        mode: addToQueue,
        metadata: { pinterest: { board: $board, title: $title, url: $link } },
        assets: [{ image: { url: $imageUrl } }]
      }) {
        ... on PostActionSuccess { post { id text dueAt } }
        ... on MutationError { message }
      }
    }
    """
    resp = requests.post(
        "https://api.buffer.com",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {BUFFER_API_KEY}"},
        json={
            "query": query,
            "variables": {
                "channelId": BUFFER_CHANNEL_ID,
                "text": caption,
                "imageUrl": image_url,
                "board": BOARD_MAP.get(service_key, "AI Tools & Templates"),
                "title": meta["title"][:100],  # Pinterest title max ~100 chars, keyword-rich front matters most
                "link": link,
            },
        },
        timeout=30,
    )
    if resp.status_code >= 400:
        print(f"[{service_key}] Pinterest post FAILED (HTTP {resp.status_code}): {resp.text}")
        return False
    data = resp.json()

    # Top-level GraphQL errors (jaise galat field/schema) — pehle yeh check karo,
    # warna yeh silently miss ho kar false "success" dikha sakta hai
    if data.get("errors"):
        print(f"[{service_key}] GraphQL error: {data['errors']}")
        return False

    result = data.get("data", {}).get("createPost", {}) if data.get("data") else {}
    if result.get("message"):
        print(f"[{service_key}] Buffer error: {result['message']}")
        return False
    if not result:
        print(f"[{service_key}] Unexpected empty response: {data}")
        return False
    print(f"[{service_key}] Pin queued -> {link}")
    return True


def main():
    if not all([BUFFER_API_KEY, BUFFER_CHANNEL_ID, SHOP_URL, GROQ_API_KEY]):
        print("Missing required env vars — check GitHub secrets (BUFFER_API_KEY, BUFFER_CHANNEL_ID, WORKER_URL, GROQ_API_KEY).")
        sys.exit(1)

    results = {}
    for key, meta in SERVICES.items():
        try:
            results[key] = post_pin(key, meta)
        except requests.RequestException as e:
            print(f"[{key}] Error: {e}")
            results[key] = False

    ok = sum(1 for v in results.values() if v)
    print(f"Done. {ok}/{len(SERVICES)} pins queued successfully.")


if __name__ == "__main__":
    main()

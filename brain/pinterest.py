"""
pinterest.py
Har service (jobpack, listing, social, pitch) ke liye ek Pinterest pin banata/refresh
karta hai — jo /shop page ka link deta hai (jahan real log crypto se khareed sakte hain).

Seedha Pinterest API use nahi kar rahe (uska apna Developer App + OAuth review process
mushkil hai) — iski jagah **PostPeer** (postpeer.dev) use kar rahe hain, jo Pinterest
account ko ek simple one-time "Connect" click se jodta hai, phir seedha REST API se
post karne deta hai. Free tier: 20 posts, koi card nahi chahiye.

ENV VARS chahiye (GitHub Actions secrets se aate hain):
  POSTPEER_API_KEY     PostPeer dashboard se
  POSTPEER_ACCOUNT_ID   PostPeer per connected Pinterest account ki ID
  POSTPEER_BOARD_ID     Us Pinterest board ki ID jahan pins jayenge
  SHOP_URL              e.g. https://agent-swarm-worker.<subdomain>.workers.dev
  GROQ_API_KEY           caption text banane ke liye
"""

import os
import sys
import requests

POSTPEER_API_KEY = os.environ.get("POSTPEER_API_KEY", "")
POSTPEER_ACCOUNT_ID = os.environ.get("POSTPEER_ACCOUNT_ID", "")
POSTPEER_BOARD_ID = os.environ.get("POSTPEER_BOARD_ID", "")
SHOP_URL = os.environ.get("SHOP_URL", "").rstrip("/")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

SERVICES = {
    "jobpack": {
        "title": "AI Cover Letter Generator — Job-Winning in 60 Seconds",
        "topic": "getting a tailored cover letter and interview prep instantly using AI, for job seekers",
    },
    "listing": {
        "title": "AI Product Listing Writer — SEO Titles That Sell",
        "topic": "turning basic product details into a polished, SEO-friendly e-commerce listing using AI, for small sellers on Amazon/Daraz/Shopify",
    },
    "social": {
        "title": "7 Days of Social Captions — Generated Instantly",
        "topic": "getting a full week of social media captions and hashtags for a small business using AI",
    },
    "pitch": {
        "title": "Turn Your Startup Idea Into a Pitch in Seconds",
        "topic": "turning a rough startup idea into a clear one-pager pitch (problem, solution, market) using AI",
    },
    "resume": {
        "title": "AI Resume Rewriter — ATS-Friendly Bullet Points",
        "topic": "rewriting a resume into professional, ATS-friendly bullet points instantly using AI",
    },
    "linkedin": {
        "title": "AI LinkedIn Profile Optimizer — Get Noticed",
        "topic": "getting a compelling LinkedIn headline and About section written by AI",
    },
    "speech": {
        "title": "AI Wedding & Event Speech Writer",
        "topic": "getting a heartfelt wedding or event speech written instantly by AI",
    },
    "script": {
        "title": "AI YouTube Script Writer",
        "topic": "getting a complete YouTube video script with hook, body, and outro written by AI",
    },
    "email": {
        "title": "AI Email Sequence Writer",
        "topic": "getting a 3-email welcome/sales sequence written instantly by AI for a business",
    },
    "bio": {
        "title": "AI Personal Bio Writer",
        "topic": "getting a short and long personal bio written by AI for social media or a website",
    },
}


def generate_caption(topic):
    """Groq se ek chhota, engaging Pinterest description banata hai (max ~2 sentences)."""
    prompt = (
        f"Write a short, engaging Pinterest pin description (max 2 sentences, no hashtags in text) "
        f"about {topic}. End with a soft call-to-action. Output ONLY the description."
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
    return resp.json()["choices"][0]["message"]["content"].strip()


def post_pin(service_key, meta):
    caption = generate_caption(meta["topic"])
    image_url = f"{SHOP_URL}/pin-image/{service_key}"
    link = f"{SHOP_URL}/shop#{service_key}"

    resp = requests.post(
        "https://api.postpeer.dev/v1/posts",
        headers={"x-access-key": POSTPEER_API_KEY, "Content-Type": "application/json"},
        json={
            "content": caption,
            "platforms": [
                {
                    "platform": "pinterest",
                    "accountId": POSTPEER_ACCOUNT_ID,
                    "platformSpecificData": {
                        "boardId": POSTPEER_BOARD_ID,
                        "title": meta["title"],
                        "link": link,
                    },
                }
            ],
            "mediaItems": [{"type": "image", "url": image_url}],
        },
        timeout=30,
    )
    if resp.status_code >= 400:
        print(f"[{service_key}] Pinterest post FAILED: {resp.status_code} {resp.text}")
        return False
    print(f"[{service_key}] Pin posted -> {link}")
    return True


def main():
    if not all([POSTPEER_API_KEY, POSTPEER_ACCOUNT_ID, POSTPEER_BOARD_ID, SHOP_URL, GROQ_API_KEY]):
        print("Missing required env vars — check GitHub secrets (POSTPEER_*, SHOP_URL, GROQ_API_KEY).")
        sys.exit(1)

    results = {}
    for key, meta in SERVICES.items():
        try:
            results[key] = post_pin(key, meta)
        except requests.RequestException as e:
            print(f"[{key}] Error: {e}")
            results[key] = False

    ok = sum(1 for v in results.values() if v)
    print(f"Done. {ok}/{len(SERVICES)} pins posted successfully.")


if __name__ == "__main__":
    main()

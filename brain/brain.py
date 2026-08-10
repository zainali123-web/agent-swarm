"""
brain.py
Yeh script GitHub Actions cron se har X minute mein khud chalti hai (koi PC/VPS on hone
ki zaroorat nahi). Kaam:
  1. Cloudflare Worker se har agent ki latest lifetime earning fetch karo
  2. Jis agent ne apne pichle spawn-check se $10+ kama liye, uske liye naya agent spawn karo
     (agar total agents < 60)
  3. Har naye/unregistered agent ko 402 Index per khud register karo — taake koi bhi agent
     kabhi manually register na karna paray, spawn hote hi discoverable ban jaye
  4. State (agents.json) ko atomic tareeqe se save karo, taake beech mein crash se koi
     nuksan na ho

ENV VARS chahiye (GitHub Actions secrets se aate hain):
  WORKER_URL        e.g. https://agent-swarm-worker.<your-subdomain>.workers.dev
  INTERNAL_SECRET    wahi secret jo Worker mein wrangler secret put INTERNAL_SECRET se set kiya
"""

import os
import sys
import requests

from ledger import (
    load_ledger,
    save_ledger,
    total_wallet_balance,
    SERVICE_ORDER,
    MAX_AGENTS,
    SPAWN_THRESHOLD,
)

WORKER_URL = os.environ.get("WORKER_URL", "").rstrip("/")
INTERNAL_SECRET = os.environ.get("INTERNAL_SECRET", "")

# Worker (services.js) ke labels se match karta hai — register hote waqt human-readable
# naam ke liye
SERVICE_LABELS = {
    "jobpack": "AI Job Application Pack (cover letter + interview prep)",
    "listing": "AI E-commerce Listing Writer",
    "social": "AI Social Media Content Pack (7-day captions)",
    "pitch": "AI Business One-Pager Generator",
    "resume": "AI Resume Rewriter",
    "linkedin": "AI LinkedIn Profile Optimizer",
    "speech": "AI Wedding/Event Speech Writer",
    "script": "AI YouTube Script Writer",
    "email": "AI Email Sequence Writer",
    "bio": "AI Personal Bio Writer",
}


def fetch_live_earnings():
    """Worker ke /internal/ledger se sab agents ki lifetime earning uthao."""
    if not WORKER_URL or not INTERNAL_SECRET:
        print("WORKER_URL ya INTERNAL_SECRET set nahi hai — .github secrets check karein.")
        sys.exit(1)
    resp = requests.get(
        f"{WORKER_URL}/internal/ledger",
        headers={"x-internal-secret": INTERNAL_SECRET},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()  # { "1": 0.045, "2": 0.01, ... }


def kill_agent(agent_id):
    requests.post(
        f"{WORKER_URL}/internal/kill/{agent_id}",
        headers={"x-internal-secret": INTERNAL_SECRET},
        timeout=15,
    )


def register_on_402index(agent):
    """Naye agent ki service ko https://402index.io per list karta hai, taake AI
    agents/buyers isay khud dhoond sakein — koi manual/repeat registration kabhi nahi
    karni parti. Fail hone per bhi cycle nahi rukti (best-effort, agla cycle retry karega
    kyunke 'registered' flag False hi rahega)."""
    if not WORKER_URL:
        return False
    service = agent["service"]
    url = f"{WORKER_URL}/agent/{agent['id']}/{service}"
    name = SERVICE_LABELS.get(service, service)
    try:
        resp = requests.post(
            "https://402index.io/api/v1/register",
            json={"url": url, "name": name, "protocol": "x402", "provider": "Agent Swarm"},
            timeout=15,
        )
        return resp.status_code < 400
    except requests.RequestException as e:
        print(f"Registration failed for agent {agent['id']} (retry next cycle): {e}")
        return False


def next_service(state):
    idx = state["next_service_index"] % len(SERVICE_ORDER)
    state["next_service_index"] += 1
    return SERVICE_ORDER[idx]


def run_cycle():
    state = load_ledger()
    live_earnings = fetch_live_earnings()

    spawned_this_cycle = []
    registered_this_cycle = []

    # Step 1: har agent ki earning update karo, spawn-eligibility check karo
    for agent in list(state["agents"]):
        if not agent["alive"]:
            continue

        agent["lifetime_earnings"] = live_earnings.get(agent["id"], agent["lifetime_earnings"])
        profit_since_check = agent["lifetime_earnings"] - agent["earnings_at_last_spawn_check"]

        alive_count = sum(1 for a in state["agents"] if a["alive"])
        if profit_since_check >= SPAWN_THRESHOLD and alive_count < MAX_AGENTS:
            new_id = str(max(int(a["id"]) for a in state["agents"]) + 1)
            new_agent = {
                "id": new_id,
                "service": next_service(state),
                "lifetime_earnings": 0.0,
                "earnings_at_last_spawn_check": 0.0,
                "alive": True,
                "registered": False,
            }
            state["agents"].append(new_agent)
            agent["earnings_at_last_spawn_check"] = agent["lifetime_earnings"]
            spawned_this_cycle.append(new_id)

    # Step 2: koi bhi agent jo abhi tak 402 Index per register nahi hua (naya spawn ho ya
    # purana), usay register karo — is se manual registration ki zaroorat hamesha ke liye
    # khatam ho jati hai
    for agent in state["agents"]:
        if agent["alive"] and not agent.get("registered", False):
            if register_on_402index(agent):
                agent["registered"] = True
                registered_this_cycle.append(agent["id"])

    save_ledger(state)

    balance = total_wallet_balance(state)
    alive_count = sum(1 for a in state["agents"] if a["alive"])
    print(f"Cycle complete. Wallet balance (approx): ${balance:.4f}")
    print(f"Alive agents: {alive_count}/{MAX_AGENTS}")
    if spawned_this_cycle:
        print(f"Naye agents spawn hue: {spawned_this_cycle}")
    if registered_this_cycle:
        print(f"402 Index per register hue: {registered_this_cycle}")


if __name__ == "__main__":
    run_cycle()

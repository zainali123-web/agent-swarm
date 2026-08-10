"""
ledger.py
Agent swarm ka state (kaun se agents zinda hain, kis ka kya service hai, kitni earning hui)
ek JSON file (agents.json) mein rakha jata hai. Write hamesha ATOMIC hoti hai:
pehle temp file mein likha jata hai, phir rename kiya jata hai — isliye agar beech mein
process/PC band ho jaye, file kabhi bhi corrupt/adhoori nahi hogi (ya to purani state
poori milegi, ya nayi state poori milegi, kabhi aadhi nahi).
"""

import json
import os
import tempfile

LEDGER_PATH = os.path.join(os.path.dirname(__file__), "agents.json")

# Worker (services.js) mein jo order hai, yahan bilkul wahi order hona chahiye
SERVICE_ORDER = ["jobpack", "listing", "social", "pitch", "resume", "linkedin", "speech", "script", "email", "bio"]

MAX_AGENTS = 60
STARTING_AGENTS = 10
INITIAL_BALANCE = 5.0
SPAWN_THRESHOLD = 10.0  # itna profit hone per naya agent spawn hoga


def _seed_state():
    """Shuru mein 5 agents ek saath live hote hain, alag-alag services ke saath (round-robin).
    Sab ek hi wallet (SERVER_WALLET_ADDRESS) se connect hain — yeh Worker mein set hoti hai,
    yahan per-agent koi alag wallet nahi, sirf earnings tracking alag hai."""
    agents = []
    for i in range(STARTING_AGENTS):
        agents.append(
            {
                "id": str(i + 1),
                "service": SERVICE_ORDER[i % len(SERVICE_ORDER)],
                "lifetime_earnings": 0.0,
                "earnings_at_last_spawn_check": 0.0,
                "alive": True,
                "registered": False,
            }
        )
    return {"agents": agents, "next_service_index": STARTING_AGENTS}


def load_ledger():
    if not os.path.exists(LEDGER_PATH):
        return _seed_state()
    with open(LEDGER_PATH, "r") as f:
        return json.load(f)


def save_ledger(state):
    """Atomic write: temp file + rename, taake crash ke waqt file corrupt na ho."""
    dir_name = os.path.dirname(LEDGER_PATH) or "."
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, prefix=".agents_", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(state, f, indent=2)
        os.replace(tmp_path, LEDGER_PATH)  # atomic on POSIX and Windows
    except Exception:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise


def total_wallet_balance(state):
    """INITIAL_BALANCE sirf agent #1 ke liye; baaqi sab apni earning se hi spawn hote hain."""
    return INITIAL_BALANCE + sum(a["lifetime_earnings"] for a in state["agents"])

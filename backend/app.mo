import hashlib
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

app = FastAPI(title="CivicOS v2.0: The Purist Protocol")

# --- UPDATED DATA MODELS ---

class Bounty(BaseModel):
    id: int
    description: str
    base_reward: float
    urgency_coeff: float = 0.05 # How fast the reward increases
    created_at: float
    status: str = "open" # open, claimed, verified
    claimed_by: Optional[str] = None

class ZKProof(BaseModel):
    # A simplified proof: hash(username + secret_salt)
    proof_hash: str 
    action_type: str

# --- EXTENDED DATABASE ---

db = {
    "users": {
        "elara": {"merit": 50, "salt": "secret_123"},
        "devon": {"merit": 20, "salt": "secret_456"}
    },
    "bounties": [],
    "private_ledger": [], # Visible only to the owner
    "public_audit_log": []  # Visible to all, but users are anonymized by hashes
}

# --- DYNAMIC BOUNTY LOGIC ---

@app.post("/bounties/create")
def create_bounty(description: str, base_reward: float, urgency: float = 0.05):
    bounty_id = len(db["bounties"]) + 1
    new_bounty = Bounty(
        id=bounty_id,
        description=description,
        base_reward=base_reward,
        urgency_coeff=urgency,
        created_at=time.time()
    )
    db["bounties"].append(new_bounty)
    return {"message": "Bounty posted to the grid", "bounty_id": bounty_id}

@app.get("/bounties/{bounty_id}/current_value")
def get_bounty_value(bounty_id: int):
    bounty = next((b for b in db["bounties"] if b.id == bounty_id), None)
    if not bounty:
        raise HTTPException(status_code=404, detail="Bounty not found")
    
    # Calculate dynamic reward based on time elapsed
    elapsed = time.time() - bounty.created_at
    current_reward = bounty.base_reward * (1 + (bounty.urgency_coeff * (elapsed / 60))) # Growth per minute
    return {"id": bounty_id, "current_reward": round(current_reward, 2)}

# --- ZK-AUDIT LOGIC ---

def generate_zk_proof(username: str, action: str):
    """Simulates a citizen generating a proof on their local device."""
    user_salt = db["users"][username]["salt"]
    raw_proof = f"{username}{user_salt}{action}"
    return hashlib.sha256(raw_proof.encode()).hexdigest()

@app.post("/audit/private_action")
def perform_private_action(proof: ZKProof):
    """
    Validates an action (like voting or spending) without 
    revealing the user's identity on the public log.
    """
    # In a real ZK system, the server validates the proof math.
    # Here, we log the action under the proof hash.
    db["public_audit_log"].append({
        "timestamp": time.time(),
        "proof_signature": proof.proof_hash,
        "action": proof.action_type,
        "verified": True
    })
    return {"message": "Action verified and anonymized on public ledger"}

@app.get("/audit/public_log")
def view_public_log():
    """Transparency: Anyone can see WHAT happened, but not WHO did it."""
    return db["public_audit_log"]
    import random

class Case(BaseModel):
    id: int
    category: str  # e.g., "Energy", "Contract", "Conduct"
    plaintiff: str
    defendant: str
    evidence_hash: str
    jurors: List[str] = []
    votes: Dict[str, str] = {} # juror_id: verdict
    status: str = "open" # open, deliberating, resolved

# --- EXTENDED JUDICIAL LOGIC ---

@app.post("/justice/file_case")
def file_case(plaintiff: str, defendant: str, category: str, evidence: str):
    case_id = len(db.get("cases", [])) + 1
    
    # 1. Merit-Weighted Juror Selection
    # We select 3 jurors who have high merit in the relevant category
    potential_jurors = [u for u, data in db["users"].items() if u != plaintiff and u != defendant]
    
    # Simple Merit-Weighted Sortition: 
    # Probability of being picked = user_merit / total_merit
    weights = [db["users"][u].get("merit_score", 1) for u in potential_jurors]
    selected_jurors = random.choices(potential_jurors, weights=weights, k=3)
    
    new_case = Case(
        id=case_id,
        category=category,
        plaintiff=plaintiff,
        defendant=defendant,
        evidence_hash=hashlib.sha256(evidence.encode()).hexdigest(),
        jurors=selected_jurors
    )
    
    if "cases" not in db: db["cases"] = []
    db["cases"].append(new_case)
    return {"case_id": case_id, "jury": selected_jurors}

@app.post("/justice/cast_verdict")
def cast_verdict(case_id: int, juror_name: str, verdict: str):
    case = next((c for c in db["cases"] if c.id == case_id), None)
    if not case or juror_name not in case.jurors:
        raise HTTPException(status_code=403, detail="Unauthorized juror")
    
    case.votes[juror_name] = verdict
    
    # 2. Automated Resolution (Schelling Point Consensus)
    if len(case.votes) == len(case.jurors):
        # Count votes
        results = {}
        for v in case.votes.values():
            results[v] = results.get(v, 0) + 1
        
        winner = max(results, key=results.get)
        case.status = "resolved"
        
        # 3. Reward 'Honest' Jurors
        # Jurors who voted with the majority (the Schelling Point) earn Merit
        for juror, v in case.votes.items():
            if v == winner:
                db["users"][juror]["merit_score"] += 5
            else:
                db["users"][juror]["merit_score"] -= 2 # Penalize 'lazy' or dishonest voting
                
        return {"verdict": winner, "message": "Case merged into the Social Ledger"}

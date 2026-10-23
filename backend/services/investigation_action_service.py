"""
Investigation Workflow Service.

Implements the formal investigation lifecycle:
NEW -> UNDER_REVIEW -> ESCALATED -> CONFIRMED_FRAUD / FALSE_POSITIVE -> RESOLVED

Supports:
- Lifecycle validation & transitions
- Previous status preservation & audit tracking
- Investigator decisions and analyst notes
- Investigation history retrieval
- Full backwards-compatibility for existing actions ("Safe", "Escalated", "Blocked")
"""

from datetime import datetime
from services.database import get_connection

CANONICAL_STATUSES = [
    "NEW",
    "UNDER_REVIEW",
    "ESCALATED",
    "CONFIRMED_FRAUD",
    "FALSE_POSITIVE",
    "RESOLVED"
]

STATUS_ALIASES = {
    "NEW": "NEW",
    "OPEN": "NEW",
    "UNDER_REVIEW": "UNDER_REVIEW",
    "UNDER REVIEW": "UNDER_REVIEW",
    "INVESTIGATING": "UNDER_REVIEW",
    "REVIEW": "UNDER_REVIEW",
    "ESCALATED": "ESCALATED",
    "ESCALATE": "ESCALATED",
    "CONFIRMED_FRAUD": "CONFIRMED_FRAUD",
    "CONFIRMED FRAUD": "CONFIRMED_FRAUD",
    "FRAUD": "CONFIRMED_FRAUD",
    "BLOCKED": "CONFIRMED_FRAUD",
    "BLOCK": "CONFIRMED_FRAUD",
    "FALSE_POSITIVE": "FALSE_POSITIVE",
    "FALSE POSITIVE": "FALSE_POSITIVE",
    "SAFE": "FALSE_POSITIVE",
    "NORMAL": "FALSE_POSITIVE",
    "RESOLVED": "RESOLVED",
    "RESOLVE": "RESOLVED",
    "CLOSED": "RESOLVED"
}

ALLOWED_TRANSITIONS = {
    "NEW": ["UNDER_REVIEW", "ESCALATED", "CONFIRMED_FRAUD", "FALSE_POSITIVE"],
    "UNDER_REVIEW": ["ESCALATED", "CONFIRMED_FRAUD", "FALSE_POSITIVE", "RESOLVED"],
    "ESCALATED": ["UNDER_REVIEW", "CONFIRMED_FRAUD", "FALSE_POSITIVE", "RESOLVED"],
    "CONFIRMED_FRAUD": ["RESOLVED", "UNDER_REVIEW"],
    "FALSE_POSITIVE": ["RESOLVED", "UNDER_REVIEW"],
    "RESOLVED": ["UNDER_REVIEW", "ESCALATED"]
}


def normalize_status(raw_status: str) -> str:
    clean = str(raw_status or "").strip().upper()
    return STATUS_ALIASES.get(clean, clean)


def get_investigation_history(transaction_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    real_id = str(transaction_id).replace("TXN-", "").strip()

    # Verify transaction exists in transactions_clean
    cursor.execute("SELECT id FROM transactions_clean WHERE id = ?", (real_id,))
    txn_row = cursor.fetchone()
    if not txn_row:
        conn.close()
        return None

    canonical_txn = f"TXN-{real_id}"

    cursor.execute(
        """
        SELECT id, transaction_id, status, previous_status, notes,
               decision, investigator_id, updated_time
        FROM investigation_actions
        WHERE transaction_id = ? OR transaction_id = ?
        ORDER BY id DESC
        """,
        (canonical_txn, real_id)
    )
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        st = normalize_status(r[2])
        prev = normalize_status(r[3]) if r[3] else None
        history.append({
            "id": r[0],
            "transaction_id": canonical_txn,
            "status": st,
            "previous_status": prev,
            "notes": r[4] or "",
            "decision": r[5] or "",
            "investigator": r[6] or "admin",
            "timestamp": r[7]
        })

    current_status = history[0]["status"] if history else "NEW"
    allowed = ALLOWED_TRANSITIONS.get(current_status, ALLOWED_TRANSITIONS["NEW"])

    return {
        "transaction_id": canonical_txn,
        "current_status": current_status,
        "allowed_transitions": allowed,
        "history": history,
        "available_statuses": CANONICAL_STATUSES
    }


def update_investigation_status(
    transaction_id: str,
    status: str = None,
    notes: str = None,
    decision: str = None,
    investigator_id: str = "admin"
):
    conn = get_connection()
    cursor = conn.cursor()

    real_id = str(transaction_id).replace("TXN-", "").strip()
    canonical_txn = f"TXN-{real_id}"

    # Verify transaction existence
    cursor.execute("SELECT id FROM transactions_clean WHERE id = ?", (real_id,))
    if not cursor.fetchone():
        conn.close()
        return {
            "success": False,
            "error": "Transaction not found",
            "transaction_id": canonical_txn
        }

    # Fetch latest status
    cursor.execute(
        """
        SELECT status
        FROM investigation_actions
        WHERE transaction_id = ? OR transaction_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (canonical_txn, real_id)
    )
    last_row = cursor.fetchone()
    previous_status = normalize_status(last_row[0]) if last_row else "NEW"

    target_status = normalize_status(status) if status else previous_status
    if target_status not in CANONICAL_STATUSES:
        conn.close()
        return {
            "success": False,
            "error": f"Invalid status '{status}'. Must be one of {CANONICAL_STATUSES}",
            "transaction_id": canonical_txn
        }

    # Default decision if blocked or safe
    final_decision = decision
    if not final_decision:
        if target_status == "CONFIRMED_FRAUD":
            final_decision = "Transaction confirmed as fraudulent and blocked"
        elif target_status == "FALSE_POSITIVE":
            final_decision = "Transaction reviewed and verified as legitimate"
        elif target_status == "ESCALATED":
            final_decision = "Case escalated for senior analyst review"

    timestamp = datetime.now().isoformat()
    clean_notes = (notes or "").strip()[:2000]
    clean_investigator = (investigator_id or "admin").strip()[:50]

    cursor.execute(
        """
        INSERT INTO investigation_actions
        (transaction_id, status, previous_status, notes, decision, investigator_id, updated_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            canonical_txn,
            target_status,
            previous_status,
            clean_notes,
            final_decision,
            clean_investigator,
            timestamp
        )
    )

    # Also update transactions.alert_status if applicable
    alert_map = {
        "CONFIRMED_FRAUD": "Blocked",
        "FALSE_POSITIVE": "Resolved",
        "UNDER_REVIEW": "Investigating",
        "ESCALATED": "Escalated",
        "RESOLVED": "Resolved"
    }
    if target_status in alert_map:
        cursor.execute(
            """
            UPDATE transactions
            SET alert_status = ?
            WHERE id = ?
            """,
            (alert_map[target_status], real_id)
        )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Investigation updated to {target_status}",
        "transaction_id": canonical_txn,
        "status": status if status else target_status,
        "lifecycle_status": target_status,
        "previous_status": previous_status,
        "decision": final_decision,
        "notes": clean_notes,
        "investigator": clean_investigator,
        "updated_time": timestamp,
        "allowed_transitions": ALLOWED_TRANSITIONS.get(target_status, [])
    }
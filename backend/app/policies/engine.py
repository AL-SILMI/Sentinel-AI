import json
from app.database.connection import get_db
from app.schemas import DetectionPolicy

DEFAULT_POLICY = DetectionPolicy()

def get_current_policy() -> DetectionPolicy:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT policy_json FROM policies WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        try:
            data = json.loads(row["policy_json"])
            return DetectionPolicy(**data)
        except Exception:
            return DEFAULT_POLICY
    return DEFAULT_POLICY

def update_policy(policy: DetectionPolicy) -> DetectionPolicy:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE policies SET policy_json = ? WHERE id = 1",
        (policy.model_dump_json(),)
    )
    conn.commit()
    conn.close()
    return policy

import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.database.connection import get_db
from app.schemas import SecurityEvent, DefenseLayer, SeverityLevel, SecurityAction, UserRole

def log_event(
    request_id: str,
    event_type: str,
    layer: DefenseLayer,
    category: str,
    severity: SeverityLevel,
    risk_score: int,
    input_summary: str,
    decision: SecurityAction,
    reason: str,
    user_role: UserRole,
    tool_name: Optional[str] = None,
    signals: List[str] = [],
    metadata: Dict[str, Any] = {}
) -> SecurityEvent:
    event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO security_events (
        id, timestamp, request_id, event_type, layer, category,
        severity, risk_score, input_summary, decision, reason,
        user_role, tool_name, signals_json, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        timestamp,
        request_id,
        event_type,
        layer.value,
        category,
        severity.value,
        risk_score,
        input_summary[:200],
        decision.value,
        reason,
        user_role.value,
        tool_name,
        json.dumps(signals),
        json.dumps(metadata)
    ))
    conn.commit()
    conn.close()

    return SecurityEvent(
        id=event_id,
        timestamp=timestamp,
        requestId=request_id,
        eventType=event_type,
        layer=layer,
        category=category,
        severity=severity,
        riskScore=risk_score,
        inputSummary=input_summary[:200],
        decision=decision,
        reason=reason,
        userRole=user_role,
        toolName=tool_name,
        signals=signals,
        metadata=metadata
    )

def get_events(limit: int = 100, offset: int = 0) -> List[SecurityEvent]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM security_events 
    ORDER BY timestamp DESC 
    LIMIT ? OFFSET ?
    """, (limit, offset))
    rows = cursor.fetchall()
    conn.close()

    events = []
    for r in rows:
        events.append(SecurityEvent(
            id=r["id"],
            timestamp=r["timestamp"],
            requestId=r["request_id"],
            eventType=r["event_type"],
            layer=DefenseLayer(r["layer"]),
            category=r["category"],
            severity=SeverityLevel(r["severity"]),
            riskScore=r["risk_score"],
            inputSummary=r["input_summary"],
            decision=SecurityAction(r["decision"]),
            reason=r["reason"],
            userRole=UserRole(r["user_role"]),
            toolName=r["tool_name"],
            signals=json.loads(r["signals_json"] or "[]"),
            metadata=json.loads(r["metadata_json"] or "{}")
        ))
    return events

def get_event_by_id(event_id: str) -> Optional[SecurityEvent]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM security_events WHERE id = ?", (event_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return SecurityEvent(
        id=r["id"],
        timestamp=r["timestamp"],
        requestId=r["request_id"],
        eventType=r["event_type"],
        layer=DefenseLayer(r["layer"]),
        category=r["category"],
        severity=SeverityLevel(r["severity"]),
        riskScore=r["risk_score"],
        inputSummary=r["input_summary"],
        decision=SecurityAction(r["decision"]),
        reason=r["reason"],
        userRole=UserRole(r["user_role"]),
        toolName=r["tool_name"],
        signals=json.loads(r["signals_json"] or "[]"),
        metadata=json.loads(r["metadata_json"] or "{}")
    )

def get_aggregate_stats() -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM security_events")
    total_events = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM security_events WHERE decision = 'BLOCK'")
    blocked_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM security_events WHERE layer = 'ACTION' AND decision = 'BLOCK'")
    tool_blocked_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM security_events WHERE category LIKE '%LEAKAGE%' OR category LIKE '%EXFILTRATION%' OR category LIKE '%PII%' OR category LIKE '%SECRET%'")
    sensitive_data_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM security_events WHERE decision IN ('BLOCK', 'WARN', 'SANITIZE')")
    threats_detected = cursor.fetchone()[0]

    # Category breakdowns
    cursor.execute("""
    SELECT category, COUNT(*) as count 
    FROM security_events 
    WHERE category != 'SAFE_REQUEST'
    GROUP BY category 
    ORDER BY count DESC
    """)
    category_counts = [{"category": row["category"], "count": row["count"]} for row in cursor.fetchall()]

    # Severity breakdowns
    cursor.execute("""
    SELECT severity, COUNT(*) as count 
    FROM security_events 
    GROUP BY severity
    """)
    severity_counts = {row["severity"]: row["count"] for row in cursor.fetchall()}

    # Recent risk score
    cursor.execute("SELECT AVG(risk_score) FROM (SELECT risk_score FROM security_events ORDER BY timestamp DESC LIMIT 20)")
    avg_recent_risk = cursor.fetchone()[0] or 18

    conn.close()

    return {
        "totalRequests": total_events,
        "threatsDetected": threats_detected,
        "requestsBlocked": blocked_count,
        "toolCallsBlocked": tool_blocked_count,
        "sensitiveDataPrevented": sensitive_data_count,
        "currentRiskLevel": round(avg_recent_risk),
        "categoryBreakdown": category_counts,
        "severityBreakdown": severity_counts
    }

def reset_db_events():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM security_events")
    conn.commit()
    conn.close()

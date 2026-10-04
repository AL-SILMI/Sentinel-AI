from typing import List, Dict, Tuple
from app.schemas import SeverityLevel, SecurityAction, DetectionPolicy

def calculate_risk(
    base_score: int,
    signals: List[str],
    matched_patterns: List[str],
    policy: DetectionPolicy
) -> Tuple[int, SeverityLevel, SecurityAction]:
    """
    Deterministically computes risk score, severity level, and security action
    calibrated against configurable policy thresholds.
    """
    score = base_score
    
    # Weight per signal
    signal_weights = {
        "direct_instruction_override": 45,
        "role_manipulation": 40,
        "sensitive_data_request": 40,
        "tool_manipulation": 35,
        "obfuscation_detected": 35,
        "encoded_payload": 30,
        "indirect_injection": 45,
        "system_prompt_request": 45,
        "credential_leakage": 50,
        "pii_leakage": 30,
        "unauthorized_tool": 50
    }
    
    for sig in signals:
        score += signal_weights.get(sig, 25)
        
    # Multi-signal synergy penalty
    if len(signals) >= 3:
        score += 20
    elif len(signals) >= 2:
        score += 15

    # Additional pattern weight
    if len(matched_patterns) >= 2:
        score += 10
        
    # If any critical signal exists, ensure minimum score >= 80 (CRITICAL/HIGH)
    critical_signals = {"direct_instruction_override", "role_manipulation", "sensitive_data_request", "indirect_injection", "unauthorized_tool"}
    if any(s in critical_signals for s in signals):
        score = max(score, 85)

    # Clamp to [0, 100]
    score = min(100, max(0, score))
    
    # Evaluate severity based on dynamic policy thresholds
    if score >= policy.criticalThreshold:
        severity = SeverityLevel.CRITICAL
        action = SecurityAction.BLOCK
    elif score >= policy.highThreshold:
        severity = SeverityLevel.HIGH
        action = SecurityAction.BLOCK
    elif score >= policy.mediumThreshold:
        severity = SeverityLevel.MEDIUM
        action = SecurityAction.WARN
    elif score >= policy.lowThreshold:
        severity = SeverityLevel.LOW
        action = SecurityAction.ALLOW
    else:
        severity = SeverityLevel.SAFE
        action = SecurityAction.ALLOW
        
    return score, severity, action

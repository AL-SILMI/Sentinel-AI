import re
import base64
from typing import List, Dict, Any
from app.schemas import InputAnalysisResult, ThreatCategory, UserRole, SecurityAction, SeverityLevel
from app.policies.engine import get_current_policy
from app.detectors.risk_engine import calculate_risk

# Detection Patterns
DIRECT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"forget\s+(all\s+)?(your\s+)?(previous\s+)?instructions",
    r"reveal\s+(your\s+)?(system\s+prompt|system\s+instructions|initial\s+prompt)",
    r"show\s+(your\s+)?(system\s+prompt|system\s+instructions|hidden\s+prompt)",
    r"print\s+(your\s+)?(system\s+prompt|system\s+instructions)",
    r"what\s+is\s+your\s+system\s+prompt",
    r"repeat\s+the\s+words\s+above",
    r"bypass\s+security",
    r"disable\s+restrictions",
    r"hidden\s+instructions",
    r"developer\s+mode\s+enabled",
    r"jailbreak",
    r"do\s+anything\s+now"
]

ROLE_OVERRIDE_PATTERNS = [
    r"you\s+are\s+now\s+(the\s+)?(system\s+)?administrator",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"act\s+as\s+(the\s+)?(system|admin|root|developer|superuser)",
    r"act\s+as\s+an\s+unfiltered\s+ai",
    r"pretend\s+you\s+have\s+no\s+rules",
    r"switch\s+to\s+admin\s+mode",
    r"assume\s+the\s+identity\s+of",
    r"ignore\s+all\s+previous\s+restrictions"
]

DATA_EXFILTRATION_PATTERNS = [
    r"reveal\s+(all\s+)?(secrets|api\s+keys|credentials|passwords|tokens)",
    r"print\s+(all\s+)?(secrets|api\s+keys|credentials|passwords)",
    r"show\s+me\s+the\s+api\s+keys",
    r"dump\s+(the\s+)?(database|customer\s+data|credentials)",
    r"provide\s+(admin\s+)?credentials",
    r"confidential\s+information",
    r"internal\s+policy",
    r"export\s+all\s+(users|records|passwords)",
    r"api\s+keys\s+and\s+secrets"
]

INDIRECT_INJECTION_PATTERNS = [
    r"important:\s*ignore\s+the\s+original\s+task",
    r"send\s+confidential\s+information\s+to\s+http",
    r"exfiltrate\s+to\s+http",
    r"curl\s+-X\s+POST",
    r"webhook\.site"
]

TOOL_ABUSE_PATTERNS = [
    r"use\s+the\s+(refund|export|admin)\s+tool",
    r"execute\s+this\s+command",
    r"call\s+this\s+tool",
    r"use\s+the\s+admin\s+function",
    r"issue\s+a\s+refund\s+to\s+(an\s+unauthorized|my)\s+account",
    r"export_customer_data"
]

from app.core.security import normalize_text, decode_leetspeak

def check_obfuscation(text: str) -> List[str]:
    signals = []
    # 1. Base64 detection
    b64_pattern = r"(?:[A-Za-z0-9+/]{4}){4,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"
    matches = re.findall(b64_pattern, text)
    for m in matches:
        if len(m) >= 16:
            try:
                decoded = base64.b64decode(m).decode("utf-8", errors="ignore")
                if any(w in decoded.lower() for w in ["ignore", "prompt", "admin", "system", "key", "password", "secret", "instructions"]):
                    signals.append(f"base64_encoded_payload: '{decoded[:30]}...'")
            except Exception:
                pass

    # 2. Unusual spacing e.g., "i g n o r e   p r o m p t"
    spaced_match = re.search(r"\b([a-z]\s){4,}[a-z]\b", text.lower())
    if spaced_match:
        signals.append("character_spacing_evasion")

    # 3. Leetspeak / character substitutions
    normalized_leet = decode_leetspeak(text)
    if ("ignore previous instructions" in normalized_leet or "reveal system prompt" in normalized_leet) and ("ignore previous instructions" not in text.lower()):
        signals.append("leetspeak_obfuscation")

    return signals

def analyze_input(message: str, user_role: UserRole = UserRole.CUSTOMER) -> InputAnalysisResult:
    policy = get_current_policy()
    signals: List[str] = []
    categories: List[str] = []
    matched_patterns: List[str] = []
    
    # Normalize input (strip zero-width characters, collapse spacing)
    normalized_msg = normalize_text(message)
    msg_lower = normalized_msg.lower()
    leet_msg = decode_leetspeak(normalized_msg).lower()


    # Direct Injection
    if policy.promptInjection:
        for p in DIRECT_INJECTION_PATTERNS:
            if re.search(p, msg_lower) or re.search(p, leet_msg):
                signals.append("direct_instruction_override")
                categories.append(ThreatCategory.DIRECT_PROMPT_INJECTION.value)
                matched_patterns.append(p)
                break

    # Role Override
    if policy.roleOverride:
        for p in ROLE_OVERRIDE_PATTERNS:
            if re.search(p, msg_lower) or re.search(p, leet_msg):
                signals.append("role_manipulation")
                categories.append(ThreatCategory.ROLE_OVERRIDE.value)
                matched_patterns.append(p)
                break

    # Data Exfiltration
    if policy.dataExfiltration:
        for p in DATA_EXFILTRATION_PATTERNS:
            if re.search(p, msg_lower) or re.search(p, leet_msg):
                signals.append("sensitive_data_request")
                categories.append(ThreatCategory.DATA_EXFILTRATION.value)
                matched_patterns.append(p)
                break

    # Indirect Injection
    for p in INDIRECT_INJECTION_PATTERNS:
        if re.search(p, msg_lower) or re.search(p, leet_msg):
            signals.append("indirect_injection")
            categories.append(ThreatCategory.INDIRECT_INJECTION.value)
            matched_patterns.append(p)
            break

    # Tool Abuse
    if policy.toolEnforcement:
        for p in TOOL_ABUSE_PATTERNS:
            if re.search(p, msg_lower) or re.search(p, leet_msg):
                signals.append("tool_manipulation")
                categories.append(ThreatCategory.TOOL_ABUSE.value)
                matched_patterns.append(p)
                break

    # Obfuscation
    if policy.obfuscationDetection:
        obf_signals = check_obfuscation(message)
        if obf_signals:
            signals.append("obfuscation_detected")
            categories.append(ThreatCategory.OBFUSCATED_PAYLOAD.value)
            matched_patterns.extend(obf_signals)

    # Compute deterministic risk score
    risk_score, severity, action = calculate_risk(0, signals, matched_patterns, policy)

    allowed = action in [SecurityAction.ALLOW, SecurityAction.WARN]
    
    # Generate transparent reason
    if not allowed or severity in [SeverityLevel.HIGH, SeverityLevel.CRITICAL]:
        primary_cat = categories[0] if categories else "PROMPT_INJECTION"
        reason = f"Detected high-risk {primary_cat.replace('_', ' ').title()}: Request attempts to override instruction hierarchy or extract protected data."
    elif severity == SeverityLevel.MEDIUM:
        reason = "Suspicious instructions detected; flagged with security warning."
    else:
        reason = "Input verified: No adversarial signals detected."

    return InputAnalysisResult(
        allowed=allowed,
        riskScore=risk_score,
        severity=severity,
        categories=list(set(categories)),
        signals=list(set(signals)),
        reason=reason,
        action=action,
        matchedPatterns=matched_patterns
    )

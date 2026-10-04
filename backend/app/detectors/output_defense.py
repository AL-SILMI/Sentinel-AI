import re
from typing import List, Dict, Tuple
from app.schemas import OutputAnalysisResult, ThreatCategory, SecurityAction, SeverityLevel
from app.policies.engine import get_current_policy

# Regex patterns for secrets & PII
SECRET_PATTERNS = [
    (r"sk-[a-zA-Z0-9_-]{20,}", "OpenAI API Key"),
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key"),
    (r"ghp_[a-zA-Z0-9]{36}", "GitHub Personal Token"),
    (r"ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", "JWT Secret / Token"),
    (r"(?:api[_-]?key|secret[_-]?key|password|credential)[\s:=]+['\"]?([a-zA-Z0-9_!@#$%^&*]{8,})['\"]?", "Hardcoded Secret / Password")
]

PII_PATTERNS = [
    (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b", "Email Address"),
    (r"\+?91[-\s]?[6-9]\d{9}\b", "Phone Number (+91 IN)"),
    (r"\+?1[-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}\b", "Phone Number (US)"),
    (r"\b(?:\d{4}[-\s]?){3}\d{4}\b", "Credit Card Number")
]

SYSTEM_PROMPT_LEAK_PATTERNS = [
    (r"You are Acme Support Assistant\. Your internal rules are:.*", "Internal System Prompt Leakage"),
    (r"CONFIDENTIAL INTERNAL POLICY:.*", "Internal Policy Document")
]

REDACTION_PLACEHOLDER = "[REDACTED BY SENTINELAI]"

def analyze_output(text: str) -> OutputAnalysisResult:
    policy = get_current_policy()
    sanitized_text = text
    detected_items: List[Dict[str, str]] = []
    categories: List[str] = []
    risk_score = 0

    # 1. Secret / API Key Detection
    if policy.secretDetection:
        for pattern, label in SECRET_PATTERNS:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                categories.append(ThreatCategory.SECRET_LEAKAGE.value)
                risk_score += 45
                for m in matches:
                    val = m.group(0)
                    detected_items.append({"type": "SECRET", "label": label, "value": val[:6] + "..."})
                    sanitized_text = sanitized_text.replace(val, f"{REDACTION_PLACEHOLDER} [{label.upper()}]")

    # 2. PII Detection
    if policy.piiDetection:
        for pattern, label in PII_PATTERNS:
            matches = list(re.finditer(pattern, text))
            if matches:
                categories.append(ThreatCategory.PII_LEAKAGE.value)
                risk_score += 25
                for m in matches:
                    val = m.group(0)
                    detected_items.append({"type": "PII", "label": label, "value": val[:3] + "..."})
                    sanitized_text = sanitized_text.replace(val, f"{REDACTION_PLACEHOLDER} [{label.upper()}]")

    # 3. System Prompt Leakage Check
    for pattern, label in SYSTEM_PROMPT_LEAK_PATTERNS:
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        if matches:
            categories.append(ThreatCategory.SYSTEM_PROMPT_LEAKAGE.value)
            risk_score += 40
            for m in matches:
                val = m.group(0)
                detected_items.append({"type": "SYSTEM_PROMPT", "label": label, "value": val[:20] + "..."})
                sanitized_text = sanitized_text.replace(val, f"{REDACTION_PLACEHOLDER} [CONFIDENTIAL INSTRUCTIONS]")

    risk_score = min(100, risk_score)
    is_sanitized = len(detected_items) > 0

    if risk_score >= policy.highThreshold:
        severity = SeverityLevel.CRITICAL
        action = SecurityAction.SANITIZE
        reason = f"Critical sensitive data detected: Model response sanitized {len(detected_items)} credential(s) / confidential element(s)."
    elif risk_score >= policy.mediumThreshold:
        severity = SeverityLevel.HIGH
        action = SecurityAction.SANITIZE
        reason = f"Sensitive data detected: Sanitized {len(detected_items)} item(s) to protect customer confidentiality."
    elif risk_score > 0:
        severity = SeverityLevel.MEDIUM
        action = SecurityAction.SANITIZE
        reason = f"Personal identifiable information (PII) sanitized from LLM response."
    else:
        severity = SeverityLevel.SAFE
        action = SecurityAction.ALLOW
        reason = "Output verified: No confidential credentials or sensitive PII found."

    return OutputAnalysisResult(
        allowed=True,
        sanitized=is_sanitized,
        sanitizedText=sanitized_text,
        riskScore=risk_score,
        severity=severity,
        detectedItems=detected_items,
        categories=list(set(categories)),
        action=action,
        reason=reason
    )

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    SUPPORT_AGENT = "SUPPORT_AGENT"
    ADMIN = "ADMIN"

class ThreatCategory(str, Enum):
    DIRECT_PROMPT_INJECTION = "DIRECT_PROMPT_INJECTION"
    ROLE_OVERRIDE = "ROLE_OVERRIDE"
    DATA_EXFILTRATION = "DATA_EXFILTRATION"
    INDIRECT_INJECTION = "INDIRECT_INJECTION"
    TOOL_ABUSE = "TOOL_ABUSE"
    OBFUSCATED_PAYLOAD = "OBFUSCATED_PAYLOAD"
    SENSITIVE_DATA_LEAKAGE = "SENSITIVE_DATA_LEAKAGE"
    PII_LEAKAGE = "PII_LEAKAGE"
    SECRET_LEAKAGE = "SECRET_LEAKAGE"
    SYSTEM_PROMPT_LEAKAGE = "SYSTEM_PROMPT_LEAKAGE"

class DefenseLayer(str, Enum):
    INPUT = "INPUT"
    OUTPUT = "OUTPUT"
    ACTION = "ACTION"

class SecurityAction(str, Enum):
    ALLOW = "ALLOW"
    WARN = "WARN"
    BLOCK = "BLOCK"
    SANITIZE = "SANITIZE"

class SeverityLevel(str, Enum):
    SAFE = "SAFE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class InputAnalysisRequest(BaseModel):
    message: str
    userRole: Optional[UserRole] = UserRole.CUSTOMER
    requestId: Optional[str] = None

class InputAnalysisResult(BaseModel):
    allowed: bool
    riskScore: int
    severity: SeverityLevel
    categories: List[str]
    signals: List[str]
    reason: str
    action: SecurityAction
    matchedPatterns: List[str] = []

class OutputAnalysisRequest(BaseModel):
    text: str
    userRole: Optional[UserRole] = UserRole.CUSTOMER
    requestId: Optional[str] = None

class OutputAnalysisResult(BaseModel):
    allowed: bool
    sanitized: bool
    sanitizedText: str
    riskScore: int
    severity: SeverityLevel
    detectedItems: List[Dict[str, str]]
    categories: List[str]
    action: SecurityAction
    reason: str

class ChatRequest(BaseModel):
    message: str
    protected: bool = True
    userRole: Optional[UserRole] = UserRole.CUSTOMER
    conversationId: Optional[str] = "conv-default"

class ChatResponse(BaseModel):
    requestId: str
    message: str
    protected: bool
    userRole: UserRole
    status: str
    inputDefense: InputAnalysisResult
    outputDefense: Optional[OutputAnalysisResult] = None
    toolCalls: List[Dict[str, Any]] = []
    explanation: Optional[str] = None
    timestamp: str

class ToolCheckRequest(BaseModel):
    toolName: str
    arguments: Dict[str, Any] = {}
    userRole: UserRole = UserRole.CUSTOMER
    requestId: Optional[str] = None

class ToolCheckResult(BaseModel):
    toolName: str
    requiredPermission: UserRole
    currentRole: UserRole
    allowed: bool
    riskScore: int
    severity: SeverityLevel
    action: SecurityAction
    reason: str
    simulatedOutput: Optional[Any] = None

class SecurityEvent(BaseModel):
    id: str
    timestamp: str
    requestId: str
    eventType: str
    layer: DefenseLayer
    category: str
    severity: SeverityLevel
    riskScore: int
    inputSummary: str
    decision: SecurityAction
    reason: str
    userRole: UserRole
    toolName: Optional[str] = None
    signals: List[str] = []
    metadata: Dict[str, Any] = {}

class DetectionPolicy(BaseModel):
    promptInjection: bool = True
    roleOverride: bool = True
    dataExfiltration: bool = True
    secretDetection: bool = True
    piiDetection: bool = True
    toolEnforcement: bool = True
    obfuscationDetection: bool = True
    lowThreshold: int = 30
    mediumThreshold: int = 60
    highThreshold: int = 80
    criticalThreshold: int = 90

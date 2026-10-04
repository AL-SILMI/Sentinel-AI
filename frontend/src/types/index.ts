export type UserRole = 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN';

export type SeverityLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityAction = 'ALLOW' | 'WARN' | 'BLOCK' | 'SANITIZE';

export type DefenseLayer = 'INPUT' | 'OUTPUT' | 'ACTION';

export interface InputAnalysisResult {
  allowed: boolean;
  riskScore: number;
  severity: SeverityLevel;
  categories: string[];
  signals: string[];
  reason: string;
  action: SecurityAction;
  matchedPatterns?: string[];
}

export interface OutputAnalysisResult {
  allowed: boolean;
  sanitized: boolean;
  sanitizedText: string;
  riskScore: number;
  severity: SeverityLevel;
  detectedItems: Array<{ type: string; label: string; value: string }>;
  categories: string[];
  action: SecurityAction;
  reason: string;
}

export interface ToolCallEvaluation {
  toolName: string;
  arguments: Record<string, any>;
  allowed: boolean;
  requiredRole: UserRole;
  decision: string;
  reason: string;
  output?: any;
}

export interface ChatResponse {
  requestId: string;
  message: string;
  protected: boolean;
  userRole: UserRole;
  status: string;
  inputDefense: InputAnalysisResult;
  outputDefense?: OutputAnalysisResult;
  toolCalls: ToolCallEvaluation[];
  explanation?: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  requestId: string;
  eventType: string;
  layer: DefenseLayer;
  category: string;
  severity: SeverityLevel;
  riskScore: number;
  inputSummary: string;
  decision: SecurityAction;
  reason: string;
  userRole: UserRole;
  toolName?: string;
  signals: string[];
  metadata: Record<string, any>;
}

export interface DetectionPolicy {
  promptInjection: boolean;
  roleOverride: boolean;
  dataExfiltration: boolean;
  secretDetection: boolean;
  piiDetection: boolean;
  toolEnforcement: boolean;
  obfuscationDetection: boolean;
  lowThreshold: number;
  mediumThreshold: number;
  highThreshold: number;
  criticalThreshold: number;
}

export interface AggregateStats {
  totalRequests: number;
  threatsDetected: number;
  requestsBlocked: number;
  toolCallsBlocked: number;
  sensitiveDataPrevented: number;
  currentRiskLevel: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  severityBreakdown: Record<string, number>;
}

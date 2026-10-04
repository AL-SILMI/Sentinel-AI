import {
  ChatResponse,
  SecurityEvent,
  DetectionPolicy,
  AggregateStats,
  UserRole,
  InputAnalysisResult,
  OutputAnalysisResult
} from '../types';

const API_BASE = '/api';

export async function sendChatMessage(
  message: string,
  isProtected: boolean = true,
  userRole: UserRole = 'CUSTOMER',
  conversationId: string = 'conv-main'
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      protected: isProtected,
      userRole,
      conversationId
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to send chat message: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeInput(message: string, userRole: UserRole = 'CUSTOMER'): Promise<InputAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/input`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, userRole })
  });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function analyzeOutput(text: string): Promise<OutputAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/output`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Output analysis failed');
  return res.json();
}

export async function checkToolPermission(
  toolName: string,
  userRole: UserRole,
  args: Record<string, any> = {}
) {
  const res = await fetch(`${API_BASE}/tool/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolName, userRole, arguments: args })
  });
  if (!res.ok) throw new Error('Tool permission check failed');
  return res.json();
}

export async function fetchSecurityEvents(limit = 100): Promise<SecurityEvent[]> {
  const res = await fetch(`${API_BASE}/events?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(id: string): Promise<SecurityEvent> {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event detail');
  return res.json();
}

export async function fetchStats(): Promise<AggregateStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchPolicies(): Promise<DetectionPolicy> {
  const res = await fetch(`${API_BASE}/policies`);
  if (!res.ok) throw new Error('Failed to fetch policies');
  return res.json();
}

export async function updatePolicies(policy: DetectionPolicy): Promise<DetectionPolicy> {
  const res = await fetch(`${API_BASE}/policies`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policy)
  });
  if (!res.ok) throw new Error('Failed to update policies');
  return res.json();
}

export async function resetDemo(): Promise<void> {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
}

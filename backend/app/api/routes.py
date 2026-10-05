import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from app.schemas import (
    InputAnalysisRequest, InputAnalysisResult,
    OutputAnalysisRequest, OutputAnalysisResult,
    ChatRequest, ChatResponse,
    ToolCheckRequest, ToolCheckResult,
    SecurityEvent, DetectionPolicy,
    DefenseLayer, SecurityAction, SeverityLevel, UserRole
)
from app.detectors.input_defense import analyze_input
from app.detectors.output_defense import analyze_output
from app.detectors.action_defense import check_tool_permission
from app.policies.engine import get_current_policy, update_policy
from app.services.audit_service import log_event, get_events, get_event_by_id, get_aggregate_stats, reset_db_events
from app.services.llm_service import generate_mock_response

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SentinelAI Security Middleware",
        "version": "2.0.0",
        "layers": {
            "inputDefense": "ACTIVE",
            "outputDefense": "ACTIVE",
            "actionDefense": "ACTIVE",
            "auditLogging": "ACTIVE"
        }
    }

@router.post("/analyze/input", response_model=InputAnalysisResult)
def analyze_user_input(req: InputAnalysisRequest):
    return analyze_input(req.message, req.userRole or UserRole.CUSTOMER)

@router.post("/analyze/output", response_model=OutputAnalysisResult)
def analyze_model_output(req: OutputAnalysisRequest):
    return analyze_output(req.text)

@router.post("/tool/check", response_model=ToolCheckResult)
def evaluate_tool_request(req: ToolCheckRequest):
    res = check_tool_permission(req.toolName, req.userRole, req.arguments)
    
    # Audit log tool call event
    log_event(
        request_id=req.requestId or f"REQ-{uuid.uuid4().hex[:6].upper()}",
        event_type="TOOL_CHECK",
        layer=DefenseLayer.ACTION,
        category="TOOL_ABUSE" if not res.allowed else "TOOL_EXECUTION",
        severity=res.severity,
        risk_score=res.riskScore,
        input_summary=f"Tool call: {req.toolName} (Args: {req.arguments})",
        decision=res.action,
        reason=res.reason,
        user_role=req.userRole,
        tool_name=req.toolName,
        signals=["unauthorized_tool"] if not res.allowed else [],
        metadata={"arguments": req.arguments, "requiredRole": res.requiredPermission.value}
    )
    
    return res

@router.post("/chat", response_model=ChatResponse)
def chat_pipeline(req: ChatRequest):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()
    user_role = req.userRole or UserRole.CUSTOMER

    # ==========================
    # 1. UNPROTECTED MODE
    # ==========================
    if not req.protected:
        # LLM receives prompt raw without inspection
        raw_response, raw_tool_calls = generate_mock_response(req.message, user_role, protected=False)
        
        # Log telemetry that unprotected transaction occurred
        log_event(
            request_id=request_id,
            event_type="UNPROTECTED_CHAT",
            layer=DefenseLayer.INPUT,
            category="UNPROTECTED_BASELINE",
            severity=SeverityLevel.LOW,
            risk_score=0,
            input_summary=req.message,
            decision=SecurityAction.ALLOW,
            reason="Unprotected mode: SentinelAI middleware bypassed by user request.",
            user_role=user_role,
            metadata={"protected": False}
        )

        dummy_input_res = InputAnalysisResult(
            allowed=True,
            riskScore=0,
            severity=SeverityLevel.SAFE,
            categories=[],
            signals=["middleware_bypassed"],
            reason="SECURITY NOT ENABLED: Baseline chatbot running with zero middleware.",
            action=SecurityAction.ALLOW
        )

        return ChatResponse(
            requestId=request_id,
            message=raw_response,
            protected=False,
            userRole=user_role,
            status="UNPROTECTED_RESPONSE",
            inputDefense=dummy_input_res,
            outputDefense=None,
            toolCalls=raw_tool_calls,
            explanation="Request processed without SentinelAI middleware inspection.",
            timestamp=timestamp
        )

    # ==========================
    # 2. PROTECTED MODE: INPUT DEFENSE
    # ==========================
    input_result = analyze_input(req.message, user_role)

    if not input_result.allowed:
        # Request blocked right at SentinelAI gateway!
        log_event(
            request_id=request_id,
            event_type="INPUT_ATTACK_BLOCKED",
            layer=DefenseLayer.INPUT,
            category=input_result.categories[0] if input_result.categories else "PROMPT_INJECTION",
            severity=input_result.severity,
            risk_score=input_result.riskScore,
            input_summary=req.message,
            decision=SecurityAction.BLOCK,
            reason=input_result.reason,
            user_role=user_role,
            signals=input_result.signals,
            metadata={"matchedPatterns": input_result.matchedPatterns}
        )

        return ChatResponse(
            requestId=request_id,
            message="[REQUEST BLOCKED BY SENTINELAI]\n\nSentinelAI detected a high-risk security event. The request attempts to override system instructions or extract confidential data.",
            protected=True,
            userRole=user_role,
            status="BLOCKED_INPUT",
            inputDefense=input_result,
            outputDefense=None,
            toolCalls=[],
            explanation=input_result.reason,
            timestamp=timestamp
        )

    # ==========================
    # 3. CALL SANDBOXED LLM
    # ==========================
    llm_output, raw_tools = generate_mock_response(req.message, user_role, protected=True)

    # ==========================
    # 4. ACTION DEFENSE (Tools)
    # ==========================
    evaluated_tools = []
    for tool_call in raw_tools:
        t_res = check_tool_permission(tool_call["toolName"], user_role, tool_call.get("arguments", {}))
        evaluated_tools.append({
            "toolName": tool_call["toolName"],
            "arguments": tool_call.get("arguments", {}),
            "allowed": t_res.allowed,
            "requiredRole": t_res.requiredPermission.value,
            "decision": t_res.action.value,
            "reason": t_res.reason,
            "output": t_res.simulatedOutput if t_res.allowed else None
        })
        log_event(
            request_id=request_id,
            event_type="ACTION_DEFENSE_CHECK",
            layer=DefenseLayer.ACTION,
            category="TOOL_EXECUTION" if t_res.allowed else "TOOL_ABUSE",
            severity=t_res.severity,
            risk_score=t_res.riskScore,
            input_summary=f"Action Defense: {tool_call['toolName']}",
            decision=t_res.action,
            reason=t_res.reason,
            user_role=user_role,
            tool_name=tool_call["toolName"],
            signals=["unauthorized_tool"] if not t_res.allowed else []
        )

    # ==========================
    # 5. OUTPUT DEFENSE
    # ==========================
    output_result = analyze_output(llm_output)

    if output_result.sanitized:
        final_message = output_result.sanitizedText
        event_cat = output_result.categories[0] if output_result.categories else "SENSITIVE_DATA_LEAKAGE"
        log_event(
            request_id=request_id,
            event_type="OUTPUT_SANITIZED",
            layer=DefenseLayer.OUTPUT,
            category=event_cat,
            severity=output_result.severity,
            risk_score=output_result.riskScore,
            input_summary=req.message,
            decision=SecurityAction.SANITIZE,
            reason=output_result.reason,
            user_role=user_role,
            signals=[item["label"] for item in output_result.detectedItems],
            metadata={"detectedItems": output_result.detectedItems}
        )
    else:
        final_message = llm_output
        log_event(
            request_id=request_id,
            event_type="SAFE_REQUEST",
            layer=DefenseLayer.INPUT,
            category="SAFE_REQUEST",
            severity=SeverityLevel.SAFE,
            risk_score=input_result.riskScore,
            input_summary=req.message,
            decision=SecurityAction.ALLOW,
            reason="All SentinelAI security checks passed successfully.",
            user_role=user_role
        )

    return ChatResponse(
        requestId=request_id,
        message=final_message,
        protected=True,
        userRole=user_role,
        status="SANITIZED_OUTPUT" if output_result.sanitized else "COMPLETED",
        inputDefense=input_result,
        outputDefense=output_result,
        toolCalls=evaluated_tools,
        explanation=output_result.reason if output_result.sanitized else "Input, output, and tool calls verified safe.",
        timestamp=timestamp
    )

@router.get("/events", response_model=List[SecurityEvent])
def list_events(limit: int = 100, offset: int = 0):
    return get_events(limit, offset)

@router.get("/events/{event_id}", response_model=SecurityEvent)
def get_event(event_id: str):
    evt = get_event_by_id(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    return evt

@router.get("/stats")
def get_stats():
    return get_aggregate_stats()

@router.get("/policies", response_model=DetectionPolicy)
def get_policies():
    return get_current_policy()

@router.put("/policies", response_model=DetectionPolicy)
def update_policies(policy: DetectionPolicy):
    return update_policy(policy)

@router.post("/chat/protected", response_model=ChatResponse)
def chat_protected_alias(req: ChatRequest):
    req.protected = True
    return chat_pipeline(req)

@router.post("/chat/unprotected", response_model=ChatResponse)
def chat_unprotected_alias(req: ChatRequest):
    req.protected = False
    return chat_pipeline(req)

@router.post("/tools/execute", response_model=ToolCheckResult)
def execute_tool_alias(req: ToolCheckRequest):
    return evaluate_tool_request(req)

@router.post("/demo/reset")
@router.post("/reset")
def reset_demo():
    reset_db_events()
    # Re-seed initial events
    from seed import seed_demo_data
    seed_demo_data()
    return {"status": "SUCCESS", "message": "Demo data reset successfully"}


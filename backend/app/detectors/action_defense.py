from typing import Dict, Any, Tuple
from app.schemas import UserRole, ToolCheckResult, SecurityAction, SeverityLevel, ThreatCategory
from app.policies.engine import get_current_policy

# Role permissions hierarchy: CUSTOMER < SUPPORT_AGENT < ADMIN
ROLE_HIERARCHY = {
    UserRole.CUSTOMER: 1,
    UserRole.SUPPORT_AGENT: 2,
    UserRole.ADMIN: 3
}

# Tool permission matrix
TOOL_POLICIES = {
    "get_customer_profile": {
        "required_role": UserRole.CUSTOMER,
        "risk": 15,
        "description": "Read standard customer profile details"
    },
    "get_order_status": {
        "required_role": UserRole.CUSTOMER,
        "risk": 10,
        "description": "Retrieve current tracking and order delivery status"
    },
    "issue_refund": {
        "required_role": UserRole.SUPPORT_AGENT,
        "risk": 75,
        "description": "Authorize customer refund to external account"
    },
    "update_customer_email": {
        "required_role": UserRole.ADMIN,
        "risk": 65,
        "description": "Modify customer login email & credentials"
    },
    "export_customer_data": {
        "required_role": UserRole.ADMIN,
        "risk": 95,
        "description": "Export entire customer database dump"
    }
}

# Synthetic execution mock responses
SYNTHETIC_TOOL_DATA = {
    "get_customer_profile": {
        "customerId": "CUST-9921",
        "name": "Alex Johnson",
        "tier": "Gold Member",
        "ordersCount": 4
    },
    "get_order_status": {
        "orderId": "ORD-10231",
        "status": "In Transit",
        "carrier": "BlueDart Express",
        "eta": "Tomorrow by 2:00 PM"
    },
    "issue_refund": {
        "status": "APPROVED",
        "refundId": "RFND-88912",
        "amount": "$149.99",
        "processedBy": "SentinelAI Tool Gateway"
    },
    "update_customer_email": {
        "status": "SUCCESS",
        "updatedEmail": "alex.verified@example.com"
    },
    "export_customer_data": {
        "status": "EXPORT_COMPLETE",
        "recordsExported": 1420,
        "archiveUrl": "https://secure.internal.acme.corp/exports/full_dump_enc.zip"
    }
}

def check_tool_permission(
    tool_name: str,
    user_role: UserRole,
    arguments: Dict[str, Any] = {}
) -> ToolCheckResult:
    policy = get_current_policy()
    
    if tool_name not in TOOL_POLICIES:
        return ToolCheckResult(
            toolName=tool_name,
            requiredPermission=UserRole.ADMIN,
            currentRole=user_role,
            allowed=False,
            riskScore=90,
            severity=SeverityLevel.CRITICAL,
            action=SecurityAction.BLOCK,
            reason=f"Unknown or unapproved tool '{tool_name}' blocked by Action Defense."
        )

    tool_def = TOOL_POLICIES[tool_name]
    required_role = tool_def["required_role"]
    base_risk = tool_def["risk"]

    user_level = ROLE_HIERARCHY.get(user_role, 1)
    required_level = ROLE_HIERARCHY.get(required_role, 3)

    if user_level < required_level:
        # Permission denied!
        risk_score = min(100, base_risk + 15)
        severity = SeverityLevel.CRITICAL if risk_score >= policy.criticalThreshold else SeverityLevel.HIGH
        
        return ToolCheckResult(
            toolName=tool_name,
            requiredPermission=required_role,
            currentRole=user_role,
            allowed=False,
            riskScore=risk_score,
            severity=severity,
            action=SecurityAction.BLOCK,
            reason=f"Permission Denied: '{tool_name}' requires role {required_role.value}, but caller has {user_role.value}."
        )

    # Allowed
    severity = SeverityLevel.SAFE if base_risk < 30 else SeverityLevel.LOW
    return ToolCheckResult(
        toolName=tool_name,
        requiredPermission=required_role,
        currentRole=user_role,
        allowed=True,
        riskScore=base_risk,
        severity=severity,
        action=SecurityAction.ALLOW,
        reason=f"Action Defense authorized: User role {user_role.value} fulfills scope for {tool_name}.",
        simulatedOutput=SYNTHETIC_TOOL_DATA.get(tool_name, {"status": "SUCCESS"})
    )

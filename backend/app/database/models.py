"""
SQLAlchemy ORM models for SentinelAI.
Provides declarative schema mapping for SecurityEvent and Policy.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class SecurityEventModel(Base):
    __tablename__ = "security_events"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(String(64), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    request_id = Column(String(64), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)
    layer = Column(String(32), nullable=False)
    category = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False)
    risk_score = Column(Integer, nullable=False)
    input_summary = Column(Text, nullable=False)
    decision = Column(String(32), nullable=False)
    reason = Column(Text, nullable=False)
    user_role = Column(String(32), nullable=False)
    tool_name = Column(String(64), nullable=True)
    signals_json = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)

class PolicyModel(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True)
    policy_json = Column(Text, nullable=False)

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sentinelai.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Security events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS security_events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        request_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        layer TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        input_summary TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        user_role TEXT NOT NULL,
        tool_name TEXT,
        signals_json TEXT,
        metadata_json TEXT
    )
    """)
    
    # Policies table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS policies (
        id INTEGER PRIMARY KEY,
        policy_json TEXT NOT NULL
    )
    """)
    
    # Ensure default policy exists
    cursor.execute("SELECT COUNT(*) FROM policies WHERE id = 1")
    if cursor.fetchone()[0] == 0:
        default_policy = {
            "promptInjection": True,
            "roleOverride": True,
            "dataExfiltration": True,
            "secretDetection": True,
            "piiDetection": True,
            "toolEnforcement": True,
            "obfuscationDetection": True,
            "lowThreshold": 30,
            "mediumThreshold": 60,
            "highThreshold": 80,
            "criticalThreshold": 90
        }
        cursor.execute("INSERT INTO policies (id, policy_json) VALUES (1, ?)", (json.dumps(default_policy),))
        
    conn.commit()
    conn.close()

init_db()

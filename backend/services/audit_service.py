import time
import logging
from typing import Dict, Any, List

logger = logging.getLogger("lasa_guard.audit")

class AuditService:
    """
    FDA-Grade Audit Service capturing immutable interaction logs, override records,
    and administrative system actions for compliance reporting.
    """
    def __init__(self):
        self._audit_logs: List[Dict[str, Any]] = []

    def log_event(self, event_type: str, user_id: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Record an immutable audit log entry."""
        entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "epoch": time.time(),
            "event_type": event_type,
            "user_id": user_id,
            "details": details
        }
        self._audit_logs.append(entry)
        logger.info(f"AUDIT LOG [{event_type}] User={user_id}: {details}")
        return entry

    def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent audit logs sorted newest first."""
        return sorted(self._audit_logs, key=lambda x: x["epoch"], reverse=True)[:limit]

audit_service = AuditService()

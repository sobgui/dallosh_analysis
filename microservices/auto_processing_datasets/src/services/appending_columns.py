"""Callback function for appending columns event."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.configs.constants import (
    TASK_STATUS_APPENDING_COLUMNS,
    TASK_STATUS_APPENDING_COLUMNS_DONE,
)


def appending_columns(file_id: str, event_emitter: callable) -> None:
    """
    Emit event for appending columns.
    
    Args:
        file_id: File identifier
        event_emitter: Function to emit events (file_id, event)
    """
    event_emitter(file_id, TASK_STATUS_APPENDING_COLUMNS)
    event_emitter(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE)


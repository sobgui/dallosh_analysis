"""Callback function for saving analysed dataset."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.configs.env import STORAGE_ANALYSED
from src.configs.constants import (
    TASK_STATUS_SAVING_FILE,
    TASK_STATUS_SAVING_FILE_DONE,
    TASK_STATUS_DONE,
)
from datetime import datetime

from src.utils.helpers import ensure_directory_exists


def saving(file_id: str, df, event_emitter: callable, db_adapter=None) -> str:
    """
    Save the analysed dataset.
    
    Args:
        file_id: File identifier
        df: DataFrame to save
        event_emitter: Function to emit events (file_id, event)
    
    Returns:
        Path to saved file
    """
    # Emit saving event
    event_emitter(file_id, TASK_STATUS_SAVING_FILE)
    
    # Ensure directory exists
    ensure_directory_exists(STORAGE_ANALYSED)
    
    # Save analysed dataset
    analysed_path = os.path.join(STORAGE_ANALYSED, f"{file_id}.csv")
    # Ensure we use absolute path for file operations
    analysed_path = os.path.abspath(analysed_path)
    df.to_csv(analysed_path, index=False)
    
    print(f"Saved analysed dataset to: {analysed_path}")

    if db_adapter is not None:
        try:
            # Store relative path (e.g., "analysed/{file_id}.csv") for cross-container compatibility
            # Both backend and microservice can resolve this relative to their own storage paths
            relative_path = os.path.join('analysed', f"{file_id}.csv")
            
            db_adapter.update_one(
                'tasks',
                {'data.file_id': file_id},
                {
                    'data.file_analysed.path': relative_path,
                    'data.file_analysed.type': 'text/csv',
                    'updatedAt': datetime.utcnow(),
                    'updatedBy': 'system',
                }
            )
            print(f"Updated task with analysed file path (relative): {relative_path}")
        except Exception as exc:
            print(f"Warning: failed to update task with analysed file path: {exc}")
    
    # Emit saving completion event
    event_emitter(
        file_id,
        TASK_STATUS_SAVING_FILE_DONE,
        {'analysed_path': analysed_path}
    )
    
    # Emit done event
    event_emitter(file_id, TASK_STATUS_DONE)
    
    return analysed_path


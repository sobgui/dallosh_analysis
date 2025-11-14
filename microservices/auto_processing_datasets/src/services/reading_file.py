"""Callback function for reading dataset file."""
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.utils.helpers import get_file_id_from_path
from src.configs.constants import (
    TASK_STATUS_READING_DATASET,
    TASK_STATUS_READING_DATASET_DONE,
)


def reading_file(file_path: str, event_emitter: callable) -> tuple[str, pd.DataFrame]:
    """
    Read CSV dataset from file path.
    
    Args:
        file_path: Path to the CSV file
        event_emitter: Function to emit events (file_id, event)
    
    Returns:
        Tuple of (file_id, dataframe)
    """
    file_id = get_file_id_from_path(file_path)
    
    event_emitter(file_id, TASK_STATUS_READING_DATASET)
    
    df = pd.read_csv(file_path)
    print(f"Read dataset: {len(df)} rows, {len(df.columns)} columns")

    event_emitter(
        file_id,
        TASK_STATUS_READING_DATASET_DONE,
        {'rows': len(df), 'columns': len(df.columns)}
    )
    
    return file_id, df


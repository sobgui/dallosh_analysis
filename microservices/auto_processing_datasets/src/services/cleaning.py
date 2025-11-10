"""Callback function for cleaning dataset."""
import pandas as pd
import numpy as np
import os
import sys
import re
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.configs.env import STORAGE_CLEANED
from src.configs.constants import (
    TASK_STATUS_PROCESS_CLEANING,
    TASK_STATUS_PROCESS_CLEANING_DONE,
)
from src.utils.helpers import ensure_directory_exists


def remove_emoji(text: str) -> str:
    """Remove emojis and special characters from text, preserving @ mentions."""
    if pd.isna(text):
        return text
    
    text = str(text)
    # Remove emojis
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)
    
    # Protect @ mentions (e.g., @username, @user123) by temporarily replacing them
    # Pattern: @ followed by word characters (letters, numbers, underscore)
    mention_pattern = re.compile(r'@\w+')
    mentions = mention_pattern.findall(text)
    # Replace mentions with placeholders
    for i, mention in enumerate(mentions):
        text = text.replace(mention, f'__MENTION_{i}__', 1)
    
    # Remove special characters except letters, numbers, spaces, and basic punctuation
    text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
    
    # Restore @ mentions
    for i, mention in enumerate(mentions):
        text = text.replace(f'__MENTION_{i}__', mention, 1)
    
    # Clean up multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def cleaning(file_id: str, df: pd.DataFrame, event_emitter: callable, db_adapter=None) -> pd.DataFrame:
    """
    Clean dataset: remove emojis, special characters, duplicates and outliers.
    
    Args:
        file_id: File identifier
        df: DataFrame to clean
        event_emitter: Function to emit events (file_id, event)
    
    Returns:
        Cleaned DataFrame
    """
    # Emit cleaning event
    event_emitter(file_id, TASK_STATUS_PROCESS_CLEANING)
    
    initial_rows = len(df)
    
    # Clean 'full_text' column: remove emojis and special characters
    if 'full_text' in df.columns:
        print(f"Cleaning 'full_text' column: removing emojis and special characters...")
        df['full_text'] = df['full_text'].apply(remove_emoji)
        print(f"Cleaned {len(df)} rows of text data")
    
    # Remove duplicates
    df = df.drop_duplicates()
    duplicates_removed = initial_rows - len(df)
    
    # Remove outliers (using IQR method for numeric columns) - only for non-ID columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    numeric_cols = [col for col in numeric_cols if col not in ['id', 'user_id']]  # Don't remove outliers for ID columns
    
    outliers_removed = 0
    for col in numeric_cols:
        initial_col_len = len(df)
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        if IQR > 0:  # Only if there's variation
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
            outliers_removed += initial_col_len - len(df)
    
    print(f"Cleaned dataset: removed {duplicates_removed} duplicates, {outliers_removed} outliers")
    print(f"Final dataset: {len(df)} rows")
    
    # Save cleaned dataset
    ensure_directory_exists(STORAGE_CLEANED)
    cleaned_path = os.path.join(STORAGE_CLEANED, f"{file_id}.csv")
    # Ensure we use absolute path for file operations
    cleaned_path = os.path.abspath(cleaned_path)
    df.to_csv(cleaned_path, index=False)
    print(f"Saved cleaned dataset to: {cleaned_path}")

    # Persist metadata back to task document if database adapter is provided
    # Store relative path (e.g., "cleaned/{file_id}.csv") so it works across different container mount points
    # Both backend and microservice can resolve this relative to their own storage paths
    if db_adapter is not None:
        try:
            # Store relative path for cross-container compatibility
            # Extract relative path from storage root (e.g., "cleaned/{file_id}.csv")
            relative_path = os.path.join('cleaned', f"{file_id}.csv")
            
            db_adapter.update_one(
                'tasks',
                {'data.file_id': file_id},
                {
                    'data.file_cleaned.path': relative_path,
                    'data.file_cleaned.type': 'text/csv',
                    'updatedAt': datetime.utcnow(),
                    'updatedBy': 'system',
                }
            )
            print(f"Updated task with cleaned file path (relative): {relative_path}")
        except Exception as exc:
            print(f"Warning: failed to update task with cleaned file path: {exc}")
    
    # Emit completion event with metadata
    event_emitter(
        file_id,
        TASK_STATUS_PROCESS_CLEANING_DONE,
        {
            'initial_rows': initial_rows,
            'final_rows': len(df),
            'duplicates_removed': duplicates_removed,
            'outliers_removed': outliers_removed,
            'cleaned_path': cleaned_path,
        }
    )
    
    return df


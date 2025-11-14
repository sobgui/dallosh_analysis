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
    if pd.isna(text):
        return text
    
    text = str(text)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)
    
    # Preserve @mentions during special character removal
    mention_pattern = re.compile(r'@\w+')
    mentions = mention_pattern.findall(text)
    for i, mention in enumerate(mentions):
        text = text.replace(mention, f'__MENTION_{i}__', 1)
    
    text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
    
    for i, mention in enumerate(mentions):
        text = text.replace(f'__MENTION_{i}__', mention, 1)
    
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
    event_emitter(file_id, TASK_STATUS_PROCESS_CLEANING)
    
    initial_rows = len(df)
    
    if 'full_text' in df.columns:
        print(f"Cleaning 'full_text' column: removing emojis and special characters...")
        df['full_text'] = df['full_text'].apply(remove_emoji)
        print(f"Cleaned {len(df)} rows of text data")
    
    df = df.drop_duplicates()
    duplicates_removed = initial_rows - len(df)
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    numeric_cols = [col for col in numeric_cols if col not in ['id', 'user_id']]
    
    # Remove outliers using IQR method (Interquartile Range)
    outliers_removed = 0
    for col in numeric_cols:
        initial_col_len = len(df)
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        if IQR > 0:
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
            outliers_removed += initial_col_len - len(df)
    
    print(f"Cleaned dataset: removed {duplicates_removed} duplicates, {outliers_removed} outliers")
    print(f"Final dataset: {len(df)} rows")
    
    ensure_directory_exists(STORAGE_CLEANED)
    cleaned_path = os.path.join(STORAGE_CLEANED, f"{file_id}.csv")
    cleaned_path = os.path.abspath(cleaned_path)
    df.to_csv(cleaned_path, index=False)
    print(f"Saved cleaned dataset to: {cleaned_path}")

    if db_adapter is not None:
        try:
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


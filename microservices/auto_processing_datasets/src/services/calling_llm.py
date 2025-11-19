"""Callback function for calling LLM API."""
import json
import time
from typing import Dict, List, Optional
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    import requests
except ImportError:
    requests = None

from src.configs.constants import (
    TASK_STATUS_SENDING_TO_LLM,
    TASK_STATUS_SENDING_TO_LLM_PROGRESS,
    TASK_STATUS_SENDING_TO_LLM_DONE,
)
from src.configs.env import (
    DEFAULT_PAGINATE_ROWS_LIMIT, DEFAULT_RETRY_REQUESTS,
    MAX_PAGINATE_ROWS_LIMIT, MAX_RETRY_REQUESTS
)


def _is_external_model(model: dict, ai_config: dict) -> bool:
    """
    Check if a model is an external model.
    
    Args:
        model: Model dictionary
        ai_config: AI configuration dictionary
    
    Returns:
        True if model is external, False otherwise
    """
    preferences = ai_config.get('preferences', {})
    mode = preferences.get('mode', 'local')
    
    if mode == 'external':
        return True
    
    external_models = ai_config.get('external', [])
    model_uid = model.get('uid')
    
    for ext_model in external_models:
        if ext_model.get('uid') == model_uid:
            return True
    
    base_url = model.get('data', {}).get('baseUrl', '')
    if base_url:
        if 'localhost' not in base_url.lower() and '127.0.0.1' not in base_url:
            if '/openai' in base_url or '/chat/completions' in base_url or 'generativelanguage' in base_url:
                return True
            if ':11434' not in base_url:
                return True
    
    return False


def _get_ai_model(ai_config: dict, tried_models: List[str] = None) -> Optional[dict]:
    """
    Get the appropriate AI model based on configuration with fallback logic.
    
    Args:
        ai_config: AI configuration dictionary
        tried_models: List of model UIDs that have already been tried
    
    Returns:
        Model dictionary or None
    """
    if tried_models is None:
        tried_models = []
    
    preferences = ai_config.get('preferences', {})
    mode = preferences.get('mode', 'local')
    
    if mode == 'automatic':
        default_external_id = preferences.get('default_external_model_id')
        external_models = ai_config.get('external', [])
        
        if default_external_id and external_models:
            for model in external_models:
                if model.get('uid') == default_external_id and model.get('uid') not in tried_models:
                    return model
        
        for model in external_models:
            if model.get('uid') not in tried_models:
                return model
        
        local_models = ai_config.get('local', [])
        for model in local_models:
            if model.get('uid') not in tried_models:
                return model
    
    elif mode == 'external':
        external_models = ai_config.get('external', [])
        default_external_id = preferences.get('default_external_model_id')
        
        if default_external_id and external_models:
            for model in external_models:
                if model.get('uid') == default_external_id and model.get('uid') not in tried_models:
                    return model
        
        for model in external_models:
            if model.get('uid') not in tried_models:
                return model
    
    elif mode == 'local':
        local_models = ai_config.get('local', [])
        default_local_id = preferences.get('default_local_model_id')
        
        if default_local_id and local_models:
            for model in local_models:
                if model.get('uid') == default_local_id and model.get('uid') not in tried_models:
                    return model
        
        for model in local_models:
            if model.get('uid') not in tried_models:
                return model
    
    return None


def _call_llm_api(model: dict, texts: List[str], ai_config: dict, retry_count: int = 0) -> dict:
    """
    Call LLM API using OpenAI-compatible chat completions format.
    Uses POST method with JSON body as per OpenAI API standard.
    Works for both external and local models (as long as they support OpenAI-compatible API).
    
    Args:
        model: Model configuration dictionary (should have baseUrl set to OpenAI-compatible endpoint)
        texts: List of texts to analyze
        ai_config: AI configuration dictionary (kept for compatibility, not used)
        retry_count: Current retry attempt
    
    Returns:
        Dictionary with analysis, priority, and topics arrays
    
    Note:
        The baseUrl should be configured by the user to point to an OpenAI-compatible endpoint.
        Example for Gemini: https://generativelanguage.googleapis.com/v1beta/openai
        The function will automatically append /chat/completions to the baseUrl.
    """
    if requests is None:
        raise ImportError("requests library is not installed. Run: pip install requests")
    
    base_url = model['data']['baseUrl']
    api_key = model['data'].get('apiKey', '')
    model_name = model['data']['model']
    max_retries = min(model['data'].get('retryRequests', DEFAULT_RETRY_REQUESTS), MAX_RETRY_REQUESTS)
    
    prompt = f"""You are tasked with analyzing customer complaints and messages from social media posts on Twitter mentioning the brand Free Mobile in France's telecommunication industry. For each post below, you must identify:

                - sentiment: classify as 'negative', 'neutral', or 'positive' based on the overall tone, considering explicit dissatisfaction, frustration, or praise, not just keyword presence.
                - priority: classify as 'high', 'normal', or 'low' considering urgency implied by the message, intensity of complaints, and expressions of frustration.
                - topic: identify the main subject or theme of the post (e.g., network issues, billing, customer service, technical support).

                The sentiment analysis should capture emotional cues including frustration, impatience, or dissatisfaction, especially in cases like delays or unresolved service issues, beyond simple word sentiment.

                Analyze the following posts and return a JSON object with:
                - data: an object containing arrays of sentiment, priority, and topic for each post.

                I have {len(texts)} posts to analyze.
                Posts list:
                {json.dumps(texts, ensure_ascii=False)}

                For each post, return its sentiment, priority, and topic.

                Return only valid JSON in exactly this format:
                {"data": {"sentiment": [...], "priority": [...], "topic": [...]}}

                Where:
                - sentiment is one of 'negative', 'neutral', or 'positive'.
                - priority is one of 'high', 'normal', or 'low'.
                - topic is a concise descriptive label summarizing the main subject."""
    
    headers = {
        'Content-Type': 'application/json',
    }
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    endpoint = base_url.rstrip('/')
    if not endpoint.endswith('/chat/completions'):
        if endpoint.endswith('/openai'):
            endpoint = f"{endpoint}/chat/completions"
        elif '/chat/completions' not in endpoint:
            endpoint = f"{endpoint}/chat/completions"
    
    print(f"LLM API endpoint: {endpoint}")
    
    request_body = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "response_format": {"type": "json_object"}
    }
    
    try:
        response = requests.post(
            endpoint,
            json=request_body,
            headers=headers,
            timeout=300
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        if isinstance(response_data, dict):
            if 'choices' in response_data and len(response_data['choices']) > 0:
                content = response_data['choices'][0].get('message', {}).get('content', '')
                if content:
                    try:
                        parsed_content = json.loads(content.strip())
                        return parsed_content
                    except json.JSONDecodeError:
                        import re
                        json_match = re.search(r'\{.*\}', content, re.DOTALL)
                        if json_match:
                            return json.loads(json_match.group())
                        raise ValueError(f"Invalid JSON in response content: {content[:500]}")
            return response_data
        elif isinstance(response_data, list):
            return {'data': response_data}
        elif isinstance(response_data, str):
            try:
                parsed = json.loads(response_data.strip())
                return parsed if isinstance(parsed, dict) else {'data': parsed}
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'\{.*\}', response_data, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                raise ValueError(f"Invalid JSON response from external LLM: {response_data[:500]}")
        else:
            raise ValueError(f"Unexpected response type: {type(response_data)}")
    
    except requests.exceptions.RequestException as e:
        if retry_count < max_retries:
            print(f"LLM API call failed (attempt {retry_count + 1}/{max_retries}): {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json()
                    print(f"Error response: {error_detail}")
                except:
                    print(f"Error response text: {e.response.text[:500]}")
            time.sleep(2 ** retry_count)
            return _call_llm_api(model, texts, ai_config, retry_count + 1)
        else:
            raise Exception(f"LLM API call failed after {max_retries} retries: {e}")
    except Exception as e:
        if retry_count < max_retries:
            print(f"LLM API call failed (attempt {retry_count + 1}/{max_retries}): {e}")
            time.sleep(2 ** retry_count)
            return _call_llm_api(model, texts, ai_config, retry_count + 1)
        else:
            raise Exception(f"LLM API call failed after {max_retries} retries: {e}")


def calling_llm(file_id: str, df, ai_config: dict, event_emitter: callable, 
                tried_models: List[str] = None) -> tuple[pd.DataFrame, str]:
    """
    Process dataset with LLM to add sentiment, priority, and topics.
    
    Args:
        file_id: File identifier
        df: DataFrame with 'full_text' column
        ai_config: AI configuration dictionary
        event_emitter: Function to emit events (file_id, event)
        tried_models: List of model UIDs that have already been tried
    
    Returns:
        Tuple of (DataFrame with new columns, model_uid used)
    """
    import pandas as pd
    
    if tried_models is None:
        tried_models = []
    
    if 'full_text' not in df.columns:
        raise ValueError("Dataset must have 'full_text' column")
    
    event_emitter(file_id, TASK_STATUS_SENDING_TO_LLM)
    
    model = _get_ai_model(ai_config, tried_models)
    if not model:
        raise ValueError("No AI model available")
    
    model_uid = model.get('uid')
    paginate_limit = min(
        model['data'].get('paginateRowsLimit', DEFAULT_PAGINATE_ROWS_LIMIT),
        MAX_PAGINATE_ROWS_LIMIT
    )
    
    sentiments = []
    priorities = []
    topics = []
    
    total_rows = len(df)
    num_batches = (total_rows + paginate_limit - 1) // paginate_limit
    
    print(f"Processing {total_rows} rows in {num_batches} batches of {paginate_limit}")
    last_success_model = None

    for i in range(0, total_rows, paginate_limit):
        batch = df.iloc[i:i + paginate_limit]
        texts = batch['full_text'].tolist()
        
        print(f"Processing batch {i // paginate_limit + 1}/{num_batches} ({len(texts)} rows)")
        
        try:
            result = _call_llm_api(model, texts, ai_config)
            
            if i == 0:
                print(f"Debug: LLM result type: {type(result)}, keys: {result.keys() if isinstance(result, dict) else 'N/A'}")
            
            if isinstance(result, list):
                print(f"Warning: LLM returned list instead of dict: {result[:3] if len(result) > 3 else result}")
                batch_sentiments = []
                batch_priorities = []
                batch_topics = []
            elif isinstance(result, dict):
                data = result.get('data', result)
                if isinstance(data, dict):
                    batch_sentiments = data.get('sentiment', data.get('analysis', []))
                    batch_priorities = data.get('priority', [])
                    batch_topics = data.get('topic', data.get('topics', []))
                    if not batch_sentiments and not batch_priorities and not batch_topics:
                        print(f"Warning: Empty results from LLM. Result keys: {result.keys()}, Data keys: {data.keys() if isinstance(data, dict) else 'N/A'}")
                elif isinstance(data, list):
                    print(f"Info: LLM returned list in data field: {data[:2] if len(data) > 2 else data}")
                    aggregated_sentiments = []
                    aggregated_priorities = []
                    aggregated_topics = []

                    for item in data:
                        if isinstance(item, dict):
                            sentiment_value = item.get('sentiment')
                            priority_value = item.get('priority')
                            topic_value = item.get('topic') or item.get('topics')

                            if isinstance(sentiment_value, list):
                                aggregated_sentiments.extend(sentiment_value)
                            elif sentiment_value is not None:
                                aggregated_sentiments.append(sentiment_value)

                            if isinstance(priority_value, list):
                                aggregated_priorities.extend(priority_value)
                            elif priority_value is not None:
                                aggregated_priorities.append(priority_value)

                            if isinstance(topic_value, list):
                                aggregated_topics.extend(topic_value)
                            elif topic_value is not None:
                                aggregated_topics.append(topic_value)
                        else:
                            if item is not None:
                                aggregated_sentiments.append(str(item))

                    batch_sentiments = aggregated_sentiments
                    batch_priorities = aggregated_priorities
                    batch_topics = aggregated_topics
                else:
                    print(f"Warning: Unexpected data type in result: {type(data)}")
                    batch_sentiments = []
                    batch_priorities = []
                    batch_topics = []
            else:
                print(f"Warning: Unexpected result type: {type(result)}, value: {str(result)[:200]}")
                batch_sentiments = []
                batch_priorities = []
                batch_topics = []
            
            if not isinstance(batch_sentiments, list):
                print(f"Warning: batch_sentiments is not a list: {type(batch_sentiments)}")
                batch_sentiments = []
            if not isinstance(batch_priorities, list):
                print(f"Warning: batch_priorities is not a list: {type(batch_priorities)}")
                batch_priorities = []
            if not isinstance(batch_topics, list):
                print(f"Warning: batch_topics is not a list: {type(batch_topics)}")
                batch_topics = []
            
            if not batch_sentiments and not batch_priorities and not batch_topics:
                raise ValueError(f"Empty results from LLM. Expected arrays but got empty lists. Result structure: {type(result)}")
            
            # Normalize priority values: high/normal/low -> 2/1/0
            normalized_priorities = []
            for p in batch_priorities:
                if isinstance(p, str):
                    if p.lower() in ['high', 'h']:
                        normalized_priorities.append(2)
                    elif p.lower() in ['normal', 'medium', 'm', 'n']:
                        normalized_priorities.append(1)
                    elif p.lower() in ['low', 'l']:
                        normalized_priorities.append(0)
                    else:
                        normalized_priorities.append(1)
                else:
                    normalized_priorities.append(int(p) if isinstance(p, (int, float)) else 1)
            
            batch_priorities = normalized_priorities
            
            batch_size = len(texts)
            while len(batch_sentiments) < batch_size:
                batch_sentiments.append('neutral')
            while len(batch_priorities) < batch_size:
                batch_priorities.append(0)
            while len(batch_topics) < batch_size:
                batch_topics.append('general')
            
            sentiments.extend(batch_sentiments[:batch_size])
            priorities.extend(batch_priorities[:batch_size])
            topics.extend(batch_topics[:batch_size])
            last_success_model = model_uid

            current_batch = (i // paginate_limit) + 1
            rows_processed = min(i + batch_size, total_rows)
            progress_percentage = int((rows_processed / total_rows) * 100) if total_rows > 0 else 0
            
            event_emitter(
                file_id,
                TASK_STATUS_SENDING_TO_LLM_PROGRESS,
                {
                    'batch': current_batch,
                    'total_batches': num_batches,
                    'batch_size': batch_size,
                    'total_rows': total_rows,
                    'rows_processed': rows_processed,
                    'rows_remaining': max(0, total_rows - rows_processed),
                    'progress_percentage': progress_percentage,
                    'current_row_index': i + 1,
                    'current_row_end': rows_processed,
                    'model_uid': model_uid,
                }
            )
        
        except Exception as e:
            print(f"Error processing batch with model {model_uid}: {e}")
            tried_models.append(model_uid)
            next_model = _get_ai_model(ai_config, tried_models)
            
            if next_model:
                print(f"Trying fallback model: {next_model.get('uid')}")
                model = next_model
                model_uid = model.get('uid')
                i -= paginate_limit  # Retry current batch with fallback model
                continue
            else:
                batch_size = len(texts)
                sentiments.extend(['neutral'] * batch_size)
                priorities.extend([0] * batch_size)
                topics.extend(['general'] * batch_size)
                fallback_model = model_uid or 'default'
                last_success_model = fallback_model
                
                current_batch = (i // paginate_limit) + 1
                rows_processed = min(i + batch_size, total_rows)
                progress_percentage = int((rows_processed / total_rows) * 100) if total_rows > 0 else 0
                
                event_emitter(
                    file_id,
                    TASK_STATUS_SENDING_TO_LLM_PROGRESS,
                    {
                        'batch': current_batch,
                        'total_batches': num_batches,
                        'batch_size': batch_size,
                        'total_rows': total_rows,
                        'rows_processed': rows_processed,
                        'rows_remaining': max(0, total_rows - rows_processed),
                        'progress_percentage': progress_percentage,
                        'current_row_index': i + 1,
                        'current_row_end': rows_processed,
                        'model_uid': fallback_model,
                        'fallback_used': True,
                    }
                )
    
    df['sentiment'] = sentiments[:total_rows]
    df['priority'] = priorities[:total_rows]
    df['main_topic'] = topics[:total_rows]
    
    print(f"Added columns: sentiment, priority, main_topic")
    
    event_emitter(
        file_id,
        TASK_STATUS_SENDING_TO_LLM_DONE,
        {
            'total_rows': total_rows,
            'total_batches': num_batches,
            'model_uid': last_success_model or model_uid,
        }
    )
    
    return df, model_uid


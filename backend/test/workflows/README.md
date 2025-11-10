# Workflow Test - Local Dataset Processing

This workflow test verifies the end-to-end process of uploading and processing a dataset through the Dallosh Analysis system.

## Prerequisites

1. **Backend server** running on port 5006
2. **Microservice** running (`python main.py` in `microservices/auto_processing_datasets/`)
3. **RabbitMQ** running on `localhost:5672`
4. **MongoDB** running on `localhost:27017`
5. **Ollama** running with the model `qwen3:1.7b-fp16` accessible at `http://192.168.1.117:11434`

## Test File

The test file should be located at:
```
backend/test/storage/datasets/dataset_free_tweet_export.csv
```

Expected columns:
- `id`, `created_at`, `full_text`, `media`, `screen_name`, `name`, `profile_image_url`, `user_id`, `in_reply_to`, `retweeted_status`, `quoted_status`, `media_tags`, `favorite_count`, `retweet_count`, `bookmark_count`, `quote_count`, `reply_count`, `views_count`, `favorited`, `retweeted`, `bookmarked`, `url`

## Workflow Steps

1. **Login**: Authenticates as `admin@free.com` with password `123456`
2. **Update Settings**: Configures local LLM mode with Ollama model
3. **Upload File**: Uploads the CSV file via multipart form
4. **Create Task**: Creates a task with status `added`
5. **Proceed Task**: Sends proceed_task event to microservice
6. **Wait for Processing**: Listens to RabbitMQ events and waits for completion

## Expected Events

The microservice should emit the following events in sequence:
- `in_queue`
- `reading_dataset`
- `process_cleaning`
- `sending_to_llm`
- `appending_collumns`
- `saving_file`
- `done`

## Expected Output Files

After processing, the following files should be created:
- `storage/cleaned/[file_id].csv` - Cleaned dataset (no emojis, duplicates removed)
- `storage/analysed/[file_id].csv` - Processed dataset with `sentiment`, `priority`, and `main_topic` columns

## Running the Test

```bash
# Make sure backend, microservice, RabbitMQ, and MongoDB are running
# Then run:
cd backend
npx tsx test/workflows/local_process_dataset.ts
```

Or if using ts-node:
```bash
npx ts-node test/workflows/local_process_dataset.ts
```

## Troubleshooting

- **Connection errors**: Check that all services (backend, microservice, RabbitMQ, MongoDB) are running
- **File not found**: Ensure the test CSV file exists at the specified path
- **LLM errors**: Verify Ollama is running and the model is available
- **Event timeout**: The test waits up to 5 minutes for completion. Check microservice logs for errors.



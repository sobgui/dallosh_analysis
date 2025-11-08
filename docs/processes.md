# Process Flows

This document describes the detailed process flows for various operations in the Dallosh Analysis platform.

## Table of Contents

- [File Upload Process](#file-upload-process)
- [Task Processing Process](#task-processing-process)
- [Data Cleaning Process](#data-cleaning-process)
- [LLM Analysis Process](#llm-analysis-process)
- [Error Handling Process](#error-handling-process)

## File Upload Process

1. User uploads CSV file through frontend interface
2. Backend validates file (size, type, extension)
3. Backend saves file to storage/datasets/
4. Backend creates file record in MongoDB
5. Backend creates task record in MongoDB
6. Backend returns file and task information to frontend

## Task Processing Process

1. User starts task processing
2. Backend publishes proceed_task event to RabbitMQ
3. Microservice receives event from RabbitMQ
4. Microservice reads CSV file from storage
5. Microservice validates CSV structure
6. Microservice cleans data
7. Microservice sends data to LLM for analysis
8. Microservice appends analysis results
9. Microservice saves processed file to storage
10. Microservice updates task status in MongoDB
11. Microservice emits status updates to RabbitMQ
12. Frontend receives real-time status updates

## Data Cleaning Process

1. Remove duplicate rows
2. Handle missing values
3. Clean text data (remove emojis, special characters)
4. Validate data types
5. Save cleaned data to storage/cleaned/

## LLM Analysis Process

1. Paginate data into batches (default: 500 rows)
2. Send batches to LLM service
3. Extract sentiment analysis
4. Extract priority classification
5. Extract main topics
6. Aggregate results from all batches
7. Append results to dataset

## Error Handling Process

1. Catch exceptions at each stage
2. Log error details
3. Classify error type
4. Update task status to failed
5. Store error message in task record
6. Emit error event to RabbitMQ
7. Notify user of error

---

[Back to Documentation Index](./README.md)

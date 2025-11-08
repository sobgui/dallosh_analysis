# Component Interactions

This document describes the interactions between different components of the Dallosh Analysis platform.

## Table of Contents

- [Backend API Structure](#backend-api-structure)
- [Microservice Processing Pipeline](#microservice-processing-pipeline)
- [Frontend Components](#frontend-components)
- [Component Communication](#component-communication)

## Backend API Structure

```
Backend (Express.js)
├── Authentication
│   ├── POST /api/auth/register
│   ├── POST /api/auth/login
│   ├── POST /api/auth/refresh
│   └── GET  /api/auth/me
├── Users Management
│   ├── GET    /api/users
│   ├── GET    /api/users/:uid
│   ├── POST   /api/users
│   ├── PATCH  /api/users/:uid
│   └── DELETE /api/users/:uid
├── Files Management
│   ├── POST   /api/files/upload
│   ├── GET    /api/files
│   ├── GET    /api/files/:uid
│   └── DELETE /api/files/:uid
├── Tasks Management
│   ├── GET    /api/tasks
│   ├── GET    /api/tasks/:uid
│   ├── POST   /api/tasks/proceed
│   ├── POST   /api/tasks/retry
│   └── POST   /api/tasks/handle-process
└── Settings
    ├── GET   /api/settings
    └── PATCH /api/settings
```

## Microservice Processing Pipeline

```
Microservice (Celery)
├── Event Listener
│   └── Listens to RabbitMQ 'tasks' topic
│       ├── proceed_task
│       ├── retry_step
│       └── handle_process
├── Task Processor
│   ├── 1. Reading Dataset
│   ├── 2. Data Cleaning
│   ├── 3. LLM Analysis
│   ├── 4. Append Columns
│   └── 5. Save Results
└── Status Updates
    └── Emit events to RabbitMQ
```

## Component Communication

### Frontend to Backend

- REST API (HTTP/HTTPS)
- JSON format
- JWT Bearer Token authentication

### Backend to RabbitMQ

- AMQP protocol
- Topic: 'tasks'
- Publishes: proceed_task events
- Subscribes: status updates

### Microservice to RabbitMQ

- AMQP protocol
- Topic: 'tasks'
- Subscribes: proceed_task events
- Publishes: status updates

### Frontend to RabbitMQ

- AMQP (WebSocket connection)
- Topic: 'tasks'
- Subscribes: status updates

### Backend to MongoDB

- MongoDB Native Driver
- CRUD operations
- Query operations

### Microservice to MongoDB

- PyMongo (MongoDB Python Driver)
- Update task status
- Read task information

### Backend to Storage

- File System Operations
- Save uploaded files
- Read file metadata

### Microservice to Storage

- File System Operations
- Read CSV files
- Write processed files

### Microservice to Ollama

- HTTP REST API
- Send data batches
- Receive analysis results

---

[Back to Documentation Index](./README.md)

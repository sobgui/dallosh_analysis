# Sequence Diagrams

This document contains all sequence diagrams and data flow diagrams for the Dallosh Analysis platform.

## Table of Contents

- [User Authentication Flow](#user-authentication-flow)
- [File Upload & Task Creation Flow](#file-upload--task-creation-flow)
- [Task Processing Flow](#task-processing-flow)
- [Real-time Updates Flow](#real-time-updates-flow)

## User Authentication Flow

```
Frontend                    Backend                     MongoDB
    │                           │                           │
    │  POST /api/auth/login     │                           │
    │──────────────────────────►│                           │
    │                           │  Verify credentials       │
    │                           │──────────────────────────►│
    │                           │  User data                │
    │                           │◄──────────────────────────│
    │  JWT Token                │                           │
    │◄──────────────────────────│                           │
    │                           │                           │
    │  Store token              │                           │
    │                           │                           │
```

## File Upload & Task Creation Flow

```
Frontend            Backend            Storage          MongoDB
    │                  │                  │                │
    │  Upload CSV      │                  │                │
    │─────────────────►│                  │                │
    │                  │  Save file       │                │
    │                  │─────────────────►│                │
    │                  │                  │                │
    │                  │  Create file     │                │
    │                  │  record          │                │
    │                  │──────────────────────────────────►│
    │                  │                  │                │
    │                  │  Create task     │                │
    │                  │  record          │                │
    │                  │──────────────────────────────────►│
    │                  │                  │                │
    │  File & Task     │                  │                │
    │  info            │                  │                │
    │◄─────────────────│                  │                │
    │                  │                  │                │
```

## Task Processing Flow

```
Frontend    Backend    RabbitMQ    Microservice    Storage    MongoDB    Ollama
    │          │           │            │            │          │          │
    │  Start   │           │            │            │          │          │
    │  Task    │           │            │            │          │          │
    │─────────►│           │            │            │          │          │
    │          │  Emit     │            │            │          │          │
    │          │  proceed  │            │            │          │          │
    │          │──────────►│            │            │          │          │
    │          │           │  Event     │            │          │          │
    │          │           │  received  │            │          │          │
    │          │           │───────────►│            │          │          │
    │          │           │            │  Read CSV  │          │          │
    │          │           │            │───────────►│          │          │
    │          │           │            │  Update    │          │          │
    │          │           │            │  status    │          │          │
    │          │           │            │──────────────────────►│          │
    │          │           │  Emit      │            │          │          │
    │          │           │◄───────────│            │          │          │
    │          │  Status   │            │            │          │          │
    │          │◄──────────│            │            │          │          │
    │  Status  │           │            │            │          │          │
    │◄─────────│           │            │            │          │          │
    │          │           │            │  Clean     │          │          │
    │          │           │            │  data      │          │          │
    │          │           │            │───────────►│          │          │
    │          │           │            │  Send to   │          │          │
    │          │           │            │  Ollama    │          │          │
    │          │           │            │───────────────────────────────►│
    │          │           │            │  Save      │          │          │
    │          │           │            │  results   │          │          │
    │          │           │            │───────────►│          │          │
    │          │           │  Emit done │            │          │          │
    │          │           │◄───────────│            │          │          │
    │  Task    │           │            │            │          │          │
    │  Complete│           │            │            │          │          │
    │◄─────────│           │            │            │          │          │
```

## Real-time Updates Flow

```
Frontend                    RabbitMQ                    Microservice
    │                           │                           │
    │  Connect to RabbitMQ      │                           │
    │──────────────────────────►│                           │
    │                           │                           │
    │  Subscribe to 'tasks'     │                           │
    │  topic                    │                           │
    │                           │                           │
    │                           │  Task events              │
    │                           │◄──────────────────────────│
    │                           │  (status updates)         │
    │                           │                           │
    │  Receive real-time        │                           │
    │  status updates           │                           │
    │◄──────────────────────────│                           │
    │                           │                           │
    │  Update UI                │                           │
    │                           │                           │
```

---

[Back to Documentation Index](./README.md)

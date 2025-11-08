# Architecture Documentation

This document provides detailed architecture information for the Dallosh Analysis platform.

## Table of Contents

- [System Architecture Overview](#system-architecture-overview)
- [Component Connections](#component-connections)
- [Technology Stack](#technology-stack)
- [Deployment Architecture](#deployment-architecture)

## System Architecture Overview

### High-Level Architecture

The Dallosh Analysis platform follows a microservices architecture with the following components:

- **Frontend**: Next.js application for user interface
- **Backend**: Express.js API server
- **Microservice**: Python Celery worker for task processing
- **Message Broker**: RabbitMQ for event-driven communication
- **Database**: MongoDB for data storage
- **Storage**: Local file system for file storage (can be external provider)
- **LLM Service**: Ollama for AI processing (can be external provider)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Dallosh Analysis Platform                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │     Frontend        │
                              │    (Next.js)        │
                              │    Port: 3006       │
                              └──────────┬──────────┘
                                         │
                      ┌──────────────────┼──────────────────┐
                      │                  │                  │
                REST API                 │            RabbitMQ Subscribe
                      │                  │                  │
            ┌─────────▼─────────┐       │       ┌──────────▼──────────┐
            │                   │       │       │                     │
            │     Backend       │       │       │   RabbitMQ Server   │
            │   (Express.js)    │       │       │   Port: 5672        │
            │    Port: 5006     │       │       │   Topic: 'tasks'    │
            │                   │       │       │                     │
            │  Connected to:    │       │       └──────────┬──────────┘
            │  • MongoDB        │       │                  │
            │  • Storage        │       │            RabbitMQ Publish
            │  • RabbitMQ       │       │                  │
            └───────┬───────┬───┘       │       ┌──────────▼──────────┐
                    │       │           │       │                     │
                    │       │           │       │   Microservice      │
                    │       │           │       │   (Celery)          │
                    │       │           │       │                     │
                    │       │           │       │  Connected to:      │
                    │       │           │       │  • RabbitMQ         │
                    │       │           │       │  • MongoDB          │
                    │       │           │       │  • Storage          │
                    │       │           │       │  • LLM (Ollama)     │
                    │       │           │       └───────┬───────┬─────┘
                    │       │           │               │       │
                    │       │           │               │       │
                    │       │           │               │       │
                    │       │           │               │       │
        ┌───────────┼───────┼───────────┼───────────────┼───────┼───────────┐
        │           │       │           │               │       │           │
        │           │       │           │               │       │           │
        ▼           ▼       │           │               ▼       ▼           │
    ┌────────┐ ┌────────┐  │           │          ┌────────┐ ┌────────┐    │
    │ MongoDB│ │ Storage│  │           │          │ MongoDB│ │ Storage│    │
    │ Port:  │ │(Shared)│  │           │          │ Port:  │ │(Shared)│    │
    │ 27017  │ │        │  │           │          │ 27017  │ │        │    │
    │        │ │•datasets│ │           │          │        │ │•cleaned│    │
    │        │ │•cleaned │ │           │          │        │ │•analysed│   │
    │        │ │•analysed│ │           │          │        │ │        │    │
    └────────┘ └────────┘  │           │          └────────┘ └────────┘    │
        ▲           ▲       │           │              ▲           ▲        │
        │           │       │           │              │           │        │
        │           │       │           │              │           │        │
        └───────────┴───────┴───────────┴──────────────┴───────────┘        │
                           │                                                │
                           │          ┌──────────────────────────────────────┘
                           │          │
                           │          │
                    ┌──────▼──────────▼───────┐
                    │                         │
                    │   SHARED RESOURCES      │
                    │                         │
                    │   MongoDB (Port: 27017) │
                    │   └─ Used by: Backend   │
                    │       Used by: Microservice
                    │                         │
                    │   Storage (Shared)      │
                    │   └─ Used by: Backend   │
                    │       Used by: Microservice
                    │                         │
                    │   RabbitMQ (Port: 5672) │
                    │   └─ Connects: Frontend │
                    │       Connects: Backend │
                    │       Connects: Microservice
                    │                         │
                    │   LLM (Ollama: 11434)   │
                    │   └─ Used by: Microservice only
                    │                         │
                    └─────────────────────────┘
```

## Component Connections

### Frontend Connections

**RabbitMQ:**
- Real-time event subscription for task status updates
- Subscribes to 'tasks' topic
- Receives real-time status updates

**Backend:**
- REST API calls for authentication
- File management operations
- Task management operations
- User management operations

### Backend Connections

**MongoDB:**
- Database operations (users, roles, files, tasks, logs, settings)
- CRUD operations
- Query operations
- Aggregation operations

**RabbitMQ:**
- Event messaging (sending proceed_task events, receiving status updates)
- Publishing events
- Subscribing to events
- Real-time communication

**Storage:**
- File operations (saving uploaded CSV files to storage/datasets/)
- File reading
- File deletion
- File metadata management
- Can be local file system or external provider (S3, Azure Blob, etc.)

### Microservice Connections

**RabbitMQ:**
- Event messaging (receiving proceed_task events, sending status updates)
- Subscribing to events
- Publishing status updates
- Event-driven processing

**MongoDB:**
- Database operations (updating task status and metadata)
- Task status updates
- Task metadata updates
- Task query operations

**Storage:**
- File operations (reading from storage/datasets/, writing to storage/cleaned/ and storage/analysed/)
- File reading
- File writing
- File management
- Can be local file system or external provider (S3, Azure Blob, etc.)

**LLM Service:**
- LLM processing (sentiment analysis, priority extraction, topic extraction)
- Batch processing
- Response handling
- Error handling
- Can be Ollama (local) or external provider (OpenAI, Anthropic, etc.)

## Technology Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Accessible component library
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **AMQP Lib** - RabbitMQ client for real-time updates
- **PapaParse** - CSV parsing

### Backend

- **Express.js 5** - Web application framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **AMQP Lib** - RabbitMQ integration
- **bcryptjs** - Password hashing
- **PapaParse** - CSV parsing

### Microservices

- **Python 3.10+** - Programming language
- **Celery** - Distributed task queue
- **RabbitMQ** - Message broker
- **Pandas** - Data manipulation
- **Ollama** - LLM API client
- **Pika** - RabbitMQ Python client
- **PyMongo** - MongoDB driver
- **Pytest** - Testing framework

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Traefik** - Reverse proxy (production)
- **MongoDB** - Database
- **RabbitMQ** - Message broker
- **Ollama** - LLM server

## Deployment Architecture

### Development Environment

```
Frontend (localhost:3006)
    │
    ├──► Backend (localhost:5006)
    │       ├──► MongoDB (localhost:27017)
    │       ├──► Storage (./storage)
    │       └──► RabbitMQ (localhost:5672)
    │
    └──► RabbitMQ (localhost:5672)

Microservice
    ├──► RabbitMQ (localhost:5672)
    ├──► MongoDB (localhost:27017)
    ├──► Storage (./storage)
    └──► Ollama (localhost:11434)
```

### Production Environment

```
Traefik (Reverse Proxy)
    │
    ├──► Frontend (Container)
    ├──► Backend (Container)
    └──► RabbitMQ (Container)

Microservice (Container)
    ├──► RabbitMQ (Container)
    ├──► MongoDB (Container)
    ├──► Storage (Volume/External)
    └──► LLM Service (Container/External API)
```

### Container Architecture

- **Frontend Container**: Next.js application
- **Backend Container**: Express.js API server
- **Microservice Container**: Python Celery worker
- **MongoDB Container**: Database server
- **RabbitMQ Container**: Message broker
- **LLM Service Container**: Ollama server (or external API)
- **Traefik Container**: Reverse proxy (production)

### Storage Architecture

- **Shared Storage Volume**: Mounted to Backend and Microservice containers
- **Datasets Directory**: Original uploaded files
- **Cleaned Directory**: Cleaned dataset files
- **Analysed Directory**: Processed dataset files
- **External Storage**: Can be configured to use S3, Azure Blob, or other providers

---

[Back to Documentation Index](./README.md)

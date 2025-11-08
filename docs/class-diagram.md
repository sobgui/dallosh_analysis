# Class Diagram

This document describes the class structure and relationships in the Dallosh Analysis platform.

## Table of Contents

- [Backend Classes](#backend-classes)
- [Frontend Classes](#frontend-classes)
- [Microservice Classes](#microservice-classes)
- [Class Relationships](#class-relationships)

## Backend Classes

### Core Classes

#### BaseController
Base class for all API controllers.

#### BaseService
Base class for all services.

#### DatabaseAdapter
Abstract database adapter interface.

#### MongoDBAdapter
MongoDB implementation of DatabaseAdapter.

### API Controllers

#### AuthController
Handles authentication operations.

#### UsersController
Handles user management operations.

#### FilesController
Handles file management operations.

#### TasksController
Handles task management operations.

#### SettingsController
Handles settings management operations.

### Services

#### AuthService
Handles authentication logic.

#### UsersService
Handles user management logic.

#### FilesService
Handles file management logic.

#### TasksService
Handles task management logic.

#### StorageService
Handles file storage operations.

#### RabbitMQService
Handles RabbitMQ messaging.

#### JWTService
Handles JWT token operations.

## Frontend Classes

### State Management

#### AuthStore
Manages authentication state.

#### TasksStore
Manages task state.

#### FilesStore
Manages file state.

### Services

#### APIService
Handles API communication.

#### RabbitMQService
Handles RabbitMQ WebSocket connection.

## Microservice Classes

### Core Classes

#### EventListener
Listens to RabbitMQ events.

#### TaskProcessor
Processes tasks.

#### DatabaseAdapter
Abstract database adapter interface.

#### MongoDBAdapter
MongoDB implementation of DatabaseAdapter.

#### StorageService
Handles file storage operations.

#### LLMService
Handles LLM operations.

#### RabbitMQService
Handles RabbitMQ messaging.

## Class Relationships

### Backend Relationships

- BaseController extended by all controllers
- BaseService extended by all services
- DatabaseAdapter implemented by MongoDBAdapter
- Controllers use Services
- Services use DatabaseAdapter and RabbitMQService

### Frontend Relationships

- Stores use APIService
- Stores use RabbitMQService

### Microservice Relationships

- EventListener uses RabbitMQService
- TaskProcessor uses DatabaseAdapter, StorageService, LLMService, RabbitMQService
- DatabaseAdapter implemented by MongoDBAdapter

---

[Back to Documentation Index](./README.md)

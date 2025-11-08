# API Documentation

This document describes the REST API structure for the Dallosh Analysis backend.

## Table of Contents

- [API Overview](#api-overview)
- [Authentication Endpoints](#authentication-endpoints)
- [Users Management Endpoints](#users-management-endpoints)
- [Files Management Endpoints](#files-management-endpoints)
- [Tasks Management Endpoints](#tasks-management-endpoints)
- [Settings Endpoints](#settings-endpoints)

## API Overview

**Base URL:** http://localhost:5006/api

**Authentication:** JWT Bearer Token

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

### POST /api/auth/login

Authenticate user and receive JWT token.

### POST /api/auth/refresh

Refresh JWT token.

### GET /api/auth/me

Get current authenticated user information.

## Users Management Endpoints

### GET /api/users

Get all users (Admin only).

### GET /api/users/:uid

Get user by UID (Admin only).

### POST /api/users

Create new user (Admin only).

### PATCH /api/users/:uid

Update user (Admin only).

### DELETE /api/users/:uid

Delete user (Admin only).

## Files Management Endpoints

### POST /api/files/upload

Upload a CSV file.

### GET /api/files

Get all uploaded files.

### GET /api/files/:uid

Get file by UID.

### DELETE /api/files/:uid

Delete file (Admin only).

## Tasks Management Endpoints

### GET /api/tasks

Get all tasks.

### GET /api/tasks/:uid

Get task by UID.

### POST /api/tasks/proceed

Start task processing.

### POST /api/tasks/retry

Retry failed task.

### POST /api/tasks/handle-process

Handle task process (pause/resume).

## Settings Endpoints

### GET /api/settings

Get application settings.

### PATCH /api/settings

Update application settings (Admin only).

---

[Back to Documentation Index](./README.md)

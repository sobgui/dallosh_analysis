# Use Cases

This document describes the use cases for the Dallosh Analysis platform.

## Table of Contents

- [Actor Overview](#actor-overview)
- [Use Cases](#use-cases)
  - [Authentication Use Cases](#authentication-use-cases)
  - [File Management Use Cases](#file-management-use-cases)
  - [Task Management Use Cases](#task-management-use-cases)
  - [Administration Use Cases](#administration-use-cases)

## Actor Overview

### Primary Actors

1. **Data Analyst**
   - Primary user of the system
   - Uploads CSV files
   - Monitors task processing
   - Views analysis results

2. **Administrator**
   - Manages users
   - Configures system settings
   - Monitors system health
   - Manages files and tasks

## Use Cases

### Authentication Use Cases

#### UC-1: User Login

1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System generates JWT token
5. System returns token to user
6. User is redirected to dashboard

#### UC-2: User Logout

1. User clicks logout button
2. System invalidates JWT token
3. System clears user session
4. User is redirected to login page

### File Management Use Cases

#### UC-3: Upload CSV File

1. User navigates to file upload page
2. User selects CSV file
3. System validates file
4. System saves file to storage
5. System creates file record in database
6. System creates task record
7. System displays success message

#### UC-4: View File List

1. User navigates to file list page
2. System retrieves files from database
3. System displays files in table

#### UC-5: Delete File

1. Administrator selects file to delete
2. System confirms deletion
3. System deletes file from storage
4. System deletes file record from database

### Task Management Use Cases

#### UC-6: Start Task Processing

1. User selects task to process
2. User clicks "Start Task" button
3. System validates task status
4. System publishes proceed_task event to RabbitMQ
5. System updates task status to processing
6. Microservice receives event and starts processing

#### UC-7: Monitor Task Progress

1. User navigates to task details page
2. System displays task status
3. System subscribes to RabbitMQ events
4. System receives real-time updates
5. System updates progress bar

#### UC-8: View Task Results

1. User navigates to task details page
2. System retrieves task information
3. System displays analysis results
4. System displays charts and visualizations

### Administration Use Cases

#### UC-11: Manage Users

1. Administrator navigates to users page
2. System displays user list
3. Administrator can create, update, or delete users
4. System validates user data
5. System updates database

#### UC-12: Configure System Settings

1. Administrator navigates to settings page
2. System displays current settings
3. Administrator updates settings
4. System validates settings
5. System updates database

---

[Back to Documentation Index](./README.md)

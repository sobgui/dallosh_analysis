# Database Schema

This document describes the MongoDB database schema for the Dallosh Analysis platform.

## Table of Contents

- [Database Overview](#database-overview)
- [Collections](#collections)
  - [users](#users)
  - [roles](#roles)
  - [files](#files)
  - [tasks](#tasks)
  - [logs](#logs)
  - [settings](#settings)

## Database Overview

**Database Name:** dallosh_analysis

**Database Type:** MongoDB

**Port:** 27017

## Collections

### users

Stores user account information.

```
{
  uid: String,
  data: {
    email: String,
    password: String,
    roleId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### roles

Stores user roles and permissions.

```
{
  uid: String,
  data: {
    name: String,
    description: String,
    permissions: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### files

Stores information about uploaded dataset files.

```
{
  uid: String,
  data: {
    filename: String,
    size: Number,
    file_path: String,
    extension: String,
    type: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### tasks

Stores task processing information and status.

```
{
  uid: String,
  data: {
    file_id: String,
    file_path: String,
    status: String,
    file_cleaned: {
      path: String,
      type: String
    },
    file_analysed: {
      path: String,
      type: String
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### logs

Stores activity logs for system auditing.

```
{
  uid: String,
  data: {
    method: String,
    path: String,
    response: Number,
    requested_by: String
  },
  createdAt: Date
}
```

### settings

Stores application settings and configuration.

```
{
  uid: String,
  data: {
    general: Object,
    ai: {
      preferences: Object,
      local: Array,
      external: Array
    },
    storage: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

[Back to Documentation Index](./README.md)

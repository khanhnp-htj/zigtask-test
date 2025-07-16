# ZigTask API Documentation

## Overview
The ZigTask API is built with NestJS and provides a complete RESTful interface for task management with real-time WebSocket updates, JWT authentication, and PostgreSQL persistence.

## 🌐 Base URL
- **Development**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/api/docs` (Swagger)

## 🔐 Authentication

### JWT Token Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Auth Endpoints

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /auth/signin
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

## 📋 Task Management Endpoints

### GET /tasks
Retrieve all tasks for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by task status (`TODO`, `IN_PROGRESS`, `DONE`)
- `search` (optional): Search in title and description
- `from` (optional): Filter tasks from date (ISO string)
- `to` (optional): Filter tasks to date (ISO string)

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Complete API Documentation",
    "description": "Write comprehensive API docs for all endpoints",
    "status": "IN_PROGRESS",
    "dueDate": "2024-01-20T23:59:59.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z",
    "userId": 1
  }
]
```

### POST /tasks
Create a new task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Task Title",
  "description": "Task description here",
  "status": "TODO",
  "dueDate": "2024-01-25T23:59:59.000Z"
}
```

**Response (201):**
```json
{
  "id": 2,
  "title": "New Task Title",
  "description": "Task description here",
  "status": "TODO",
  "dueDate": "2024-01-25T23:59:59.000Z",
  "createdAt": "2024-01-16T15:00:00.000Z",
  "updatedAt": "2024-01-16T15:00:00.000Z",
  "userId": 1
}
```

### GET /tasks/:id
Retrieve a specific task by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Complete API Documentation",
  "description": "Write comprehensive API docs for all endpoints",
  "status": "IN_PROGRESS",
  "dueDate": "2024-01-20T23:59:59.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:20:00.000Z",
  "userId": 1
}
```

### PATCH /tasks/:id
Update an existing task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (partial update):**
```json
{
  "title": "Updated Task Title",
  "status": "DONE"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Updated Task Title",
  "description": "Write comprehensive API docs for all endpoints",
  "status": "DONE",
  "dueDate": "2024-01-20T23:59:59.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T16:45:00.000Z",
  "userId": 1
}
```

### DELETE /tasks/:id
Delete a task by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content returned.

## 🔄 WebSocket Events

### Connection
Connect to WebSocket server:
```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client → Server Events

**`join-room`**
Join user-specific room for task updates:
```javascript
socket.emit('join-room', { userId: 1 });
```

**`task-update`**
Real-time task status update:
```javascript
socket.emit('task-update', {
  taskId: 1,
  status: 'DONE'
});
```

#### Server → Client Events

**`task-created`**
Broadcast when new task is created:
```javascript
socket.on('task-created', (task) => {
  console.log('New task created:', task);
});
```

**`task-updated`**
Broadcast when task is updated:
```javascript
socket.on('task-updated', (task) => {
  console.log('Task updated:', task);
});
```

**`task-deleted`**
Broadcast when task is deleted:
```javascript
socket.on('task-deleted', (taskId) => {
  console.log('Task deleted:', taskId);
});
```

## 📊 Data Models

### User Entity
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  password: string; // Hashed with bcrypt
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}
```

### Task Entity
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: User;
}
```

## ⚠️ Error Responses

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Authentication Errors
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Validation Errors
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "error": "Unprocessable Entity",
  "details": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "email must be a valid email"
      }
    }
  ]
}
```

## 🔧 Request/Response Examples

### Complete Task Creation Flow
```bash
# 1. Register user
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "username": "john"
  }'

# 2. Get token from response and create task
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Learn Docker",
    "description": "Complete Docker tutorial",
    "status": "TODO",
    "dueDate": "2024-01-30T23:59:59.000Z"
  }'

# 3. Update task status
curl -X PATCH http://localhost:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

## 🛡️ Security Features

### Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Minimum password length: 6 characters

### JWT Configuration
- Secret key from environment variable
- Token expiration: 24 hours (configurable)
- Payload includes user ID and email

### CORS Configuration
- Configured for development and production environments
- Supports credentials for WebSocket connections

### Input Validation
- All inputs validated using class-validator
- SQL injection protection via TypeORM
- XSS protection through input sanitization

## 📈 Performance Features

### Database Optimization
- Indexed columns for frequent queries
- Optimized queries with select specific fields
- Connection pooling configured

### Caching
- JWT verification caching
- Database query optimization
- Static asset caching

## 🧪 Testing Endpoints

### Using Swagger UI
Visit `http://localhost:8000/api/docs` for interactive API testing.

### Using Postman
Import the API collection:
```json
{
  "info": {
    "name": "ZigTask API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": {
      "token": "{{jwt_token}}"
    }
  }
}
```

### Environment Variables for Testing
```
API_BASE_URL=http://localhost:8000
JWT_TOKEN={{your_token_here}}
```

## 🔍 Debugging and Monitoring

### Logging
- All requests logged with Winston
- Error tracking with stack traces
- Performance monitoring for slow queries

### Health Check
```bash
curl http://localhost:8000/health
```

### Database Debugging
```bash
# Connect to database
docker exec -it test-db-1 psql -U zigtask -d zigtask

# Check tables
\dt

# Query tasks
SELECT * FROM task;
```

---

*For more detailed API interaction examples, refer to the frontend implementation in `zigtask-client/src/services/` and mobile implementation in `zigtask-mobile/src/services/`.* 
# ZigTask - Full-Stack Task Management Application

A comprehensive task management application built with modern technologies, featuring a React web client, NestJS API backend, React Native mobile app, and Docker containerization.

## 🚀 Features

### ✅ Core Functionality
- **Task CRUD Operations** - Create, read, update, and delete tasks
- **Priority System** - Low (🟢), Medium (🟡), High (🔴) priority levels with color coding
- **Status Management** - To Do, In Progress, Done workflow
- **User Authentication** - JWT-based authentication system
- **Drag & Drop Interface** - Intuitive task management with drag and drop between columns
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### 🔧 Technical Features
- **TypeScript** - Full type safety across all applications
- **Docker Ready** - Complete containerization setup
- **Database Integration** - PostgreSQL with TypeORM
- **API Documentation** - Swagger/OpenAPI documentation
- **Modern UI** - Tailwind CSS with clean, intuitive design
- **Cross-Platform** - Web, mobile, and containerized deployment
- **Reliable Performance** - Optimized for stability and performance

## 🏗️ Architecture

```
ZigTask/
├── zigtask-api/          # NestJS Backend API
├── zigtask-client/       # React Web Application
├── zigtask-mobile/       # React Native Mobile App
└── docker/              # Docker Configuration
```

## 🛠️ Technology Stack

### Backend (zigtask-api)
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Database ORM with PostgreSQL
- **JWT** - Authentication & authorization
- **Swagger** - API documentation

### Frontend (zigtask-client)
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **React Hot Toast** - User notifications
- **DnD Kit** - Drag and drop functionality

### Mobile (zigtask-mobile)
- **React Native** - Cross-platform mobile development
- **Expo** - Development and build toolchain
- **TypeScript** - Type-safe mobile development
- **Native Navigation** - Smooth mobile experience

### Infrastructure
- **Docker** - Containerization
- **PostgreSQL** - Relational database
- **Nginx** - Web server for frontend

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if running locally)

### 1. Clone the Repository
```bash
git clone git@github.com:khanhnp-htj/zigtask-test.git
cd zigtask-test
```

### 2. Docker Setup (Recommended)
```bash
cd docker
docker compose up -d
```

The application will be available at:
- **Web App**: http://localhost:8080
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

### 3. Local Development Setup

#### Backend API
```bash
cd zigtask-api
npm install
# Set up environment variables (see docker/api.env for reference)
npm run start:dev
```

#### Frontend Web App
```bash
cd zigtask-client
npm install
npm start
```

#### Mobile App
```bash
cd zigtask-mobile
npm install
npx expo start
```

## 📱 Priority Feature

The application includes a comprehensive priority system:

### Priority Levels
- **🟢 Low Priority** - Non-urgent tasks
- **🟡 Medium Priority** - Standard tasks (default)
- **🔴 High Priority** - Urgent tasks

### Features
- **Visual Indicators** - Color-coded priority badges
- **Dropdown Selection** - Easy priority assignment during task creation/editing
- **Filtering** - Filter tasks by priority level
- **Default Priority** - New tasks default to Medium priority
- **Database Persistence** - Priorities are stored and maintained across sessions

## 🔧 Development

### API Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User authentication
- `GET /tasks` - Get user tasks (with optional priority filtering)
- `GET /tasks/by-status` - Get tasks grouped by status
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Database Schema
```sql
-- Tasks table with priority enum
CREATE TYPE tasks_priority_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE tasks_status_enum AS ENUM ('todo', 'in_progress', 'done');

ALTER TABLE tasks ADD COLUMN priority tasks_priority_enum DEFAULT 'medium' NOT NULL;
ALTER TABLE tasks ADD COLUMN status tasks_status_enum DEFAULT 'todo' NOT NULL;
```

## 🐳 Docker Configuration

The application includes a complete Docker setup:

- **API Container** - NestJS backend
- **Client Container** - React frontend with Nginx
- **Database Container** - PostgreSQL with persistent data

### Environment Variables
Check `docker/api.env` and `docker/client.env` for configuration options.

## 📚 API Documentation

When the API is running, visit http://localhost:8000/api/docs for interactive Swagger documentation.

## 🔍 Troubleshooting

### Common Issues

1. **Blank Page After Login**
   - Ensure all containers are running: `docker compose ps`
   - Check for JavaScript errors in browser console
   - Verify API connectivity

2. **Priority Not Showing**
   - Ensure database schema includes priority column
   - Check that frontend has latest build with priority support

3. **CORS Issues**
   - Verify API CORS configuration allows your client URL
   - Check that CLIENT_URL environment variable is set correctly

4. **Duplicate Task Creation (Resolved)**
   - This issue was caused by React.StrictMode in development
   - Fixed by removing React.StrictMode from index.tsx
   - Tasks now create exactly once as expected

## 🛡️ Known Issues & Solutions

### React.StrictMode and Development Mode
The application has been optimized for production deployment. In development, React.StrictMode was causing duplicate function calls leading to duplicate task creation. This has been resolved by removing React.StrictMode.

### Performance Optimizations
- **Lightweight Architecture**: WebSocket functionality was removed from all applications (web, mobile, backend) to eliminate complexity and improve reliability
- **Efficient State Management**: Zustand provides lightweight and fast state updates
- **Optimized API Calls**: RESTful architecture ensures predictable and reliable data operations across all platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Repository**: https://github.com/khanhnp-htj/zigtask-test
- **Issues**: https://github.com/khanhnp-htj/zigtask-test/issues

---

Built with ❤️ using modern web technologies 
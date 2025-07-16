# ZigTask Docker Architecture Documentation

## Overview
ZigTask uses a containerized microservices architecture with Docker and Docker Compose for development and deployment. All Docker configuration is centralized in the `/docker` folder for better organization and GitHub management.

## 🏗️ Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │    │   (NestJS)      │    │   (PostgreSQL)  │
│   Port: 8080    │    │   Port: 8000    │    │   Port: 5433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────┐
         │            Docker Network                    │
         │           zigtask-network                   │
         └─────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────┐
         │         Mobile Development                   │
         │         (React Native/Expo)                 │
         │         Ports: 19000-19002                  │
         └─────────────────────────────────────────────┘
```

## 📁 Docker File Structure

```
docker/
├── docker-compose.yml          # Main orchestration file
├── api.env                     # Backend environment variables
├── client.env                  # Frontend environment variables
├── mobile.env                  # Mobile development environment (optional)
└── memory-bank/               # Complete project documentation
    ├── DOCKER_ARCHITECTURE.md # This file
    ├── API_DOCUMENTATION.md   # Backend API docs
    ├── DEPLOYMENT_GUIDE.md    # Deployment instructions
    └── TROUBLESHOOTING.md     # Common issues and solutions
```

## 🐳 Docker Services

### 1. Database Service (`db`)
- **Image**: `postgres:15`
- **Purpose**: Primary data storage for the application
- **Ports**: `5433:5432` (external:internal)
- **Volumes**: Persistent storage for database data
- **Network**: `zigtask-network`

**Configuration:**
```yaml
db:
  image: postgres:15
  restart: always
  environment:
    POSTGRES_USER: zigtask
    POSTGRES_PASSWORD: zigtaskpass
    POSTGRES_DB: zigtask
  ports:
    - '5433:5432'
  volumes:
    - db_data:/var/lib/postgresql/data
  networks:
    - zigtask-network
```

### 2. API Service (`api`)
- **Build**: Multi-stage Dockerfile in `zigtask-api/`
- **Purpose**: Backend REST API and WebSocket server
- **Ports**: `8000:5000` (external:internal)
- **Dependencies**: `db` service
- **Network**: `zigtask-network`

**Key Features:**
- JWT authentication
- Real-time WebSocket updates
- PostgreSQL integration with TypeORM
- Swagger API documentation
- Hot reload support in development

**Configuration:**
```yaml
api:
  build:
    context: ../zigtask-api
    dockerfile: Dockerfile
  env_file:
    - ./api.env
  ports:
    - '8000:5000'
  depends_on:
    - db
  volumes:
    - ../zigtask-api:/app      # Development hot reload
    - /app/node_modules        # Prevent host overwrite
```

### 3. Client Service (`client`)
- **Build**: Production-ready Nginx setup in `zigtask-client/`
- **Purpose**: React web application
- **Ports**: `8080:80` (external:internal)
- **Dependencies**: `api` service
- **Network**: `zigtask-network`

**Key Features:**
- Production-optimized React build
- Nginx reverse proxy configuration
- Environment variable injection
- Static asset serving

**Configuration:**
```yaml
client:
  build:
    context: ../zigtask-client
    dockerfile: Dockerfile
  env_file:
    - ./client.env
  ports:
    - '8080:80'
  depends_on:
    - api
```

### 4. Mobile Development Service (`mobile-dev`)
- **Build**: Development Dockerfile in `zigtask-mobile/`
- **Purpose**: React Native/Expo development server
- **Ports**: `19000-19002` (Expo development ports)
- **Dependencies**: `api` service
- **Network**: `zigtask-network`

**Key Features:**
- Expo CLI development server
- Hot reload and live updating
- Tunnel support for physical device testing
- Shared codebase with API integration

**Configuration:**
```yaml
mobile-dev:
  build:
    context: ../zigtask-mobile
    dockerfile: Dockerfile.dev
  ports:
    - '19000:19000'  # Expo dev server
    - '19001:19001'  # Expo dev tools
    - '19002:19002'  # Expo tunnel
  environment:
    - EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
    - REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
  volumes:
    - ../zigtask-mobile:/app
    - /app/node_modules
```

## 🔧 Development Workflow

### Quick Start
```bash
# Navigate to project root
cd /path/to/zigtask

# Start all services
docker-compose -f docker/docker-compose.yml up --build

# Or run in background
docker-compose -f docker/docker-compose.yml up -d --build
```

### Individual Service Management
```bash
# Start only database and API
docker-compose -f docker/docker-compose.yml up db api

# Start only web development stack
docker-compose -f docker/docker-compose.yml up db api client

# Start mobile development
docker-compose -f docker/docker-compose.yml up db api mobile-dev
```

### Development Commands
```bash
# View logs
docker-compose -f docker/docker-compose.yml logs -f [service-name]

# Execute commands in running containers
docker-compose -f docker/docker-compose.yml exec api npm run test
docker-compose -f docker/docker-compose.yml exec client npm run lint

# Restart specific service
docker-compose -f docker/docker-compose.yml restart api

# Rebuild specific service
docker-compose -f docker/docker-compose.yml build --no-cache api
```

## 🌐 Network Configuration

### Internal Communication
- All services communicate via the `zigtask-network` Docker network
- Services reference each other by service name (e.g., `api`, `db`)
- Internal ports are used for service-to-service communication

### External Access
- **Web App**: http://localhost:8080
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **Database**: localhost:5433
- **Mobile Dev**: http://localhost:19000

## 📦 Volume Management

### Persistent Volumes
- `db_data`: PostgreSQL data persistence
- Survives container restarts and rebuilds

### Development Volumes
- Source code mounted for hot reload
- `node_modules` volumes prevent host conflicts

### Volume Commands
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect test_db_data

# Remove volumes (WARNING: Data loss)
docker-compose -f docker/docker-compose.yml down -v
```

## 🚀 Production Considerations

### Environment Variables
- Use Docker secrets for sensitive data
- Override environment files for different environments
- Validate all required variables are set

### Scaling
- Database: Consider read replicas for heavy workloads
- API: Horizontal scaling with load balancer
- Client: CDN integration for static assets

### Security
- Remove development volumes in production
- Use multi-stage builds to minimize image size
- Implement proper secret management
- Regular security updates for base images

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and test
        run: |
          docker-compose -f docker/docker-compose.yml build
          docker-compose -f docker/docker-compose.yml run --rm api npm test
```

## 📊 Monitoring and Logs

### Log Management
```bash
# Follow logs for all services
docker-compose -f docker/docker-compose.yml logs -f

# Specific service logs
docker-compose -f docker/docker-compose.yml logs -f api

# Export logs
docker-compose -f docker/docker-compose.yml logs > application.log
```

### Health Checks
Consider adding health checks to services:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🛡️ Best Practices

### Development
1. Use `.dockerignore` files to exclude unnecessary files
2. Keep images small with multi-stage builds
3. Use specific version tags, avoid `latest`
4. Implement proper error handling and logging
5. Use environment variables for configuration

### Security
1. Run containers as non-root users
2. Use Docker secrets for sensitive data
3. Regularly update base images
4. Scan images for vulnerabilities
5. Implement proper network segmentation

### Performance
1. Optimize Dockerfile layer caching
2. Use `.dockerignore` to reduce build context
3. Implement health checks for better orchestration
4. Monitor resource usage and set limits
5. Use multi-stage builds for production optimizations

---

*This architecture provides a scalable, maintainable foundation for the ZigTask application with clear separation of concerns and easy development workflow.* 
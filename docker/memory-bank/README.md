# ZigTask Memory Bank 📚

## Overview
Welcome to the ZigTask Memory Bank - a comprehensive documentation repository containing everything you need to understand, develop, deploy, and maintain the ZigTask application ecosystem.

## 🗂️ Documentation Structure

### Core Documentation
| Document | Description | Use Case |
|----------|-------------|----------|
| **[DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)** | Complete Docker architecture guide | Understanding containerization, development workflow |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Comprehensive API reference | Backend integration, endpoint documentation |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Multi-environment deployment strategies | Production deployment, CI/CD setup |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues and solutions | Debugging, problem resolution |

### Historical Documentation
| Document | Description | 
|----------|-------------|
| **[README.md](README.md)** | Original project overview |
| **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** | Full-stack refactoring documentation |

## 🚀 Quick Navigation

### For New Developers
1. Start with **[DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)** to understand the system
2. Follow the quick start guide below
3. Reference **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** for backend integration
4. Use **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** when issues arise

### For DevOps/Deployment
1. Review **[DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)** for container structure
2. Follow **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for your target environment
3. Set up monitoring and logging as described in the deployment guide

### For Maintenance
1. Use **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for issue resolution
2. Reference **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** for endpoint details
3. Check **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** for architectural decisions

## 🎯 Quick Start Guide

### Prerequisites
- Docker Desktop installed and running
- Git for cloning repository
- 8GB+ RAM recommended
- Ports 8080, 8000, 5433, 19000-19002 available

### 1. Clone and Start
```bash
# Clone the repository
git clone <your-repo-url>
cd zigtask

# Start all services (from project root)
docker-compose -f docker/docker-compose.yml up --build
```

### 2. Access Applications
- **Web Frontend**: http://localhost:8080
- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Database**: localhost:5433 (PostgreSQL)
- **Mobile Development**: http://localhost:19000

### 3. Verify Installation
```bash
# Check all services are running
docker-compose -f docker/docker-compose.yml ps

# View logs if needed
docker-compose -f docker/docker-compose.yml logs -f
```

### 4. Create Test Account
1. Visit http://localhost:8080
2. Click "Sign Up" 
3. Create account with email/password
4. Start creating tasks!

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ZigTask Ecosystem                     │
├─────────────────────┬─────────────────┬─────────────────┤
│   Web Frontend      │   Backend API   │   Database      │
│   React + TypeScript│   NestJS        │   PostgreSQL    │
│   Port: 8080        │   Port: 8000    │   Port: 5433    │
└─────────────────────┼─────────────────┼─────────────────┘
                      │                 │
┌─────────────────────┴─────────────────┴─────────────────┐
│              Mobile Development                          │
│              React Native + Expo                        │
│              Ports: 19000-19002                         │
└─────────────────────────────────────────────────────────┘
```

### Key Features
- **Full-Stack TypeScript**: Type safety across all applications
- **Real-time Updates**: WebSocket integration for live task updates
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Tailwind CSS with Headless UI components
- **Robust API**: RESTful with Swagger documentation
- **Containerized**: Docker-based development and deployment

## 📁 Refactored File Structure

```
ZigTask/
├── docker/                          # 🐳 All Docker configuration
│   ├── docker-compose.yml           # Main orchestration
│   ├── api.env                      # Backend environment
│   ├── client.env                   # Frontend environment
│   └── memory-bank/                 # 📚 Complete documentation
│       ├── README.md                # This file
│       ├── DOCKER_ARCHITECTURE.md   # Container architecture
│       ├── API_DOCUMENTATION.md     # API reference
│       ├── DEPLOYMENT_GUIDE.md      # Deployment strategies
│       ├── TROUBLESHOOTING.md       # Issue resolution
│       ├── README.md                # Original project docs
│       └── REFACTORING_SUMMARY.md   # Refactoring history
├── zigtask-api/                     # 🔧 NestJS Backend
│   ├── src/                         # Source code
│   ├── Dockerfile                   # API container config
│   └── package.json                 # Dependencies
├── zigtask-client/                  # 🌐 React Frontend
│   ├── src/                         # Source code
│   ├── Dockerfile                   # Client container config
│   └── package.json                 # Dependencies
├── zigtask-mobile/                  # 📱 React Native App
│   ├── src/                         # Source code
│   ├── Dockerfile.dev               # Mobile dev container
│   └── package.json                 # Dependencies
└── README.md                        # Main project README
```

## 💡 Development Workflow

### Daily Development
```bash
# Start development environment
docker-compose -f docker/docker-compose.yml up -d

# View specific service logs
docker-compose -f docker/docker-compose.yml logs -f api

# Restart a service after changes
docker-compose -f docker/docker-compose.yml restart client

# Stop everything
docker-compose -f docker/docker-compose.yml down
```

### Individual Service Development
```bash
# Only database and API
docker-compose -f docker/docker-compose.yml up db api

# Only web stack
docker-compose -f docker/docker-compose.yml up db api client

# Only mobile development
docker-compose -f docker/docker-compose.yml up db api mobile-dev
```

### Building and Testing
```bash
# Rebuild specific service
docker-compose -f docker/docker-compose.yml build --no-cache api

# Run tests
docker-compose -f docker/docker-compose.yml exec api npm test
docker-compose -f docker/docker-compose.yml exec client npm test

# Check code quality
docker-compose -f docker/docker-compose.yml exec api npm run lint
```

## 🔧 Customization

### Environment Variables
Edit the environment files in the `docker/` folder:
- `api.env` - Backend configuration
- `client.env` - Frontend configuration

### Port Configuration
Modify `docker/docker-compose.yml` to change port mappings:
```yaml
ports:
  - '8080:80'    # Change 8080 to your preferred port
  - '8000:5000'  # Change 8000 to your preferred port
```

### Adding Services
Add new services to `docker/docker-compose.yml`:
```yaml
new-service:
  build: ../new-service
  ports:
    - '9000:3000'
  networks:
    - zigtask-network
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# API health
curl http://localhost:8000/health

# Database health
docker exec test-db-1 pg_isready -U zigtask

# Container status
docker-compose -f docker/docker-compose.yml ps
```

### Log Management
```bash
# All logs
docker-compose -f docker/docker-compose.yml logs

# Service-specific logs
docker-compose -f docker/docker-compose.yml logs -f api

# Export logs
docker-compose -f docker/docker-compose.yml logs > application.log
```

### Backup and Recovery
```bash
# Backup database
docker exec test-db-1 pg_dump -U zigtask zigtask > backup.sql

# Reset environment
docker-compose -f docker/docker-compose.yml down -v
docker-compose -f docker/docker-compose.yml up --build
```

## 🎯 Common Tasks

### Task | Command | Reference
|------|---------|-----------|
| Start development | `docker-compose -f docker/docker-compose.yml up` | [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md) |
| View API docs | Visit http://localhost:8000/api/docs | [API_DOCUMENTATION.md](API_DOCUMENTATION.md) |
| Debug connection issues | Check logs and network | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Deploy to production | Follow environment guide | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Add new feature | Modify code and restart containers | [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md) |

## 🤝 Contributing

1. Read the **[DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)** to understand the system
2. Make changes in the appropriate service directory
3. Test locally with Docker Compose
4. Update documentation if needed
5. Submit pull request

## 📞 Support

### Documentation Issues
- Review **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** first
- Check logs using commands in this guide
- Create GitHub issue with debug information

### Feature Requests
- Review **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** for architectural context
- Propose changes in GitHub issues
- Follow the development workflow for implementation

---

*This memory bank serves as the single source of truth for the ZigTask project. All documentation is kept current and comprehensive to ensure smooth development and deployment experiences.*

**Last Updated**: January 2024
**Version**: 2.0 (Post-Docker Refactoring) 
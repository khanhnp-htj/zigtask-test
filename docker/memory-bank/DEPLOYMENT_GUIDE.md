# ZigTask Deployment Guide

## Overview
This guide covers deployment strategies for ZigTask across different environments, from local development to production deployment on various platforms.

## 🚀 Quick Start Deployment

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd zigtask

# Start all services
docker-compose -f docker/docker-compose.yml up --build

# Access the application
# Web: http://localhost:8080
# API: http://localhost:8000
# Mobile Dev: http://localhost:19000
```

## 🌐 Production Deployment Options

### 1. Docker Swarm Deployment

#### Prerequisites
- Docker Engine in swarm mode
- Load balancer (nginx, traefik, or cloud LB)
- SSL certificates
- Domain name

#### Setup Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Create overlay network
docker network create --driver overlay zigtask-network

# Deploy stack
docker stack deploy -c docker/docker-compose.prod.yml zigtask
```

#### Production Docker Compose (`docker/docker-compose.prod.yml`)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: zigtask
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - zigtask-network
    secrets:
      - db_user
      - db_password
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

  api:
    image: zigtask/api:latest
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER_FILE=/run/secrets/db_user
      - DB_PASS_FILE=/run/secrets/db_password
      - DB_NAME=zigtask
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
    networks:
      - zigtask-network
    secrets:
      - db_user
      - db_password
      - jwt_secret
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
    depends_on:
      - db

  client:
    image: zigtask/client:latest
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com
    ports:
      - "80:80"
      - "443:443"
    networks:
      - zigtask-network
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    depends_on:
      - api

volumes:
  db_data:

networks:
  zigtask-network:
    external: true

secrets:
  db_user:
    external: true
  db_password:
    external: true
  jwt_secret:
    external: true
```

### 2. Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- kubectl configured
- Helm (optional but recommended)

#### Kubernetes Manifests (`k8s/`)

**Namespace**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zigtask
```

**Database Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: zigtask
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        - name: POSTGRES_DB
          value: zigtask
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

**API Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zigtask-api
  namespace: zigtask
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zigtask-api
  template:
    metadata:
      labels:
        app: zigtask-api
    spec:
      containers:
      - name: api
        image: zigtask/api:latest
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "postgres-service"
        - name: DB_PORT
          value: "5432"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Deploy to Kubernetes
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=username=zigtask \
  --from-literal=password=your-secure-password \
  --namespace=zigtask

kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --namespace=zigtask

# Apply all manifests
kubectl apply -f k8s/
```

### 3. Cloud Platform Deployments

#### AWS ECS with Fargate

**Task Definition**
```json
{
  "family": "zigtask",
  "networkMode": "awsvpc",
  "requiresAttributes": [
    {
      "name": "com.amazonaws.ecs.capability.docker-remote-api.1.18"
    }
  ],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "zigtask-api",
      "image": "zigtask/api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:ssm:region:account:parameter/zigtask/db-host"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/zigtask",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Google Cloud Run

**Deploy API**
```bash
# Build and push image
docker build -t gcr.io/PROJECT_ID/zigtask-api zigtask-api/
docker push gcr.io/PROJECT_ID/zigtask-api

# Deploy to Cloud Run
gcloud run deploy zigtask-api \
  --image gcr.io/PROJECT_ID/zigtask-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DB_HOST=CLOUD_SQL_CONNECTION_NAME
```

#### Azure Container Instances

**ARM Template**
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.ContainerInstance/containerGroups",
      "apiVersion": "2019-12-01",
      "name": "zigtask",
      "location": "[resourceGroup().location]",
      "properties": {
        "containers": [
          {
            "name": "zigtask-api",
            "properties": {
              "image": "zigtask/api:latest",
              "ports": [
                {
                  "port": 5000,
                  "protocol": "TCP"
                }
              ],
              "environmentVariables": [
                {
                  "name": "NODE_ENV",
                  "value": "production"
                }
              ],
              "resources": {
                "requests": {
                  "cpu": 1,
                  "memoryInGB": 2
                }
              }
            }
          }
        ],
        "osType": "Linux",
        "ipAddress": {
          "type": "Public",
          "ports": [
            {
              "port": 5000,
              "protocol": "TCP"
            }
          ]
        }
      }
    }
  ]
}
```

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow

**`.github/workflows/deploy.yml`**
```yaml
name: Deploy ZigTask

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: |
          docker-compose -f docker/docker-compose.yml build
          docker-compose -f docker/docker-compose.yml run --rm api npm test
          docker-compose -f docker/docker-compose.yml run --rm client npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push API
        uses: docker/build-push-action@v3
        with:
          context: ./zigtask-api
          push: true
          tags: zigtask/api:latest,zigtask/api:${{ github.sha }}
      
      - name: Build and push Client
        uses: docker/build-push-action@v3
        with:
          context: ./zigtask-client
          push: true
          tags: zigtask/client:latest,zigtask/client:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## 🔒 Security Configuration

### Environment Variables Management

**Production Environment Variables**
```bash
# API Environment
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=zigtask
DB_PASS=secure-password
DB_NAME=zigtask
JWT_SECRET=very-secure-jwt-secret
CLIENT_URL=https://yourdomain.com

# Client Environment
REACT_APP_API_URL=https://api.yourdomain.com
```

### SSL/TLS Configuration

**Nginx Configuration for SSL**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    
    location / {
        proxy_pass http://client:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://api:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /socket.io {
        proxy_pass http://api:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📊 Monitoring and Logging

### Logging Configuration

**Centralized Logging with ELK Stack**
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

### Health Checks

**Application Health Endpoints**
```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  @Get('db')
  async checkDatabase() {
    // Database connectivity check
    return { database: 'connected' };
  }
}
```

## 🚀 Performance Optimization

### Production Optimizations

**API Optimizations**
- Enable compression middleware
- Implement response caching
- Database connection pooling
- Use PM2 for process management

**Client Optimizations**
- Static asset CDN
- Gzip compression
- Browser caching headers
- Code splitting and lazy loading

### Database Optimization

**PostgreSQL Configuration**
```sql
-- Optimize for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
SELECT pg_reload_conf();
```

## 🔄 Backup and Recovery

### Database Backups

**Automated Backup Script**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="zigtask"

# Create backup
docker exec postgres pg_dump -U zigtask $DB_NAME > $BACKUP_DIR/zigtask_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/zigtask_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Disaster Recovery

**Recovery Procedure**
```bash
# Stop services
docker-compose down

# Restore database
docker exec -i postgres psql -U zigtask -d zigtask < backup.sql

# Restart services
docker-compose up -d
```

## 📈 Scaling Strategies

### Horizontal Scaling
- Load balancer configuration
- Multiple API replicas
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Increase container resources
- Optimize database performance
- Application performance tuning

---

*This deployment guide provides comprehensive instructions for deploying ZigTask in various environments. Choose the deployment strategy that best fits your infrastructure and requirements.* 
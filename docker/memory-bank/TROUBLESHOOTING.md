# ZigTask Troubleshooting Guide

## Overview
This guide provides solutions to common issues encountered when developing, deploying, and running the ZigTask application.

## 🐳 Docker Issues

### Container Won't Start

#### Issue: `docker-compose up` fails
```bash
ERROR: Couldn't connect to Docker daemon at unix:///var/run/docker.sock
```

**Solutions:**
1. **Check Docker Service:**
   ```bash
   # macOS/Linux
   sudo systemctl start docker
   
   # macOS (Docker Desktop)
   open /Applications/Docker.app
   ```

2. **Check User Permissions (Linux):**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Verify Docker Installation:**
   ```bash
   docker version
   docker-compose version
   ```

#### Issue: Port Already in Use
```bash
ERROR: for api  Cannot start service api: driver failed programming external connectivity
```

**Solutions:**
1. **Check Which Process is Using the Port:**
   ```bash
   # Check port 8000 (API)
   lsof -i :8000
   netstat -tulpn | grep :8000
   
   # Check port 8080 (Client)
   lsof -i :8080
   
   # Check port 5433 (Database)
   lsof -i :5433
   ```

2. **Kill the Process or Change Ports:**
   ```bash
   # Kill process (replace PID)
   kill -9 <PID>
   
   # Or modify docker-compose.yml to use different ports
   ports:
     - '8001:5000'  # Changed from 8000
   ```

#### Issue: Build Context Error
```bash
ERROR: Cannot locate specified Dockerfile: Dockerfile
```

**Solutions:**
1. **Check File Structure:**
   ```bash
   # Ensure you're in the correct directory
   pwd
   ls -la
   
   # Check if docker-compose.yml path is correct
   docker-compose -f docker/docker-compose.yml config
   ```

2. **Verify Build Context:**
   ```bash
   # Check if Dockerfiles exist
   ls zigtask-api/Dockerfile
   ls zigtask-client/Dockerfile
   ls zigtask-mobile/Dockerfile.dev
   ```

### Volume and Permission Issues

#### Issue: Permission Denied
```bash
permission denied while trying to connect to the Docker daemon socket
```

**Solutions:**
1. **Add User to Docker Group (Linux):**
   ```bash
   sudo usermod -aG docker $USER
   logout  # Then log back in
   ```

2. **Use Sudo (Temporary):**
   ```bash
   sudo docker-compose -f docker/docker-compose.yml up
   ```

#### Issue: Database Volume Issues
```bash
PostgreSQL Database directory appears to contain a database; Skipping initialization
```

**Solutions:**
1. **Clear Database Volume:**
   ```bash
   docker-compose -f docker/docker-compose.yml down -v
   docker volume rm test_db_data
   docker-compose -f docker/docker-compose.yml up --build
   ```

2. **Reset Everything:**
   ```bash
   docker-compose -f docker/docker-compose.yml down
   docker system prune -a --volumes
   docker-compose -f docker/docker-compose.yml up --build
   ```

## 💾 Database Issues

### Connection Problems

#### Issue: API Can't Connect to Database
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. **Check Database Container Status:**
   ```bash
   docker-compose -f docker/docker-compose.yml ps
   docker-compose -f docker/docker-compose.yml logs db
   ```

2. **Verify Network Configuration:**
   ```bash
   docker network ls
   docker network inspect test_zigtask-network
   ```

3. **Check Environment Variables:**
   ```bash
   # Verify API environment
   docker-compose -f docker/docker-compose.yml exec api printenv | grep DB
   ```

#### Issue: Database Authentication Failed
```bash
FATAL: password authentication failed for user "zigtask"
```

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   cat docker/api.env
   
   # Ensure DB credentials match
   DB_USER=zigtask
   DB_PASS=zigtaskpass
   ```

2. **Reset Database:**
   ```bash
   docker-compose -f docker/docker-compose.yml down -v
   docker volume rm test_db_data
   docker-compose -f docker/docker-compose.yml up db
   ```

#### Issue: Database Connection Pool Exhausted
```bash
Error: Connection pool exhausted
```

**Solutions:**
1. **Increase Connection Pool Size:**
   ```typescript
   // In TypeORM configuration
   extra: {
     max: 20,        // Increase from default 10
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   }
   ```

2. **Check for Connection Leaks:**
   ```bash
   # Monitor active connections
   docker exec test-db-1 psql -U zigtask -d zigtask -c "SELECT count(*) FROM pg_stat_activity;"
   ```

## 🔌 API Issues

### Service Startup Problems

#### Issue: API Service Crashes on Startup
```bash
Error: Cannot find module 'typeorm'
```

**Solutions:**
1. **Rebuild Container:**
   ```bash
   docker-compose -f docker/docker-compose.yml build --no-cache api
   docker-compose -f docker/docker-compose.yml up api
   ```

2. **Check Dependencies:**
   ```bash
   docker-compose -f docker/docker-compose.yml exec api npm list
   ```

3. **Install Dependencies:**
   ```bash
   cd zigtask-api
   npm install --legacy-peer-deps
   ```

#### Issue: JWT Authentication Not Working
```bash
Error: Invalid token
```

**Solutions:**
1. **Check JWT Secret:**
   ```bash
   # Verify JWT_SECRET is set
   docker-compose -f docker/docker-compose.yml exec api printenv | grep JWT
   ```

2. **Clear Browser Storage:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Test Token Generation:**
   ```bash
   # Test auth endpoint
   curl -X POST http://localhost:8000/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

### WebSocket Issues

#### Issue: WebSocket Connection Failed
```bash
WebSocket connection failed: Error during WebSocket handshake
```

**Solutions:**
1. **Check CORS Configuration:**
   ```typescript
   // In main.ts
   app.enableCors({
     origin: process.env.CLIENT_URL,
     credentials: true
   });
   ```

2. **Verify Socket.IO Configuration:**
   ```typescript
   // In gateway
   @WebSocketGateway({
     cors: {
       origin: process.env.CLIENT_URL,
       credentials: true
     }
   })
   ```

3. **Test WebSocket Connection:**
   ```javascript
   // In browser console
   const socket = io('http://localhost:8000');
   socket.on('connect', () => console.log('Connected'));
   ```

## 🌐 Frontend Issues

### Build and Runtime Problems

#### Issue: Client Build Fails
```bash
Error: Cannot resolve module 'react-scripts'
```

**Solutions:**
1. **Clear Node Modules:**
   ```bash
   cd zigtask-client
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **Check Node Version:**
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

#### Issue: Environment Variables Not Loading
```bash
Error: REACT_APP_API_URL is undefined
```

**Solutions:**
1. **Check Environment File:**
   ```bash
   cat docker/client.env
   # Should contain: REACT_APP_API_URL=http://localhost:8000
   ```

2. **Restart Client Container:**
   ```bash
   docker-compose -f docker/docker-compose.yml restart client
   ```

3. **Verify in Browser:**
   ```javascript
   // In browser console
   console.log(process.env.REACT_APP_API_URL);
   ```

#### Issue: API Requests Failing (CORS)
```bash
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solutions:**
1. **Check CORS Configuration in API:**
   ```typescript
   // Ensure CLIENT_URL matches frontend URL
   CLIENT_URL=http://localhost:8080
   ```

2. **Verify Environment Variables:**
   ```bash
   docker-compose -f docker/docker-compose.yml exec api printenv | grep CLIENT_URL
   ```

## 📱 Mobile Development Issues

### Expo/React Native Problems

#### Issue: Expo Development Server Won't Start
```bash
Error: EADDRINUSE: address already in use :::19000
```

**Solutions:**
1. **Kill Existing Expo Process:**
   ```bash
   pkill -f expo
   lsof -ti:19000 | xargs kill -9
   ```

2. **Use Different Port:**
   ```bash
   cd zigtask-mobile
   npx expo start --port 19001
   ```

#### Issue: Metro Bundler Cache Issues
```bash
Error: Unable to resolve module
```

**Solutions:**
1. **Clear Metro Cache:**
   ```bash
   cd zigtask-mobile
   npx expo start --clear
   ```

2. **Reset React Native Cache:**
   ```bash
   npm start -- --reset-cache
   ```

#### Issue: Physical Device Connection
```bash
Couldn't connect to development server
```

**Solutions:**
1. **Check Network Connection:**
   ```bash
   # Ensure device and computer are on same WiFi
   ipconfig getifaddr en0  # macOS
   ip route get 1 | awk '{print $7}' | head -1  # Linux
   ```

2. **Use Tunnel Mode:**
   ```bash
   npx expo start --tunnel
   ```

## 🔧 Development Environment Issues

### Hot Reload Not Working

#### Issue: Code Changes Not Reflecting
**Solutions:**
1. **Check Volume Mounts:**
   ```bash
   docker-compose -f docker/docker-compose.yml config | grep volumes -A 5
   ```

2. **Restart Development Container:**
   ```bash
   docker-compose -f docker/docker-compose.yml restart api
   docker-compose -f docker/docker-compose.yml restart client
   ```

### Performance Issues

#### Issue: Slow Container Performance
**Solutions:**
1. **Increase Docker Resources:**
   - Open Docker Desktop
   - Go to Settings > Resources
   - Increase CPU/Memory allocation

2. **Optimize Volumes:**
   ```yaml
   # Use delegated mode for better performance on macOS
   volumes:
     - ../zigtask-api:/app:delegated
   ```

## 📊 Monitoring and Debugging

### Log Analysis

#### Check Container Logs
```bash
# View all logs
docker-compose -f docker/docker-compose.yml logs

# Specific service logs
docker-compose -f docker/docker-compose.yml logs -f api
docker-compose -f docker/docker-compose.yml logs -f client
docker-compose -f docker/docker-compose.yml logs -f db

# Last 100 lines
docker-compose -f docker/docker-compose.yml logs --tail=100 api
```

#### Database Query Analysis
```bash
# Connect to database
docker exec -it test-db-1 psql -U zigtask -d zigtask

# Check active connections
SELECT pid, usename, application_name, client_addr, state 
FROM pg_stat_activity 
WHERE state = 'active';

# Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;
```

### Health Checks

#### API Health Check
```bash
curl http://localhost:8000/health
```

#### Database Health Check
```bash
docker exec test-db-1 pg_isready -U zigtask -d zigtask
```

#### Frontend Health Check
```bash
curl http://localhost:8080
```

## 🔄 Recovery Procedures

### Complete System Reset
```bash
# Stop all containers
docker-compose -f docker/docker-compose.yml down

# Remove all volumes (WARNING: Data loss)
docker-compose -f docker/docker-compose.yml down -v

# Remove all images
docker-compose -f docker/docker-compose.yml down --rmi all

# Clean up system
docker system prune -a --volumes

# Rebuild everything
docker-compose -f docker/docker-compose.yml up --build
```

### Partial Recovery

#### Reset Database Only
```bash
docker-compose -f docker/docker-compose.yml stop db
docker volume rm test_db_data
docker-compose -f docker/docker-compose.yml up db
```

#### Reset API Only
```bash
docker-compose -f docker/docker-compose.yml build --no-cache api
docker-compose -f docker/docker-compose.yml up api
```

## 🆘 Getting Help

### Debug Information to Collect
```bash
# System info
docker version
docker-compose version
uname -a

# Container status
docker-compose -f docker/docker-compose.yml ps

# Resource usage
docker stats

# Network info
docker network ls
docker network inspect test_zigtask-network

# Volume info
docker volume ls
docker volume inspect test_db_data
```

### Common Log Patterns

#### Successful Startup
```
✅ Database connected successfully
✅ API server listening on port 5000
✅ WebSocket server initialized
✅ Client build completed
```

#### Error Patterns to Look For
```
❌ Connection refused
❌ Authentication failed
❌ Port already in use
❌ Module not found
❌ Permission denied
```

## 🔄 Application Logic Issues

### Duplicate Task Creation (RESOLVED)

#### Issue: Tasks Being Created Multiple Times
```
User creates one task but 2-3 duplicate tasks appear in the UI
```

**Root Cause:**
This issue was caused by React.StrictMode in development mode, which intentionally double-invokes effects and functions to help detect side effects.

**Solution Applied:**
The issue has been permanently resolved by removing React.StrictMode from the application.

**Before (causing duplicates):**
```typescript
// zigtask-client/src/index.tsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**After (fixed):**
```typescript
// zigtask-client/src/index.tsx
root.render(
  <App />
);
```

**Additional Improvements:**
- Removed WebSocket functionality to eliminate race conditions
- Simplified task creation to pure REST API calls
- Enhanced error handling to prevent duplicate API calls

**Verification:**
1. **Test Task Creation:**
   ```bash
   # Navigate to the app
   open http://localhost:8080
   
   # Create a new task and verify only one appears
   ```

2. **Check Console for Errors:**
   ```javascript
   // Should see no WebSocket connection messages
   // Should see only single success notifications
   ```

3. **Verify API Calls:**
   ```bash
   # Open Network tab in browser dev tools
   # Create task - should see only one POST request to /tasks
   ```

#### Issue: WebSocket-Related Errors (RESOLVED)
```
WebSocket connection errors or multiple event handlers
```

**Solution:**
WebSocket functionality has been completely removed from all applications (web, mobile, and backend) to improve application stability and eliminate duplicate events.

**Benefits of Removal:**
- ✅ No more duplicate task creation
- ✅ Simplified architecture across all platforms
- ✅ Better performance and reduced bundle sizes
- ✅ Easier debugging and development
- ✅ More predictable behavior
- ✅ Consistent REST-only API communication

### Performance Issues

#### Issue: Slow Task Loading
```
Tasks take a long time to load or UI feels sluggish
```

**Solutions:**
1. **Check API Response Times:**
   ```bash
   # Test API directly
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/tasks
   ```

2. **Monitor Database Performance:**
   ```bash
   # Connect to database
   docker exec -it docker-db-1 psql -U zigtask -d zigtask
   
   # Check slow queries
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```

3. **Clear Browser Cache:**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Linux/Windows)
   Cmd+Shift+R (Mac)
   ```

4. **Restart Containers:**
   ```bash
   cd docker
   docker-compose restart
   ```

#### Issue: Memory Leaks
```
Browser tab uses excessive memory over time
```

**Solutions:**
1. **Check for Memory Leaks:**
   ```javascript
   // Open browser dev tools > Memory tab
   // Take heap snapshot before and after using the app
   ```

2. **Clear Application State:**
   ```javascript
   // Clear local storage
   localStorage.clear();
   
   // Refresh the page
   window.location.reload();
   ```

3. **Update Dependencies:**
   ```bash
   cd zigtask-client
   npm update
   npm audit fix
   ```

## 📋 Health Check Commands

### Quick Status Check
```bash
# Check all services
cd docker
docker-compose ps

# Check logs for errors
docker-compose logs --tail=50
```

### Detailed Health Check
```bash
# API Health
curl http://localhost:8000/auth/signin -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Database Connection
docker exec -it docker-db-1 psql -U zigtask -d zigtask -c "SELECT version();"

# Client Accessibility
curl -I http://localhost:8080
```

### Performance Monitoring
```bash
# Monitor container resources
docker stats

# Check disk usage
docker system df

# Network connectivity
docker network ls
docker network inspect docker_zigtask-network
```

---

*If you encounter issues not covered in this guide, check the GitHub issues or create a new issue with the debug information collected above.* 
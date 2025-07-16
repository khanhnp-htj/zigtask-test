#!/bin/bash

echo "🧹 ZigTask Port Cleanup & Fresh Docker Rebuild Script"
echo "====================================================="

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    echo "🔍 Checking port $port..."
    
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "⚠️  Found processes on port $port: $pids"
        echo "🔪 Killing processes on port $port..."
        kill -9 $pids 2>/dev/null
        echo "✅ Port $port cleared"
    else
        echo "✅ Port $port is free"
    fi
}

# Step 1: Kill any processes using our priority ports
echo -e "\n📋 Step 1: Clearing priority ports..."
kill_port_processes 8000  # API port
kill_port_processes 8080  # Client port

# Step 2: Stop and remove all Docker containers and networks
echo -e "\n📋 Step 2: Docker cleanup..."
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo "🛑 Stopping all running containers..."
        docker stop $(docker ps -q) 2>/dev/null || echo "No running containers to stop"
        
        echo "🗑️  Removing all containers..."
        docker rm $(docker ps -aq) 2>/dev/null || echo "No containers to remove"
        
        echo "🗑️  Removing all images..."
        docker rmi $(docker images -q) 2>/dev/null || echo "No images to remove"
        
        echo "🗑️  Removing all volumes..."
        docker volume rm $(docker volume ls -q) 2>/dev/null || echo "No volumes to remove"
        
        echo "🗑️  Removing all networks..."
        docker network rm $(docker network ls -q) 2>/dev/null || echo "No custom networks to remove"
        
        echo "🧹 System prune..."
        docker system prune -af --volumes
        
        echo "✅ Docker cleanup complete"
    else
        echo "⚠️  Docker daemon not running. Will skip Docker cleanup."
        echo "📝 Please start Docker daemon and run this script again."
    fi
else
    echo "⚠️  Docker not found. Please install Docker first."
fi

# Step 3: Verify ports are free
echo -e "\n📋 Step 3: Final port verification..."
kill_port_processes 8000
kill_port_processes 8080

# Step 4: Build and start fresh
echo -e "\n📋 Step 4: Fresh build and start..."
if command -v docker &> /dev/null && docker ps &> /dev/null; then
    echo "🏗️  Building fresh Docker images..."
    docker-compose build --no-cache
    
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo "📊 Container status:"
    docker-compose ps
    
    echo -e "\n🎉 Project ready!"
    echo "📱 Client: http://localhost:8080"
    echo "🔧 API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/api/docs"
else
    echo "⚠️  Docker daemon not available. Please:"
    echo "1. Start Docker Desktop or Rancher Desktop"
    echo "2. Wait for Docker to be ready"
    echo "3. Run this script again"
fi

echo -e "\n✨ Cleanup script completed!" 
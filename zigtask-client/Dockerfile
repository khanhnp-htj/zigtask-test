# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (standard nginx port)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 
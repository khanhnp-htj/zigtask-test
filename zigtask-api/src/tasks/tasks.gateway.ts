import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TaskEventType,
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  TaskStatusChangedEvent,
} from '../common/events/task.events';
import { WEBSOCKET_EVENTS, WEBSOCKET_NAMESPACES } from '../common/constants/websocket.constants';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000', 
      'http://localhost:8080', 
      'http://192.168.68.55:3000', 
      'http://192.168.68.55:8080'
    ],
    credentials: true,
  },
  namespace: WEBSOCKET_NAMESPACES.TASKS,
})
@Injectable()
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TasksGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract user ID from authentication token if available
    const userId = this.extractUserIdFromSocket(client);
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from user sockets mapping
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
        }
        this.logger.log(`User ${userId} disconnected socket ${client.id}`);
        break;
      }
    }
  }

  private extractUserIdFromSocket(client: Socket): string | null {
    try {
      // Extract from query params or headers
      const userId = client.handshake.query.userId as string;
      return userId || null;
    } catch (error) {
      this.logger.warn(`Failed to extract user ID from socket ${client.id}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  // Event handlers for task events
  @OnEvent(TaskEventType.CREATED)
  handleTaskCreated(event: TaskCreatedEvent) {
    try {
      this.logger.log(`Broadcasting task created event: ${event.taskId}`);
      
      // Broadcast to all connected clients of the user
      const userSocketIds = this.userSockets.get(event.userId);
      if (userSocketIds) {
        userSocketIds.forEach(socketId => {
          this.server.to(socketId).emit(WEBSOCKET_EVENTS.TASK_CREATED, {
            taskId: event.taskId,
            userId: event.userId,
            action: 'created',
            task: event.task,
          });
        });
      }

      // Also broadcast to other users if needed (for collaborative features)
      this.server.emit(WEBSOCKET_EVENTS.TASK_CREATED, {
        taskId: event.taskId,
        userId: event.userId,
        action: 'created',
        task: event.task,
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast task created event:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  @OnEvent(TaskEventType.UPDATED)
  handleTaskUpdated(event: TaskUpdatedEvent) {
    try {
      this.logger.log(`Broadcasting task updated event: ${event.taskId}`);
      
      // Broadcast to all connected clients of the user
      const userSocketIds = this.userSockets.get(event.userId);
      if (userSocketIds) {
        userSocketIds.forEach(socketId => {
          this.server.to(socketId).emit(WEBSOCKET_EVENTS.TASK_UPDATED, {
            taskId: event.taskId,
            userId: event.userId,
            action: 'updated',
            task: event.task,
          });
        });
      }

      // Also broadcast to other users if needed
      this.server.emit(WEBSOCKET_EVENTS.TASK_UPDATED, {
        taskId: event.taskId,
        userId: event.userId,
        action: 'updated',
        task: event.task,
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast task updated event:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  @OnEvent(TaskEventType.DELETED)
  handleTaskDeleted(event: TaskDeletedEvent) {
    try {
      this.logger.log(`Broadcasting task deleted event: ${event.taskId}`);
      
      // Broadcast to all connected clients of the user
      const userSocketIds = this.userSockets.get(event.userId);
      if (userSocketIds) {
        userSocketIds.forEach(socketId => {
          this.server.to(socketId).emit(WEBSOCKET_EVENTS.TASK_DELETED, {
            taskId: event.taskId,
            userId: event.userId,
            action: 'deleted',
          });
        });
      }

      // Also broadcast to other users if needed
      this.server.emit(WEBSOCKET_EVENTS.TASK_DELETED, {
        taskId: event.taskId,
        userId: event.userId,
        action: 'deleted',
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast task deleted event:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  @OnEvent(TaskEventType.STATUS_CHANGED)
  handleTaskStatusChanged(event: TaskStatusChangedEvent) {
    try {
      this.logger.log(`Broadcasting task status changed event: ${event.taskId}`);
      
      // Broadcast to all connected clients of the user
      const userSocketIds = this.userSockets.get(event.userId);
      if (userSocketIds) {
        userSocketIds.forEach(socketId => {
          this.server.to(socketId).emit(WEBSOCKET_EVENTS.TASK_STATUS_CHANGED, {
            taskId: event.taskId,
            userId: event.userId,
            action: 'status_changed',
            task: event.task,
            oldStatus: event.oldStatus,
            newStatus: event.newStatus,
          });
        });
      }

      // Also broadcast to other users if needed
      this.server.emit(WEBSOCKET_EVENTS.TASK_STATUS_CHANGED, {
        taskId: event.taskId,
        userId: event.userId,
        action: 'status_changed',
        task: event.task,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast task status changed event:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.USER_AUTHENTICATED)
  handleUserAuthentication(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { userId } = data;
      
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      
      this.userSockets.get(userId)?.add(client.id);
      this.logger.log(`User ${userId} authenticated with socket ${client.id}`);
      
      // Send acknowledgment
      client.emit('authenticated', { success: true, userId });
    } catch (error) {
      this.logger.error(`Failed to handle user authentication:`, error instanceof Error ? error.message : 'Unknown error');
      client.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  }
} 
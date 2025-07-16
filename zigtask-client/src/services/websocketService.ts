import { io, Socket } from 'socket.io-client';
import { WebSocketEvent, Task } from '../types/api.types';
import toast from 'react-hot-toast';

type TaskEventCallback = (eventData: WebSocketEvent<Task>) => void;

interface ConnectionConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private config: ConnectionConfig;
  private userId: string | null = null;

  // Event callbacks
  private taskCreatedCallback: TaskEventCallback | null = null;
  private taskUpdatedCallback: TaskEventCallback | null = null;
  private taskDeletedCallback: TaskEventCallback | null = null;
  private taskStatusChangedCallback: TaskEventCallback | null = null;

  constructor() {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      timeout: 10000,
    };
  }

  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      this.socket = io(`${serverUrl}/tasks`, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.config.maxReconnectAttempts,
        reconnectionDelay: this.config.reconnectDelay,
        timeout: this.config.timeout,
        forceNew: true,
      });

      this.setupEventListeners();
      console.log('WebSocket connection initiated');
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      toast.error('Failed to connect to real-time updates');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      console.log('WebSocket disconnected');
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket connected:', this.socket?.id);
      
      // Re-authenticate if we have a user ID
      if (this.userId) {
        this.authenticateUser(this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnect needed
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      toast.success('Real-time updates restored');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      toast.error('Unable to restore real-time updates');
    });

    // Authentication response
    this.socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('WebSocket user authenticated:', data.userId);
      } else {
        console.error('WebSocket authentication failed:', data.error);
      }
    });

    // Task events
    this.socket.on('taskCreated', (data: WebSocketEvent<Task>) => {
      console.log('Real-time: Task created', data);
      if (this.taskCreatedCallback) {
        this.taskCreatedCallback(data);
      }
    });

    this.socket.on('taskUpdated', (data: WebSocketEvent<Task>) => {
      console.log('Real-time: Task updated', data);
      if (this.taskUpdatedCallback) {
        this.taskUpdatedCallback(data);
      }
    });

    this.socket.on('taskDeleted', (data: WebSocketEvent) => {
      console.log('Real-time: Task deleted', data);
      if (this.taskDeletedCallback) {
        this.taskDeletedCallback(data);
      }
    });

    this.socket.on('taskStatusChanged', (data: WebSocketEvent<Task>) => {
      console.log('Real-time: Task status changed', data);
      if (this.taskStatusChangedCallback) {
        this.taskStatusChangedCallback(data);
      }
    });
  }

  private handleConnectionError(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket reconnection attempt ${this.reconnectAttempts}`);
    } else {
      console.error('Max reconnection attempts reached');
      toast.error('Real-time updates unavailable');
    }
  }

  private handleReconnection(): void {
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        console.log('Attempting manual WebSocket reconnection');
        this.socket.connect();
      }
    }, this.config.reconnectDelay);
  }

  // Public methods
  authenticateUser(userId: string): void {
    this.userId = userId;
    if (this.socket && this.isConnected) {
      this.socket.emit('userAuthenticated', { userId });
      console.log('WebSocket user authentication sent:', userId);
    }
  }

  unauthenticateUser(): void {
    this.userId = null;
    if (this.socket && this.isConnected) {
      this.socket.emit('userUnauthenticated');
      console.log('WebSocket user unauthenticated');
    }
  }

  // Event callback setters
  onTaskCreated(callback: TaskEventCallback): void {
    this.taskCreatedCallback = callback;
  }

  onTaskUpdated(callback: TaskEventCallback): void {
    this.taskUpdatedCallback = callback;
  }

  onTaskDeleted(callback: TaskEventCallback): void {
    this.taskDeletedCallback = callback;
  }

  onTaskStatusChanged(callback: TaskEventCallback): void {
    this.taskStatusChangedCallback = callback;
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService; 
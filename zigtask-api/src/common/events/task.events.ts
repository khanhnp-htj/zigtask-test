import { Task, TaskStatus } from '../../tasks/entities/task.entity';

export enum TaskEventType {
  CREATED = 'task.created',
  UPDATED = 'task.updated',
  DELETED = 'task.deleted',
  STATUS_CHANGED = 'task.status_changed',
}

export interface BaseTaskEvent {
  taskId: string;
  userId: string;
  timestamp: Date;
}

export interface TaskCreatedEvent extends BaseTaskEvent {
  task: Task;
}

export interface TaskUpdatedEvent extends BaseTaskEvent {
  task: Task;
  previousData?: Partial<Task>;
}

export interface TaskDeletedEvent extends BaseTaskEvent {
  taskId: string;
}

export interface TaskStatusChangedEvent extends BaseTaskEvent {
  task: Task;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
}

export type TaskEvent =
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskDeletedEvent
  | TaskStatusChangedEvent; 
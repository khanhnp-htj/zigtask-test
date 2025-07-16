export const WEBSOCKET_EVENTS = {
  TASK_CREATED: 'taskCreated',
  TASK_UPDATED: 'taskUpdated',
  TASK_DELETED: 'taskDeleted',
  TASK_STATUS_CHANGED: 'taskStatusChanged',
  USER_AUTHENTICATED: 'userAuthenticated',
} as const;

export const WEBSOCKET_NAMESPACES = {
  TASKS: '/tasks',
} as const; 
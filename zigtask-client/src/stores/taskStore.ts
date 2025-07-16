import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TasksGroupedByStatus,
  TaskFilters,
  TaskStatus,
  WebSocketEvent,
} from '../types/api.types';
import { taskService } from '../services/taskService';
import { websocketService } from '../services/websocketService';
import toast from 'react-hot-toast';

interface TaskState {
  tasks: Task[];
  tasksByStatus: TasksGroupedByStatus;
  isLoading: boolean;
  filters: TaskFilters;
  
  // Actions
  fetchTasks: () => Promise<void>;
  fetchTasksByStatus: () => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  reorderTasks: (status: TaskStatus, reorderedTasks: Task[]) => void;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  
  // WebSocket methods
  initializeWebSocket: () => void;
  disconnectWebSocket: () => void;
  handleTaskCreated: (task: Task) => void;
  handleTaskUpdated: (task: Task) => void;
  handleTaskDeleted: (taskId: string) => void;
  handleTaskStatusChanged: (task: Task) => void;
}

const initialTasksByStatus: TasksGroupedByStatus = {
  [TaskStatus.TODO]: [],
  [TaskStatus.IN_PROGRESS]: [],
  [TaskStatus.DONE]: [],
};

const useTaskStore = create<TaskState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      tasks: [],
      tasksByStatus: initialTasksByStatus,
      isLoading: false,
      filters: {},

      fetchTasks: async () => {
        set({ isLoading: true });
        try {
          const { filters } = get();
          const tasks = await taskService.getTasks(filters);
          set({ tasks, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Error fetching tasks:', error);
          toast.error('Failed to load tasks');
          throw error;
        }
      },

      fetchTasksByStatus: async () => {
        set({ isLoading: true });
        try {
          const tasksByStatus = await taskService.getTasksByStatus();
          set({ tasksByStatus, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Error fetching tasks by status:', error);
          toast.error('Failed to load tasks');
          throw error;
        }
      },

      createTask: async (data: CreateTaskData) => {
        try {
          const newTask = await taskService.createTask(data);
          const { tasksByStatus } = get();
          const updatedTasksByStatus = {
            ...tasksByStatus,
            [newTask.status]: [...tasksByStatus[newTask.status], newTask],
          };
          set({ tasksByStatus: updatedTasksByStatus });
          toast.success('Task created successfully!');
        } catch (error) {
          console.error('Error creating task:', error);
          toast.error('Failed to create task');
          throw error;
        }
      },

      updateTask: async (id: string, data: UpdateTaskData) => {
        try {
          const updatedTask = await taskService.updateTask(id, data);
          const { tasksByStatus } = get();
          
          // Remove task from all status arrays first
          const newTasksByStatus: TasksGroupedByStatus = {
            [TaskStatus.TODO]: tasksByStatus[TaskStatus.TODO].filter(task => task.id !== id),
            [TaskStatus.IN_PROGRESS]: tasksByStatus[TaskStatus.IN_PROGRESS].filter(task => task.id !== id),
            [TaskStatus.DONE]: tasksByStatus[TaskStatus.DONE].filter(task => task.id !== id),
          };
          
          // Add updated task to correct status array
          newTasksByStatus[updatedTask.status].push(updatedTask);
          
          set({ tasksByStatus: newTasksByStatus });
          toast.success('Task updated successfully!');
        } catch (error) {
          console.error('Error updating task:', error);
          toast.error('Failed to update task');
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        try {
          await taskService.deleteTask(id);
          const { tasksByStatus } = get();
          
          const newTasksByStatus: TasksGroupedByStatus = {
            [TaskStatus.TODO]: tasksByStatus[TaskStatus.TODO].filter(task => task.id !== id),
            [TaskStatus.IN_PROGRESS]: tasksByStatus[TaskStatus.IN_PROGRESS].filter(task => task.id !== id),
            [TaskStatus.DONE]: tasksByStatus[TaskStatus.DONE].filter(task => task.id !== id),
          };
          
          set({ tasksByStatus: newTasksByStatus });
          toast.success('Task deleted successfully!');
        } catch (error) {
          console.error('Error deleting task:', error);
          toast.error('Failed to delete task');
          throw error;
        }
      },

      moveTask: async (taskId: string, newStatus: TaskStatus) => {
        try {
          const updatedTask = await taskService.updateTask(taskId, { status: newStatus });
          const { tasksByStatus } = get();
          
          // Remove task from all status arrays
          const newTasksByStatus: TasksGroupedByStatus = {
            [TaskStatus.TODO]: tasksByStatus[TaskStatus.TODO].filter(task => task.id !== taskId),
            [TaskStatus.IN_PROGRESS]: tasksByStatus[TaskStatus.IN_PROGRESS].filter(task => task.id !== taskId),
            [TaskStatus.DONE]: tasksByStatus[TaskStatus.DONE].filter(task => task.id !== taskId),
          };
          
          // Add task to new status array
          newTasksByStatus[newStatus].push(updatedTask);
          
          set({ tasksByStatus: newTasksByStatus });
          toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
        } catch (error) {
          console.error('Error moving task:', error);
          toast.error('Failed to move task');
          throw error;
        }
      },

      reorderTasks: (status: TaskStatus, reorderedTasks: Task[]) => {
        set(state => ({
          tasksByStatus: {
            ...state.tasksByStatus,
            [status]: reorderedTasks,
          },
        }));
      },

      setFilters: (filters: TaskFilters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      // WebSocket methods
      initializeWebSocket: () => {
        if (!websocketService.isSocketConnected()) {
          websocketService.connect();
        }

        // Set up event handlers
        websocketService.onTaskCreated((eventData: WebSocketEvent<Task>) => {
          if (eventData.task) {
            get().handleTaskCreated(eventData.task);
            toast.success(`📱 ${eventData.task.title} created`, {
              duration: 2000,
            });
          }
        });

        websocketService.onTaskUpdated((eventData: WebSocketEvent<Task>) => {
          if (eventData.task) {
            get().handleTaskUpdated(eventData.task);
            toast.success(`📱 ${eventData.task.title} updated`, {
              duration: 2000,
            });
          }
        });

        websocketService.onTaskDeleted((eventData: WebSocketEvent) => {
          get().handleTaskDeleted(eventData.taskId);
          toast.success('📱 Task deleted', {
            duration: 2000,
          });
        });

        websocketService.onTaskStatusChanged((eventData: WebSocketEvent<Task>) => {
          if (eventData.task) {
            get().handleTaskStatusChanged(eventData.task);
            toast.success(`📱 Task moved to ${eventData.newStatus?.replace('_', ' ')}`, {
              duration: 2000,
            });
          }
        });
      },

      disconnectWebSocket: () => {
        websocketService.disconnect();
      },

      handleTaskCreated: (task: Task) => {
        const { tasksByStatus } = get();
        const updatedTasksByStatus = {
          ...tasksByStatus,
          [task.status]: [...tasksByStatus[task.status], task],
        };
        set({ tasksByStatus: updatedTasksByStatus });
      },

      handleTaskUpdated: (task: Task) => {
        const { tasksByStatus } = get();
        
        // Remove task from all status arrays first
        const newTasksByStatus: TasksGroupedByStatus = {
          [TaskStatus.TODO]: tasksByStatus[TaskStatus.TODO].filter(t => t.id !== task.id),
          [TaskStatus.IN_PROGRESS]: tasksByStatus[TaskStatus.IN_PROGRESS].filter(t => t.id !== task.id),
          [TaskStatus.DONE]: tasksByStatus[TaskStatus.DONE].filter(t => t.id !== task.id),
        };
        
        // Add updated task to correct status array
        newTasksByStatus[task.status].push(task);
        
        set({ tasksByStatus: newTasksByStatus });
      },

      handleTaskDeleted: (taskId: string) => {
        const { tasksByStatus } = get();
        
        const newTasksByStatus: TasksGroupedByStatus = {
          [TaskStatus.TODO]: tasksByStatus[TaskStatus.TODO].filter(task => task.id !== taskId),
          [TaskStatus.IN_PROGRESS]: tasksByStatus[TaskStatus.IN_PROGRESS].filter(task => task.id !== taskId),
          [TaskStatus.DONE]: tasksByStatus[TaskStatus.DONE].filter(task => task.id !== taskId),
        };
        
        set({ tasksByStatus: newTasksByStatus });
      },

      handleTaskStatusChanged: (task: Task) => {
        // This is the same as handleTaskUpdated since status change is an update
        get().handleTaskUpdated(task);
      },
    })),
    {
      name: 'task-store',
      partialize: (state: TaskState) => ({
        filters: state.filters,
      }),
    }
  )
);

export { useTaskStore };
export default useTaskStore; 
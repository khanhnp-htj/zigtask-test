import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TasksGroupedByStatus,
  TaskFilters,
  TaskStatus,
} from '../types/api.types';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

// Helper to get current user - probably should move this to auth utils
const getCurrentUserId = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return null;
  } catch {
    return null;
  }
};

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
          const currentFilters = get().filters;
          const tasks = await taskService.getTasks(currentFilters);
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
          
          // Update the store optimistically
          const currentTasks = get().tasksByStatus;
          const updatedTasks = {
            ...currentTasks,
            [newTask.status]: [...currentTasks[newTask.status], newTask],
          };
          set({ tasksByStatus: updatedTasks });
          
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
          const currentTasks = get().tasksByStatus;
          
          // Remove task from all status arrays first (just in case status changed)
          const cleanedTasks: TasksGroupedByStatus = {
            [TaskStatus.TODO]: currentTasks[TaskStatus.TODO].filter(task => task.id !== id),
            [TaskStatus.IN_PROGRESS]: currentTasks[TaskStatus.IN_PROGRESS].filter(task => task.id !== id),
            [TaskStatus.DONE]: currentTasks[TaskStatus.DONE].filter(task => task.id !== id),
          };
          
          // Add updated task to the correct status array
          cleanedTasks[updatedTask.status].push(updatedTask);
          
          set({ tasksByStatus: cleanedTasks });
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
          const currentTasks = get().tasksByStatus;
          
          // Remove task from all possible status arrays
          const updatedTasks: TasksGroupedByStatus = {
            [TaskStatus.TODO]: currentTasks[TaskStatus.TODO].filter(task => task.id !== id),
            [TaskStatus.IN_PROGRESS]: currentTasks[TaskStatus.IN_PROGRESS].filter(task => task.id !== id),
            [TaskStatus.DONE]: currentTasks[TaskStatus.DONE].filter(task => task.id !== id),
          };
          
          set({ tasksByStatus: updatedTasks });
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
          const currentTasksByStatus = get().tasksByStatus;
          
          // Remove task from its current location
          const updatedTasksByStatus: TasksGroupedByStatus = {
            [TaskStatus.TODO]: currentTasksByStatus[TaskStatus.TODO].filter(task => task.id !== taskId),
            [TaskStatus.IN_PROGRESS]: currentTasksByStatus[TaskStatus.IN_PROGRESS].filter(task => task.id !== taskId),
            [TaskStatus.DONE]: currentTasksByStatus[TaskStatus.DONE].filter(task => task.id !== taskId),
          };
          
          // Add task to new status column
          updatedTasksByStatus[newStatus].push(updatedTask);
          
          set({ tasksByStatus: updatedTasksByStatus });
          
          // Nice user feedback
          const statusLabels = {
            [TaskStatus.TODO]: 'To Do',
            [TaskStatus.IN_PROGRESS]: 'In Progress', 
            [TaskStatus.DONE]: 'Done'
          };
          toast.success(`Task moved to ${statusLabels[newStatus]}`);
        } catch (error) {
          console.error('Error moving task:', error);
          toast.error('Failed to move task');
          throw error;
        }
      },

      reorderTasks: (status: TaskStatus, reorderedTasks: Task[]) => {
        // Update the local state for immediate UI feedback
        set(state => ({
          tasksByStatus: {
            ...state.tasksByStatus,
            [status]: reorderedTasks,
          },
        }));
        
        // TODO: Could add server sync here later for persistent ordering
      },

      setFilters: (filters: TaskFilters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },
    })),
    {
      name: 'task-management-store',
      partialize: (state: TaskState) => ({
        filters: state.filters,
      }),
    }
  )
);

export { useTaskStore }; 
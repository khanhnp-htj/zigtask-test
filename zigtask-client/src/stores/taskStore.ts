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

// Helper function to get current user ID
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
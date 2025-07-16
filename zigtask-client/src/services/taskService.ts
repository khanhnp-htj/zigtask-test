import { apiService } from './api.service';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TasksGroupedByStatus,
  TaskFilters,
} from '../types/api.types';

class TaskService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<Task[]>('/tasks', params);
      return response;
    } catch (error) {
      console.error('Task service - get tasks error:', error);
      throw error;
    }
  }

  async getTasksByStatus(): Promise<TasksGroupedByStatus> {
    try {
      const response = await apiService.get<TasksGroupedByStatus>('/tasks/by-status');
      return response;
    } catch (error) {
      console.error('Task service - get tasks by status error:', error);
      throw error;
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      const response = await apiService.get<Task>(`/tasks/${id}`);
      return response;
    } catch (error) {
      console.error(`Task service - get task ${id} error:`, error);
      throw error;
    }
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    try {
      const response = await apiService.post<Task>('/tasks', data);
      return response;
    } catch (error) {
      console.error('Task service - create task error:', error);
      throw error;
    }
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    try {
      const response = await apiService.patch<Task>(`/tasks/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Task service - update task ${id} error:`, error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await apiService.delete<void>(`/tasks/${id}`);
    } catch (error) {
      console.error(`Task service - delete task ${id} error:`, error);
      throw error;
    }
  }

  private buildFilterParams(filters?: TaskFilters): Record<string, string> {
    if (!filters) return {};

    const params: Record<string, string> = {};

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.priority) {
      params.priority = filters.priority;
    }
    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      params.dateTo = filters.dateTo;
    }

    return params;
  }
}

export const taskService = new TaskService();
export default taskService; 
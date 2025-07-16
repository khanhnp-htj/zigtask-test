import { apiService } from './api.service';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
} from '../types/api.types';

class TaskService {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await apiService.get<Task[]>('/tasks');
      return response;
    } catch (error) {
      console.error('Task service - get tasks error:', error);
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

  async createTask(data: CreateTaskDto): Promise<Task> {
    try {
      // Include all supported fields for the API
      const apiData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
      };

      const response = await apiService.post<Task>('/tasks', apiData);
      return response;
    } catch (error) {
      console.error('Task service - create task error:', error);
      throw error;
    }
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    try {
      // Include all supported fields for the API
      const apiData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
      };

      const response = await apiService.patch<Task>(`/tasks/${id}`, apiData);
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

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const response = await apiService.patch<Task>(`/tasks/${id}`, { status });
      return response;
    } catch (error) {
      console.error(`Task service - update task status ${id} error:`, error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
export default taskService; 
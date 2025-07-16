import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    try {
      const taskData: Partial<Task> = {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || TaskStatus.TODO,
        priority: createTaskDto.priority || TaskPriority.MEDIUM,
        userId: user.id,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      };
      
      const task = this.taskRepository.create(taskData);
      const savedTask = await this.taskRepository.save(task);
      
      this.logger.log(`Task created: ${savedTask.id} by user: ${user.id}`);
      return savedTask;
    } catch (error) {
      this.logger.error(`Failed to create task for user ${user.id}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async findAll(
    user: User,
    status?: TaskStatus,
    priority?: TaskPriority,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Task[]> {
    try {
      const query = this.taskRepository.createQueryBuilder('task')
        .where('task.userId = :userId', { userId: user.id });

      if (status) {
        query.andWhere('task.status = :status', { status });
      }

      if (priority) {
        query.andWhere('task.priority = :priority', { priority });
      }

      if (search) {
        query.andWhere(
          '(task.title ILIKE :search OR task.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (dateFrom) {
        query.andWhere('task.createdAt >= :dateFrom', { dateFrom });
      }

      if (dateTo) {
        query.andWhere('task.createdAt <= :dateTo', { dateTo });
      }

      query.orderBy('task.createdAt', 'DESC');

      return await query.getMany();
    } catch (error) {
      this.logger.error(`Failed to fetch tasks for user ${user.id}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async findOne(id: string, user: User): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id, userId: user.id },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task;
    } catch (error) {
      this.logger.error(`Failed to find task ${id} for user ${user.id}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    try {
      const task = await this.findOne(id, user);

      const updateData: Partial<Task> = {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
      };

      await this.taskRepository.update(id, updateData);
      const updatedTask = await this.findOne(id, user);

      this.logger.log(`Task updated: ${updatedTask.id} by user: ${user.id}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Failed to update task ${id} for user ${user.id}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async remove(id: string, user: User): Promise<void> {
    try {
      const task = await this.findOne(id, user);
      await this.taskRepository.remove(task);

      this.logger.log(`Task deleted: ${id} by user: ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to delete task ${id} for user ${user.id}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async getTasksByStatus(user: User): Promise<{ [key in TaskStatus]: Task[] }> {
    try {
      const tasks = await this.findAll(user);
      
      return {
        [TaskStatus.TODO]: tasks.filter(task => task.status === TaskStatus.TODO),
        [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
        [TaskStatus.DONE]: tasks.filter(task => task.status === TaskStatus.DONE),
      };
    } catch (error) {
      this.logger.error(`Failed to get tasks by status for user ${user.id}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
} 
import React, { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import { useTaskStore } from '../stores/taskStore';
import { CreateTaskData, TaskStatus, TaskPriority } from '../types';
import clsx from 'clsx';
import 'react-datepicker/dist/react-datepicker.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null;
}

interface FormData extends CreateTaskData {
  dueDateObj?: Date;
}

const priorityLabels = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
};

const priorityColors = {
  [TaskPriority.LOW]: 'text-green-600',
  [TaskPriority.MEDIUM]: 'text-yellow-600',
  [TaskPriority.HIGH]: 'text-red-600',
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId }) => {
  const { createTask, updateTask, tasksByStatus } = useTaskStore();
  const isEditing = !!taskId;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const dueDateObj = watch('dueDateObj');

  // Find the task if editing
  const existingTask = isEditing
    ? [...tasksByStatus.todo, ...tasksByStatus.in_progress, ...tasksByStatus.done]
        .find(task => task.id === taskId)
    : null;

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        // Populate form with existing task data
        reset({
          title: existingTask.title,
          description: existingTask.description || '',
          status: existingTask.status,
          priority: existingTask.priority,
          dueDateObj: existingTask.dueDate ? new Date(existingTask.dueDate) : undefined,
        });
      } else {
        // Clear form for new task
        reset({
          title: '',
          description: '',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDateObj: undefined,
        });
      }
    }
  }, [isOpen, existingTask, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const taskData: CreateTaskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDateObj ? data.dueDateObj.toISOString() : undefined,
      };

      if (isEditing && taskId) {
        await updateTask(taskId, taskData);
      } else {
        await createTask(taskData);
      }

      onClose();
    } catch (error) {
      // Error is handled by the store and displayed via toast
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 dark:bg-black/60" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200',
                  errors.title 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder="Enter task description (optional)"
              />
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  <option value={TaskStatus.TODO}>To Do</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.DONE}>Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  <option value={TaskPriority.LOW}>🟢 Low</option>
                  <option value={TaskPriority.MEDIUM}>🟡 Medium</option>
                  <option value={TaskPriority.HIGH}>🔴 High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <DatePicker
                selected={dueDateObj}
                onChange={(date) => setValue('dueDateObj', date || undefined)}
                dateFormat="MMM d, yyyy"
                placeholderText="Select due date (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                minDate={new Date()}
                isClearable
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                  'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200',
                  isSubmitting
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700'
                )}
              >
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Task' : 'Create Task')
                }
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 
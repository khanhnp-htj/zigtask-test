import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Task, TaskPriority } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/date';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
}

const priorityConfig = {
  [TaskPriority.LOW]: {
    label: 'Low',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '🟢'
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '🟡'
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '🔴'
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit }) => {
  const { deleteTask } = useTaskStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const isTaskOverdue = isOverdue(task.dueDate);
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const priority = priorityConfig[task.priority] || priorityConfig[TaskPriority.MEDIUM];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer',
        isDragging && 'opacity-50'
      )}
      onClick={onEdit}
    >
          <div className="space-y-3">
            {/* Title and Priority */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
                {task.title}
              </h4>
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
                priority.bgColor,
                priority.textColor
              )}>
                <span>{priority.icon}</span>
                {priority.label}
              </span>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {task.description}
              </p>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={clsx(
                'flex items-center space-x-2 text-xs',
                isTaskOverdue ? 'text-red-600' : 'text-gray-500'
              )}>
                {isTaskOverdue ? (
                  <ExclamationTriangleIcon className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                <span>
                  {formatDate(task.dueDate)}
                  {daysUntilDue !== null && (
                    <span className="ml-1">
                      {isTaskOverdue 
                        ? `(${Math.abs(daysUntilDue)} days overdue)`
                        : daysUntilDue === 0 
                          ? '(Due today)'
                          : `(${daysUntilDue} days left)`
                      }
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span>Created {formatDate(task.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
  );
}; 
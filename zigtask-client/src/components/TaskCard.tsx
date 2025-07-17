import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon, FlagIcon } from '@heroicons/react/24/outline';
import { Task, TaskPriority } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
}

const priorityConfig = {
  [TaskPriority.LOW]: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    icon: '🟢',
    label: 'Low',
  },
  [TaskPriority.MEDIUM]: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    icon: '🟡',
    label: 'Medium',
  },
  [TaskPriority.HIGH]: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    icon: '🔴',
    label: 'High',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[task.priority] || priorityConfig[TaskPriority.MEDIUM];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-move"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Edit task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color}`}
          >
            <span className="mr-1">{priority.icon}</span>
            {priority.label}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(new Date(task.dueDate), 'MMM dd')}
          </div>
        )}
      </div>
    </div>
  );
}; 
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import clsx from 'clsx';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (taskId: string) => void;
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
  [TaskStatus.DONE]: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
};

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  onEditTask,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  // Create array of task IDs for sortable context
  const taskIds = tasks.map(task => task.id);

  return (
    <div className={clsx('rounded-lg border-2 border-dashed p-4 transition-colors duration-200', statusColors[status])}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'min-h-[200px] space-y-3 transition-colors',
          isOver && 'bg-primary-50 dark:bg-primary-900/20'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={() => onEditTask(task.id)}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}; 
import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTaskStore } from '../stores/taskStore';
import { TaskStatus, Task } from '../types';
import { TaskColumn } from '../components/TaskColumn';
import { TaskModal } from '../components/TaskModal';
import { TaskFilters } from '../components/TaskFilters';
import { TaskCard } from '../components/TaskCard';

export const Dashboard: React.FC = () => {
  const { tasksByStatus, isLoading, fetchTasksByStatus, moveTask, reorderTasks, filters } = useTaskStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  useEffect(() => {
    fetchTasksByStatus();
  }, [fetchTasksByStatus]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Find the task being dragged
    const allTasks = [
      ...tasksByStatus.todo,
      ...tasksByStatus.in_progress,
      ...tasksByStatus.done,
    ];
    const task = allTasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dragging over the same item, do nothing
    if (activeId === overId) return;

    // Find the containers
    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer) return;

    // If moving between different containers, handle it here
    if (activeContainer !== overContainer) {
      // This will be handled in handleDragEnd for API call
      return;
    }

    // If moving within the same container, reorder locally
    const activeIndex = tasksByStatus[activeContainer].findIndex(task => task.id === activeId);
    const overIndex = tasksByStatus[overContainer].findIndex(task => task.id === overId);

    if (activeIndex !== overIndex) {
      const newTasks = arrayMove(tasksByStatus[activeContainer], activeIndex, overIndex);
      reorderTasks(activeContainer, newTasks);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId as string);

    if (!activeContainer) return;

    // FIXED: Handle cross-column movement properly
    // If dropping on a column directly (status change)
    if (typeof overId === 'string' && Object.values(TaskStatus).includes(overId as TaskStatus)) {
      const newStatus = overId as TaskStatus;
      if (activeContainer !== newStatus) {
        await moveTask(activeId, newStatus);
      }
    }
    // FIXED: If dropping on a task in a different column
    else if (overContainer && activeContainer !== overContainer) {
      await moveTask(activeId, overContainer);
    }
    // If dropping within the same column, the reorder was already handled in handleDragOver
  };

  const findContainer = (id: string): TaskStatus | null => {
    // Check if it's a column ID
    if (Object.values(TaskStatus).includes(id as TaskStatus)) {
      return id as TaskStatus;
    }

    // Find which column contains this task
    for (const [status, tasks] of Object.entries(tasksByStatus)) {
      if (tasks.some((task: Task) => task.id === id)) {
        return status as TaskStatus;
      }
    }

    return null;
  };

  const handleCreateTask = () => {
    setSelectedTaskId(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
  };

  // Helper function to apply all filters to a task array
  const applyFilters = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // Search filter (local search query)
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Priority filter
      const matchesPriority = !filters.priority || task.priority === filters.priority;

      // Date range filters
      const matchesDateFrom = !filters.dateFrom || 
        (task.dueDate && new Date(task.dueDate) >= new Date(filters.dateFrom));
      
      const matchesDateTo = !filters.dateTo || 
        (task.dueDate && new Date(task.dueDate) <= new Date(filters.dateTo));

      return matchesSearch && matchesPriority && matchesDateFrom && matchesDateTo;
    });
  };

  const filteredTasksByStatus = {
    todo: applyFilters(tasksByStatus.todo),
    in_progress: applyFilters(tasksByStatus.in_progress),
    done: applyFilters(tasksByStatus.done),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Dashboard</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your tasks and track progress
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors duration-200"
          />
        </div>
        <TaskFilters />
      </div>

      {/* Task Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            status={TaskStatus.TODO}
            tasks={filteredTasksByStatus.todo}
            onEditTask={handleEditTask}
          />
          <TaskColumn
            title="In Progress"
            status={TaskStatus.IN_PROGRESS}
            tasks={filteredTasksByStatus.in_progress}
            onEditTask={handleEditTask}
          />
          <TaskColumn
            title="Done"
            status={TaskStatus.DONE}
            tasks={filteredTasksByStatus.done}
            onEditTask={handleEditTask}
          />
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-5 opacity-95">
              <TaskCard
                task={activeTask}
                index={0}
                onEdit={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        taskId={selectedTaskId}
      />
    </div>
  );
}; 
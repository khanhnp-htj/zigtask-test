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

  // Configure drag sensors - might need to adjust sensitivity later
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Prevents accidental drags when clicking
      },
    })
  );

  useEffect(() => {
    // Load tasks when component mounts
    fetchTasksByStatus();
  }, [fetchTasksByStatus]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Find the task that's being dragged
    const allTasksFlat = [
      ...tasksByStatus.todo,
      ...tasksByStatus.in_progress,
      ...tasksByStatus.done,
    ];
    const draggedTask = allTasksFlat.find(task => task.id === active.id);
    setActiveTask(draggedTask || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Don't do anything if dragging over itself
    if (activeId === overId) return;

    // Figure out which columns we're dealing with
    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer) return;

    // If moving between different containers, we'll handle it in handleDragEnd
    if (activeContainer !== overContainer) {
      return;
    }

    // Handle reordering within the same column
    const activeIndex = tasksByStatus[activeContainer].findIndex(task => task.id === activeId);
    const overIndex = tasksByStatus[overContainer].findIndex(task => task.id === overId);

    if (activeIndex !== overIndex) {
      const reorderedTasks = arrayMove(tasksByStatus[activeContainer], activeIndex, overIndex);
      reorderTasks(activeContainer, reorderedTasks);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset the active task for drag overlay
    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id;

    // Find which containers are involved
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId as string);

    if (!activeContainer) return;

    // FIXED: Handle cross-column movement properly
    // Scenario 1: Dropping directly on a column header
    if (typeof overId === 'string' && Object.values(TaskStatus).includes(overId as TaskStatus)) {
      const newStatus = overId as TaskStatus;
      if (activeContainer !== newStatus) {
        await moveTask(activeId, newStatus);
      }
    }
    // Scenario 2: Dropping on a task in a different column
    else if (overContainer && activeContainer !== overContainer) {
      await moveTask(activeId, overContainer);
    }
    // Scenario 3: Reordering within same column was already handled in handleDragOver
  };

  // Helper function to determine which column a task belongs to
  const findContainer = (taskId: string): TaskStatus | null => {
    // First check if it's actually a column ID
    if (Object.values(TaskStatus).includes(taskId as TaskStatus)) {
      return taskId as TaskStatus;
    }

    // Otherwise, search through all tasks to find which column contains this task
    for (const [statusKey, tasksInStatus] of Object.entries(tasksByStatus)) {
      const taskExists = tasksInStatus.some((task: Task) => task.id === taskId);
      if (taskExists) {
        return statusKey as TaskStatus;
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

  // Apply search and filter logic to tasks
  const applyFilters = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // Text search filter
      const searchMatch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Priority filter from store
      const priorityMatch = !filters.priority || task.priority === filters.priority;

      // Date range filters
      const dateFromMatch = !filters.dateFrom || 
        (task.dueDate && new Date(task.dueDate) >= new Date(filters.dateFrom));
      
      const dateToMatch = !filters.dateTo || 
        (task.dueDate && new Date(task.dueDate) <= new Date(filters.dateTo));

      return searchMatch && priorityMatch && dateFromMatch && dateToMatch;
    });
  };

  // Get filtered tasks for each status
  const filteredTasksByStatus = {
    todo: applyFilters(tasksByStatus.todo),
    in_progress: applyFilters(tasksByStatus.in_progress),
    done: applyFilters(tasksByStatus.done),
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Search and Filters Section */}
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

      {/* Main Kanban Board */}
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
        
        {/* Drag overlay with visual feedback */}
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

      {/* Task Creation/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        taskId={selectedTaskId}
      />
    </div>
  );
}; 
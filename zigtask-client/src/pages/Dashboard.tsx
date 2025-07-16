import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTaskStore } from '../stores/taskStore';
import { TaskStatus } from '../types';
import { TaskColumn } from '../components/TaskColumn';
import { TaskModal } from '../components/TaskModal';
import { TaskFilters } from '../components/TaskFilters';

export const Dashboard: React.FC = () => {
  const { tasksByStatus, isLoading, fetchTasksByStatus, moveTask } = useTaskStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasksByStatus();
  }, [fetchTasksByStatus]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move task to new status
    const newStatus = destination.droppableId as TaskStatus;
    await moveTask(draggableId, newStatus);
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

  const filteredTasksByStatus = {
    todo: tasksByStatus.todo.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    in_progress: tasksByStatus.in_progress.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    done: tasksByStatus.done.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Manage your tasks and track progress
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <TaskFilters />
      </div>

      {/* Task Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
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
      </DragDropContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        taskId={selectedTaskId}
      />
    </div>
  );
}; 
import React, { useState } from 'react';
import { CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import { useTaskStore } from '../stores/taskStore';
import { TaskPriority } from '../types';
import clsx from 'clsx';
import 'react-datepicker/dist/react-datepicker.css';

const priorityLabels = {
  [TaskPriority.LOW]: '🟢 Low',
  [TaskPriority.MEDIUM]: '🟡 Medium',
  [TaskPriority.HIGH]: '🔴 High',
};

export const TaskFilters: React.FC = () => {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(
    filters.dateFrom ? new Date(filters.dateFrom) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    filters.dateTo ? new Date(filters.dateTo) : null
  );

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    setFilters({
      ...filters,
      dateFrom: date ? date.toISOString().split('T')[0] : undefined,
    });
  };

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    setFilters({
      ...filters,
      dateTo: date ? date.toISOString().split('T')[0] : undefined,
    });
  };

  const handlePriorityChange = (priority: TaskPriority | '') => {
    setFilters({
      ...filters,
      priority: priority || undefined,
    });
  };

  const handleClearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    clearFilters();
  };

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.priority;

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={clsx(
          'inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200',
          hasActiveFilters
            ? 'border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
        )}
      >
        <FunnelIcon className="h-4 w-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200">
            Active
          </span>
        )}
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none z-10 transition-colors duration-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter Tasks</h3>
            
            <div className="space-y-4">
              {/* Priority Filter */}
              <div>
                <label htmlFor="priority-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  id="priority-filter"
                  value={filters.priority || ''}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  <option value="">All Priorities</option>
                  <option value={TaskPriority.HIGH}>{priorityLabels[TaskPriority.HIGH]}</option>
                  <option value={TaskPriority.MEDIUM}>{priorityLabels[TaskPriority.MEDIUM]}</option>
                  <option value={TaskPriority.LOW}>{priorityLabels[TaskPriority.LOW]}</option>
                </select>
              </div>

              {/* Date Filters */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date Range</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      From Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={dateFrom}
                        onChange={handleDateFromChange}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select start date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        isClearable
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      To Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={dateTo}
                        onChange={handleDateToChange}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select end date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        minDate={dateFrom || undefined}
                        isClearable
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
                disabled={!hasActiveFilters}
              >
                Clear filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
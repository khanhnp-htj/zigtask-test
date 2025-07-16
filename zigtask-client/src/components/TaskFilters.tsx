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
          'inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          hasActiveFilters
            ? 'border-primary-300 text-primary-700 bg-primary-50'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        )}
      >
        <FunnelIcon className="h-4 w-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            Active
          </span>
        )}
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filter Tasks</h3>
            
            <div className="space-y-4">
              {/* Priority Filter */}
              <div>
                <label htmlFor="priority-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority-filter"
                  value={filters.priority || ''}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Priorities</option>
                  <option value={TaskPriority.HIGH}>{priorityLabels[TaskPriority.HIGH]}</option>
                  <option value={TaskPriority.MEDIUM}>{priorityLabels[TaskPriority.MEDIUM]}</option>
                  <option value={TaskPriority.LOW}>{priorityLabels[TaskPriority.LOW]}</option>
                </select>
              </div>

              {/* Date Filters */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Due Date Range</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      From Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={dateFrom}
                        onChange={handleDateFromChange}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select start date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        isClearable
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      To Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={dateTo}
                        onChange={handleDateToChange}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select end date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        minDate={dateFrom || undefined}
                        isClearable
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
                disabled={!hasActiveFilters}
              >
                Clear filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700"
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
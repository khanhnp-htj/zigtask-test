import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { DarkModeToggle } from './DarkModeToggle';
import clsx from 'clsx';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ZigTask
            </h1>
          </div>

          {/* Right side - Dark mode toggle and User menu */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 rounded-md px-3 py-2 transition-colors duration-200">
                <UserCircleIcon className="h-6 w-6" />
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDownIcon className="h-4 w-4" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600">
                      {user?.email}
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={clsx(
                            'group flex items-center w-full px-4 py-2 text-sm text-left transition-colors duration-150',
                            active 
                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <ArrowRightOnRectangleIcon 
                            className="mr-3 h-4 w-4" 
                            aria-hidden="true" 
                          />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}; 
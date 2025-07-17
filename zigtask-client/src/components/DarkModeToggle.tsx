import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../stores/themeStore';
import clsx from 'clsx';

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className={clsx(
        'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'focus:ring-offset-white dark:focus:ring-offset-gray-800',
        isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
      )}
      aria-label="Toggle dark mode"
    >
      {/* Toggle circle */}
      <span
        className={clsx(
          'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out',
          isDarkMode ? 'translate-x-7' : 'translate-x-1'
        )}
      />
      
      {/* Sun icon */}
      <SunIcon
        className={clsx(
          'absolute left-1.5 h-4 w-4 transition-opacity duration-300',
          isDarkMode ? 'opacity-0 text-yellow-400' : 'opacity-100 text-yellow-500'
        )}
      />
      
      {/* Moon icon */}
      <MoonIcon
        className={clsx(
          'absolute right-1.5 h-4 w-4 transition-opacity duration-300',
          isDarkMode ? 'opacity-100 text-white' : 'opacity-0 text-gray-400'
        )}
      />
    </button>
  );
}; 
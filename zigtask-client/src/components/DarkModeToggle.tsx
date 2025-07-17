import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../stores/themeStore';
import clsx from 'clsx';

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleToggleClick = () => {
    toggleDarkMode();
    // Small haptic feedback would be nice here on mobile
  };

  return (
    <button
      onClick={handleToggleClick}
      className={clsx(
        // Base button styles
        'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'focus:ring-offset-white dark:focus:ring-offset-gray-800',
        // Dynamic background based on current theme
        isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
      )}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Currently in ${isDarkMode ? 'dark' : 'light'} mode. Click to switch.`}
    >
      {/* The sliding toggle circle */}
      <span
        className={clsx(
          'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out',
          // Slide position based on theme
          isDarkMode ? 'translate-x-7' : 'translate-x-1'
        )}
      />
      
      {/* Sun icon - visible in light mode */}
      <SunIcon
        className={clsx(
          'absolute left-1.5 h-4 w-4 transition-opacity duration-300',
          isDarkMode ? 'opacity-0 text-yellow-400' : 'opacity-100 text-yellow-500'
        )}
      />
      
      {/* Moon icon - visible in dark mode */}
      <MoonIcon
        className={clsx(
          'absolute right-1.5 h-4 w-4 transition-opacity duration-300',
          isDarkMode ? 'opacity-100 text-white' : 'opacity-0 text-gray-400'
        )}
      />
    </button>
  );
}; 
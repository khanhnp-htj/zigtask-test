import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

interface Colors {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

interface Theme {
  colors: Colors;
  isDark: boolean;
}

// Light theme - clean and bright
const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#007AFF',
    primaryDark: '#0056CC',
    background: '#f5f5f5',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#f44336',
    success: '#4CAF50',
    warning: '#FFA502',
    info: '#2196F3',
  },
};

// Dark theme - easier on the eyes
const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#0A84FF', // iOS-style blue
    primaryDark: '#0056CC',
    background: '#1a1a1a',
    surface: '#2c2c2e',
    card: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#a1a1a6',
    border: '#3a3a3c',
    error: '#ff453a',
    success: '#30d158',
    warning: '#ff9f0a',
    info: '#007aff',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'user-theme-preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      // Check if user has a saved preference
      const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      
      if (savedTheme !== null) {
        // User has a preference, use it
        setIsDark(savedTheme === 'dark');
      } else {
        // No preference saved, check system setting
        const systemColorScheme = Appearance.getColorScheme();
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to system preference if storage fails
      const systemColorScheme = Appearance.getColorScheme();
      setIsDark(systemColorScheme === 'dark');
    }
  };

  const setTheme = async (isDarkMode: boolean) => {
    try {
      setIsDark(isDarkMode);
      // Save the user's choice
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
      // Still update the UI even if saving fails
    }
  };

  const toggleTheme = () => {
    const newThemeIsDark = !isDark;
    setTheme(newThemeIsDark);
  };

  // Select the appropriate theme
  const currentTheme = isDark ? darkTheme : lightTheme;

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
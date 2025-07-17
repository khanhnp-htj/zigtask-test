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

const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#0A84FF',
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

const THEME_KEY = 'zigtask_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  const initializeTheme = async () => {
    try {
      // Try to get stored preference
      const storedTheme = await SecureStore.getItemAsync(THEME_KEY);
      
      if (storedTheme !== null) {
        setIsDark(storedTheme === 'dark');
      } else {
        // Use system preference if no stored preference
        const systemColorScheme = Appearance.getColorScheme();
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Fallback to system preference
      const systemColorScheme = Appearance.getColorScheme();
      setIsDark(systemColorScheme === 'dark');
    }
  };

  const setTheme = async (isDarkMode: boolean) => {
    try {
      setIsDark(isDarkMode);
      await SecureStore.setItemAsync(THEME_KEY, isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
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
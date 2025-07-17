import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  initializeTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        isDarkMode: false,

        toggleDarkMode: () => {
          const newDarkMode = !get().isDarkMode;
          set({ isDarkMode: newDarkMode });
          
          // Apply/remove dark class to document
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        },

        setDarkMode: (isDark: boolean) => {
          set({ isDarkMode: isDark });
          
          // Apply/remove dark class to document
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        },

        initializeTheme: () => {
          const { isDarkMode } = get();
          
          // Check system preference if no stored preference
          if (typeof window !== 'undefined') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldUseDark = isDarkMode !== undefined ? isDarkMode : systemPrefersDark;
            
            // Apply the theme
            if (shouldUseDark) {
              document.documentElement.classList.add('dark');
              set({ isDarkMode: true });
            } else {
              document.documentElement.classList.remove('dark');
              set({ isDarkMode: false });
            }
          }
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);

export { useThemeStore };
export default useThemeStore; 
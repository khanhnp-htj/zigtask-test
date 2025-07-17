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
          const currentMode = get().isDarkMode;
          const newDarkMode = !currentMode;
          set({ isDarkMode: newDarkMode });
          
          // Apply/remove dark class to document
          // TODO: Maybe add a smooth transition here later
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        },

        setDarkMode: (isDark: boolean) => {
          set({ isDarkMode: isDark });
          
          // Update the DOM class - could probably optimize this
          const htmlElement = document.documentElement;
          if (isDark) {
            htmlElement.classList.add('dark');
          } else {
            htmlElement.classList.remove('dark');
          }
        },

        initializeTheme: () => {
          const currentState = get();
          
          // Check if we're in a browser environment first
          if (typeof window !== 'undefined') {
            // Get system preference as fallback
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldUseDark = currentState.isDarkMode !== undefined ? currentState.isDarkMode : prefersDark;
            
            // Apply the appropriate theme
            const docElement = document.documentElement;
            if (shouldUseDark) {
              docElement.classList.add('dark');
              set({ isDarkMode: true });
            } else {
              docElement.classList.remove('dark');
              set({ isDarkMode: false });
            }
          }
        },
      }),
      {
        name: 'theme-preferences', // Changed from generic 'theme-store'
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
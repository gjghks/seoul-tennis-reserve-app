'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'default' | 'neo-brutalism';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isNeoBrutalism: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('neo-brutalism');

  useEffect(() => {
    const savedTheme = localStorage.getItem('tennis-theme') as Theme | null;
    if (savedTheme && (savedTheme === 'default' || savedTheme === 'neo-brutalism')) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tennis-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'default' ? 'neo-brutalism' : 'default');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isNeoBrutalism: theme === 'neo-brutalism' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/* eslint-disable react-refresh/only-export-components */
// src/components/ThemeProvider.tsx
'use client'; // <-- บอก Next.js ว่านี่คือ Client Component

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// สร้าง Context สำหรับ Theme
type Theme = 'light' | 'dark' | 'twilight';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// สร้าง Provider Component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light'); // default theme

  // Effect นี้จะทำงานเฉพาะบน Client เท่านั้น
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme && ['light', 'dark', 'twilight'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    // Trigger transition animation
    const overlay = document.querySelector('.theme-transition-overlay');
    if (overlay) {
      overlay.classList.add('active');

      // Remove active class after animation completes
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 250);
    }

    // Small delay to let animation start before changing theme
    setTimeout(() => {
      setThemeState(newTheme);
      const root = document.documentElement;

      // Remove all theme classes
      root.classList.remove('dark', 'twilight');

      // Add appropriate theme class
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else if (newTheme === 'twilight') {
        root.classList.add('twilight');
      }

      localStorage.setItem('theme', newTheme);
    }, 50); // 50ms delay
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="theme-transition-overlay" />
      {children}
    </ThemeContext.Provider>
  );
}

// สร้าง Custom Hook เพื่อให้เรียกใช้ง่าย
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
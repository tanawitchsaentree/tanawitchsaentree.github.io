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
    const root = document.documentElement;
    const overlay = document.querySelector('.theme-transition-overlay') as HTMLElement;

    if (overlay) {
      // Capture current background color before changing
      // const oldBg = getComputedStyle(root).getPropertyValue('--background').trim();

      // Temporarily apply new theme to get new color
      root.classList.remove('dark', 'twilight');
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else if (newTheme === 'twilight') {
        root.classList.add('twilight');
      }
      const newBg = getComputedStyle(root).getPropertyValue('--background').trim();

      // Revert to old theme temporarily
      root.classList.remove('dark', 'twilight');
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'twilight') {
        root.classList.add('twilight');
      }

      // Pass new bg color via CSS variable (used by ::before / ::after stripes)
      overlay.style.setProperty('--sweep-color', newBg);

      // Force reflow so re-triggering works on rapid toggles
      overlay.classList.remove('active');
      void overlay.offsetWidth;
      overlay.classList.add('active');

      // Change theme at exact moment the two stripes cross center (~50% through)
      setTimeout(() => {
        setThemeState(newTheme);
        root.classList.remove('dark', 'twilight');

        if (newTheme === 'dark') {
          root.classList.add('dark');
        } else if (newTheme === 'twilight') {
          root.classList.add('twilight');
        }

        localStorage.setItem('theme', newTheme);
      }, 300); // half of 600ms animation

      // Remove active class after animation completes
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 660);
    } else {
      // Fallback if no overlay
      setThemeState(newTheme);
      root.classList.remove('dark', 'twilight');

      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else if (newTheme === 'twilight') {
        root.classList.add('twilight');
      }

      localStorage.setItem('theme', newTheme);
    }
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
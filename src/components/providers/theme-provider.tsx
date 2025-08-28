'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = 'vikareta-dashboard-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (sessionStorage.getItem(storageKey) as Theme) || defaultTheme;
      } catch {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      );
      document.head.appendChild(css);

      return () => {
        // Force reflow
        (() => window.getComputedStyle(document.body))();

        // Wait for next tick before removing
        setTimeout(() => {
          document.head.removeChild(css);
        }, 1);
      };
    }
  }, [disableTransitionOnChange]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      if (attribute === 'class') {
        root.classList.add(systemTheme);
      } else {
        root.setAttribute(attribute, systemTheme);
      }
      return;
    }

    if (attribute === 'class') {
      root.classList.add(theme);
    } else {
      root.setAttribute(attribute, theme);
    }
  }, [theme, attribute, enableSystem]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try { sessionStorage.setItem(storageKey, theme); } catch {}
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
/**
 * useTheme Hook
 * Manages dark/light theme state with localStorage persistence
 */

import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '../types/kanban';

const THEME_KEY = 'kanban-theme';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
        // Fall back to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        // If user has manually set a theme, don't listen to system changes
        if (localStorage.getItem(THEME_KEY)) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setThemeState(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Toggle between themes
    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(THEME_KEY, newTheme);
            return newTheme;
        });
    }, []);

    // Set specific theme
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    }, []);

    return { theme, toggleTheme, setTheme };
}

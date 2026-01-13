/**
 * useKeyboardShortcuts Hook
 * Provides global keyboard shortcuts for the application
 */

import { useCallback, useEffect } from 'react';

interface ShortcutHandlers {
    onNewBoard?: () => void;
    onNewCard?: () => void;
    onSearch?: () => void;
    onToggleTheme?: () => void;
    onEscape?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        const isInputFocused =
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        // Escape always works
        if (event.key === 'Escape') {
            handlers.onEscape?.();
            return;
        }

        // Other shortcuts don't work in inputs
        if (isInputFocused) return;

        const isCtrlOrCmd = event.ctrlKey || event.metaKey;

        // Ctrl/Cmd + B = New Board
        if (isCtrlOrCmd && event.key === 'b') {
            event.preventDefault();
            handlers.onNewBoard?.();
            return;
        }

        // Ctrl/Cmd + N = New Card
        if (isCtrlOrCmd && event.key === 'n') {
            event.preventDefault();
            handlers.onNewCard?.();
            return;
        }

        // Ctrl/Cmd + K or / = Search
        if ((isCtrlOrCmd && event.key === 'k') || event.key === '/') {
            event.preventDefault();
            handlers.onSearch?.();
            return;
        }

        // Ctrl/Cmd + D = Toggle Theme
        if (isCtrlOrCmd && event.key === 'd') {
            event.preventDefault();
            handlers.onToggleTheme?.();
            return;
        }

        // Ctrl/Cmd + Z = Undo
        if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            handlers.onUndo?.();
            return;
        }

        // Ctrl/Cmd + Shift + Z or Ctrl + Y = Redo
        if ((isCtrlOrCmd && event.shiftKey && event.key === 'z') ||
            (isCtrlOrCmd && event.key === 'y')) {
            event.preventDefault();
            handlers.onRedo?.();
            return;
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Shortcut info for help display
export const KEYBOARD_SHORTCUTS = [
    { keys: ['Ctrl', 'B'], description: 'Yeni board oluştur' },
    { keys: ['Ctrl', 'N'], description: 'Yeni kart ekle' },
    { keys: ['Ctrl', 'K'], description: 'Ara' },
    { keys: ['Ctrl', 'D'], description: 'Tema değiştir' },
    { keys: ['Ctrl', 'Z'], description: 'Geri al' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Yinele' },
    { keys: ['Esc'], description: 'Kapat' },
];

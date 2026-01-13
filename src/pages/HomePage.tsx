/**
 * HomePage
 * Board list view - main dashboard
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { SkeletonBoardCard } from '../components/Skeleton/Skeleton';
import { useToast } from '../components/Toast/Toast';
import { useBoards } from '../hooks/useBoards';
import { KEYBOARD_SHORTCUTS, useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTheme } from '../hooks/useTheme';

export function HomePage() {
    const navigate = useNavigate();
    const { boards, loading, error, createBoard, deleteBoard } = useBoards();
    const { theme, toggleTheme } = useTheme();
    const toast = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Handle create board
    const handleCreateBoard = useCallback(async () => {
        if (newBoardTitle.trim()) {
            const board = await createBoard(newBoardTitle.trim());
            if (board) {
                navigate(`/board/${board.id}`);
                toast.success('Board başarıyla oluşturuldu!');
            }
            setNewBoardTitle('');
            setIsCreating(false);
        }
    }, [newBoardTitle, createBoard, navigate, toast]);

    // Handle delete board
    const handleDeleteBoard = useCallback(async (boardId: string, boardTitle: string) => {
        const confirmed = window.confirm(`"${boardTitle}" board'unu silmek istediğinize emin misiniz?`);
        if (confirmed) {
            const success = await deleteBoard(boardId);
            if (success) {
                toast.success('Board silindi');
            } else {
                toast.error('Board silinemedi');
            }
        }
    }, [deleteBoard, toast]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNewBoard: () => setIsCreating(true),
        onToggleTheme: toggleTheme,
        onEscape: () => {
            setIsCreating(false);
            setNewBoardTitle('');
            setShowShortcuts(false);
        },
    });

    return (
        <div className="app">
            {/* Skip Link */}
            <a href="#main-content" className="skip-link">
                İçeriğe geç
            </a>

            {/* Header */}
            <header className="app-header" role="banner">
                <div className="header-content">
                    <div className="logo">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        <h1>Kanban</h1>
                    </div>

                    <div className="header-actions">
                        {/* Keyboard Shortcuts Button */}
                        <button
                            className="header-btn"
                            onClick={() => setShowShortcuts(true)}
                            title="Klavye kısayolları"
                            aria-label="Klavye kısayollarını göster"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
                            </svg>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            className="header-btn"
                            onClick={toggleTheme}
                            title={`${theme === 'dark' ? 'Açık' : 'Koyu'} temaya geç`}
                            aria-label={`${theme === 'dark' ? 'Açık' : 'Koyu'} temaya geç`}
                        >
                            {theme === 'dark' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main id="main-content" className="app-main" role="main">
                <div className="boards-section">
                    <div className="section-header">
                        <h2>Board'larınız</h2>
                        <button
                            className="btn-create"
                            onClick={() => setIsCreating(true)}
                            aria-label="Yeni board oluştur"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Yeni Board
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="boards-grid" aria-busy="true" aria-label="Yükleniyor">
                            <SkeletonBoardCard />
                            <SkeletonBoardCard />
                            <SkeletonBoardCard />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="error-state" role="alert">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p>{error}</p>
                            <button className="btn-retry" onClick={() => window.location.reload()}>
                                Tekrar Dene
                            </button>
                        </div>
                    )}

                    {/* Boards Grid */}
                    {!loading && !error && (
                        <div className="boards-grid" role="list">
                            {/* Create New Board Card */}
                            {isCreating && (
                                <div className="board-card creating" role="listitem">
                                    <label htmlFor="new-board-input" className="sr-only">
                                        Board adı
                                    </label>
                                    <input
                                        id="new-board-input"
                                        type="text"
                                        className="create-board-input"
                                        placeholder="Board adı..."
                                        value={newBoardTitle}
                                        onChange={(e) => setNewBoardTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateBoard();
                                            if (e.key === 'Escape') {
                                                setIsCreating(false);
                                                setNewBoardTitle('');
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <div className="create-board-actions">
                                        <button className="btn-primary" onClick={handleCreateBoard}>
                                            Oluştur
                                        </button>
                                        <button
                                            className="btn-ghost"
                                            onClick={() => {
                                                setIsCreating(false);
                                                setNewBoardTitle('');
                                            }}
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Board Cards */}
                            {boards.map((board) => (
                                <article
                                    key={board.id}
                                    className="board-card"
                                    onClick={() => navigate(`/board/${board.id}`)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`/board/${board.id}`);
                                        }
                                    }}
                                    role="listitem"
                                    tabIndex={0}
                                    aria-label={`${board.title} board'unu aç`}
                                >
                                    <div className="board-card-content">
                                        <h3>{board.title}</h3>
                                        <p className="board-date">
                                            Oluşturulma: {new Date(board.created_at).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                    <button
                                        className="board-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteBoard(board.id, board.title);
                                        }}
                                        title="Board'u sil"
                                        aria-label={`${board.title} board'unu sil`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <polyline points="3,6 5,6 21,6" />
                                            <path d="M19,6v14a2,2 0 01-2,2H7a2,2 0 01-2-2V6M8,6V4a2,2 0 012-2h4a2,2 0 012,2v2" />
                                        </svg>
                                    </button>
                                </article>
                            ))}

                            {/* Empty State */}
                            {boards.length === 0 && !isCreating && (
                                <div className="empty-state">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                        <rect x="3" y="3" width="7" height="7" rx="1" />
                                        <rect x="14" y="3" width="7" height="7" rx="1" />
                                        <rect x="3" y="14" width="7" height="7" rx="1" />
                                        <rect x="14" y="14" width="7" height="7" rx="1" />
                                    </svg>
                                    <h3>Henüz board yok</h3>
                                    <p>İlk board'unuzu oluşturarak başlayın</p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setIsCreating(true)}
                                    >
                                        Board Oluştur
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <div
                    className="shortcuts-overlay"
                    onClick={() => setShowShortcuts(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Klavye kısayolları"
                >
                    <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="shortcuts-header">
                            <h2>Klavye Kısayolları</h2>
                            <button
                                className="shortcuts-close"
                                onClick={() => setShowShortcuts(false)}
                                aria-label="Kapat"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <ul className="shortcuts-list">
                            {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                                <li key={index} className="shortcut-item">
                                    <span className="shortcut-description">{shortcut.description}</span>
                                    <span className="shortcut-keys">
                                        {shortcut.keys.map((key, keyIndex) => (
                                            <kbd key={keyIndex}>{key}</kbd>
                                        ))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

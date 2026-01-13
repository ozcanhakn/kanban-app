/**
 * Dashboard Page - Main Board List View
 * Shows user's personal and organization boards
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrgSettingsModal } from '../../components/OrgSettings/OrgSettingsModal';
import { SkeletonBoardCard } from '../../components/Skeleton/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useBoards } from '../../hooks/useBoards';
import { KEYBOARD_SHORTCUTS, useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import './DashboardPage.css';

type BoardFilter = 'all' | 'personal' | 'assigned';

export function DashboardPage() {
    const { user, profile, signOut, organizations, currentOrg, setCurrentOrg } = useAuth();
    const { boards, loading, error, deleteBoard, refetch } = useBoards();
    const { theme, toggleTheme } = useTheme();

    const [isCreating, setIsCreating] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showOrgSettings, setShowOrgSettings] = useState(false);

    // Filter boards
    const filteredBoards = boards.filter((board) => {
        if (boardFilter === 'personal') return board.board_type === 'personal';
        if (boardFilter === 'assigned') return board.board_type === 'assigned';
        return true;
    });

    // Handle create board
    const handleCreateBoard = useCallback(async () => {
        if (!newBoardTitle.trim() || !user) return;

        try {
            // Create board directly via supabase for now
            const { error: createError } = await supabase
                .from('boards')
                .insert({
                    title: newBoardTitle.trim(),
                    owner_id: user.id,
                    org_id: currentOrg?.id || null,
                    board_type: 'personal',
                });

            if (createError) throw createError;

            await refetch();
            setNewBoardTitle('');
            setIsCreating(false);
        } catch (err) {
            console.error('Failed to create board:', err);
        }
    }, [newBoardTitle, user, currentOrg, refetch]);

    // Handle delete board
    const handleDeleteBoard = useCallback(async (boardId: string, boardTitle: string) => {
        const confirmed = window.confirm(`"${boardTitle}" panosunu silmek istediğinize emin misiniz?`);
        if (confirmed) {
            await deleteBoard(boardId);
        }
    }, [deleteBoard]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNewBoard: () => setIsCreating(true),
        onToggleTheme: toggleTheme,
        onEscape: () => {
            setIsCreating(false);
            setNewBoardTitle('');
            setShowShortcuts(false);
            setShowUserMenu(false);
            setShowOrgSettings(false);
        },
    });

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo">
                        <span className="logo-icon">📋</span>
                        <span className="logo-text">KanbanFlow</span>
                    </div>

                    {/* Org Switcher */}
                    {organizations.length > 0 && (
                        <div className="org-switcher">
                            <select
                                value={currentOrg?.id || ''}
                                onChange={(e) => {
                                    const org = organizations.find(o => o.id === e.target.value);
                                    setCurrentOrg(org || null);
                                }}
                            >
                                <option value="">Kişisel</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="header-right">
                    {/* Org Settings */}
                    <button
                        className="header-btn"
                        onClick={() => setShowOrgSettings(true)}
                        title="Organizasyon Yönetimi"
                    >
                        🏢
                    </button>

                    {/* Admin Panel (only visible when org is selected) */}
                    {currentOrg && (
                        <Link to="/admin" className="header-btn" title="Yönetici Paneli">
                            🛡️
                        </Link>
                    )}

                    {/* Shortcuts */}
                    <button
                        className="header-btn"
                        onClick={() => setShowShortcuts(true)}
                        title="Klavye kısayolları"
                    >
                        ⌨️
                    </button>

                    {/* Theme Toggle */}
                    <button
                        className="header-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {/* User Menu */}
                    <div className="user-menu-container">
                        <button
                            className="user-avatar-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" />
                            ) : (
                                <span>{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    className="user-menu"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="user-info">
                                        <strong>{profile?.full_name || 'Kullanıcı'}</strong>
                                        <span>{user?.email}</span>
                                    </div>
                                    <hr />
                                    <Link to="/settings" className="menu-item">
                                        ⚙️ Ayarlar
                                    </Link>
                                    <button className="menu-item danger" onClick={signOut}>
                                        🚪 Çıkış Yap
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-content">
                    {/* Section Header */}
                    <div className="section-header">
                        <h1>Panolarım</h1>
                        <button
                            className="btn-create"
                            onClick={() => setIsCreating(true)}
                        >
                            + Yeni Pano
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${boardFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setBoardFilter('all')}
                        >
                            Tümü
                        </button>
                        <button
                            className={`filter-tab ${boardFilter === 'personal' ? 'active' : ''}`}
                            onClick={() => setBoardFilter('personal')}
                        >
                            Kişisel
                        </button>
                        <button
                            className={`filter-tab ${boardFilter === 'assigned' ? 'active' : ''}`}
                            onClick={() => setBoardFilter('assigned')}
                        >
                            Atanmış
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="boards-grid">
                            <SkeletonBoardCard />
                            <SkeletonBoardCard />
                            <SkeletonBoardCard />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="error-state">
                            <p>Hata: {error}</p>
                            <button onClick={() => refetch()}>Tekrar Dene</button>
                        </div>
                    )}

                    {/* Boards Grid */}
                    {!loading && !error && (
                        <div className="boards-grid">
                            {/* Create Board Card */}
                            {isCreating && (
                                <div className="board-card creating">
                                    <input
                                        type="text"
                                        placeholder="Pano adı..."
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
                                    <div className="create-actions">
                                        <button className="btn-primary-sm" onClick={handleCreateBoard}>
                                            Oluştur
                                        </button>
                                        <button
                                            className="btn-ghost-sm"
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
                            {filteredBoards.map((board) => (
                                <Link
                                    key={board.id}
                                    to={`/board/${board.id}`}
                                    className="board-card"
                                >
                                    <div className="board-card-header">
                                        <span className={`board-type ${board.board_type}`}>
                                            {board.board_type === 'personal' ? '👤' : '📌'}
                                        </span>
                                        <button
                                            className="board-delete-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteBoard(board.id, board.title);
                                            }}
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <h3>{board.title}</h3>
                                    <p className="board-date">
                                        {new Date(board.created_at).toLocaleDateString('tr-TR')}
                                    </p>
                                </Link>
                            ))}

                            {/* Empty State */}
                            {filteredBoards.length === 0 && !isCreating && (
                                <div className="empty-state">
                                    <span className="empty-icon">📋</span>
                                    <h3>Henüz pano yok</h3>
                                    <p>İlk panonuzu oluşturarak başlayın</p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setIsCreating(true)}
                                    >
                                        Pano Oluştur
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
                    <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Klavye Kısayolları</h2>
                        <button className="close-btn" onClick={() => setShowShortcuts(false)}>×</button>
                        <ul>
                            {KEYBOARD_SHORTCUTS.map((s, i) => (
                                <li key={i}>
                                    <span>{s.description}</span>
                                    <kbd>{s.keys.join(' + ')}</kbd>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Click outside to close menus */}
            {showUserMenu && (
                <div className="menu-backdrop" onClick={() => setShowUserMenu(false)} />
            )}

            {/* Org Settings Modal */}
            <OrgSettingsModal
                isOpen={showOrgSettings}
                onClose={() => setShowOrgSettings(false)}
            />
        </div>
    );
}

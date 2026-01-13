/**
 * Board Component
 * Main Kanban board with arrow button navigation
 * Features: Toast notifications, Search, Confetti, Keyboard shortcuts
 * Enhanced: Labels, Priority, Subtasks, Filters
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBoard } from '../../hooks/useBoard';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { db, supabase } from '../../lib/supabase';
import type { CardWithLabels, ColumnWithCards, FilterState, Label, Subtask } from '../../types/kanban';
import { DEFAULT_FILTER_STATE } from '../../types/kanban';
import { CardModal } from '../CardModal/CardModal';
import { Column } from '../Column/Column';
import { Confetti, useConfetti } from '../Confetti/Confetti';
import { DeadlineTracker } from '../DeadlineTracker/DeadlineTracker';
import { FilterBar } from '../FilterBar/FilterBar';
import { SearchModal } from '../SearchModal/SearchModal';
import { SkeletonBoard } from '../Skeleton/Skeleton';
import { useToast } from '../Toast/Toast';
import './Board.css';

interface BoardProps {
    boardId: string;
    onBack: () => void;
}

export function Board({ boardId, onBack }: BoardProps) {
    const {
        board,
        columns,
        loading,
        error,
        addColumn,
        updateColumn,
        deleteColumn,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        uploadAttachment,
        deleteAttachment,
        addComment,
        deleteComment,
        toggleSubtask,
        assignCard,
    } = useBoard(boardId);

    const toast = useToast();
    const confetti = useConfetti();

    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
    const [boardLabels, setBoardLabels] = useState<Label[]>([]);

    // Fetch board labels
    const fetchLabels = useCallback(async () => {
        if (!boardId) return;
        const { data } = await db.labels().select('*').eq('board_id', boardId);
        if (data) setBoardLabels(data);
    }, [boardId]);

    // Initial fetch labels
    useEffect(() => {
        fetchLabels();
    }, [fetchLabels]);

    // Filter cards
    const filteredColumns = useMemo(() => {
        if (
            !filterState.searchQuery &&
            filterState.labels.length === 0 &&
            filterState.priorities.length === 0 &&
            filterState.dateFilter === 'all'
        ) {
            return columns;
        }

        return columns.map((col) => ({
            ...col,
            cards: col.cards.filter((card) => {
                // Search filter
                if (filterState.searchQuery) {
                    const query = filterState.searchQuery.toLowerCase();
                    const matchTitle = card.title.toLowerCase().includes(query);
                    const matchDesc = card.description?.toLowerCase().includes(query);
                    if (!matchTitle && !matchDesc) return false;
                }

                // Label filter
                if (filterState.labels.length > 0) {
                    const cardLabelIds = card.labels.map((l) => l.id);
                    const hasMatchingLabel = filterState.labels.some((id) => cardLabelIds.includes(id));
                    if (!hasMatchingLabel) return false;
                }

                // Priority filter
                if (filterState.priorities.length > 0) {
                    if (!filterState.priorities.includes(card.priority)) return false;
                }

                // Date filter
                if (filterState.dateFilter !== 'all') {
                    if (filterState.dateFilter === 'no-date') {
                        if (card.due_date) return false;
                    } else {
                        if (!card.due_date) return false;
                        const dueDate = new Date(card.due_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Reset time parts for accurate day comparison
                        const dueDateDay = new Date(dueDate);
                        dueDateDay.setHours(0, 0, 0, 0);

                        if (filterState.dateFilter === 'overdue') {
                            if (dueDateDay >= today) return false;
                        } else if (filterState.dateFilter === 'today') {
                            if (dueDateDay.getTime() !== today.getTime()) return false;
                        } else if (filterState.dateFilter === 'week') {
                            const nextWeek = new Date(today);
                            nextWeek.setDate(today.getDate() + 7);
                            if (dueDateDay < today || dueDateDay > nextWeek) return false;
                        }
                    }
                }

                return true;
            }),
        }));
    }, [columns, filterState]);

    // Calculate total/filtered card counts
    const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);
    const filteredCards = filteredColumns.reduce((sum, col) => sum + col.cards.length, 0);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNewCard: () => {
            if (columns.length > 0) {
                toast.info('İlk sütundaki "Kart Ekle" butonuna tıklayın');
            }
        },
        onSearch: () => setIsSearchOpen(true),
        onEscape: () => {
            setSelectedCardId(null);
            setIsSearchOpen(false);
            setIsAddingColumn(false);
        },
    });

    // Find card by ID
    const findCard = useCallback((id: string): CardWithLabels | null => {
        for (const column of columns) {
            const card = column.cards.find((c) => c.id === id);
            if (card) return card;
        }
        return null;
    }, [columns]);

    // Find column by ID
    const findColumnById = useCallback((columnId: string): ColumnWithCards | null => {
        return columns.find((col) => col.id === columnId) || null;
    }, [columns]);

    // Check if card moved to "Done" column
    const checkCardCompletion = useCallback((_cardId: string, targetColumnId: string) => {
        const targetColumn = findColumnById(targetColumnId);
        if (targetColumn && targetColumn.title.toLowerCase().includes('done')) {
            confetti.fire();
            toast.success('🎉 Görev tamamlandı!');
        }
    }, [findColumnById, confetti, toast]);

    // Move card to adjacent column (left or right)
    const handleMoveCardToColumn = useCallback(async (cardId: string, direction: 'left' | 'right') => {
        // Find current column index
        const currentColumnIndex = columns.findIndex((col) =>
            col.cards.some((card) => card.id === cardId)
        );

        if (currentColumnIndex === -1) return;

        // Calculate target column index
        const targetColumnIndex = direction === 'left'
            ? currentColumnIndex - 1
            : currentColumnIndex + 1;

        // Validate target column exists
        if (targetColumnIndex < 0 || targetColumnIndex >= columns.length) return;

        const targetColumn = columns[targetColumnIndex];
        if (!targetColumn) return;

        // Move card to top of target column
        const success = await moveCard(cardId, targetColumn.id, 0);

        if (success) {
            checkCardCompletion(cardId, targetColumn.id);
            toast.success(`Kart "${targetColumn.title}" sütununa taşındı`);
        }
    }, [columns, moveCard, checkCardCompletion, toast]);

    // Column handlers
    const handleAddColumn = async () => {
        if (newColumnTitle.trim()) {
            const result = await addColumn(newColumnTitle.trim());
            if (result) toast.success('Sütun eklendi');
            setNewColumnTitle('');
            setIsAddingColumn(false);
        }
    };

    const handleAddCard = async (columnId: string, title: string) => {
        const result = await addCard(columnId, title);
        if (result) toast.success('Kart eklendi');
    };

    const handleDeleteColumn = async (columnId: string, columnTitle: string) => {
        const confirmed = window.confirm(`"${columnTitle}" sütununu silmek istediğinize emin misiniz?`);
        if (confirmed) {
            const success = await deleteColumn(columnId);
            if (success) toast.success('Sütun silindi');
            else toast.error('Sütun silinemedi');
        }
    };

    // Label handlers
    const handleCreateLabel = async (text: string, color: string): Promise<Label | null> => {
        const { data, error } = await db.labels().insert({ board_id: boardId, text, color }).select().single();
        if (error) {
            toast.error('Etiket oluşturulamadı');
            return null;
        }
        setBoardLabels((prev) => [...prev, data]);
        toast.success('Etiket oluşturuldu');
        return data;
    };

    const handleDeleteLabel = async (labelId: string) => {
        await db.labels().delete().eq('id', labelId);
        setBoardLabels((prev) => prev.filter((l) => l.id !== labelId));
    };

    const handleToggleLabel = async (cardId: string, labelId: string, currentLabels: Label[]) => {
        const hasLabel = currentLabels.some((l) => l.id === labelId);
        if (hasLabel) {
            await db.cardLabels().delete().eq('card_id', cardId).eq('label_id', labelId);
        } else {
            await db.cardLabels().insert({ card_id: cardId, label_id: labelId });
        }
        // Refresh will happen via real-time
    };

    // Subtask handlers
    const handleAddSubtask = async (cardId: string, title: string): Promise<Subtask | null> => {
        const { data, error } = await db.subtasks().insert({ card_id: cardId, title, position: 0 }).select().single();
        if (error) {
            toast.error('Alt görev eklenemedi');
            return null;
        }
        return data;
    };

    const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
        const { automationMessage } = await toggleSubtask(subtaskId, isCompleted);
        if (automationMessage) {
            confetti.fire();
            toast.success(automationMessage);
        }
    };

    const handleDeleteSubtask = async (subtaskId: string) => {
        await db.subtasks().delete().eq('id', subtaskId);
    };


    // Selected card
    const handleCardSelect = (cardId: string) => {
        setSelectedCardId(cardId);
        setIsSearchOpen(false);
    };

    const selectedCard = selectedCardId ? findCard(selectedCardId) : null;

    // Loading/Error states
    if (loading) return <SkeletonBoard />;

    if (error) {
        return (
            <div className="board-error" role="alert">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>Hata: {error}</p>
                <button onClick={onBack} className="btn-primary">Geri Dön</button>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="board-error" role="alert">
                <p>Board bulunamadı</p>
                <button onClick={onBack} className="btn-primary">Geri Dön</button>
            </div>
        );
    }

    return (
        <div className="board-container">
            <Confetti isActive={confetti.isActive} onComplete={confetti.onComplete} />

            {/* Header */}
            <header className="board-header" role="banner">
                <button className="back-btn" onClick={onBack} aria-label="Board listesine geri dön">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                    Boards
                </button>
                <h1 className="board-title">{board.title}</h1>
                <div className="header-actions">
                    <button className="header-btn" onClick={() => setIsSearchOpen(true)} aria-label="Kartlarda ara" title="Ara (Ctrl+K)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="board-filter-container">
                <FilterBar
                    labels={boardLabels}
                    filterState={filterState}
                    onFilterChange={setFilterState}
                    onDeadlineClick={() => setIsDeadlineOpen(true)}
                    totalCards={totalCards}
                    filteredCards={filteredCards}
                />
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} columns={columns} onCardSelect={handleCardSelect} />

            <DeadlineTracker
                isOpen={isDeadlineOpen}
                onClose={() => setIsDeadlineOpen(false)}
                columns={columns}
                onCardClick={handleCardSelect}
            />

            {/* Columns */}
            <div className="board-columns" role="list" aria-label="Kanban sütunları">
                {filteredColumns.map((column, index) => (
                    <Column
                        key={column.id}
                        column={column}
                        columnIndex={index}
                        totalColumns={filteredColumns.length}
                        onAddCard={(title) => handleAddCard(column.id, title)}
                        onCardClick={setSelectedCardId}
                        onUpdateTitle={(title) => updateColumn(column.id, title)}
                        onDelete={() => handleDeleteColumn(column.id, column.title)}
                        onDeleteCard={deleteCard}
                        onMoveCardLeft={(cardId) => handleMoveCardToColumn(cardId, 'left')}
                        onMoveCardRight={(cardId) => handleMoveCardToColumn(cardId, 'right')}
                    />
                ))}

                <div className="add-column-container">
                    {isAddingColumn ? (
                        <div className="add-column-form">
                            <input
                                type="text"
                                className="add-column-input"
                                placeholder="Sütun adı..."
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddColumn();
                                    if (e.key === 'Escape') { setIsAddingColumn(false); setNewColumnTitle(''); }
                                }}
                                autoFocus
                            />
                            <div className="add-column-actions">
                                <button className="btn-primary" onClick={handleAddColumn}>Ekle</button>
                                <button className="btn-ghost" onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); }}>İptal</button>
                            </div>
                        </div>
                    ) : (
                        <button className="add-column-btn" onClick={() => setIsAddingColumn(true)} aria-label="Yeni sütun ekle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Sütun Ekle
                        </button>
                    )}
                </div>
            </div>

            {/* Card Modal */}
            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    labels={boardLabels}
                    isOpen={true}
                    onClose={() => setSelectedCardId(null)}
                    onSave={async (cardId, updates) => {
                        await updateCard(cardId, updates);
                        toast.success('Kart güncellendi');
                    }}
                    onDelete={async (cardId) => {
                        await deleteCard(cardId);
                        toast.success('Kart silindi');
                    }}
                    onToggleLabel={async (cardId, labelId) => {
                        const card = findCard(cardId);
                        if (card) {
                            await handleToggleLabel(cardId, labelId, card.labels);
                        }
                    }}
                    onCreateLabel={handleCreateLabel}
                    onDeleteLabel={handleDeleteLabel}
                    onAddSubtask={handleAddSubtask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onUploadAttachment={uploadAttachment}
                    onDeleteAttachment={deleteAttachment}
                    onAddComment={addComment}
                    onDeleteComment={deleteComment}
                    onDownloadAttachment={async (storagePath, _fileName) => {
                        const { data } = await supabase.storage.from('kanban-files').createSignedUrl(storagePath, 60);
                        if (data?.signedUrl) {
                            window.open(data.signedUrl, '_blank');
                        }
                    }}
                    onAssign={async (cardId, userId) => {
                        await assignCard(cardId, userId);
                        toast.success(userId ? 'Kart atandı' : 'Atama kaldırıldı');
                    }}
                />
            )}
        </div>
    );
}

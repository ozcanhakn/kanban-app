/**
 * DeadlineTracker Component
 * Shows all cards with due dates grouped by column (To Do, In Progress, Done)
 * Displays remaining days for each deadline
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { CardWithLabels, ColumnWithCards } from '../../types/kanban';
import './DeadlineTracker.css';

interface DeadlineTrackerProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnWithCards[];
    onCardClick: (cardId: string) => void;
}

type TabType = 'todo' | 'inprogress' | 'done';

interface CardWithDeadline extends CardWithLabels {
    columnTitle: string;
    daysRemaining: number;
    isOverdue: boolean;
    isToday: boolean;
}

export function DeadlineTracker({
    isOpen,
    onClose,
    columns,
    onCardClick,
}: DeadlineTrackerProps) {
    const [activeTab, setActiveTab] = useState<TabType>('todo');

    // Categorize columns
    const categorizeColumn = (title: string): TabType => {
        const lower = title.toLowerCase();
        if (lower.includes('done') || lower.includes('tamamlan') || lower.includes('bitti')) {
            return 'done';
        }
        if (lower.includes('progress') || lower.includes('devam') || lower.includes('yapılıyor')) {
            return 'inprogress';
        }
        return 'todo';
    };

    // Get cards with deadlines grouped by tab
    const cardsByTab = useMemo(() => {
        const result: Record<TabType, CardWithDeadline[]> = {
            todo: [],
            inprogress: [],
            done: [],
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        columns.forEach((column) => {
            const category = categorizeColumn(column.title);

            column.cards.forEach((card) => {
                if (card.due_date) {
                    const dueDate = new Date(card.due_date);
                    dueDate.setHours(0, 0, 0, 0);

                    const diffTime = dueDate.getTime() - today.getTime();
                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    result[category].push({
                        ...card,
                        columnTitle: column.title,
                        daysRemaining,
                        isOverdue: daysRemaining < 0,
                        isToday: daysRemaining === 0,
                    });
                }
            });
        });

        // Sort by days remaining (most urgent first)
        Object.values(result).forEach((cards) => {
            cards.sort((a, b) => a.daysRemaining - b.daysRemaining);
        });

        return result;
    }, [columns]);

    // Format days remaining text
    const formatDaysRemaining = (days: number, isOverdue: boolean, isToday: boolean): string => {
        if (isOverdue) {
            return `${Math.abs(days)} gün gecikti`;
        }
        if (isToday) {
            return 'Bugün!';
        }
        if (days === 1) {
            return 'Yarın';
        }
        return `${days} gün kaldı`;
    };

    // Get tab counts
    const tabCounts = {
        todo: cardsByTab.todo.length,
        inprogress: cardsByTab.inprogress.length,
        done: cardsByTab.done.length,
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="deadline-overlay"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="deadline-modal"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
                    >
                        <div className="deadline-header">
                            <h2>📅 Son Tarih Takibi</h2>
                            <button className="deadline-close-btn" onClick={onClose} aria-label="Kapat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="deadline-tabs">
                            <button
                                className={`deadline-tab ${activeTab === 'todo' ? 'active' : ''}`}
                                onClick={() => setActiveTab('todo')}
                            >
                                📋 Yapılacak
                                {tabCounts.todo > 0 && <span className="tab-count">{tabCounts.todo}</span>}
                            </button>
                            <button
                                className={`deadline-tab ${activeTab === 'inprogress' ? 'active' : ''}`}
                                onClick={() => setActiveTab('inprogress')}
                            >
                                🔄 Devam Eden
                                {tabCounts.inprogress > 0 && <span className="tab-count">{tabCounts.inprogress}</span>}
                            </button>
                            <button
                                className={`deadline-tab ${activeTab === 'done' ? 'active' : ''}`}
                                onClick={() => setActiveTab('done')}
                            >
                                ✅ Tamamlanan
                                {tabCounts.done > 0 && <span className="tab-count">{tabCounts.done}</span>}
                            </button>
                        </div>

                        {/* Card List */}
                        <div className="deadline-content">
                            {cardsByTab[activeTab].length === 0 ? (
                                <div className="deadline-empty">
                                    <p>Bu kategoride son tarihi olan kart yok</p>
                                </div>
                            ) : (
                                <ul className="deadline-list">
                                    {cardsByTab[activeTab].map((card) => (
                                        <li
                                            key={card.id}
                                            className={`deadline-item ${card.isOverdue ? 'overdue' : ''} ${card.isToday ? 'today' : ''}`}
                                            onClick={() => {
                                                onCardClick(card.id);
                                                onClose();
                                            }}
                                        >
                                            <div className="deadline-item-main">
                                                <span className="deadline-item-title">{card.title}</span>
                                                <span className="deadline-item-column">{card.columnTitle}</span>
                                            </div>
                                            <div className="deadline-item-info">
                                                <span className="deadline-item-date">
                                                    {new Date(card.due_date!).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className={`deadline-item-days ${card.isOverdue ? 'overdue' : ''} ${card.isToday ? 'today' : ''}`}>
                                                    {formatDaysRemaining(card.daysRemaining, card.isOverdue, card.isToday)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="deadline-footer">
                            <div className="deadline-summary">
                                <span className="summary-item overdue">
                                    ⚠️ {cardsByTab.todo.filter((c) => c.isOverdue).length + cardsByTab.inprogress.filter((c) => c.isOverdue).length} gecikmiş
                                </span>
                                <span className="summary-item today">
                                    🔥 {cardsByTab.todo.filter((c) => c.isToday).length + cardsByTab.inprogress.filter((c) => c.isToday).length} bugün
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

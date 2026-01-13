/**
 * Card Component
 * Task card with title, description preview, labels, priority, subtasks, and column navigation arrows
 */

import type { CardWithLabels } from '../../types/kanban';
import { PRIORITY_CONFIG } from '../../types/kanban';
import './Card.css';

interface CardProps {
    card: CardWithLabels;
    onClick: () => void;
    onDelete?: () => void;
    /** Current column index (0-based) */
    columnIndex: number;
    /** Total number of columns */
    totalColumns: number;
    /** Move card to left column */
    onMoveLeft?: () => void;
    /** Move card to right column */
    onMoveRight?: () => void;
}

export function Card({
    card,
    onClick,
    onDelete,
    columnIndex,
    totalColumns,
    onMoveLeft,
    onMoveRight
}: CardProps) {
    // Determine which arrows should be enabled
    const canMoveLeft = columnIndex > 0;
    const canMoveRight = columnIndex < totalColumns - 1;

    // Format due date if exists
    const formatDueDate = (date: string | null) => {
        if (!date) return null;
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDay = new Date(d);
        dueDay.setHours(0, 0, 0, 0);

        const isOverdue = dueDay < today;
        const isToday = dueDay.getTime() === today.getTime();
        const isTomorrow = dueDay.getTime() === today.getTime() + 86400000;

        let text = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        if (isToday) text = 'Bugün';
        if (isTomorrow) text = 'Yarın';

        return { text, isOverdue, isToday };
    };

    const dueDate = formatDueDate(card.due_date);
    const priority = card.priority || 'medium';
    const priorityConfig = PRIORITY_CONFIG[priority];

    // Subtask progress
    const subtasks = card.subtasks || [];
    const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
    const hasSubtasks = subtasks.length > 0;

    // Handle arrow button clicks - stop propagation to prevent card click
    const handleMoveLeft = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canMoveLeft && onMoveLeft) {
            onMoveLeft();
        }
    };

    const handleMoveRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canMoveRight && onMoveRight) {
            onMoveRight();
        }
    };

    return (
        <div className="kanban-card-wrapper">
            {/* Card Content */}
            <div
                className="kanban-card"
                role="button"
                tabIndex={0}
                aria-label={`${card.title} - Öncelik: ${priorityConfig.label}`}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick();
                    }
                    if (e.key === 'Delete' && onDelete) {
                        e.preventDefault();
                        onDelete();
                    }
                    if (e.key === 'ArrowLeft' && canMoveLeft && onMoveLeft) {
                        e.preventDefault();
                        onMoveLeft();
                    }
                    if (e.key === 'ArrowRight' && canMoveRight && onMoveRight) {
                        e.preventDefault();
                        onMoveRight();
                    }
                }}
            >
                {/* Labels */}
                {card.labels.length > 0 && (
                    <div className="card-labels">
                        {card.labels.map((label) => (
                            <span
                                key={label.id}
                                className="card-label"
                                style={{ backgroundColor: label.color }}
                                title={label.text}
                            />
                        ))}
                    </div>
                )}

                {/* Title */}
                <h4 className="card-title">{card.title}</h4>

                {/* Description preview */}
                {card.description && (
                    <p className="card-description">{card.description}</p>
                )}

                {/* Footer with badges */}
                <div className="card-footer">
                    {/* Priority Badge */}
                    {priority !== 'medium' && (
                        <span
                            className="card-priority"
                            style={{
                                backgroundColor: `${priorityConfig.color}20`,
                                color: priorityConfig.color,
                            }}
                            title={`Öncelik: ${priorityConfig.label}`}
                        >
                            {priorityConfig.icon}
                        </span>
                    )}

                    {/* Subtasks Progress */}
                    {hasSubtasks && (
                        <span className={`card-subtasks ${completedSubtasks === subtasks.length ? 'complete' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,11 12,14 22,4" />
                                <path d="M21,12v7a2,2 0 01-2,2H5a2,2 0 01-2-2V5a2,2 0 012-2h11" />
                            </svg>
                            {completedSubtasks}/{subtasks.length}
                        </span>
                    )}

                    {/* Due Date */}
                    {dueDate && (
                        <span
                            className={`card-due-date ${dueDate.isOverdue ? 'overdue' : ''} ${dueDate.isToday ? 'today' : ''}`}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12,6 12,12 16,14" />
                            </svg>
                            {dueDate.text}
                        </span>
                    )}

                    {/* Description indicator */}
                    {card.description && (
                        <span className="card-has-description" title="Açıklama var">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14,2H6a2,2 0 00-2,2v16a2,2 0 002,2h12a2,2 0 002-2V8Z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </span>
                    )}
                </div>

                {/* Navigation Arrows */}
                <div className="card-navigation">
                    <button
                        className={`card-nav-btn card-nav-left ${!canMoveLeft ? 'disabled' : ''}`}
                        onClick={handleMoveLeft}
                        disabled={!canMoveLeft}
                        aria-label="Sola taşı"
                        title="Önceki sütuna taşı"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                    </button>
                    <button
                        className={`card-nav-btn card-nav-right ${!canMoveRight ? 'disabled' : ''}`}
                        onClick={handleMoveRight}
                        disabled={!canMoveRight}
                        aria-label="Sağa taşı"
                        title="Sonraki sütuna taşı"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,18 15,12 9,6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}


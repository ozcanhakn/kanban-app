/**
 * Column Component
 * Kanban column with cards, WIP limit, and add card functionality
 */

import { useState } from 'react';
import type { ColumnWithCards } from '../../types/kanban';
import { Card } from '../Card/Card';
import './Column.css';

interface ColumnProps {
    column: ColumnWithCards;
    /** Current column index (0-based) */
    columnIndex: number;
    /** Total number of columns */
    totalColumns: number;
    onAddCard: (title: string) => void;
    onCardClick: (cardId: string) => void;
    onUpdateTitle: (title: string) => void;
    onDelete: () => void;
    onDeleteCard: (cardId: string) => Promise<void | boolean>;
    /** Move card to left (previous) column */
    onMoveCardLeft: (cardId: string) => void;
    /** Move card to right (next) column */
    onMoveCardRight: (cardId: string) => void;
}

export function Column({
    column,
    columnIndex,
    totalColumns,
    onAddCard,
    onCardClick,
    onUpdateTitle,
    onDelete,
    onDeleteCard,
    onMoveCardLeft,
    onMoveCardRight,
}: ColumnProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(column.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');

    // WIP limit check
    const cardCount = column.cards.length;
    const wipLimit = column.wip_limit;
    const isOverLimit = wipLimit !== null && cardCount >= wipLimit;
    const isAtLimit = wipLimit !== null && cardCount === wipLimit;
    const isNearLimit = wipLimit !== null && cardCount === wipLimit - 1;

    // Handle title save
    const handleTitleSave = () => {
        if (title.trim() && title !== column.title) {
            onUpdateTitle(title.trim());
        } else {
            setTitle(column.title);
        }
        setIsEditing(false);
    };

    // Handle add card
    const handleAddCard = () => {
        if (newCardTitle.trim()) {
            onAddCard(newCardTitle.trim());
            setNewCardTitle('');
            setIsAddingCard(false);
        }
    };

    return (
        <div
            className={`kanban-column ${isOverLimit ? 'over-limit' : ''}`}
            role="listitem"
            aria-label={`${column.title} sütunu, ${cardCount} kart`}
        >
            {/* Column Header */}
            <div className="column-header">
                {isEditing ? (
                    <>
                        <label htmlFor={`column-title-${column.id}`} className="sr-only">
                            Sütun adı
                        </label>
                        <input
                            id={`column-title-${column.id}`}
                            type="text"
                            className="column-title-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave();
                                if (e.key === 'Escape') {
                                    setTitle(column.title);
                                    setIsEditing(false);
                                }
                            }}
                            autoFocus
                        />
                    </>
                ) : (
                    <h3
                        className="column-title"
                        onClick={() => setIsEditing(true)}
                        title="Düzenlemek için tıklayın"
                    >
                        {column.title}
                        <span className={`card-count ${isAtLimit ? 'at-limit' : ''} ${isNearLimit ? 'near-limit' : ''}`}>
                            {cardCount}
                            {wipLimit !== null && `/${wipLimit}`}
                        </span>
                    </h3>
                )}

                <button
                    className="column-menu-btn"
                    onClick={onDelete}
                    title="Sütunu sil"
                    aria-label={`${column.title} sütununu sil`}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2 0 01-2,2H7a2,2 0 01-2-2V6M8,6V4a2,2 0 012-2h4a2,2 0 012,2v2" />
                    </svg>
                </button>
            </div>

            {/* WIP Limit Warning */}
            {isOverLimit && (
                <div className="wip-warning" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    WIP limiti aşıldı!
                </div>
            )}

            {/* Cards Container */}
            <div className="column-cards">
                {column.cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        onClick={() => onCardClick(card.id)}
                        onDelete={() => onDeleteCard(card.id)}
                        columnIndex={columnIndex}
                        totalColumns={totalColumns}
                        onMoveLeft={() => onMoveCardLeft(card.id)}
                        onMoveRight={() => onMoveCardRight(card.id)}
                    />
                ))}

                {/* Empty state */}
                {column.cards.length === 0 && !isAddingCard && (
                    <div className="column-empty">
                        <p>Henüz kart yok</p>
                    </div>
                )}
            </div>

            {/* Add Card Section */}
            <div className="column-footer">
                {isAddingCard ? (
                    <div className="add-card-form">
                        <label htmlFor={`add-card-${column.id}`} className="sr-only">
                            Kart başlığı
                        </label>
                        <textarea
                            id={`add-card-${column.id}`}
                            className="add-card-input"
                            placeholder="Kart başlığı..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddCard();
                                }
                                if (e.key === 'Escape') {
                                    setIsAddingCard(false);
                                    setNewCardTitle('');
                                }
                            }}
                            autoFocus
                            rows={2}
                        />
                        <div className="add-card-actions">
                            <button className="btn-primary" onClick={handleAddCard}>
                                Ekle
                            </button>
                            <button
                                className="btn-ghost"
                                onClick={() => {
                                    setIsAddingCard(false);
                                    setNewCardTitle('');
                                }}
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="add-card-btn"
                        onClick={() => setIsAddingCard(true)}
                        disabled={isOverLimit}
                        aria-label="Kart ekle"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Kart Ekle
                    </button>
                )}
            </div>
        </div>
    );
}


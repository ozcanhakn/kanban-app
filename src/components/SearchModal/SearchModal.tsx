/**
 * SearchModal Component
 * Global search modal with keyboard navigation
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { CardWithLabels, ColumnWithCards } from '../../types/kanban';
import './SearchModal.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnWithCards[];
    onCardSelect: (cardId: string) => void;
}

interface SearchResult {
    card: CardWithLabels;
    columnTitle: string;
}

export function SearchModal({ isOpen, onClose, columns, onCardSelect }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            // Small delay to ensure modal is rendered
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchQuery = query.toLowerCase();
        const matchingCards: SearchResult[] = [];

        columns.forEach((column) => {
            column.cards.forEach((card) => {
                const titleMatch = card.title.toLowerCase().includes(searchQuery);
                const descMatch = card.description?.toLowerCase().includes(searchQuery);

                if (titleMatch || descMatch) {
                    matchingCards.push({
                        card,
                        columnTitle: column.title,
                    });
                }
            });
        });

        setResults(matchingCards);
        setSelectedIndex(0);
    }, [query, columns]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                event.preventDefault();
                if (results[selectedIndex]) {
                    onCardSelect(results[selectedIndex].card.id);
                    onClose();
                }
                break;
            case 'Escape':
                onClose();
                break;
        }
    }, [results, selectedIndex, onCardSelect, onClose]);

    // Handle result click
    const handleResultClick = useCallback((cardId: string) => {
        onCardSelect(cardId);
        onClose();
    }, [onCardSelect, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="search-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Kart ara"
        >
            <div
                className="search-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="search-input-container">
                    <svg
                        className="search-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Kartlarda ara..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-label="Arama terimi"
                        autoComplete="off"
                    />
                    <kbd className="search-shortcut">ESC</kbd>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <ul className="search-results" role="listbox">
                        {results.map((result, index) => (
                            <li
                                key={result.card.id}
                                className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                                onClick={() => handleResultClick(result.card.id)}
                                role="option"
                                aria-selected={index === selectedIndex}
                            >
                                <div className="search-result-content">
                                    <span className="search-result-title">{result.card.title}</span>
                                    {result.card.description && (
                                        <span className="search-result-description">
                                            {result.card.description.slice(0, 60)}
                                            {result.card.description.length > 60 ? '...' : ''}
                                        </span>
                                    )}
                                </div>
                                <span className="search-result-column">{result.columnTitle}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {/* No Results */}
                {query && results.length === 0 && (
                    <div className="search-no-results">
                        <p>Sonuç bulunamadı</p>
                    </div>
                )}

                {/* Empty State */}
                {!query && (
                    <div className="search-empty">
                        <p>Kart başlığı veya açıklaması yazarak arayın</p>
                        <div className="search-hints">
                            <span><kbd>↑</kbd><kbd>↓</kbd> gezin</span>
                            <span><kbd>Enter</kbd> seç</span>
                            <span><kbd>Esc</kbd> kapat</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

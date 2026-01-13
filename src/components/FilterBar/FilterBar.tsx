/**
 * FilterBar Component
 * Provides filtering options for cards
 */

import { useState } from 'react';
import type { FilterState, Label, Priority } from '../../types/kanban';
import { DEFAULT_FILTER_STATE, PRIORITY_CONFIG } from '../../types/kanban';
import './FilterBar.css';

interface FilterBarProps {
    labels: Label[];
    filterState: FilterState;
    onFilterChange: (filter: FilterState) => void;
    onDeadlineClick: () => void;
    totalCards: number;
    filteredCards: number;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export function FilterBar({
    labels,
    filterState,
    onFilterChange,
    onDeadlineClick,
    totalCards,
    filteredCards,
}: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasActiveFilters =
        filterState.searchQuery ||
        filterState.labels.length > 0 ||
        filterState.priorities.length > 0 ||
        filterState.dateFilter !== 'all';

    const handleSearchChange = (query: string) => {
        onFilterChange({ ...filterState, searchQuery: query });
    };

    const toggleLabel = (labelId: string) => {
        const newLabels = filterState.labels.includes(labelId)
            ? filterState.labels.filter((id) => id !== labelId)
            : [...filterState.labels, labelId];
        onFilterChange({ ...filterState, labels: newLabels });
    };

    const togglePriority = (priority: Priority) => {
        const newPriorities = filterState.priorities.includes(priority)
            ? filterState.priorities.filter((p) => p !== priority)
            : [...filterState.priorities, priority];
        onFilterChange({ ...filterState, priorities: newPriorities });
    };

    const clearFilters = () => {
        onFilterChange(DEFAULT_FILTER_STATE);
    };

    return (
        <div className="filter-bar">
            {/* Search Input */}
            <div className="filter-search">
                <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Kartlarda ara..."
                    value={filterState.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
                {filterState.searchQuery && (
                    <button
                        className="filter-clear-search"
                        onClick={() => handleSearchChange('')}
                        aria-label="Aramayı temizle"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filter Toggle */}
            <button
                className={`filter-toggle ${isExpanded ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
                </svg>
                Filtrele
                {hasActiveFilters && <span className="filter-count">{filteredCards}/{totalCards}</span>}
            </button>

            {/* Deadline Tracker Button */}
            <button className="filter-toggle" onClick={onDeadlineClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Göz At
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button className="filter-clear-btn" onClick={clearFilters}>
                    Temizle
                </button>
            )}

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="filter-panel">
                    {/* Labels Filter */}
                    <div className="filter-section">
                        <h5>Etiketler</h5>
                        <div className="filter-chips">
                            {labels.map((label) => (
                                <button
                                    key={label.id}
                                    className={`filter-chip ${filterState.labels.includes(label.id) ? 'active' : ''}`}
                                    onClick={() => toggleLabel(label.id)}
                                    style={{
                                        '--chip-color': label.color,
                                    } as React.CSSProperties}
                                >
                                    {label.text}
                                </button>
                            ))}
                            {labels.length === 0 && (
                                <span className="filter-empty">Etiket yok</span>
                            )}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="filter-section">
                        <h5>Öncelik</h5>
                        <div className="filter-chips">
                            {PRIORITIES.map((priority) => {
                                const config = PRIORITY_CONFIG[priority];
                                return (
                                    <button
                                        key={priority}
                                        className={`filter-chip ${filterState.priorities.includes(priority) ? 'active' : ''}`}
                                        onClick={() => togglePriority(priority)}
                                        style={{
                                            '--chip-color': config.color,
                                        } as React.CSSProperties}
                                    >
                                        {config.icon} {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="filter-section">
                        <h5>Tarih</h5>
                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${filterState.dateFilter === 'all' ? 'active' : ''}`}
                                onClick={() => onFilterChange({ ...filterState, dateFilter: 'all' })}
                            >
                                Tümü
                            </button>
                            <button
                                className={`filter-chip ${filterState.dateFilter === 'today' ? 'active' : ''}`}
                                onClick={() => onFilterChange({ ...filterState, dateFilter: 'today' })}
                                style={{ '--chip-color': '#3b82f6' } as React.CSSProperties}
                            >
                                📅 Bugün
                            </button>
                            <button
                                className={`filter-chip ${filterState.dateFilter === 'week' ? 'active' : ''}`}
                                onClick={() => onFilterChange({ ...filterState, dateFilter: 'week' })}
                                style={{ '--chip-color': '#8b5cf6' } as React.CSSProperties}
                            >
                                📅 Bu Hafta
                            </button>
                            <button
                                className={`filter-chip ${filterState.dateFilter === 'overdue' ? 'active' : ''}`}
                                onClick={() => onFilterChange({ ...filterState, dateFilter: 'overdue' })}
                                style={{ '--chip-color': '#ef4444' } as React.CSSProperties}
                            >
                                ⚠️ Gecikmiş
                            </button>
                            <button
                                className={`filter-chip ${filterState.dateFilter === 'no-date' ? 'active' : ''}`}
                                onClick={() => onFilterChange({ ...filterState, dateFilter: 'no-date' })}
                                style={{ '--chip-color': '#64748b' } as React.CSSProperties}
                            >
                                Tarihsiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

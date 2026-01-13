/**
 * SubtaskList Component
 * Manages subtasks/checklist for a card
 */

import { useState, type KeyboardEvent } from 'react';
import type { Subtask } from '../../types/kanban';
import './SubtaskList.css';

interface SubtaskListProps {
    subtasks: Subtask[];
    onAddSubtask: (title: string) => Promise<Subtask | null>;
    onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
    onDeleteSubtask: (subtaskId: string) => void;
    onUpdateSubtask: (subtaskId: string, title: string) => void;
}

export function SubtaskList({
    subtasks,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onUpdateSubtask,
}: SubtaskListProps) {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const completedCount = subtasks.filter((s) => s.is_completed).length;
    const totalCount = subtasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const handleAdd = async () => {
        if (newSubtaskTitle.trim()) {
            await onAddSubtask(newSubtaskTitle.trim());
            setNewSubtaskTitle('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const startEditing = (subtask: Subtask) => {
        setEditingId(subtask.id);
        setEditingTitle(subtask.title);
    };

    const saveEdit = (subtaskId: string) => {
        if (editingTitle.trim()) {
            onUpdateSubtask(subtaskId, editingTitle.trim());
        }
        setEditingId(null);
        setEditingTitle('');
    };

    return (
        <div className="subtask-list">
            {/* Header with progress */}
            <div className="subtask-header">
                <h4>Alt Görevler</h4>
                {totalCount > 0 && (
                    <span className="subtask-count">
                        {completedCount}/{totalCount}
                    </span>
                )}
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
                <div className="subtask-progress">
                    <div
                        className="subtask-progress-bar"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            )}

            {/* Subtask items */}
            <ul className="subtask-items" role="list">
                {subtasks.map((subtask) => (
                    <li key={subtask.id} className="subtask-item">
                        <input
                            type="checkbox"
                            className="subtask-checkbox"
                            checked={subtask.is_completed}
                            onChange={(e) => onToggleSubtask(subtask.id, e.target.checked)}
                            aria-label={`${subtask.title} - ${subtask.is_completed ? 'tamamlandı' : 'tamamlanmadı'}`}
                        />

                        {editingId === subtask.id ? (
                            <input
                                type="text"
                                className="subtask-edit-input"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => saveEdit(subtask.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit(subtask.id);
                                    if (e.key === 'Escape') {
                                        setEditingId(null);
                                        setEditingTitle('');
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            <span
                                className={`subtask-title ${subtask.is_completed ? 'completed' : ''}`}
                                onClick={() => startEditing(subtask)}
                                title="Düzenlemek için tıklayın"
                            >
                                {subtask.title}
                            </span>
                        )}

                        <button
                            className="subtask-delete-btn"
                            onClick={() => onDeleteSubtask(subtask.id)}
                            aria-label={`${subtask.title} alt görevini sil`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>

            {/* Add new subtask */}
            <div className="subtask-add">
                <input
                    type="text"
                    className="subtask-add-input"
                    placeholder="Alt görev ekle..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="subtask-add-btn"
                    onClick={handleAdd}
                    disabled={!newSubtaskTitle.trim()}
                    aria-label="Alt görev ekle"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

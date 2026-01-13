/**
 * LabelPicker Component
 * Allows selecting and managing labels for a card
 */

import { useCallback, useState } from 'react';
import type { Label } from '../../types/kanban';
import { DEFAULT_LABEL_COLORS } from '../../types/kanban';
import './LabelPicker.css';

interface LabelPickerProps {
    labels: Label[];
    selectedLabelIds: string[];
    onToggleLabel: (labelId: string) => void;
    onCreateLabel: (text: string, color: string) => Promise<Label | null>;
    onDeleteLabel: (labelId: string) => void;
}

export function LabelPicker({
    labels,
    selectedLabelIds,
    onToggleLabel,
    onCreateLabel,
    onDeleteLabel,
}: LabelPickerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newLabelText, setNewLabelText] = useState('');
    const [selectedColor, setSelectedColor] = useState(DEFAULT_LABEL_COLORS[0]);

    const handleCreate = useCallback(async () => {
        if (newLabelText.trim()) {
            const created = await onCreateLabel(newLabelText.trim(), selectedColor);
            if (created) {
                setNewLabelText('');
                setIsCreating(false);
                setSelectedColor(DEFAULT_LABEL_COLORS[0]);
            }
        }
    }, [newLabelText, selectedColor, onCreateLabel]);

    return (
        <div className="label-picker">
            <div className="label-picker-header">
                <h4>Etiketler</h4>
            </div>

            {/* Label List */}
            <div className="label-list">
                {labels.map((label) => {
                    const isSelected = selectedLabelIds.includes(label.id);
                    return (
                        <div key={label.id} className="label-item">
                            <button
                                className={`label-select-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => onToggleLabel(label.id)}
                                style={{ backgroundColor: label.color }}
                            >
                                <span className="label-text">{label.text}</span>
                                {isSelected && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20,6 9,17 4,12" />
                                    </svg>
                                )}
                            </button>
                            <button
                                className="label-delete-btn"
                                onClick={() => onDeleteLabel(label.id)}
                                title="Etiketi sil"
                                aria-label={`${label.text} etiketini sil`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    );
                })}

                {labels.length === 0 && !isCreating && (
                    <p className="no-labels">Henüz etiket yok</p>
                )}
            </div>

            {/* Create New Label */}
            {isCreating ? (
                <div className="label-create-form">
                    <input
                        type="text"
                        className="label-name-input"
                        placeholder="Etiket adı..."
                        value={newLabelText}
                        onChange={(e) => setNewLabelText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') {
                                setIsCreating(false);
                                setNewLabelText('');
                            }
                        }}
                        autoFocus
                    />

                    <div className="color-picker">
                        {DEFAULT_LABEL_COLORS.map((color) => (
                            <button
                                key={color}
                                className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedColor(color)}
                                aria-label={`Renk seç: ${color}`}
                            />
                        ))}
                    </div>

                    <div className="label-create-actions">
                        <button className="btn-sm-primary" onClick={handleCreate}>
                            Oluştur
                        </button>
                        <button
                            className="btn-sm-ghost"
                            onClick={() => {
                                setIsCreating(false);
                                setNewLabelText('');
                            }}
                        >
                            İptal
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="create-label-btn"
                    onClick={() => setIsCreating(true)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Yeni Etiket Oluştur
                </button>
            )}
        </div>
    );
}

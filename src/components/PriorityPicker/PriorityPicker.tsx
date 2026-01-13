/**
 * PriorityPicker Component
 * Allows selecting priority level for a card
 */

import type { Priority } from '../../types/kanban';
import { PRIORITY_CONFIG } from '../../types/kanban';
import './PriorityPicker.css';

interface PriorityPickerProps {
    value: Priority;
    onChange: (priority: Priority) => void;
    compact?: boolean;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export function PriorityPicker({ value, onChange, compact = false }: PriorityPickerProps) {
    if (compact) {
        return (
            <div className="priority-picker-compact">
                <select
                    className="priority-select"
                    value={value}
                    onChange={(e) => onChange(e.target.value as Priority)}
                    style={{ borderColor: PRIORITY_CONFIG[value].color }}
                >
                    {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                            {PRIORITY_CONFIG[priority].icon} {PRIORITY_CONFIG[priority].label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="priority-picker">
            <div className="priority-picker-header">
                <h4>Öncelik</h4>
            </div>
            <div className="priority-options">
                {PRIORITIES.map((priority) => {
                    const config = PRIORITY_CONFIG[priority];
                    const isSelected = value === priority;

                    return (
                        <button
                            key={priority}
                            className={`priority-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => onChange(priority)}
                            style={{
                                '--priority-color': config.color,
                            } as React.CSSProperties}
                            aria-pressed={isSelected}
                        >
                            <span className="priority-icon">{config.icon}</span>
                            <span className="priority-label">{config.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Badge component for showing priority in cards
interface PriorityBadgeProps {
    priority: Priority;
    small?: boolean;
}

export function PriorityBadge({ priority, small = false }: PriorityBadgeProps) {
    const config = PRIORITY_CONFIG[priority];

    return (
        <span
            className={`priority-badge ${small ? 'small' : ''}`}
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
            title={`Öncelik: ${config.label}`}
        >
            <span className="priority-badge-icon">{config.icon}</span>
            {!small && <span className="priority-badge-text">{config.label}</span>}
        </span>
    );
}

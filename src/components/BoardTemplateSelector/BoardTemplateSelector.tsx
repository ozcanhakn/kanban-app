/**
 * BoardTemplateSelector Component
 * Allows selecting a template when creating a new board
 */

import { useEffect, useState } from 'react';
import { db } from '../../lib/supabase';
import type { BoardTemplate } from '../../types/kanban';
import './BoardTemplateSelector.css';

interface BoardTemplateSelectorProps {
    onSelect: (template: BoardTemplate | null) => void;
    selectedTemplateId: string | null;
}

export function BoardTemplateSelector({
    onSelect,
    selectedTemplateId
}: BoardTemplateSelectorProps) {
    const [templates, setTemplates] = useState<BoardTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const { data, error } = await db.boardTemplates()
                    .select('*')
                    .order('is_default', { ascending: false })
                    .order('name');

                if (error) throw error;

                // Parse columns_config from JSON
                const parsedTemplates: BoardTemplate[] = (data || []).map((t) => ({
                    ...t,
                    columns_config: typeof t.columns_config === 'string'
                        ? JSON.parse(t.columns_config)
                        : t.columns_config,
                }));

                setTemplates(parsedTemplates);
            } catch (err) {
                console.error('Error fetching templates:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTemplates();
    }, []);

    if (loading) {
        return (
            <div className="template-selector-loading">
                <div className="template-skeleton" />
                <div className="template-skeleton" />
                <div className="template-skeleton" />
            </div>
        );
    }

    return (
        <div className="template-selector">
            <h4 className="template-selector-title">Şablon Seçin</h4>

            <div className="template-grid">
                {/* Blank Template Option */}
                <button
                    className={`template-card ${selectedTemplateId === null ? 'selected' : ''}`}
                    onClick={() => onSelect(null)}
                >
                    <div className="template-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                    </div>
                    <div className="template-info">
                        <h5>Boş Board</h5>
                        <p>Sıfırdan başlayın</p>
                    </div>
                </button>

                {/* Template Options */}
                {templates.map((template) => (
                    <button
                        key={template.id}
                        className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
                        onClick={() => onSelect(template)}
                    >
                        {template.is_default && <span className="template-badge">Önerilen</span>}
                        <div className="template-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </div>
                        <div className="template-info">
                            <h5>{template.name}</h5>
                            <p>{template.description || `${template.columns_config.length} sütun`}</p>
                        </div>
                        <div className="template-columns">
                            {template.columns_config.slice(0, 4).map((col, idx) => (
                                <span key={idx} className="template-column-tag">
                                    {col.title}
                                    {col.wip_limit && <small> ({col.wip_limit})</small>}
                                </span>
                            ))}
                            {template.columns_config.length > 4 && (
                                <span className="template-column-more">
                                    +{template.columns_config.length - 4}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

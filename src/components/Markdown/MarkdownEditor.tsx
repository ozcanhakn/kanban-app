/**
 * Markdown Editor Component
 * Supports Write/Preview modes and GitHub Flavored Markdown
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

export function MarkdownEditor({ value, onChange, placeholder, readOnly = false }: MarkdownEditorProps) {
    const [mode, setMode] = useState<'write' | 'preview'>('write');

    if (readOnly) {
        return (
            <div className="markdown-preview read-only">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {value || '*Açıklama yok*'}
                </ReactMarkdown>
            </div>
        );
    }

    return (
        <div className="markdown-editor">
            <div className="markdown-tabs">
                <button
                    type="button"
                    className={`markdown-tab ${mode === 'write' ? 'active' : ''}`}
                    onClick={() => setMode('write')}
                >
                    Düzenle
                </button>
                <button
                    type="button"
                    className={`markdown-tab ${mode === 'preview' ? 'active' : ''}`}
                    onClick={() => setMode('preview')}
                >
                    Önizleme
                </button>
            </div>

            <div className="markdown-content">
                {mode === 'write' ? (
                    <textarea
                        className="markdown-textarea"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        spellCheck={false}
                    />
                ) : (
                    <div className="markdown-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value || '*Önizlenecek içerik yok*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <div className="markdown-footer">
                <a
                    href="https://guides.github.com/features/mastering-markdown/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="markdown-help-link"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Markdown desteklenir
                </a>
            </div>
        </div>
    );
}

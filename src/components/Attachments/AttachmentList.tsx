/**
 * Attachment List Component
 * Displays list of file attachments with download/delete actions
 */

import type { Attachment } from '../../types/kanban';
import './AttachmentList.css';

interface AttachmentListProps {
    attachments: Attachment[];
    onDelete: (id: string, storagePath: string) => void;
    onDownload: (storagePath: string, fileName: string) => void;
    readOnly?: boolean;
}

export function AttachmentList({ attachments, onDelete, onDownload, readOnly = false }: AttachmentListProps) {
    if (attachments.length === 0) {
        return null;
    }

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Get file icon based on type
    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            );
        } else if (fileType === 'application/pdf') {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            );
        } else {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                </svg>
            );
        }
    };

    return (
        <div className="attachment-list">
            <h4 className="attachment-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                Ekler ({attachments.length})
            </h4>
            <div className="attachment-grid">
                {attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                        <div className="attachment-icon">
                            {getFileIcon(attachment.file_type)}
                        </div>
                        <div className="attachment-info">
                            <span className="attachment-name" title={attachment.file_name}>
                                {attachment.file_name}
                            </span>
                            <span className="attachment-size">
                                {formatSize(attachment.file_size)}
                            </span>
                        </div>
                        <div className="attachment-actions">
                            <button
                                className="attachment-action-btn download"
                                onClick={() => onDownload(attachment.storage_path, attachment.file_name)}
                                title="İndir"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </button>
                            {!readOnly && (
                                <button
                                    className="attachment-action-btn delete"
                                    onClick={() => onDelete(attachment.id, attachment.storage_path)}
                                    title="Sil"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

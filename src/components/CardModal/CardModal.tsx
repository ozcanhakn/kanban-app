/**
 * CardModal Component
 * Card detail modal with local draft state
 * Changes are only saved when user clicks "Kaydet" button
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { CardWithLabels, Label, Priority, Subtask } from '../../types/kanban';
import { DESCRIPTION_TEMPLATES } from '../../types/templates';
import { ActivityLog } from '../Activity/ActivityLog';
import { AssigneePicker } from '../AssigneePicker/AssigneePicker';
import { AttachmentList } from '../Attachments/AttachmentList';
import { CommentSection } from '../Comments/CommentSection';
import { LabelPicker } from '../LabelPicker/LabelPicker';
import { MarkdownEditor } from '../Markdown/MarkdownEditor';
// Styles
import './CardModal.css';


interface CardModalProps {
    card: CardWithLabels;
    labels: Label[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (cardId: string, updates: {
        title?: string;
        description?: string;
        priority?: Priority;
        due_date?: string | null;
    }) => Promise<void>;
    onDelete: (cardId: string) => Promise<void>;
    onToggleLabel: (cardId: string, labelId: string) => Promise<void>;
    onCreateLabel: (text: string, color: string) => Promise<Label | null>;
    onDeleteLabel: (labelId: string) => Promise<void>;
    onAddSubtask: (cardId: string, title: string) => Promise<Subtask | null>;
    onToggleSubtask: (subtaskId: string, isCompleted: boolean) => Promise<void>;
    onDeleteSubtask: (subtaskId: string) => Promise<void>;
    onUploadAttachment?: (cardId: string, file: File) => Promise<boolean>;
    onDeleteAttachment?: (attachmentId: string, storagePath: string) => Promise<boolean>;
    onDownloadAttachment?: (storagePath: string, fileName: string) => void;
    onAddComment?: (cardId: string, content: string) => Promise<void>;
    onDeleteComment?: (commentId: string) => Promise<void>;
    onAssign?: (cardId: string, userId: string | null) => Promise<void>;
}

export function CardModal({
    card,
    labels,
    isOpen,
    onClose,
    onSave,
    onDelete,
    onToggleLabel,
    onCreateLabel,
    onDeleteLabel,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onUploadAttachment,
    onDeleteAttachment,
    onDownloadAttachment,
    onAddComment,
    onDeleteComment,
    onAssign,
}: CardModalProps) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [priority, setPriority] = useState<Priority>(card.priority || 'medium');
    const [dueDate, setDueDate] = useState(card.due_date || '');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Tabs
    const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

    // Subtask state
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);

    // Label state (simplified for direct toggle)
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(card.labels.map(l => l.id));

    // Attachment state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(card.title);
            setDescription(card.description || '');
            setPriority(card.priority || 'medium');
            setDueDate(card.due_date?.split('T')[0] || ''); // Ensure date format for input
            setSelectedLabelIds(card.labels.map(l => l.id));
            setHasUnsavedChanges(false);
            setActiveTab('details'); // Reset tab on open
        }
    }, [isOpen, card]);

    // Track changes
    const handleChange = (field: 'title' | 'description' | 'priority' | 'date', value: any) => {
        setHasUnsavedChanges(true);
        switch (field) {
            case 'title': setTitle(value); break;
            case 'description': setDescription(value); break;
            case 'priority': setPriority(value); break;
            case 'date': setDueDate(value); break;
        }
    };

    // Label toggle (direct)
    const handleToggleLabel = async (labelId: string) => {
        setHasUnsavedChanges(true);
        await onToggleLabel(card.id, labelId);
        setSelectedLabelIds(prev =>
            prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
        );
    };

    const handleSave = async () => {
        // Check if any actual changes were made to the main card fields
        const titleChanged = title !== card.title;
        const descChanged = description !== (card.description || '');
        const priorityChanged = priority !== (card.priority || 'medium');
        const dateChanged = dueDate !== (card.due_date?.split('T')[0] || '');

        if (titleChanged || descChanged || priorityChanged || dateChanged) {
            await onSave(card.id, {
                title,
                description: description || undefined,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
            });
        }
        setHasUnsavedChanges(false);
        onClose();
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirm = window.confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?');
            if (!confirm) return;
        }
        onClose();
    };

    // File Upload Handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUploadAttachment) return;

        // Size check (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        setIsUploading(true);
        try {
            const success = await onUploadAttachment(card.id, file);
            if (!success) alert('Dosya yüklenemedi.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAttachmentDelete = async (attachmentId: string, storagePath: string) => {
        if (!onDeleteAttachment) return;
        if (window.confirm('Bu eki silmek istediğinize emin misiniz?')) {
            await onDeleteAttachment(attachmentId, storagePath);
        }
    };

    const handleAddSubtaskSubmit = async () => {
        if (newSubtaskTitle.trim()) {
            await onAddSubtask(card.id, newSubtaskTitle.trim());
            setNewSubtaskTitle('');
            setIsAddingSubtask(false);
        }
    };

    const handleAddComment = async (content: string) => {
        if (onAddComment) {
            await onAddComment(card.id, content);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="card-modal-overlay-v2"
                    onClick={handleCancel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="card-modal-v2"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
                    >
                        {/* Header */}
                        <div className="modal-header-v2">
                            <input
                                type="text"
                                className="modal-title-input"
                                value={title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="Kart başlığı"
                            />
                            <button className="modal-close-btn" onClick={handleCancel}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="modal-tabs-v2">
                            <button
                                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Detaylar
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                                onClick={() => setActiveTab('activity')}
                            >
                                Aktivite & Yorumlar
                            </button>
                        </div>

                        <div className="modal-content-v2">
                            {activeTab === 'details' ? (
                                <>
                                    <div className="modal-main-v2">
                                        {/* Description Section */}
                                        <div className="modal-section">
                                            <h4 className="section-title">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10 9 9 9 8 9" />
                                                </svg>
                                                Açıklama
                                            </h4>

                                            <MarkdownEditor
                                                value={description}
                                                onChange={(val) => handleChange('description', val)}
                                                placeholder="Kart detaylarını buraya yazın... (Markdown desteklenir)"
                                            />

                                            {/* Templates */}
                                            <div className="description-templates">
                                                <span className="template-label">Şablonlar:</span>
                                                {DESCRIPTION_TEMPLATES.map((tmpl) => (
                                                    <button
                                                        key={tmpl.id}
                                                        className="template-btn"
                                                        onClick={() => handleChange('description', tmpl.content)}
                                                        title={tmpl.label}
                                                    >
                                                        {tmpl.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Attachments Section */}
                                        <div className="modal-section">
                                            <div className="section-header-actions">
                                                <h4 className="section-title">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                    </svg>
                                                    Ekler
                                                </h4>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileUpload}
                                                />
                                                <button
                                                    className="btn-secondary btn-sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'Yükleniyor...' : 'Dosya Ekle'}
                                                </button>
                                            </div>

                                            {card.attachments && onDownloadAttachment && onDeleteAttachment && (
                                                <AttachmentList
                                                    attachments={card.attachments}
                                                    onDelete={handleAttachmentDelete}
                                                    onDownload={onDownloadAttachment}
                                                />
                                            )}
                                        </div>

                                        {/* Subtasks Section */}
                                        <div className="modal-section">
                                            <h4 className="section-title">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="9 11 12 14 22 4" />
                                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                                </svg>
                                                Alt Görevler
                                                <span className="subtask-count">
                                                    {card.subtasks ?
                                                        `${card.subtasks.filter(s => s.is_completed).length}/${card.subtasks.length}`
                                                        : '0/0'}
                                                </span>
                                            </h4>

                                            <div className="subtask-list">
                                                {card.subtasks?.map((subtask) => (
                                                    <div key={subtask.id} className="subtask-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={subtask.is_completed}
                                                            onChange={(e) => onToggleSubtask(subtask.id, e.target.checked)}
                                                            className="subtask-checkbox"
                                                        />
                                                        <span className={`subtask-text ${subtask.is_completed ? 'completed' : ''}`}>
                                                            {subtask.title}
                                                        </span>
                                                        <button
                                                            onClick={() => onDeleteSubtask(subtask.id)}
                                                            className="subtask-delete-btn"
                                                            title="Alt görevi sil"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}

                                                {isAddingSubtask ? (
                                                    <div className="add-subtask-form">
                                                        <input
                                                            type="text"
                                                            value={newSubtaskTitle}
                                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                            placeholder="Alt görev adı..."
                                                            className="subtask-input"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleAddSubtaskSubmit();
                                                                if (e.key === 'Escape') setIsAddingSubtask(false);
                                                            }}
                                                        />
                                                        <div className="subtask-actions">
                                                            <button onClick={handleAddSubtaskSubmit} className="btn-primary btn-sm">Ekle</button>
                                                            <button onClick={() => setIsAddingSubtask(false)} className="btn-ghost btn-sm">İptal</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="add-subtask-btn"
                                                        onClick={() => setIsAddingSubtask(true)}
                                                    >
                                                        + Alt Görev Ekle
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar */}
                                    <div className="modal-sidebar-v2">
                                        {/* Priority */}
                                        <div className="sidebar-section">
                                            <h5 className="sidebar-title">Öncelik</h5>
                                            <div className="priority-options">
                                                {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                                                    <button
                                                        key={p}
                                                        className={`priority-option ${priority === p ? 'active' : ''} ${p}`}
                                                        onClick={() => handleChange('priority', p)}
                                                    >
                                                        {p === 'critical' ? '🔥' : '●'}
                                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Labels */}
                                        <div className="sidebar-section">
                                            <LabelPicker
                                                labels={labels}
                                                selectedLabelIds={selectedLabelIds}
                                                onToggleLabel={handleToggleLabel}
                                                onCreateLabel={onCreateLabel}
                                                onDeleteLabel={onDeleteLabel}
                                            />
                                        </div>

                                        {/* Assignee */}
                                        {onAssign && (
                                            <div className="sidebar-section">
                                                <h5 className="sidebar-title">Atanan Kişi</h5>
                                                <AssigneePicker
                                                    currentAssignee={card.assigned_to}
                                                    onAssign={(userId: string | null) => onAssign(card.id, userId)}
                                                />
                                            </div>
                                        )}

                                        {/* Due Date */}
                                        <div className="sidebar-section">
                                            <h5 className="sidebar-title">Son Tarih</h5>
                                            <input
                                                type="date"
                                                className="date-input"
                                                value={dueDate ? dueDate.split('T')[0] : ''}
                                                onChange={(e) => handleChange('date', e.target.value)}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="sidebar-section mt-auto">
                                            <button
                                                className="btn-danger w-full"
                                                onClick={() => {
                                                    if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
                                                        onDelete(card.id);
                                                        onClose();
                                                    }
                                                }}
                                            >
                                                Kartı Sil
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="modal-activity-tab">
                                    <CommentSection
                                        comments={card.comments || []}
                                        onAddComment={handleAddComment}
                                        onDeleteComment={onDeleteComment}
                                    />

                                    <div className="activity-section-title">
                                        <h5>İşlem Geçmişi</h5>
                                    </div>

                                    <ActivityLog activities={card.activities || []} />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={handleCancel}>
                                İptal
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges}
                            >
                                Kaydet
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

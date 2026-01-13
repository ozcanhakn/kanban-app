/**
 * Comment Section Component
 * Displays a list of comments and an input form for adding new ones
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Comment } from '../../types/kanban';
import './CommentSection.css';

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (content: string) => Promise<void>;
    onDeleteComment?: (commentId: string) => Promise<void>;
}

export function CommentSection({ comments, onAddComment, onDeleteComment }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onAddComment(newComment);
            setNewComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="comment-section">
            {/* Comment List */}
            <div className="comment-list">
                {comments.length === 0 ? (
                    <div className="empty-comments">
                        Henüz yorum yapılmamış.
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                <div className="avatar-placeholder">
                                    {(comment.user_id || '?').charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="comment-content-wrapper">
                                <div className="comment-header">
                                    <span className="comment-author">Kullanıcı</span>
                                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                                    {onDeleteComment && (
                                        <button
                                            className="delete-comment-btn"
                                            onClick={() => onDeleteComment(comment.id)}
                                            title="Yorumu sil"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="comment-body markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {comment.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <div className="comment-form">
                <div className="comment-avatar">
                    <div className="avatar-placeholder self">S</div>
                </div>
                <div className="comment-input-wrapper">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Bir yorum yaz..."
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <div className="comment-actions">
                        <span className="markdown-hint">M+ desteklenir</span>
                        <button
                            className="send-comment-btn"
                            onClick={() => handleSubmit()}
                            disabled={!newComment.trim() || isSubmitting}
                        >
                            {isSubmitting ? '...' : 'Gönder'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

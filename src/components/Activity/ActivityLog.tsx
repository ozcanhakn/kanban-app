/**
 * Activity Log Component
 * Displays a timeline of actions performed on the card
 */

import type { ActionType, Activity } from '../../types/kanban';
import './ActivityLog.css';

interface ActivityLogProps {
    activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getActionIcon = (type: ActionType) => {
        switch (type) {
            case 'create_card': return '✨';
            case 'move_card': return '⇄';
            case 'update_card': return '✏️';
            case 'add_comment': return '💬';
            case 'upload_attachment': return '📎';
            case 'delete_attachment': return '🗑️';
            case 'add_subtask': return '☑️';
            case 'toggle_subtask': return '✓';
            default: return '•';
        }
    };

    const getActionText = (activity: Activity) => {
        const { action_type, details } = activity;

        switch (action_type) {
            case 'create_card':
                return 'Kart oluşturuldu';
            case 'move_card':
                return (
                    <span>
                        <strong>{details.fromColumn}</strong> listesinden <strong>{details.toColumn}</strong> listesine taşındı
                    </span>
                );
            case 'update_card':
                return 'Kart güncellendi';
            case 'add_comment':
                return 'Yorum yaptı';
            case 'upload_attachment':
                return 'Dosya ekledi';
            case 'delete_attachment':
                return 'Dosya sildi';
            case 'add_subtask':
                return 'Alt görev ekledi';
            case 'toggle_subtask':
                return 'Alt görevi işaretledi';
            default:
                return 'İşlem yapıldı';
        }
    };

    return (
        <div className="activity-log">
            {activities.length === 0 ? (
                <div className="empty-activity">
                    Henüz aktivite kaydı yok.
                </div>
            ) : (
                <div className="activity-timeline">
                    {activities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon-wrapper">
                                <span className="activity-icon">{getActionIcon(activity.action_type)}</span>
                                <div className="activity-line"></div>
                            </div>
                            <div className="activity-content">
                                <div className="activity-header">
                                    <span className="activity-user">
                                        {(activity.details?.userName as string) || activity.user_id || 'Sistem'}
                                    </span>
                                    <span className="activity-text">
                                        {getActionText(activity)}
                                    </span>
                                </div>
                                <span className="activity-date">
                                    {formatDate(activity.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

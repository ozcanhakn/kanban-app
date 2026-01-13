/**
 * Admin Page - Organization Management Panel
 * Features: Member list, role management, activity log
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './AdminPage.css';

type TabType = 'members' | 'activity';

interface OrgMember {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    is_owner: boolean;
}

interface ActivityItem {
    id: string;
    board_id: string;
    card_id: string | null;
    user_id: string;
    action_type: string;
    details: Record<string, unknown>;
    created_at: string;
    user_name: string | null;
    user_avatar: string | null;
    board_title: string;
    card_title: string | null;
}

export function AdminPage() {
    const navigate = useNavigate();
    const { currentOrg, user, organizations } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>('members');
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Check if current user is admin/owner
    const isAdmin = members.some(
        (m) => m.user_id === user?.id && (m.role === 'admin' || m.is_owner)
    );

    // Fetch members
    const fetchMembers = async () => {
        if (!currentOrg) return;

        try {
            // Try RPC first
            const { data, error } = await supabase.rpc('get_org_members', {
                p_org_id: currentOrg.id
            });

            if (!error && data) {
                setMembers(data);
            } else {
                // Fallback to direct query
                const { data: memberData } = await supabase
                    .from('organization_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        joined_at,
                        profiles:user_id (full_name, email, avatar_url)
                    `)
                    .eq('org_id', currentOrg.id);

                if (memberData) {
                    const formatted = memberData.map((m: any) => ({
                        id: m.id,
                        user_id: m.user_id,
                        role: m.role,
                        joined_at: m.joined_at,
                        full_name: m.profiles?.full_name,
                        email: m.profiles?.email,
                        avatar_url: m.profiles?.avatar_url,
                        is_owner: currentOrg.owner_id === m.user_id
                    }));
                    setMembers(formatted);
                }
            }
        } catch (err) {
            console.error('Failed to fetch members:', err);
        }
    };

    // Fetch activities
    const fetchActivities = async () => {
        if (!currentOrg) return;

        try {
            // Try RPC first
            const { data, error } = await supabase.rpc('get_org_activities', {
                p_org_id: currentOrg.id,
                p_limit: 100
            });

            if (!error && data) {
                setActivities(data);
            } else {
                // Fallback to direct query
                const { data: activityData } = await supabase
                    .from('activities')
                    .select(`
                        id,
                        board_id,
                        card_id,
                        user_id,
                        action_type,
                        details,
                        created_at,
                        profiles:user_id (full_name, avatar_url),
                        boards:board_id (title, org_id),
                        cards:card_id (title)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (activityData) {
                    const filtered = activityData.filter(
                        (a: any) => a.boards?.org_id === currentOrg.id
                    );
                    const formatted = filtered.map((a: any) => ({
                        id: a.id,
                        board_id: a.board_id,
                        card_id: a.card_id,
                        user_id: a.user_id,
                        action_type: a.action_type,
                        details: a.details || {},
                        created_at: a.created_at,
                        user_name: a.profiles?.full_name,
                        user_avatar: a.profiles?.avatar_url,
                        board_title: a.boards?.title || 'Silinmiş Pano',
                        card_title: a.cards?.title
                    }));
                    setActivities(formatted);
                }
            }
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        }
    };

    // Initial fetch
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchMembers(), fetchActivities()]);
            setLoading(false);
        };

        if (currentOrg) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [currentOrg]);

    // Handle role change
    const handleRoleChange = async (memberId: string, newRole: string) => {
        setActionLoading(memberId);

        try {
            const { error } = await supabase.rpc('update_member_role', {
                p_member_id: memberId,
                p_new_role: newRole
            });

            if (error) throw error;
            await fetchMembers();
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('Rol değiştirilemedi: ' + (err as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    // Handle member removal
    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`"${memberName}" kullanıcısını organizasyondan çıkarmak istediğinize emin misiniz?`)) {
            return;
        }

        setActionLoading(memberId);

        try {
            const { error } = await supabase.rpc('remove_org_member', {
                p_member_id: memberId
            });

            if (error) throw error;
            await fetchMembers();
        } catch (err) {
            console.error('Failed to remove member:', err);
            alert('Üye çıkarılamadı: ' + (err as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    // Format relative time
    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    // Get action description
    const getActionDescription = (activity: ActivityItem) => {
        const userName = activity.user_name || 'Birisi';
        const cardName = activity.card_title ? `"${activity.card_title}"` : 'bir kart';
        const boardName = activity.board_title;

        switch (activity.action_type) {
            case 'card_created':
                return `${userName}, ${boardName} panosunda ${cardName} kartını oluşturdu`;
            case 'card_moved':
                return `${userName}, ${cardName} kartını taşıdı`;
            case 'card_updated':
                return `${userName}, ${cardName} kartını güncelledi`;
            case 'card_assigned':
                return `${userName}, ${cardName} kartını birine atadı`;
            case 'card_deleted':
                return `${userName}, bir kartı sildi`;
            case 'column_created':
                return `${userName}, ${boardName} panosuna yeni sütun ekledi`;
            case 'comment_added':
                return `${userName}, ${cardName} kartına yorum yaptı`;
            default:
                return `${userName}, bir değişiklik yaptı`;
        }
    };

    // No org selected
    if (!currentOrg) {
        return (
            <div className="admin-page">
                <div className="admin-empty">
                    <span className="empty-icon">🏢</span>
                    <h2>Organizasyon Seçilmedi</h2>
                    <p>Yönetici panelini kullanmak için bir organizasyon seçin.</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                        Dashboard'a Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        ← Geri
                    </button>
                    <div className="header-title">
                        <h1>Yönetici Paneli</h1>
                        <span className="org-name">{currentOrg.name}</span>
                    </div>
                </div>

                {/* Org Switcher */}
                {organizations.length > 1 && (
                    <select
                        className="org-select"
                        value={currentOrg.id}
                        onChange={() => {
                            // This would need setCurrentOrg from useAuth
                        }}
                    >
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                )}
            </header>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    👥 Üyeler ({members.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    📊 Aktivite Logu
                </button>
            </div>

            {/* Content */}
            <main className="admin-content">
                {loading ? (
                    <div className="admin-loading">
                        <div className="loader"></div>
                        <p>Yükleniyor...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <motion.div
                                key="members"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="members-section"
                            >
                                <div className="members-grid">
                                    {members.map((member) => (
                                        <div key={member.id} className="member-card">
                                            <div className="member-avatar">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt="" />
                                                ) : (
                                                    <span>
                                                        {(member.full_name || member.email || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                {member.is_owner && (
                                                    <span className="owner-badge" title="Organizasyon Sahibi">👑</span>
                                                )}
                                            </div>

                                            <div className="member-info">
                                                <h3>{member.full_name || 'İsimsiz'}</h3>
                                                <p>{member.email}</p>
                                                <span className="joined-date">
                                                    Katıldı: {new Date(member.joined_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>

                                            <div className="member-actions">
                                                {/* Role selector */}
                                                {isAdmin && !member.is_owner && (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                        disabled={actionLoading === member.id}
                                                        className="role-select"
                                                    >
                                                        <option value="member">Üye</option>
                                                        <option value="admin">Yönetici</option>
                                                    </select>
                                                )}

                                                {/* Owner badge */}
                                                {member.is_owner && (
                                                    <span className="role-badge owner">Sahip</span>
                                                )}

                                                {/* Non-admin static badge */}
                                                {!isAdmin && !member.is_owner && (
                                                    <span className={`role-badge ${member.role}`}>
                                                        {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                                                    </span>
                                                )}

                                                {/* Remove button */}
                                                {isAdmin && !member.is_owner && member.user_id !== user?.id && (
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => handleRemoveMember(member.id, member.full_name || member.email || 'Kullanıcı')}
                                                        disabled={actionLoading === member.id}
                                                        title="Üyeyi Çıkar"
                                                    >
                                                        {actionLoading === member.id ? '...' : '✕'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="activity-section"
                            >
                                {activities.length === 0 ? (
                                    <div className="no-activity">
                                        <span>📭</span>
                                        <p>Henüz aktivite yok</p>
                                    </div>
                                ) : (
                                    <div className="activity-list">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="activity-item">
                                                <div className="activity-avatar">
                                                    {activity.user_avatar ? (
                                                        <img src={activity.user_avatar} alt="" />
                                                    ) : (
                                                        <span>{(activity.user_name || '?').charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="activity-content">
                                                    <p className="activity-text">
                                                        {getActionDescription(activity)}
                                                    </p>
                                                    <span className="activity-time">
                                                        {formatRelativeTime(activity.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}

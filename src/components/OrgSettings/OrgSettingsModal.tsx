/**
 * Organization Settings Modal - Manage org members and settings
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './OrgSettingsModal.css';

interface OrgSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface OrgMember {
    id: string;
    user_id: string;
    role: 'admin' | 'member';
    profiles?: {
        full_name: string | null;
        email: string | null;
    };
}

export function OrgSettingsModal({ isOpen, onClose }: OrgSettingsModalProps) {
    const { currentOrg, inviteMember, createOrganization, refreshOrganizations } = useAuth();

    const [activeTab, setActiveTab] = useState<'members' | 'create'>('members');
    const [inviteEmail, setInviteEmail] = useState('');
    const [newOrgName, setNewOrgName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [members] = useState<OrgMember[]>([]); // Would be fetched from supabase

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !currentOrg) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const { error: inviteError } = await inviteMember(inviteEmail, currentOrg.id);

        if (inviteError) {
            setError(inviteError.message);
        } else {
            setSuccess(`Davet ${inviteEmail} adresine gönderildi!`);
            setInviteEmail('');
        }
        setLoading(false);
    };

    const handleCreateOrg = async () => {
        if (!newOrgName.trim()) return;

        setLoading(true);
        setError(null);

        const { error: createError } = await createOrganization(newOrgName);

        if (createError) {
            setError(createError.message);
        } else {
            setSuccess('Organizasyon oluşturuldu!');
            setNewOrgName('');
            await refreshOrganizations();
            setTimeout(() => onClose(), 1500);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <motion.div
                className="org-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                <div className="org-modal-header">
                    <h2>🏢 Organizasyon Yönetimi</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Tabs */}
                <div className="org-tabs">
                    <button
                        className={`org-tab ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        👥 Üyeler
                    </button>
                    <button
                        className={`org-tab ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        ✨ Yeni Organizasyon
                    </button>
                </div>

                <div className="org-modal-content">
                    <AnimatePresence mode="wait">
                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <motion.div
                                key="members"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {!currentOrg ? (
                                    <div className="no-org-message">
                                        <p>Henüz bir organizasyonunuz yok.</p>
                                        <button
                                            className="btn-primary"
                                            onClick={() => setActiveTab('create')}
                                        >
                                            Organizasyon Oluştur
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3>{currentOrg.name}</h3>

                                        {/* Invite Section */}
                                        <div className="invite-section">
                                            <label>Yeni Üye Davet Et</label>
                                            <div className="invite-input-group">
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    placeholder="ornek@email.com"
                                                />
                                                <button
                                                    className="btn-primary"
                                                    onClick={handleInvite}
                                                    disabled={loading || !inviteEmail.trim()}
                                                >
                                                    {loading ? '...' : 'Davet Gönder'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        {error && <div className="error-msg">{error}</div>}
                                        {success && <div className="success-msg">{success}</div>}

                                        {/* Members List */}
                                        <div className="members-list">
                                            <h4>Üyeler</h4>
                                            {members.length === 0 ? (
                                                <p className="no-members">Henüz üye yok. Yukarıdan davet gönderin.</p>
                                            ) : (
                                                members.map((member) => (
                                                    <div key={member.id} className="member-item">
                                                        <span className="member-avatar">
                                                            {member.profiles?.full_name?.charAt(0) || '?'}
                                                        </span>
                                                        <div className="member-info">
                                                            <strong>{member.profiles?.full_name || 'İsimsiz'}</strong>
                                                            <span>{member.profiles?.email}</span>
                                                        </div>
                                                        <span className={`member-role ${member.role}`}>
                                                            {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Create Org Tab */}
                        {activeTab === 'create' && (
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h3>Yeni Organizasyon Oluştur</h3>
                                <p className="create-desc">
                                    Ekibiniz için yeni bir çalışma alanı oluşturun.
                                </p>

                                <div className="form-group">
                                    <label>Organizasyon Adı</label>
                                    <input
                                        type="text"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                        placeholder="örn: Acme Yazılım"
                                    />
                                </div>

                                {error && <div className="error-msg">{error}</div>}
                                {success && <div className="success-msg">{success}</div>}

                                <button
                                    className="btn-primary btn-full"
                                    onClick={handleCreateOrg}
                                    disabled={loading || !newOrgName.trim()}
                                >
                                    {loading ? 'Oluşturuluyor...' : 'Organizasyon Oluştur'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

/**
 * Assignee Picker Component
 * Allows selecting an organization member to assign to a card
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './AssigneePicker.css';

interface OrgMember {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: string;
}

interface AssigneePickerProps {
    currentAssignee: string | null;
    onAssign: (userId: string | null) => void;
    disabled?: boolean;
}

export function AssigneePicker({ currentAssignee, onAssign, disabled }: AssigneePickerProps) {
    const { currentOrg, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch org members
    useEffect(() => {
        const fetchMembers = async () => {
            if (!currentOrg) {
                // If no org, just show current user
                if (user) {
                    setMembers([{
                        id: user.id,
                        user_id: user.id,
                        full_name: 'Ben',
                        email: user.email || null,
                        avatar_url: null,
                        role: 'owner'
                    }]);
                }
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_org_members', {
                    p_org_id: currentOrg.id
                });

                if (!error && data) {
                    setMembers(data);

                    // Find current assignee
                    if (currentAssignee) {
                        const assigned = data.find((m: OrgMember) => m.user_id === currentAssignee);
                        if (assigned) setSelectedMember(assigned);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch members:', err);
                // Fallback: fetch from organization_members directly
                const { data: memberData } = await supabase
                    .from('organization_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        profiles:user_id (full_name, email, avatar_url)
                    `)
                    .eq('org_id', currentOrg.id);

                if (memberData) {
                    const formatted = memberData.map((m: any) => ({
                        id: m.id,
                        user_id: m.user_id,
                        full_name: m.profiles?.full_name,
                        email: m.profiles?.email,
                        avatar_url: m.profiles?.avatar_url,
                        role: m.role
                    }));
                    setMembers(formatted);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [currentOrg, currentAssignee, user]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (member: OrgMember | null) => {
        setSelectedMember(member);
        onAssign(member?.user_id || null);
        setIsOpen(false);
    };

    const getInitials = (name: string | null, email: string | null) => {
        if (name) return name.charAt(0).toUpperCase();
        if (email) return email.charAt(0).toUpperCase();
        return '?';
    };

    return (
        <div className="assignee-picker" ref={dropdownRef}>
            <button
                className="assignee-trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                type="button"
            >
                {selectedMember ? (
                    <>
                        <span className="assignee-avatar">
                            {selectedMember.avatar_url ? (
                                <img src={selectedMember.avatar_url} alt="" />
                            ) : (
                                getInitials(selectedMember.full_name, selectedMember.email)
                            )}
                        </span>
                        <span className="assignee-name">
                            {selectedMember.full_name || selectedMember.email || 'Bilinmiyor'}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="assignee-avatar empty">+</span>
                        <span className="assignee-name placeholder">Atanmamış</span>
                    </>
                )}
                <span className="assignee-chevron">▼</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="assignee-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {loading ? (
                            <div className="assignee-loading">Yükleniyor...</div>
                        ) : (
                            <>
                                {/* Unassign option */}
                                <button
                                    className="assignee-option unassign"
                                    onClick={() => handleSelect(null)}
                                >
                                    <span className="assignee-avatar empty">✕</span>
                                    <span>Atamayı Kaldır</span>
                                </button>

                                {/* Members list */}
                                {members.map((member) => (
                                    <button
                                        key={member.user_id}
                                        className={`assignee-option ${selectedMember?.user_id === member.user_id ? 'selected' : ''}`}
                                        onClick={() => handleSelect(member)}
                                    >
                                        <span className="assignee-avatar">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt="" />
                                            ) : (
                                                getInitials(member.full_name, member.email)
                                            )}
                                        </span>
                                        <div className="assignee-details">
                                            <span className="name">{member.full_name || 'İsimsiz'}</span>
                                            <span className="email">{member.email}</span>
                                        </div>
                                        <span className={`role-badge ${member.role}`}>
                                            {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                                        </span>
                                    </button>
                                ))}

                                {members.length === 0 && (
                                    <div className="no-members">Üye bulunamadı</div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Auth Context - Supabase Authentication Provider
 * Manages user session, login, register, and logout
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// ===========================
// Types
// ===========================

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    logo_url: string | null;
}

export interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    organizations: Organization[];
    currentOrg: Organization | null;
    loading: boolean;
    needsOnboarding: boolean;
    needsProfileSetup: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    setCurrentOrg: (org: Organization | null) => void;
    refreshProfile: () => Promise<void>;
    refreshOrganizations: () => Promise<void>;
    createOrganization: (name: string) => Promise<{ org: Organization | null; error: Error | null }>;
    inviteMember: (email: string, orgId: string) => Promise<{ error: Error | null }>;
    completeOnboarding: () => void;
}

// ===========================
// Context Creation
// ===========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===========================
// Provider Component
// ===========================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    // Computed: user logged in but no full_name = needs profile setup
    const needsProfileSetup = !!(user && profile && !profile.full_name);

    // Fetch user profile
    const refreshProfile = async () => {
        if (!user) {
            setProfile(null);
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    };

    // Fetch user's organizations
    const refreshOrganizations = async () => {
        if (!user) {
            setOrganizations([]);
            return;
        }

        // Get orgs where user is owner or member
        const { data: memberOrgs } = await supabase
            .from('organization_members')
            .select('org_id')
            .eq('user_id', user.id);

        const orgIds = memberOrgs?.map(m => m.org_id) || [];

        if (orgIds.length > 0) {
            const { data: orgs } = await supabase
                .from('organizations')
                .select('*')
                .in('id', orgIds);

            setOrganizations(orgs || []);

            // Auto-select first org if none selected
            if (!currentOrg && orgs && orgs.length > 0) {
                setCurrentOrg(orgs[0]);
            }
        } else {
            // Check if user owns any org directly
            const { data: ownedOrgs } = await supabase
                .from('organizations')
                .select('*')
                .eq('owner_id', user.id);

            setOrganizations(ownedOrgs || []);
            if (!currentOrg && ownedOrgs && ownedOrgs.length > 0) {
                setCurrentOrg(ownedOrgs[0]);
            }
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);

            // Get current session
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            setLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (!newSession) {
                    setProfile(null);
                    setOrganizations([]);
                    setCurrentOrg(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetch profile and orgs when user changes
    useEffect(() => {
        if (user) {
            refreshProfile();
            refreshOrganizations();
        }
    }, [user]);

    // Sign Up
    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        return { error: error ? new Error(error.message) : null };
    };

    // Sign In with Password
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error: error ? new Error(error.message) : null };
    };

    // Sign In with Magic Link (Email)
    const signInWithMagicLink = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        return { error: error ? new Error(error.message) : null };
    };

    // Sign Out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        setOrganizations([]);
        setCurrentOrg(null);
        setNeedsOnboarding(false);
    };

    // Create Organization
    const createOrganization = async (name: string): Promise<{ org: Organization | null; error: Error | null }> => {
        if (!user) return { org: null, error: new Error('Kullanıcı girişi gerekli') };

        try {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') + '-' + Date.now();

            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({ name, slug, owner_id: user.id })
                .select()
                .single();

            if (orgError) throw orgError;

            // Add owner as admin
            await supabase
                .from('organization_members')
                .insert({ org_id: org.id, user_id: user.id, role: 'admin' });

            await refreshOrganizations();
            setNeedsOnboarding(false);
            return { org, error: null };
        } catch (err) {
            return { org: null, error: err instanceof Error ? err : new Error('Bilinmeyen hata') };
        }
    };

    // Invite Member (Magic Link)
    const inviteMember = async (email: string, orgId: string): Promise<{ error: Error | null }> => {
        try {
            // For now, we'll use Supabase's invite functionality
            // This requires the user to sign up, then admin manually adds them
            // A full solution would use Supabase Edge Functions for invitations
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?invited_to=${orgId}`,
                },
            });

            if (error) throw error;
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Davet gönderilemedi') };
        }
    };

    // Complete Onboarding
    const completeOnboarding = () => {
        setNeedsOnboarding(false);
    };

    // Check if user needs onboarding (no orgs and no boards)
    useEffect(() => {
        const checkOnboarding = async () => {
            if (!user) return;

            // First check if user is member of any organization
            const { data: memberships } = await supabase
                .from('organization_members')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);

            // If user is member of an org, they don't need onboarding
            if (memberships && memberships.length > 0) {
                setNeedsOnboarding(false);
                return;
            }

            // Check if user owns any organization
            const { data: ownedOrgs } = await supabase
                .from('organizations')
                .select('id')
                .eq('owner_id', user.id)
                .limit(1);

            if (ownedOrgs && ownedOrgs.length > 0) {
                setNeedsOnboarding(false);
                return;
            }

            // Check if user has any personal boards
            const { data: boards } = await supabase
                .from('boards')
                .select('id')
                .eq('owner_id', user.id)
                .limit(1);

            if (boards && boards.length > 0) {
                setNeedsOnboarding(false);
                return;
            }

            // No orgs, no boards = needs onboarding
            setNeedsOnboarding(true);
        };

        if (!loading && user) {
            checkOnboarding();
        }
    }, [user, loading]);

    const value: AuthContextType = {
        user,
        profile,
        session,
        organizations,
        currentOrg,
        loading,
        needsOnboarding,
        needsProfileSetup,
        signUp,
        signIn,
        signInWithMagicLink,
        signOut,
        setCurrentOrg,
        refreshProfile,
        refreshOrganizations,
        createOrganization,
        inviteMember,
        completeOnboarding,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ===========================
// Hook
// ===========================

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

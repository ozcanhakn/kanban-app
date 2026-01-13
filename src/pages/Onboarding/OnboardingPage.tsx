/**
 * Onboarding Page - Organization Setup Wizard
 * 3-step process: Welcome -> Create/Join Org -> First Board
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './OnboardingPage.css';

type Step = 'welcome' | 'org-choice' | 'create-org' | 'first-board';

export function OnboardingPage() {
    const navigate = useNavigate();
    const { user, profile, refreshOrganizations, completeOnboarding } = useAuth();

    const [step, setStep] = useState<Step>('welcome');
    const [orgName, setOrgName] = useState('');
    const [boardTitle, setBoardTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create organization
    const handleCreateOrg = async () => {
        if (!orgName.trim() || !user) return;

        setLoading(true);
        setError(null);

        try {
            // Generate slug from name
            const slug = orgName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Create organization
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: orgName.trim(),
                    slug: `${slug}-${Date.now()}`,
                    owner_id: user.id,
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // Add owner as admin member
            await supabase
                .from('organization_members')
                .insert({
                    org_id: org.id,
                    user_id: user.id,
                    role: 'admin',
                });

            await refreshOrganizations();
            setStep('first-board');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Organizasyon oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    // Create first board
    const handleCreateBoard = async () => {
        if (!boardTitle.trim() || !user) return;

        setLoading(true);
        setError(null);

        try {
            const { error: boardError } = await supabase
                .from('boards')
                .insert({
                    title: boardTitle.trim(),
                    owner_id: user.id,
                    board_type: 'personal',
                });

            if (boardError) throw boardError;

            completeOnboarding();
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Board oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    // Skip to dashboard
    const handleSkip = () => {
        completeOnboarding();
        navigate('/dashboard');
    };

    const slideVariants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 },
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                {/* Progress Indicator */}
                <div className="progress-dots">
                    <span className={`dot ${step === 'welcome' ? 'active' : ''}`}></span>
                    <span className={`dot ${step === 'org-choice' || step === 'create-org' ? 'active' : ''}`}></span>
                    <span className={`dot ${step === 'first-board' ? 'active' : ''}`}></span>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Welcome */}
                    {step === 'welcome' && (
                        <motion.div
                            key="welcome"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="onboarding-step"
                        >
                            <span className="step-icon">👋</span>
                            <h1>Hoşgeldin, {profile?.full_name || 'Kullanıcı'}!</h1>
                            <p>KanbanFlow ile projelerini yönetmeye hazır mısın?</p>
                            <button
                                className="btn-primary btn-full"
                                onClick={() => setStep('org-choice')}
                            >
                                Başlayalım →
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Organization Choice */}
                    {step === 'org-choice' && (
                        <motion.div
                            key="org-choice"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="onboarding-step"
                        >
                            <span className="step-icon">🏢</span>
                            <h1>Organizasyon</h1>
                            <p>Ekibinle birlikte mi çalışacaksın?</p>

                            <div className="choice-buttons">
                                <button
                                    className="choice-btn"
                                    onClick={() => setStep('create-org')}
                                >
                                    <span className="choice-icon">✨</span>
                                    <span className="choice-title">Yeni Organizasyon Kur</span>
                                    <span className="choice-desc">Ekibimi davet edeceğim</span>
                                </button>

                                <button
                                    className="choice-btn"
                                    onClick={() => setStep('first-board')}
                                >
                                    <span className="choice-icon">👤</span>
                                    <span className="choice-title">Kişisel Kullanım</span>
                                    <span className="choice-desc">Sadece kendim için</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2b: Create Organization */}
                    {step === 'create-org' && (
                        <motion.div
                            key="create-org"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="onboarding-step"
                        >
                            <span className="step-icon">🏢</span>
                            <h1>Organizasyon Adı</h1>
                            <p>Şirket veya ekip adınızı girin</p>

                            {error && <div className="auth-error">{error}</div>}

                            <div className="form-group">
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="örn: Acme Yazılım"
                                    autoFocus
                                />
                            </div>

                            <button
                                className="btn-primary btn-full"
                                onClick={handleCreateOrg}
                                disabled={loading || !orgName.trim()}
                            >
                                {loading ? 'Oluşturuluyor...' : 'Organizasyonu Oluştur'}
                            </button>

                            <button
                                className="btn-ghost btn-full"
                                onClick={() => setStep('org-choice')}
                            >
                                ← Geri
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: First Board */}
                    {step === 'first-board' && (
                        <motion.div
                            key="first-board"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="onboarding-step"
                        >
                            <span className="step-icon">📋</span>
                            <h1>İlk Pano'nu Oluştur</h1>
                            <p>Başlamak için bir pano adı gir</p>

                            {error && <div className="auth-error">{error}</div>}

                            <div className="form-group">
                                <input
                                    type="text"
                                    value={boardTitle}
                                    onChange={(e) => setBoardTitle(e.target.value)}
                                    placeholder="örn: Proje Takibi"
                                    autoFocus
                                />
                            </div>

                            <button
                                className="btn-primary btn-full"
                                onClick={handleCreateBoard}
                                disabled={loading || !boardTitle.trim()}
                            >
                                {loading ? 'Oluşturuluyor...' : 'Pano Oluştur & Başla'}
                            </button>

                            <button
                                className="btn-ghost btn-full"
                                onClick={handleSkip}
                            >
                                Şimdilik Atla
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

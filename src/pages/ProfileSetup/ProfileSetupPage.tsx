/**
 * Profile Setup Page - For invited users to complete their profile
 * Also allows setting a password for future logins
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './ProfileSetupPage.css';

export function ProfileSetupPage() {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();

    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setError('İsim giriniz');
            return;
        }

        if (password && password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (password && password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: fullName.trim() })
                .eq('id', user?.id);

            if (profileError) throw profileError;

            // Set password if provided
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({
                    password: password
                });

                if (passwordError) throw passwordError;
            }

            await refreshProfile();
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-setup-page">
            <motion.div
                className="setup-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="setup-header">
                    <span className="setup-icon">👤</span>
                    <h1>Profilinizi Tamamlayın</h1>
                    <p>Ekibinizin sizi tanıyabilmesi için bilgilerinizi girin</p>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="fullName">Ad Soyad *</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ahmet Yılmaz"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-divider">
                        <span>Şifre Belirleme (Opsiyonel)</span>
                    </div>

                    <p className="form-hint">
                        Şifre belirlerseniz e-posta + şifre ile giriş yapabilirsiniz.
                        Belirlemezseniz her seferinde e-posta linki kullanırsınız.
                    </p>

                    <div className="form-group">
                        <label htmlFor="password">Şifre</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Şifre Tekrar</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifreyi tekrar girin"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Kaydediliyor...' : 'Devam Et'}
                    </button>
                </form>

                <p className="setup-footer">
                    E-posta: <strong>{user?.email}</strong>
                </p>
            </motion.div>
        </div>
    );
}

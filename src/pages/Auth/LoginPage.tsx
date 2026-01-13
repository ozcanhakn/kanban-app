/**
 * Login Page - User Authentication
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPages.css';

export function LoginPage() {
    const navigate = useNavigate();
    const { signIn, signInWithMagicLink } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [authMode, setAuthMode] = useState<'password' | 'magic'>('password');

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: loginError } = await signIn(email, password);

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    const handleMagicLinkLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: magicError } = await signInWithMagicLink(email);

        if (magicError) {
            setError(magicError.message);
        } else {
            setMagicLinkSent(true);
        }
        setLoading(false);
    };

    if (magicLinkSent) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-success">
                        <span className="success-icon">✉️</span>
                        <h2>E-posta Gönderildi!</h2>
                        <p>
                            <strong>{email}</strong> adresine bir giriş bağlantısı gönderdik.
                            Lütfen e-postanızı kontrol edin ve bağlantıya tıklayın.
                        </p>
                        <button
                            className="btn-ghost"
                            onClick={() => setMagicLinkSent(false)}
                        >
                            ← Geri Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/" className="auth-logo">
                    <span className="logo-icon">📋</span>
                    <span>KanbanFlow</span>
                </Link>

                <h1 className="auth-title">Hoşgeldiniz</h1>
                <p className="auth-subtitle">Hesabınıza giriş yapın</p>

                {/* Auth Mode Toggle */}
                <div className="auth-toggle">
                    <button
                        className={`toggle-btn ${authMode === 'password' ? 'active' : ''}`}
                        onClick={() => setAuthMode('password')}
                    >
                        Şifre ile
                    </button>
                    <button
                        className={`toggle-btn ${authMode === 'magic' ? 'active' : ''}`}
                        onClick={() => setAuthMode('magic')}
                    >
                        Magic Link
                    </button>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={authMode === 'password' ? handlePasswordLogin : handleMagicLinkLogin}>
                    <div className="form-group">
                        <label htmlFor="email">E-posta</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {authMode === 'password' && (
                        <div className="form-group">
                            <label htmlFor="password">Şifre</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                autoComplete="current-password"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Giriş yapılıyor...' : (authMode === 'password' ? 'Giriş Yap' : 'Bağlantı Gönder')}
                    </button>
                </form>

                <p className="auth-footer">
                    Hesabınız yok mu?{' '}
                    <Link to="/register">Ücretsiz Kayıt Ol</Link>
                </p>
            </div>
        </div>
    );
}

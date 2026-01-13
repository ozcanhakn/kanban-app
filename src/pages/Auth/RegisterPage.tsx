/**
 * Register Page - New User Signup
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPages.css';

export function RegisterPage() {
    // const navigate = useNavigate(); // Removed unused variable
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);

        const { error: signUpError } = await signUp(email, password, fullName);

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-success">
                        <span className="success-icon">🎉</span>
                        <h2>Kayıt Başarılı!</h2>
                        <p>
                            <strong>{email}</strong> adresine bir doğrulama e-postası gönderdik.
                            Lütfen e-postanızı kontrol edip hesabınızı doğrulayın.
                        </p>
                        <Link to="/login" className="btn-primary btn-full">
                            Giriş Sayfasına Git
                        </Link>
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

                <h1 className="auth-title">Hesap Oluştur</h1>
                <p className="auth-subtitle">Ücretsiz başlayın, kredi kartı gerekmez</p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Ad Soyad</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="password">Şifre</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Şifre Tekrar</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <p className="auth-footer">
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}

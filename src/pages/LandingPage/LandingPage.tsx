/**
 * Landing Page - Public Marketing Page
 * Modern, Premium design with features showcase
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
    {
        icon: '🚀',
        title: 'Sürükle & Bırak',
        description: 'Kartları parmağınızın ucuyla taşıyın. Akıcı animasyonlarla sorunsuz deneyim.',
    },
    {
        icon: '👥',
        title: 'Ekip Çalışması',
        description: 'Organizasyonlar kurun, üyeler davet edin ve birlikte çalışın.',
    },
    {
        icon: '📊',
        title: 'Gelişmiş Filtreleme',
        description: 'Etiket, öncelik ve tarihe göre kartlarınızı anında bulun.',
    },
    {
        icon: '⚡',
        title: 'Otomasyonlar',
        description: 'Görevler tamamlandığında kartlar otomatik hareket eder.',
    },
    {
        icon: '🌙',
        title: 'Dark & Light Mode',
        description: 'Gözlerinizi yoramayan, sistem temanıza uyumlu tasarım.',
    },
    {
        icon: '📱',
        title: 'Mobil Uyumlu',
        description: 'Her cihazda mükemmel çalışan responsive arayüz.',
    },
];

export function LandingPage() {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <header className="landing-header">
                <nav className="landing-nav">
                    <div className="nav-logo">
                        <span className="logo-icon">📋</span>
                        <span className="logo-text">KanbanFlow</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/login" className="nav-link">Giriş Yap</Link>
                        <Link to="/register" className="nav-btn-primary">Ücretsiz Başla →</Link>
                    </div>
                </nav>

                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">
                        Projelerinizi <span className="text-gradient">Akıcı</span> Yönetin
                    </h1>
                    <p className="hero-subtitle">
                        Ekibinizle birlikte çalışabileceğiniz, güçlü otomasyonlara sahip,
                        modern Kanban deneyimi. Ücretsiz başlayın.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn-primary-lg">
                            Hemen Başla
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link to="/login" className="btn-ghost-lg">
                            Hesabım Var
                        </Link>
                    </div>
                </motion.div>

                {/* Hero Image / Mockup */}
                <motion.div
                    className="hero-image"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div className="mockup-container">
                        <div className="mockup-browser">
                            <div className="mockup-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="mockup-content">
                                <div className="mockup-column">
                                    <div className="mockup-column-title">Yapılacak</div>
                                    <div className="mockup-card"></div>
                                    <div className="mockup-card"></div>
                                </div>
                                <div className="mockup-column">
                                    <div className="mockup-column-title">Yapılıyor</div>
                                    <div className="mockup-card active"></div>
                                </div>
                                <div className="mockup-column">
                                    <div className="mockup-column-title">Tamamlandı</div>
                                    <div className="mockup-card done"></div>
                                    <div className="mockup-card done"></div>
                                    <div className="mockup-card done"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Features Section */}
            <section className="features-section">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Neden KanbanFlow?
                </motion.h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <span className="feature-icon">{feature.icon}</span>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <motion.div
                    className="cta-content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2>Projelerinizi Kontrol Altına Alın</h2>
                    <p>Ücretsiz hesap oluşturun ve hemen kullanmaya başlayın.</p>
                    <Link to="/register" className="btn-primary-lg">
                        Ücretsiz Kayıt Ol
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <span className="logo-icon">📋</span>
                        <span>KanbanFlow</span>
                    </div>
                    <p className="footer-copy">
                        © {new Date().getFullYear()} KanbanFlow. Tüm hakları saklıdır.
                    </p>
                </div>
            </footer>
        </div>
    );
}

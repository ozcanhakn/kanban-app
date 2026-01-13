/**
 * NotFoundPage
 * 404 error page
 */

import { Link } from 'react-router-dom';
import '../App.css';

export function NotFoundPage() {
    return (
        <div className="app">
            <div className="not-found-page">
                <div className="not-found-content">
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="not-found-icon"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <h1>404</h1>
                    <h2>Sayfa Bulunamadı</h2>
                    <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                    <Link to="/" className="btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9,22 9,12 15,12 15,22" />
                        </svg>
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}

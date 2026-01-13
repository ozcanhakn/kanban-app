import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlowCanvas from './components/FlowCanvas';
import MobileDeck from './components/MobileDeck';
import './kanban-magic.css';

const LandingPage = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [started, setStarted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleStart = () => {
        setStarted(true);
        // Wait for the "Chaos to Order" animation to finish (approx 2s) then navigate
        setTimeout(() => {
            navigate('/login');
        }, 2500);
    };

    return (
        <div className="landing-wrapper">
            {/* 3D / Interactive Layer */}
            {isMobile ? (
                <MobileDeck started={started} />
            ) : (
                <FlowCanvas started={started} />
            )}

            {/* UI Overlay */}
            <div className={`landing-ui ${started ? 'started' : ''}`} style={{ opacity: started ? 0 : 1, transition: 'opacity 0.5s', pointerEvents: started ? 'none' : 'auto' }}>
                <h1 className="landing-title">KAOSTAN DÜZENE</h1>
                <p className="landing-subtitle">
                    Mükemmel organizasyonun gücünü keşfedin. <br />
                    Dağınık görev fırtınasını akıcı bir düzene dönüştürün.
                </p>
                <button className="landing-btn" onClick={handleStart}>
                    HEMEN BAŞLA
                </button>
            </div>
        </div>
    );
};

export default LandingPage;

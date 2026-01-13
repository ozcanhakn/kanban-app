import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import '../kanban-magic.css';

interface MobileDeckProps {
    started: boolean;
}

const cards = [
    { id: 1, text: "Design System", color: "#e0f2fe" },
    { id: 2, text: "Fix API Bug", color: "#f0f9ff" },
    { id: 3, text: "User Testing", color: "#fae8ff" },
    { id: 4, text: "Deploy Prod", color: "#dbeafe" },
    { id: 5, text: "Marketing", color: "#818cf8" },
];

const MobileDeck = ({ started }: MobileDeckProps) => {
    const controls = useAnimation();

    useEffect(() => {
        if (started) {
            // Sequence: Cards explode out then organize into a list
            controls.start((i) => ({
                x: 0,
                y: i * 80 - 150, // Stack vertically list style
                rotate: 0,
                scale: 1,
                transition: { delay: i * 0.1, type: "spring", stiffness: 100 }
            }));
        } else {
            // Chaos State: Stacked deck with random rotation
            controls.start((i) => ({
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50,
                rotate: Math.random() * 20 - 10,
                scale: 1 - i * 0.05,
                zIndex: 10 - i,
                transition: { duration: 0.5 }
            }));
        }
    }, [started, controls]);

    return (
        <div className="mobile-deck-container">
            <div style={{ position: 'relative', width: 300, height: 400, marginTop: -50 }}>
                {cards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        custom={i}
                        animate={controls}
                        className="mobile-card"
                        style={{
                            backgroundColor: card.color,
                            color: '#333',
                            // Initial State
                            zIndex: 10 - i
                        }}
                        drag={!started}
                        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                        whileDrag={{ scale: 1.1, rotate: 0 }}
                    >
                        {card.text}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MobileDeck;

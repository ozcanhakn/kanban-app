/**
 * Confetti Animation Component
 * Celebrates task completion or achievements
 */

import { useCallback, useEffect, useState } from 'react';
import './Confetti.css';

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
}

interface ConfettiProps {
    isActive: boolean;
    onComplete?: () => void;
    duration?: number;
}

const COLORS = [
    '#6366f1', // Primary
    '#22c55e', // Green
    '#f59e0b', // Yellow
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
];

export function Confetti({ isActive, onComplete, duration = 3000 }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    const generatePieces = useCallback(() => {
        const newPieces: ConfettiPiece[] = [];
        const pieceCount = 50;

        for (let i = 0; i < pieceCount; i++) {
            newPieces.push({
                id: i,
                x: Math.random() * 100,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                delay: Math.random() * 0.5,
                rotation: Math.random() * 360,
            });
        }

        return newPieces;
    }, []);

    useEffect(() => {
        if (isActive) {
            setPieces(generatePieces());

            const timer = setTimeout(() => {
                setPieces([]);
                onComplete?.();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setPieces([]);
        }
    }, [isActive, duration, onComplete, generatePieces]);

    if (!isActive || pieces.length === 0) return null;

    return (
        <div className="confetti-container" aria-hidden="true">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: `${piece.x}%`,
                        backgroundColor: piece.color,
                        animationDelay: `${piece.delay}s`,
                        transform: `rotate(${piece.rotation}deg)`,
                    }}
                />
            ))}
        </div>
    );
}

// Hook to trigger confetti
export function useConfetti() {
    const [isActive, setIsActive] = useState(false);

    const fire = useCallback(() => {
        setIsActive(true);
    }, []);

    const handleComplete = useCallback(() => {
        setIsActive(false);
    }, []);

    return {
        isActive,
        fire,
        onComplete: handleComplete,
    };
}

/**
 * Skeleton Loader Components
 * Provides loading placeholders for better perceived performance
 */

import './Skeleton.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
}

export function Skeleton({
    width = '100%',
    height = 16,
    borderRadius = 4,
    className = ''
}: SkeletonProps) {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    };

    return (
        <div
            className={`skeleton ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

// Skeleton Card for loading states
export function SkeletonCard() {
    return (
        <div className="skeleton-card" aria-hidden="true">
            <div className="skeleton-labels">
                <Skeleton width={32} height={6} borderRadius={3} />
                <Skeleton width={24} height={6} borderRadius={3} />
            </div>
            <Skeleton height={16} className="skeleton-title" />
            <Skeleton width="70%" height={12} />
        </div>
    );
}

// Skeleton Column for loading states
export function SkeletonColumn() {
    return (
        <div className="skeleton-column" aria-hidden="true">
            <div className="skeleton-column-header">
                <Skeleton width={120} height={18} />
                <Skeleton width={28} height={20} borderRadius={10} />
            </div>
            <div className="skeleton-column-cards">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}

// Skeleton Board for loading states
export function SkeletonBoard() {
    return (
        <div className="skeleton-board" role="status" aria-label="Yükleniyor...">
            <div className="skeleton-board-header">
                <Skeleton width={100} height={36} borderRadius={8} />
                <Skeleton width={180} height={24} />
            </div>
            <div className="skeleton-board-columns">
                <SkeletonColumn />
                <SkeletonColumn />
                <SkeletonColumn />
            </div>
        </div>
    );
}

// Skeleton Board Card for dashboard
export function SkeletonBoardCard() {
    return (
        <div className="skeleton-board-card" aria-hidden="true">
            <Skeleton height={24} className="skeleton-board-title" />
            <Skeleton width="60%" height={14} />
        </div>
    );
}

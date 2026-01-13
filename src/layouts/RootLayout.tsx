/**
 * RootLayout
 * Main layout wrapper with header, theme, and toast provider
 */

import { ToastProvider } from '../components/Toast/Toast';
import { AnimatedOutlet } from './AnimatedOutlet';

export function RootLayout() {
    return (
        <ToastProvider>
            <AnimatedOutlet />
        </ToastProvider>
    );
}

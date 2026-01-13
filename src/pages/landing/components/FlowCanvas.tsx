import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import FloatingCards from './FloatingCards';

interface FlowCanvasProps {
    started: boolean;
}

const FlowCanvas = ({ started }: FlowCanvasProps) => {
    return (
        <Canvas
            camera={{ position: [0, 0, 15], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 2]} // Quality scaling
        >
            <color attach="background" args={['#050510']} />

            <Suspense fallback={null}>
                <Environment preset="city" />

                <FloatingCards started={started} />

                <ContactShadows
                    position={[0, -4, 0]}
                    opacity={0.4}
                    scale={20}
                    blur={2.5}
                    far={10}
                />
            </Suspense>

            {/* Helper orbit (disabled when started for cinematic control? maybe keep enabled for fun) */}
            <OrbitControls
                enableZoom={false}
                autoRotate={!started}
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 3}
            />
        </Canvas>
    );
};

export default FlowCanvas;

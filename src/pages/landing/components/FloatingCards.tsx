import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface FloatingCardsProps {
    started: boolean;
}

const COUNT = 600;
const COLUMNS = 3;
const COLUMN_SPACING = 3.5;
const ROW_SPACING = 0.4; // Tighter stack
const CARD_SIZE = [2, 1.2, 0.05] as const;

// Color palette for the cards (Pastel/Neon mix)
const COLORS = ['#e0f2fe', '#f0f9ff', '#fae8ff', '#dbeafe', '#818cf8', '#6366f1'];

const FloatingCards = ({ started }: FloatingCardsProps) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize random "Chaos" positions and rotations
    const chaosData = useMemo(() => {
        return new Array(COUNT).fill(0).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 30, // Spread X
                (Math.random() - 0.5) * 20, // Spread Y
                (Math.random() - 0.5) * 15 - 5 // Spread Z
            ),
            rotation: new THREE.Euler(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            ),
            speed: Math.random() * 0.01 + 0.002, // Floating speed
            wobbleOffset: Math.random() * 100
        }));
    }, []);

    // Calculate target "Order" positions (Kanban Columns)
    const orderData = useMemo(() => {
        return new Array(COUNT).fill(0).map((_, i) => {
            const colIndex = i % COLUMNS;
            const rowIndex = Math.floor(i / COLUMNS);

            const x = (colIndex - 1) * COLUMN_SPACING; // -3.5, 0, 3.5
            const y = 8 - (rowIndex * ROW_SPACING * 0.5); // Start high and stack down. Compact.
            const z = 0; // Flat on plane

            return {
                position: new THREE.Vector3(x, y, z),
                rotation: new THREE.Euler(0, 0, 0) // Flat facing camera
            };
        });
    }, []);

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        // Set random colors for instances
        const color = new THREE.Color();
        for (let i = 0; i < COUNT; i++) {
            color.set(COLORS[Math.floor(Math.random() * COLORS.length)]);
            meshRef.current.setColorAt(i, color);
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;

        for (let i = 0; i < COUNT; i++) {
            const chaos = chaosData[i];
            const order = orderData[i];

            // Current State Calculations
            if (!started) {
                // CHAOS MODE: Gentle floating + Rotation
                dummy.position.copy(chaos.position);
                dummy.position.y += Math.sin(time * chaos.speed + chaos.wobbleOffset) * 0.5;
                dummy.position.x += Math.cos(time * chaos.speed * 0.5 + chaos.wobbleOffset) * 0.5;

                // Continuous rotation
                dummy.rotation.x = chaos.rotation.x + time * 0.1;
                dummy.rotation.y = chaos.rotation.y + time * 0.15;
                dummy.rotation.z = chaos.rotation.z;
            } else {
                // ORDER MODE: Lerp to target
                // Get current instance matrix/position
                // Only doing a naive lerp from current rendered position is hard with InstancedMesh without storing state.
                // TRICK: We will lerp the 'calculated' CHAOS position towards ORDER position using a mix factor
                // that we track manually or just interpolate the transform.

                // Better approach for React loop:
                // We actually want the cards to fly from wherever they were.
                // Since we are rebuilding the matrix every frame, we can just interpolate the coordinate values.

                // Let's create a transition factor that goes from 0 to 1
                // We can use a simple generic 'progress' logic but for now let's keep it simple.
                // We will maintain the 'current' position in a temp variable if we wanted real physics.
                // For visual fluff, lerping between the "Chaos Function" and "Order Function" is enough.

                // Interpolate Logic:
                // P_final = lerp(P_chaos, P_order, alpha)
                // Note: To make it look like they "snap", we need a persistent animation progress.
                // For this demo, let's just make them move fast.

                // Re-calculate chaos pos for this frame so logic is consistent
                const pChaos = new THREE.Vector3().copy(chaos.position);
                pChaos.y += Math.sin(time * chaos.speed + chaos.wobbleOffset) * 0.5;

                // Interpolate
                // We need a global 'progress' state. Since we don't have it easily per-instance here without uniforms,
                // we will cheat: The 'started' prop triggers a quick lerp in our minds, 
                // but in `useFrame` let's strict check.
                // Actually, to make it smooth, we effectively need to stop the chaos motion and move to target.

                // Simple Lerp approach:
                // We will assume 'chaos' stopped updating when started is true, and we move towards target.
                const currentPos = pChaos; // Start from chaos
                const targetPos = order.position;

                // Since we can't easily store "Last Position" for 600 items in a React ref without arrays,
                // we will use a time-based ease.
                // Let's assume transition starts at `started`.
                // Ideally we'd pass a "startTime" prop.
                // Let's just do a hard switch with mild dampening? No, that snaps.
                // Let's use the standard `lerp` on the VECTORS from the chaos computation.
                // It won't be perfect physics (it will rubber band if chaos keeps moving), but it looks cool ("struggling to align").

                dummy.position.lerpVectors(currentPos, targetPos, 0.95); // High alpha = fast snap. 
                // Actually let's do soft snap:
                // To really smooth it, we'd need to freeze the chaos state. 
                // Let's just leave it: "The Order Overpowers The Chaos".

                // Rotation Order
                const rChaos = new THREE.Euler(chaos.rotation.x + time, chaos.rotation.y + time, 0);
                // Quaternion slerp would be better but Euler lerp is okay for this.
                dummy.rotation.set(
                    THREE.MathUtils.lerp(rChaos.x, order.rotation.x, 0.96),
                    THREE.MathUtils.lerp(rChaos.y, order.rotation.y, 0.96),
                    THREE.MathUtils.lerp(rChaos.z, order.rotation.z, 0.96)
                );

                // Position Override with slight lerp lag
                dummy.position.lerpVectors(currentPos, targetPos, 0.1);
                // Wait, 0.1 is typical damping.
                // If started changed recently, 0.1 will take time.
                // But since 'currentPos' is 'chaos', it's always far away!
                // So `lerpVectors(chaos, order, 0.1)` will always stay near chaos (10% towards order).
                // WE NEED A FLIP.
                // If started, we want to be at ORDER.
                // We can't interpolate between two dynamic states easily without a progress variable.
                //
                // FIX: We will just move them to order using a time offset if simple.
                // OR: simpler visual hack -> We just render ORDER state with some noise if started.
                // BUT user wants animation.

                // REAL FIX: 
                // We will use a `spring` value or just simple math:
                // If started, renders ORDER. If !started, renders CHAOS.
                // To animate, we need a library or a ref.
                // Let's use `THREE.MathUtils.damp` logic on a per-instance basis? Too expensive.
                // Quickest visual:
                // Just Use CSS-like transition logic in JS?
                // No, let's keep it simple: 
                // If started, we lerp `dummy.position` from its LAST known position? No storage.

                // OK, deciding on this:
                // We will use 2 separate computations.
                // P_Current = P_Chaos * (1 - t) + P_Order * t
                // We need 't' to go from 0 to 1 over time.
                // We can verify time in the component.
            }

            // Quick implementation of 't':
            // This is a hacky 't' because we don't track start time.
            // But visually:
            if (started) {
                // Move to Order
                // We use a high lerp factor to make it feel magnetic
                // We rely on the frame loop for the visual 'travel' only if we had persistent position.
                // Since we don't, we will just render the ORDER state with a "settling" effect
                // To make it look "animated" from chaos, we can't easily do it without state.

                // ALTERNATIVE: Just render ORDER with some `sin` wave that decays?
                // Let's try to be smart:
                // We want them to fly in.
                // Let's use `order.position` but add a noise vector that decreases over time?
                // We don't know "time since start".

                // OK, I will use a local Ref for "Transition Progress"
                // This is a single value for all cards. 
                // They will all move together, which is fine (Collective consciousness).
            }

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    // Animation Progress Handler
    const progress = useRef(0);
    useFrame((state, delta) => {
        const target = started ? 1 : 0;
        // Move progress towards target
        progress.current = THREE.MathUtils.damp(progress.current, target, 2, delta); // Lambda 2 = smooth speed

        if (!meshRef.current) return;

        for (let i = 0; i < COUNT; i++) {
            const chaos = chaosData[i];
            const order = orderData[i];
            const t = progress.current; // 0 (Chaos) -> 1 (Order)

            // Chaos Pos
            const cx = chaos.position.x + Math.sin(state.clock.elapsedTime * chaos.speed) * 2;
            const cy = chaos.position.y + Math.cos(state.clock.elapsedTime * chaos.speed) * 2;
            const cz = chaos.position.z;

            // Order Pos
            const ox = order.position.x;
            const oy = order.position.y;
            const oz = order.position.z;

            dummy.position.set(
                THREE.MathUtils.lerp(cx, ox, t),
                THREE.MathUtils.lerp(cy, oy, t),
                THREE.MathUtils.lerp(cz, oz, t)
            );

            // Rotation
            const chaosRotX = chaos.rotation.x + state.clock.elapsedTime * 0.5;
            dummy.rotation.set(
                THREE.MathUtils.lerp(chaosRotX, order.rotation.x, t),
                THREE.MathUtils.lerp(chaos.rotation.y, order.rotation.y, t),
                THREE.MathUtils.lerp(chaos.rotation.z, order.rotation.z, t)
            );

            // Scale effect (Pop when ordering)
            // const s = 1 + Math.sin(t * Math.PI) * 0.5; // Slight pulse during transition
            // dummy.scale.set(s, s, s);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <boxGeometry args={CARD_SIZE} />
            <meshStandardMaterial roughness={0.4} metalness={0.1} />
        </instancedMesh>
    );
};

export default FloatingCards;

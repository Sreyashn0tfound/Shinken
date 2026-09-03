import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function SakuraModel() {
    const modelRef = useRef();

    // Make sure this name matches exactly what you put in the public folder
    const { scene } = useGLTF('/fantasy_sakura.glb');

    useFrame((state) => {
        if (!modelRef.current) return;
        const time = state.clock.getElapsedTime();

        // Rotation and Bounce
        modelRef.current.rotation.y += 0.003;
        modelRef.current.position.y = Math.sin(time * 1.5) * 0.1;
    });

    return (
        <primitive
            object={scene}
            ref={modelRef}
            scale={1.5}
            position={[0, 0, 0]}
        />
    );
}
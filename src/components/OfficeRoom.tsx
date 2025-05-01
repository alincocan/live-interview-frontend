import  { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export function OfficeRoom() {
    // Load the city view texture for the window
    const cityTexture = useLoader(TextureLoader, '/textures/city-view.jpeg');

    // Get the window size to make the wall full-screen
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <group>
            {/* Floor */}
            <mesh receiveShadow position={[0, -1.5, 0]}>
                <boxGeometry args={[10, 0.1, 10]} />
                <meshStandardMaterial color="#eeeeee" />
            </mesh>

            {/* Full-Screen Back Wall */}
            <mesh position={[0, windowSize.height / 4, -5]} receiveShadow>
                <boxGeometry args={[windowSize.width / 2, windowSize.height / 1.5, 0.1]} />
                <meshStandardMaterial color="#dcdcdc" />
            </mesh>

            {/* Big Windows with City View */}
            <mesh position={[0, windowSize.height / 4 + 1, -4.99]} rotation={[0, Math.PI, 0]} receiveShadow>
                <planeGeometry args={[windowSize.width / 2.5, windowSize.height / 2]} />
                <meshStandardMaterial
                    map={cityTexture}
                    transparent
                    opacity={1}
                    roughness={0.1}
                    metalness={0.1}
                />
            </mesh>

            {/* Window Frame */}
            <mesh position={[0, windowSize.height / 4 + 1, -5]}>
                <boxGeometry args={[windowSize.width / 2.6, windowSize.height / 2.1, 0.2]} />
                <meshStandardMaterial color="#4b4b4b" />
            </mesh>
        </group>
    );
}
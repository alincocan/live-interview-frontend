import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import { Group } from 'three';

interface AvatarProps {
    url: string;
}
export function Avatar ({url}: AvatarProps) {
    const { scene } = useGLTF(url) as { scene: Group };

    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) child.castShadow = true;
        });
    }, [scene]);

    return <primitive object={scene} scale={1} position={[0, -1.2, 0]} />;
}
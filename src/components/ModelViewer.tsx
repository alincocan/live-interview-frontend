import React, {Suspense, useEffect, useRef, useState} from 'react';
import { Canvas } from '@react-three/fiber';
import {OrbitControls, useGLTF, Environment, useAnimations} from '@react-three/drei';
import { Box, CircularProgress } from '@mui/material';

// Model component that loads and displays the 3D model
function Model({ url }: { url: string }) {
  const modelRef = useRef<THREE.Group>(null);
  const [blinking, setBlinking] = useState(false);

  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, modelRef);

  // Function to find a specific mesh in the scene
  const findMeshByName = (name: string) => {
    let result = null;
    scene.traverse((object) => {
      if (object.name === name) {
        result = object;
      }
    });
    return result;
  };

  // Function to handle blinking
  const blink = () => {
    const bodyMesh = findMeshByName("CC_Base_Body004");

    if (bodyMesh && 'morphTargetDictionary' in bodyMesh && 'morphTargetInfluences' in bodyMesh) {
      const leftBlinkIndex = bodyMesh.morphTargetDictionary?.Eye_Blink_L;
      const rightBlinkIndex = bodyMesh.morphTargetDictionary?.Eye_Blink_R;

      if (leftBlinkIndex !== undefined && rightBlinkIndex !== undefined) {
        // Start blinking
        setBlinking(true);

        // Set blink values to 1 (fully closed)
        bodyMesh.morphTargetInfluences[leftBlinkIndex] = 1;
        bodyMesh.morphTargetInfluences[rightBlinkIndex] = 1;

        // After a short delay, open eyes again
        setTimeout(() => {
          bodyMesh.morphTargetInfluences[leftBlinkIndex] = 0;
          bodyMesh.morphTargetInfluences[rightBlinkIndex] = 0;
          setBlinking(false);
        }, 200);
      }
    }
  };

  // Set up blinking interval
  useEffect(() => {

    // Set up blinking interval (every 5 seconds)
    const blinkInterval = setInterval(() => {
      if (!blinking) {
        blink();
      }
    }, 5000);

    // Initial blink after a short delay
    const initialBlinkTimeout = setTimeout(() => {
      blink();
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(initialBlinkTimeout);
    };
  }, [blinking]);

  // Handle idle animation
  useEffect(() => {
    const idleAction = actions['Male_TF_idle'];
    if (idleAction) {
      idleAction.reset().fadeIn(0.5).play();
    } else {
      console.warn('Idle animation not found:', Object.keys(actions));
    }

    return () => {
      // Clean up animation when component unmounts
      idleAction?.fadeOut(0.5).stop();
    };
  }, [actions]);

  return <primitive ref={modelRef} object={scene} scale={0.6} position={[0, -0.7, 0]} />;
}

interface ModelViewerProps {
  url?: string;
  /** 🎧 Map of text => base64 audio */
  audioMap?: Map<string, string | undefined>;
  /** 🎤 Callback after all audio playback ends */
  onAudioFinished?: () => void;
}
const ModelViewer: React.FC<ModelViewerProps> = ({ 
  url = '/models/david/david.glb',
  audioMap,
  onAudioFinished,
}) => {

  useEffect(() => {
    if (!audioMap || audioMap.size === 0) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let cancelled = false;

    const decodeBase64ToBuffer = async (base64: string): Promise<AudioBuffer> => {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return await ctx.decodeAudioData(bytes.buffer);
    };

    const playAllAudioSequentially = async () => {
      const buffers: AudioBuffer[] = [];

      for (const [text, base64] of audioMap.entries()) {
        if (cancelled) return;
        try {
          const buffer = await decodeBase64ToBuffer(base64);
          buffers.push(buffer);
        } catch (e) {
          console.error(`Error decoding audio for ${text}`, e);
        }
      }

      let currentTime = ctx.currentTime;
      buffers.forEach(buffer => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(currentTime);
        currentTime += buffer.duration;
      });

      const totalDuration = buffers.reduce((sum, b) => sum + b.duration, 0);

      setTimeout(() => {
        if (!cancelled && onAudioFinished) {
          onAudioFinished();
        }
      }, totalDuration * 1000);
    };

    playAllAudioSequentially();

    return () => {
      cancelled = true;
      ctx.close();
    };
  }, [audioMap]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>

      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          height: '100%' 
        }}>
          <CircularProgress />
        </Box>
      }>
        <Canvas camera={{ position: [0, 1, 5], fov: 10  }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Model url={url} />

          <OrbitControls 
            enablePan={true} 
            enableZoom={false}
            enableRotate={false}
            autoRotate={false}
          />
          <Environment preset="sunset" />
        </Canvas>
      </Suspense>
    </Box>
  );
};

export default ModelViewer;

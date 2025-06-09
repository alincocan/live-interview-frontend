import React, {Suspense, useEffect, useRef, useState} from 'react';
import { Canvas } from '@react-three/fiber';
import {OrbitControls, useGLTF, Environment, useAnimations} from '@react-three/drei';
import { Box, CircularProgress } from '@mui/material';

// Model component that loads and displays the 3D model
export function Model({ url, currentText }: { url: string, currentText?: string }) {
  const modelRef = useRef<THREE.Group>(null);
  const [blinking, setBlinking] = useState(false);

  // Mapping of letters to mouth opening values (0 to 1)
  const letterToMouthOpenValue: {[key: string]: number} = {
    'a': 1.0, 'b': 0.7, 'c': 0.6, 'd': 0.7, 'e': 0.8,
    'f': 0.6, 'g': 0.7, 'h': 0.6, 'i': 0.5, 'j': 0.6,
    'k': 0.7, 'l': 0.6, 'm': 0.3, 'n': 0.6, 'o': 1.0,
    'p': 0.7, 'q': 0.8, 'r': 0.6, 's': 0.6, 't': 0.6,
    'u': 0.9, 'v': 0.6, 'w': 0.9, 'x': 0.7, 'y': 0.7,
    'z': 0.6, ' ': 0.1, '.': 0.1, ',': 0.1, '!': 0.1,
    '?': 0.5, ':': 0.1, ';': 0.1, '-': 0.1, '_': 0.1
  };

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

  // Handle talking animation
  useEffect(() => {
    const talkingAction = actions['Talking'];
    if (talkingAction) {
      talkingAction.reset().fadeIn(0.5).play();
    } else {
      console.warn('Idle animation not found:', Object.keys(actions));
    }

    return () => {
      // Clean up animation when component unmounts
      talkingAction?.fadeOut(0.5).stop();
    };
  }, [actions]);

  // Handle mouth movement based on current text
  useEffect(() => {
    if (!currentText) return;

    const bodyMesh = findMeshByName("CC_Base_Body004");

    if (bodyMesh && 'morphTargetDictionary' in bodyMesh && 'morphTargetInfluences' in bodyMesh) {
      const lipOpenIndex = bodyMesh.morphTargetDictionary?.V_Lip_Open;

      if (lipOpenIndex !== undefined) {
        // Get the current letter (lowercase for consistency)
        const currentLetter = currentText.toLowerCase();

        // Get mouth open value for the current letter, default to 0.1 if not found
        const openValue = letterToMouthOpenValue[currentLetter] || 0.1;

        // Set the mouth open value
        bodyMesh.morphTargetInfluences[lipOpenIndex] = openValue;
      }
    }
  }, [currentText]);

  return <primitive ref={modelRef} object={scene} scale={0.6} position={[-0.05, -0.85, -1]} />;
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
  // State to track the current letter being spoken
  const [currentLetter, setCurrentLetter] = useState<string>('');

  useEffect(() => {
    if (!audioMap || audioMap.size === 0) return;

    // Use AudioContext with proper type
    const ctx = new (window.AudioContext || (window as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
      const texts: string[] = [];

      for (const [text, base64] of audioMap.entries()) {
        if (cancelled) return;
        try {
          const buffer = await decodeBase64ToBuffer(base64);
          buffers.push(buffer);
          texts.push(text);
        } catch (e) {
          console.error(`Error decoding audio for ${text}`, e);
        }
      }

      let currentTime = ctx.currentTime;

      // Reset mouth at the beginning
      setCurrentLetter('');

      buffers.forEach((buffer, index) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // Set up animation for this audio segment
        const text = texts[index];
        const duration = buffer.duration;
        // Slow down mouth movement by reducing the frequency of updates (using a factor of 0.5)
        // This means we'll update the mouth position less frequently, making it appear to move slower
        const slowdownFactor = 0.2; // Lower value = slower mouth movement
        const effectiveTextLength = Math.max(1, Math.floor(text.length * slowdownFactor));
        const letterDuration = duration / effectiveTextLength;

        // Schedule letter updates for this segment
        for (let i = 0; i < effectiveTextLength; i++) {
          const letterIndex = Math.min(Math.floor(i / slowdownFactor), text.length - 1);
          const letterTime = i * letterDuration;
          setTimeout(() => {
            if (!cancelled) {
              setCurrentLetter(text[letterIndex]);
            }
          }, (currentTime - ctx.currentTime + letterTime) * 1000);
        }

        source.start(currentTime);
        currentTime += duration;
      });

      const totalDuration = buffers.reduce((sum, b) => sum + b.duration, 0);

      setTimeout(() => {
        if (!cancelled) {
          // Reset mouth at the end
          setCurrentLetter('');
          if (onAudioFinished) {
            onAudioFinished();
          }
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
        <Canvas camera={{ position: [0, 0.3, 3], fov: 10  }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Model url={url} currentText={currentLetter} />

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

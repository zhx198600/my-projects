import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';

const DEFAULT_STYLE_CONFIG = {
  modelColor: '#9333ea',
  ambientIntensity: 0.4,
  directionalIntensity: 1.5,
  environment: 'city',
  metalness: 0.8,
  roughness: 0.2
};

function getEnvironmentPreset(styleId) {
  const map = {
    'metallic': 'sunset',
    'golden': 'sunset',
    'ceramic': 'city',
    'glass': 'city',
    'cartoon': 'park',
    'nature': 'forest',
    'cyberpunk': 'city',
    'default': 'city'
  };
  return map[styleId] || 'city';
}

function DemoModel({ styleConfig = DEFAULT_STYLE_CONFIG, autoRotate = true, styleId = 'default' }) {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const geometry = useMemo(() => {
    switch (styleId) {
      case 'metallic':
        return new THREE.OctahedronGeometry(1.2, 1);
      case 'ceramic':
        return new THREE.SphereGeometry(1, 64, 64);
      case 'glass':
        return new THREE.IcosahedronGeometry(1.2, 1);
      case 'nature':
        return new THREE.TorusGeometry(0.8, 0.5, 16, 32);
      case 'golden':
        return new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
      default:
        return new THREE.TorusKnotGeometry(1, 0.35, 128, 32);
    }
  }, [styleId]);

  const materialProps = useMemo(() => {
    const baseColor = styleConfig.modelColor || '#9333ea';
    const hoverColor = new THREE.Color(baseColor).multiplyScalar(1.2).getHexString();
    
    return {
      color: hovered ? hoverColor : baseColor,
      metalness: styleConfig.metalness ?? 0.8,
      roughness: styleConfig.roughness ?? 0.2,
      envMapIntensity: 1.5,
      ...(styleConfig.transparent && {
        transparent: true,
        opacity: styleConfig.opacity ?? 0.7,
        transmission: 0.3,
        thickness: 0.5,
      }),
    };
  }, [styleConfig, hovered]);

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {styleConfig.transparent ? (
          <meshPhysicalMaterial {...materialProps} />
        ) : (
          <meshStandardMaterial {...materialProps} />
        )}
      </mesh>
    </Float>
  );
}

function DecorativeOrbs({ styleConfig = DEFAULT_STYLE_CONFIG, styleId = 'default' }) {
  const orbs = useMemo(() => {
    const accentColors = styleConfig.accentColors || ['#ec4899', '#06b6d4', '#f59e0b'];
    
    return [
      { position: [-3, 1, -2], scale: 0.5, color: accentColors[0] },
      { position: [3, -1, -1], scale: 0.4, color: accentColors[1] },
      { position: [-2, -2, 1], scale: 0.3, color: accentColors[2] || accentColors[0] },
      { position: [2, 2, -3], scale: 0.35, color: accentColors[1] },
    ];
  }, [styleConfig]);

  return (
    <>
      {orbs.map((orb, index) => (
        <Float key={index} speed={2 + index * 0.5} rotationIntensity={1}>
          <mesh position={orb.position} scale={orb.scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={orb.color}
              metalness={styleConfig.metalness ?? 0.6}
              roughness={styleConfig.roughness ?? 0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function Lights({ styleConfig = DEFAULT_STYLE_CONFIG, styleId = 'default' }) {
  const lights = useMemo(() => {
    const baseConfig = {
      ambient: styleConfig.ambientIntensity ?? 0.4,
      directional: styleConfig.directionalIntensity ?? 1.5,
      colors: {
        directional: '#ffffff',
        fill: '#e879f9',
        point: styleConfig.modelColor || '#9333ea'
      }
    };

    switch (styleId) {
      case 'cyberpunk':
        return {
          ...baseConfig,
          colors: {
            directional: '#06b6d4',
            fill: '#ec4899',
            point: '#8b5cf6'
          }
        };
      case 'golden':
        return {
          ...baseConfig,
          colors: {
            directional: '#fbbf24',
            fill: '#f59e0b',
            point: '#d97706'
          }
        };
      case 'nature':
        return {
          ...baseConfig,
          colors: {
            directional: '#84cc16',
            fill: '#22c55e',
            point: '#16a34a'
          }
        };
      default:
        return baseConfig;
    }
  }, [styleConfig, styleId]);

  return (
    <>
      <ambientLight intensity={lights.ambient} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={lights.directional}
        color={lights.colors.directional}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.5}
        color={lights.colors.fill}
      />
      <pointLight
        position={[0, 5, 0]}
        intensity={0.5}
        color={lights.colors.point}
      />
    </>
  );
}

function Scene({ 
  modelUrl = null, 
  modelId = null, 
  styleConfig = DEFAULT_STYLE_CONFIG,
  styleId = 'default',
  onLoad = null, 
  onError = null 
}) {
  const environment = getEnvironmentPreset(styleId);

  return (
    <>
      <Lights styleConfig={styleConfig} styleId={styleId} />
      
      <Grid
        position={[0, -2, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#4b5563"
        sectionSize={5}
        sectionThickness={1}
        sectionColor={styleConfig.modelColor || '#9333ea'}
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      <DemoModel 
        styleConfig={styleConfig} 
        styleId={styleId}
      />
      <DecorativeOrbs 
        styleConfig={styleConfig} 
        styleId={styleId}
      />
      <Environment preset={environment} />
      
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300 text-sm">加载 3D 场景...</p>
      </div>
    </div>
  );
}

function SceneFallback({ onRetry }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
      <div className="flex flex-col items-center text-center p-8">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-white mb-2">3D 渲染不可用</h3>
        <p className="text-gray-400 mb-6 max-w-sm">
          您的浏览器可能不支持 WebGL，或者显卡驱动需要更新。
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}

function ViewerInfo({ modelId, renderStyle = '默认' }) {
  return (
    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs text-white">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="font-medium">3D 场景运行中</span>
      </div>
      {modelId && (
        <div className="text-gray-400 mt-1">
          模型ID: {modelId.substring(0, 12)}...
        </div>
      )}
      <div className="text-gray-400 mt-1">
        渲染风格: {renderStyle}
      </div>
    </div>
  );
}

function ControlsHint() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-gray-300">
      <span className="mr-4">🖱️ 左键拖动旋转</span>
      <span className="mr-4">🔍 滚轮缩放</span>
      <span>✋ 右键拖动平移</span>
    </div>
  );
}

function ThreeDViewer({ 
  modelUrl = null, 
  modelId = null, 
  renderStyle = '默认',
  styleConfig = DEFAULT_STYLE_CONFIG,
  styleId = 'default',
  className = '',
  onLoad,
  onError
}) {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  const handleError = (error) => {
    console.error('3D Viewer error:', error);
    setHasError(true);
    onError && onError(error);
  };

  const handleRetry = () => {
    setHasError(false);
    setKey(prev => prev + 1);
  };

  return (
    <div className={`relative w-full h-full min-h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <Canvas
        key={key}
        camera={{ position: [0, 2, 6], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#111827');
        }}
        onError={handleError}
      >
        <Scene 
          modelUrl={modelUrl} 
          modelId={modelId}
          styleConfig={styleConfig}
          styleId={styleId}
          onLoad={onLoad}
          onError={onError}
        />
      </Canvas>

      {hasError && (
        <SceneFallback onRetry={handleRetry} />
      )}

      <ViewerInfo modelId={modelId} renderStyle={renderStyle} />
      <ControlsHint />
    </div>
  );
}

export default ThreeDViewer;

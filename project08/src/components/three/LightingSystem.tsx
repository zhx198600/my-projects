import { useRef } from 'react'
import { useAppStore } from '@/store'
import { LightingConfig } from '@/types'

interface LightingSystemProps {
  config?: Partial<LightingConfig>
}

export function LightingSystem({ config }: LightingSystemProps) {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  
  const storeConfig = useAppStore((state) => state.lightingConfig)
  
  const mergedConfig: LightingConfig = {
    ...storeConfig,
    ...config,
  }
  
  const {
    ambientIntensity = 0.6,
    ambientColor = '#ffffff',
    directionalIntensity = 1.2,
    directionalColor = '#ffffff',
    directionalPosition = [10, 10, 5] as [number, number, number],
    castShadow = true,
  } = mergedConfig

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      
      <directionalLight
        ref={directionalLightRef}
        position={directionalPosition}
        intensity={directionalIntensity}
        color={directionalColor}
        castShadow={castShadow}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      <hemisphereLight
        color="#87CEEB"
        groundColor="#8B4513"
        intensity={0.4}
        position={[0, 50, 0]}
      />
    </>
  )
}
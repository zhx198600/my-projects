import { useThree } from '@react-three/fiber'
import { Sky, ContactShadows } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/store'
import { SceneConfig, EnvironmentType } from '@/types'
import * as THREE from 'three'

interface EnvironmentSetupProps {
  config?: Partial<SceneConfig>
}

const environmentPresets: Record<NonNullable<EnvironmentType>, {
  skyColor: string
  fogColor: string
  sunPosition: [number, number, number]
  turbidity: number
  rayleigh: number
  mieCoefficient: number
  mieDirectionalG: number
}> = {
  sunset: {
    skyColor: '#FF6B35',
    fogColor: '#FFD7BE',
    sunPosition: [100, 10, 100],
    turbidity: 10,
    rayleigh: 0.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
  },
  city: {
    skyColor: '#87CEEB',
    fogColor: '#B0C4DE',
    sunPosition: [100, 50, 100],
    turbidity: 20,
    rayleigh: 0.3,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.8,
  },
  park: {
    skyColor: '#98D8C8',
    fogColor: '#E8F5E9',
    sunPosition: [100, 80, 100],
    turbidity: 5,
    rayleigh: 0.8,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.7,
  },
  forest: {
    skyColor: '#2E8B57',
    fogColor: '#90EE90',
    sunPosition: [100, 30, 100],
    turbidity: 15,
    rayleigh: 0.6,
    mieCoefficient: 0.004,
    mieDirectionalG: 0.75,
  },
  apartment: {
    skyColor: '#F5F5DC',
    fogColor: '#FFFACD',
    sunPosition: [0, 50, 100],
    turbidity: 8,
    rayleigh: 0.4,
    mieCoefficient: 0.002,
    mieDirectionalG: 0.85,
  },
  studio: {
    skyColor: '#E6E6FA',
    fogColor: '#F0F8FF',
    sunPosition: [50, 100, 50],
    turbidity: 3,
    rayleigh: 0.2,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.9,
  },
  dawn: {
    skyColor: '#FFB6C1',
    fogColor: '#FFC0CB',
    sunPosition: [100, 5, 100],
    turbidity: 12,
    rayleigh: 0.7,
    mieCoefficient: 0.006,
    mieDirectionalG: 0.7,
  },
  night: {
    skyColor: '#191970',
    fogColor: '#2F2F4F',
    sunPosition: [-100, -50, -100],
    turbidity: 25,
    rayleigh: 0.1,
    mieCoefficient: 0.008,
    mieDirectionalG: 0.6,
  },
  warehouse: {
    skyColor: '#A9A9A9',
    fogColor: '#D3D3D3',
    sunPosition: [0, 100, 0],
    turbidity: 18,
    rayleigh: 0.25,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
  },
}

export function EnvironmentSetup({ config }: EnvironmentSetupProps) {
  const { scene } = useThree()
  
  const storeConfig = useAppStore((state) => state.sceneConfig)
  
  const mergedConfig: SceneConfig = {
    ...storeConfig,
    ...config,
  }
  
  const {
    environment = 'sunset',
  } = mergedConfig

  const preset = useMemo(() => {
    if (!environment || !environmentPresets[environment]) {
      return environmentPresets.sunset
    }
    return environmentPresets[environment]
  }, [environment])

  useEffect(() => {
    scene.fog = new THREE.FogExp2(preset.fogColor, 0.015)
    scene.background = new THREE.Color(preset.skyColor)
    
    return () => {
      scene.fog = null
    }
  }, [scene, preset])

  return (
    <>
      <Sky
        sunPosition={preset.sunPosition}
        turbidity={preset.turbidity}
        rayleigh={preset.rayleigh}
        mieCoefficient={preset.mieCoefficient}
        mieDirectionalG={preset.mieDirectionalG}
      />
      
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#8B7355"
          roughness={1}
          metalness={0}
        />
      </mesh>
      
      <ContactShadows
        resolution={1024}
        scale={50}
        blur={2}
        opacity={0.5}
        far={4.5}
        color="#000000"
        position={[0, -0.01, 0]}
      />
    </>
  )
}
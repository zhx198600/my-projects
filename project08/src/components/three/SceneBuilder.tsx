import { LightingSystem } from './LightingSystem'
import { EnvironmentSetup } from './EnvironmentSetup'
import { ModelLoader } from './ModelLoader'
import { AncientArchitecture } from './AncientArchitecture'
import { FpsCounter } from './PerformanceMonitor'
import { useAppStore } from '@/store'
import { SceneConfig, LightingConfig, ModelConfig, ComponentInfo } from '@/types'
import * as THREE from 'three'

interface SceneBuilderProps {
  sceneConfig?: Partial<SceneConfig>
  lightingConfig?: Partial<LightingConfig>
  modelConfig?: Partial<ModelConfig>
  onComponentSelect?: (info: ComponentInfo) => void
  onEmptyClick?: () => void
  children?: React.ReactNode
}

export function SceneBuilder({
  sceneConfig,
  lightingConfig,
  modelConfig,
  onComponentSelect,
  onEmptyClick,
  children,
}: SceneBuilderProps) {
  const isLoading = useAppStore((state) => state.isLoading)
  const modelUrl = useAppStore((state) => state.modelConfig.url)

  const hasExternalModel = modelConfig?.url || modelUrl

  return (
    <>
      <EnvironmentSetup config={sceneConfig} />
      
      <LightingSystem config={lightingConfig} />
      
      {hasExternalModel ? (
        <ModelLoader
          config={modelConfig}
          onProgress={(progress) => console.log('Load progress:', progress)}
          onLoad={(model) => console.log('Model loaded:', model)}
          onError={(error) => console.error('Model load error:', error)}
        />
      ) : (
        <AncientArchitecture onComponentSelect={onComponentSelect} />
      )}
      
      {children}
      
      <FpsCounter />
      
      {isLoading && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}
      
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onEmptyClick?.()
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
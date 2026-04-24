import { useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '@/store'
import { ModelConfig } from '@/types'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

interface ModelLoaderProps {
  config?: Partial<ModelConfig>
  onProgress?: (progress: number) => void
  onLoad?: (model: THREE.Object3D) => void
  onError?: (error: Error) => void
  children?: (model: THREE.Object3D) => React.ReactNode
}

export function ModelLoader({
  config,
  onProgress,
  onLoad,
  onError,
  children,
}: ModelLoaderProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null)
  
  const storeConfig = useAppStore((state) => state.modelConfig)
  const setLoading = useAppStore((state) => state.setLoading)
  const setLoadProgress = useAppStore((state) => state.setLoadProgress)
  const setError = useAppStore((state) => state.setError)
  
  const mergedConfig: ModelConfig = {
    ...storeConfig,
    ...config,
  }
  
  const {
    url,
    scale = 1,
    position = [0, 0, 0] as [number, number, number],
    rotation = [0, 0, 0] as [number, number, number],
  } = mergedConfig

  const dracoLoader = useMemo(() => {
    const loader = new DRACOLoader()
    loader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    return loader
  }, [])

  const gltfLoader = useMemo(() => {
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    return loader
  }, [dracoLoader])

  useEffect(() => {
    if (!url) {
      setModel(null)
      return
    }

    setLoading(true)
    setLoadProgress(0)
    setError(null)

    const onLoadProgress = (event: ProgressEvent) => {
      if (event.total > 0) {
        const progress = event.loaded / event.total
        setLoadProgress(progress * 100)
        onProgress?.(progress * 100)
      }
    }

    gltfLoader.load(
      url,
      (gltf) => {
        const loadedModel = gltf.scene.clone()
        
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true
            
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => {
                material.needsUpdate = true
              })
            } else {
              mesh.material.needsUpdate = true
            }
          }
        })
        
        setModel(loadedModel)
        setLoading(false)
        setLoadProgress(100)
        onLoad?.(loadedModel)
      },
      onLoadProgress,
      (error) => {
        console.error('Error loading model:', error)
        const loadError = error instanceof Error ? error : new Error(String(error))
        setLoading(false)
        setError(loadError.message)
        onError?.(loadError)
      }
    )

    return () => {
      if (model) {
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => material.dispose())
            } else {
              mesh.material.dispose()
            }
            if (mesh.geometry) {
              mesh.geometry.dispose()
            }
          }
        })
      }
    }
  }, [url, gltfLoader, onProgress, onLoad, onError, setLoading, setLoadProgress, setError])

  useFrame(() => {
    if (model) {
      if (Array.isArray(scale)) {
        model.scale.set(...(scale as [number, number, number]))
      } else {
        model.scale.setScalar(scale)
      }
      
      model.position.set(...position)
      model.rotation.set(...rotation)
    }
  })

  if (!model) {
    return null
  }

  if (children) {
    return <>{children(model)}</>
  }

  return <primitive object={model} />
}
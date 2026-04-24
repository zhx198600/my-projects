import { create } from 'zustand'
import { 
  CubeState, 
  SceneState, 
  SceneConfig, 
  LightingConfig, 
  ModelConfig,
  EnvironmentType,
  CameraMode
} from '@/types'

interface AppStore extends CubeState, SceneState {
  sceneConfig: SceneConfig
  lightingConfig: LightingConfig
  modelConfig: ModelConfig
  showStats: boolean
  selectedComponent: string | null
  cameraMode: CameraMode
  fps: number

  setPosition: (position: [number, number, number]) => void
  setRotation: (rotation: [number, number, number]) => void
  setColor: (color: string) => void
  setLoading: (isLoading: boolean) => void
  setLoadProgress: (progress: number) => void
  setError: (error: string | null) => void
  setSceneConfig: (config: Partial<SceneConfig>) => void
  setLightingConfig: (config: Partial<LightingConfig>) => void
  setModelConfig: (config: Partial<ModelConfig>) => void
  setEnvironment: (environment: EnvironmentType) => void
  setShowStats: (show: boolean) => void
  setSelectedComponent: (id: string | null) => void
  setCameraMode: (mode: CameraMode) => void
  setFps: (fps: number) => void
}

export const useAppStore = create<AppStore>((set) => ({
  position: [0, 0.5, 0],
  rotation: [0, 0, 0],
  color: 'orange',
  isLoading: false,
  loadProgress: 0,
  error: null,
  showStats: false,
  selectedComponent: null,
  cameraMode: 'orbit',
  fps: 60,
  
  sceneConfig: {
    skyColor: '#87CEEB',
    fogColor: '#E0E6E6',
    fogDensity: 0.02,
    environment: 'sunset',
  },
  
  lightingConfig: {
    ambientIntensity: 0.6,
    ambientColor: '#ffffff',
    directionalIntensity: 1.2,
    directionalColor: '#ffffff',
    directionalPosition: [10, 10, 5],
    castShadow: true,
  },
  
  modelConfig: {
    url: '',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  
  setPosition: (position) => set({ position }),
  setRotation: (rotation) => set({ rotation }),
  setColor: (color) => set({ color }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setError: (error) => set({ error }),
  setSceneConfig: (config) => set((state) => ({
    sceneConfig: { ...state.sceneConfig, ...config },
  })),
  setLightingConfig: (config) => set((state) => ({
    lightingConfig: { ...state.lightingConfig, ...config },
  })),
  setModelConfig: (config) => set((state) => ({
    modelConfig: { ...state.modelConfig, ...config },
  })),
  setEnvironment: (environment) => set((state) => ({
    sceneConfig: { ...state.sceneConfig, environment },
  })),
  setShowStats: (showStats) => set({ showStats }),
  setSelectedComponent: (selectedComponent) => set({ selectedComponent }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setFps: (fps) => set({ fps }),
}))
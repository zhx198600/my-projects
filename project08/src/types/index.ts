export interface SceneState {
  isLoading: boolean
  loadProgress: number
  error: string | null
}

export interface CubeState {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
}

export type EnvironmentType = 
  | 'sunset' 
  | 'city' 
  | 'park' 
  | 'forest' 
  | 'apartment' 
  | 'studio' 
  | 'dawn' 
  | 'night' 
  | 'warehouse' 
  | null

export interface SceneConfig {
  skyColor?: string
  fogColor?: string
  fogDensity?: number
  environment?: EnvironmentType
}

export interface LightingConfig {
  ambientIntensity?: number
  ambientColor?: string
  directionalIntensity?: number
  directionalColor?: string
  directionalPosition?: [number, number, number]
  castShadow?: boolean
}

export interface ModelConfig {
  url: string
  scale?: [number, number, number] | number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export interface ComponentInfo {
  id: string
  name: string
  description: string
  category: string
  imageUrl?: string
  metadata?: Record<string, any>
}

export type CameraMode = 'orbit' | 'firstPerson'

export interface CameraConfig {
  mode: CameraMode
  position: [number, number, number]
  fov: number
  minDistance?: number
  maxDistance?: number
  minPolarAngle?: number
  maxPolarAngle?: number
}
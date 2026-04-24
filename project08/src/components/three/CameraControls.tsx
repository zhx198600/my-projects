import { useRef, useEffect } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface CameraConfig {
  position?: [number, number, number]
  fov?: number
  near?: number
  far?: number
  minDistance?: number
  maxDistance?: number
  minPolarAngle?: number
  maxPolarAngle?: number
  minAzimuthAngle?: number
  maxAzimuthAngle?: number
  enableDamping?: boolean
  dampingFactor?: number
  enablePan?: boolean
  enableRotate?: boolean
  enableZoom?: boolean
  target?: [number, number, number]
}

interface CameraControlsProps {
  config?: Partial<CameraConfig>
  enabled?: boolean
  onCameraChange?: (position: THREE.Vector3, target: THREE.Vector3) => void
}

const defaultCameraConfig: CameraConfig = {
  position: [10, 8, 10],
  fov: 50,
  near: 0.1,
  far: 1000,
  minDistance: 5,
  maxDistance: 50,
  minPolarAngle: 0.2,
  maxPolarAngle: Math.PI / 2.2,
  enableDamping: true,
  dampingFactor: 0.05,
  enablePan: true,
  enableRotate: true,
  enableZoom: true,
  target: [0, 0, 0],
}

export function CameraControls({
  config,
  enabled = true,
  onCameraChange,
}: CameraControlsProps) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const previousPosition = useRef<THREE.Vector3>(new THREE.Vector3())
  const previousTarget = useRef<THREE.Vector3>(new THREE.Vector3())

  const mergedConfig: CameraConfig = {
    ...defaultCameraConfig,
    ...config,
  }

  const {
    position = [10, 8, 10],
    fov = 50,
    near = 0.1,
    far = 1000,
    minDistance = 5,
    maxDistance = 50,
    minPolarAngle = 0.2,
    maxPolarAngle = Math.PI / 2.2,
    minAzimuthAngle = -Infinity,
    maxAzimuthAngle = Infinity,
    enableDamping = true,
    dampingFactor = 0.05,
    enablePan = true,
    enableRotate = true,
    enableZoom = true,
    target = [0, 0, 0],
  } = mergedConfig

  useFrame(() => {
    if (controlsRef.current && onCameraChange) {
      const currentPos = controlsRef.current.object.position
      const currentTarget = controlsRef.current.target

      if (
        !currentPos.equals(previousPosition.current) ||
        !currentTarget.equals(previousTarget.current)
      ) {
        onCameraChange(currentPos.clone(), currentTarget.clone())
        previousPosition.current.copy(currentPos)
        previousTarget.current.copy(currentTarget)
      }
    }
  })

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(...position)
      camera.fov = fov
      camera.near = near
      camera.far = far
      camera.updateProjectionMatrix()
    }
  }, [camera, position, fov, near, far])

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={position}
        fov={fov}
        near={near}
        far={far}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={enabled}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        minAzimuthAngle={minAzimuthAngle}
        maxAzimuthAngle={maxAzimuthAngle}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
        enablePan={enablePan}
        enableRotate={enableRotate}
        enableZoom={enableZoom}
        target={target}
      />
    </>
  )
}

interface CameraResetProps {
  shouldReset: boolean
  onResetComplete?: () => void
}

export function CameraReset({ shouldReset, onResetComplete }: CameraResetProps) {
  const controlsRef = useRef<any>(null)
  const hasReset = useRef(false)

  useEffect(() => {
    if (shouldReset && controlsRef.current && !hasReset.current) {
      controlsRef.current.reset()
      hasReset.current = true
      onResetComplete?.()
    }
    if (!shouldReset) {
      hasReset.current = false
    }
  }, [shouldReset, onResetComplete])

  return null
}

interface CameraFlyToProps {
  targetPosition: [number, number, number]
  targetLookAt: [number, number, number]
  duration?: number
  shouldFly: boolean
  onFlyComplete?: () => void
}

export function CameraFlyTo({
  targetPosition,
  targetLookAt,
  duration = 1000,
  shouldFly,
  onFlyComplete,
}: CameraFlyToProps) {
  const { camera } = useThree()
  const animationRef = useRef<number | null>(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    if (shouldFly && !isAnimating.current) {
      isAnimating.current = true
      const startPosition = camera.position.clone()
      const startLookAt = new THREE.Vector3(0, 0, 0)
      const endPosition = new THREE.Vector3(...targetPosition)
      const endLookAt = new THREE.Vector3(...targetLookAt)
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        camera.position.lerpVectors(startPosition, endPosition, easedProgress)
        const lookAt = startLookAt.clone().lerp(endLookAt, easedProgress)
        camera.lookAt(lookAt)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          isAnimating.current = false
          onFlyComplete?.()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [shouldFly, targetPosition, targetLookAt, duration, camera, onFlyComplete])

  return null
}

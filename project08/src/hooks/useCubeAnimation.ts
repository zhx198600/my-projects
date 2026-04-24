import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'

export function useCubeAnimation() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  return meshRef
}

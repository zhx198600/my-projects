import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAppStore } from '@/store'
import { useEffect } from 'react'

interface FpsCounterProps {
  onFpsChange?: (fps: number) => void
}

export function FpsCounter({ onFpsChange }: FpsCounterProps) {
  const showStats = useAppStore((state) => state.showStats)
  const setFps = useAppStore((state) => state.setFps)
  const framesRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const { gl } = useThree()

  useEffect(() => {
    if (showStats) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    } else {
      gl.setPixelRatio(window.devicePixelRatio)
    }
  }, [gl, showStats])

  useFrame(() => {
    if (!showStats) return

    framesRef.current++

    const currentTime = performance.now()
    if (currentTime - lastTimeRef.current >= 1000) {
      const currentFps = Math.round((framesRef.current * 1000) / (currentTime - lastTimeRef.current))
      setFps(currentFps)
      onFpsChange?.(currentFps)
      framesRef.current = 0
      lastTimeRef.current = currentTime
    }
  })

  return null
}

interface PerformanceDisplayProps {
  showStats: boolean
  fps: number
}

export function PerformanceDisplay({ showStats, fps }: PerformanceDisplayProps) {
  if (!showStats) return null

  const getFpsColor = () => {
    if (fps >= 50) return '#4ade80'
    if (fps >= 30) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 16,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 14,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <div>FPS: <span style={{ color: getFpsColor() }}>{fps}</span></div>
    </div>
  )
}

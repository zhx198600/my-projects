import { useRef, useEffect, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAppStore } from '@/store'
import * as THREE from 'three'

interface FirstPersonControlsProps {
  enabled?: boolean
  moveSpeed?: number
  lookSpeed?: number
  height?: number
  gravity?: number
  jumpForce?: number
  onPointerLockChange?: (isLocked: boolean) => void
}

interface CollisionObject {
  mesh: THREE.Mesh
  boundingBox: THREE.Box3
}

export function FirstPersonControls({
  enabled = true,
  moveSpeed = 5,
  lookSpeed = 0.002,
  height = 1.7,
  gravity = -9.8,
  jumpForce = 5,
  onPointerLockChange,
}: FirstPersonControlsProps) {
  const { camera, gl } = useThree()
  const cameraMode = useAppStore((state) => state.cameraMode)
  
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isPointerLocked = useRef(false)
  const keysPressed = useRef<Set<string>>(new Set())
  const isGrounded = useRef(true)
  const collisionObjects = useRef<CollisionObject[]>([])
  const hasInitialized = useRef(false)

  const initCameraPosition = useCallback(() => {
    if (!hasInitialized.current) {
      camera.position.set(0, height, 8)
      camera.rotation.set(0, 0, 0)
      euler.current.set(0, 0, 0)
      hasInitialized.current = true
    }
  }, [camera, height])

  const updateCollisionObjects = useCallback(() => {
    collisionObjects.current = []
    
    const scene = camera.parent
    if (!scene) return

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.geometry) {
        const boundingBox = new THREE.Box3().setFromObject(mesh)
        collisionObjects.current.push({ mesh, boundingBox })
      }
    })
  }, [camera])

  const checkCollision = useCallback((position: THREE.Vector3, radius = 0.3, heightCheck = true): boolean => {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(
        position.x - radius,
        heightCheck ? position.y : position.y - radius,
        position.z - radius
      ),
      new THREE.Vector3(
        position.x + radius,
        heightCheck ? position.y + height : position.y + radius,
        position.z + radius
      )
    )

    for (const obj of collisionObjects.current) {
      if (playerBox.intersectsBox(obj.boundingBox)) {
        return true
      }
    }
    return false
  }, [height])

  const checkGround = useCallback((position: THREE.Vector3): boolean => {
    const groundCheck = position.clone()
    groundCheck.y -= height + 0.1
    return checkCollision(groundCheck, 0.3, false)
  }, [checkCollision, height])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPointerLocked.current || !enabled) return

    const { movementX, movementY } = event

    euler.current.setFromQuaternion(camera.quaternion)

    euler.current.y -= movementX * lookSpeed
    euler.current.x -= movementY * lookSpeed

    euler.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.current.x))

    camera.quaternion.setFromEuler(euler.current)
  }, [camera, enabled, lookSpeed])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.code)
    
    if (event.code === 'Space' && isGrounded.current && enabled) {
      velocity.current.y = jumpForce
      isGrounded.current = false
    }
  }, [enabled, jumpForce])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.code)
  }, [])

  const handlePointerLockChange = useCallback(() => {
    const locked = document.pointerLockElement === gl.domElement
    isPointerLocked.current = locked
    onPointerLockChange?.(locked)
  }, [gl.domElement, onPointerLockChange])

  const requestPointerLock = useCallback(() => {
    if (document.pointerLockElement !== gl.domElement) {
      gl.domElement.requestPointerLock()
    }
  }, [gl.domElement])

  useEffect(() => {
    if (!enabled || cameraMode !== 'firstPerson') return

    initCameraPosition()
    updateCollisionObjects()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    gl.domElement.addEventListener('click', requestPointerLock)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      gl.domElement.removeEventListener('click', requestPointerLock)
      
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
  }, [enabled, cameraMode, initCameraPosition, updateCollisionObjects, handleMouseMove, handleKeyDown, handleKeyUp, handlePointerLockChange, requestPointerLock, gl.domElement])

  useFrame((_, delta) => {
    if (!enabled || cameraMode !== 'firstPerson') return

    const actualSpeed = isPointerLocked.current ? moveSpeed : 0

    direction.current.z = 0
    direction.current.x = 0

    if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
      direction.current.z -= 1
    }
    if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
      direction.current.z += 1
    }
    if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
      direction.current.x += 1
    }
    if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
      direction.current.x -= 1
    }

    direction.current.normalize()

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    forward.y = 0
    right.y = 0
    forward.normalize()
    right.normalize()

    const moveVector = new THREE.Vector3()
    moveVector.addScaledVector(forward, direction.current.z)
    moveVector.addScaledVector(right, direction.current.x)
    moveVector.normalize().multiplyScalar(actualSpeed * delta)

    const newPosition = camera.position.clone().add(moveVector)

    if (moveVector.length() > 0.0001 && !checkCollision(newPosition)) {
      camera.position.copy(newPosition)
    }

    if (!isGrounded.current) {
      velocity.current.y += gravity * delta
      
      const newYPosition = camera.position.clone()
      newYPosition.y += velocity.current.y * delta
      
      const onGround = checkGround(newYPosition)
      
      if (onGround && velocity.current.y < 0) {
        velocity.current.y = 0
        isGrounded.current = true
        newYPosition.y = height
      } else if (checkCollision(newYPosition, 0.3, true)) {
        velocity.current.y = 0
      }
      
      camera.position.y = newYPosition.y
    }
  })

  return null
}

interface FirstPersonUIProps {
  isLocked: boolean
  cameraMode: 'orbit' | 'firstPerson'
  onSwitchMode: (mode: 'orbit' | 'firstPerson') => void
}

export function FirstPersonUI({ isLocked, cameraMode, onSwitchMode }: FirstPersonUIProps) {
  if (cameraMode !== 'firstPerson') return null

  return (
    <div className="absolute top-20 left-4 z-10 pointer-events-none">
      {!isLocked ? (
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-2 text-yellow-400">第一人称模式</h3>
          <p className="text-sm mb-2">点击屏幕以锁定鼠标</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>W/↑ - 前进</p>
            <p>S/↓ - 后退</p>
            <p>A/← - 左移</p>
            <p>D/→ - 右移</p>
            <p>空格 - 跳跃</p>
            <p>ESC - 解锁鼠标</p>
          </div>
          <button
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm pointer-events-auto transition-colors"
            onClick={() => onSwitchMode('orbit')}
          >
            切换到轨道模式
          </button>
        </div>
      ) : (
        <div className="bg-black bg-opacity-50 text-white p-2 rounded">
          <p className="text-xs text-gray-300">按 ESC 解锁鼠标 | 空格键跳跃</p>
        </div>
      )}
    </div>
  )
}

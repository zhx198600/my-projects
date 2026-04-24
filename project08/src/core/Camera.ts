import { PerspectiveCamera } from 'three'

export function createCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(5, 5, 5)
  return camera
}

export function updateCameraAspect(camera: PerspectiveCamera): void {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

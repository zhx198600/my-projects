import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import * as TWEEN from '@tweenjs/tween.js'

const forceUIStyle = document.createElement('style')
forceUIStyle.textContent = `
  body > div {
    z-index: 9999 !important;
    pointer-events: auto !important;
  }
  canvas {
    z-index: 1 !important;
  }
`
document.head.appendChild(forceUIStyle)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)
scene.fog = new THREE.Fog(0x87ceeb, 80, 200)

const PLAYER_HEIGHT = 1.7
const MOVE_SPEED = 4.0
const COLLISION_DISTANCE = 0.5

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, PLAYER_HEIGHT, -60)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0'
renderer.domElement.style.left = '0'
renderer.domElement.style.zIndex = '1'
document.body.appendChild(renderer.domElement)

const controls = new PointerLockControls(camera, renderer.domElement)

const startScreen = document.getElementById('start-screen')
const startBtn = document.getElementById('start-btn')
const fpsCounter = document.getElementById('fps-counter')
const controlsHud = document.getElementById('controls-hud')
const loadingOverlay = document.getElementById('loading-overlay')
const loadingProgress = document.getElementById('loading-progress')

function updateLoading(percent) {
  if (loadingProgress) {
    loadingProgress.style.width = percent + '%'
  }
}
updateLoading(10)

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden')
  controls.lock()
})

controls.addEventListener('lock', () => {
  controlsHud.classList.add('visible')
  document.body.style.pointerEvents = 'auto'
})

controls.addEventListener('unlock', () => {
  controlsHud.classList.remove('visible')
  startScreen.classList.remove('hidden')
})

let frameCount = 0
let fps = 60
let lastFpsUpdate = performance.now()

function updateFPS() {
  frameCount++
  const now = performance.now()
  if (now - lastFpsUpdate >= 1000) {
    fps = Math.round(frameCount * 1000 / (now - lastFpsUpdate))
    const fpsColor = fps >= 45 ? '#00ff00' : fps >= 30 ? '#ffd700' : '#ff4444'
    fpsCounter.innerHTML = `FPS: <span style="color: ${fpsColor}">${fps}</span>`
    frameCount = 0
    lastFpsUpdate = now
  }
}

updateLoading(20)

let isTeleporting = false
const teleportRaycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const teleportMarkerGeo = new THREE.RingGeometry(0.3, 0.6, 16)
const teleportMarkerMat = new THREE.MeshBasicMaterial({
  color: 0xffd700,
  transparent: true,
  opacity: 0.8,
  side: THREE.DoubleSide
})
const teleportMarker = new THREE.Mesh(teleportMarkerGeo, teleportMarkerMat)
teleportMarker.rotation.x = -Math.PI / 2
teleportMarker.visible = false
scene.add(teleportMarker)

const teleportTargetGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 6)
const teleportTargetMat = new THREE.MeshBasicMaterial({
  color: 0xffd700,
  transparent: true,
  opacity: 0.5
})
const teleportTarget = new THREE.Mesh(teleportTargetGeo, teleportTargetMat)
teleportTarget.visible = false
scene.add(teleportTarget)

updateLoading(30)

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
}

const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()

document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = true
  }
  if (e.key.toLowerCase() === 'p') {
    takeScreenshot()
  }
})

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = false
  }
})

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.0)
directionalLight.position.set(60, 80, 40)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 300
directionalLight.shadow.camera.left = -80
directionalLight.shadow.camera.right = 80
directionalLight.shadow.camera.top = 80
directionalLight.shadow.camera.bottom = -80
scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x7cba5f, 0.4)
scene.add(hemisphereLight)

const redWallMaterial = new THREE.MeshStandardMaterial({
  color: 0xcd2626,
  roughness: 0.7,
  metalness: 0.1
})

const goldRoofMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  roughness: 0.3,
  metalness: 0.6
})

const whiteStoneMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5f5f5,
  roughness: 0.8,
  metalness: 0.1
})

const groundGeo = new THREE.PlaneGeometry(200, 400)
const groundMat = new THREE.MeshStandardMaterial({
  color: 0xd4c4a8,
  roughness: 0.9,
  metalness: 0
})
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
ground.position.y = -0.01
ground.receiveShadow = true
scene.add(ground)

const axisLineGeo = new THREE.BoxGeometry(6, 0.05, 350)
const axisLine = new THREE.Mesh(axisLineGeo, new THREE.MeshStandardMaterial({
  color: 0xc9a86c,
  roughness: 0.8
}))
axisLine.position.set(0, 0.02, 0)
scene.add(axisLine)

updateLoading(40)

function createPlatform(width, depth, height, levels = 3) {
  const platform = new THREE.Group()
  
  for (let i = 0; i < Math.min(levels, 2); i++) {
    const ratio = 1 - i * 0.1
    const levelW = width * ratio
    const levelD = depth * ratio
    const levelH = height / levels

    const geo = new THREE.BoxGeometry(levelW, levelH, levelD)
    const mesh = new THREE.Mesh(geo, whiteStoneMaterial)
    mesh.position.y = i * levelH + levelH / 2
    mesh.castShadow = true
    mesh.receiveShadow = true
    platform.add(mesh)
  }

  return platform
}

function createRoof(width, depth, height, isDouble = false) {
  const roof = new THREE.Group()

  const mainGeo = new THREE.BoxGeometry(width * 1, height * 0.4, depth * 1)
  const main = new THREE.Mesh(mainGeo, goldRoofMaterial)
  main.castShadow = true
  roof.add(main)

  const eaveGeo = new THREE.BoxGeometry(width * 1.15, height * 0.3, depth * 1.1)
  const eave = new THREE.Mesh(eaveGeo, goldRoofMaterial)
  eave.position.y = -height * 0.25
  eave.castShadow = true
  roof.add(eave)

  if (isDouble) {
    const main2Geo = new THREE.BoxGeometry(width * 0.85, height * 0.35, depth * 0.85)
    const main2 = new THREE.Mesh(main2Geo, goldRoofMaterial)
    main2.position.y = height * 0.8
    main2.castShadow = true
    roof.add(main2)
  }

  return roof
}

function createPalace(width, depth, height, hasDoubleRoof = false, platformLevels = 3) {
  const building = new THREE.Group()

  const platformH = height * 0.4
  const platform = createPlatform(width * 1.2, depth * 1.2, platformH, platformLevels)
  building.add(platform)

  const bodyH = height * 0.35
  const wallThickness = 1

  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, bodyH, wallThickness),
    redWallMaterial
  )
  northWall.position.set(0, platformH + bodyH / 2, -depth / 2)
  northWall.castShadow = true
  building.add(northWall)

  const southWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, bodyH, wallThickness),
    redWallMaterial
  )
  southWall.position.set(0, platformH + bodyH / 2, depth / 2)
  southWall.castShadow = true
  building.add(southWall)

  for (let side of [-1, 1]) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, bodyH, depth),
      redWallMaterial
    )
    wall.position.set(side * width / 2, platformH + bodyH / 2, 0)
    wall.castShadow = true
    building.add(wall)
  }

  const roofY = platformH + bodyH
  const roof = createRoof(width * 1.1, depth * 1.1, height * 0.35, hasDoubleRoof)
  roof.position.y = roofY
  building.add(roof)

  return building
}

function createGate(width, depth, height) {
  const gate = new THREE.Group()

  const baseH = height * 0.5
  const baseGeo = new THREE.BoxGeometry(width, baseH, depth)
  const base = new THREE.Mesh(baseGeo, redWallMaterial)
  base.position.y = baseH / 2
  base.castShadow = true
  base.receiveShadow = true
  gate.add(base)

  const towerW = width * 0.6
  const towerH = height * 0.35
  
  const towerBaseGeo = new THREE.BoxGeometry(towerW, 2, depth * 0.8)
  const towerBase = new THREE.Mesh(towerBaseGeo, whiteStoneMaterial)
  towerBase.position.y = baseH + 1
  towerBase.castShadow = true
  gate.add(towerBase)

  for (let side of [-1, 1]) {
    const towerWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, towerH, depth * 0.7),
      redWallMaterial
    )
    towerWall.position.set(side * towerW / 2, baseH + 2 + towerH / 2, 0)
    towerWall.castShadow = true
    gate.add(towerWall)
  }

  const roofY = baseH + 2 + towerH
  const roof = createRoof(towerW * 1.2, depth * 0.9, height * 0.25, true)
  roof.position.y = roofY
  gate.add(roof)

  return gate
}

function createGarden(width, depth) {
  const garden = new THREE.Group()

  const groundGeo = new THREE.BoxGeometry(width, 0.5, depth)
  const groundMesh = new THREE.Mesh(groundGeo, whiteStoneMaterial)
  groundMesh.position.y = 0.25
  groundMesh.receiveShadow = true
  garden.add(groundMesh)

  const pavalion = createPalace(8, 8, 8, false, 1)
  garden.add(pavalion)

  return garden
}

updateLoading(50)

const buildingsConfig = [
  { name: '午门', z: -80, creator: createGate, params: [40, 25, 22] },
  { name: '太和门', z: -40, creator: createPalace, params: [25, 15, 18, true, 2] },
  { name: '太和殿', z: 0, creator: createPalace, params: [35, 25, 30, true, 3] },
  { name: '中和殿', z: 25, creator: createPalace, params: [15, 15, 14, false, 2] },
  { name: '保和殿', z: 45, creator: createPalace, params: [28, 18, 22, true, 2] },
  { name: '乾清宫', z: 75, creator: createPalace, params: [25, 16, 20, true, 2] },
  { name: '交泰殿', z: 95, creator: createPalace, params: [12, 12, 12, false, 1] },
  { name: '坤宁宫', z: 115, creator: createPalace, params: [24, 18, 18, true, 2] },
  { name: '御花园', z: 145, creator: createGarden, params: [35, 30] }
]

const collidableMeshes = []

buildingsConfig.forEach(config => {
  const building = config.creator(...config.params)
  building.position.z = config.z
  building.userData.name = config.name
  scene.add(building)
  
  building.traverse((child) => {
    if (child.isMesh) {
      collidableMeshes.push(child)
    }
  })
})

for (let side of [-1, 1]) {
  const wallH = 6
  const wallGeo = new THREE.BoxGeometry(0.8, wallH, 220)
  const sideWall = new THREE.Mesh(wallGeo, redWallMaterial)
  sideWall.position.set(side * 35, wallH / 2, 30)
  sideWall.castShadow = true
  sideWall.receiveShadow = true
  scene.add(sideWall)
  collidableMeshes.push(sideWall)
}

updateLoading(60)

const raycaster = new THREE.Raycaster()
const collisionDirections = [
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(1, 0, 0)
]

function checkCollision(moveDirection) {
  const playerPos = controls.object.position.clone()
  playerPos.y = PLAYER_HEIGHT / 2
  
  const normalizedDir = moveDirection.clone().normalize()
  
  for (const dir of collisionDirections) {
    const worldDir = dir.clone()
    worldDir.applyQuaternion(camera.quaternion)
    worldDir.y = 0
    worldDir.normalize()
    
    if (normalizedDir.dot(worldDir) > 0.5) {
      raycaster.set(playerPos, worldDir)
      const intersects = raycaster.intersectObjects(collidableMeshes)
      
      if (intersects.length > 0 && intersects[0].distance < COLLISION_DISTANCE) {
        return true
      }
    }
  }
  return false
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

updateLoading(70)

function startTeleport(targetPosition) {
  if (isTeleporting) return
  
  isTeleporting = true
  const startPosition = controls.object.position.clone()
  
  new TWEEN.Tween(startPosition)
    .to(targetPosition, 800)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      controls.object.position.copy(startPosition)
      controls.object.position.y = PLAYER_HEIGHT
    })
    .onComplete(() => {
      isTeleporting = false
      teleportMarker.visible = false
      teleportTarget.visible = false
    })
    .start()
}

function isValidTeleportArea(position) {
  const x = Math.abs(position.x)
  const z = position.z
  
  if (x > 32) return false
  
  for (const building of buildingsConfig) {
    const buildingZ = building.z
    if (Math.abs(z - buildingZ) < 12 && x < 15) {
      return false
    }
  }
  
  return true
}

renderer.domElement.addEventListener('click', (event) => {
  if (!controls.isLocked || isTeleporting) return
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  
  const hotspotRaycaster = new THREE.Raycaster()
  hotspotRaycaster.setFromCamera(mouse, camera)
  const hotspotIntersects = hotspotRaycaster.intersectObjects(hotspots, true)
  
  if (hotspotIntersects.length > 0) {
    let target = hotspotIntersects[0].object
    while (target.parent && !target.userData.palaceName) {
      target = target.parent
    }
    if (target.userData.palaceName) {
      showInfoPanel(target.userData.palaceName)
    }
    return
  }
  
  teleportRaycaster.setFromCamera(mouse, camera)
  const intersects = teleportRaycaster.intersectObject(ground)
  
  if (intersects.length > 0) {
    const point = intersects[0].point
    
    if (isValidTeleportArea(point)) {
      teleportMarker.position.set(point.x, 0.02, point.z)
      teleportMarker.visible = true
      
      teleportTarget.position.set(point.x, 1, point.z)
      teleportTarget.visible = true
      
      const targetPos = new THREE.Vector3(point.x, PLAYER_HEIGHT, point.z)
      startTeleport(targetPos)
    } else {
      teleportMarkerMat.color.setHex(0xff4444)
      teleportMarker.position.set(point.x, 0.02, point.z)
      teleportMarker.visible = true
      setTimeout(() => {
        teleportMarker.visible = false
        teleportMarkerMat.color.setHex(0xffd700)
      }, 500)
    }
  }
})

updateLoading(75)

const teleportPanel = document.createElement('div')
teleportPanel.style.cssText = `
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(139, 26, 26, 0.95), rgba(70, 10, 10, 0.95));
  padding: 15px;
  border-radius: 12px;
  color: #ffd700;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  z-index: 9999 !important;
  pointer-events: auto !important;
  min-width: 160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.4);
`
teleportPanel.innerHTML = `<h3 style="margin: 0 0 12px 0; font-size: 16px; color: #ffd700; letter-spacing: 2px;">🏯 瞬移面板</h3>`
document.body.appendChild(teleportPanel)

const teleportLocations = [
  { name: '午门入口', x: 0, z: -65 },
  { name: '太和门', x: 0, z: -28 },
  { name: '太和殿广场', x: 0, z: -12 },
  { name: '中和殿', x: 0, z: 35 },
  { name: '保和殿后', x: 0, z: 58 },
  { name: '乾清宫', x: 0, z: 88 },
  { name: '御花园', x: 0, z: 135 }
]

teleportLocations.forEach(loc => {
  const btn = document.createElement('button')
  btn.textContent = loc.name
  btn.style.cssText = `
    display: block;
    width: 100%;
    margin: 6px 0;
    padding: 8px 12px;
    background: linear-gradient(135deg, #cd2626, #8b1a1a);
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
    font-family: 'Microsoft YaHei', serif;
  `
  btn.addEventListener('mouseover', () => {
    btn.style.background = 'linear-gradient(135deg, #ff4444, #aa2222)'
    btn.style.transform = 'scale(1.02)'
    btn.style.boxShadow = '0 2px 10px rgba(255, 215, 0, 0.3)'
  })
  btn.addEventListener('mouseout', () => {
    btn.style.background = 'linear-gradient(135deg, #cd2626, #8b1a1a)'
    btn.style.transform = 'scale(1)'
    btn.style.boxShadow = 'none'
  })
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const targetPos = new THREE.Vector3(loc.x, PLAYER_HEIGHT, loc.z)
    startTeleport(targetPos)
  })
  teleportPanel.appendChild(btn)
})

updateLoading(80)

function takeScreenshot() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const filename = `故宫漫游_${year}${month}${day}_${hours}${minutes}${seconds}.png`

  renderer.domElement.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('📸 截图成功！图片已保存')
    } else {
      showToast('❌ 截图失败，请重试')
    }
  }, 'image/png', 1.0)
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(139, 26, 26, 0.95), rgba(70, 10, 10, 0.95));
    color: #ffd700;
    padding: 15px 30px;
    border-radius: 10px;
    font-family: 'Microsoft YaHei', serif;
    font-size: 16px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #ffd700;
    pointer-events: none;
  `
  toast.textContent = message
  document.body.appendChild(toast)

  toast.animate([
    { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' },
    { opacity: 1, transform: 'translateX(-50%) translateY(0)' }
  ], { duration: 300, easing: 'ease-out' })

  setTimeout(() => {
    toast.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 300, easing: 'ease-in' })
    setTimeout(() => toast.remove(), 300)
  }, 1700)
}

const screenshotBtn = document.createElement('button')
screenshotBtn.innerHTML = '📸 一键截图 (P)'
screenshotBtn.style.cssText = `
  display: block;
  width: 100%;
  margin: 15px 0 6px 0;
  padding: 10px 12px;
  background: linear-gradient(135deg, #b8860b, #8b6508);
  color: #fff8dc;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  border-top: 1px solid rgba(255,215,0,0.3);
  padding-top: 12px;
  font-family: 'Microsoft YaHei', serif;
`
screenshotBtn.addEventListener('mouseover', () => {
  screenshotBtn.style.background = 'linear-gradient(135deg, #daa520, #b8860b)'
  screenshotBtn.style.transform = 'scale(1.02)'
})
screenshotBtn.addEventListener('mouseout', () => {
  screenshotBtn.style.background = 'linear-gradient(135deg, #b8860b, #8b6508)'
  screenshotBtn.style.transform = 'scale(1)'
})
screenshotBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  takeScreenshot()
})
teleportPanel.appendChild(screenshotBtn)

updateLoading(85)

const scenePanel = document.createElement('div')
scenePanel.style.cssText = `
  position: absolute;
  top: 20px;
  left: 20px;
  background: linear-gradient(135deg, rgba(139, 26, 26, 0.95), rgba(70, 10, 10, 0.95));
  padding: 15px;
  border-radius: 12px;
  color: #ffd700;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  z-index: 9999 !important;
  pointer-events: auto !important;
  min-width: 140px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.4);
`
scenePanel.innerHTML = `<h3 style="margin: 0 0 12px 0; font-size: 16px; color: #ffd700; letter-spacing: 2px;">🌅 场景切换</h3>`
document.body.appendChild(scenePanel)

const sceneModes = [
  { name: '☀️ 白天', mode: 'day' },
  { name: '🌙 夜景', mode: 'night' },
  { name: '❄️ 雪景', mode: 'snow' }
]

let currentSceneMode = 'day'
let snowParticleSystem = null
let nightLights = []
let originalMaterials = new Map()

const sceneConfigs = {
  day: {
    background: { r: 135 / 255, g: 206 / 255, b: 235 / 255 },
    fog: { r: 135 / 255, g: 206 / 255, b: 235 / 255, density: 0 },
    ambient: { r: 1, g: 1, b: 1, intensity: 0.5 },
    directional: { r: 1, g: 245 / 255, b: 230 / 255, intensity: 1.0 },
    hemisphere: { sky: { r: 135 / 255, g: 206 / 255, b: 235 / 255 }, ground: { r: 124 / 255, g: 186 / 255, b: 95 / 255 }, intensity: 0.4 }
  },
  night: {
    background: { r: 10 / 255, g: 20 / 255, b: 60 / 255 },
    fog: { r: 10 / 255, g: 20 / 255, b: 60 / 255, density: 0 },
    ambient: { r: 50 / 255, g: 60 / 255, b: 100 / 255, intensity: 0.15 },
    directional: { r: 180 / 255, g: 200 / 255, b: 255 / 255, intensity: 0.3 },
    hemisphere: { sky: { r: 20 / 255, g: 40 / 255, b: 80 / 255 }, ground: { r: 30 / 255, g: 40 / 255, b: 50 / 255 }, intensity: 0.1 }
  },
  snow: {
    background: { r: 180 / 255, g: 190 / 255, b: 210 / 255 },
    fog: { r: 200 / 255, g: 210 / 255, b: 230 / 255, density: 0 },
    ambient: { r: 200 / 255, g: 210 / 255, b: 230 / 255, intensity: 0.4 },
    directional: { r: 220 / 255, g: 230 / 255, b: 250 / 255, intensity: 0.6 },
    hemisphere: { sky: { r: 180 / 255, g: 190 / 255, b: 210 / 255 }, ground: { r: 200 / 255, g: 205 / 255, b: 215 / 255 }, intensity: 0.3 }
  }
}

function saveOriginalMaterials() {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      if (!originalMaterials.has(obj.uuid)) {
        originalMaterials.set(obj.uuid, {
          material: obj.material,
          color: obj.material.color ? obj.material.color.clone() : null
        })
      }
    }
  })
}

function createSnowParticles() {
  if (snowParticleSystem) return

  const particleCount = 1000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const velocities = []

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200
    positions[i * 3 + 1] = Math.random() * 100
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400
    velocities.push({
      x: (Math.random() - 0.5) * 0.1,
      y: -0.2 - Math.random() * 0.3,
      z: (Math.random() - 0.5) * 0.1
    })
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  snowParticleSystem = new THREE.Points(geometry, material)
  snowParticleSystem.userData.velocities = velocities
  scene.add(snowParticleSystem)
}

function removeSnowParticles() {
  if (snowParticleSystem) {
    scene.remove(snowParticleSystem)
    snowParticleSystem.geometry.dispose()
    snowParticleSystem.material.dispose()
    snowParticleSystem = null
  }
}

function updateSnowParticles() {
  if (!snowParticleSystem) return

  const positions = snowParticleSystem.geometry.attributes.position.array
  const velocities = snowParticleSystem.userData.velocities

  for (let i = 0; i < velocities.length; i++) {
    positions[i * 3] += velocities[i].x
    positions[i * 3 + 1] += velocities[i].y
    positions[i * 3 + 2] += velocities[i].z

    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 100
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400
    }
  }

  snowParticleSystem.geometry.attributes.position.needsUpdate = true
}

function applySnowMaterials(apply) {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      const original = originalMaterials.get(obj.uuid)
      if (!original) return

      const isRoof = obj.material.color && obj.material.color.getHex() === 0xffd700
      const isGround = obj === ground

      if (apply) {
        if (isRoof || isGround) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0xf0f5fa,
            roughness: 0.9,
            metalness: 0.05
          })
        }
      } else {
        if (isRoof || isGround) {
          obj.material = original.material
        }
      }
    }
  })
}

function createNightLights() {
  if (nightLights.length > 0) return

  const lightPositions = [
    { x: 0, z: -80, y: 8 },
    { x: 0, z: -40, y: 10 },
    { x: 0, z: 0, y: 15 },
    { x: 0, z: 45, y: 12 },
    { x: 0, z: 75, y: 11 },
    { x: 0, z: 115, y: 10 }
  ]

  lightPositions.forEach(pos => {
    const light = new THREE.PointLight(0xffcc66, 0, 25)
    light.position.set(pos.x, pos.y, pos.z)
    scene.add(light)
    nightLights.push(light)
  })
}

function removeNightLights() {
  nightLights.forEach(light => {
    scene.remove(light)
    light.dispose()
  })
  nightLights = []
}

function tweenColor(colorObj, targetRgb, duration = 1500) {
  return new TWEEN.Tween({
    r: colorObj.r,
    g: colorObj.g,
    b: colorObj.b
  })
    .to(targetRgb, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((obj) => {
      colorObj.setRGB(obj.r, obj.g, obj.b)
    })
}

function tweenValue(target, property, targetValue, duration = 1500) {
  return new TWEEN.Tween({ value: target[property] })
    .to({ value: targetValue }, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((obj) => {
      target[property] = obj.value
    })
}

function transitionToScene(mode) {
  if (currentSceneMode === mode) return
  currentSceneMode = mode

  const config = sceneConfigs[mode]

  tweenColor(scene.background, config.background, 1500).start()
  tweenColor(scene.fog.color, config.fog, 1500).start()

  tweenColor(ambientLight.color, config.ambient, 1500).start()
  tweenValue(ambientLight, 'intensity', config.ambient.intensity, 1500).start()

  tweenColor(directionalLight.color, config.directional, 1500).start()
  tweenValue(directionalLight, 'intensity', config.directional.intensity, 1500).start()

  tweenColor(hemisphereLight.color, config.hemisphere.sky, 1500).start()
  tweenColor(hemisphereLight.groundColor, config.hemisphere.ground, 1500).start()
  tweenValue(hemisphereLight, 'intensity', config.hemisphere.intensity, 1500).start()

  if (mode === 'snow') {
    saveOriginalMaterials()
    createSnowParticles()
    setTimeout(() => applySnowMaterials(true), 500)
  } else {
    removeSnowParticles()
    applySnowMaterials(false)
  }

  if (mode === 'night') {
    createNightLights()
    nightLights.forEach((light, index) => {
      tweenValue(light, 'intensity', 0.8 + Math.random() * 0.4, 2000).delay(index * 100).start()
    })
  } else {
    nightLights.forEach(light => {
      tweenValue(light, 'intensity', 0, 1000).start()
    })
    setTimeout(() => {
      if (mode !== 'night') removeNightLights()
    }, 1200)
  }
}

sceneModes.forEach(sceneMode => {
  const btn = document.createElement('button')
  btn.textContent = sceneMode.name
  btn.style.cssText = `
    display: block;
    width: 100%;
    margin: 6px 0;
    padding: 8px 12px;
    background: ${sceneMode.mode === 'day' ? 'linear-gradient(135deg, #cd2626, #8b1a1a)' : sceneMode.mode === 'night' ? 'linear-gradient(135deg, #374151, #1f2937)' : 'linear-gradient(135deg, #94a3b8, #64748b)'};
    color: ${sceneMode.mode === 'day' ? '#ffd700' : 'white'};
    border: ${sceneMode.mode === 'day' ? '2px solid #ffd700' : '1px solid rgba(255, 215, 0, 0.3)'};
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
    font-family: 'Microsoft YaHei', serif;
  `
  btn.addEventListener('mouseover', () => {
    btn.style.transform = 'scale(1.02)'
  })
  btn.addEventListener('mouseout', () => {
    btn.style.transform = 'scale(1)'
  })
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    scenePanel.querySelectorAll('button').forEach(b => {
      b.style.border = '1px solid rgba(255, 215, 0, 0.3)'
    })
    btn.style.border = '2px solid #ffd700'
    transitionToScene(sceneMode.mode)
  })
  scenePanel.appendChild(btn)
})

updateLoading(90)

const hotspotRaycaster = new THREE.Raycaster()
const hotspots = []
const HOTSPOT_LOD_DISTANCE = 250

const palaceInfo = {
  '午门': { title: '午门', content: '午门是故宫的正门，始建于明永乐十八年（1420年）。它是紫禁城四座城门中最大的一座，通高37.95米。午门是皇帝举行大典、颁发诏书的地方。' },
  '太和门': { title: '太和门', content: '太和门是紫禁城内最大的宫门，也是外朝宫殿的正门。建于明永乐十八年（1420年），这里是皇帝"御门听政"的地方。' },
  '太和殿': { title: '太和殿', content: '太和殿，俗称"金銮殿"，是故宫三大殿之首。始建于明永乐十八年（1420年），太和殿是中国现存最大的木结构大殿。' },
  '中和殿': { title: '中和殿', content: '中和殿是故宫三大殿之一，位于太和殿和保和殿之间。建于明永乐十八年（1420年），是皇帝举行大典前稍事休息的地方。' },
  '保和殿': { title: '保和殿', content: '保和殿是故宫三大殿之一，建于明永乐十八年（1420年）。清代，每年除夕和元宵，皇帝在此宴请王公贵族和文武大臣。' },
  '乾清宫': { title: '乾清宫', content: '乾清宫是内廷后三宫之首，始建于明永乐十八年（1420年）。这里是明代至清康熙年间皇帝的寝宫。' },
  '交泰殿': { title: '交泰殿', content: '交泰殿位于乾清宫和坤宁宫之间，含"天地交合、康泰美满"之意。清代，这里是皇后在重要节日接受朝贺的地方。' },
  '坤宁宫': { title: '坤宁宫', content: '坤宁宫是内廷后三宫之一，始建于明永乐十八年（1420年）。明代为皇后寝宫，清代改为萨满教祭神的主要场所。' },
  '御花园': { title: '御花园', content: '御花园位于紫禁城中轴线的北端，始建于明永乐十八年（1420年），全园占地12000平方米，是帝王后妃休闲娱乐的场所。' }
}

function createHotspotMarker() {
  const hotspotGroup = new THREE.Group()

  const outerRingGeo = new THREE.TorusGeometry(1.5, 0.25, 8, 16)
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
  })
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
  outerRing.rotation.x = Math.PI / 2
  hotspotGroup.add(outerRing)

  const middleRingGeo = new THREE.TorusGeometry(1.0, 0.15, 8, 16)
  const middleRingMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
  })
  const middleRing = new THREE.Mesh(middleRingGeo, middleRingMat)
  middleRing.rotation.x = Math.PI / 2
  hotspotGroup.add(middleRing)

  const coreGeo = new THREE.SphereGeometry(0.6, 12, 12)
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0
  })
  const core = new THREE.Mesh(coreGeo, coreMat)
  hotspotGroup.add(core)

  const columnGeo = new THREE.CylinderGeometry(0.1, 0.1, 15, 8)
  const columnMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.6
  })
  const column = new THREE.Mesh(columnGeo, columnMat)
  column.position.y = 6
  hotspotGroup.add(column)

  hotspotGroup.userData = {
    outerRing,
    middleRing,
    core,
    column,
    baseY: 0,
    phase: Math.random() * Math.PI * 2
  }

  return hotspotGroup
}

const hotspotPositions = [
  { name: '午门', x: 0, z: -62, y: 5 },
  { name: '太和门', x: 0, z: -22, y: 5 },
  { name: '太和殿', x: 0, z: 2, y: 6 },
  { name: '中和殿', x: 0, z: 37, y: 5 },
  { name: '保和殿', x: 0, z: 62, y: 5 },
  { name: '乾清宫', x: 0, z: 92, y: 5 },
  { name: '交泰殿', x: 0, z: 107, y: 5 },
  { name: '坤宁宫', x: 0, z: 132, y: 5 },
  { name: '御花园', x: 0, z: 162, y: 5 }
]

hotspotPositions.forEach(pos => {
  const hotspot = createHotspotMarker()
  hotspot.position.set(pos.x, pos.y, pos.z)
  hotspot.userData.palaceName = pos.name
  hotspot.userData.baseY = pos.y
  scene.add(hotspot)
  hotspots.push(hotspot)
})

const infoPanel = document.createElement('div')
infoPanel.style.cssText = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.95), rgba(70, 0, 0, 0.95));
  padding: 30px;
  border-radius: 15px;
  color: #f5e6c8;
  font-family: 'Microsoft YaHei', serif;
  z-index: 2000;
  min-width: 450px;
  max-width: 500px;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.4);
  border: 2px solid #ffd700;
  display: none;
  pointer-events: auto;
`
infoPanel.innerHTML = `
  <h2 id="panel-title" style="margin: 0 0 20px 0; color: #ffd700; font-size: 28px; text-align: center; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 15px;"></h2>
  <p id="panel-content" style="font-size: 16px; line-height: 1.8; margin: 0 0 25px 0; text-indent: 2em;"></p>
  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
    <button id="panel-voice-btn" style="padding: 12px 25px; background: linear-gradient(135deg, #1e88e5, #1565c0); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s;">🔊 语音讲解</button>
    <button id="panel-voice-stop" style="padding: 12px 25px; background: linear-gradient(135deg, #e53935, #c62828); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s;">⏹ 停止</button>
    <button id="panel-close-btn" style="padding: 12px 25px; background: linear-gradient(135deg, #ffd700, #daa520); color: #4a0000; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s;">✕ 关闭</button>
  </div>
`
document.body.appendChild(infoPanel)

function showInfoPanel(palaceName) {
  const info = palaceInfo[palaceName]
  if (!info) return
  
  controls.unlock()
  
  document.getElementById('panel-title').textContent = info.title
  document.getElementById('panel-content').textContent = info.content
  infoPanel.style.display = 'block'
}

let currentSpeechUtterance = null

function speakText(text) {
  stopSpeech()
  
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    
    currentSpeechUtterance = new SpeechSynthesisUtterance(text)
    currentSpeechUtterance.lang = 'zh-CN'
    currentSpeechUtterance.rate = 0.9
    currentSpeechUtterance.pitch = 1.1
    currentSpeechUtterance.volume = 1.0
    
    const voices = speechSynthesis.getVoices()
    const chineseVoice = voices.find(v => v.lang.includes('zh'))
    if (chineseVoice) {
      currentSpeechUtterance.voice = chineseVoice
    }
    
    speechSynthesis.speak(currentSpeechUtterance)
    showToast('🎤 开始语音讲解')
  }
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    currentSpeechUtterance = null
  }
}

function hideInfoPanel() {
  stopSpeech()
  infoPanel.style.display = 'none'
}

document.getElementById('panel-voice-btn').addEventListener('click', (e) => {
  e.stopPropagation()
  const content = document.getElementById('panel-content').textContent
  speakText(content)
})

document.getElementById('panel-voice-stop').addEventListener('click', (e) => {
  e.stopPropagation()
  stopSpeech()
  showToast('⏹ 已停止语音')
})

document.getElementById('panel-close-btn').addEventListener('click', (e) => {
  e.stopPropagation()
  hideInfoPanel()
})

function updateHotspots() {
  const cameraPos = camera.position
  
  hotspots.forEach(hotspot => {
    const distance = cameraPos.distanceTo(hotspot.position)
    const visible = distance < HOTSPOT_LOD_DISTANCE
    hotspot.visible = visible
    
    if (!visible) return
    
    const time = Date.now() * 0.001
    const userData = hotspot.userData
    
    hotspot.rotation.y += 0.02
    const floatY = Math.sin(time * 2 + userData.phase) * 0.5
    hotspot.position.y = userData.baseY + floatY
    
    const pulseScale1 = 1 + Math.sin(time * 3 + userData.phase) * 0.2
    const pulseScale2 = 1 + Math.sin(time * 3 + userData.phase + 1) * 0.15
    
    if (userData.outerRing) userData.outerRing.scale.setScalar(pulseScale1)
    if (userData.middleRing) userData.middleRing.scale.setScalar(pulseScale2)
    if (userData.core) userData.core.scale.setScalar(pulseScale1)
  })
}

updateLoading(95)

const minimapContainer = document.createElement('div')
minimapContainer.style.cssText = `
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1500;
  transition: all 0.3s ease;
  pointer-events: auto;
`
document.body.appendChild(minimapContainer)

const minimapHeader = document.createElement('div')
minimapHeader.style.cssText = `
  background: linear-gradient(135deg, rgba(139, 26, 26, 0.95), rgba(70, 0, 0, 0.95));
  padding: 8px 12px;
  border-radius: 10px 10px 0 0;
  color: #ffd700;
  font-family: 'Microsoft YaHei', serif;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid #ffd700;
  border-bottom: none;
`
minimapHeader.innerHTML = `
  <span>🗺️ 故宫导览图</span>
  <button id="toggle-minimap" style="background: none; border: none; color: #ffd700; cursor: pointer; font-size: 16px; padding: 0 5px;">−</button>
`
minimapContainer.appendChild(minimapHeader)

const minimapCanvas = document.createElement('canvas')
minimapCanvas.width = 220
minimapCanvas.height = 350
minimapCanvas.style.cssText = `
  border: 2px solid #ffd700;
  border-top: none;
  border-radius: 0 0 10px 10px;
  background: rgba(245, 235, 220, 0.95);
  cursor: crosshair;
  display: block;
`
minimapContainer.appendChild(minimapCanvas)

let isMinimapExpanded = true
const toggleBtn = document.getElementById('toggle-minimap')

toggleBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  isMinimapExpanded = !isMinimapExpanded
  minimapCanvas.style.display = isMinimapExpanded ? 'block' : 'none'
  toggleBtn.textContent = isMinimapExpanded ? '−' : '+'
})

const minimapCtx = minimapCanvas.getContext('2d')

const MAP_SCALE = 1.2
const MAP_OFFSET_X = 110
const MAP_OFFSET_Z = 290

function worldToMinimap(x, z) {
  const mapX = MAP_OFFSET_X + x * MAP_SCALE
  const mapZ = MAP_OFFSET_Z - z * MAP_SCALE
  return { x: mapX, y: mapZ }
}

function minimapToWorld(mapX, mapY) {
  const x = (mapX - MAP_OFFSET_X) / MAP_SCALE
  const z = (MAP_OFFSET_Z - mapY) / MAP_SCALE
  return { x, z }
}

function drawMinimap() {
  const ctx = minimapCtx
  const W = minimapCanvas.width
  const H = minimapCanvas.height
  
  ctx.clearRect(0, 0, W, H)
  
  ctx.fillStyle = '#f5ebdc'
  ctx.fillRect(0, 0, W, H)
  
  ctx.fillStyle = '#cd2626'
  ctx.fillRect(15, 20, 2, H - 40)
  ctx.fillRect(W - 17, 20, 2, H - 40)
  
  ctx.strokeStyle = '#c9a86c'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(W / 2, 30)
  ctx.lineTo(W / 2, H - 30)
  ctx.stroke()
  
  ctx.font = '10px Microsoft YaHei'
  ctx.fillStyle = '#8b4513'
  ctx.textAlign = 'center'
  ctx.fillText('N', W / 2, 22)
  ctx.fillText('S', W / 2, H - 12)
  
  const buildingSizes = {
    '午门': { w: 70, h: 35 }, '太和门': { w: 50, h: 28 }, '太和殿': { w: 65, h: 45 },
    '中和殿': { w: 35, h: 28 }, '保和殿': { w: 55, h: 35 }, '乾清宫': { w: 50, h: 32 },
    '交泰殿': { w: 28, h: 25 }, '坤宁宫': { w: 50, h: 32 }, '御花园': { w: 60, h: 50 }
  }
  
  const minimapBuildings = [
    { name: '午门', z: -80, x: 0 }, { name: '太和门', z: -40, x: 0 }, { name: '太和殿', z: 0, x: 0 },
    { name: '中和殿', z: 25, x: 0 }, { name: '保和殿', z: 45, x: 0 }, { name: '乾清宫', z: 75, x: 0 },
    { name: '交泰殿', z: 95, x: 0 }, { name: '坤宁宫', z: 115, x: 0 }, { name: '御花园', z: 145, x: 0 }
  ]
  
  minimapBuildings.forEach(building => {
    const pos = worldToMinimap(building.x, building.z)
    const size = buildingSizes[building.name]
    
    ctx.fillStyle = '#cd2626'
    ctx.fillRect(pos.x - size.w / 2 - 3, pos.y - size.h / 2 - 3, size.w + 6, size.h + 6)
    
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(pos.x - size.w / 2, pos.y - size.h / 2, size.w, size.h)
  })
}

function drawPlayerMarker() {
  const ctx = minimapCtx
  const playerPos = controls.object ? controls.object.position : camera.position
  
  const mapPos = worldToMinimap(playerPos.x, playerPos.z)
  
  const cameraDir = new THREE.Vector3()
  camera.getWorldDirection(cameraDir)
  let angle = Math.atan2(cameraDir.x, cameraDir.z)
  
  ctx.save()
  ctx.translate(mapPos.x, mapPos.y)
  ctx.rotate(angle)
  
  ctx.fillStyle = '#00ff00'
  ctx.beginPath()
  ctx.moveTo(0, -10)
  ctx.lineTo(-6, 6)
  ctx.lineTo(0, 2)
  ctx.lineTo(6, 6)
  ctx.closePath()
  ctx.fill()
  
  ctx.restore()
}

minimapCanvas.addEventListener('click', (e) => {
  e.stopPropagation()
  if (!controls.isLocked) return
  
  const rect = minimapCanvas.getBoundingClientRect()
  const mapX = e.clientX - rect.left
  const mapY = e.clientY - rect.top
  
  const worldPos = minimapToWorld(mapX, mapY)
  
  const targetPos = new THREE.Vector3(
    THREE.MathUtils.clamp(worldPos.x, -32, 32),
    PLAYER_HEIGHT,
    THREE.MathUtils.clamp(worldPos.z, -90, 160)
  )
  
  let isValid = true
  for (const building of buildingsConfig) {
    const buildingZ = building.z
    if (Math.abs(targetPos.z - buildingZ) < 12 && Math.abs(targetPos.x) < 15) {
      isValid = false
      break
    }
  }
  
  if (isValid) {
    startTeleport(targetPos)
  }
})

updateLoading(98)

let animatePrevTime = performance.now()

function animate() {
  requestAnimationFrame(animate)
  
  document.body.style.pointerEvents = 'auto'
  
  const time = performance.now()
  const delta = (time - animatePrevTime) / 1000
  animatePrevTime = time

  updateFPS()

  TWEEN.update()

  if (controls.isLocked && !isTeleporting) {
    velocity.x -= velocity.x * 10.0 * delta
    velocity.z -= velocity.z * 10.0 * delta

    direction.z = Number(keys.w) - Number(keys.s)
    direction.x = Number(keys.d) - Number(keys.a)
    direction.normalize()

    if (keys.w || keys.s) velocity.z -= direction.z * MOVE_SPEED * 8.0 * delta
    if (keys.a || keys.d) velocity.x -= direction.x * MOVE_SPEED * 8.0 * delta

    const moveDir = new THREE.Vector3(-velocity.x * delta, 0, -velocity.z * delta)
    
    if (moveDir.length() > 0.001) {
      const worldMoveDir = moveDir.clone()
      worldMoveDir.applyQuaternion(camera.quaternion)
      worldMoveDir.y = 0
      
      if (!checkCollision(worldMoveDir)) {
        controls.moveRight(-velocity.x * delta)
        controls.moveForward(-velocity.z * delta)
      }
    }

    controls.object.position.y = PLAYER_HEIGHT
  }

  updateHotspots()
  updateSnowParticles()
  drawMinimap()
  drawPlayerMarker()

  renderer.render(scene, camera)
}

setTimeout(() => {
  updateLoading(100)
  setTimeout(() => {
    loadingOverlay.classList.add('hidden')
  }, 300)
}, 500)

animate()

console.log('故宫3D第一人称漫游加载完成!')

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as topojson from 'topojson-client'
import './style.css'

class EarthScene {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.earth = null
    this.clock = new THREE.Clock()
    this.textures = {}
    this.textureLoader = new THREE.TextureLoader()
    this.countryMeshes = []
    this.countryData = new Map()
    this.currentDataDimension = 'temperature'
    this.COUNTRY_RADIUS = 2.08
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.hoveredCountry = null
    this.barMeshes = []
    this.countryCenters = new Map()
    this.isInteracting = false
    this.interactionTimeout = null
    this.stars = null
    this.compareCountries = []
    this.waitingForCompare = false
    this.currentYear = 2023
    this.isPlaying = false
    this.playSpeed = 1
    this.lastPlayTime = 0
    this.layers = {
      weather: true,
      earthquake: false,
      wind: false,
      ocean: false,
      nightlight: true
    }
    this.earthquakePoints = []
    this.windParticles = null
    this.oceanArrows = []
    this.weatherPoints = []
    this.atmosphere = null
    this.nightLights = []

    this.initColorSchemes()
    this.init()
    this.loadTextures()
    
    window.addEventListener('load', () => {
      setTimeout(() => this.bindUIEvents(), 500)
    })
  }

  initColorSchemes() {
    this.colorSchemes = {
      temperature: {
        stops: [
          { value: 0.0, color: new THREE.Color(0x0066ff) },
          { value: 0.5, color: new THREE.Color(0xffffff) },
          { value: 1.0, color: new THREE.Color(0xff3300) }
        ]
      },
      population: {
        stops: [
          { value: 0.0, color: new THREE.Color(0x00cc44) },
          { value: 0.5, color: new THREE.Color(0xffdd00) },
          { value: 1.0, color: new THREE.Color(0xcc0000) }
        ]
      },
      carbon: {
        stops: [
          { value: 0.0, color: new THREE.Color(0x00cccc) },
          { value: 0.5, color: new THREE.Color(0x9933ff) },
          { value: 1.0, color: new THREE.Color(0xff8800) }
        ]
      }
    }
  }

  generateCountryData(countryId, countryName) {
    const seed = countryId.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const seededRandom = (min, max) => {
      const x = Math.sin(seed + countryName.length) * 10000
      return min + (x - Math.floor(x)) * (max - min)
    }

    return {
      temperature: seededRandom(-30, 45),
      populationDensity: seededRandom(1, 1500),
      carbonEmission: seededRandom(0.1, 20),
      normalized: {
        temperature: 0,
        populationDensity: 0,
        carbonEmission: 0
      }
    }
  }

  normalizeCountryData() {
    const dimensions = ['temperature', 'populationDensity', 'carbonEmission']
    
    dimensions.forEach(dim => {
      let min = Infinity
      let max = -Infinity
      
      this.countryData.forEach(data => {
        min = Math.min(min, data[dim])
        max = Math.max(max, data[dim])
      })

      const range = max - min || 1
      this.countryData.forEach(data => {
        data.normalized[dim] = (data[dim] - min) / range
      })
    })
  }

  mapValueToColor(normalizedValue, scheme) {
    const stops = this.colorSchemes[scheme].stops
    
    for (let i = 0; i < stops.length - 1; i++) {
      if (normalizedValue >= stops[i].value && normalizedValue <= stops[i + 1].value) {
        const t = (normalizedValue - stops[i].value) / (stops[i + 1].value - stops[i].value)
        return new THREE.Color().lerpColors(stops[i].color, stops[i + 1].color, t)
      }
    }
    
    return normalizedValue < 0.5 ? stops[0].color.clone() : stops[stops.length - 1].color.clone()
  }

  setCountryColor(countryId, dataDimension) {
    const data = this.countryData.get(countryId)
    if (!data) return

    const normalizedKey = dataDimension === 'temperature' ? 'temperature' :
                          dataDimension === 'population' ? 'populationDensity' : 'carbonEmission'
    
    const color = this.mapValueToColor(data.normalized[normalizedKey], dataDimension)

    this.countryMeshes.forEach(mesh => {
      if (!mesh || !mesh.userData || !mesh.material) return
      if (mesh.userData.countryId === countryId && mesh.userData.type === 'country_surface') {
        mesh.material.color.copy(color)
        if (mesh.userData.currentColor) mesh.userData.currentColor.copy(color)
        if (mesh.userData.targetColor) mesh.userData.targetColor.copy(color)
        mesh.userData.colorTransitionProgress = 1.0
      }
    })
  }

  updateAllCountriesColor(dataDimension) {
    this.currentDataDimension = dataDimension
    
    this.countryData.forEach((_, countryId) => {
      this.setCountryColor(countryId, dataDimension)
    })
  }

  loadTextures() {
    const texturePaths = {
      day: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-day.jpg',
      night: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-night.jpg',
      bump: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-topology.png',
      specular: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-water.png'
    }

    this.textures['clouds'] = this.createFallbackTexture('clouds')

    let loadedCount = 0
    const totalTextures = Object.keys(texturePaths).length

    const checkComplete = () => {
      if (loadedCount === totalTextures) {
        this.createEarth()
        this.createClouds()
        this.createAtmosphere()
        this.loadCountryBoundaries()
      }
    }

    Object.entries(texturePaths).forEach(([key, url]) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
          this.textures[key] = texture
          loadedCount++
          checkComplete()
        },
        undefined,
        () => {
          console.log(`纹理 ${key} 加载失败，使用程序化替代`)
          loadedCount++
          this.textures[key] = this.createFallbackTexture(key)
          checkComplete()
        }
      )
    })
  }

  createFallbackTexture(type) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    switch(type) {
      case 'day':
        const dayGradient = ctx.createLinearGradient(0, 0, 0, 512)
        dayGradient.addColorStop(0, '#1a4c7a')
        dayGradient.addColorStop(0.5, '#2d7ab8')
        dayGradient.addColorStop(1, '#1a4c7a')
        ctx.fillStyle = dayGradient
        ctx.fillRect(0, 0, 1024, 512)
        this.drawContinents(ctx, 1024, 512)
        break
      case 'night':
        ctx.fillStyle = '#050510'
        ctx.fillRect(0, 0, 1024, 512)
        this.drawCityLights(ctx, 1024, 512)
        break
      case 'bump':
        ctx.fillStyle = '#808080'
        ctx.fillRect(0, 0, 1024, 512)
        this.drawBumpMap(ctx, 1024, 512)
        break
      case 'specular':
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 1024, 512)
        this.drawSpecularMap(ctx, 1024, 512)
        break
      case 'clouds':
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, 1024, 512)
        this.drawClouds(ctx, 1024, 512)
        break
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }

  drawContinents(ctx, w, h) {
    ctx.fillStyle = '#2d6a4f'
    
    const continents = [
      { x: 0.15, y: 0.3, rx: 0.08, ry: 0.12 },
      { x: 0.22, y: 0.55, rx: 0.06, ry: 0.08 },
      { x: 0.45, y: 0.35, rx: 0.1, ry: 0.08 },
      { x: 0.5, y: 0.55, rx: 0.08, ry: 0.12 },
      { x: 0.7, y: 0.35, rx: 0.12, ry: 0.09 },
      { x: 0.85, y: 0.6, rx: 0.06, ry: 0.06 },
      { x: 0.5, y: 0.85, rx: 0.08, ry: 0.05 }
    ]

    continents.forEach(cont => {
      ctx.beginPath()
      ctx.ellipse(cont.x * w, cont.y * h, cont.rx * w, cont.ry * h, 0, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.fillStyle = '#40916c'
    continents.forEach(cont => {
      ctx.beginPath()
      ctx.ellipse(cont.x * w + 5, cont.y * h - 5, cont.rx * w * 0.7, cont.ry * h * 0.7, 0, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  drawCityLights(ctx, w, h) {
    const cityPositions = [
      [0.18, 0.32], [0.2, 0.35], [0.16, 0.38],
      [0.45, 0.38], [0.48, 0.4], [0.5, 0.38], [0.52, 0.42],
      [0.72, 0.36], [0.75, 0.38], [0.78, 0.36], [0.8, 0.4],
      [0.88, 0.62], [0.86, 0.58],
      [0.52, 0.6], [0.55, 0.62], [0.48, 0.58],
      [0.22, 0.58], [0.24, 0.56]
    ]

    cityPositions.forEach(([x, y]) => {
      const gradient = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, 15)
      gradient.addColorStop(0, 'rgba(255, 230, 150, 1)')
      gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.6)')
      gradient.addColorStop(1, 'rgba(255, 150, 50, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x * w, y * h, 15, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  drawBumpMap(ctx, w, h) {
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const brightness = 128 + (Math.random() - 0.5) * 80
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * 5 + 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawSpecularMap(ctx, w, h) {
    ctx.fillStyle = '#000000'
    this.drawContinents(ctx, w, h)
  }

  drawClouds(ctx, w, h) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      ctx.beginPath()
      ctx.ellipse(x, y, Math.random() * 40 + 20, Math.random() * 20 + 10, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0x404050, 0.2)
    this.scene.add(ambientLight)

    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.0)
    this.sunLight.position.set(5, 2, 5)
    this.sunLight.castShadow = true
    this.sunLight.shadow.mapSize.width = 2048
    this.sunLight.shadow.mapSize.height = 2048
    this.scene.add(this.sunLight)

    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4)
    rimLight.position.set(-5, 0, -5)
    this.scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0xffddaa, 0.2)
    fillLight.position.set(-3, 2, 3)
    this.scene.add(fillLight)
  }

  createEarth() {
    const earthGeometry = new THREE.SphereGeometry(2, 128, 128)
    
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: this.textures.day,
      bumpMap: this.textures.bump,
      bumpScale: 0.05,
      roughnessMap: this.textures.specular,
      roughness: 0.8,
      metalnessMap: this.textures.specular,
      metalness: 0.1,
      emissiveMap: this.textures.night,
      emissive: 0x080810,
      emissiveIntensity: 1.5,
      flatShading: false
    })

    earthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.sunDirection = { value: this.sunLight.position.clone().normalize() }
      shader.uniforms.nightIntensity = { value: 1.5 }

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPosition;`
      )

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        uniform vec3 sunDirection;
        uniform float nightIntensity;
        varying vec3 vWorldPosition;`
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#ifdef USE_EMISSIVEMAP
          vec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUv);
          float sunDot = dot(normalize(vNormal), sunDirection);
          float nightMask = smoothstep(0.3, -0.1, sunDot);
          emissiveColor.rgb *= nightMask * nightIntensity;
          totalEmissiveRadiance = emissiveColor.rgb;
        #endif`
      )
    }

    this.earth = new THREE.Mesh(earthGeometry, earthMaterial)
    this.scene.add(this.earth)
  }

  createClouds() {
    const cloudsGeometry = new THREE.SphereGeometry(2.02, 64, 64)
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: this.textures.clouds,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
    this.scene.add(this.clouds)
  }

  createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x44aaff) },
        viewVector: { value: this.camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    })

    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    this.scene.add(this.atmosphere)

    const innerAtmosphereGeometry = new THREE.SphereGeometry(2.05, 64, 64)
    const innerAtmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.08,
      side: THREE.FrontSide
    })
    const innerAtmosphere = new THREE.Mesh(innerAtmosphereGeometry, innerAtmosphereMaterial)
    this.scene.add(innerAtmosphere)
  }

  latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    return new THREE.Vector3(x, y, z)
  }

  async loadCountryBoundaries() {
    try {
      const sampleCountries = [
        { id: 'USA', name: 'United States', lat: 37.0902, lng: -95.7129 },
        { id: 'CHN', name: 'China', lat: 35.8617, lng: 104.1954 },
        { id: 'RUS', name: 'Russia', lat: 61.5240, lng: 105.3188 },
        { id: 'BRA', name: 'Brazil', lat: -14.2350, lng: -51.9253 },
        { id: 'AUS', name: 'Australia', lat: -25.2744, lng: 133.7751 },
        { id: 'IND', name: 'India', lat: 20.5937, lng: 78.9629 },
        { id: 'ARG', name: 'Argentina', lat: -38.4161, lng: -63.6167 },
        { id: 'CAN', name: 'Canada', lat: 56.1304, lng: -106.3468 },
        { id: 'FRA', name: 'France', lat: 46.2276, lng: 2.2137 },
        { id: 'DEU', name: 'Germany', lat: 51.1657, lng: 10.4515 },
        { id: 'GBR', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
        { id: 'JPN', name: 'Japan', lat: 36.2048, lng: 138.2529 }
      ]

      sampleCountries.forEach(country => {
        const countryId = country.id
        const countryName = country.name
        
        this.countryData.set(countryId, this.generateCountryData(countryId, countryName))
        
        const center = this.latLngToVector3(country.lat, country.lng, this.COUNTRY_RADIUS)
        this.createCountrySpot(center, countryName, countryId)
      })

      this.normalizeCountryData()
      this.updateAllCountriesColor(this.currentDataDimension)

      this.countryData.forEach((data, countryId) => {
        const country = sampleCountries.find(c => c.id === countryId)
        if (country && data.normalized && data.normalized.carbonEmission !== undefined) {
          const center = this.latLngToVector3(country.lat, country.lng, this.COUNTRY_RADIUS)
          this.createCarbonBar(countryId, center, data.normalized.carbonEmission)
        }
      })

      this.createStars()
      this.generateTimeSeriesData()
      this.loadEarthquakeData()
      this.createWindParticles()
      this.createOceanCurrents()
      this.createWeatherPoints()
      this.createNightLights()

      console.log(`成功加载 ${this.countryData.size} 个国家数据`)
    } catch (error) {
      console.error('加载国家边界数据失败:', error)
    }
  }

  showCountryData(countryId) {
    const data = this.countryData.get(countryId)
    if (!data) return

    this.selectedCountry = countryId

    const countryNames = {
      'USA': '美国', 'CHN': '中国', 'RUS': '俄罗斯', 'JPN': '日本', 'DEU': '德国',
      'FRA': '法国', 'GBR': '英国', 'BRA': '巴西', 'IND': '印度', 'AUS': '澳大利亚',
      'CAN': '加拿大', 'MEX': '墨西哥'
    }

    const panel = document.getElementById('data-panel')
    document.getElementById('panel-country-name').textContent = countryNames[countryId] || countryId
    document.getElementById('panel-temperature').textContent = data.temperature.toFixed(1) + ' °C'
    document.getElementById('panel-population').textContent = Math.round(data.populationDensity) + ' 人/km²'
    document.getElementById('panel-carbon').textContent = data.carbonEmission.toFixed(2) + ' 亿吨'
    
    panel.classList.add('visible')
  }

  createCountrySpot(center, countryName, countryId) {
    const geometry = new THREE.CircleGeometry(0.08, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    })

    const spot = new THREE.Mesh(geometry, material)
    
    const direction = center.clone().normalize()
    const up = new THREE.Vector3(0, 0, 1)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)
    spot.quaternion.copy(quaternion)
    spot.position.copy(direction.multiplyScalar(this.COUNTRY_RADIUS))

    spot.userData = {
      countryId: countryId,
      countryName: countryName,
      type: 'country_surface',
      currentColor: new THREE.Color(0xffffff),
      targetColor: new THREE.Color(0xffffff),
      colorTransitionProgress: 1.0
    }

    this.earth.add(spot)
    this.countryMeshes.push(spot)
  }

  createCountryMesh(feature) {
    const { geometry, properties, id } = feature
    const countryName = properties?.name || 'Unknown'

    if (!geometry || !geometry.coordinates) return

    if (geometry.type === 'Polygon') {
      this.createPolygonMesh(geometry.coordinates, countryName, id)
    } else if (geometry.type === 'MultiPolygon') {
      if (Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach(polygonCoords => {
          this.createPolygonMesh(polygonCoords, countryName, id)
        })
      }
    }
  }

  createPolygonMesh(coordinates, countryName, countryId) {
    if (!Array.isArray(coordinates)) return
    
    coordinates.forEach(ringCoords => {
      if (!Array.isArray(ringCoords) || ringCoords.length < 3) return

      const points = ringCoords.map(coord => {
        if (!Array.isArray(coord) || coord.length < 2) return null
        const [lng, lat] = coord
        return this.latLngToVector3(lat, lng, this.COUNTRY_RADIUS)
      }).filter(p => p !== null)

      if (points.length >= 3) {
        this.createCountryLineMesh(points, countryName, countryId)
        this.createCountrySurfaceMesh(points, countryName, countryId)
      }
    })
  }

  createCountryLineMesh(points, countryName, countryId) {
    if (!Array.isArray(points) || points.length < 2) return
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0xffdd00,
      transparent: true,
      opacity: 0.6
    })

    const line = new THREE.Line(geometry, material)
    line.userData = {
      countryId: countryId,
      countryName: countryName,
      type: 'country_boundary'
    }

    this.scene.add(line)
    this.countryMeshes.push(line)
  }

  createCountrySurfaceMesh(points, countryName, countryId) {
    if (points.length < 3) return

    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const indices = []

    points.forEach(point => {
      const normalized = point.clone().normalize()
      const spherePoint = normalized.multiplyScalar(this.COUNTRY_RADIUS)
      vertices.push(spherePoint.x, spherePoint.y, spherePoint.z)
    })

    for (let i = 1; i < points.length - 1; i++) {
      indices.push(0, i, i + 1)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = {
      countryId: countryId,
      countryName: countryName,
      type: 'country_surface',
      currentColor: new THREE.Color(0xffffff),
      targetColor: new THREE.Color(0xffffff),
      colorTransitionProgress: 1.0
    }

    this.scene.add(mesh)
    this.countryMeshes.push(mesh)
  }

  setCountryColorAnimated(countryId, dataDimension, transitionSpeed = 0.02) {
    const data = this.countryData.get(countryId)
    if (!data) return

    const normalizedKey = dataDimension === 'temperature' ? 'temperature' :
                          dataDimension === 'population' ? 'populationDensity' : 'carbonEmission'
    
    const targetColor = this.mapValueToColor(data.normalized[normalizedKey], dataDimension)

    this.countryMeshes.forEach(mesh => {
      if (mesh.userData.countryId === countryId && mesh.userData.type === 'country_surface') {
        mesh.userData.currentColor.copy(mesh.material.color)
        mesh.userData.targetColor.copy(targetColor)
        mesh.userData.colorTransitionProgress = 0.0
        mesh.userData.transitionSpeed = transitionSpeed
      }
    })
  }

  updateAllCountriesColorAnimated(dataDimension, transitionSpeed = 0.02) {
    this.currentDataDimension = dataDimension
    
    this.countryData.forEach((_, countryId) => {
      this.setCountryColorAnimated(countryId, dataDimension, transitionSpeed)
    })

    if (dataDimension === 'carbon') {
      this.showCarbonBarsAnimated()
    } else {
      this.hideCarbonBarsAnimated()
    }
  }

  createStars() {
    const starsGeometry = new THREE.BufferGeometry()
    const starCount = 5000
    const positions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const radius = 50 + Math.random() * 50
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    this.stars = new THREE.Points(starsGeometry, starsMaterial)
    this.scene.add(this.stars)
  }

  createCarbonBar(countryId, centerPoint, height) {
    const maxHeight = 0.8
    const barHeight = height * maxHeight
    const barRadius = 0.03
    
    const geometry = new THREE.CylinderGeometry(barRadius, barRadius * 1.2, barHeight, 8)
    geometry.translate(0, barHeight / 2, 0)
    
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().lerpColors(
        new THREE.Color(0x00cccc),
        new THREE.Color(0xff8800),
        height
      ),
      transparent: true,
      opacity: 0.9
    })

    const bar = new THREE.Mesh(geometry, material)
    
    const direction = centerPoint.clone().normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)
    bar.quaternion.copy(quaternion)
    bar.position.copy(direction.multiplyScalar(2.05))

    bar.userData = {
      countryId: countryId,
      targetScale: barHeight,
      type: 'carbon_bar',
      targetOpacity: 0.9
    }
    
    bar.scale.y = 0.01
    bar.material.opacity = 0

    this.barMeshes.push(bar)
    this.earth.add(bar)
  }

  showCarbonBarsAnimated() {
    this.barMeshes.forEach(bar => {
      bar.userData.scaleAnimating = true
      bar.userData.scaleSpeed = 0.02
    })
  }

  hideCarbonBarsAnimated() {
    this.barMeshes.forEach(bar => {
      bar.userData.scaleAnimating = true
      bar.userData.scaleSpeed = -0.03
      bar.userData.hiding = true
    })
  }

  performRaycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    const intersects = this.raycaster.intersectObjects(
      this.countryMeshes.filter(m => m.userData.type === 'country_surface')
    )

    if (this.hoveredCountry) {
      this.countryMeshes.forEach(mesh => {
        if (mesh && mesh.material && mesh.userData.countryId === this.hoveredCountry && mesh.userData.type === 'country_surface') {
          mesh.material.opacity = 0.7
          mesh.material.color.setHex(0xffffff)
        }
      })
      this.hoveredCountry = null
    }

    if (intersects.length > 0) {
      const mesh = intersects[0].object
      const countryId = mesh.userData.countryId
      
      this.countryMeshes.forEach(m => {
        if (m && m.material && m.userData.countryId === countryId && m.userData.type === 'country_surface') {
          m.material.opacity = 1.0
          m.material.color.setHex(0x00ddff)
        }
      })
      
      this.hoveredCountry = countryId
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.cursor = 'default'
    }
  }

  showCountryData(countryId) {
    const data = this.countryData.get(countryId)
    if (!data) return

    const countryNames = {
      'USA': '美国', 'CHN': '中国', 'RUS': '俄罗斯', 'JPN': '日本', 'DEU': '德国',
      'FRA': '法国', 'GBR': '英国', 'BRA': '巴西', 'IND': '印度', 'AUS': '澳大利亚',
      'CAN': '加拿大', 'MEX': '墨西哥', 'ESP': '西班牙', 'ITA': '意大利', 'SAU': '沙特阿拉伯',
      'ZAF': '南非', 'NGA': '尼日利亚', 'ARG': '阿根廷', 'EGY': '埃及', 'TUR': '土耳其',
      'KOR': '韩国', 'IDN': '印度尼西亚', 'IRN': '伊朗', 'IRQ': '伊拉克', 'AFG': '阿富汗',
      'PAK': '巴基斯坦', 'BGD': '孟加拉国', 'VNM': '越南', 'THA': '泰国', 'MYA': '缅甸'
    }

    const panel = document.getElementById('data-panel')
    document.getElementById('panel-country-name').textContent = countryNames[countryId] || countryId
    document.getElementById('panel-temperature').textContent = data.temperature.toFixed(1) + ' °C'
    document.getElementById('panel-population').textContent = Math.round(data.populationDensity) + ' 人/km²'
    document.getElementById('panel-carbon').textContent = data.carbonEmission.toFixed(2) + ' 亿吨'
    
    panel.classList.add('visible')
  }

  hideCountryData() {
    const panel = document.getElementById('data-panel')
    panel.classList.remove('visible')
  }

  createNightLights() {
    const cities = [
      { lat: 40.7, lng: -74.0, size: 1.5 },
      { lat: 34.1, lng: -118.2, size: 1.3 },
      { lat: 41.9, lng: -87.6, size: 1.0 },
      { lat: 51.5, lng: -0.1, size: 1.2 },
      { lat: 48.9, lng: 2.3, size: 1.1 },
      { lat: 52.5, lng: 13.4, size: 1.0 },
      { lat: 39.9, lng: 116.4, size: 1.5 },
      { lat: 31.2, lng: 121.5, size: 1.6 },
      { lat: 22.3, lng: 114.2, size: 1.2 },
      { lat: 35.7, lng: 139.7, size: 1.5 },
      { lat: 37.6, lng: 127.0, size: 1.1 },
      { lat: 1.3, lng: 103.8, size: 1.0 },
      { lat: 28.6, lng: 77.2, size: 1.2 },
      { lat: 19.1, lng: 72.9, size: 1.1 },
      { lat: -23.6, lng: -46.6, size: 1.2 },
      { lat: -33.9, lng: 151.2, size: 1.0 },
      { lat: 30.1, lng: 31.2, size: 0.9 },
      { lat: 25.2, lng: 55.3, size: 1.1 }
    ]
    
    cities.forEach(city => {
      const center = this.latLngToVector3(city.lat, city.lng, 2.01)
      
      const geometry = new THREE.SphereGeometry(0.015 * city.size, 8, 8)
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffaa,
        transparent: true,
        opacity: 0.9
      })
      
      const light = new THREE.Mesh(geometry, material)
      light.position.copy(center)
      
      const glowGeometry = new THREE.SphereGeometry(0.04 * city.size, 8, 8)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        transparent: true,
        opacity: 0.2
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(center)
      
      this.earth.add(light)
      this.earth.add(glow)
      this.nightLights.push(light, glow)
      
      light.visible = this.layers.nightlight
      glow.visible = this.layers.nightlight
    })
  }

  setupEventListeners() {
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      
      this.isInteracting = true
      clearTimeout(this.interactionTimeout)
      this.interactionTimeout = setTimeout(() => {
        this.isInteracting = false
      }, 2000)
    })

    this.renderer.domElement.addEventListener('click', () => {
      if (this.hoveredCountry) {
        if (this.waitingForCompare) {
          this.addToCompare(this.hoveredCountry)
          this.waitingForCompare = false
          document.getElementById('panel-compare').textContent = '➕ 对比'
          alert('添加成功！可继续添加或点击关闭')
        } else {
          this.showCountryData(this.hoveredCountry)
        }
      }
    })
  }

  bindUIEvents() {
    document.getElementById('panel-close').addEventListener('click', () => {
      this.hideCountryData()
      this.waitingForCompare = false
      document.getElementById('panel-compare').textContent = '➕ 对比'
    })

    document.getElementById('panel-compare').addEventListener('click', () => {
      if (this.selectedCountry) {
        if (this.compareCountries.length >= 4) {
          alert('最多支持4个国家对比，请先移除！')
          return
        }
        if (!this.compareCountries.includes(this.selectedCountry)) {
          this.addToCompare(this.selectedCountry)
          alert('已添加当前国家，请点击下一个国家继续添加！')
        }
        this.waitingForCompare = true
        document.getElementById('panel-compare').textContent = '👆 选择下一国'
      }
    })

    document.querySelectorAll('.control-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'))
        this.classList.add('active')
        
        const dimension = this.dataset.dimension
        window.earthScene.updateAllCountriesColorAnimated(dimension, 0.015)
        window.earthScene.updateLegend(dimension)
      })
    })

    document.getElementById('layer-weather').addEventListener('change', (e) => {
      this.toggleLayer('weather', e.target.checked)
    })

    document.getElementById('layer-earthquake').addEventListener('change', (e) => {
      this.toggleLayer('earthquake', e.target.checked)
    })

    document.getElementById('layer-wind').addEventListener('change', (e) => {
      this.toggleLayer('wind', e.target.checked)
    })

    document.getElementById('layer-ocean').addEventListener('change', (e) => {
      this.toggleLayer('ocean', e.target.checked)
    })

    document.getElementById('layer-nightlight').addEventListener('change', (e) => {
      this.toggleLayer('nightlight', e.target.checked)
    })

    document.getElementById('play-btn').addEventListener('click', () => {
      this.isPlaying = !this.isPlaying
      document.getElementById('play-btn').textContent = this.isPlaying ? '⏸️' : '▶️'
    })

    document.getElementById('timeline-slider').addEventListener('input', (e) => {
      this.updateYearData(parseInt(e.target.value))
    })

    document.getElementById('speed-select').addEventListener('change', (e) => {
      this.playSpeed = parseFloat(e.target.value)
    })
  }

  async loadEarthquakeData() {
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
      const data = await response.json()
      
      data.features.forEach(feature => {
        const mag = feature.properties.mag
        if (mag < 2.5) return
        
        const [lng, lat] = feature.geometry.coordinates
        const center = this.latLngToVector3(lat, lng, 2.1 + mag * 0.02)
        
        const geometry = new THREE.SphereGeometry(0.02 + mag * 0.015, 16, 16)
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().lerpColors(
            new THREE.Color(0x00ff00),
            new THREE.Color(0xff0000),
            Math.min(mag / 8, 1)
          ),
          transparent: true,
          opacity: 0.8
        })
        
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.copy(center)
        sphere.userData = {
          type: 'earthquake',
          magnitude: mag,
          place: feature.properties.place,
          time: feature.properties.time,
          baseOpacity: 0.8,
          pulsePhase: Math.random() * Math.PI * 2
        }
        
        this.earth.add(sphere)
        this.earthquakePoints.push(sphere)
        sphere.visible = this.layers.earthquake
      })
      
      console.log(`成功加载 ${this.earthquakePoints.length} 个地震数据`)
    } catch (e) {
      console.log('地震数据加载失败，使用模拟数据')
      this.generateMockEarthquakeData()
    }
  }

  generateMockEarthquakeData() {
    const earthquakeLocations = [
      { lat: 35.68, lng: 139.68 }, { lat: -33.86, lng: 151.21 },
      { lat: 37.77, lng: -122.42 }, { lat: 34.05, lng: -118.24 },
      { lat: 19.43, lng: -99.13 }, { lat: -33.45, lng: -70.67 },
      { lat: 41.01, lng: 28.98 }, { lat: 27.72, lng: 85.32 },
      { lat: 3.14, lng: 101.69 }, { lat: 51.51, lng: -0.13 }
    ]
    
    earthquakeLocations.forEach(loc => {
      const mag = 2.5 + Math.random() * 5
      const center = this.latLngToVector3(loc.lat, loc.lng, 2.1 + mag * 0.02)
      
      const geometry = new THREE.SphereGeometry(0.02 + mag * 0.015, 16, 16)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().lerpColors(
          new THREE.Color(0x00ff00),
          new THREE.Color(0xff0000),
          Math.min(mag / 8, 1)
        ),
        transparent: true,
        opacity: 0.8
      })
      
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.copy(center)
      sphere.userData = {
        type: 'earthquake',
        magnitude: mag,
        baseOpacity: 0.8,
        pulsePhase: Math.random() * Math.PI * 2
      }
      
      this.earth.add(sphere)
      this.earthquakePoints.push(sphere)
      sphere.visible = this.layers.earthquake
    })
  }

  createWindParticles() {
    const particleCount = 5000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const lat = (Math.random() - 0.5) * 170
      const lng = (Math.random() - 0.5) * 360
      const pos = this.latLngToVector3(lat, lng, 2.15)
      
      positions[i3] = pos.x
      positions[i3 + 1] = pos.y
      positions[i3 + 2] = pos.z
      
      const windSpeed = 0.5 + Math.random() * 0.5
      const angle = Math.random() * Math.PI * 2
      velocities[i3] = Math.cos(angle) * windSpeed
      velocities[i3 + 1] = (Math.random() - 0.5) * windSpeed * 0.5
      velocities[i3 + 2] = Math.sin(angle) * windSpeed
      
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0x0088ff),
        new THREE.Color(0x00ff88),
        windSpeed - 0.5
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    this.windParticles = new THREE.Points(geometry, material)
    this.windParticles.userData = { type: 'wind', particleCount }
    this.earth.add(this.windParticles)
    this.windParticles.visible = this.layers.wind
  }

  createOceanCurrents() {
    const currents = [
      { name: '湾流', lat: 35, lng: -45, dirLat: 10, dirLng: 30, speed: 0.8 },
      { name: '北大西洋暖流', lat: 50, lng: -20, dirLat: 5, dirLng: 35, speed: 0.7 },
      { name: '北太平洋暖流', lat: 35, lng: 160, dirLat: 5, dirLng: -50, speed: 0.7 },
      { name: '黑潮', lat: 25, lng: 145, dirLat: 20, dirLng: -30, speed: 0.8 },
      { name: '秘鲁寒流', lat: -15, lng: -85, dirLat: -30, dirLng: 5, speed: 0.6 },
      { name: '本格拉寒流', lat: -20, lng: 10, dirLat: -15, dirLng: -5, speed: 0.6 },
      { name: '西风漂流', lat: -40, lng: 0, dirLat: 0, dirLng: 60, speed: 0.5 },
      { name: '南极环流', lat: -55, lng: 90, dirLat: 0, dirLng: 60, speed: 0.4 }
    ]
    
    currents.forEach(current => {
      for (let i = 0; i < 3; i++) {
        const offsetLat = (Math.random() - 0.5) * 10
        const offsetLng = (Math.random() - 0.5) * 20
        const center = this.latLngToVector3(
          current.lat + offsetLat,
          current.lng + offsetLng,
          2.12
        )
        
        const dir = this.latLngToVector3(
          current.lat + current.dirLat * 0.1,
          current.lng + current.dirLng * 0.1,
          2.12
        ).sub(center).normalize()
        
        const arrowGeom = new THREE.ConeGeometry(0.02, 0.08, 8)
        arrowGeom.translate(0, 0.04, 0)
        arrowGeom.rotateX(Math.PI / 2)
        
        const arrowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().lerpColors(
            new THREE.Color(0x00aaff),
            new THREE.Color(0xffaa00),
            current.speed - 0.4
          ),
          transparent: true,
          opacity: 0.8
        })
        
        const arrow = new THREE.Mesh(arrowGeom, arrowMat)
        const up = new THREE.Vector3(0, 1, 0)
        arrow.quaternion.setFromUnitVectors(up, dir)
        arrow.position.copy(center)
        arrow.userData = {
          type: 'ocean',
          currentName: current.name,
          basePosition: center.clone(),
          direction: dir,
          speed: current.speed,
          phase: Math.random() * Math.PI * 2
        }
        
        this.earth.add(arrow)
        this.oceanArrows.push(arrow)
        arrow.visible = this.layers.ocean
      }
    })
  }

  generateTimeSeriesData() {
    this.countryData.forEach((data, countryId) => {
      data.timeSeries = {}
      for (let year = 1990; year <= 2025; year++) {
        const progress = (year - 1990) / 35
        data.timeSeries[year] = {
          temperature: data.temperature + progress * (2 + Math.sin(year * 0.5) * 0.5),
          populationDensity: data.populationDensity * (1 + progress * 0.5),
          carbonEmission: data.carbonEmission * (1 + progress * 0.8)
        }
      }
    })
  }

  updateYearData(year) {
    this.currentYear = year
    document.getElementById('year-display').textContent = year
    
    this.countryData.forEach((data, countryId) => {
      const yearData = data.timeSeries[year]
      if (yearData) {
        data.temperature = yearData.temperature
        data.populationDensity = yearData.populationDensity
        data.carbonEmission = yearData.carbonEmission
      }
    })
    
    this.normalizeCountryData()
    this.updateAllCountriesColor(this.currentDataDimension)
  }

  addToCompare(countryId) {
    if (this.compareCountries.length >= 4) {
      alert('最多支持4个国家进行对比！')
      return
    }
    if (this.compareCountries.includes(countryId)) return
    
    this.compareCountries.push(countryId)
    this.updateComparePanel()
  }

  removeFromCompare(countryId) {
    this.compareCountries = this.compareCountries.filter(id => id !== countryId)
    this.updateComparePanel()
  }

  updateComparePanel() {
    const section = document.getElementById('compare-section')
    const list = document.getElementById('compare-list')
    
    if (this.compareCountries.length > 0) {
      section.classList.add('visible')
      list.innerHTML = this.compareCountries.map(countryId => {
        const data = this.countryData.get(countryId)
        const countryNames = {
          'USA': '美国', 'CHN': '中国', 'RUS': '俄罗斯', 'JPN': '日本',
          'DEU': '德国', 'FRA': '法国', 'GBR': '英国', 'BRA': '巴西',
          'IND': '印度', 'AUS': '澳大利亚', 'CAN': '加拿大'
        }
        return `
          <div class="compare-item">
            <span class="compare-name">${countryNames[countryId] || countryId}</span>
            <button class="compare-remove" onclick="window.earthScene.removeFromCompare('${countryId}')">移除</button>
          </div>
        `
      }).join('')
    } else {
      section.classList.remove('visible')
    }
  }

  createWeatherPoints() {
    const majorCities = [
      { name: '北京', lat: 39.9, lng: 116.4, temp: 18 },
      { name: '上海', lat: 31.2, lng: 121.5, temp: 22 },
      { name: '东京', lat: 35.7, lng: 139.7, temp: 20 },
      { name: '纽约', lat: 40.7, lng: -74.0, temp: 15 },
      { name: '伦敦', lat: 51.5, lng: -0.1, temp: 12 },
      { name: '巴黎', lat: 48.9, lng: 2.3, temp: 14 },
      { name: '悉尼', lat: -33.9, lng: 151.2, temp: 18 },
      { name: '莫斯科', lat: 55.8, lng: 37.6, temp: 8 },
      { name: '迪拜', lat: 25.2, lng: 55.3, temp: 35 },
      { name: '新加坡', lat: 1.4, lng: 103.8, temp: 30 },
      { name: '孟买', lat: 19.1, lng: 72.9, temp: 28 },
      { name: '开罗', lat: 30.0, lng: 31.2, temp: 25 }
    ]
    
    majorCities.forEach(city => {
      const center = this.latLngToVector3(city.lat, city.lng, 2.12)
      
      const geometry = new THREE.SphereGeometry(0.03, 8, 8)
      const tempNormalized = (city.temp + 10) / 50
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().lerpColors(
          new THREE.Color(0x0088ff),
          new THREE.Color(0xff4400),
          tempNormalized
        ),
        transparent: true,
        opacity: 0.8
      })
      
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.copy(center)
      sphere.userData = {
        type: 'weather',
        cityName: city.name,
        temperature: city.temp,
        baseOpacity: 0.8
      }
      
      this.earth.add(sphere)
      this.weatherPoints.push(sphere)
      sphere.visible = this.layers.weather
    })
  }

  toggleLayer(layerName, enabled) {
    this.layers[layerName] = enabled
    
    if (layerName === 'weather') {
      this.weatherPoints.forEach(p => p.visible = enabled)
    } else if (layerName === 'earthquake') {
      this.earthquakePoints.forEach(p => p.visible = enabled)
    } else if (layerName === 'wind') {
      if (this.windParticles) this.windParticles.visible = enabled
    } else if (layerName === 'ocean') {
      this.oceanArrows.forEach(a => a.visible = enabled)
    } else if (layerName === 'nightlight') {
      this.nightLights.forEach(light => {
        light.visible = enabled
      })
      if (this.atmosphere) {
        this.atmosphere.material.opacity = enabled ? 0.35 : 0.15
      }
    }
  }

  updateLegend(dimension) {
    const gradientEl = document.getElementById('legend-gradient')
    gradientEl.className = 'legend-gradient ' + dimension
    
    const titles = {
      temperature: '平均气温',
      population: '人口密度',
      carbon: '碳排放量'
    }
    const units = {
      temperature: '°C',
      population: '人/km²',
      carbon: '亿吨'
    }
    
    document.getElementById('legend-title').textContent = titles[dimension]
    document.getElementById('legend-unit').textContent = '单位: ' + units[dimension]
  }

  init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000510)

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 6)

    const canvas = document.getElementById('three-canvas')
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    this.createLights()
    this.createControls()
    this.animate()
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 3
    this.controls.maxDistance = 15
    this.controls.minPolarAngle = 0.1
    this.controls.maxPolarAngle = Math.PI - 0.1
    this.controls.rotateSpeed = 0.8
    this.controls.zoomSpeed = 0.6
    this.controls.enablePan = false
    this.controls.autoRotate = false

    this.addEventListeners()
    this.setupEventListeners()
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const delta = this.clock.getDelta()
    const time = this.clock.getElapsedTime()
    const rotationSpeed = this.isInteracting ? 0 : 0.0008
    
    if (this.earth) {
      this.earth.rotation.y += rotationSpeed
    }

    if (this.clouds) {
      this.clouds.rotation.y += rotationSpeed * 1.2
    }

    if (this.stars) {
      this.stars.rotation.y += rotationSpeed * 0.2
    }

    this.countryMeshes.forEach(mesh => {
      if (!mesh || !mesh.userData) return

      if (mesh.userData.type === 'country_surface' && mesh.userData.colorTransitionProgress < 1.0) {
        const progress = mesh.userData.colorTransitionProgress || 0
        const speed = mesh.userData.transitionSpeed || 0.02
        
        mesh.userData.colorTransitionProgress = Math.min(1.0, progress + speed)
        
        if (mesh.material && mesh.material.color && mesh.userData.currentColor && mesh.userData.targetColor) {
          const t = mesh.userData.colorTransitionProgress
          mesh.material.color.lerpColors(
            mesh.userData.currentColor,
            mesh.userData.targetColor,
            t
          )
        }
      }
    })

    this.barMeshes.forEach(bar => {
      if (bar.userData.scaleAnimating) {
        bar.scale.y += bar.userData.scaleSpeed
        
        if (bar.userData.hiding) {
          bar.material.opacity = Math.max(0, bar.material.opacity - 0.05)
          
          if (bar.scale.y <= 0.01) {
            bar.scale.y = 0.01
            bar.userData.scaleAnimating = false
            bar.userData.hiding = false
          }
        } else {
          bar.material.opacity = Math.min(bar.userData.targetOpacity, bar.material.opacity + 0.05)
          
          if (bar.scale.y >= bar.userData.targetScale) {
            bar.scale.y = bar.userData.targetScale
            bar.userData.scaleAnimating = false
          }
        }
      }
      
      bar.rotation.y += rotationSpeed
    })

    this.earthquakePoints.forEach(point => {
      if (!point.visible) return
      const pulse = Math.sin(time * 3 + point.userData.pulsePhase) * 0.3 + 0.7
      point.material.opacity = point.userData.baseOpacity * pulse
      point.scale.setScalar(0.9 + pulse * 0.2)
    })

    this.weatherPoints.forEach(point => {
      if (!point.visible) return
      const pulse = Math.sin(time * 2 + point.userData.temperature * 0.1) * 0.2 + 0.8
      point.material.opacity = point.userData.baseOpacity * pulse
    })

    this.nightLights.forEach((light, index) => {
      if (!light.visible) return
      if (index % 2 === 0) {
        const flicker = 0.8 + Math.sin(time * 3 + index * 0.5) * 0.2
        light.material.opacity = 0.9 * flicker
      }
    })

    if (this.windParticles && this.windParticles.visible) {
      const positions = this.windParticles.geometry.attributes.position.array
      const velocities = this.windParticles.geometry.attributes.velocity.array
      
      for (let i = 0; i < this.windParticles.userData.particleCount; i++) {
        const i3 = i * 3
        
        const lat = Math.atan2(positions[i3 + 1], Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2))
        const lng = Math.atan2(positions[i3 + 2], positions[i3])
        
        const noise = Math.sin(lat * 3 + time * 0.5) * Math.cos(lng * 2 + time * 0.3) * 0.0003
        
        positions[i3] += velocities[i3] * 0.002 + Math.cos(lng) * noise
        positions[i3 + 1] += velocities[i3 + 1] * 0.002 + noise * 0.5
        positions[i3 + 2] += velocities[i3 + 2] * 0.002 + Math.sin(lng) * noise
        
        const dist = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2)
        if (dist > 2.4 || dist < 2.1) {
          const newLat = (Math.random() - 0.5) * 170
          const newLng = (Math.random() - 0.5) * 360
          const newPos = this.latLngToVector3(newLat, newLng, 2.15)
          positions[i3] = newPos.x
          positions[i3 + 1] = newPos.y
          positions[i3 + 2] = newPos.z
        }
      }
      
      this.windParticles.geometry.attributes.position.needsUpdate = true
    }

    this.oceanArrows.forEach(arrow => {
      if (!arrow.visible) return
      arrow.position.copy(
        arrow.userData.basePosition.clone().add(
          arrow.userData.direction.clone().multiplyScalar(
            Math.sin(time * arrow.userData.speed + arrow.userData.phase) * 0.02
          )
        )
      )
      arrow.material.opacity = 0.5 + Math.sin(time * 2 + arrow.userData.phase) * 0.3
    })

    if (this.isPlaying) {
      if (time - this.lastPlayTime > 0.5 / this.playSpeed) {
        this.lastPlayTime = time
        let nextYear = this.currentYear + 1
        if (nextYear > 2025) nextYear = 1990
        
        document.getElementById('timeline-slider').value = nextYear
        this.updateYearData(nextYear)
      }
    }

    this.performRaycast()
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}

window.earthScene = new EarthScene()

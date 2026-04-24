import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneBuilder } from '@/components/three/SceneBuilder'
import { CameraControls } from '@/components/three/CameraControls'
import { FirstPersonControls, FirstPersonUI } from '@/components/three/FirstPersonControls'
import { PerformanceDisplay } from '@/components/three/PerformanceMonitor'
import { useAppStore } from '@/store'
import { ComponentInfo, EnvironmentType, CameraMode } from '@/types'

function ComponentInfoPanel({ info }: { info: ComponentInfo | null }) {
  if (!info) {
    return (
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg w-64">
        <h3 className="text-lg font-bold mb-2 border-b border-gray-600 pb-2">组件信息</h3>
        <p className="text-gray-400 text-sm">点击场景中的组件查看详细信息</p>
      </div>
    )
  }

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg w-64">
      <h3 className="text-lg font-bold mb-2 border-b border-gray-600 pb-2">{info.name}</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">分类：</span>
          <span className="text-yellow-400 ml-1">{info.category}</span>
        </div>
        <div>
          <span className="text-gray-400">描述：</span>
          <p className="text-gray-300 mt-1">{info.description}</p>
        </div>
        {info.metadata && Object.keys(info.metadata).length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-600">
            <span className="text-gray-400">元数据：</span>
            <div className="mt-1 space-y-1">
              {Object.entries(info.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-green-400">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingOverlay({ progress }: { progress: number }) {
  if (progress >= 100) return null
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <h3 className="text-white text-xl mb-2">加载中...</h3>
        <div className="w-64 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}

function ControlPanel() {
  const showStats = useAppStore((state) => state.showStats)
  const setShowStats = useAppStore((state) => state.setShowStats)
  const setEnvironment = useAppStore((state) => state.setEnvironment)
  const setLightingConfig = useAppStore((state) => state.setLightingConfig)
  const setCameraMode = useAppStore((state) => state.setCameraMode)
  const sceneConfig = useAppStore((state) => state.sceneConfig)
  const lightingConfig = useAppStore((state) => state.lightingConfig)
  const cameraMode = useAppStore((state) => state.cameraMode)

  const environments: EnvironmentType[] = ['sunset', 'city', 'park', 'forest', 'apartment', 'studio', 'dawn', 'night', 'warehouse', null]
  const cameraModes: { value: CameraMode; label: string; disabled: boolean }[] = [
    { value: 'orbit', label: '轨道模式', disabled: false },
    { value: 'firstPerson', label: '第一人称模式', disabled: false },
  ]

  return (
    <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg w-72">
      <h3 className="text-lg font-bold mb-3 border-b border-gray-600 pb-2">控制面板</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">相机模式</label>
          <div className="flex gap-2">
            {cameraModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => !mode.disabled && setCameraMode(mode.value)}
                disabled={mode.disabled}
                className={`flex-1 px-3 py-2 rounded text-sm transition-all ${
                  cameraMode === mode.value
                    ? 'bg-blue-600 text-white'
                    : mode.disabled
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm">显示性能统计</span>
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">环境预设</label>
          <select 
            value={sceneConfig.environment || ''}
            onChange={(e) => setEnvironment(e.target.value === '' ? null : e.target.value as EnvironmentType)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {environments.map((env) => (
              <option key={env || 'none'} value={env || ''}>
                {env ? env.charAt(0).toUpperCase() + env.slice(1) : '无环境'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">环境光强度</label>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.1"
            value={lightingConfig.ambientIntensity || 0.6}
            onChange={(e) => setLightingConfig({ ambientIntensity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {lightingConfig.ambientIntensity || 0.6}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">方向光强度</label>
          <input 
            type="range" 
            min="0" 
            max="3" 
            step="0.1"
            value={lightingConfig.directionalIntensity || 1.2}
            onChange={(e) => setLightingConfig({ directionalIntensity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {lightingConfig.directionalIntensity || 1.2}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const isLoading = useAppStore((state) => state.isLoading)
  const loadProgress = useAppStore((state) => state.loadProgress)
  const showStats = useAppStore((state) => state.showStats)
  const fps = useAppStore((state) => state.fps)
  const cameraMode = useAppStore((state) => state.cameraMode)
  const setSelectedComponentId = useAppStore((state) => state.setSelectedComponent)
  const setCameraMode = useAppStore((state) => state.setCameraMode)

  const handleComponentSelect = useCallback((info: ComponentInfo) => {
    setSelectedComponent(info)
  }, [])

  const handleEmptyClick = useCallback(() => {
    setSelectedComponent(null)
    setSelectedComponentId(null)
  }, [setSelectedComponentId])

  const handlePointerLockChange = useCallback((locked: boolean) => {
    setIsPointerLocked(locked)
  }, [])

  const handleSwitchMode = useCallback((mode: 'orbit' | 'firstPerson') => {
    setCameraMode(mode)
  }, [setCameraMode])

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">古建筑3D可视化系统</h1>
        <p className="text-sm text-gray-300 mt-1">点击场景中的组件查看详细信息</p>
      </div>

      <Canvas 
        shadows
        gl={{ antialias: true }}
      >
        <SceneBuilder 
          onComponentSelect={handleComponentSelect}
          onEmptyClick={handleEmptyClick}
          showPerformance={false}
        />
        
        {cameraMode === 'orbit' ? (
          <CameraControls 
            config={{
              position: [10, 8, 10],
              fov: 50,
              minDistance: 3,
              maxDistance: 50,
              minPolarAngle: 0.2,
              maxPolarAngle: Math.PI / 2.2,
            }}
          />
        ) : (
          <FirstPersonControls 
            enabled={true}
            moveSpeed={8}
            lookSpeed={0.002}
            height={1.7}
            gravity={-15}
            jumpForce={8}
            onPointerLockChange={handlePointerLockChange}
          />
        )}
      </Canvas>

      <FirstPersonUI 
        isLocked={isPointerLocked}
        cameraMode={cameraMode}
        onSwitchMode={handleSwitchMode}
      />

      <ComponentInfoPanel info={selectedComponent} />
      <ControlPanel />
      <LoadingOverlay progress={isLoading ? loadProgress : 100} />
      <PerformanceDisplay showStats={showStats} fps={fps} />
    </div>
  )
}

export default App
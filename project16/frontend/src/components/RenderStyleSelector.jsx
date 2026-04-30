const RENDER_STYLES = [
  {
    id: 'default',
    name: '默认',
    description: '平衡的光照效果',
    icon: '✨',
    config: {
      modelColor: '#9333ea',
      ambientIntensity: 0.4,
      directionalIntensity: 1.5,
      environment: 'city',
      metalness: 0.8,
      roughness: 0.2
    }
  },
  {
    id: 'metallic',
    name: '金属质感',
    description: '高反光金属效果',
    icon: '🔩',
    config: {
      modelColor: '#e5e7eb',
      ambientIntensity: 0.3,
      directionalIntensity: 2,
      environment: 'sunset',
      metalness: 1,
      roughness: 0.1
    }
  },
  {
    id: 'ceramic',
    name: '陶瓷风格',
    description: '光滑陶瓷质感',
    icon: '🏺',
    config: {
      modelColor: '#ffffff',
      ambientIntensity: 0.5,
      directionalIntensity: 1.8,
      environment: 'city',
      metalness: 0.3,
      roughness: 0.05
    }
  },
  {
    id: 'cartoon',
    name: '卡通风格',
    description: '扁平化卡通效果',
    icon: '🎨',
    config: {
      modelColor: '#f59e0b',
      ambientIntensity: 0.6,
      directionalIntensity: 1.2,
      environment: 'park',
      metalness: 0,
      roughness: 0.8
    }
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '霓虹科技风格',
    icon: '🌃',
    config: {
      modelColor: '#06b6d4',
      ambientIntensity: 0.2,
      directionalIntensity: 1.5,
      environment: 'city',
      metalness: 0.9,
      roughness: 0.1,
      accentColors: ['#ec4899', '#8b5cf6']
    }
  },
  {
    id: 'golden',
    name: '金色奢华',
    description: '高贵黄金质感',
    icon: '👑',
    config: {
      modelColor: '#fbbf24',
      ambientIntensity: 0.4,
      directionalIntensity: 2,
      environment: 'sunset',
      metalness: 1,
      roughness: 0.2
    }
  },
  {
    id: 'nature',
    name: '自然有机',
    description: '木纹/岩石质感',
    icon: '🌿',
    config: {
      modelColor: '#854d0e',
      ambientIntensity: 0.5,
      directionalIntensity: 1.5,
      environment: 'forest',
      metalness: 0,
      roughness: 0.9
    }
  },
  {
    id: 'glass',
    name: '玻璃透明',
    description: '半透明玻璃效果',
    icon: '💎',
    config: {
      modelColor: '#60a5fa',
      ambientIntensity: 0.3,
      directionalIntensity: 2,
      environment: 'city',
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.7
    }
  }
];

function RenderStyleSelector({ selectedStyle, onStyleChange, className = '' }) {
  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        渲染风格
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {RENDER_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              selectedStyle?.id === style.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800'
            }`}
          >
            <span className="text-2xl mb-1">{style.icon}</span>
            <span className={`text-sm font-medium ${
              selectedStyle?.id === style.id
                ? 'text-purple-700 dark:text-purple-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {style.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {style.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { RENDER_STYLES, RenderStyleSelector };
export default RenderStyleSelector;

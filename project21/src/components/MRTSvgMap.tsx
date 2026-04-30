import { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react';
import { generateMockTrains } from '../data/mockTrains';
import { Train } from '../types/train';

interface MRTSvgMapProps {
  onRefresh?: (timestamp: string) => void;
}

interface TooltipProps {
  train: Train;
  position: { x: number; y: number };
}

const Tooltip = memo(({ train, position }: TooltipProps) => {
  const statusText = train.isDelayed ? '晚点' : (train.status === 'running' ? '运行中' : '停靠中');
  const statusColor = train.isDelayed ? '#EF4444' : (train.status === 'running' ? '#22C55E' : '#F59E0B');
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 24,
        top: position.y - 12,
        transform: 'translateZ(0)',
      }}
    >
      <div className="bg-gradient-to-br from-gray-900/98 to-gray-800/98 border border-gray-600 rounded-xl shadow-2xl p-4 min-w-[260px] backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: train.lineColor }}></div>
            <span className="text-white font-bold text-lg">{train.trainNumber}</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            style={{ backgroundColor: statusColor, color: 'white' }}
          >
            {statusText}
          </span>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">运行线路</span>
            <span className="text-white font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: train.lineColor }}></span>
              {train.lineName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">运行方向</span>
            <span className="text-white font-medium">{train.direction === 'up' ? '上行' : '下行'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">运行速度</span>
            <span className="text-white font-medium">{train.speed} km/h</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">当前载客</span>
            <span className="text-white font-medium">{train.passengerCount.toLocaleString()} 人</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">当前站点</span>
            <span className="text-white font-medium">{train.currentStation}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">下一站点</span>
            <span className="text-cyan-400 font-medium">{train.nextStation}</span>
          </div>
          {train.isDelayed && (
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-700 bg-red-500/10 -mx-4 px-4 py-2 rounded-b-lg">
              <span className="text-red-400 font-medium">晚点预警</span>
              <span className="text-red-400 font-bold text-base">! {train.delayMinutes} 分钟</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.train.id === nextProps.train.id &&
    Math.abs(prevProps.position.x - nextProps.position.x) < 12 &&
    Math.abs(prevProps.position.y - nextProps.position.y) < 12
  );
});

Tooltip.displayName = 'Tooltip';

interface TrainIconProps {
  train: Train;
  onMouseEnter: (train: Train) => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

const TrainIcon = memo(({ train, onMouseEnter, onMouseLeave, onMouseMove }: TrainIconProps) => {
  const baseColor = train.isDelayed ? '#EF4444' : (train.status === 'running' ? '#22C55E' : '#F59E0B');
  
  return (
    <g
      transform={`translate(${train.positionX - 12}, ${train.positionY - 6})`}
      style={{ 
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="train-icon-group"
      onMouseEnter={() => onMouseEnter(train)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      {train.status === 'running' && (
        <>
          <ellipse cx="12" cy="6" rx="16" ry="5" fill={baseColor} opacity="0.15" className="train-pulse">
            <animate attributeName="rx" values="14;18;14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.25;0.15" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}
      
      <g filter="url(#glow-soft)">
        <rect x="1" y="2" width="22" height="8" rx="3" fill={baseColor} />
        <rect x="3" y="4" width="4" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="9" y="4" width="4" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="15" y="4" width="4" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
        <line x1="7" y1="2" x2="7" y2="0" stroke={baseColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="17" y1="2" x2="17" y2="0" stroke={baseColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      
      {train.isDelayed && (
        <g>
          <circle cx="24" cy="2" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1">
            <animate attributeName="r" values="4;5;4" dur="0.8s" repeatCount="indefinite" />
          </circle>
          <text x="24" y="5" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="bold">!</text>
        </g>
      )}
    </g>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.train.id === nextProps.train.id &&
    prevProps.train.status === nextProps.train.status &&
    prevProps.train.isDelayed === nextProps.train.isDelayed &&
    Math.abs(prevProps.train.positionX - nextProps.train.positionX) < 3 &&
    Math.abs(prevProps.train.positionY - nextProps.train.positionY) < 3
  );
});

TrainIcon.displayName = 'TrainIcon';

interface StatsPanelProps {
  trains: Train[];
}

const StatsPanel = memo(({ trains }: StatsPanelProps) => {
  const stats = useMemo(() => {
    const online = trains.filter(t => t.status === 'running' || t.status === 'delayed').length;
    const normal = trains.filter(t => t.status === 'running' && !t.isDelayed).length;
    const delayed = trains.filter(t => t.isDelayed).length;
    const stopped = trains.filter(t => t.status === 'stopped').length;
    return { online, normal, delayed, stopped, total: trains.length };
  }, [trains]);

  return (
    <div className="absolute top-20 right-4 z-10">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl p-5 min-w-[280px]">
        <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2 pb-3 border-b border-gray-700">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          列车运行统计
        </h4>
        
        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
              <span className="text-gray-300 text-sm font-medium">在线列车</span>
            </div>
            <span className="text-cyan-400 font-bold text-xl font-mono">{stats.online}<span className="text-gray-500 text-sm font-normal">/{stats.total}</span></span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/15 to-green-500/5 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
              <span className="text-gray-300 text-sm font-medium">正常运行</span>
            </div>
            <span className="text-green-400 font-bold text-xl font-mono">{stats.normal}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/15 to-amber-500/5 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
              <span className="text-gray-300 text-sm font-medium">临时停靠</span>
            </div>
            <span className="text-amber-400 font-bold text-xl font-mono">{stats.stopped}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500/15 to-red-500/5 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-400/50 animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">晚点预警</span>
            </div>
            <span className="text-red-400 font-bold text-xl font-mono">{stats.delayed}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';

function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

const MRTSvgMap = ({ onRefresh }: MRTSvgMapProps) => {
  const [trains, setTrains] = useState(generateMockTrains(60));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState('');
  const [hoveredTrain, setHoveredTrain] = useState<Train | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const debouncedMouseMove = useDebounce((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, 8);

  const handleMouseEnter = useCallback((train: Train) => {
    setHoveredTrain(train);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredTrain(null);
  }, []);

  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTrains(generateMockTrains(60));
      const timestamp = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setLastRefreshTime(timestamp);
      setIsRefreshing(false);
      onRefreshRef.current?.(timestamp);
    }, 600);
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="w-full h-full flex flex-col relative">
      <StatsPanel trains={trains} />
      
      {hoveredTrain && <Tooltip train={hoveredTrain} position={mousePosition} />}
      
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-dashboard-text-primary flex items-center gap-2">
          <svg className="w-6 h-6 text-dashboard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          香港地铁线路图
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className="ml-2 p-1.5 rounded-lg bg-dashboard-bg/50 border border-dashboard-border hover:bg-dashboard-bg/80 transition-all disabled:opacity-50 hover:border-cyan-500/50 group"
            title="手动刷新"
          >
            <svg 
              className={`w-4 h-4 text-dashboard-accent ${isRefreshing ? 'animate-spin' : 'group-hover:text-cyan-400'} transition-colors`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {lastRefreshTime && (
            <span className="text-sm font-normal text-dashboard-text-secondary flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lastRefreshTime}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
            <div className="w-4 h-1 rounded shadow-sm" style={{backgroundColor: '#0070C0'}}></div>
            <span className="text-dashboard-text-secondary">港岛线</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
            <div className="w-4 h-1 rounded shadow-sm" style={{backgroundColor: '#D32F2F'}}></div>
            <span className="text-dashboard-text-secondary">荃湾线</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
            <div className="w-4 h-1 rounded shadow-sm" style={{backgroundColor: '#2E7D32'}}></div>
            <span className="text-dashboard-text-secondary">观塘线</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
            <div className="w-4 h-1 rounded shadow-sm" style={{backgroundColor: '#7B1FA2'}}></div>
            <span className="text-dashboard-text-secondary">将军澳线</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
            <div className="w-4 h-1 rounded shadow-sm" style={{backgroundColor: '#F57C00'}}></div>
            <span className="text-dashboard-text-secondary">东涌线</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-900/30 to-gray-800/30">
        <svg 
          viewBox="0 0 1200 700" 
          className="w-full h-full"
          style={{ minHeight: '550px' }}
        >
          <defs>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-soft">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="lineGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0070C0" stopOpacity="1"/>
              <stop offset="100%" stopColor="#42A5F5" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="lineGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D32F2F" stopOpacity="1"/>
              <stop offset="100%" stopColor="#EF5350" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="lineGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2E7D32" stopOpacity="1"/>
              <stop offset="100%" stopColor="#66BB6A" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="lineGradientPurple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7B1FA2" stopOpacity="1"/>
              <stop offset="100%" stopColor="#AB47BC" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="lineGradientOrange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F57C00" stopOpacity="1"/>
              <stop offset="100%" stopColor="#FFA726" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="lineGradientBrown" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5D4037" stopOpacity="1"/>
              <stop offset="100%" stopColor="#8D6E63" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A1628" stopOpacity="1"/>
              <stop offset="100%" stopColor="#0D1F3C" stopOpacity="1"/>
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#bgGradient)" rx="12"/>

          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.04)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" rx="12"/>

          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0"/>
          </radialGradient>
          <ellipse cx="600" cy="350" rx="400" ry="250" fill="url(#centerGlow)"/>

          <path
            d="M 100 350 L 200 350 L 300 350 L 400 350 L 500 350 L 600 350 L 700 350 L 800 350 L 900 350 L 1000 350 L 1100 350"
            stroke="url(#lineGradientBlue)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow-soft)"
          />

          <path
            d="M 150 550 L 250 500 L 350 450 L 400 400 L 400 350 L 400 300 L 400 200 L 450 150 L 500 120 L 550 100"
            stroke="url(#lineGradientRed)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-soft)"
          />

          <path
            d="M 100 200 L 200 220 L 300 250 L 400 300 L 500 350 L 600 400 L 700 450 L 800 500 L 900 550 L 1000 580"
            stroke="url(#lineGradientGreen)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-soft)"
          />

          <path
            d="M 500 350 L 600 320 L 700 300 L 800 280 L 900 270 L 1000 270 L 1050 280"
            stroke="url(#lineGradientPurple)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-soft)"
          />

          <path
            d="M 50 350 L 150 350 L 250 320 L 350 280 L 400 250 L 450 220 L 500 200"
            stroke="url(#lineGradientOrange)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-soft)"
          />

          <path
            d="M 500 350 L 550 300 L 600 250 L 650 200 L 700 150"
            stroke="url(#lineGradientBrown)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-soft)"
          />

          <circle cx="400" cy="350" r="14" fill="#FFF" stroke="#FFD700" strokeWidth="3" filter="url(#glow-strong)">
            <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="400" y="382" textAnchor="middle" fill="#E0E0E0" fontSize="14" fontWeight="bold">中环</text>

          <circle cx="500" cy="350" r="14" fill="#FFF" stroke="#FFD700" strokeWidth="3" filter="url(#glow-strong)">
            <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="500" y="382" textAnchor="middle" fill="#E0E0E0" fontSize="14" fontWeight="bold">金钟</text>

          <circle cx="400" cy="300" r="11" fill="#FFF" stroke="#FFD700" strokeWidth="3" filter="url(#glow-soft)"/>
          <text x="400" y="282" textAnchor="middle" fill="#E0E0E0" fontSize="13" fontWeight="bold">旺角</text>

          {trains.map((train) => (
            <TrainIcon
              key={train.id}
              train={train}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={debouncedMouseMove}
            />
          ))}

          {[
            {x: 100, y: 350, name: '上环'},
            {x: 200, y: 350, name: '中环'},
            {x: 300, y: 350, name: '湾仔'},
            {x: 600, y: 350, name: '铜锣湾'},
            {x: 700, y: 350, name: '北角'},
            {x: 800, y: 350, name: '鰂鱼涌'},
            {x: 900, y: 350, name: '杏花邨'},
            {x: 1000, y: 350, name: '筲箕湾'},
            {x: 1100, y: 350, name: '柴湾'}
          ].map((station, i) => (
            <g key={`island-${i}`}>
              <circle cx={station.x} cy={station.y} r="8" fill="#0070C0" stroke="#FFF" strokeWidth="2.5"/>
              <text x={station.x} y={station.y + 28} textAnchor="middle" fill="#90CAF9" fontSize="12" fontWeight="500">{station.name}</text>
            </g>
          ))}

          {[
            {x: 150, y: 550, name: '荃湾'},
            {x: 250, y: 500, name: '葵芳'},
            {x: 350, y: 450, name: '荔枝角'},
            {x: 400, y: 400, name: '深水埗'},
            {x: 400, y: 200, name: '油麻地'},
            {x: 450, y: 150, name: '佐敦'},
            {x: 500, y: 120, name: '尖沙咀'},
            {x: 550, y: 100, name: '尖东'}
          ].map((station, i) => (
            <g key={`tsuen-${i}`}>
              <circle cx={station.x} cy={station.y} r="8" fill="#D32F2F" stroke="#FFF" strokeWidth="2.5"/>
              <text x={station.x + 16} y={station.y + 5} textAnchor="start" fill="#EF9A9A" fontSize="12" fontWeight="500">{station.name}</text>
            </g>
          ))}

          {[
            {x: 100, y: 200, name: '黄埔'},
            {x: 200, y: 220, name: '何文田'},
            {x: 300, y: 250, name: '九龙塘'},
            {x: 600, y: 400, name: '彩虹'},
            {x: 700, y: 450, name: '九龙湾'},
            {x: 800, y: 500, name: '牛头角'},
            {x: 900, y: 550, name: '观塘'},
            {x: 1000, y: 580, name: '调景岭'}
          ].map((station, i) => (
            <g key={`kwun-${i}`}>
              <circle cx={station.x} cy={station.y} r="8" fill="#2E7D32" stroke="#FFF" strokeWidth="2.5"/>
              <text x={station.x} y={station.y + 22} textAnchor="middle" fill="#A5D6A7" fontSize="12" fontWeight="500">{station.name}</text>
            </g>
          ))}

          <text x="850" y="326" fill="#42A5F5" fontSize="14" fontWeight="bold" opacity="0.9">港岛线</text>
          <text x="580" y="126" fill="#EF5350" fontSize="14" fontWeight="bold" opacity="0.9">荃湾线</text>
          <text x="850" y="526" fill="#66BB6A" fontSize="14" fontWeight="bold" opacity="0.9">观塘线</text>
          <text x="950" y="246" fill="#AB47BC" fontSize="14" fontWeight="bold" opacity="0.9">将军澳线</text>
          <text x="100" y="300" fill="#FFA726" fontSize="14" fontWeight="bold" opacity="0.9">东涌线</text>
          <text x="710" y="140" fill="#8D6E63" fontSize="14" fontWeight="bold" opacity="0.9">东铁线</text>

          <rect x="15" y="15" width="1170" height="670" fill="none" stroke="url(#lineGradientBlue)" strokeWidth="2" rx="12" opacity="0.3"/>
          
        </svg>
      </div>
    </div>
  )
}

export default MRTSvgMap

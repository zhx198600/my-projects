import { useState, useEffect, useCallback } from 'react';
import {
  StatData,
  WarningData,
  HourlyTrafficData,
  DistrictTrafficData,
  RoadData,
  statsData as initialStats,
  warningsData as initialWarnings,
  hourlyTrafficData as initialHourly,
  districtTrafficData as initialDistrict,
  roadsData as initialRoads
} from '../data/mockData';

const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const smoothUpdate = (current: number, baseVariation: number, minValue: number, maxValue: number): number => {
  const variation = current * baseVariation;
  const newValue = current + randomInRange(-variation, variation);
  return Math.max(minValue, Math.min(maxValue, newValue));
};

const formatTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

interface TrafficData {
  stats: StatData[];
  warnings: WarningData[];
  hourlyData: HourlyTrafficData[];
  districtData: DistrictTrafficData[];
  roads: RoadData[];
  isRefreshing: boolean;
  lastUpdateTime: string;
}

interface UseTrafficDataReturn extends TrafficData {
  refreshData: () => void;
  startAutoRefresh: (interval?: number) => void;
  stopAutoRefresh: () => void;
}

const useTrafficData = (autoRefresh: boolean = true, refreshInterval: number = 5000): UseTrafficDataReturn => {
  const [stats, setStats] = useState<StatData[]>(initialStats);
  const [warnings, setWarnings] = useState<WarningData[]>(initialWarnings);
  const [hourlyData, setHourlyData] = useState<HourlyTrafficData[]>(initialHourly);
  const [districtData, setDistrictData] = useState<DistrictTrafficData[]>(initialDistrict);
  const [roads, setRoads] = useState<RoadData[]>(initialRoads);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(formatTime(new Date()));

  const updateStats = useCallback((): void => {
    setStats(prev => prev.map(stat => {
      let newValue: number;
      let newTrend: number;

      switch (stat.id) {
        case 'speed':
          newValue = smoothUpdate(stat.value, 0.05, 40, 80);
          newTrend = smoothUpdate(stat.trend, 0.1, -20, 20);
          break;
        case 'congestion':
          newValue = smoothUpdate(stat.value, 0.08, 1.0, 4.0);
          newTrend = smoothUpdate(stat.trend, 0.15, -30, 30);
          break;
        case 'vehicles':
          newValue = smoothUpdate(stat.value, 0.03, 80000, 180000);
          newTrend = smoothUpdate(stat.trend, 0.1, -25, 25);
          break;
        case 'accidents':
          newValue = Math.round(smoothUpdate(stat.value, 0.15, 5, 50));
          newTrend = smoothUpdate(stat.trend, 0.2, -40, 40);
          break;
        default:
          newValue = stat.value;
          newTrend = stat.trend;
      }

      return {
        ...stat,
        value: stat.id === 'congestion' ? Number(newValue.toFixed(1)) : Math.round(newValue),
        trend: Number(newTrend.toFixed(1))
      };
    }));
  }, []);

  const updateWarnings = useCallback((): void => {
    const now = new Date();
    setWarnings(prev => {
      const updated = prev.map(warning => {
        const time = new Date(now.getTime() - Math.random() * 3600000);
        return {
          ...warning,
          time: formatTime(time)
        };
      });

      if (Math.random() > 0.7) {
        const locations = [
          '朝阳区建国门外大街', '海淀区中关村大街', '东城区王府井步行街',
          '西城区西单北大街', '丰台区南三环西路', '通州区新华大街',
          '昌平区回龙观东大街', '大兴区亦庄荣华中路', '顺义区府前大街',
          '房山区良乡中路'
        ];
        const types: WarningData['type'][] = ['交通事故', '道路拥堵', '车辆故障', '恶劣天气', '交通管制'];
        const levels: WarningData['level'][] = ['严重', '一般', '轻微'];

        const newWarning: WarningData = {
          id: `w${Date.now()}`,
          location: locations[Math.floor(Math.random() * locations.length)],
          type: types[Math.floor(Math.random() * types.length)],
          level: levels[Math.floor(Math.random() * levels.length)],
          time: formatTime(now)
        };

        return [newWarning, ...updated].slice(0, 10);
      }

      return updated;
    });
  }, []);

  const updateHourlyData = useCallback((): void => {
    setHourlyData(prev => prev.map(item => ({
      ...item,
      flow: Math.round(smoothUpdate(item.flow, 0.08, 3000, 80000))
    })));
  }, []);

  const updateDistrictData = useCallback((): void => {
    setDistrictData(prev => prev.map(item => ({
      ...item,
      flow: Math.round(smoothUpdate(item.flow, 0.06, 40000, 220000)),
      congestion: Number(smoothUpdate(item.congestion, 0.08, 1.0, 4.0).toFixed(1))
    })));
  }, []);

  const updateRoads = useCallback((): void => {
    setRoads(prev => prev.map(road => {
      const newCongestion = smoothUpdate(road.congestionIndex, 0.1, 1.0, 4.0);
      let congestionLevel: RoadData['congestionLevel'];
      
      if (newCongestion < 1.5) {
        congestionLevel = '畅通';
      } else if (newCongestion < 2.5) {
        congestionLevel = '缓行';
      } else if (newCongestion < 3.5) {
        congestionLevel = '拥堵';
      } else {
        congestionLevel = '严重拥堵';
      }

      return {
        ...road,
        congestionIndex: Number(newCongestion.toFixed(1)),
        congestionLevel
      };
    }));
  }, []);

  const refreshData = useCallback((): void => {
    setIsRefreshing(true);
    
    updateStats();
    updateWarnings();
    updateHourlyData();
    updateDistrictData();
    updateRoads();
    
    setLastUpdateTime(formatTime(new Date()));
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [updateStats, updateWarnings, updateHourlyData, updateDistrictData, updateRoads]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshData, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  const startAutoRefresh = useCallback((_interval: number = 5000): void => {
    refreshData();
  }, [refreshData]);

  const stopAutoRefresh = useCallback((): void => {}, []);

  return {
    stats,
    warnings,
    hourlyData,
    districtData,
    roads,
    isRefreshing,
    lastUpdateTime,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh
  };
};

export default useTrafficData;

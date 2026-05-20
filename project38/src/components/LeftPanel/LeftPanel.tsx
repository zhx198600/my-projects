import React, { useMemo } from 'react';
import StatCard from '../StatCard/StatCard';
import { StatData } from '../../data/mockData';
import { MapMode } from '../ModeSwitch/ModeSwitch';
import './LeftPanel.css';

interface LeftPanelProps {
  mapMode: MapMode;
  stats: StatData[];
  isRefreshing?: boolean;
  lastUpdateTime?: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ mapMode, stats, isRefreshing, lastUpdateTime }) => {
  // 过滤地铁模式下显示的指标
  const filteredStats = useMemo(() => {
    if (mapMode === 'metro') {
      // 地铁模式只显示：在途车辆、实时车速
      return stats.filter(stat => 
        stat.id === 'vehicles' || stat.id === 'speed'
      );
    }
    // 道路模式显示全部指标
    return stats;
  }, [stats, mapMode]);

  return (
    <div className="left-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">{mapMode === 'metro' ? '地铁运营指标' : '核心指标'}</h2>
        <div className="header-right">
          {lastUpdateTime && (
            <span className="update-time">{lastUpdateTime}</span>
          )}
          <div className={`panel-indicator ${isRefreshing ? 'refreshing' : ''}`}></div>
        </div>
      </div>
      <div className="stats-grid">
        {filteredStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            unit={stat.unit}
            icon={stat.icon}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;

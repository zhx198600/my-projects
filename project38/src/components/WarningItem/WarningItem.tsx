import React from 'react';
import { WarningData } from '../../data/mockData';
import './WarningItem.css';

interface WarningItemProps {
  warning: WarningData;
}

const WarningItem: React.FC<WarningItemProps> = ({ warning }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case '严重':
        return '#ff4757';
      case '一般':
        return '#ffa502';
      case '轻微':
        return '#2ed573';
      default:
        return '#ffffff';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case '严重':
        return '🔴';
      case '一般':
        return '🟡';
      case '轻微':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '交通事故':
        return '🚨';
      case '道路拥堵':
        return '🚦';
      case '车辆故障':
        return '🔧';
      case '恶劣天气':
        return '🌧️';
      case '交通管制':
        return '🚧';
      default:
        return '⚠️';
    }
  };

  return (
    <div className={`warning-item ${warning.level === '严重' ? 'warning-severe' : ''}`}>
      <div className="warning-indicator" style={{ backgroundColor: getLevelColor(warning.level) }}></div>
      <div className="warning-content">
        <div className="warning-header">
          <span className="warning-type-icon">{getTypeIcon(warning.type)}</span>
          <span className="warning-type">{warning.type}</span>
          <span className="warning-level-badge" style={{ backgroundColor: getLevelColor(warning.level) }}>
            {getLevelIcon(warning.level)} {warning.level}
          </span>
        </div>
        <div className="warning-location">
          <span className="location-icon">📍</span>
          <span className="location-text">{warning.location}</span>
        </div>
        <div className="warning-time">
          <span className="time-icon">🕐</span>
          <span className="time-text">{warning.time}</span>
        </div>
      </div>
    </div>
  );
};

export default WarningItem;

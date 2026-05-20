import React from 'react';
import WarningItem from '../WarningItem/WarningItem';
import { WarningData, subwayLinesData } from '../../data/mockData';
import { MapMode } from '../ModeSwitch/ModeSwitch';
import './RightPanel.css';

interface RightPanelProps {
  mapMode: MapMode;
  warnings: WarningData[];
  isRefreshing?: boolean;
  lastUpdateTime?: string;
}

const RightPanel: React.FC<RightPanelProps> = ({ mapMode, warnings, isRefreshing, lastUpdateTime }) => {
  const severeCount = warnings.filter(w => w.level === '严重').length;
  const abnormalLines = subwayLinesData.filter(l => l.status !== '正常');

  if (mapMode === 'metro') {
    return (
      <div className="right-panel-container">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="title-icon">🚇</span>
            地铁运营状态
          </h2>
          <div className="warning-stats">
            <span className="stats-badge abnormal">
              异常: {abnormalLines.length}
            </span>
            <span className="stats-badge total">
              总计: {subwayLinesData.length}
            </span>
          </div>
          <div className="header-right">
            {lastUpdateTime && (
              <span className="update-time">{lastUpdateTime}</span>
            )}
            <div className={`panel-indicator ${isRefreshing ? 'refreshing' : ''}`}></div>
          </div>
        </div>
        <div className="metro-status-list">
          {subwayLinesData.map((line) => (
            <div key={line.id} className="metro-status-item">
              <div className="metro-line-info">
                <span 
                  className="metro-line-color" 
                  style={{ backgroundColor: line.color }}
                ></span>
                <span className="metro-line-name">{line.name}</span>
              </div>
              <div className="metro-status-info">
                <span className={`metro-status-badge ${line.status === '正常' ? 'normal' : line.status === '延误' ? 'delayed' : 'suspended'}`}>
                  {line.status}
                </span>
                <span className="metro-passenger-flow">
                  {Math.round(line.passengerFlow / 10000)} 万人次/日
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="title-icon">🔔</span>
          智能预警
        </h2>
        <div className="warning-stats">
          <span className="stats-badge severe">
            严重: {severeCount}
          </span>
          <span className="stats-badge total">
            总计: {warnings.length}
          </span>
        </div>
        <div className="header-right">
          {lastUpdateTime && (
            <span className="update-time">{lastUpdateTime}</span>
          )}
          <div className={`panel-indicator ${isRefreshing ? 'refreshing' : ''}`}></div>
        </div>
      </div>
      <div className="warning-list-container">
        <div className="warning-list">
          {warnings.map((warning) => (
            <WarningItem key={warning.id} warning={warning} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;

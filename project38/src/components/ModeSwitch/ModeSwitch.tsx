import React from 'react';
import './ModeSwitch.css';

export type MapMode = 'road' | 'metro';

interface ModeSwitchProps {
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
}

const ModeSwitch: React.FC<ModeSwitchProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mode-switch">
      <button
        className={`mode-btn ${mode === 'road' ? 'active' : ''}`}
        onClick={() => onModeChange('road')}
      >
        <span className="btn-icon">🛣️</span>
        <span className="btn-text">普通道路（含高速路）</span>
      </button>
      <button
        className={`mode-btn ${mode === 'metro' ? 'active' : ''}`}
        onClick={() => onModeChange('metro')}
      >
        <span className="btn-icon">🚇</span>
        <span className="btn-text">地铁线路</span>
      </button>
      <div 
        className="mode-indicator" 
        style={{ 
          transform: mode === 'road' ? 'translateX(0)' : 'translateX(100%)' 
        }}
      />
    </div>
  );
};

export default ModeSwitch;

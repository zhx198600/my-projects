import React from 'react';
import CountUp from 'react-countup';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  trend: number;
  trendLabel: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  color
}) => {
  const isPositive = trend >= 0;

  return (
    <div className="stat-card" style={{ '--card-glow': color } as React.CSSProperties}>
      <div className="stat-card-content">
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value-wrapper">
            <span className="stat-value">
              <CountUp
                end={value}
                duration={2}
                decimals={value < 100 ? 1 : 0}
                separator=","
              />
            </span>
            <span className="stat-unit">{unit}</span>
          </div>
          <div className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
            <span className="trend-icon">{isPositive ? '↑' : '↓'}</span>
            <span className="trend-value">{Math.abs(trend)}%</span>
            <span className="trend-label">{trendLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import dayjs from 'dayjs';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  bottomPanel?: ReactNode;
  mapArea?: ReactNode;
  modeSwitch?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  leftPanel,
  rightPanel,
  bottomPanel,
  mapArea,
  modeSwitch
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      const baseWidth = 1920;
      const baseHeight = 1080;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scaleX = windowWidth / baseWidth;
      const scaleY = windowHeight / baseHeight;
      const newScale = Math.min(scaleX, scaleY);

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const formatTime = (date: dayjs.Dayjs) => {
    return date.format('YYYY年MM月DD日 HH:mm:ss');
  };

  return (
    <div className="dashboard-wrapper">
      <div
        ref={containerRef}
        className="dashboard-container"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <header className="dashboard-header">
          <div className="header-decoration left"></div>
          <h1 className="header-title">
            <span className="title-icon">◎</span>
            北京市智慧交通可视化平台
            <span className="title-icon">◎</span>
          </h1>
          <div className="header-right">
            <div className="header-time">
              {formatTime(currentTime)}
            </div>
            {modeSwitch && <div className="header-mode-switch">{modeSwitch}</div>}
          </div>
          <div className="header-decoration right"></div>
        </header>

        <main className="dashboard-main">
          <aside className="panel left-panel">
            <div className="panel-inner">
              {leftPanel || <div className="panel-placeholder">左侧面板</div>}
            </div>
          </aside>

          <section className="map-area">
            <div className="map-inner">
              {mapArea || <div className="map-placeholder">中央地图区域</div>}
            </div>
          </section>

          <aside className="panel right-panel">
            <div className="panel-inner">
              {rightPanel || <div className="panel-placeholder">右侧面板</div>}
            </div>
          </aside>
        </main>

        <footer className="dashboard-footer">
          <div className="footer-inner">
            {bottomPanel || <div className="footer-placeholder">底部图表区域</div>}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

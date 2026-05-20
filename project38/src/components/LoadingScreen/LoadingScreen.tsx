import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('初始化系统...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const statuses = [
    { progress: 10, text: '初始化系统...' },
    { progress: 25, text: '加载地图数据...' },
    { progress: 40, text: '渲染交通线路...' },
    { progress: 55, text: '初始化统计模块...' },
    { progress: 70, text: '加载图表组件...' },
    { progress: 85, text: '连接实时数据...' },
    { progress: 95, text: '准备完成...' },
    { progress: 100, text: '系统就绪' }
  ];

  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statuses.length) {
        const status = statuses[currentIndex];
        setProgress(status.progress);
        setStatusText(status.text);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className={"loading-screen " + (isFadingOut ? 'loading-fade-out' : '')}>
      <div className="loading-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="loading-particle"
            style={{
              left: Math.random() * 100 + '%',
              bottom: '-10px',
              animationDelay: Math.random() * 8 + 's',
              animationDuration: (6 + Math.random() * 4) + 's'
            }}
          />
        ))}
      </div>

      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-circle">
            <span className="logo-icon">◆</span>
          </div>
        </div>

        <h1 className="loading-title">北京智慧交通</h1>
        <p className="loading-subtitle">可视化管控平台</p>

        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              style={{ width: progress + '%' }}
            />
          </div>
          <div className="loading-progress-text">
            <span className="loading-status">
              <span className="loading-dot"></span>
              <span>{statusText}</span>
            </span>
            <span className="loading-percentage">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="loading-footer">
        <p className="loading-footer-text">
          BEIJING SMART TRAFFIC VISUALIZATION PLATFORM © 2024
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;

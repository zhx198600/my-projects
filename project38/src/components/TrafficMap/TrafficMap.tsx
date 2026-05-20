import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { beijingGeoJSON } from './beijingGeoJSON';
import { roadsData, subwayLinesData, subwayStationsData, congestionColors, CongestionLevel } from '../../data/mockData';
import { MapMode } from '../ModeSwitch/ModeSwitch';
import './TrafficMap.css';

interface TrafficMapProps {
  mapMode: MapMode;
}

// 行政区边界数据
const districtBounds: Record<string, { center: [number, number]; zoom: number; name: string }> = {
  '海淀区': { center: [116.30, 39.95], zoom: 2.5, name: '海淀区' },
  '朝阳区': { center: [116.48, 39.93], zoom: 2.5, name: '朝阳区' },
  '丰台区': { center: [116.30, 39.85], zoom: 2.3, name: '丰台区' },
  '西城区': { center: [116.37, 39.92], zoom: 3.5, name: '西城区' },
  '东城区': { center: [116.42, 39.92], zoom: 3.5, name: '东城区' },
  '昌平区': { center: [116.25, 40.15], zoom: 2.0, name: '昌平区' },
  '顺义区': { center: [116.65, 40.10], zoom: 2.0, name: '顺义区' },
  '通州区': { center: [116.65, 39.90], zoom: 2.2, name: '通州区' },
  '大兴区': { center: [116.35, 39.70], zoom: 2.2, name: '大兴区' },
  '石景山区': { center: [116.22, 39.92], zoom: 4.0, name: '石景山区' },
  '房山区': { center: [116.10, 39.70], zoom: 2.0, name: '房山区' },
  '门头沟区': { center: [116.05, 39.95], zoom: 2.2, name: '门头沟区' },
};

const TrafficMap: React.FC<TrafficMapProps> = ({ mapMode }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const roadSeriesConfig = useMemo(() => {
    return roadsData.map((road) => {
      const isMainRoad = ['长安街', '北四环', '东三环', '西三环', '南三环', '北三环', '东二环', '西二环'].includes(road.name);
      const isHighway = ['京藏高速', '京通快速'].includes(road.name);
      
      let lineWidth = isHighway ? 6 : isMainRoad ? 5 : 3;
      let zlevel = isHighway ? 4 : isMainRoad ? 3 : 2;
      let opacity = isHighway ? 0.95 : isMainRoad ? 0.9 : 0.75;
      
      return {
        name: road.name,
        type: 'lines' as const,
        coordinateSystem: 'geo' as const,
        zlevel,
        symbol: 'none' as const,
        lineStyle: {
          color: congestionColors[road.congestionLevel],
          width: lineWidth,
          opacity,
          shadowColor: congestionColors[road.congestionLevel],
          shadowBlur: isMainRoad || isHighway ? 12 : 6
        },
        data: [
          {
            coords: road.coordinates,
            value: {
              name: road.name,
              level: road.congestionLevel,
              index: road.congestionIndex
            }
          }
        ],
        emphasis: {
          lineStyle: {
            width: lineWidth + 3,
            shadowBlur: 20
          }
        }
      };
    });
  }, []);

  const roadEffectSeriesConfig = useMemo(() => {
    return roadsData.map((road) => {
      const isMainRoad = ['长安街', '北四环', '东三环', '西三环', '南三环', '北三环', '东二环', '西二环'].includes(road.name);
      const isHighway = ['京藏高速', '京通快速'].includes(road.name);
      
      let symbolSize = isHighway ? 8 : isMainRoad ? 7 : 5;
      let zlevel = isHighway ? 5 : isMainRoad ? 4 : 3;
      
      return {
        name: road.name + '_effect',
        type: 'lines' as const,
        coordinateSystem: 'geo' as const,
        zlevel,
        symbol: 'none' as const,
        effect: {
          show: true,
          period: isHighway ? 3 : isMainRoad ? 4 : 5,
          trailLength: isHighway ? 0.35 : isMainRoad ? 0.3 : 0.2,
          symbol: 'circle' as const,
          symbolSize,
          color: '#ffffff'
        },
        lineStyle: {
          color: congestionColors[road.congestionLevel],
          width: 0,
          curveness: 0
        },
        data: [
          {
            coords: road.coordinates
          }
        ],
        silent: true
      };
    });
  }, []);

  const subwaySeriesConfig = useMemo(() => {
    return subwayLinesData.map((subway) => ({
      name: subway.name,
      type: 'lines' as const,
      coordinateSystem: 'geo' as const,
      zlevel: 5,
      symbol: 'none' as const,
      lineStyle: {
        color: subway.color,
        width: 6,
        opacity: subway.status === '正常' ? 0.95 : 0.5,
        shadowColor: subway.color,
        shadowBlur: subway.status === '正常' ? 18 : 6
      },
      data: [
        {
          coords: subway.coordinates,
          value: {
            name: subway.name,
            passengerFlow: subway.passengerFlow,
            status: subway.status
          }
        }
      ],
      emphasis: {
        lineStyle: {
          width: 10,
          shadowBlur: 25
        }
      }
    }));
  }, []);

  const subwayEffectSeriesConfig = useMemo(() => {
    return subwayLinesData.map((subway) => ({
      name: subway.name + '_effect',
      type: 'lines' as const,
      coordinateSystem: 'geo' as const,
      zlevel: 6,
      symbol: 'none' as const,
      effect: {
        show: subway.status === '正常',
        period: 4 + Math.random() * 2,
        trailLength: 0.25,
        symbol: 'circle' as const,
        symbolSize: 6,
        color: subway.color
      },
      lineStyle: {
        color: subway.color,
        width: 0,
        curveness: 0
      },
      data: [
        {
          coords: subway.coordinates
        }
      ],
      silent: true
    }));
  }, []);

  const stationSeriesConfig = useMemo(() => {
    return {
      name: '地铁站',
      type: 'effectScatter' as const,
      coordinateSystem: 'geo' as const,
      zlevel: 7,
      rippleEffect: {
        brushType: 'stroke' as const,
        scale: 2.5,
        period: 4
      },
      symbolSize: (data: any) => {
        const isTransfer = data[2] === 1;
        return isTransfer ? 20 : 14;
      },
      itemStyle: {
        color: '#ffffff',
        shadowBlur: 12,
        shadowColor: '#00ffff'
      },
      label: {
        show: true,
        formatter: (params: any) => params.data.name || params.name,
        position: 'right',
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: 'rgba(10, 22, 40, 0.8)',
        padding: [3, 6],
        borderRadius: 3
      },
      emphasis: {
        scale: true,
        itemStyle: {
          shadowBlur: 25,
          shadowColor: '#ffff00'
        }
      },
      data: subwayStationsData.map((station) => ({
        name: station.name,
        value: [
          station.coordinate[0],
          station.coordinate[1],
          station.isTransfer ? 1 : 0
        ],
        lines: station.lines,
        passengerFlow: station.passengerFlow,
        isTransfer: station.isTransfer
      }))
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
        devicePixelRatio: Math.min(window.devicePixelRatio, 2)
      });
      echarts.registerMap('beijing', beijingGeoJSON as any);
    }

    const chart = chartInstance.current;

    let series: any[] = [];

    if (mapMode === 'road') {
      series = [...roadSeriesConfig, ...roadEffectSeriesConfig];
    } else {
      series = [...subwaySeriesConfig, ...subwayEffectSeriesConfig, stationSeriesConfig];
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 600,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 800,
      animationEasingUpdate: 'cubicInOut',
      animationThreshold: 2000,
      progressive: 500,
      progressiveThreshold: 3000,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderColor: '#00f2ff',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff',
          fontSize: 13
        },
        hideDelay: 100,
        transitionDuration: 0.2,
        formatter: (params: any) => {
          if (params.seriesName === '地铁站') {
            const stationName = params.data.name || params.name;
            const lines = params.data.lines || [];
            const passengerFlow = params.data.passengerFlow || 0;
            const isTransfer = params.data.isTransfer;
            return `
              <div style="padding: 10px; min-width: 200px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #00f2ff; display: flex; align-items: center;">
                  <span>${stationName}</span>
                  ${isTransfer ? '<span style="margin-left: 8px; padding: 2px 8px; background: #ff6b6b; border-radius: 4px; font-size: 11px; color: #fff;">换乘站</span>' : ''}
                </div>
                <div style="margin-bottom: 6px;">
                  <div style="color: #aaa; font-size: 11px; margin-bottom: 4px;">途经线路</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    ${lines.map((line: string) => {
                      const lineData = subwayLinesData.find(l => l.name === line);
                      const color = lineData?.color || '#666';
                      return `<span style="padding: 2px 8px; background: ${color}; border-radius: 3px; font-size: 11px; color: #fff; font-weight: bold;">${line}</span>`;
                    }).join('')}
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #aaa; font-size: 11px;">日均客流</span>
                  <span style="color: #00ff88; font-weight: bold; font-size: 13px;">${(passengerFlow / 10000).toFixed(1)} 万人次</span>
                </div>
              </div>
            `;
          }
          if (params.data && params.data.value) {
            const { name, level, index, passengerFlow, status } = params.data.value;
            if (mapMode === 'road') {
              return `
                <div style="padding: 10px;">
                  <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #00f2ff;">
                    ${name}
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${congestionColors[level as CongestionLevel]}; margin-right: 8px;"></span>
                    <span style="font-size: 13px;">拥堵状态：${level}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #aaa; font-size: 11px;">拥堵指数</span>
                    <span style="color: #ffdd00; font-weight: bold; font-size: 13px;">${index}</span>
                  </div>
                </div>
              `;
            } else {
              const statusColor = status === '正常' ? '#00ff88' : status === '延误' ? '#ffdd00' : '#ff3333';
              return `
                <div style="padding: 10px;">
                  <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #00f2ff;">
                    ${name}
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor}; margin-right: 8px;"></span>
                    <span style="font-size: 13px;">运行状态：${status}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #aaa; font-size: 11px;">日均客流</span>
                    <span style="color: #00ff88; font-weight: bold; font-size: 13px;">${(passengerFlow / 10000).toFixed(1)} 万人次</span>
                  </div>
                </div>
              `;
            }
          }
          return '';
        }
      },
      geo: {
        map: 'beijing',
        roam: true,
        zoom: selectedDistrict && districtBounds[selectedDistrict] 
          ? districtBounds[selectedDistrict].zoom 
          : 1.0,
        center: selectedDistrict && districtBounds[selectedDistrict] 
          ? districtBounds[selectedDistrict].center 
          : [116.4074, 39.9200],
        scaleLimit: {
          min: 0.8,
          max: 5
        },
        itemStyle: {
          areaColor: '#0a1628',
          borderColor: '#00f2ff',
          borderWidth: 1.5,
          shadowColor: '#00f2ff',
          shadowBlur: 12,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        },
        emphasis: {
          itemStyle: {
            areaColor: '#1a3a5c',
            borderColor: '#00ffff',
            borderWidth: 2,
            shadowColor: '#00ffff',
            shadowBlur: 18
          },
          label: {
            show: true,
            color: '#00ffff',
            fontSize: 13,
            fontWeight: 'bold'
          }
        },
        label: {
          show: true,
          color: '#4fc3f7',
          fontSize: 11
        }
      },
      series: [
        {
          name: '北京市',
          type: 'map' as const,
          map: 'beijing',
          geoIndex: 0,
          data: [],
          silent: false
        },
        ...(series as any)
      ]
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      chart.setOption(option, {
        notMerge: true,
        lazyUpdate: false,
        silent: false,
        replaceMerge: ['geo']
      });
    });

    const handleMapClick = (params: any) => {
      if (mapMode === 'road') {
        // 处理geo地图区域点击
        const districtName = params.name;
        if (districtBounds[districtName]) {
          setSelectedDistrict(districtName);
        }
      }
    };

    chart.off('click');
    chart.on('click', handleMapClick);

    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        chartInstance.current?.resize();
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      chart.off('click', handleMapClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [mapMode, selectedDistrict, roadSeriesConfig, roadEffectSeriesConfig, subwaySeriesConfig, subwayEffectSeriesConfig, stationSeriesConfig]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  const renderLegend = () => {
    if (mapMode === 'road') {
      return (
        <div className="traffic-legend">
          <div className="legend-title">路况图例</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#00ff88' }}></span>
              <span>畅通</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffdd00' }}></span>
              <span>缓行</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff8800' }}></span>
              <span>拥堵</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff3333' }}></span>
              <span>严重拥堵</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="traffic-legend subway-legend">
          <div className="legend-title">地铁线路</div>
          <div className="legend-items">
            {subwayLinesData.map((subway) => (
              <div className="legend-item" key={subway.id}>
                <span className="legend-color" style={{ backgroundColor: subway.color }}></span>
                <span>{subway.name}</span>
                <span className={`legend-status ${subway.status === '正常' ? 'normal' : subway.status === '延误' ? 'delayed' : 'suspended'}`}>
                  {subway.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const handleResetView = useCallback(() => {
    setSelectedDistrict(null);
  }, []);

  return (
    <div className="traffic-map-container">
      <div ref={chartRef} className="map-chart"></div>
      {mapMode === 'road' && selectedDistrict && (
        <div className="reset-view-button" onClick={handleResetView}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>返回全景图</span>
        </div>
      )}
      {mapMode === 'road' && selectedDistrict && (
        <div className="district-name-badge">
          {districtBounds[selectedDistrict]?.name} - 主要道路
        </div>
      )}
      {renderLegend()}
    </div>
  );
};

export default TrafficMap;

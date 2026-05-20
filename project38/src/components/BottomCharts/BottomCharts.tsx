import React, { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import { HourlyTrafficData, DistrictTrafficData } from '../../data/mockData';
import './BottomCharts.css';

interface BottomChartsProps {
  hourlyData?: HourlyTrafficData[];
  districtData?: DistrictTrafficData[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
}

const BottomCharts: React.FC<BottomChartsProps> = ({
  hourlyData,
  districtData,
  autoRefresh = false,
  refreshInterval = 30000,
  onRefresh
}) => {
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartInstance = useRef<echarts.ECharts | null>(null);
  const barChartInstance = useRef<echarts.ECharts | null>(null);

  const initLineChart = useCallback(() => {
    if (!lineChartRef.current) return;

    const chart = echarts.init(lineChartRef.current);
    lineChartInstance.current = chart;

    const data = hourlyData || [];

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(13, 31, 60, 0.95)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: {
          color: '#e6f1ff',
          fontSize: 12
        },
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div style="padding: 4px 8px;">
              <div style="color: #00f5d4; margin-bottom: 4px;">${data.name}</div>
              <div>车流量: <span style="color: #00d4ff; font-weight: 600;">${data.value.toLocaleString()}</span> 辆</div>
            </div>
          `;
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        top: '12%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.hour),
        axisLine: {
          lineStyle: {
            color: '#1e4a7a'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8ab4e0',
          fontSize: 10,
          interval: 2
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8ab4e0',
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 10000) {
              return (value / 10000).toFixed(1) + 'w';
            }
            return value.toString();
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(30, 74, 122, 0.3)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '车流量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          data: data.map(item => item.flow),
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#00f5d4' },
              { offset: 0.5, color: '#00d4ff' },
              { offset: 1, color: '#0066ff' }
            ]),
            shadowColor: 'rgba(0, 212, 255, 0.5)',
            shadowBlur: 10
          },
          itemStyle: {
            color: '#00d4ff',
            borderColor: '#00f5d4',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.02)' }
            ])
          },
          emphasis: {
            scale: true,
            itemStyle: {
              shadowColor: 'rgba(0, 212, 255, 0.8)',
              shadowBlur: 20
            }
          },
          animationDuration: 2000,
          animationEasing: 'cubicOut'
        }
      ]
    };

    chart.setOption(option);

    chart.on('mouseover', () => {
      chart.setOption({
        series: [{
          showSymbol: true
        }]
      });
    });

    chart.on('mouseout', () => {
      chart.setOption({
        series: [{
          showSymbol: false
        }]
      });
    });
  }, [hourlyData]);

  const initBarChart = useCallback(() => {
    if (!barChartRef.current) return;

    const chart = echarts.init(barChartRef.current);
    barChartInstance.current = chart;

    const data = districtData || [];
    const colors = ['#00d4ff', '#00f5d4', '#0066ff', '#7b2cbf', '#4dc3ff', '#ffd700', '#ff6b6b', '#00ff88'];

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(13, 31, 60, 0.95)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: {
          color: '#e6f1ff',
          fontSize: 12
        },
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          const congestion = districtData?.find(d => d.district === data.name)?.congestion || 0;
          return `
            <div style="padding: 4px 8px;">
              <div style="color: #00f5d4; margin-bottom: 4px;">${data.name}</div>
              <div>车流量: <span style="color: #00d4ff; font-weight: 600;">${data.value.toLocaleString()}</span> 辆</div>
              <div>拥堵指数: <span style="color: #ffd700; font-weight: 600;">${congestion}</span></div>
            </div>
          `;
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        top: '12%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.district),
        axisLine: {
          lineStyle: {
            color: '#1e4a7a'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8ab4e0',
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8ab4e0',
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 10000) {
              return (value / 10000).toFixed(1) + 'w';
            }
            return value.toString();
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(30, 74, 122, 0.3)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '车流量',
          type: 'bar',
          barWidth: '50%',
          data: data.map((item, index) => ({
            value: item.flow,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[index % colors.length] },
                { offset: 1, color: colors[(index + 1) % colors.length] + '80' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          })),
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowColor: 'rgba(0, 212, 255, 0.6)',
              shadowBlur: 15
            }
          },
          animationDuration: 2000,
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 100
        }
      ]
    };

    chart.setOption(option);
  }, [districtData]);

  const refreshCharts = useCallback(() => {
    if (lineChartInstance.current && hourlyData) {
      lineChartInstance.current.setOption({
        series: [{
          data: hourlyData.map(item => item.flow)
        }]
      });
    }
    if (barChartInstance.current && districtData) {
      const colors = ['#00d4ff', '#00f5d4', '#0066ff', '#7b2cbf', '#4dc3ff', '#ffd700', '#ff6b6b', '#00ff88'];
      barChartInstance.current.setOption({
        series: [{
          data: districtData.map((item, index) => ({
            value: item.flow,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[index % colors.length] },
                { offset: 1, color: colors[(index + 1) % colors.length] + '80' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          }))
        }]
      });
    }
    onRefresh?.();
  }, [hourlyData, districtData, onRefresh]);

  useEffect(() => {
    initLineChart();
    initBarChart();

    const handleResize = () => {
      lineChartInstance.current?.resize();
      barChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      lineChartInstance.current?.dispose();
      barChartInstance.current?.dispose();
    };
  }, [initLineChart, initBarChart]);

  useEffect(() => {
    refreshCharts();
  }, [hourlyData, districtData, refreshCharts]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  return (
    <div className="bottom-charts">
      <div className="chart-container">
        <div className="chart-header">
          <div className="chart-title">
            <span className="chart-title-icon">📈</span>
            24小时交通流量趋势
          </div>
          <div className="chart-status">
            <span className="status-dot"></span>
            实时更新
          </div>
        </div>
        <div className="chart-body">
          <div ref={lineChartRef} className="chart-wrapper"></div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <div className="chart-title">
            <span className="chart-title-icon">📊</span>
            各行政区流量对比
          </div>
          <div className="chart-status">
            <span className="status-dot"></span>
            实时更新
          </div>
        </div>
        <div className="chart-body">
          <div ref={barChartRef} className="chart-wrapper"></div>
        </div>
      </div>
    </div>
  );
};

export default BottomCharts;

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { RankedProduct } from '../../types/product';

interface Props {
  products: RankedProduct[];
}

const props = defineProps<Props>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const dimensionNames: Record<string, string> = {
  costPerformance: '性价比',
  appearance: '外观设计',
  quality: '产品质量',
  functionality: '功能体验',
  reputation: '用户口碑'
};

const colors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6'
];

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const indicators = Object.keys(dimensionNames).map((key) => ({
    name: dimensionNames[key],
    max: 100
  }));

  const seriesData = props.products.map((product, index) => ({
    value: [
      product.scores.costPerformance,
      product.scores.appearance,
      product.scores.quality,
      product.scores.functionality,
      product.scores.reputation
    ],
    name: product.title.substring(0, 15) + '...',
    itemStyle: {
      color: colors[index % colors.length]
    },
    lineStyle: {
      color: colors[index % colors.length],
      width: 2
    },
    areaStyle: {
      color: colors[index % colors.length],
      opacity: 0.2
    }
  }));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: '#374151',
        fontSize: 13
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: props.products.map((p) => p.title.substring(0, 15) + '...'),
      textStyle: {
        color: '#6b7280',
        fontSize: 12
      },
      itemGap: 20
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      center: ['50%', '45%'],
      radius: '60%',
      axisName: {
        color: '#374151',
        fontSize: 13,
        fontWeight: 500
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.08)']
        }
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#d1d5db'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: seriesData,
        symbol: 'circle',
        symbolSize: 6,
        animationDuration: 1500,
        animationEasing: 'cubicInOut'
      }
    ]
  };

  chartInstance.setOption(option);
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

watch(
  () => props.products,
  () => {
    if (chartInstance) {
      chartInstance.dispose();
    }
    initChart();
  },
  { deep: true }
);
</script>

<template>
  <div class="w-full">
    <div ref="chartRef" class="w-full h-80 sm:h-96"></div>
  </div>
</template>

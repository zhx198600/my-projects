<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { ProductInfo } from '../../types/product';

interface Props {
  products: ProductInfo[];
}

const props = defineProps<Props>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const colors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6'
];

const parsePrice = (priceStr: string): number => {
  const match = priceStr.match(/[\d,.]+/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ''));
  }
  return 0;
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const productNames = props.products.map((p) => p.title.substring(0, 12) + '...');
  const prices = props.products.map((p) => parsePrice(p.price));
  const platforms = props.products.map((p) => p.platform === 'jd' ? '京东' : '天猫');

  const barColors = props.products.map((_, index) => colors[index % colors.length]);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: '#374151',
        fontSize: 13
      },
      formatter: (params: any) => {
        const data = params[0];
        const product = props.products[data.dataIndex];
        return `
          <div class="font-semibold mb-1">${product.title.substring(0, 20)}...</div>
          <div class="flex items-center gap-2">
            <span>平台:</span>
            <span class="font-medium">${platforms[data.dataIndex]}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>价格:</span>
            <span class="font-semibold text-red-500">${product.price}</span>
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: productNames,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        interval: 0,
        rotate: 30
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        formatter: '¥{value}'
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        data: prices.map((price, index) => ({
          value: price,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: barColors[index] },
              { offset: 1, color: barColors[index] + '80' }
            ]),
            borderRadius: [6, 6, 0, 0]
          }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '¥{c}',
          color: '#374151',
          fontSize: 12,
          fontWeight: 600
        },
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
    <div ref="chartRef" class="w-full h-72 sm:h-80"></div>
  </div>
</template>

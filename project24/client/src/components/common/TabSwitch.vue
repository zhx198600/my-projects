<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';

interface TabItem {
  key: string;
  label: string;
  icon?: string;
}

interface Props {
  tabs: TabItem[];
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeTab = ref(props.modelValue);
const tabRefs = ref<Record<string, HTMLElement>>({});
const indicatorStyle = ref({
  left: '0px',
  width: '0px'
});

const updateIndicator = async () => {
  await nextTick();
  const activeTabEl = tabRefs.value[activeTab.value];
  if (activeTabEl) {
    indicatorStyle.value = {
      left: activeTabEl.offsetLeft + 'px',
      width: activeTabEl.offsetWidth + 'px'
    };
  }
};

const selectTab = (key: string) => {
  activeTab.value = key;
  emit('update:modelValue', key);
};

watch(
  () => props.modelValue,
  (newValue) => {
    activeTab.value = newValue;
  }
);

watch(activeTab, () => {
  updateIndicator();
});

onMounted(() => {
  updateIndicator();
  window.addEventListener('resize', updateIndicator);
});
</script>

<template>
  <div class="relative">
    <div class="relative inline-flex sm:flex bg-slate-100/80 backdrop-blur-sm rounded-xl p-1.5 gap-1 w-full sm:w-auto overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        ref="(el) => { if (el) tabRefs[tab.key] = el }"
        @click="selectTab(tab.key)"
        :class="[
          'relative z-10 px-4 sm:px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-out flex items-center gap-2 whitespace-nowrap',
          activeTab === tab.key
            ? 'text-blue-700 bg-blue-100 shadow-lg shadow-blue-500/10'
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/60'
        ]"
      >
        <svg v-if="tab.icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="tab.icon === 'info'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path v-if="tab.icon === 'params'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          <path v-if="tab.icon === 'review'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          <path v-if="tab.icon === 'recommend'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>{{ tab.label }}</span>
      </button>

      <!-- 移除背景滑块，改为使用背景色方式 -->
    </div>

    <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent mt-1"></div>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>

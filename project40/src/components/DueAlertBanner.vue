<template>
  <div v-if="hasAlertTasks" class="mb-6">
    <div
      class="rounded-xl shadow-sm border overflow-hidden cursor-pointer select-none"
      :class="bannerClass"
      @click="expanded = !expanded"
    >
      <div class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ icon }}</span>
          <div>
            <div class="font-medium text-gray-800">{{ title }}</div>
            <div class="text-sm opacity-70">{{ subtitle }}</div>
          </div>
        </div>
        <span class="text-lg text-gray-500 transition-transform duration-200" :class="{ 'rotate-180': expanded }">▼</span>
      </div>
    </div>

    <div v-show="expanded" class="mt-2 space-y-2">
      <div
        v-for="task in alertTasks"
        :key="task.id"
        class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <button
          class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-green-100 hover:border-green-500 transition-colors"
          @click.stop="handleComplete(task)"
          title="标记为已完成"
        ></button>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="font-medium text-gray-800 truncate">{{ task.title }}</h4>
            <span
              v-if="getCategory(task.categoryId)"
              class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getCategory(task.categoryId).color + '20', color: getCategory(task.categoryId).color }"
            >
              <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getCategory(task.categoryId).color }"></span>
              {{ getCategory(task.categoryId).name }}
            </span>
          </div>
        </div>
        <span
          class="text-xs px-2 py-1 rounded-full flex-shrink-0"
          :class="getDueBadgeClass(task)"
        >{{ getDueLabel(task) }}</span>
        <div class="flex items-center gap-1 flex-shrink-0" @click.stop>
          <button
            class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
            @click="$emit('edit', task)"
            title="编辑"
          >✏️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isOverdue, isDueSoon, getDaysRemaining } from '../utils/dateUtils.js';

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['complete', 'edit']);

const expanded = ref(true);

const incompleteTasks = computed(() =>
  props.tasks.filter(t => t.status !== 'completed' && t.dueDate)
);

const overdueTasks = computed(() =>
  incompleteTasks.value.filter(t => isOverdue(t.dueDate))
);

const dueSoonTasks = computed(() =>
  incompleteTasks.value.filter(t => !isOverdue(t.dueDate) && isDueSoon(t.dueDate, 3))
);

const alertTasks = computed(() => [...overdueTasks.value, ...dueSoonTasks.value]);

const hasAlertTasks = computed(() => alertTasks.value.length > 0);

const overdueCount = computed(() => overdueTasks.value.length);
const dueSoonCount = computed(() => dueSoonTasks.value.length);

const bannerClass = computed(() => {
  if (overdueCount.value > 0) return 'bg-red-50 border-red-200';
  return 'bg-orange-50 border-orange-200';
});

const icon = computed(() => overdueCount.value > 0 ? '⚠️' : '🔔');

const title = computed(() => {
  if (overdueCount.value > 0 && dueSoonCount.value > 0) {
    return `${overdueCount.value} 个任务已逾期，${dueSoonCount.value} 个即将到期`;
  }
  if (overdueCount.value > 0) {
    return `${overdueCount.value} 个任务已逾期`;
  }
  return `${dueSoonCount.value} 个任务即将到期`;
});

const subtitle = computed(() => '点击展开/收起详情');

function getCategory(categoryId) {
  return props.categories.find(c => c.id === categoryId) || null;
}

function getDueLabel(task) {
  const days = getDaysRemaining(task.dueDate);
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  return `${days} 天后到期`;
}

function getDueBadgeClass(task) {
  if (isOverdue(task.dueDate)) return 'bg-red-100 text-red-600';
  return 'bg-orange-100 text-orange-600';
}

function handleComplete(task) {
  emit('complete', task);
}
</script>

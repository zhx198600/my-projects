<template>
  <div>
    <div
      v-if="showSelection"
      class="flex items-center justify-between bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 mb-3"
    >
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          :checked="allSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        />
        <span class="text-sm text-gray-700">
          全选
          <span class="text-gray-500">(已选 {{ selectedIds.length }} 个)</span>
        </span>
      </label>
    </div>

    <div v-if="sortedTasks.length === 0" class="text-center py-16">
      <div class="text-6xl mb-4">📋</div>
      <p class="text-gray-500 text-lg">暂无任务</p>
      <p class="text-gray-400 text-sm mt-1">点击上方按钮添加新任务</p>
    </div>

    <div
      v-else-if="viewMode === 'list'"
      class="space-y-3"
    >
      <TaskItem
        v-for="(task, index) in sortedTasks"
        :key="task.id"
        :task="task"
        :category="getCategory(task.categoryId)"
        :view-mode="viewMode"
        :selected="selectedIds.includes(task.id)"
        :show-checkbox="showSelection"
        :draggable="!showSelection"
        :index="index"
        @edit="(t) => $emit('edit', t)"
        @delete="(t) => $emit('delete', t)"
        @toggle-status="(t) => $emit('toggleStatus', t)"
        @select="(t, s) => $emit('select', t.id, s)"
        @drag-start="handleDragStart"
        @drag-over="handleDragOver"
        @drop="handleDrop"
        @drag-end="handleDragEnd"
      />
    </div>

    <div
      v-else
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    >
      <TaskItem
        v-for="(task, index) in sortedTasks"
        :key="task.id"
        :task="task"
        :category="getCategory(task.categoryId)"
        :view-mode="viewMode"
        :selected="selectedIds.includes(task.id)"
        :show-checkbox="showSelection"
        :draggable="!showSelection"
        :index="index"
        @edit="(t) => $emit('edit', t)"
        @delete="(t) => $emit('delete', t)"
        @toggle-status="(t) => $emit('toggleStatus', t)"
        @select="(t, s) => $emit('select', t.id, s)"
        @drag-start="handleDragStart"
        @drag-over="handleDragOver"
        @drop="handleDrop"
        @drag-end="handleDragEnd"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import TaskItem from './TaskItem.vue';
import { taskStore } from '../stores/taskStore.js';

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  viewMode: { type: String, default: 'list', validator: (v) => ['list', 'card'].includes(v) },
  selectedIds: { type: Array, default: () => [] },
  showSelection: { type: Boolean, default: false },
});

const emit = defineEmits(['edit', 'delete', 'toggleStatus', 'select', 'selectAll', 'reorder']);

const dragIndex = ref(null);

const sortedTasks = computed(() => {
  return [...props.tasks].sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });
});

const allSelected = computed(() => {
  if (sortedTasks.value.length === 0) return false;
  return sortedTasks.value.every((t) => props.selectedIds.includes(t.id));
});

const isIndeterminate = computed(() => {
  return props.selectedIds.length > 0 && !allSelected.value;
});

function getCategory(categoryId) {
  if (!categoryId) return null;
  return props.categories.find((c) => c.id === categoryId) || null;
}

function handleSelectAll(e) {
  emit('selectAll', e.target.checked);
}

function handleDragStart(index) {
  dragIndex.value = index;
}

function handleDragOver(e, index) {
  e.preventDefault();
  if (dragIndex.value === null || dragIndex.value === index) return;
}

function handleDrop(targetIndex) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return;
  const reordered = taskStore.reorderTasks(dragIndex.value, targetIndex);
  emit('reorder', reordered);
  dragIndex.value = null;
}

function handleDragEnd() {
  dragIndex.value = null;
}
</script>

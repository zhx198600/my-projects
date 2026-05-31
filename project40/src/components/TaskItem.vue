<template>
  <div
    v-if="viewMode === 'list'"
    class="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
    :class="[rowClass, { 'opacity-50': isDragging, 'border-indigo-400 border-2': isDragOver }]"
    :draggable="draggable"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @dragend="onDragEnd"
    @click="handleToggleStatus"
  >
    <span
      v-if="draggable"
      class="text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 select-none"
      @click.stop
    >⠿</span>
    <label
      v-if="showCheckbox"
      class="flex-shrink-0 flex items-center cursor-pointer"
      @click.stop
    >
      <input
        type="checkbox"
        class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        :checked="selected"
        @change="toggleSelect"
      />
    </label>
    <button
      class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
      :class="statusCheckboxClass"
    >
      <span v-if="task.status === 'completed'" class="text-white text-xs">✓</span>
    </button>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h3
          class="font-medium text-gray-800 truncate"
          :class="{ 'line-through text-gray-400': task.status === 'completed' }"
        >{{ task.title }}</h3>
        <span
          v-if="category"
          class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          :style="{ backgroundColor: category.color + '20', color: category.color }"
        >
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: category.color }"></span>
          {{ category.name }}
        </span>
        <span
          class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          :class="priorityClass"
        >{{ priorityLabel }}</span>
      </div>
      <p
        v-if="task.description"
        class="text-sm text-gray-500 truncate"
        :class="{ 'line-through': task.status === 'completed' }"
      >{{ task.description }}</p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <span
        v-if="showDueIndicator"
        class="text-xs"
        :class="dueClass"
      >{{ dueEmoji }} {{ dueLabel }}</span>
      <span
        class="text-xs px-2 py-1 rounded-full"
        :class="statusBadgeClass"
      >{{ statusLabel }}</span>
      <div class="flex items-center gap-1" @click.stop>
        <button
          class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
          @click="$emit('edit', task)"
          title="编辑"
        >✏️</button>
        <button
          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          @click="$emit('delete', task)"
          title="删除"
        >🗑️</button>
      </div>
    </div>
  </div>

  <div
    v-else
    class="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col group"
    :class="[rowClass, { 'opacity-50': isDragging, 'border-indigo-400 border-2': isDragOver }]"
    :draggable="draggable"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @dragend="onDragEnd"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span
          v-if="draggable"
          class="text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 select-none"
          @click.stop
        >⠿</span>
        <label
          v-if="showCheckbox"
          class="flex-shrink-0 flex items-center cursor-pointer"
          @click.stop
        >
          <input
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            :checked="selected"
            @change="toggleSelect"
          />
        </label>
        <button
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
          :class="statusCheckboxClass"
          @click="handleToggleStatus"
        >
          <span v-if="task.status === 'completed'" class="text-white text-xs">✓</span>
        </button>
        <h3
          class="font-medium text-gray-800 truncate"
          :class="{ 'line-through text-gray-400': task.status === 'completed' }"
        >{{ task.title }}</h3>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0" @click.stop>
        <button
          class="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
          @click="$emit('edit', task)"
          title="编辑"
        >✏️</button>
        <button
          class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          @click="$emit('delete', task)"
          title="删除"
        >🗑️</button>
      </div>
    </div>
    <p
      v-if="task.description"
      class="text-sm text-gray-500 mb-3 line-clamp-2"
      :class="{ 'line-through': task.status === 'completed' }"
    >{{ task.description }}</p>
    <div class="flex flex-wrap gap-2 mt-auto">
      <span
        v-if="category"
        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
        :style="{ backgroundColor: category.color + '20', color: category.color }"
      >
        <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: category.color }"></span>
        {{ category.name }}
      </span>
      <span
        class="text-xs px-2 py-1 rounded-full"
        :class="priorityClass"
      >{{ priorityLabel }}</span>
      <span
        v-if="showDueIndicator"
        class="text-xs px-2 py-1 rounded-full"
        :class="dueBadgeClass"
      >{{ dueEmoji }} {{ dueLabel }}</span>
      <span
        class="text-xs px-2 py-1 rounded-full"
        :class="statusBadgeClass"
      >{{ statusLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { isOverdue, isDueSoon, getDaysRemaining } from '../utils/dateUtils.js';

const props = defineProps({
  task: { type: Object, required: true },
  category: { type: Object, default: null },
  viewMode: { type: String, default: 'list', validator: (v) => ['list', 'card'].includes(v) },
  selected: { type: Boolean, default: false },
  showCheckbox: { type: Boolean, default: false },
  draggable: { type: Boolean, default: true },
  index: { type: Number, default: -1 },
});

const emit = defineEmits(['edit', 'delete', 'toggleStatus', 'select', 'dragStart', 'dragOver', 'drop', 'dragEnd']);

const isDragging = ref(false);
const isDragOver = ref(false);

const rowClass = computed(() => ({
  'opacity-60': props.task.status === 'completed',
  'bg-indigo-50 border-indigo-200': props.selected,
}));

const statusLabel = computed(() => {
  const map = { todo: '待办', 'in-progress': '进行中', completed: '已完成' };
  return map[props.task.status] || props.task.status;
});

const priorityLabel = computed(() => {
  const map = { low: '低', medium: '中', high: '高' };
  return map[props.task.priority] || props.task.priority;
});

const priorityClass = computed(() => {
  const map = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };
  return map[props.task.priority] || 'bg-gray-100 text-gray-700';
});

const statusCheckboxClass = computed(() => {
  if (props.task.status === 'completed') return 'bg-green-500 border-green-500';
  if (props.task.status === 'in-progress') return 'border-blue-500';
  return 'border-gray-300';
});

const statusBadgeClass = computed(() => {
  const map = {
    todo: 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-100 text-blue-600',
    completed: 'bg-green-100 text-green-600',
  };
  return map[props.task.status] || 'bg-gray-100 text-gray-600';
});

const showDueIndicator = computed(() => {
  return props.task.dueDate && props.task.status !== 'completed';
});

const dueStatus = computed(() => {
  if (!showDueIndicator.value) return null;
  if (isOverdue(props.task.dueDate)) return 'overdue';
  if (isDueSoon(props.task.dueDate, 3)) return 'dueSoon';
  return 'normal';
});

const dueLabel = computed(() => {
  const date = new Date(props.task.dueDate);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const hasTime = props.task.dueDate && props.task.dueDate.includes('T') && props.task.dueDate.length > 11;
  const dateStr = hasTime ? `${y}-${m}-${d} ${h}:${min}` : `${y}-${m}-${d}`;

  if (dueStatus.value === 'overdue') {
    const days = getDaysRemaining(props.task.dueDate);
    return `${dateStr} · 已逾期${Math.abs(days)}天`;
  }
  if (dueStatus.value === 'dueSoon') {
    const days = getDaysRemaining(props.task.dueDate);
    if (days === 0) return `${dateStr} · 今天到期`;
    return `${dateStr} · ${days}天后到期`;
  }
  return dateStr;
});

const dueEmoji = computed(() => {
  if (dueStatus.value === 'overdue') return '⚠️';
  if (dueStatus.value === 'dueSoon') return '🔔';
  return '📅';
});

const dueClass = computed(() => {
  if (dueStatus.value === 'overdue') return 'text-red-500 font-medium';
  if (dueStatus.value === 'dueSoon') return 'text-orange-500 font-medium';
  return 'text-gray-400';
});

const dueBadgeClass = computed(() => {
  if (dueStatus.value === 'overdue') return 'bg-red-100 text-red-600';
  if (dueStatus.value === 'dueSoon') return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
});

function handleToggleStatus() {
  if (props.showCheckbox) return;
  emit('toggleStatus', props.task);
}

function toggleSelect(e) {
  emit('select', props.task, e.target.checked);
}

function onDragStart(e) {
  if (!props.draggable) return;
  isDragging.value = true;
  e.dataTransfer.effectAllowed = 'move';
  emit('dragStart', props.index);
}

function onDragOver(e) {
  if (!props.draggable) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  isDragOver.value = true;
  emit('dragOver', e, props.index);
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDrop(e) {
  if (!props.draggable) return;
  e.preventDefault();
  isDragOver.value = false;
  emit('drop', props.index);
}

function onDragEnd() {
  isDragging.value = false;
  isDragOver.value = false;
  emit('dragEnd');
}
</script>

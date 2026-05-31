<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50">
      <div
        class="absolute inset-0 bg-black/40 transition-opacity"
        @click="handleClose"
      ></div>
      <div class="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800">分类管理</h2>
          <button
            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            @click="handleClose"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4">
          <ul v-if="categories.length > 0" class="space-y-2">
            <li
              v-for="cat in categories"
              :key="cat.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span
                class="w-4 h-4 rounded-full flex-shrink-0"
                :style="{ backgroundColor: cat.color }"
              ></span>
              <template v-if="editingId === cat.id">
                <input
                  v-model="editName"
                  type="text"
                  class="flex-1 min-w-0 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  @keyup.enter="saveEdit"
                  @keyup.esc="cancelEdit"
                />
              </template>
              <template v-else>
                <span class="flex-1 min-w-0 truncate text-sm font-medium text-gray-800">
                  {{ cat.name }}
                </span>
                <span class="text-xs text-gray-400 flex-shrink-0">
                  {{ getTaskCount(cat.id) }} 个任务
                </span>
              </template>
              <template v-if="editingId === cat.id">
                <button
                  class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="保存"
                  @click="saveEdit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                  title="取消"
                  @click="cancelEdit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </template>
              <template v-else>
                <button
                  class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="编辑"
                  @click="startEdit(cat)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="删除"
                  @click="requestDelete(cat)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 012 2v2H8V5a2 2 0 012-2z" />
                  </svg>
                </button>
              </template>
            </li>
            <li v-if="editingId" class="px-3 pt-2">
              <p class="text-xs text-gray-500 mb-2">选择颜色：</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in palette"
                  :key="color"
                  type="button"
                  class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  :class="editColor === color ? 'border-gray-800 scale-110' : 'border-transparent'"
                  :style="{ backgroundColor: color }"
                  @click="editColor = color"
                ></button>
              </div>
            </li>
          </ul>
          <div v-else class="text-center text-gray-400 py-12 text-sm">
            暂无分类，请添加
          </div>
        </div>

        <div class="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <p class="text-sm font-medium text-gray-700 mb-2">添加新分类</p>
          <div class="flex items-center gap-2 mb-3">
            <input
              v-model="newName"
              type="text"
              placeholder="分类名称"
              class="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              @keyup.enter="handleAdd"
            />
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!newName.trim()"
              @click="handleAdd"
            >添加</button>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">选择颜色：</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in palette"
                :key="color"
                type="button"
                class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                :class="newColor === color ? 'border-gray-800 scale-110' : 'border-transparent'"
                :style="{ backgroundColor: color }"
                @click="newColor = color"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="deleteDialog.visible"
      :title="deleteDialog.title"
      :message="deleteDialog.message"
      type="danger"
      confirm-text="删除"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { categoryStore } from '../stores/categoryStore.js';
import { taskStore } from '../stores/taskStore.js';

const props = defineProps({
  visible: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'update']);

const palette = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
];

const newName = ref('');
const newColor = ref('#3B82F6');

const editingId = ref(null);
const editName = ref('');
const editColor = ref('#3B82F6');

const deleteDialog = ref({
  visible: false,
  title: '',
  message: '',
  id: null,
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetForm();
    }
  }
);

function resetForm() {
  newName.value = '';
  newColor.value = palette[4];
  editingId.value = null;
  editName.value = '';
}

function getTaskCount(categoryId) {
  const tasks = taskStore.getTasks();
  return tasks.filter((t) => t.categoryId === categoryId).length;
}

function handleClose() {
  emit('close');
}

function notifyUpdate() {
  emit('update', categoryStore.getCategories());
}

function handleAdd() {
  const name = newName.value.trim();
  if (!name) return;
  categoryStore.addCategory({ name, color: newColor.value });
  newName.value = '';
  newColor.value = palette[4];
  notifyUpdate();
}

function startEdit(cat) {
  editingId.value = cat.id;
  editName.value = cat.name;
  editColor.value = cat.color;
}

function saveEdit() {
  if (!editingId.value) return;
  const name = editName.value.trim();
  if (!name) return;
  categoryStore.updateCategory(editingId.value, { name, color: editColor.value });
  editingId.value = null;
  editName.value = '';
  notifyUpdate();
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
}

function requestDelete(cat) {
  const count = getTaskCount(cat.id);
  deleteDialog.value = {
    visible: true,
    title: '删除分类',
    message: count > 0
      ? `确定删除分类"${cat.name}"吗？该分类下的 ${count} 个任务将被设为未分类。`
      : `确定删除分类"${cat.name}"吗？`,
    id: cat.id,
  };
}

function confirmDelete() {
  if (deleteDialog.value.id) {
    categoryStore.deleteCategory(deleteDialog.value.id);
  }
  cancelDeleteDialog();
  notifyUpdate();
}

function cancelDeleteDialog() {
  deleteDialog.value = {
    visible: false,
    title: '',
    message: '',
    id: null,
  };
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-indigo-600 mb-1">任务管理</h1>
        <p class="text-gray-500">管理你的任务，保持高效</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="text-sm text-gray-500">
            显示 <span class="font-medium text-gray-800">{{ filteredTasks.length }}</span> / 共 <span class="font-medium text-gray-800">{{ tasks.length }}</span> 个任务
            <span v-if="showSelection" class="ml-2 text-indigo-600">已选 {{ selectedIds.length }} 个</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="showSelection && selectedIds.length > 0"
              class="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              @click="requestBatchDelete"
            >🗑️ 删除</button>
            <button
              class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="showSelection ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="toggleSelectionMode"
            >{{ showSelection ? '✓ 选择' : '☐ 选择' }}</button>
            <button
              class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              @click="openCreateForm"
            >+ 新建</button>
            <button
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              @click="categoryManagerVisible = true"
            >🏷️ 分类</button>
            <div class="relative" ref="exportMenuRef">
              <button
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                @click.stop="exportMenuVisible = !exportMenuVisible"
              >📤 导出
                <svg class="w-4 h-4 transition-transform" :class="exportMenuVisible ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div
                v-if="exportMenuVisible"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
              >
                <div class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">导出范围</div>
                <label class="flex items-center px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    v-model="exportScope"
                    value="all"
                    class="mr-2 text-indigo-600 focus:ring-indigo-500"
                  >
                  全部任务
                </label>
                <label class="flex items-center px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    v-model="exportScope"
                    value="filtered"
                    class="mr-2 text-indigo-600 focus:ring-indigo-500"
                  >
                  筛选后的任务
                </label>
                <div class="border-t border-gray-100 my-1"></div>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  @click="handleExportJSON"
                >
                  <span>📋</span> 导出为 JSON
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  @click="handleExportCSV"
                >
                  <span>📊</span> 导出为 CSV
                </button>
              </div>
            </div>
            <button
              class="px-3 py-2 text-sm rounded-lg transition-colors"
              :class="viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'"
              @click="viewMode = 'list'"
            >📋</button>
            <button
              class="px-3 py-2 text-sm rounded-lg transition-colors"
              :class="viewMode === 'card' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'"
              @click="viewMode = 'card'"
            >🔲</button>
          </div>
        </div>
      </div>

      <FilterBar
        :categories="categories"
        :filters="filters"
        @update:filters="handleFiltersUpdate"
      />

      <DueAlertBanner
        :tasks="tasks"
        :categories="categories"
        @complete="handleAlertComplete"
        @edit="handleEdit"
      />

      <TaskList
        :tasks="filteredTasks"
        :categories="categories"
        :view-mode="viewMode"
        :selected-ids="selectedIds"
        :show-selection="showSelection"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-status="handleToggleStatus"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @reorder="handleReorder"
      />

      <TaskForm
        :visible="formVisible"
        :task="editingTask"
        :categories="categories"
        @close="closeForm"
        @submit="handleFormSubmit"
      />

      <ConfirmDialog
        :visible="deleteDialog.visible"
        :title="deleteDialog.title"
        :message="deleteDialog.message"
        type="danger"
        confirm-text="删除"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />

      <CategoryManager
        :visible="categoryManagerVisible"
        :categories="categories"
        @close="categoryManagerVisible = false"
        @update="handleCategoriesUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import TaskList from './components/TaskList.vue';
import TaskForm from './components/TaskForm.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import FilterBar from './components/FilterBar.vue';
import CategoryManager from './components/CategoryManager.vue';
import DueAlertBanner from './components/DueAlertBanner.vue';
import { taskStore } from './stores/taskStore.js';
import { categoryStore } from './stores/categoryStore.js';
import { exportToJSON, exportToCSV, getExportFilename } from './utils/exportUtils.js';

const tasks = ref([]);
const categories = ref([]);
const viewMode = ref('list');
const formVisible = ref(false);
const editingTask = ref(null);
const showSelection = ref(false);
const selectedIds = ref([]);
const categoryManagerVisible = ref(false);
const exportMenuVisible = ref(false);
const exportScope = ref('all');
const exportMenuRef = ref(null);

const filters = reactive({
  categoryId: null,
  status: null,
  priority: null,
  keyword: '',
});

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      if (
        !task.title.toLowerCase().includes(kw) &&
        !(task.description || '').toLowerCase().includes(kw)
      ) {
        return false;
      }
    }
    if (filters.categoryId && task.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    return true;
  });
});

watch(filters, () => {
  selectedIds.value = [];
});

const deleteDialog = reactive({
  visible: false,
  title: '',
  message: '',
  mode: null,
  payload: null,
});

onMounted(() => {
  loadData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function handleClickOutside(e) {
  if (exportMenuRef.value && !exportMenuRef.value.contains(e.target)) {
    exportMenuVisible.value = false;
  }
}

function loadData() {
  tasks.value = taskStore.getTasks();
  categories.value = categoryStore.getCategories();
}

function handleFiltersUpdate(newFilters) {
  Object.assign(filters, newFilters);
}

function handleCategoriesUpdate(updatedCategories) {
  categories.value = updatedCategories;
  tasks.value = taskStore.getTasks();
}

function toggleSelectionMode() {
  showSelection.value = !showSelection.value;
  if (!showSelection.value) {
    selectedIds.value = [];
  }
}

function handleSelect(taskId, selected) {
  if (selected) {
    if (!selectedIds.value.includes(taskId)) {
      selectedIds.value.push(taskId);
    }
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== taskId);
  }
}

function handleSelectAll(selected) {
  if (selected) {
    selectedIds.value = filteredTasks.value.map((t) => t.id);
  } else {
    selectedIds.value = [];
  }
}

function handleEdit(task) {
  editingTask.value = task;
  formVisible.value = true;
}

function openCreateForm() {
  editingTask.value = null;
  formVisible.value = true;
}

function closeForm() {
  formVisible.value = false;
  editingTask.value = null;
}

function handleFormSubmit(taskData) {
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, taskData);
  } else {
    taskStore.addTask(taskData);
  }
  tasks.value = taskStore.getTasks();
  closeForm();
}

function handleReorder(reorderedTasks) {
  tasks.value = reorderedTasks;
}

function handleDelete(task) {
  deleteDialog.visible = true;
  deleteDialog.title = '删除任务';
  deleteDialog.message = `确定删除任务"${task.title}"吗？此操作不可撤销。`;
  deleteDialog.mode = 'single';
  deleteDialog.payload = { id: task.id };
}

function requestBatchDelete() {
  const count = selectedIds.value.length;
  deleteDialog.visible = true;
  deleteDialog.title = '批量删除任务';
  deleteDialog.message = `确定删除选中的 ${count} 个任务吗？此操作不可撤销。`;
  deleteDialog.mode = 'batch';
  deleteDialog.payload = { ids: [...selectedIds.value] };
}

function confirmDelete() {
  if (deleteDialog.mode === 'single' && deleteDialog.payload) {
    taskStore.deleteTask(deleteDialog.payload.id);
  } else if (deleteDialog.mode === 'batch' && deleteDialog.payload) {
    deleteDialog.payload.ids.forEach((id) => taskStore.deleteTask(id));
    selectedIds.value = [];
    showSelection.value = false;
  }
  tasks.value = taskStore.getTasks();
  cancelDelete();
}

function cancelDelete() {
  deleteDialog.visible = false;
  deleteDialog.title = '';
  deleteDialog.message = '';
  deleteDialog.mode = null;
  deleteDialog.payload = null;
}

function handleToggleStatus(task) {
  const statusOrder = ['todo', 'in-progress', 'completed'];
  const currentIndex = statusOrder.indexOf(task.status);
  const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
  taskStore.updateTask(task.id, { status: nextStatus });
  tasks.value = taskStore.getTasks();
}

function handleAlertComplete(task) {
  taskStore.updateTask(task.id, { status: 'completed' });
  tasks.value = taskStore.getTasks();
}

function handleExportJSON() {
  const targetTasks = exportScope.value === 'all' ? tasks.value : filteredTasks.value;
  exportToJSON(targetTasks, categories.value, getExportFilename('json'));
  exportMenuVisible.value = false;
}

function handleExportCSV() {
  const targetTasks = exportScope.value === 'all' ? tasks.value : filteredTasks.value;
  exportToCSV(targetTasks, categories.value, getExportFilename('csv'));
  exportMenuVisible.value = false;
}
</script>

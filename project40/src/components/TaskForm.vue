<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/50"
        @click="handleClose"
      ></div>

      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4
               sm:mx-auto sm:rounded-xl
               max-h-[90vh] overflow-hidden flex flex-col"
        @click.stop
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ isEdit ? '编辑任务' : '新建任务' }}
          </h2>
          <button
            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            @click="handleClose"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="flex-1 overflow-y-auto px-6 py-5 space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              标题 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              :class="titleError ? 'border-red-400' : 'border-gray-200'"
              placeholder="请输入任务标题"
            />
            <p v-if="titleError" class="mt-1 text-xs text-red-500">{{ titleError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              描述
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="请输入任务描述（可选）"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              分类
            </label>
            <select
              v-model="formData.categoryId"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option :value="null">无分类</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              截止日期
            </label>
            <div class="flex gap-2">
              <input
                v-model="formData.dueDate"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <input
                v-model="formData.dueTime"
                type="time"
                class="w-28 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              优先级
            </label>
            <div class="flex gap-2">
              <button
                v-for="p in priorityOptions"
                :key="p.value"
                type="button"
                class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                :class="formData.priority === p.value
                  ? [p.activeClass, 'border-transparent']
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
                @click="formData.priority = p.value"
              >{{ p.label }}</button>
            </div>
          </div>
        </form>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            @click="handleClose"
          >取消</button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            @click="handleSubmit"
          >{{ isEdit ? '保存修改' : '创建任务' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'submit']);

const priorityOptions = [
  { value: 'high', label: '高', activeClass: 'bg-red-100 text-red-700' },
  { value: 'medium', label: '中', activeClass: 'bg-yellow-100 text-yellow-700' },
  { value: 'low', label: '低', activeClass: 'bg-green-100 text-green-700' },
];

const defaultForm = () => ({
  title: '',
  description: '',
  categoryId: null,
  dueDate: '',
  dueTime: '23:59',
  priority: 'medium',
});

const formData = ref(defaultForm());
const titleError = ref('');

const isEdit = computed(() => props.task !== null);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetForm();
      if (props.task) {
        const dateStr = props.task.dueDate ? props.task.dueDate.substring(0, 10) : '';
        const timeStr = props.task.dueDate && props.task.dueDate.length > 10 
          ? props.task.dueDate.substring(11, 16) 
          : '23:59';
        formData.value = {
          title: props.task.title || '',
          description: props.task.description || '',
          categoryId: props.task.categoryId ?? null,
          dueDate: dateStr,
          dueTime: timeStr,
          priority: props.task.priority || 'medium',
        };
      }
    }
  }
);

function resetForm() {
  formData.value = defaultForm();
  titleError.value = '';
}

function handleClose() {
  emit('close');
}

function handleSubmit() {
  titleError.value = '';

  if (!formData.value.title.trim()) {
    titleError.value = '标题不能为空';
    return;
  }

  let dueDateTime = null;
  if (formData.value.dueDate) {
    const time = formData.value.dueTime || '23:59';
    dueDateTime = `${formData.value.dueDate}T${time}:00`;
  }

  const submitData = {
    title: formData.value.title.trim(),
    description: formData.value.description.trim(),
    categoryId: formData.value.categoryId || null,
    dueDate: dueDateTime,
    priority: formData.value.priority,
  };

  emit('submit', submitData);
}
</script>

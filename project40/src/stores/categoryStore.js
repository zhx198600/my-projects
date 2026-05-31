import storage from '../utils/storage.js';
import taskStore from './taskStore.js';

const STORAGE_KEY = 'categories';

const DEFAULT_CATEGORIES = [
  { id: 'default-1', name: '工作', color: '#3B82F6', createdAt: new Date().toISOString() },
  { id: 'default-2', name: '生活', color: '#22C55E', createdAt: new Date().toISOString() },
  { id: 'default-3', name: '学习', color: '#8B5CF6', createdAt: new Date().toISOString() },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() {
  return new Date().toISOString();
}

function readAll() {
  const data = storage.get(STORAGE_KEY, null);
  if (data === null || data.length === 0) {
    storage.set(STORAGE_KEY, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return data;
}

function writeAll(categories) {
  storage.set(STORAGE_KEY, categories);
}

export const categoryStore = {
  getCategories() {
    return readAll();
  },

  getCategoryById(id) {
    return readAll().find((c) => c.id === id) || null;
  },

  addCategory(category) {
    const categories = readAll();
    const record = {
      id: generateId(),
      name: category.name || '',
      color: category.color || '#6B7280',
      createdAt: now(),
    };
    categories.push(record);
    writeAll(categories);
    return record;
  },

  updateCategory(id, updates) {
    const categories = readAll();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    categories[index] = {
      ...categories[index],
      name: updates.name ?? categories[index].name,
      color: updates.color ?? categories[index].color,
    };
    writeAll(categories);
    return categories[index];
  },

  deleteCategory(id) {
    const categories = readAll();
    const filtered = categories.filter((c) => c.id !== id);
    writeAll(filtered);
    const tasks = taskStore.getTasks();
    tasks.forEach((task) => {
      if (task.categoryId === id) {
        taskStore.updateTask(task.id, { categoryId: null });
      }
    });
    return filtered.length !== categories.length;
  },
};

export default categoryStore;

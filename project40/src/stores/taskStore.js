import storage from '../utils/storage.js';

export const STATUS_LIST = ['todo', 'in-progress', 'completed'];
export const PRIORITY_LIST = ['low', 'medium', 'high'];
export const PRIORITY_ORDER = { low: 1, medium: 2, high: 3 };

const STORAGE_KEY = 'tasks';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() {
  return new Date().toISOString();
}

function readAll() {
  return storage.get(STORAGE_KEY, []);
}

function writeAll(tasks) {
  storage.set(STORAGE_KEY, tasks);
}

export const taskStore = {
  getTasks() {
    return readAll();
  },

  getTaskById(id) {
    return readAll().find((t) => t.id === id) || null;
  },

  addTask(task) {
    const tasks = readAll();
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order || 0), 0);
    const record = {
      id: generateId(),
      title: task.title || '',
      description: task.description || '',
      categoryId: task.categoryId ?? null,
      dueDate: task.dueDate || null,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      order: maxOrder + 1,
      createdAt: now(),
      updatedAt: now(),
    };
    tasks.push(record);
    writeAll(tasks);
    return record;
  },

  updateTask(id, updates) {
    const tasks = readAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const { id: _id, createdAt: _c, ...safeUpdates } = updates;
    tasks[index] = {
      ...tasks[index],
      ...safeUpdates,
      id: tasks[index].id,
      createdAt: tasks[index].createdAt,
      updatedAt: now(),
    };
    writeAll(tasks);
    return tasks[index];
  },

  reorderTasks(fromIndex, toIndex) {
    const tasks = readAll();
    const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const [removed] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, removed);
    const reordered = sorted.map((t, idx) => ({ ...t, order: idx + 1 }));
    writeAll(reordered);
    return reordered;
  },

  deleteTask(id) {
    const tasks = readAll();
    const filtered = tasks.filter((t) => t.id !== id);
    writeAll(filtered);
    return filtered.length !== tasks.length;
  },

  deleteTasks(ids) {
    const idSet = new Set(ids);
    const tasks = readAll();
    const filtered = tasks.filter((t) => !idSet.has(t.id));
    writeAll(filtered);
    return tasks.length - filtered.length;
  },
};

export default taskStore;

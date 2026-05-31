const PREFIX = 'todo-app:';

export const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error('[storage] get error:', key, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[storage] set error:', key, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch (e) {
      console.error('[storage] remove error:', key, e);
      return false;
    }
  },
};

export default storage;

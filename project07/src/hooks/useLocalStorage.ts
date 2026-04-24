import { useState, useEffect, useCallback } from 'react';

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isLocalStorageAvailable()) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      const item = localStorage.getItem(key);
      const currentValue = item ? JSON.parse(item) as T : null;
      if (currentValue !== null && JSON.stringify(currentValue) !== JSON.stringify(storedValue)) {
        setStoredValue(currentValue);
      }
    } catch {
      // ignore parse errors
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (isLocalStorageAvailable()) {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // ignore errors
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

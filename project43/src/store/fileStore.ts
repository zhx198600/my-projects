import { create } from 'zustand';
import type { FileSystemItem, FolderBreadcrumb } from '@shared/types';

type ViewMode = 'list' | 'grid';
type SortBy = 'name' | 'created_at' | 'size';
type SortOrder = 'asc' | 'desc';

interface FileState {
  items: FileSystemItem[];
  currentFolderId: string | null;
  breadcrumb: FolderBreadcrumb[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedItems: string[];
  isLoading: boolean;
  setItems: (items: FileSystemItem[]) => void;
  setCurrentFolderId: (id: string | null) => void;
  setBreadcrumb: (breadcrumb: FolderBreadcrumb[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSelectItem: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setIsLoading: (loading: boolean) => void;
  addItem: (item: FileSystemItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<FileSystemItem>) => void;
  removeItems: (ids: string[]) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  items: [],
  currentFolderId: null,
  breadcrumb: [],
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  selectedItems: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  setCurrentFolderId: (id) => set({ currentFolderId: id }),
  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSelectItem: (id) =>
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    })),
  clearSelection: () => set({ selectedItems: [] }),
  selectAll: () =>
    set((state) => ({
      selectedItems: state.items.map((item) => item.id),
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeItems: (ids) =>
    set((state) => ({
      items: state.items.filter((item) => !ids.includes(item.id)),
    })),
}));

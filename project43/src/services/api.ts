import { useAuthStore } from '@/store/authStore';
import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  FileListResponse,
  FileSystemItem,
  StorageInfo,
  FileUploadResponse,
  UploadedFile,
  FolderBreadcrumb,
  PreviewType,
  FilePreviewInfo,
  Share,
  ShareCreateRequest,
  ShareAccessResponse,
  RenameRequest,
  MoveRequest,
} from '@shared/types';

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }
      throw new Error(data.error || data.message || '请求失败');
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络错误');
  }
}

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (
    username: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  logout: (): Promise<void> =>
    request('/auth/logout', {
      method: 'POST',
    }),
};

export const userApi = {
  getStorageInfo: (): Promise<StorageInfo> =>
    request('/user/storage', {
      method: 'GET',
    }),
};

const getPreviewType = (mimeType: string): PreviewType => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  return 'unsupported';
};

const buildPreviewUrl = (id: string): string => {
  const token = useAuthStore.getState().token;
  return `${BASE_URL}/files/${id}/preview?token=${encodeURIComponent(token || '')}`;
};

export const fileApi = {
  getFiles: (
    parentId: string | null = null,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): Promise<FileListResponse> => {
    const params = new URLSearchParams();
    if (parentId) params.append('parentId', parentId);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    return request(`/files?${params.toString()}`, {
      method: 'GET',
    });
  },

  getBreadcrumb: (folderId: string | null): Promise<FolderBreadcrumb[]> => {
    if (!folderId) return Promise.resolve([]);
    return request(`/folders/${folderId}/breadcrumb`, {
      method: 'GET',
    });
  },

  uploadFile: (
    file: File,
    parentId: string | null = null,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append('files', file);
      if (parentId) {
        formData.append('parentId', parentId);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/files/upload`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as ApiResponse<FileUploadResponse>;
          if (xhr.status >= 200 && xhr.status < 300 && data.success && data.data?.files?.length > 0) {
            resolve(data.data.files[0]);
          } else {
            reject(new Error(data.error || data.message || '上传失败'));
          }
        } catch {
          reject(new Error('上传失败'));
        }
      };

      xhr.onerror = () => reject(new Error('网络错误'));
      xhr.send(formData);
    });
  },

  createFolder: (
    name: string,
    parentId: string | null = null
  ): Promise<FileSystemItem> =>
    request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    }),

  deleteItem: (id: string, type: 'file' | 'folder' = 'file'): Promise<void> =>
    request(`/${type === 'folder' ? 'folders' : 'files'}/${id}`, {
      method: 'DELETE',
    }),

  downloadFile: async (id: string, filename?: string): Promise<void> => {
    try {
      const token = useAuthStore.getState().token;
      const url = `${BASE_URL}/files/${id}/download?token=${encodeURIComponent(token || '')}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      const blob = await response.blob();
      
      let downloadFilename = filename;
      if (!downloadFilename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
          if (rfc5987Match && rfc5987Match[1]) {
            downloadFilename = decodeURIComponent(rfc5987Match[1]);
          } else {
            const matches = contentDisposition.match(/filename="?([^"]+)"?/);
            if (matches && matches[1]) {
              downloadFilename = decodeURIComponent(matches[1]);
            }
          }
        }
      }
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFilename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('下载失败:', error);
      throw error;
    }
  },

  getFilePreviewUrl: (id: string): string => {
    return buildPreviewUrl(id);
  },

  getFileContent: async (id: string): Promise<string> => {
    const response = await fetch(buildPreviewUrl(id));
    if (!response.ok) {
      throw new Error('获取文件内容失败');
    }
    return response.text();
  },

  getPreviewType: (mimeType: string): PreviewType => {
    return getPreviewType(mimeType);
  },

  getFilePreviewInfo: (item: FileSystemItem): FilePreviewInfo => {
    return {
      id: item.id,
      name: item.name,
      size: item.size || 0,
      mimeType: item.mimeType || '',
      previewType: item.mimeType ? getPreviewType(item.mimeType) : 'unsupported',
      previewUrl: buildPreviewUrl(item.id),
    };
  },

  renameFile: (id: string, name: string): Promise<FileSystemItem> =>
    request(`/files/${id}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  moveFile: (id: string, parentId: string | null): Promise<FileSystemItem> =>
    request(`/files/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({ parentId }),
    }),

  moveFolder: (id: string, parentId: string | null): Promise<FileSystemItem> =>
    request(`/folders/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({ parentId }),
    }),

  renameFolder: (id: string, name: string): Promise<FileSystemItem> =>
    request(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  getFolders: (parentId: string | null = null): Promise<FileSystemItem[]> => {
    const params = new URLSearchParams();
    if (parentId) params.append('parentId', parentId);
    return request(`/folders?${params.toString()}`, {
      method: 'GET',
    });
  },
};

export const shareApi = {
  createShare: (data: ShareCreateRequest): Promise<Share & { shareLink: string }> =>
    request('/shares', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getShares: (): Promise<Array<Share & { shareLink: string; itemName?: string; itemSize?: number }>> =>
    request('/shares', {
      method: 'GET',
    }),

  deleteShare: (id: string): Promise<void> =>
    request(`/shares/${id}`, {
      method: 'DELETE',
    }),

  accessShare: (code: string, password?: string): Promise<ShareAccessResponse> => {
    const params = new URLSearchParams();
    if (password) params.append('password', password);
    const query = params.toString();
    return fetch(`${BASE_URL}/s/${code}${query ? '?' + query : ''}`).then(async (res) => {
      const data = (await res.json()) as ApiResponse<ShareAccessResponse>;
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || '访问分享失败');
      }
      return data.data as ShareAccessResponse;
    });
  },

  downloadShareFile: (code: string, password?: string): void => {
    const params = new URLSearchParams();
    if (password) params.append('password', password);
    const query = params.toString();
    window.open(`${BASE_URL}/s/${code}/download${query ? '?' + query : ''}`, '_blank');
  },

  downloadFolderFile: (code: string, fileId: string, password?: string): void => {
    const params = new URLSearchParams();
    if (password) params.append('password', password);
    const query = params.toString();
    window.open(`${BASE_URL}/s/${code}/files/${fileId}${query ? '?' + query : ''}`, '_blank');
  },

  getShareFileUrl: (code: string, fileId?: string, password?: string): string => {
    const params = new URLSearchParams();
    if (password) params.append('password', password);
    const query = params.toString();
    if (fileId) {
      return `${BASE_URL}/s/${code}/files/${fileId}${query ? '?' + query : ''}`;
    }
    return `${BASE_URL}/s/${code}/download${query ? '?' + query : ''}`;
  },
};

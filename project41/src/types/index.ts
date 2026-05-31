export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
}

export interface Department {
  id: string
  name: string
  leader?: string
  phone?: string
  email?: string
  description?: string
  parentId?: string
  children?: Department[]
  sort?: number
  status?: number
  createTime?: string
}

export interface Role {
  id: string
  name: string
  code: string
  description?: string
  createTime?: string
}

export interface User {
  id: string
  username: string
  nickname: string
  password: string
  email?: string
  phone?: string
  avatar?: string
  status: number
  roleIds: string[]
  departmentId?: string
  departmentName?: string
  createTime?: string
}

export interface UserQueryParams {
  keyword?: string
  page: number
  pageSize: number
}

export interface MenuPermission {
  id: string
  name: string
  path?: string
  icon?: string
  parentId?: string
  children?: MenuPermission[]
  sort?: number
  status?: number
}

export interface ButtonPermission {
  id: string
  name: string
  code: string
  menuId: string
  description?: string
  status?: number
}

export interface RoleWithPermissions extends Role {
  menuPermissionIds: string[]
  buttonPermissionIds: string[]
}

export interface PermissionQueryParams {
  keyword?: string
  page: number
  pageSize: number
}

export interface FormOption {
  label: string
  value: string
}

export interface FormItem {
  id: string
  type: string
  label: string
  name: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  maxLength?: number
  minLength?: number
  max?: number
  min?: number
  step?: number
  rows?: number
  options?: FormOption[]
  defaultValue?: string | number | boolean | string[] | number[] | File[]
  width?: string
  showPassword?: boolean
  clearable?: boolean
  dateType?: string
  format?: string
  valueFormat?: string
  multiple?: boolean
  filterable?: boolean
  accept?: string
  listType?: string
  limit?: number
  fileSize?: number
  action?: string
  height?: string
  showToolbar?: boolean
}

export const COMPONENT_TYPES = [
  { value: 'input', label: '单行文本' },
  { value: 'textarea', label: '多行文本' },
  { value: 'number', label: '数字输入' },
  { value: 'date', label: '日期选择' },
  { value: 'time', label: '时间选择' },
  { value: 'select', label: '下拉选择' },
  { value: 'switch', label: '开关' },
  { value: 'radio', label: '单选框组' },
  { value: 'checkbox', label: '多选框组' },
  { value: 'rate', label: '评分' },
  { value: 'slider', label: '滑块' },
  { value: 'upload', label: '文件上传' },
  { value: 'richtext', label: '富文本编辑器' }
] as const

export const WIDTH_OPTIONS = [
  { value: '100%', label: '100%' },
  { value: '75%', label: '75%' },
  { value: '50%', label: '50%' },
  { value: '25%', label: '25%' }
] as const

export interface SavedForm {
  id: string
  name: string
  description?: string
  items: FormItem[]
  createdAt: string
  updatedAt: string
}

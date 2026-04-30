export const LOG_TYPES = {
  login: { label: '登录', type: 'primary' },
  logout: { label: '登出', type: 'info' },
  create: { label: '创建', type: 'success' },
  update: { label: '更新', type: 'warning' },
  delete: { label: '删除', type: 'danger' },
  borrow: { label: '借用', type: 'warning' },
  return: { label: '归还', type: 'success' },
  scrap: { label: '报废', type: 'danger' },
  reset_password: { label: '重置密码', type: 'warning' }
}

export const getLogLabel = (type) => {
  return LOG_TYPES[type]?.label || type
}

export const getLogTagType = (type) => {
  return LOG_TYPES[type]?.type || ''
}

export const getLogTypeOptions = () => {
  return Object.entries(LOG_TYPES).map(([value, config]) => ({
    value,
    label: config.label
  }))
}

export default LOG_TYPES

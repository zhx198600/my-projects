import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'

const MessageUtils = {
  success(msg, duration = 2000) {
    ElMessage.success({
      message: msg,
      duration
    })
  },

  error(msg, duration = 3000) {
    ElMessage.error({
      message: msg,
      duration
    })
  },

  warning(msg, duration = 3000) {
    ElMessage.warning({
      message: msg,
      duration
    })
  },

  info(msg, duration = 2000) {
    ElMessage.info({
      message: msg,
      duration
    })
  },

  notificationSuccess(title, message) {
    ElNotification.success({
      title,
      message,
      duration: 3000
    })
  },

  notificationError(title, message) {
    ElNotification.error({
      title,
      message,
      duration: 4500
    })
  },

  notificationWarning(title, message) {
    ElNotification.warning({
      title,
      message,
      duration: 3000
    })
  },

  notificationInfo(title, message) {
    ElNotification.info({
      title,
      message,
      duration: 3000
    })
  },

  confirm(title, message, options = {}) {
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      ...options
    })
  },

  alert(title, message, options = {}) {
    return ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      type: 'info',
      ...options
    })
  },

  prompt(title, message, options = {}) {
    return ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      ...options
    })
  }
}

export default MessageUtils

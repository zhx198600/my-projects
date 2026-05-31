const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`
}

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

const hideLoading = () => {
  wx.hideLoading()
}

const showModal = (title, content, showCancel = true) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      showCancel,
      success: res => {
        if (res.confirm) {
          resolve(true)
        } else if (res.cancel) {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj))
}

const getRandomId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  debounce,
  throttle,
  deepClone,
  getRandomId
}

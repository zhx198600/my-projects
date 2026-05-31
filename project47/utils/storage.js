const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('setStorage error:', e)
    return false
  }
}

const getStorage = (key, defaultValue = null) => {
  try {
    const data = wx.getStorageSync(key)
    return data !== '' ? data : defaultValue
  } catch (e) {
    console.error('getStorage error:', e)
    return defaultValue
  }
}

const removeStorage = key => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('removeStorage error:', e)
    return false
  }
}

const clearStorage = () => {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('clearStorage error:', e)
    return false
  }
}

const setStorageInfo = (key, data, expireTime = null) => {
  const storageData = {
    data,
    expireTime,
    createTime: Date.now()
  }
  return setStorage(key, storageData)
}

const getStorageInfo = key => {
  const storageData = getStorage(key)
  if (!storageData) return null
  
  if (storageData.expireTime && Date.now() > storageData.expireTime) {
    removeStorage(key)
    return null
  }
  
  return storageData.data
}

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  setStorageInfo,
  getStorageInfo
}

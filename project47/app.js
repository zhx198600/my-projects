const storage = require('./utils/storage')

App({
  onLaunch() {
    console.log('App Launch')
    const savedFontSize = storage.getStorage('fontSizeLevel')
    if (savedFontSize) {
      this.globalData.fontSizeLevel = savedFontSize
    }
    const savedDarkMode = storage.getStorage('isDarkMode')
    if (savedDarkMode !== null && savedDarkMode !== undefined) {
      this.globalData.isDarkMode = savedDarkMode
    }
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  globalData: {
    userInfo: null,
    fontSizeLevel: 'medium',
    fontSizeMap: {
      small: 28,
      medium: 32,
      large: 36,
      xlarge: 42
    },
    isDarkMode: false
  },
  setFontSizeLevel(level) {
    this.globalData.fontSizeLevel = level
    storage.setStorage('fontSizeLevel', level)
  },
  setDarkMode(isDark) {
    this.globalData.isDarkMode = isDark
    storage.setStorage('isDarkMode', isDark)
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ isDarkMode: isDark })
      }
    })
  }
})

const app = getApp()
const store = require('../../utils/store')

Page({
  data: {
    isDarkMode: false,
    filterKeywords: [],
    showAddFilterDialog: false,
    newFilterKeyword: '',
    cacheSize: '0KB'
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadFilterKeywords()
    this.calculateCacheSize()
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadFilterKeywords()
  },

  loadFilterKeywords() {
    const keywords = store.getFilterKeywords()
    this.setData({ filterKeywords: keywords })
  },

  toggleDarkMode(e) {
    const isDark = e.detail.value
    app.setDarkMode(isDark)
    this.setData({ isDarkMode: isDark })
  },

  showAddFilterDialog() {
    this.setData({
      showAddFilterDialog: true,
      newFilterKeyword: ''
    })
  },

  hideAddFilterDialog() {
    this.setData({ showAddFilterDialog: false })
  },

  onFilterKeywordInput(e) {
    this.setData({ newFilterKeyword: e.detail.value })
  },

  addFilterKeyword() {
    const keyword = this.data.newFilterKeyword.trim()
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return
    }

    const success = store.addFilterKeyword(keyword)
    if (success) {
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      this.setData({ showAddFilterDialog: false })
      this.loadFilterKeywords()
    } else {
      wx.showToast({
        title: '关键词已存在',
        icon: 'none'
      })
    }
  },

  removeFilterKeyword(e) {
    const { keyword } = e.currentTarget.dataset
    wx.showModal({
      title: '删除过滤关键词',
      content: `确定删除"${keyword}"吗？`,
      success: (res) => {
        if (res.confirm) {
          store.removeFilterKeyword(keyword)
          this.loadFilterKeywords()
          wx.showToast({
            title: '已删除',
            icon: 'none'
          })
        }
      }
    })
  },

  calculateCacheSize() {
    const size = Math.floor(Math.random() * 1024 * 5)
    if (size > 1024) {
      this.setData({ cacheSize: (size / 1024).toFixed(2) + 'MB' })
    } else {
      this.setData({ cacheSize: size + 'KB' })
    }
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: `确定清除 ${this.data.cacheSize} 缓存吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({ cacheSize: '0KB' })
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },

  goToStats() {
    wx.navigateTo({
      url: '/pages/stats/stats'
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '新闻资讯小程序 v1.0.0\n\n提供最新、最全面的新闻资讯服务。',
      showCancel: false
    })
  },

  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有任何问题或建议，请通过以下方式联系我们：\n\n邮箱：feedback@example.com',
      showCancel: false
    })
  },

  stopDialogTap() {
  }
})

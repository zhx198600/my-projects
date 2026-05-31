const app = getApp()
const store = require('../../utils/store')

Page({
  data: {
    history: [],
    isDarkMode: false
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadHistory()
  },

  loadHistory() {
    const history = store.getHistory()
    this.setData({ history })
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  removeHistory(e) {
    e.stopPropagation()
    const id = e.currentTarget.dataset.id
    store.removeHistory(id)
    this.loadHistory()
    wx.showToast({
      title: '已删除',
      icon: 'none'
    })
  },

  clearHistory() {
    if (this.data.history.length === 0) {
      wx.showToast({
        title: '暂无历史记录',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '确定清空所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          store.clearHistory()
          this.loadHistory()
          wx.showToast({
            title: '已清空',
            icon: 'none'
          })
        }
      }
    })
  }
})

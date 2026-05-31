const app = getApp()
const store = require('../../utils/store')

Page({
  data: {
    isDarkMode: false,
    stats: {
      today: { duration: 0, count: 0 },
      week: { duration: 0, count: 0 },
      month: { duration: 0, count: 0 }
    },
    totalDuration: 0,
    totalCount: 0
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadStats()
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadStats()
  },

  loadStats() {
    const stats = store.getReadingStats()
    const totalDuration = stats.today.duration + stats.week.duration + stats.month.duration
    const totalCount = stats.today.count + stats.week.count + stats.month.count
    
    this.setData({
      stats,
      totalDuration,
      totalCount
    })
  },

  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}秒`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}分钟`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
    }
  },

  goBack() {
    wx.navigateBack()
  }
})

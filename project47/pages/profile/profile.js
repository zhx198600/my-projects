const app = getApp()
const store = require('../../utils/store')

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '新闻阅读用户'
    },
    stats: {
      today: { duration: 0, count: 0 },
      totalCount: 0
    },
    menuList: [
      { id: 'stats', icon: '📊', title: '阅读统计', path: '/pages/stats/stats' },
      { id: 'history', icon: '📚', title: '阅读历史', path: '/pages/history/history' },
      { id: 'favorites', icon: '⭐', title: '我的收藏', path: '/pages/favorites/favorites' },
      { id: 'subscribe', icon: '🔖', title: '我的订阅', path: '/pages/subscribe/subscribe' },
      { id: 'settings', icon: '⚙️', title: '设置', path: '/pages/settings/settings' }
    ],
    isDarkMode: false
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
    const history = store.getHistory()
    
    this.setData({
      stats: {
        today: stats.today,
        totalCount: history.length
      }
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

  handleLogin() {
    wx.showToast({
      title: '登录功能开发中',
      icon: 'none'
    })
  },

  handleMenuTap(e) {
    const { path } = e.currentTarget.dataset
    if (path) {
      wx.navigateTo({
        url: path
      })
    }
  }
})

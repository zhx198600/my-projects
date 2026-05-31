const app = getApp()
const store = require('../../utils/store')

Page({
  data: {
    favorites: [],
    isDarkMode: false
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadFavorites()
  },

  loadFavorites() {
    const favorites = store.getFavorites()
    this.setData({ favorites })
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  removeFavorite(e) {
    e.stopPropagation()
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          store.removeFavorite(id)
          this.loadFavorites()
          wx.showToast({
            title: '已取消收藏',
            icon: 'none'
          })
        }
      }
    })
  }
})

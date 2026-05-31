const app = getApp()
const store = require('../../utils/store')
const api = require('../../utils/api')

Page({
  data: {
    keywords: [],
    maxKeywords: 20,
    showAddDialog: false,
    newKeyword: '',
    newsList: [],
    selectedKeyword: '',
    loading: false,
    isDarkMode: false,
    showNewsList: false
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadKeywords()
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadKeywords()
  },

  loadKeywords() {
    const keywords = store.getSubscribeKeywords()
    this.setData({ keywords })
  },

  showAddDialog() {
    if (this.data.keywords.length >= this.data.maxKeywords) {
      wx.showToast({
        title: `最多订阅${this.data.maxKeywords}个关键词`,
        icon: 'none'
      })
      return
    }
    this.setData({
      showAddDialog: true,
      newKeyword: ''
    })
  },

  hideAddDialog() {
    this.setData({ showAddDialog: false })
  },

  onKeywordInput(e) {
    this.setData({ newKeyword: e.detail.value })
  },

  addKeyword() {
    const keyword = this.data.newKeyword.trim()
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return
    }

    const success = store.addSubscribeKeyword(keyword)
    if (success) {
      wx.showToast({
        title: '订阅成功',
        icon: 'success'
      })
      this.setData({ showAddDialog: false })
      this.loadKeywords()
    } else {
      wx.showToast({
        title: '关键词已存在或达到上限',
        icon: 'none'
      })
    }
  },

  removeKeyword(e) {
    const { keyword } = e.currentTarget.dataset
    wx.showModal({
      title: '取消订阅',
      content: `确定取消订阅"${keyword}"吗？`,
      success: (res) => {
        if (res.confirm) {
          store.removeSubscribeKeyword(keyword)
          this.loadKeywords()
          wx.showToast({
            title: '已取消订阅',
            icon: 'none'
          })
        }
      }
    })
  },

  async tapKeyword(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({
      selectedKeyword: keyword,
      showNewsList: true,
      loading: true,
      newsList: []
    })

    try {
      const result = await api.news.searchNews(keyword)
      this.setData({
        newsList: result.list,
        loading: false
      })
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  backToKeywords() {
    this.setData({
      showNewsList: false,
      selectedKeyword: '',
      newsList: []
    })
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  stopDialogTap() {
  }
})

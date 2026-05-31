const app = getApp()
const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    keyword: '',
    searchHistory: [],
    searchResults: [],
    showResults: false,
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    isDarkMode: false
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadSearchHistory()
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
  },

  loadSearchHistory() {
    const searchHistory = store.getSearchHistory()
    this.setData({ searchHistory })
  },

  onInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  clearInput() {
    this.setData({
      keyword: '',
      showResults: false,
      searchResults: []
    })
  },

  onSearch() {
    const { keyword } = this.data
    if (!keyword || !keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    store.addSearchHistory(keyword)
    this.loadSearchHistory()
    this.setData({
      page: 1,
      searchResults: [],
      hasMore: true,
      showResults: true
    })
    this.doSearch()
  },

  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.onSearch()
  },

  removeHistoryItem(e) {
    e.stopPropagation()
    const keyword = e.currentTarget.dataset.keyword
    store.removeSearchHistory(keyword)
    this.loadSearchHistory()
  },

  clearSearchHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          store.clearSearchHistory()
          this.loadSearchHistory()
          wx.showToast({
            title: '已清空',
            icon: 'none'
          })
        }
      }
    })
  },

  async doSearch() {
    const { keyword, page, pageSize } = this.data
    this.setData({ loading: true })
    try {
      const result = await api.news.searchNews(keyword, page, pageSize)
      const newResults = page === 1 ? result.list : [...this.data.searchResults, ...result.list]
      this.setData({
        searchResults: newResults,
        hasMore: result.hasMore,
        page: page + 1,
        loading: false
      })
    } catch (err) {
      wx.showToast({
        title: '搜索失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  onReachBottom() {
    if (!this.data.showResults) return
    if (!this.data.hasMore || this.data.loading) return
    this.doSearch()
  },

  goBack() {
    wx.navigateBack()
  }
})

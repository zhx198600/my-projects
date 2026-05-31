const api = require('../../utils/api')
const app = getApp()

Page({
  data: {
    categories: ['头条', '科技', '财经', '体育', '娱乐'],
    currentCategory: '头条',
    newsList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    loadingMore: false,
    isDarkMode: false
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadNewsList(true)
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
  },

  async loadNewsList(refresh = false) {
    if (this.data.loading || this.data.loadingMore) return

    const { currentCategory, page, pageSize } = this.data
    const currentPage = refresh ? 1 : page

    if (refresh) {
      this.setData({ loading: true })
    } else {
      this.setData({ loadingMore: true })
    }

    try {
      const result = await api.news.getNewsByCategory(currentCategory, currentPage, pageSize)
      
      const newList = refresh ? result.list : [...this.data.newsList, ...result.list]
      
      this.setData({
        newsList: newList,
        page: currentPage + 1,
        hasMore: result.hasMore,
        loading: false,
        loadingMore: false
      })
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({
        loading: false,
        loadingMore: false
      })
    }

    if (refresh) {
      wx.stopPullDownRefresh()
    }
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    if (category === this.data.currentCategory) return

    this.setData({
      currentCategory: category,
      newsList: [],
      page: 1,
      hasMore: true
    })
    
    this.loadNewsList(true)
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.loadNewsList(true)
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return
    this.loadNewsList(false)
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  onShareAppMessage() {
    return {
      title: '新闻资讯',
      path: '/pages/index/index'
    }
  }
})

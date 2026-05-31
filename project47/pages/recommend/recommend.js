const app = getApp()
const store = require('../../utils/store')
const api = require('../../utils/api')

Page({
  data: {
    recommendList: [],
    loading: true,
    isDarkMode: false,
    recommendCategories: [],
    hasHistory: false
  },

  onLoad() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadRecommendations()
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.loadRecommendations()
  },

  async loadRecommendations() {
    this.setData({ loading: true })
    
    try {
      const history = store.getHistory()
      const hasHistory = history.length > 0
      const recommendCategories = store.getRecommendCategories(3)
      
      this.setData({
        hasHistory,
        recommendCategories
      })

      let newsList = []
      
      if (hasHistory && recommendCategories.length > 0) {
        for (const category of recommendCategories) {
          const result = await api.news.getNewsByCategory(category, 1, 5)
          newsList = newsList.concat(result.list.map(item => ({
            ...item,
            recommendReason: `基于你对「${category}」的兴趣`
          })))
        }
      } else {
        const result = await api.news.getNewsList({ page: 1, pageSize: 15 })
        newsList = result.list.map(item => ({
          ...item,
          recommendReason: '热门推荐'
        }))
      }

      const uniqueNews = this.removeDuplicates(newsList)
      const shuffledNews = this.shuffleArray(uniqueNews)
      
      this.setData({
        recommendList: shuffledNews.slice(0, 20),
        loading: false
      })
    } catch (err) {
      console.error('加载推荐失败:', err)
      this.setData({ loading: false })
    }
  },

  removeDuplicates(list) {
    const seen = new Set()
    return list.filter(item => {
      if (seen.has(item.id)) {
        return false
      }
      seen.add(item.id)
      return true
    })
  },

  shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  onPullDownRefresh() {
    this.loadRecommendations().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})

const app = getApp()
const store = require('../../utils/store')

Page({
  data: {
    news: null,
    loading: true,
    fontSizeLevel: 'medium',
    fontSizeOptions: [
      { key: 'small', label: '小' },
      { key: 'medium', label: '中' },
      { key: 'large', label: '大' },
      { key: 'xlarge', label: '特大' }
    ],
    showFontSelector: false,
    isFavorite: false,
    isLiked: false,
    likeCount: 0,
    comments: [],
    commentCount: 0,
    commentText: '',
    showCommentInput: false,
    replyTo: null,
    isDarkMode: false,
    readingStartTime: 0,
    readingTimer: null,
    currentReadingTime: 0
  },

  onLoad(options) {
    const { id } = options
    this.initFontSize()
    this.initTheme()
    if (id) {
      this.loadNewsDetail(id)
    }
  },

  onShow() {
    this.setData({ isDarkMode: app.globalData.isDarkMode })
    this.startReadingTimer()
  },

  onHide() {
    this.stopReadingTimer()
  },

  onUnload() {
    this.stopReadingTimer()
    this.recordReadingTime()
  },

  initFontSize() {
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel
    })
  },

  initTheme() {
    this.setData({
      isDarkMode: app.globalData.isDarkMode
    })
  },

  startReadingTimer() {
    if (this.data.readingStartTime === 0) {
      this.setData({ readingStartTime: Date.now() })
    }
    
    if (this.data.readingTimer) {
      clearInterval(this.data.readingTimer)
    }
    
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.readingStartTime) / 1000)
      this.setData({ currentReadingTime: elapsed })
    }, 1000)
    
    this.setData({ readingTimer: timer })
  },

  stopReadingTimer() {
    if (this.data.readingTimer) {
      clearInterval(this.data.readingTimer)
      this.setData({ readingTimer: null })
    }
  },

  recordReadingTime() {
    if (this.data.readingStartTime > 0 && this.data.news) {
      const duration = Math.floor((Date.now() - this.data.readingStartTime) / 1000)
      if (duration > 0) {
        store.addReadingTime(duration)
      }
    }
  },

  checkIsFavorite(newsId) {
    const isFavorite = store.isFavorite(newsId)
    this.setData({ isFavorite })
  },

  async loadNewsDetail(id) {
    const api = require('../../utils/api')
    try {
      const news = await api.news.getNewsById(id)
      this.setData({
        news,
        loading: false
      })
      this.checkIsFavorite(id)
      this.checkIsLiked(id)
      this.loadComments(id)
      this.addToHistory(news)
      wx.setNavigationBarTitle({
        title: news.title.length > 20 ? news.title.substring(0, 20) + '...' : news.title
      })
    } catch (err) {
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
      this.setData({
        loading: false
      })
    }
  },

  addToHistory(news) {
    store.addHistory({
      id: news.id,
      title: news.title,
      source: news.source,
      coverImage: news.coverImage,
      publishTime: news.publishTime,
      category: news.category
    })
  },

  toggleFontSelector() {
    this.setData({
      showFontSelector: !this.data.showFontSelector
    })
  },

  selectFontSize(e) {
    const { level } = e.currentTarget.dataset
    app.setFontSizeLevel(level)
    this.setData({
      fontSizeLevel: level,
      showFontSelector: false
    })
    wx.showToast({
      title: '字体大小已调整',
      icon: 'none',
      duration: 1000
    })
  },

  toggleFavorite() {
    const { news, isFavorite } = this.data
    if (isFavorite) {
      store.removeFavorite(news.id)
      this.setData({ isFavorite: false })
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
    } else {
      store.addFavorite({
        id: news.id,
        title: news.title,
        source: news.source,
        coverImage: news.coverImage,
        publishTime: news.publishTime,
        category: news.category
      })
      this.setData({ isFavorite: true })
      wx.showToast({
        title: '收藏成功',
        icon: 'none'
      })
    }
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  checkIsLiked(newsId) {
    const isLiked = store.isLiked(newsId)
    this.setData({ isLiked })
  },

  toggleLike() {
    const { news, isLiked } = this.data
    const result = store.toggleLike(news.id)
    this.setData({ isLiked: result })
    wx.showToast({
      title: result ? '点赞成功' : '已取消点赞',
      icon: 'none',
      duration: 1000
    })
  },

  loadComments(newsId) {
    const comments = store.getComments(newsId)
    const commentCount = store.getCommentCount(newsId)
    this.setData({ comments, commentCount })
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  focusCommentInput() {
    this.setData({ showCommentInput: true })
  },

  replyToComment(e) {
    const { comment } = e.currentTarget.dataset
    this.setData({ 
      replyTo: comment,
      showCommentInput: true 
    })
  },

  cancelReply() {
    this.setData({ 
      replyTo: null,
      commentText: ''
    })
  },

  submitComment() {
    const { news, commentText, replyTo } = this.data
    if (!commentText || !commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }

    store.addComment(news.id, commentText.trim(), replyTo ? replyTo.id : null)
    
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    })

    this.setData({
      commentText: '',
      replyTo: null,
      showCommentInput: false
    })

    this.loadComments(news.id)
  },

  deleteComment(e) {
    const { id } = e.currentTarget.dataset
    const { news } = this.data
    
    wx.showModal({
      title: '删除评论',
      content: '确定删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          store.deleteComment(news.id, id)
          this.loadComments(news.id)
          wx.showToast({
            title: '已删除',
            icon: 'none'
          })
        }
      }
    })
  },

  formatTime(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前'
    } else if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前'
    } else if (diff < 604800000) {
      return Math.floor(diff / 86400000) + '天前'
    } else {
      const date = new Date(timestamp)
      return `${date.getMonth() + 1}-${date.getDate()}`
    }
  },

  stopTap() {}
})

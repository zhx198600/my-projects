const { setStorage, getStorage } = require('./storage.js')

const STORAGE_KEYS = {
  FAVORITES: 'favorites',
  HISTORY: 'history',
  SUBSCRIBE_KEYWORDS: 'subscribe_keywords',
  FILTER_KEYWORDS: 'filter_keywords',
  READING_STATS: 'reading_stats',
  USER_SETTINGS: 'user_settings',
  SEARCH_HISTORY: 'search_history',
  LIKES: 'news_likes',
  COMMENTS: 'news_comments'
}

const MAX_KEYWORDS = 20

const getDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getWeekStart = (date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const getMonthStart = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const addFavorite = (newsItem) => {
  const favorites = getFavorites()
  const exists = favorites.some(item => item.id === newsItem.id)
  if (!exists) {
    favorites.unshift({
      ...newsItem,
      favoriteTime: Date.now()
    })
    setStorage(STORAGE_KEYS.FAVORITES, favorites)
  }
  return !exists
}

const removeFavorite = (newsId) => {
  const favorites = getFavorites()
  const newFavorites = favorites.filter(item => item.id !== newsId)
  setStorage(STORAGE_KEYS.FAVORITES, newFavorites)
  return favorites.length !== newFavorites.length
}

const getFavorites = () => {
  return getStorage(STORAGE_KEYS.FAVORITES, [])
}

const isFavorite = (newsId) => {
  const favorites = getFavorites()
  return favorites.some(item => item.id === newsId)
}

const clearFavorites = () => {
  setStorage(STORAGE_KEYS.FAVORITES, [])
  return true
}

const addHistory = (newsItem) => {
  const history = getHistory()
  const newHistory = history.filter(item => item.id !== newsItem.id)
  newHistory.unshift({
    ...newsItem,
    readTime: Date.now()
  })
  setStorage(STORAGE_KEYS.HISTORY, newHistory)
  return true
}

const removeHistory = (newsId) => {
  const history = getHistory()
  const newHistory = history.filter(item => item.id !== newsId)
  setStorage(STORAGE_KEYS.HISTORY, newHistory)
  return history.length !== newHistory.length
}

const getHistory = () => {
  return getStorage(STORAGE_KEYS.HISTORY, [])
}

const clearHistory = () => {
  setStorage(STORAGE_KEYS.HISTORY, [])
  return true
}

const addSubscribeKeyword = (keyword) => {
  const keywords = getSubscribeKeywords()
  if (keywords.length >= MAX_KEYWORDS) {
    return false
  }
  const exists = keywords.some(k => k === keyword)
  if (!exists) {
    keywords.unshift(keyword)
    setStorage(STORAGE_KEYS.SUBSCRIBE_KEYWORDS, keywords)
  }
  return !exists
}

const removeSubscribeKeyword = (keyword) => {
  const keywords = getSubscribeKeywords()
  const newKeywords = keywords.filter(k => k !== keyword)
  setStorage(STORAGE_KEYS.SUBSCRIBE_KEYWORDS, newKeywords)
  return keywords.length !== newKeywords.length
}

const getSubscribeKeywords = () => {
  return getStorage(STORAGE_KEYS.SUBSCRIBE_KEYWORDS, [])
}

const addFilterKeyword = (keyword) => {
  const keywords = getFilterKeywords()
  const exists = keywords.some(k => k === keyword)
  if (!exists) {
    keywords.unshift(keyword)
    setStorage(STORAGE_KEYS.FILTER_KEYWORDS, keywords)
  }
  return !exists
}

const removeFilterKeyword = (keyword) => {
  const keywords = getFilterKeywords()
  const newKeywords = keywords.filter(k => k !== keyword)
  setStorage(STORAGE_KEYS.FILTER_KEYWORDS, newKeywords)
  return keywords.length !== newKeywords.length
}

const getFilterKeywords = () => {
  return getStorage(STORAGE_KEYS.FILTER_KEYWORDS, [])
}

const applyFilter = (newsList) => {
  const keywords = getFilterKeywords()
  if (keywords.length === 0) {
    return newsList
  }
  return newsList.filter(news => {
    const title = news.title || ''
    const content = news.content || ''
    return !keywords.some(keyword => 
      title.includes(keyword) || content.includes(keyword)
    )
  })
}

const addReadingTime = (duration, date = new Date()) => {
  const stats = getStorage(STORAGE_KEYS.READING_STATS, {})
  const dateStr = getDateString(date)
  
  if (!stats[dateStr]) {
    stats[dateStr] = {
      duration: 0,
      count: 0
    }
  }
  
  stats[dateStr].duration += duration
  stats[dateStr].count += 1
  
  setStorage(STORAGE_KEYS.READING_STATS, stats)
  return true
}

const getReadingStats = () => {
  const stats = getStorage(STORAGE_KEYS.READING_STATS, {})
  const today = new Date()
  const todayStr = getDateString(today)
  const weekStart = getWeekStart(today)
  const monthStart = getMonthStart(today)
  
  let todayDuration = 0
  let todayCount = 0
  let weekDuration = 0
  let weekCount = 0
  let monthDuration = 0
  let monthCount = 0
  
  Object.keys(stats).forEach(dateStr => {
    const date = new Date(dateStr)
    const dayStats = stats[dateStr]
    
    if (dateStr === todayStr) {
      todayDuration += dayStats.duration
      todayCount += dayStats.count
    }
    
    if (date >= weekStart) {
      weekDuration += dayStats.duration
      weekCount += dayStats.count
    }
    
    if (date >= monthStart) {
      monthDuration += dayStats.duration
      monthCount += dayStats.count
    }
  })
  
  return {
    today: {
      duration: todayDuration,
      count: todayCount
    },
    week: {
      duration: weekDuration,
      count: weekCount
    },
    month: {
      duration: monthDuration,
      count: monthCount
    }
  }
}

const DEFAULT_USER_SETTINGS = {
  fontSize: 'medium',
  nightMode: false,
  autoPlay: true,
  pushNotification: true,
  imageQuality: 'high'
}

const getUserSettings = () => {
  const settings = getStorage(STORAGE_KEYS.USER_SETTINGS, {})
  return { ...DEFAULT_USER_SETTINGS, ...settings }
}

const updateUserSettings = (settings) => {
  const currentSettings = getUserSettings()
  const newSettings = { ...currentSettings, ...settings }
  setStorage(STORAGE_KEYS.USER_SETTINGS, newSettings)
  return newSettings
}

const MAX_SEARCH_HISTORY = 10

const addSearchHistory = (keyword) => {
  if (!keyword || !keyword.trim()) return false
  const history = getSearchHistory()
  const newHistory = history.filter(k => k !== keyword.trim())
  newHistory.unshift(keyword.trim())
  if (newHistory.length > MAX_SEARCH_HISTORY) {
    newHistory.pop()
  }
  setStorage(STORAGE_KEYS.SEARCH_HISTORY, newHistory)
  return true
}

const removeSearchHistory = (keyword) => {
  const history = getSearchHistory()
  const newHistory = history.filter(k => k !== keyword)
  setStorage(STORAGE_KEYS.SEARCH_HISTORY, newHistory)
  return history.length !== newHistory.length
}

const getSearchHistory = () => {
  return getStorage(STORAGE_KEYS.SEARCH_HISTORY, [])
}

const clearSearchHistory = () => {
  setStorage(STORAGE_KEYS.SEARCH_HISTORY, [])
  return true
}

const getCategoryWeights = () => {
  const history = getHistory()
  const weights = {}
  
  history.forEach(item => {
    const category = item.category || '头条'
    if (!weights[category]) {
      weights[category] = 0
    }
    weights[category]++
  })
  
  const total = history.length || 1
  Object.keys(weights).forEach(category => {
    weights[category] = weights[category] / total
  })
  
  return weights
}

const getRecommendCategories = (limit = 3) => {
  const weights = getCategoryWeights()
  const sorted = Object.keys(weights).sort((a, b) => weights[b] - weights[a])
  return sorted.slice(0, limit)
}

const getLikes = () => {
  return getStorage(STORAGE_KEYS.LIKES, {})
}

const toggleLike = (newsId) => {
  const likes = getLikes()
  if (likes[newsId]) {
    delete likes[newsId]
    setStorage(STORAGE_KEYS.LIKES, likes)
    return false
  } else {
    likes[newsId] = {
      newsId,
      likeTime: Date.now()
    }
    setStorage(STORAGE_KEYS.LIKES, likes)
    return true
  }
}

const isLiked = (newsId) => {
  const likes = getLikes()
  return !!likes[newsId]
}

const getLikeCount = (newsId) => {
  const likes = getLikes()
  return likes[newsId] ? 1 : 0
}

const getComments = (newsId) => {
  const allComments = getStorage(STORAGE_KEYS.COMMENTS, {})
  return allComments[newsId] || []
}

const addComment = (newsId, content, replyTo = null) => {
  const allComments = getStorage(STORAGE_KEYS.COMMENTS, {})
  if (!allComments[newsId]) {
    allComments[newsId] = []
  }
  
  const comment = {
    id: Date.now(),
    content,
    nickname: '微信用户',
    avatar: '',
    createTime: Date.now(),
    replyTo,
    likes: 0,
    replies: []
  }
  
  if (replyTo) {
    const parentComment = allComments[newsId].find(c => c.id === replyTo)
    if (parentComment) {
      parentComment.replies.push({
        id: comment.id,
        content,
        nickname: comment.nickname,
        createTime: comment.createTime,
        replyToName: parentComment.nickname
      })
    }
  } else {
    allComments[newsId].unshift(comment)
  }
  
  setStorage(STORAGE_KEYS.COMMENTS, allComments)
  return comment
}

const deleteComment = (newsId, commentId) => {
  const allComments = getStorage(STORAGE_KEYS.COMMENTS, {})
  if (!allComments[newsId]) return false
  
  allComments[newsId] = allComments[newsId].filter(c => c.id !== commentId)
  setStorage(STORAGE_KEYS.COMMENTS, allComments)
  return true
}

const getCommentCount = (newsId) => {
  const comments = getComments(newsId)
  let count = comments.length
  comments.forEach(c => {
    count += c.replies ? c.replies.length : 0
  })
  return count
}

module.exports = {
  MAX_KEYWORDS,
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  clearFavorites,
  addHistory,
  removeHistory,
  getHistory,
  clearHistory,
  addSubscribeKeyword,
  removeSubscribeKeyword,
  getSubscribeKeywords,
  addFilterKeyword,
  removeFilterKeyword,
  getFilterKeywords,
  applyFilter,
  addReadingTime,
  getReadingStats,
  getUserSettings,
  updateUserSettings,
  addSearchHistory,
  removeSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getCategoryWeights,
  getRecommendCategories,
  toggleLike,
  isLiked,
  getLikeCount,
  getComments,
  addComment,
  deleteComment,
  getCommentCount
}

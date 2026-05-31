const BASE_URL = 'https://api.example.com'
const news = require('./news')

const request = (url, method = 'GET', data = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    const { showLoading = true, showError = true } = options

    if (showLoading) {
      wx.showLoading({ title: '加载中...' })
    }

    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: res => {
        if (showLoading) {
          wx.hideLoading()
        }
        
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else {
            if (showError) {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none'
              })
            }
            reject(res.data)
          }
        } else {
          if (showError) {
            wx.showToast({
              title: `网络错误: ${res.statusCode}`,
              icon: 'none'
            })
          }
          reject(res)
        }
      },
      fail: err => {
        if (showLoading) {
          wx.hideLoading()
        }
        if (showError) {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none'
          })
        }
        reject(err)
      }
    })
  })
}

const get = (url, data = {}, options = {}) => {
  return request(url, 'GET', data, options)
}

const post = (url, data = {}, options = {}) => {
  return request(url, 'POST', data, options)
}

const put = (url, data = {}, options = {}) => {
  return request(url, 'PUT', data, options)
}

const del = (url, data = {}, options = {}) => {
  return request(url, 'DELETE', data, options)
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  BASE_URL,
  news: {
    CATEGORIES: news.CATEGORIES,
    getNewsList: news.getNewsList,
    getNewsById: news.getNewsById,
    getNewsByCategory: news.getNewsByCategory,
    searchNews: news.searchNews,
    getCategories: news.getCategories
  }
}

const app = getApp()

Page({
  data: {
    webUrl: ''
  },

  onLoad() {
    const baseUrl = app.globalData.baseUrl
    this.setData({
      webUrl: `${baseUrl}/index.html`
    })
  }
})

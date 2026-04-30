import request from './request'

const authApi = {
  login(credentials) {
    return request.post('/auth/login', credentials)
  },

  logout() {
    return request.post('/auth/logout')
  },

  refreshToken() {
    return request.post('/auth/refresh')
  },

  getCurrentUser() {
    return request.get('/auth/me')
  },

  updatePassword(data) {
    return request.put('/auth/password', data)
  },

  updateProfile(data) {
    return request.put('/auth/profile', data)
  }
}

export default authApi

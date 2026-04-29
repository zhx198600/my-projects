import request from './request'

const laboratoriesApi = {
  getList(params = {}) {
    return request.get('/laboratories', { params })
  },

  getAll() {
    return request.get('/laboratories/all')
  },

  getById(id) {
    return request.get(`/laboratories/${id}`)
  },

  create(data) {
    return request.post('/laboratories', data)
  },

  update(id, data) {
    return request.put(`/laboratories/${id}`, data)
  },

  delete(id) {
    return request.delete(`/laboratories/${id}`)
  },

  batchDelete(ids) {
    return request.post('/laboratories/batch-delete', { ids })
  },

  updateStatus(id, status) {
    return request.put(`/laboratories/${id}/status`, { status })
  },

  getStats(id) {
    return request.get(`/laboratories/${id}/stats`)
  },

  getUsers(laboratoryId, params = {}) {
    return request.get(`/laboratories/${laboratoryId}/users`, { params })
  },

  getAvailableUsers(params = {}) {
    return request.get('/laboratories/available-users', { params })
  },

  addUser(laboratoryId, userId) {
    return request.post(`/laboratories/${laboratoryId}/users`, { userId })
  },

  removeUser(laboratoryId, userId) {
    return request.delete(`/laboratories/${laboratoryId}/users/${userId}`)
  }
}

export default laboratoriesApi

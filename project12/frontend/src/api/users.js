import request from './request'

const usersApi = {
  getList(params = {}) {
    return request.get('/users', { params })
  },

  getById(id) {
    return request.get(`/users/${id}`)
  },

  create(data) {
    return request.post('/users', data)
  },

  update(id, data) {
    return request.put(`/users/${id}`, data)
  },

  delete(id) {
    return request.delete(`/users/${id}`)
  },

  batchDelete(ids) {
    return request.post('/users/batch-delete', { ids })
  },

  resetPassword(id) {
    return request.post(`/users/${id}/reset-password`)
  },

  updateStatus(id, status) {
    return request.put(`/users/${id}/status`, { status })
  }
}

export default usersApi

import request from './request'

const borrowRecordsApi = {
  getList(params = {}) {
    return request.get('/borrow-records', { params })
  },

  getById(id) {
    return request.get(`/borrow-records/${id}`)
  },

  getMyRecords(params = {}) {
    return request.get('/borrow-records/my', { params })
  },

  apply(data) {
    return request.post('/borrow-records/apply', data)
  },

  approve(id, data) {
    return request.put(`/borrow-records/${id}/approve`, data)
  },

  reject(id, data) {
    return request.put(`/borrow-records/${id}/reject`, data)
  },

  return(id, data) {
    return request.put(`/borrow-records/${id}/return`, data)
  },

  cancel(id) {
    return request.put(`/borrow-records/${id}/cancel`)
  },

  getPendingApprovals(params = {}) {
    return request.get('/borrow-records/pending', { params })
  },

  getStats() {
    return request.get('/borrow-records/stats')
  }
}

export default borrowRecordsApi

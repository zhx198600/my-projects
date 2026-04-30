import request from './request'

const logsApi = {
  getList(params = {}) {
    return request.get('/logs', { params })
  },

  getById(id) {
    return request.get(`/logs/${id}`)
  },

  getMyLogs(params = {}) {
    return request.get('/logs/my', { params })
  },

  getTypes() {
    return request.get('/logs/types')
  },

  getStats(params = {}) {
    return request.get('/logs/stats', { params })
  },

  clear(ids) {
    if (ids && ids.length > 0) {
      return request.post('/logs/clear', { ids })
    }
    return request.delete('/logs/clear')
  },

  export(params = {}) {
    return request.get('/logs/export', { 
      params,
      responseType: 'blob'
    })
  }
}

export default logsApi

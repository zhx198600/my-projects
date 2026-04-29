import request from './request'

const categoriesApi = {
  getList(params = {}) {
    return request.get('/categories', { params })
  },

  getTree() {
    return request.get('/categories/tree')
  },

  getById(id) {
    return request.get(`/categories/${id}`)
  },

  create(data) {
    return request.post('/categories', data)
  },

  update(id, data) {
    return request.put(`/categories/${id}`, data)
  },

  delete(id) {
    return request.delete(`/categories/${id}`)
  },

  batchDelete(ids) {
    return request.post('/categories/batch-delete', { ids })
  },

  updateSort(id, sort) {
    return request.put(`/categories/${id}/sort`, { sort })
  }
}

export default categoriesApi

import request from './request'

const equipmentApi = {
  getList(params = {}) {
    return request.get('/equipment', { params })
  },

  getById(id) {
    return request.get(`/equipment/${id}`)
  },

  create(data) {
    return request.post('/equipment', data)
  },

  update(id, data) {
    return request.put(`/equipment/${id}`, data)
  },

  delete(id) {
    return request.delete(`/equipment/${id}`)
  },

  exportExcel(params = {}) {
    return request.get('/export/equipment/excel', { 
      params,
      responseType: 'blob'
    })
  },

  exportCsv(params = {}) {
    return request.get('/export/equipment/csv', { 
      params,
      responseType: 'blob'
    })
  },

  borrow(id, data) {
    return request.post(`/equipment/${id}/borrow`, data)
  },

  return(id, data) {
    return request.post(`/equipment/${id}/return`, data)
  },

  scrap(id, data) {
    return request.post(`/equipment/${id}/scrap`, data)
  },

  getBorrowRecords(id, params = {}) {
    return request.get(`/equipment/${id}/borrow-records`, { params })
  },

  batchDelete(ids) {
    return request.post('/equipment/batch-delete', { ids })
  },

  updateStatus(id, status) {
    return request.put(`/equipment/${id}/status`, { status })
  },

  updateStock(id, data) {
    return request.put(`/equipment/${id}/stock`, data)
  },

  getStats() {
    return request.get('/equipment/stats')
  },

  import(formData) {
    return request.post('/equipment/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default equipmentApi

import request from '../utils/request'

export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  })
}

export const getFilterOptions = () => {
  return request.get('/filters/options')
}

export const getTimeStats = (params) => {
  const formattedParams = { ...params }
  if (params?.regions?.length) {
    formattedParams.regions = params.regions.join(',')
  }
  if (params?.products?.length) {
    formattedParams.products = params.products.join(',')
  }
  return request.get('/stats/time', { params: formattedParams })
}

export const getRegionStats = (params) => {
  const formattedParams = { ...params }
  if (params?.regions?.length) {
    formattedParams.regions = params.regions.join(',')
  }
  if (params?.products?.length) {
    formattedParams.products = params.products.join(',')
  }
  return request.get('/stats/region', { params: formattedParams })
}

export const getProductStats = (params) => {
  const formattedParams = { ...params }
  if (params?.regions?.length) {
    formattedParams.regions = params.regions.join(',')
  }
  if (params?.products?.length) {
    formattedParams.products = params.products.join(',')
  }
  return request.get('/stats/product', { params: formattedParams })
}

export const getOverviewStats = (params) => {
  const formattedParams = { ...params }
  if (params?.regions?.length) {
    formattedParams.regions = params.regions.join(',')
  }
  if (params?.products?.length) {
    formattedParams.products = params.products.join(',')
  }
  return request.get('/stats/overview', { params: formattedParams })
}

export const getForecastStats = (params) => {
  const formattedParams = { ...params }
  if (params?.regions?.length) {
    formattedParams.regions = params.regions.join(',')
  }
  if (params?.products?.length) {
    formattedParams.products = params.products.join(',')
  }
  return request.get('/stats/forecast', { params: formattedParams })
}

export const getAnomalyStats = (params) => {
  const formattedParams = { ...params }
  if (params?.regions?.length) {
    formattedParams.regions = params.regions.join(',')
  }
  if (params?.products?.length) {
    formattedParams.products = params.products.join(',')
  }
  return request.get('/stats/anomalies', { params: formattedParams })
}

export default request

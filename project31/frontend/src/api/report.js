import request from '../utils/request'

export function getStatistics() {
  return request({
    url: '/report/statistics',
    method: 'get'
  })
}

export function getDashboard() {
  return request({
    url: '/report/dashboard',
    method: 'get'
  })
}

export function getCustomerReport() {
  return request({
    url: '/report/customer',
    method: 'get'
  })
}

export function getCustomerTrend() {
  return request({
    url: '/report/customer',
    method: 'get'
  })
}

export function getCustomerProfile() {
  return request({
    url: '/report/customer',
    method: 'get'
  })
}

export function getCustomerRegion() {
  return request({
    url: '/report/customer',
    method: 'get'
  })
}

export function getSalesReport() {
  return request({
    url: '/report/sales',
    method: 'get'
  })
}

export function getSalesRanking() {
  return request({
    url: '/report/sales',
    method: 'get'
  })
}

export function getSalesPerformance() {
  return request({
    url: '/report/sales',
    method: 'get'
  })
}

export function getSalesConversion() {
  return request({
    url: '/report/sales',
    method: 'get'
  })
}

export function getServiceReport() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getServiceResponse() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getServiceResolveRate() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getServiceSatisfaction() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getArchiveReport() {
  return request({
    url: '/report/archive',
    method: 'get'
  })
}

export function getArchiveTrend() {
  return request({
    url: '/report/archive',
    method: 'get'
  })
}

export function getArchiveBorrowRate() {
  return request({
    url: '/report/archive',
    method: 'get'
  })
}

export function getArchiveDestroy() {
  return request({
    url: '/report/archive',
    method: 'get'
  })
}

export function exportReportPdf() {
  return request({
    url: '/report/export/pdf',
    method: 'get'
  })
}

export function getPerformanceTrend() {
  return request({
    url: '/report/sales',
    method: 'get'
  })
}

export function getConversionFunnel() {
  return request({
    url: '/report/sales',
    method: 'get'
  })
}

export function getTicketResponseTrend() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getTicketResolveRate() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getSatisfactionDistribution() {
  return request({
    url: '/report/service',
    method: 'get'
  })
}

export function getBorrowRate() {
  return request({
    url: '/report/archive',
    method: 'get'
  })
}

export function getDestroyStatistics() {
  return request({
    url: '/report/archive',
    method: 'get'
  })
}

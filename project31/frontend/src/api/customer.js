import request from '../utils/request'

export function getCustomerList(params) {
  return request({
    url: '/customer/list',
    method: 'get',
    params
  })
}

export function getCustomerPage(params) {
  return request({
    url: '/customer/list',
    method: 'get',
    params
  })
}

export function getCustomerAll() {
  return request({
    url: '/customer/list',
    method: 'get'
  })
}

export function getCustomerById(id) {
  return request({
    url: `/customer/${id}`,
    method: 'get'
  })
}

export function addCustomer(data) {
  return request({
    url: '/customer',
    method: 'post',
    data
  })
}

export function updateCustomer(data) {
  return request({
    url: '/customer',
    method: 'put',
    data
  })
}

export function deleteCustomer(id) {
  return request({
    url: `/customer/${id}`,
    method: 'delete'
  })
}

export function exportCustomer() {
  return request({
    url: '/customer/export/excel',
    method: 'get'
  })
}

export function getInsurancePage(params) {
  return request({
    url: '/customer/policy/list',
    method: 'get',
    params
  })
}

export function getPolicyList(params) {
  return request({
    url: '/customer/policy/list',
    method: 'get',
    params
  })
}

export function getPolicyByCustomerId(customerId) {
  return request({
    url: `/customer/policy/list?customerId=${customerId}`,
    method: 'get'
  })
}

export function addInsurance(data) {
  return request({
    url: '/customer/policy',
    method: 'post',
    data
  })
}

export function updateInsurance(data) {
  return request({
    url: '/customer/policy',
    method: 'put',
    data
  })
}

export function deleteInsurance(id) {
  return request({
    url: `/customer/policy/${id}`,
    method: 'delete'
  })
}

export function addPolicy(data) {
  return request({
    url: '/customer/policy',
    method: 'post',
    data
  })
}

export function updatePolicy(data) {
  return request({
    url: '/customer/policy',
    method: 'put',
    data
  })
}

export function deletePolicy(id) {
  return request({
    url: `/customer/policy/${id}`,
    method: 'delete'
  })
}

export function getHealthPage(params) {
  return request({
    url: '/customer/health/list',
    method: 'get',
    params
  })
}

export function getHealthList(params) {
  return request({
    url: '/customer/health/list',
    method: 'get',
    params
  })
}

export function getHealthByCustomerId(customerId) {
  return request({
    url: `/customer/health/list?customerId=${customerId}`,
    method: 'get'
  })
}

export function addHealth(data) {
  return request({
    url: '/customer/health',
    method: 'post',
    data
  })
}

export function updateHealth(data) {
  return request({
    url: '/customer/health',
    method: 'put',
    data
  })
}

export function deleteHealth(id) {
  return request({
    url: `/customer/health/${id}`,
    method: 'delete'
  })
}

export function getContactPage(params) {
  return request({
    url: '/customer/contact/list',
    method: 'get',
    params
  })
}

export function getContactList(params) {
  return request({
    url: '/customer/contact/list',
    method: 'get',
    params
  })
}

export function getContactByCustomerId(customerId) {
  return request({
    url: `/customer/contact/list?customerId=${customerId}`,
    method: 'get'
  })
}

export function addContact(data) {
  return request({
    url: '/customer/contact',
    method: 'post',
    data
  })
}

export function updateContact(data) {
  return request({
    url: '/customer/contact',
    method: 'put',
    data
  })
}

export function deleteContact(id) {
  return request({
    url: `/customer/contact/${id}`,
    method: 'delete'
  })
}

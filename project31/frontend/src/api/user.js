import request from '../utils/request'

export function getUserList(params) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/system/user/${id}`,
    method: 'delete'
  })
}

export function resetPassword(id, password) {
  return request({
    url: `/system/user/${id}/reset-password`,
    method: 'put',
    data: { password }
  })
}

export function toggleUserStatus(id) {
  return request({
    url: `/system/user/${id}/toggle-status`,
    method: 'put'
  })
}

export function getUserById(id) {
  return request({
    url: `/system/user/${id}`,
    method: 'get'
  })
}

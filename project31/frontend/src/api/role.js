import request from '../utils/request'

export function getRoleList(params) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params
  })
}

export function getAllRoles() {
  return request({
    url: '/system/role/list',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/system/role',
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/system/role/${id}`,
    method: 'delete'
  })
}

export function getRoleMenuIds(id) {
  return request({
    url: `/system/role/${id}`,
    method: 'get'
  })
}

export function allocateMenus(id, menuIds) {
  return request({
    url: `/system/role/${id}`,
    method: 'put'
  })
}

export function getRoleById(id) {
  return request({
    url: `/system/role/${id}`,
    method: 'get'
  })
}

import request from '../utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getUserMenuTree() {
  return request({
    url: '/menu/user-tree',
    method: 'get'
  })
}

import request from '../utils/request'

export function globalSearch(params) {
  return request({
    url: '/search',
    method: 'get',
    params
  })
}

export function searchSuggest(keyword) {
  return request({
    url: '/search/suggest',
    method: 'get',
    params: { keyword }
  })
}

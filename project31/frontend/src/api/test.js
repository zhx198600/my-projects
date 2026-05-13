import request from '@/utils/request'

export function getHello() {
  return request({
    url: '/test/hello',
    method: 'get'
  })
}

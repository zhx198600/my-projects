import request from '@/utils/request'
import type { ApiResponse, UserInfo } from '@/types'
import type { AxiosResponse } from 'axios'

export const getUserInfo = (): Promise<AxiosResponse<ApiResponse<UserInfo>>> => {
  return request.get('/user/info')
}

export const login = (data: {
  username: string
  password: string
}): Promise<AxiosResponse<ApiResponse>> => {
  return request.post('/auth/login', data)
}

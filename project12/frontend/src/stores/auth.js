import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'
import MessageUtils from '@/utils/message'

const TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || null)
  const userInfo = ref(null)
  const permissions = ref([])
  const roles = ref([])

  const isLoggedIn = computed(() => !!token.value)
  
  const userRole = computed(() => {
    return userInfo.value?.role || ''
  })

  const isSuperAdmin = computed(() => {
    return userRole.value === 'super_admin'
  })

  const isLabAdmin = computed(() => {
    return userRole.value === 'lab_admin'
  })

  const isUser = computed(() => {
    return userRole.value === 'user'
  })

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    if (info) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  const setPermissions = (perms) => {
    permissions.value = perms
  }

  const setRoles = (roleList) => {
    roles.value = roleList
  }

  const hasPermission = (permission) => {
    if (isSuperAdmin.value) {
      return true
    }
    return permissions.value.includes(permission)
  }

  const hasRole = (role) => {
    if (isSuperAdmin.value) {
      return true
    }
    return roles.value.includes(role)
  }

  const hasAnyPermission = (permList) => {
    if (isSuperAdmin.value) {
      return true
    }
    if (!permList || permList.length === 0) {
      return true
    }
    return permList.some(perm => permissions.value.includes(perm))
  }

  const hasAnyRole = (roleList) => {
    if (isSuperAdmin.value) {
      return true
    }
    if (!roleList || roleList.length === 0) {
      return true
    }
    return roleList.some(role => roles.value.includes(role))
  }

  const login = async (credentials) => {
    try {
      const response = await request.post('/auth/login', credentials)
      const { token: newToken, user, permissions: perms, roles: roleList } = response
      
      setToken(newToken)
      setUserInfo(user)
      setPermissions(perms || [])
      setRoles(roleList || [user.role])
      
      return { success: true, user }
    } catch (error) {
      MessageUtils.error(error.message || '登录失败')
      return { success: false, error }
    }
  }

  const logout = async () => {
    try {
      await request.post('/auth/logout')
    } catch (error) {
      console.log('登出API调用失败，但继续清除本地数据')
    } finally {
      setToken(null)
      setUserInfo(null)
      setPermissions([])
      setRoles([])
    }
  }

  const fetchUserInfo = async () => {
    try {
      const response = await request.get('/auth/me')
      const { user, permissions: perms, roles: roleList } = response
      
      setUserInfo(user)
      setPermissions(perms || [])
      setRoles(roleList || [user.role])
      
      return { success: true, user }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      setToken(null)
      setUserInfo(null)
      return { success: false, error }
    }
  }

  const refreshToken = async () => {
    try {
      const response = await request.post('/auth/refresh')
      const { token: newToken } = response
      setToken(newToken)
      return { success: true }
    } catch (error) {
      console.error('刷新Token失败:', error)
      setToken(null)
      setUserInfo(null)
      return { success: false, error }
    }
  }

  const restoreFromStorage = () => {
    const storedUserInfo = localStorage.getItem(USER_INFO_KEY)
    if (storedUserInfo && token.value) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo)
        userInfo.value = parsedUserInfo
        roles.value = [parsedUserInfo.role]
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
  }

  restoreFromStorage()

  return {
    token,
    userInfo,
    permissions,
    roles,
    isLoggedIn,
    userRole,
    isSuperAdmin,
    isLabAdmin,
    isUser,
    setToken,
    setUserInfo,
    setPermissions,
    setRoles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAnyRole,
    login,
    logout,
    fetchUserInfo,
    refreshToken
  }
})

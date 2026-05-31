import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type { User, Role, UserQueryParams } from '@/types'
import { useUserStore } from './user'

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const initialRoles: Role[] = [
  {
    id: 'role_admin',
    name: '超级管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 'role_manager',
    name: '部门经理',
    code: 'manager',
    description: '管理部门相关事务',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 'role_user',
    name: '普通用户',
    code: 'user',
    description: '普通用户权限',
    createTime: '2024-01-01 00:00:00'
  }
]

const initialUsers: User[] = [
  {
    id: 'user_001',
    username: 'admin',
    nickname: '超级管理员',
    password: '123456',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    status: 1,
    roleIds: ['role_admin'],
    departmentId: 'dept_001',
    departmentName: '技术部',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 'user_002',
    username: 'zhangsan',
    nickname: '张三',
    password: '123456',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    avatar: '',
    status: 1,
    roleIds: ['role_manager'],
    departmentId: 'dept_001',
    departmentName: '技术部',
    createTime: '2024-01-02 10:00:00'
  },
  {
    id: 'user_003',
    username: 'lisi',
    nickname: '李四',
    password: '123456',
    email: 'lisi@example.com',
    phone: '13800138002',
    avatar: '',
    status: 1,
    roleIds: ['role_user'],
    departmentId: 'dept_002',
    departmentName: '产品部',
    createTime: '2024-01-03 14:30:00'
  }
]

export const useUserManagementStore = defineStore(
  'userManagement',
  () => {
    const roles = ref<Role[]>([...initialRoles])
    const users = ref<User[]>([...initialUsers])

    const initRegisteredUsers = () => {
      const userStore = useUserStore()
      users.value.forEach((user) => {
        userStore.addRegisteredUser(user.username, user.password)
      })
    }

    onMounted(() => {
      initRegisteredUsers()
    })

    const total = computed(() => users.value.length)

    const getRoleNameById = (roleId: string) => {
      const role = roles.value.find((r) => r.id === roleId)
      return role ? role.name : ''
    }

    const getRoleNames = (roleIds: string[]) => {
      return roleIds.map((id) => getRoleNameById(id)).filter(Boolean).join(', ')
    }

    const getUserList = (params: UserQueryParams) => {
      return new Promise<{ list: User[]; total: number }>((resolve) => {
        setTimeout(() => {
          let filteredUsers = [...users.value]

          if (params.keyword) {
            const keyword = params.keyword.toLowerCase()
            filteredUsers = filteredUsers.filter(
              (u) =>
                u.username.toLowerCase().includes(keyword) ||
                u.nickname.toLowerCase().includes(keyword) ||
                u.email?.toLowerCase().includes(keyword)
            )
          }

          const start = (params.page - 1) * params.pageSize
          const end = start + params.pageSize
          const paginatedUsers = filteredUsers.slice(start, end)

          resolve({
            list: paginatedUsers,
            total: filteredUsers.length
          })
        }, 200)
      })
    }

    const addUser = (userData: Omit<User, 'id' | 'createTime'> & { password: string }) => {
      return new Promise<User>((resolve) => {
        setTimeout(() => {
          const newUser: User = {
            ...userData,
            id: generateId(),
            createTime: new Date().toLocaleString('zh-CN')
          }
          users.value.push(newUser)
          const userStore = useUserStore()
          userStore.addRegisteredUser(newUser.username, userData.password)
          resolve(newUser)
        }, 200)
      })
    }

    const updateUser = (userId: string, userData: Partial<User> & { password?: string }) => {
      return new Promise<User | null>((resolve) => {
        setTimeout(() => {
          const index = users.value.findIndex((u) => u.id === userId)
          if (index !== -1) {
            const oldUsername = users.value[index].username
            users.value[index] = { ...users.value[index], ...userData }
            const userStore = useUserStore()
            if (userData.username || userData.password) {
              userStore.updateRegisteredUser(
                oldUsername,
                userData.username || oldUsername,
                userData.password || ''
              )
            }
            resolve(users.value[index])
          } else {
            resolve(null)
          }
        }, 200)
      })
    }

    const deleteUser = (userId: string) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const index = users.value.findIndex((u) => u.id === userId)
          if (index !== -1) {
            const username = users.value[index].username
            users.value.splice(index, 1)
            const userStore = useUserStore()
            userStore.removeRegisteredUser(username)
            resolve(true)
          } else {
            resolve(false)
          }
        }, 200)
      })
    }

    const assignRoles = (userId: string, roleIds: string[]) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const user = users.value.find((u) => u.id === userId)
          if (user) {
            user.roleIds = roleIds
            resolve(true)
          } else {
            resolve(false)
          }
        }, 200)
      })
    }

    const toggleUserStatus = (userId: string) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const user = users.value.find((u) => u.id === userId)
          if (user) {
            user.status = user.status === 1 ? 0 : 1
            resolve(true)
          } else {
            resolve(false)
          }
        }, 200)
      })
    }

    const usernameExists = (username: string, excludeUserId?: string) => {
      return users.value.some((u) => u.username === username && u.id !== excludeUserId)
    }

    return {
      roles,
      users,
      total,
      getRoleNameById,
      getRoleNames,
      getUserList,
      addUser,
      updateUser,
      deleteUser,
      assignRoles,
      toggleUserStatus,
      usernameExists
    }
  },
  {
    persist: true
  }
)

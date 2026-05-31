import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuPermission, ButtonPermission, RoleWithPermissions, Role } from '@/types'

const generateId = () => Math.random().toString(36).substring(2, 11)

export const usePermissionStore = defineStore(
  'permission',
  () => {
    const menuPermissions = ref<MenuPermission[]>([
      {
        id: '1',
        name: '首页',
        path: '/',
        icon: 'HomeFilled',
        sort: 1,
        status: 1
      },
      {
        id: '2',
        name: '关于',
        path: '/about',
        icon: 'InfoFilled',
        sort: 2,
        status: 1
      },
      {
        id: '3',
        name: '系统管理',
        icon: 'Setting',
        sort: 3,
        status: 1,
        children: [
          {
            id: '3-1',
            name: '用户管理',
            path: '/user',
            icon: 'User',
            parentId: '3',
            sort: 1,
            status: 1
          },
          {
            id: '3-2',
            name: '部门管理',
            path: '/department',
            icon: 'OfficeBuilding',
            parentId: '3',
            sort: 2,
            status: 1
          },
          {
            id: '3-3',
            name: '权限管理',
            path: '/permission',
            icon: 'Lock',
            parentId: '3',
            sort: 3,
            status: 1
          }
        ]
      }
    ])

    const buttonPermissions = ref<ButtonPermission[]>([
      { id: 'btn-1', name: '新增用户', code: 'user:add', menuId: '3-1', description: '新增用户按钮权限', status: 1 },
      { id: 'btn-2', name: '编辑用户', code: 'user:edit', menuId: '3-1', description: '编辑用户按钮权限', status: 1 },
      { id: 'btn-3', name: '删除用户', code: 'user:delete', menuId: '3-1', description: '删除用户按钮权限', status: 1 },
      { id: 'btn-4', name: '分配角色', code: 'user:assignRole', menuId: '3-1', description: '分配角色按钮权限', status: 1 },
      { id: 'btn-5', name: '新增部门', code: 'dept:add', menuId: '3-2', description: '新增部门按钮权限', status: 1 },
      { id: 'btn-6', name: '编辑部门', code: 'dept:edit', menuId: '3-2', description: '编辑部门按钮权限', status: 1 },
      { id: 'btn-7', name: '删除部门', code: 'dept:delete', menuId: '3-2', description: '删除部门按钮权限', status: 1 },
      { id: 'btn-8', name: '新增角色', code: 'role:add', menuId: '3-3', description: '新增角色按钮权限', status: 1 },
      { id: 'btn-9', name: '编辑角色', code: 'role:edit', menuId: '3-3', description: '编辑角色按钮权限', status: 1 },
      { id: 'btn-10', name: '删除角色', code: 'role:delete', menuId: '3-3', description: '删除角色按钮权限', status: 1 },
      { id: 'btn-11', name: '分配权限', code: 'role:assignPermission', menuId: '3-3', description: '分配权限按钮权限', status: 1 }
    ])

    const roles = ref<RoleWithPermissions[]>([
      {
        id: 'role-1',
        name: '超级管理员',
        code: 'super_admin',
        description: '拥有所有权限',
        menuPermissionIds: ['1', '2', '3', '3-1', '3-2', '3-3'],
        buttonPermissionIds: ['btn-1', 'btn-2', 'btn-3', 'btn-4', 'btn-5', 'btn-6', 'btn-7', 'btn-8', 'btn-9', 'btn-10', 'btn-11'],
        createTime: '2024-01-01 00:00:00'
      },
      {
        id: 'role-2',
        name: '管理员',
        code: 'admin',
        description: '管理用户和部门',
        menuPermissionIds: ['1', '2', '3', '3-1', '3-2'],
        buttonPermissionIds: ['btn-1', 'btn-2', 'btn-3', 'btn-4', 'btn-5', 'btn-6', 'btn-7'],
        createTime: '2024-01-01 00:00:00'
      },
      {
        id: 'role-3',
        name: '普通用户',
        code: 'user',
        description: '仅查看权限',
        menuPermissionIds: ['1', '2'],
        buttonPermissionIds: [],
        createTime: '2024-01-01 00:00:00'
      }
    ])

    const roleList = computed<Role[]>(() => {
      return roles.value.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        createTime: r.createTime
      }))
    })

    const getRoleNameById = (roleId: string) => {
      const role = roles.value.find((r) => r.id === roleId)
      return role?.name || ''
    }

    const getRoleById = (roleId: string) => {
      return roles.value.find((r) => r.id === roleId)
    }

    const getMenuTree = () => {
      return JSON.parse(JSON.stringify(menuPermissions.value))
    }

    const getButtonsByMenuId = (menuId: string) => {
      return buttonPermissions.value.filter((b) => b.menuId === menuId && b.status === 1)
    }

    const getRoleList = async (params?: { keyword?: string; page?: number; pageSize?: number }) => {
      return new Promise<{ list: RoleWithPermissions[]; total: number }>((resolve) => {
        setTimeout(() => {
          let list = [...roles.value]

          if (params?.keyword) {
            const keyword = params.keyword.toLowerCase()
            list = list.filter(
              (r) => r.name.toLowerCase().includes(keyword) || r.code.toLowerCase().includes(keyword)
            )
          }

          const total = list.length

          if (params?.page && params?.pageSize) {
            const start = (params.page - 1) * params.pageSize
            list = list.slice(start, start + params.pageSize)
          }

          resolve({ list, total })
        }, 300)
      })
    }

    const addRole = async (role: Omit<RoleWithPermissions, 'id' | 'createTime'>) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const newRole: RoleWithPermissions = {
            ...role,
            id: generateId(),
            createTime: new Date().toLocaleString()
          }
          roles.value.push(newRole)
          resolve()
        }, 300)
      })
    }

    const updateRole = async (roleId: string, role: Partial<RoleWithPermissions>) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const index = roles.value.findIndex((r) => r.id === roleId)
          if (index !== -1) {
            roles.value[index] = { ...roles.value[index], ...role }
          }
          resolve()
        }, 300)
      })
    }

    const deleteRole = async (roleId: string) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const index = roles.value.findIndex((r) => r.id === roleId)
          if (index !== -1) {
            roles.value.splice(index, 1)
          }
          resolve()
        }, 300)
      })
    }

    const assignMenuPermissions = async (roleId: string, menuIds: string[]) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const role = roles.value.find((r) => r.id === roleId)
          if (role) {
            role.menuPermissionIds = menuIds
          }
          resolve()
        }, 300)
      })
    }

    const assignButtonPermissions = async (roleId: string, buttonIds: string[]) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const role = roles.value.find((r) => r.id === roleId)
          if (role) {
            role.buttonPermissionIds = buttonIds
          }
          resolve()
        }, 300)
      })
    }

    const assignPermissions = async (roleId: string, menuIds: string[], buttonIds: string[]) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const role = roles.value.find((r) => r.id === roleId)
          if (role) {
            role.menuPermissionIds = menuIds
            role.buttonPermissionIds = buttonIds
          }
          resolve()
        }, 300)
      })
    }

    const codeExists = (code: string, excludeId?: string) => {
      return roles.value.some((r) => r.code === code && r.id !== excludeId)
    }

    return {
      menuPermissions,
      buttonPermissions,
      roles,
      roleList,
      getRoleNameById,
      getRoleById,
      getMenuTree,
      getButtonsByMenuId,
      getRoleList,
      addRole,
      updateRole,
      deleteRole,
      assignMenuPermissions,
      assignButtonPermissions,
      assignPermissions,
      codeExists
    }
  },
  {
    persist: true
  }
)

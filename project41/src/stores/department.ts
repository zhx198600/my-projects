import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Department } from '@/types'

const initialDepartments: Department[] = [
  {
    id: '1',
    name: '总公司',
    leader: '张总',
    phone: '13800138001',
    email: 'ceo@company.com',
    description: '公司总部',
    parentId: undefined,
    sort: 1,
    status: 1,
    createTime: '2024-01-01',
    children: [
      {
        id: '1-1',
        name: '技术部',
        leader: '李经理',
        phone: '13800138002',
        email: 'tech@company.com',
        description: '负责技术研发',
        parentId: '1',
        sort: 1,
        status: 1,
        createTime: '2024-01-02',
        children: [
          {
            id: '1-1-1',
            name: '前端组',
            leader: '王组长',
            phone: '13800138003',
            email: 'frontend@company.com',
            description: '负责前端开发',
            parentId: '1-1',
            sort: 1,
            status: 1,
            createTime: '2024-01-03'
          },
          {
            id: '1-1-2',
            name: '后端组',
            leader: '赵组长',
            phone: '13800138004',
            email: 'backend@company.com',
            description: '负责后端开发',
            parentId: '1-1',
            sort: 2,
            status: 1,
            createTime: '2024-01-03'
          }
        ]
      },
      {
        id: '1-2',
        name: '产品部',
        leader: '刘经理',
        phone: '13800138005',
        email: 'product@company.com',
        description: '负责产品设计',
        parentId: '1',
        sort: 2,
        status: 1,
        createTime: '2024-01-02'
      }
    ]
  },
  {
    id: '2',
    name: '北京分公司',
    leader: '陈总',
    phone: '13900139001',
    email: 'beijing@company.com',
    description: '北京地区分公司',
    parentId: undefined,
    sort: 2,
    status: 1,
    createTime: '2024-02-01',
    children: [
      {
        id: '2-1',
        name: '销售部',
        leader: '孙经理',
        phone: '13900139002',
        email: 'bj-sales@company.com',
        description: '北京销售团队',
        parentId: '2',
        sort: 1,
        status: 1,
        createTime: '2024-02-02'
      }
    ]
  },
  {
    id: '3',
    name: '上海分公司',
    leader: '周总',
    phone: '13700137001',
    email: 'shanghai@company.com',
    description: '上海地区分公司',
    parentId: undefined,
    sort: 3,
    status: 1,
    createTime: '2024-03-01'
  }
]

export const useDepartmentStore = defineStore(
  'department',
  () => {
    const departments = ref<Department[]>([])

    const departmentTree = computed(() => departments.value)

    const generateId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    const initDepartments = () => {
      if (departments.value.length === 0) {
        departments.value = JSON.parse(JSON.stringify(initialDepartments))
      }
    }

    const findDepartment = (list: Department[], id: string): Department | null => {
      for (const item of list) {
        if (item.id === id) return item
        if (item.children) {
          const found = findDepartment(item.children, id)
          if (found) return found
        }
      }
      return null
    }

    const addDepartment = (parentId: string | undefined, dept: Omit<Department, 'id' | 'createTime' | 'children'>) => {
      const newDept: Department = {
        ...dept,
        id: generateId(),
        createTime: new Date().toISOString().split('T')[0]
      }

      if (!parentId) {
        departments.value.push(newDept)
        return newDept
      }

      const parent = findDepartment(departments.value, parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(newDept)
        return newDept
      }

      return null
    }

    const updateDepartment = (id: string, data: Partial<Department>) => {
      const update = (list: Department[]): boolean => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === id) {
            list[i] = { ...list[i], ...data }
            return true
          }
          const children = list[i].children
          if (children && children.length > 0) {
            if (update(children)) return true
          }
        }
        return false
      }
      return update(departments.value)
    }

    const deleteDepartment = (id: string) => {
      const remove = (list: Department[]): boolean => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === id) {
            list.splice(i, 1)
            return true
          }
          const children = list[i].children
          if (children && children.length > 0) {
            if (remove(children)) return true
          }
        }
        return false
      }
      return remove(departments.value)
    }

    const getDepartmentById = (id: string) => {
      return findDepartment(departments.value, id)
    }

    return {
      departments,
      departmentTree,
      initDepartments,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      getDepartmentById
    }
  },
  {
    persist: true
  }
)

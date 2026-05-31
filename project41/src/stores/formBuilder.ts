import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormItem, FormOption } from '@/types'

export const useFormBuilderStore = defineStore(
  'formBuilder',
  () => {
    const formItems = ref<FormItem[]>([])
    const selectedItemId = ref<string | null>(null)
    const itemIdCounter = ref(1)

    const selectedItem = computed(() => {
      return formItems.value.find((item) => item.id === selectedItemId.value) || null
    })

    const formData = computed(() => {
      const data: Record<string, unknown> = {}
      formItems.value.forEach((item) => {
        data[item.name] = item.defaultValue ?? ''
      })
      return data
    })

    const generateId = () => `field_${Date.now()}_${itemIdCounter.value++}`

    const getDefaultOptions = (type: string): FormOption[] | undefined => {
      if (['select', 'radio', 'checkbox', 'cascader'].includes(type)) {
        return [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
          { label: '选项3', value: '3' }
        ]
      }
      return undefined
    }

    const createFormItem = (type: string, label: string): FormItem => {
      const id = generateId()
      const baseItem: FormItem = {
        id,
        type,
        label,
        name: `field_${itemIdCounter.value}`,
        placeholder: '',
        required: false,
        disabled: false,
        hidden: false,
        clearable: true,
        width: '100%'
      }

      switch (type) {
        case 'textarea':
          return { ...baseItem, rows: 3 }
        case 'number':
          return { ...baseItem, min: 0, max: 100, step: 1 }
        case 'date':
        case 'time':
        case 'datetime':
          return { ...baseItem, dateType: type, format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' }
        case 'rate':
          return { ...baseItem, max: 5 }
        case 'slider':
          return { ...baseItem, min: 0, max: 100, step: 1 }
        case 'upload':
          return { ...baseItem, limit: 3, listType: 'text', fileSize: 10, accept: '', action: '' }
        case 'richtext':
          return { ...baseItem, height: '300px', showToolbar: true }
        case 'select':
        case 'radio':
        case 'checkbox':
          return { ...baseItem, options: getDefaultOptions(type), multiple: type === 'checkbox' }
        default:
          return { ...baseItem }
      }
    }

    const addFormItem = (type: string, label: string) => {
      const newItem = createFormItem(type, label)
      formItems.value.push(newItem)
      selectedItemId.value = newItem.id
      return newItem
    }

    const insertFormItem = (index: number, type: string, label: string) => {
      const newItem = createFormItem(type, label)
      formItems.value.splice(index, 0, newItem)
      selectedItemId.value = newItem.id
      return newItem
    }

    const selectItem = (id: string | null) => {
      selectedItemId.value = id
    }

    const updateItem = (id: string, updates: Partial<FormItem>) => {
      const index = formItems.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        formItems.value[index] = { ...formItems.value[index], ...updates }
      }
    }

    const moveItem = (fromIndex: number, toIndex: number) => {
      if (
        fromIndex >= 0 &&
        fromIndex < formItems.value.length &&
        toIndex >= 0 &&
        toIndex < formItems.value.length
      ) {
        const item = formItems.value.splice(fromIndex, 1)[0]
        formItems.value.splice(toIndex, 0, item)
      }
    }

    const copyItem = (index: number) => {
      if (index >= 0 && index < formItems.value.length) {
        const item = formItems.value[index]
        const copied = { ...item, id: generateId(), name: `${item.name}_copy` }
        formItems.value.splice(index + 1, 0, copied)
        selectedItemId.value = copied.id
      }
    }

    const deleteItem = (id: string) => {
      const index = formItems.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        if (selectedItemId.value === id) {
          selectedItemId.value = null
        }
        formItems.value.splice(index, 1)
      }
    }

    const clearAll = () => {
      formItems.value = []
      selectedItemId.value = null
    }

    const addOption = (itemId: string) => {
      const item = formItems.value.find((i) => i.id === itemId)
      if (item?.options) {
        const newIndex = item.options.length + 1
        item.options.push({ label: `选项${newIndex}`, value: String(newIndex) })
      }
    }

    const removeOption = (itemId: string, optionIndex: number) => {
      const item = formItems.value.find((i) => i.id === itemId)
      if (item?.options) {
        item.options.splice(optionIndex, 1)
      }
    }

    const updateOption = (itemId: string, optionIndex: number, updates: Partial<FormOption>) => {
      const item = formItems.value.find((i) => i.id === itemId)
      if (item?.options && item.options[optionIndex]) {
        item.options[optionIndex] = { ...item.options[optionIndex], ...updates }
      }
    }

    return {
      formItems,
      selectedItemId,
      selectedItem,
      formData,
      addFormItem,
      insertFormItem,
      selectItem,
      updateItem,
      moveItem,
      copyItem,
      deleteItem,
      clearAll,
      addOption,
      removeOption,
      updateOption
    }
  },
  {
    persist: {
      key: 'form-builder-store',
      storage: localStorage,
      paths: ['formItems', 'selectedItemId']
    }
  }
)

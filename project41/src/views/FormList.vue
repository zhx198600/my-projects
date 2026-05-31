<template>
  <div class="form-list">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ t('formList.title') }}</h2>
        <p class="page-desc">{{ t('formList.description') }}</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('formList.searchPlaceholder')"
          clearable
          style="width: 280px"
          :prefix-icon="Search"
        />
        <el-button type="primary" @click="goToBuilder">
          <el-icon><Edit /></el-icon>
          {{ t('formList.createForm') }}
        </el-button>
      </div>
    </div>

    <div v-if="filteredForms.length === 0" class="empty-state">
      <el-empty :description="t('formList.emptyDesc')">
        <el-button type="primary" @click="goToBuilder">{{ t('formList.createFirstForm') }}</el-button>
      </el-empty>
    </div>

    <div v-else class="form-cards">
      <div
        v-for="form in filteredForms"
        :key="form.id"
        class="form-card"
      >
        <div class="card-header">
          <div class="form-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="form-info">
            <h3 class="form-name" :title="form.name">{{ form.name }}</h3>
            <p class="form-desc" :title="form.description || '-'">{{ form.description || t('formList.noDescription') }}</p>
          </div>
          <el-dropdown @command="(cmd) => handleCommand(cmd, form)">
            <el-button text :icon="MoreFilled" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="preview">
                  <el-icon><View /></el-icon>
                  {{ t('formList.preview') }}
                </el-dropdown-item>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  {{ t('formList.edit') }}
                </el-dropdown-item>
                <el-dropdown-item command="copy">
                  <el-icon><CopyDocument /></el-icon>
                  {{ t('formList.copy') }}
                </el-dropdown-item>
                <el-dropdown-item command="export">
                  <el-icon><Download /></el-icon>
                  {{ t('formList.export') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="delete">
                  <el-icon class="text-danger"><Delete /></el-icon>
                  {{ t('formList.delete') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="card-body">
          <div class="form-stats">
            <span class="stat-item">
              <el-icon><Tickets /></el-icon>
              {{ form.items.length }} {{ t('formList.components') }}
            </span>
          </div>
        </div>
        <div class="card-footer">
          <span class="form-time">
            {{ t('formList.createdAt') }}: {{ formatDate(form.createdAt) }}
          </span>
          <div class="card-actions">
            <el-button size="small" @click="handlePreview(form)">
              {{ t('formList.preview') }}
            </el-button>
            <el-button size="small" type="primary" @click="handleEdit(form)">
              {{ t('formList.edit') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  View,
  Delete,
  CopyDocument,
  Download,
  Search,
  Document,
  Tickets,
  MoreFilled
} from '@element-plus/icons-vue'
import { useFormBuilderStore } from '@/stores/formBuilder'
import type { SavedForm } from '@/types'

const { t, d } = useI18n()
const router = useRouter()
const store = useFormBuilderStore()

const FORMS_STORAGE_KEY = 'saved-forms'
const forms = ref<SavedForm[]>([])
const searchKeyword = ref('')

const filteredForms = computed(() => {
  if (!searchKeyword.value) {
    return forms.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return forms.value.filter(
    (form) =>
      form.name.toLowerCase().includes(keyword) ||
      (form.description && form.description.toLowerCase().includes(keyword))
  )
})

const loadForms = () => {
  const data = localStorage.getItem(FORMS_STORAGE_KEY)
  forms.value = data ? JSON.parse(data) : []
}

const saveForms = (formsToSave: SavedForm[]) => {
  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(formsToSave))
}

const formatDate = (dateString: string) => {
  return d(new Date(dateString), 'short')
}

const goToBuilder = () => {
  router.push('/form-builder')
}

const handlePreview = (form: SavedForm) => {
  router.push(`/form-preview/${form.id}`)
}

const handleEdit = (form: SavedForm) => {
  store.clearAll()
  form.items.forEach((item) => {
    store.addFormItem(item.type, item.label)
    const lastItem = store.formItems[store.formItems.length - 1]
    if (lastItem) {
      store.updateItem(lastItem.id, { ...item, id: lastItem.id })
    }
  })
  ElMessage.success(t('formList.loadSuccess'))
  router.push('/form-builder')
}

const handleCopy = (form: SavedForm) => {
  const newForm: SavedForm = {
    ...form,
    id: `form_${Date.now()}`,
    name: `${form.name} (${t('formList.copySuffix')})`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  forms.value.unshift(newForm)
  saveForms(forms.value)
  ElMessage.success(t('formList.copySuccess'))
}

const handleDelete = (form: SavedForm) => {
  ElMessageBox.confirm(t('formList.deleteConfirm', { name: form.name }), t('common.warning'), {
    type: 'warning'
  })
    .then(() => {
      const index = forms.value.findIndex((f) => f.id === form.id)
      if (index !== -1) {
        forms.value.splice(index, 1)
        saveForms(forms.value)
        ElMessage.success(t('formList.deleteSuccess'))
      }
    })
    .catch(() => {})
}

const handleExport = (form: SavedForm) => {
  const dataStr = JSON.stringify(form, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${form.name}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(t('formList.exportSuccess'))
}

const handleCommand = (command: string, form: SavedForm) => {
  switch (command) {
    case 'preview':
      handlePreview(form)
      break
    case 'edit':
      handleEdit(form)
      break
    case 'copy':
      handleCopy(form)
      break
    case 'delete':
      handleDelete(form)
      break
    case 'export':
      handleExport(form)
      break
  }
}

onMounted(() => {
  loadForms()
})
</script>

<style scoped>
.form-list {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.page-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}

.form-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.form-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.form-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary-light-8), var(--el-color-primary-light-5));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-icon .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.form-info {
  flex: 1;
  min-width: 0;
}

.form-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-body {
  padding: 12px 16px;
  flex: 1;
}

.form-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.stat-item .el-icon {
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-top: 1px solid var(--el-border-color-lighter);
}

.form-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.text-danger {
  color: var(--el-color-danger);
}

.preview-form {
  padding: 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.preview-form-item {
  display: inline-block;
  padding-right: 12px;
  vertical-align: top;
}

.preview-form-item .el-form-item {
  margin-bottom: 18px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-input {
    flex: 1;
  }

  .form-cards {
    grid-template-columns: 1fr;
  }
}
</style>

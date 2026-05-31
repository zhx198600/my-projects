<template>
  <div class="form-preview">
    <div class="preview-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">
          {{ t('formPreview.backToList') }}
        </el-button>
      </div>
      <div class="header-right">
        <el-button :icon="Printer" @click="handlePrint">
          {{ t('formPreview.print') }}
        </el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">
          {{ t('formPreview.export') }}
        </el-button>
      </div>
    </div>

    <div v-if="!formData" class="empty-state">
      <el-empty :description="t('formPreview.noData')" />
    </div>

    <div v-else class="preview-content" id="preview-content">
      <div class="form-header">
        <div class="form-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="form-title-section">
          <h1 class="form-name">{{ formData.form.name }}</h1>
          <p class="form-desc">{{ formData.form.description || t('formList.noDescription') }}</p>
        </div>
      </div>

      <div class="form-meta">
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ t('formPreview.submitTime') }}: {{ submitTime }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Tickets /></el-icon>
          <span>{{ formData.form.items.length }} {{ t('formList.components') }}</span>
        </div>
      </div>

      <div class="section-title">
        <el-icon><SuccessFilled /></el-icon>
        <span>{{ t('formPreview.filledData') }}</span>
      </div>

      <div class="form-results">
        <div
          v-for="item in formData.form.items"
          :key="item.id"
          class="result-item"
          :style="{ width: item.width }"
          v-show="!item.hidden"
        >
          <div class="result-label">
            <span class="label-text">{{ item.label }}</span>
            <el-tag v-if="item.required" size="small" type="danger" effect="light">
              {{ t('formBuilder.requiredTag') }}
            </el-tag>
          </div>
          <div class="result-value">
            <template v-if="item.type === 'upload'">
              <div v-if="getFieldValue(item.name) && (getFieldValue(item.name) as File[]).length > 0" class="file-list">
                <div
                  v-for="(file, idx) in getFieldValue(item.name) as File[]"
                  :key="idx"
                  class="file-item"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ file.name }}</span>
                </div>
              </div>
              <span v-else class="empty-value">-</span>
            </template>
            <template v-else-if="item.type === 'richtext'">
              <div class="richtext-content" v-html="getFieldValue(item.name) as string"></div>
            </template>
            <template v-else-if="item.type === 'switch'">
              <el-tag :type="getFieldValue(item.name) ? 'success' : 'info'">
                {{ getFieldValue(item.name) ? t('common.enabled') : t('common.disabled') }}
              </el-tag>
            </template>
            <template v-else-if="item.type === 'rate'">
              <el-rate :model-value="getFieldValue(item.name) as number" disabled />
            </template>
            <template v-else-if="item.type === 'slider'">
              <el-slider :model-value="getFieldValue(item.name) as number" disabled />
            </template>
            <template v-else-if="hasOptions(item.type)">
              <template v-if="Array.isArray(getFieldValue(item.name))">
                <div class="tag-list">
                  <el-tag
                    v-for="val in getFieldValue(item.name) as string[]"
                    :key="val"
                    size="small"
                  >
                    {{ getOptionLabel(item, val) }}
                  </el-tag>
                </div>
              </template>
              <span v-else>{{ getOptionLabel(item, String(getFieldValue(item.name) || '')) }}</span>
            </template>
            <template v-else>
              <span>{{ getFieldValue(item.name) || '-' }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Printer,
  Download,
  Document,
  Clock,
  Tickets,
  SuccessFilled
} from '@element-plus/icons-vue'
import type { SavedForm, FormItem } from '@/types'

interface PreviewData {
  form: SavedForm
  formData: Record<string, unknown>
}

const { t, d } = useI18n()
const route = useRoute()
const router = useRouter()

const formData = ref<PreviewData | null>(null)
const submitTime = ref('')

const FORMS_STORAGE_KEY = 'saved-forms'
const PREVIEW_STORAGE_PREFIX = 'preview_'

const loadFormData = () => {
  const id = route.params.id as string
  if (!id) return

  const previewData = sessionStorage.getItem(`${PREVIEW_STORAGE_PREFIX}${id}`)
  if (previewData) {
    const data = JSON.parse(previewData)
    formData.value = data
    submitTime.value = d(new Date(), 'long')
    return
  }

  const savedFormsStr = localStorage.getItem(FORMS_STORAGE_KEY)
  if (savedFormsStr) {
    const savedForms = JSON.parse(savedFormsStr) as SavedForm[]
    const form = savedForms.find((f) => f.id === id)
    if (form) {
      formData.value = {
        form,
        formData: {}
      }
      form.items.forEach((item) => {
        formData.value!.formData[item.name] = item.defaultValue ?? ''
      })
      submitTime.value = d(new Date(form.createdAt), 'long')
    }
  }
}

const hasOptions = (type: string) => {
  return ['select', 'radio', 'checkbox'].includes(type)
}

const getFieldValue = (name: string): string | number | boolean | string[] | File[] => {
  const value = formData.value?.formData[name]
  if (value === undefined || value === null) return ''
  return value as string | number | boolean | string[] | File[]
}

const getOptionLabel = (item: FormItem, value: string | number) => {
  const option = item.options?.find((opt) => opt.value === String(value))
  return option?.label || value
}

const handleBack = () => {
  router.push('/form-list')
}

const handlePrint = () => {
  window.print()
}

const handleExport = () => {
  if (!formData.value) return
  const dataStr = JSON.stringify(formData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${formData.value.form.name}_result.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(t('formList.exportSuccess'))
}

onMounted(() => {
  loadFormData()
})
</script>

<style scoped>
.form-preview {
  min-height: 100%;
  padding: 24px;
  background: var(--el-fill-color-light);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left,
.header-right {
  display: flex;
  gap: 12px;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
  background: var(--el-bg-color);
  border-radius: 12px;
}

.preview-content {
  max-width: 900px;
  margin: 0 auto;
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--el-border-color-lighter);
  margin-bottom: 20px;
}

.form-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--el-color-primary-light-8), var(--el-color-primary-light-5));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-icon .el-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.form-title-section {
  flex: 1;
}

.form-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.form-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.form-meta {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  margin-bottom: 32px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  justify-content: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.meta-item .el-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-title .el-icon {
  font-size: 20px;
  color: var(--el-color-success);
}

.form-results {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.result-item {
  flex-shrink: 0;
  padding: 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
  transition: all 0.3s ease;
}

.result-item:hover {
  background: var(--el-fill-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.result-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.label-text {
  font-weight: 500;
}

.result-value {
  font-size: 15px;
  color: var(--el-text-color-primary);
  line-height: 1.6;
  min-height: 24px;
}

.empty-value {
  color: var(--el-text-color-placeholder);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-bg-color);
  border-radius: 6px;
  font-size: 14px;
}

.file-item .el-icon {
  color: var(--el-color-primary);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.richtext-content {
  line-height: 1.8;
}

.richtext-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.richtext-content p {
  margin: 0 0 12px 0;
}

.richtext-content ul,
.richtext-content ol {
  padding-left: 24px;
  margin: 0 0 12px 0;
}

.richtext-content h1,
.richtext-content h2,
.richtext-content h3 {
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.richtext-content:empty::before {
  content: '-';
  color: var(--el-text-color-placeholder);
}

@media print {
  .form-preview {
    background: none;
    padding: 0;
  }

  .preview-header {
    display: none;
  }

  .preview-content {
    box-shadow: none;
    padding: 0;
  }
}

@media (max-width: 768px) {
  .form-preview {
    padding: 16px;
  }

  .preview-content {
    padding: 24px;
  }

  .form-header {
    flex-direction: column;
    text-align: center;
  }

  .form-meta {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .form-results {
    flex-direction: column;
  }

  .result-item {
    width: 100% !important;
  }
}
</style>

<template>
  <div class="form-builder">
    <div class="builder-container">
      <div class="component-library">
        <div class="library-header">
          <span>{{ t('formBuilder.componentLibrary') }}</span>
        </div>
        <div class="library-content">
          <div class="component-group">
            <div class="group-title">{{ t('formBuilder.basicComponents') }}</div>
            <div class="component-list">
              <div
                v-for="item in basicComponents"
                :key="item.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragend="handleDragEnd"
              >
                <el-icon class="component-icon"><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
          <div class="component-group">
            <div class="group-title">{{ t('formBuilder.advancedComponents') }}</div>
            <div class="component-list">
              <div
                v-for="item in advancedComponents"
                :key="item.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragend="handleDragEnd"
              >
                <el-icon class="component-icon"><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="canvas-area">
        <div class="canvas-header">
          <div class="canvas-title">
            <el-icon><Edit /></el-icon>
            <span>{{ t('formBuilder.formCanvas') }}</span>
            <span class="item-count">({{ store.formItems.length }})</span>
          </div>
          <div class="canvas-actions">
            <el-button size="small" @click="handlePreview">
              <el-icon><View /></el-icon>
              {{ t('formBuilder.preview') }}
            </el-button>
            <el-button size="small" @click="handleClear">
              <el-icon><Delete /></el-icon>
              {{ t('formBuilder.clear') }}
            </el-button>
            <el-button type="primary" size="small" @click="handleSave">
              <el-icon><Check /></el-icon>
              {{ t('formBuilder.save') }}
            </el-button>
          </div>
        </div>
        <div
          class="canvas-content"
          @drop="handleCanvasDrop($event)"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <div
            v-if="store.formItems.length === 0"
            class="empty-canvas"
            :class="{ 'drag-over': isDragOver }"
          >
            <el-icon class="empty-icon"><Upload /></el-icon>
            <p>{{ t('formBuilder.dragHint') }}</p>
          </div>
          <div v-else class="form-items" ref="sortableRef">
            <div
              v-for="(item, index) in store.formItems"
              :key="item.id"
              class="form-item-wrapper"
              :class="{
                'selected': store.selectedItemId === item.id,
                'drag-over-item': dragOverIndex === index,
                'hidden-item': item.hidden
              }"
              :style="{ width: item.width }"
              draggable="true"
              @click="handleSelectItem(item)"
              @dragstart="handleItemDragStart($event, index)"
              @dragend="handleItemDragEnd"
              @dragover.prevent="handleItemDragOver($event, index)"
              @dragleave="handleItemDragLeave"
              @drop="handleItemDrop($event, index)"
            >
              <div class="form-item-header">
                <div class="item-title">
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  <span class="item-label">{{ item.label }}</span>
                  <el-tag v-if="item.required" size="small" type="danger" effect="light">
                    {{ t('formBuilder.requiredTag') }}
                  </el-tag>
                </div>
                <div class="item-actions">
                  <el-icon
                    class="action-icon"
                    @click.stop="handleMoveUp(index)"
                    :class="{ disabled: index === 0 }"
                  >
                    <ArrowUp />
                  </el-icon>
                  <el-icon
                    class="action-icon"
                    @click.stop="handleMoveDown(index)"
                    :class="{ disabled: index === store.formItems.length - 1 }"
                  >
                    <ArrowDown />
                  </el-icon>
                  <el-icon class="action-icon" @click.stop="handleCopy(index)">
                    <CopyDocument />
                  </el-icon>
                  <el-icon class="action-icon delete" @click.stop="handleDelete(item.id)">
                    <Delete />
                  </el-icon>
                </div>
              </div>
              <div class="form-item-content">
                <el-upload
                  v-if="item.type === 'upload'"
                  v-bind="getComponentProps(item)"
                >
                  <el-button type="primary" size="small">
                    <el-icon><Upload /></el-icon>
                    上传文件
                  </el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持上传 {{ item.limit }} 个文件，单个文件不超过 {{ item.fileSize }}MB
                    </div>
                  </template>
                </el-upload>
                <div
                  v-else-if="item.type === 'richtext'"
                  class="richtext-editor-wrapper"
                >
                  <Toolbar
                    v-if="item.showToolbar"
                    :editor="editorRefs[item.id]"
                    :default-config="{}"
                    mode="default"
                    style="border-bottom: 1px solid var(--el-border-color)"
                  />
                  <Editor
                    :default-config="{ placeholder: item.placeholder || `请输入${item.label}` }"
                    :default-html="(item.defaultValue as string) || ''"
                    mode="default"
                    :style="{ height: item.height }"
                    @on-created="(editor: IDomEditor) => handleCreated(editor, item.id)"
                    @on-change="(editor: IDomEditor) => handleEditorChange(item, editor)"
                  />
                </div>
                <component
                  v-else
                  :is="getComponent(item.type)"
                  v-bind="getComponentProps(item)"
                  @change="(val: unknown) => handleValueChange(item, val)"
                >
                  <template v-if="hasOptions(item.type)">
                    <el-option
                      v-for="option in item.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </template>
                  <template v-if="item.type === 'radio'">
                    <el-radio v-for="option in item.options" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </el-radio>
                  </template>
                  <template v-if="item.type === 'checkbox'">
                    <el-checkbox v-for="option in item.options" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </el-checkbox>
                  </template>
                </component>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="property-panel">
        <div class="panel-header">
          <span>{{ t('formBuilder.propertyPanel') }}</span>
        </div>
        <div class="panel-content">
          <div v-if="selectedItem" class="property-form">
            <el-form label-position="top">
              <div class="property-section">
                <div class="section-title">{{ t('formBuilder.basicProperties') }}</div>
                <el-form-item :label="t('formBuilder.componentType')">
                  <el-select
                    :model-value="selectedItem.type"
                    @update:model-value="(val: string) => updateSelectedItem('type', val)"
                    @change="handleTypeChange"
                    class="w-full"
                  >
                    <el-option
                      v-for="type in componentTypes"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item :label="t('formBuilder.fieldLabel')">
                  <el-input
                    :model-value="selectedItem.label"
                    @update:model-value="(val: string) => updateSelectedItem('label', val)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item :label="t('formBuilder.fieldName')">
                  <el-input
                    :model-value="selectedItem.name"
                    @update:model-value="(val: string) => updateSelectedItem('name', val)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item :label="t('formBuilder.placeholder')">
                  <el-input
                    :model-value="selectedItem.placeholder"
                    @update:model-value="(val: string) => updateSelectedItem('placeholder', val)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
              </div>
              <div class="property-section">
                <div class="section-title">{{ t('formBuilder.validationProperties') }}</div>
                <el-form-item :label="t('formBuilder.defaultValue')">
                <el-input
                  v-if="!hasOptions(selectedItem.type) && !isSwitchType(selectedItem.type)"
                  :model-value="selectedItem.defaultValue as string"
                  @update:model-value="(val: string) => handleDefaultValueChange(val)"
                  @change="handlePropertyChange"
                />
                <el-switch
                  v-else-if="isSwitchType(selectedItem.type)"
                  :model-value="selectedItem.defaultValue as boolean"
                  @update:model-value="(val: string | number | boolean) => handleDefaultValueChange(val)"
                  @change="handlePropertyChange"
                />
                <el-select
                  v-else
                  :model-value="selectedItem.defaultValue as string"
                  @update:model-value="(val: string | number) => handleDefaultValueChange(val)"
                  @change="handlePropertyChange"
                >
                  <el-option
                    v-for="option in selectedItem.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('formBuilder.required')">
                <el-switch
                  :model-value="selectedItem.required"
                  @update:model-value="(val: string | number | boolean) => updateSelectedItem('required', val as boolean)"
                  @change="handlePropertyChange"
                />
              </el-form-item>
              <el-form-item v-if="selectedItem.type === 'input'" :label="t('formBuilder.maxLength')">
                <el-input-number
                  :model-value="selectedItem.maxLength"
                  @update:model-value="(val: number | undefined) => updateSelectedItem('maxLength', val)"
                  :min="0"
                  @change="handlePropertyChange"
                />
              </el-form-item>
              <el-form-item v-if="selectedItem.type === 'textarea'" :label="t('formBuilder.rows')">
                <el-input-number
                  :model-value="selectedItem.rows"
                  @update:model-value="(val: number | undefined) => updateSelectedItem('rows', val)"
                  :min="1"
                  :max="10"
                  @change="handlePropertyChange"
                />
              </el-form-item>
              <el-form-item v-if="selectedItem.type === 'number'" :label="t('formBuilder.minValue')">
                <el-input-number
                  :model-value="selectedItem.min"
                  @update:model-value="(val: number | undefined) => updateSelectedItem('min', val)"
                  @change="handlePropertyChange"
                />
              </el-form-item>
              <el-form-item v-if="selectedItem.type === 'number'" :label="t('formBuilder.maxValue')">
                <el-input-number
                  :model-value="selectedItem.max"
                  @update:model-value="(val: number | undefined) => updateSelectedItem('max', val)"
                  @change="handlePropertyChange"
                />
              </el-form-item>
              </div>
              <div class="property-section">
                <div class="section-title">{{ t('formBuilder.advancedProperties') }}</div>
                <el-form-item :label="t('formBuilder.disabled')">
                  <el-switch
                    :model-value="selectedItem.disabled"
                    @update:model-value="(val: string | number | boolean) => updateSelectedItem('disabled', val as boolean)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item :label="t('formBuilder.hidden')">
                  <el-switch
                    :model-value="selectedItem.hidden"
                    @update:model-value="(val: string | number | boolean) => updateSelectedItem('hidden', val as boolean)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item :label="t('formBuilder.width')">
                  <el-select
                    :model-value="selectedItem.width"
                    @update:model-value="(val: string | number) => updateSelectedItem('width', val as string)"
                    @change="handlePropertyChange"
                    class="w-full"
                  >
                    <el-option
                      v-for="option in widthOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'input'" :label="t('formBuilder.clearable')">
                  <el-switch
                    :model-value="selectedItem.clearable"
                    @update:model-value="(val: string | number | boolean) => updateSelectedItem('clearable', val as boolean)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'upload'" :label="t('formBuilder.uploadUrl')">
                  <el-input
                    :model-value="selectedItem.action"
                    @update:model-value="(val: string) => updateSelectedItem('action', val)"
                    :placeholder="t('formBuilder.uploadUrlPlaceholder')"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'upload'" :label="t('formBuilder.fileSizeLimit')">
                  <el-input-number
                    :model-value="selectedItem.fileSize"
                    @update:model-value="(val: number | undefined) => updateSelectedItem('fileSize', val)"
                    :min="1"
                    :max="100"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'upload'" :label="t('formBuilder.fileTypeLimit')">
                  <el-input
                    :model-value="selectedItem.accept"
                    @update:model-value="(val: string) => updateSelectedItem('accept', val)"
                    :placeholder="t('formBuilder.fileTypePlaceholder')"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'upload'" :label="t('formBuilder.maxValue')">
                  <el-input-number
                    :model-value="selectedItem.limit"
                    @update:model-value="(val: number | undefined) => updateSelectedItem('limit', val)"
                    :min="1"
                    :max="10"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'upload'" :label="t('formBuilder.select')">
                  <el-switch
                    :model-value="selectedItem.multiple"
                    @update:model-value="(val: string | number | boolean) => updateSelectedItem('multiple', val as boolean)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'richtext'" :label="t('formBuilder.editorHeight')">
                  <el-input
                    :model-value="selectedItem.height"
                    @update:model-value="(val: string) => updateSelectedItem('height', val)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
                <el-form-item v-if="selectedItem.type === 'richtext'" :label="t('formBuilder.showToolbar')">
                  <el-switch
                    :model-value="selectedItem.showToolbar"
                    @update:model-value="(val: string | number | boolean) => updateSelectedItem('showToolbar', val as boolean)"
                    @change="handlePropertyChange"
                  />
                </el-form-item>
              </div>
              <el-form-item v-if="hasOptions(selectedItem.type)" :label="t('formBuilder.options')">
                <div class="options-editor">
                  <div
                    v-for="(option, optIndex) in selectedItem.options"
                    :key="optIndex"
                    class="option-item"
                  >
                    <el-input
                      v-model="option.label"
                      :placeholder="t('formBuilder.optionLabel')"
                      size="small"
                      @change="handlePropertyChange"
                    />
                    <el-input
                      v-model="option.value"
                      :placeholder="t('formBuilder.optionValue')"
                      size="small"
                      @change="handlePropertyChange"
                    />
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Minus"
                      @click="handleRemoveOption(optIndex)"
                      :disabled="(selectedItem.options?.length || 0) <= 1"
                    />
                  </div>
                  <el-button size="small" :icon="Plus" @click="handleAddOption">
                    {{ t('formBuilder.addOption') }}
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div v-else class="empty-panel">
            <el-icon class="empty-panel-icon"><Pointer /></el-icon>
            <p>{{ t('formBuilder.selectHint') }}</p>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="previewDialogVisible"
      :title="t('formBuilder.previewTitle')"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="preview-form">
        <el-form
          ref="previewFormRef"
          :model="previewFormData"
          :rules="previewFormRules"
          label-width="120px"
        >
          <div
            v-for="item in store.formItems"
            :key="item.id"
            class="preview-form-item"
            :style="{ width: item.width }"
            v-show="!item.hidden"
          >
            <el-form-item
              :label="item.label"
              :prop="item.name"
              :required="item.required"
            >
              <el-upload
                v-if="item.type === 'upload'"
                v-bind="getComponentProps(item)"
                :model-value="previewFormData[item.name]"
                @change="(val: unknown) => handlePreviewValueChange(item, val)"
              >
                <el-button type="primary" size="small">
                  <el-icon><Upload /></el-icon>
                  上传文件
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持上传 {{ item.limit }} 个文件，单个文件不超过 {{ item.fileSize }}MB
                  </div>
                </template>
              </el-upload>
              <div
                v-else-if="item.type === 'richtext'"
                class="richtext-editor-wrapper"
              >
                <Toolbar
                  v-if="item.showToolbar"
                  :editor="previewEditorRefs[item.id]"
                  :default-config="{}"
                  mode="default"
                  style="border-bottom: 1px solid var(--el-border-color)"
                />
                <Editor
                  :default-config="{ placeholder: item.placeholder || `请输入${item.label}` }"
                  :default-html="(previewFormData[item.name] as string) || ''"
                  mode="default"
                  :style="{ height: item.height }"
                  @on-created="(editor: IDomEditor) => handlePreviewCreated(editor, item.id)"
                  @on-change="(editor: IDomEditor) => handlePreviewEditorChange(item, editor)"
                />
              </div>
              <component
                v-else
                :is="getComponent(item.type)"
                v-bind="getComponentProps(item)"
                :model-value="previewFormData[item.name]"
                @update:model-value="(val: unknown) => handlePreviewValueChange(item, val)"
              >
                <template v-if="hasOptions(item.type)">
                  <el-option
                    v-for="option in item.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </template>
                <template v-if="item.type === 'radio'">
                  <el-radio v-for="option in item.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </el-radio>
                </template>
                <template v-if="item.type === 'checkbox'">
                  <el-checkbox v-for="option in item.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </el-checkbox>
                </template>
              </component>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">{{ t('common.close') }}</el-button>
        <el-button type="primary" @click="handlePreviewSubmit">{{ t('common.submit') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="saveDialogVisible"
      :title="t('formBuilder.saveFormTitle')"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="saveFormData" label-width="100px">
        <el-form-item
          :label="t('formBuilder.formName')"
          :required="true"
          :error="saveFormError"
        >
          <el-input
            v-model="saveFormData.name"
            :placeholder="t('formBuilder.formNamePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('formBuilder.formDescription')">
          <el-input
            v-model="saveFormData.description"
            type="textarea"
            :rows="3"
            :placeholder="t('formBuilder.formDescriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveForm">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Edit,
  View,
  Delete,
  Check,
  Upload,
  ArrowUp,
  ArrowDown,
  CopyDocument,
  Pointer,
  Plus,
  Minus,
  Rank,
  Document,
  Tickets,
  Select,
  SwitchButton,
  Calendar,
  Timer,
  Operation,
  Box,
  Star,
  BottomLeft,
  FolderOpened,
  EditPen
} from '@element-plus/icons-vue'
import { useFormBuilderStore } from '@/stores/formBuilder'
import type { FormItem, SavedForm } from '@/types'
import { COMPONENT_TYPES, WIDTH_OPTIONS } from '@/types'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

const { t } = useI18n()
const router = useRouter()
const store = useFormBuilderStore()

const selectedItem = computed(() => store.selectedItem)

const updateSelectedItem = (field: keyof FormItem, value: string | number | boolean | undefined) => {
  if (store.selectedItemId) {
    store.updateItem(store.selectedItemId, { [field]: value })
  }
}

interface ComponentItem {
  type: string
  label: string
  icon: unknown
}

const componentTypes = COMPONENT_TYPES
const widthOptions = WIDTH_OPTIONS

const basicComponents: ComponentItem[] = [
  { type: 'input', label: t('formBuilder.input'), icon: Document },
  { type: 'textarea', label: t('formBuilder.textarea'), icon: Tickets },
  { type: 'number', label: t('formBuilder.number'), icon: Operation },
  { type: 'date', label: t('formBuilder.datePicker'), icon: Calendar },
  { type: 'time', label: t('formBuilder.timePicker'), icon: Timer },
  { type: 'select', label: t('formBuilder.select'), icon: Select },
  { type: 'switch', label: t('formBuilder.switch'), icon: SwitchButton },
  { type: 'radio', label: t('formBuilder.radio'), icon: Select }
]

const advancedComponents: ComponentItem[] = [
  { type: 'checkbox', label: t('formBuilder.checkbox'), icon: Box },
  { type: 'rate', label: t('formBuilder.rate'), icon: Star },
  { type: 'slider', label: t('formBuilder.slider'), icon: BottomLeft },
  { type: 'upload', label: t('formBuilder.upload'), icon: FolderOpened },
  { type: 'richtext', label: t('formBuilder.richtext'), icon: EditPen }
]

const sortableRef = ref<HTMLElement>()
const isDragOver = ref(false)
const dragOverIndex = ref(-1)
const dragIndex = ref(-1)
let sortableInstance: { destroy: () => void } | null = null

const previewDialogVisible = ref(false)
const previewFormRef = ref<FormInstance>()
const previewFormData = reactive<Record<string, unknown>>({})
const previewFormRules = reactive<FormRules>({})

const saveDialogVisible = ref(false)
const saveFormData = reactive({
  name: '',
  description: ''
})
const saveFormError = ref('')

const editorRefs = ref<Record<string, IDomEditor | null>>({})
const previewEditorRefs = ref<Record<string, IDomEditor | null>>({})

const handleCreated = (editor: IDomEditor, itemId: string) => {
  editorRefs.value[itemId] = editor
}

const handlePreviewCreated = (editor: IDomEditor, itemId: string) => {
  previewEditorRefs.value[itemId] = editor
}

const handleEditorChange = (item: FormItem, editor: IDomEditor) => {
  const html = editor.getHtml()
  handleValueChange(item, html)
}

const handlePreviewEditorChange = (item: FormItem, editor: IDomEditor) => {
  const html = editor.getHtml()
  handlePreviewValueChange(item, html)
}

const FORMS_STORAGE_KEY = 'saved-forms'

const getComponent = (type: string) => {
  const components: Record<string, string> = {
    input: 'el-input',
    textarea: 'el-input',
    number: 'el-input-number',
    date: 'el-date-picker',
    time: 'el-time-picker',
    select: 'el-select',
    switch: 'el-switch',
    radio: 'el-radio-group',
    checkbox: 'el-checkbox-group',
    rate: 'el-rate',
    slider: 'el-slider',
    upload: 'el-upload',
    richtext: 'RichTextEditor'
  }
  return components[type] || 'el-input'
}

const getComponentProps = (item: FormItem) => {
  const props: Record<string, unknown> = {
    placeholder: item.placeholder || `请输入${item.label}`,
    disabled: item.disabled,
    clearable: item.clearable,
    modelValue: item.defaultValue
  }

  switch (item.type) {
    case 'textarea':
      props.type = 'textarea'
      props.rows = item.rows || 3
      break
    case 'number':
      props.min = item.min
      props.max = item.max
      props.step = item.step || 1
      break
    case 'date':
      props.type = item.dateType || 'date'
      props.format = item.format || 'YYYY-MM-DD'
      props.valueFormat = item.valueFormat || 'YYYY-MM-DD'
      break
    case 'select':
      props.multiple = item.multiple
      props.filterable = item.filterable
      break
    case 'upload':
      props.action = item.action || '#'
      props.multiple = item.multiple
      props.limit = item.limit
      props.accept = item.accept
      props.listType = item.listType
      props.autoUpload = false
      break
    case 'richtext':
      props.height = item.height
      props.showToolbar = item.showToolbar
      break
  }

  return props
}

const hasOptions = (type: string) => {
  return ['select', 'radio', 'checkbox'].includes(type)
}

const isSwitchType = (type: string) => {
  return type === 'switch'
}

const handleDragStart = (event: DragEvent, item: ComponentItem) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('component-type', item.type)
    event.dataTransfer.setData('component-label', item.label)
    event.dataTransfer.setData('is-new', 'true')
  }
  document.body.style.cursor = 'copy'
}

const handleDragEnd = () => {
  document.body.style.cursor = ''
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleCanvasDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  dragOverIndex.value = -1
  document.body.style.cursor = ''

  const isNew = event.dataTransfer?.getData('is-new') === 'true'
  const type = event.dataTransfer?.getData('component-type')
  const label = event.dataTransfer?.getData('component-label')

  if (isNew && type && label) {
    store.addFormItem(type, label)
  }
}

const handleItemDragStart = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('drag-index', String(index))
    event.dataTransfer.setData('is-new', 'false')
  }
  dragIndex.value = index
  document.body.style.cursor = 'move'
}

const handleItemDragEnd = () => {
  dragIndex.value = -1
  dragOverIndex.value = -1
  document.body.style.cursor = ''
}

const handleItemDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (dragIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleItemDragLeave = () => {
  dragOverIndex.value = -1
}

const handleItemDrop = (event: DragEvent, index: number) => {
  event.preventDefault()
  event.stopPropagation()

  const isNew = event.dataTransfer?.getData('is-new') === 'true'

  if (isNew) {
    const type = event.dataTransfer?.getData('component-type')
    const label = event.dataTransfer?.getData('component-label')
    if (type && label) {
      store.insertFormItem(index, type, label)
    }
  } else {
    const fromIndex = Number(event.dataTransfer?.getData('drag-index'))
    if (!isNaN(fromIndex) && fromIndex !== index) {
      store.moveItem(fromIndex, fromIndex < index ? index : index)
    }
  }

  dragOverIndex.value = -1
  dragIndex.value = -1
  document.body.style.cursor = ''
}

const handleSelectItem = (item: FormItem) => {
  store.selectItem(item.id)
}

const handleMoveUp = (index: number) => {
  if (index > 0) {
    store.moveItem(index, index - 1)
  }
}

const handleMoveDown = (index: number) => {
  if (index < store.formItems.length - 1) {
    store.moveItem(index, index + 1)
  }
}

const handleCopy = (index: number) => {
  store.copyItem(index)
  ElMessage.success(t('formBuilder.copySuccess'))
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm(t('formBuilder.deleteConfirm'), t('common.warning'), {
    type: 'warning'
  })
    .then(() => {
      store.deleteItem(id)
      ElMessage.success(t('formBuilder.deleteSuccess'))
    })
    .catch(() => {})
}

const handleAddOption = () => {
  if (store.selectedItemId) {
    store.addOption(store.selectedItemId)
  }
}

const handleRemoveOption = (optIndex: number) => {
  if (store.selectedItemId) {
    store.removeOption(store.selectedItemId, optIndex)
  }
}

const handlePropertyChange = () => {
  if (store.selectedItemId && store.selectedItem) {
    store.updateItem(store.selectedItemId, { ...store.selectedItem })
  }
}

const handleDefaultValueChange = (value: unknown) => {
  if (store.selectedItemId) {
    store.updateItem(store.selectedItemId, {
      defaultValue: value as string | number | boolean | string[] | number[]
    })
  }
}

const handleValueChange = (item: FormItem, value: unknown) => {
  store.updateItem(item.id, { defaultValue: value as string | number | boolean | string[] | number[] })
}

const handleTypeChange = (newType: string) => {
  if (store.selectedItemId) {
    const hasOptions = ['select', 'radio', 'checkbox'].includes(newType)
    const options = hasOptions
      ? [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
          { label: '选项3', value: '3' }
        ]
      : undefined

    const updates: Partial<FormItem> = {
      type: newType,
      options
    }

    if (newType === 'textarea') {
      updates.rows = 3
    } else if (newType === 'number') {
      updates.min = 0
      updates.max = 100
      updates.step = 1
    } else if (newType === 'rate') {
      updates.max = 5
    } else if (newType === 'slider') {
      updates.min = 0
      updates.max = 100
      updates.step = 1
    } else if (newType === 'checkbox') {
      updates.multiple = true
    } else if (newType === 'upload') {
      updates.limit = 3
      updates.listType = 'text'
      updates.fileSize = 10
      updates.accept = ''
      updates.action = ''
    } else if (newType === 'richtext') {
      updates.height = '300px'
      updates.showToolbar = true
    } else {
      updates.multiple = false
    }

    store.updateItem(store.selectedItemId, updates)
  }
}

const initPreviewForm = () => {
  Object.keys(previewFormData).forEach((key) => {
    delete previewFormData[key]
  })
  Object.keys(previewFormRules).forEach((key) => {
    delete previewFormRules[key]
  })

  store.formItems.forEach((item) => {
    previewFormData[item.name] = item.defaultValue ?? ''
    if (item.required) {
      previewFormRules[item.name] = [
        { required: true, message: `${item.label}不能为空`, trigger: 'blur' }
      ]
    }
  })
}

const handlePreview = () => {
  if (store.formItems.length === 0) {
    ElMessage.warning(t('formBuilder.previewEmptyHint'))
    return
  }
  initPreviewForm()
  previewDialogVisible.value = true
}

const handlePreviewValueChange = (item: FormItem, value: unknown) => {
  previewFormData[item.name] = value
}

const handlePreviewSubmit = async () => {
  if (!previewFormRef.value) return
  try {
    await previewFormRef.value.validate()
    ElMessage.success(t('formBuilder.previewSubmitSuccess'))
    const tempFormId = `temp_${Date.now()}`
    const tempForm: SavedForm = {
      id: tempFormId,
      name: t('formBuilder.previewTitle'),
      description: '',
      items: JSON.parse(JSON.stringify(store.formItems)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const previewData = {
      form: tempForm,
      formData: { ...previewFormData }
    }
    sessionStorage.setItem(`preview_${tempFormId}`, JSON.stringify(previewData))
    previewDialogVisible.value = false
    router.push(`/form-preview/${tempFormId}`)
  } catch {
    ElMessage.error(t('formBuilder.previewSubmitError'))
  }
}

const handleClear = () => {
  ElMessageBox.confirm(t('formBuilder.clearConfirm'), t('common.warning'), {
    type: 'warning'
  })
    .then(() => {
      store.clearAll()
      ElMessage.success(t('formBuilder.clearSuccess'))
    })
    .catch(() => {})
}

const handleSave = () => {
  if (store.formItems.length === 0) {
    ElMessage.warning(t('formBuilder.saveEmptyHint'))
    return
  }
  saveFormData.name = ''
  saveFormData.description = ''
  saveFormError.value = ''
  saveDialogVisible.value = true
}

const getSavedForms = (): SavedForm[] => {
  const data = localStorage.getItem(FORMS_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

const saveForms = (forms: SavedForm[]) => {
  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms))
}

const handleSaveForm = () => {
  if (!saveFormData.name.trim()) {
    saveFormError.value = t('formBuilder.formNameRequired')
    return
  }

  const forms = getSavedForms()
  const now = new Date().toISOString()

  const newForm: SavedForm = {
    id: `form_${Date.now()}`,
    name: saveFormData.name.trim(),
    description: saveFormData.description.trim(),
    items: JSON.parse(JSON.stringify(store.formItems)),
    createdAt: now,
    updatedAt: now
  }

  forms.unshift(newForm)
  saveForms(forms)

  saveDialogVisible.value = false
  ElMessage.success(t('formBuilder.saveSuccess'))
}

onMounted(() => {
  if (sortableRef.value) {
    import('sortablejs').then(({ default: Sortable }) => {
      sortableInstance = new Sortable(sortableRef.value as HTMLElement, {
        animation: 200,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        handle: '.drag-handle',
        delay: 0,
        delayOnTouchOnly: true,
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt
          if (
            oldIndex !== undefined &&
            newIndex !== undefined &&
            oldIndex !== newIndex
          ) {
            store.moveItem(oldIndex, newIndex)
          }
        }
      })
    })
  }
})

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>

<style scoped>
.form-builder {
  height: 100%;
  width: 100%;
}

.builder-container {
  display: flex;
  height: calc(100vh - 120px);
  min-height: 600px;
  gap: 16px;
}

.component-library {
  width: 260px;
  flex-shrink: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.library-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
}

.library-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.component-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
  padding-left: 4px;
  font-weight: 500;
}

.component-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;
  background: var(--el-bg-color);
  text-align: center;
  gap: 6px;
  user-select: none;
}

.component-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.component-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.component-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.component-item span {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.canvas-area {
  flex: 1;
  min-width: 500px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
}

.canvas-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.canvas-title .el-icon {
  color: var(--el-color-primary);
}

.item-count {
  font-weight: normal;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.canvas-actions {
  display: flex;
  gap: 8px;
}

.canvas-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--el-fill-color-light);
}

.empty-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  min-height: 400px;
  transition: all 0.3s ease;
}

.empty-canvas.drag-over {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-style: solid;
}

.empty-icon {
  font-size: 48px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.empty-canvas.drag-over .empty-icon {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

.empty-canvas p {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.form-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item-wrapper {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.form-item-wrapper:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.form-item-wrapper.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-8), 0 4px 12px rgba(64, 158, 255, 0.15);
}

.form-item-wrapper.drag-over-item {
  border-color: var(--el-color-success);
  box-shadow: 0 0 0 3px var(--el-color-success-light-8);
}

.form-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  font-size: 18px;
  color: var(--el-text-color-placeholder);
  cursor: grab;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.drag-handle:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.drag-handle:active {
  cursor: grabbing;
}

.item-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.form-item-wrapper:hover .item-actions {
  opacity: 1;
}

.action-icon {
  font-size: 16px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-icon:hover {
  background: var(--el-fill-color);
  color: var(--el-color-primary);
}

.action-icon.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.action-icon.delete:hover {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.form-item-content {
  padding: 8px 0;
}

.sortable-ghost {
  opacity: 0.6;
  background: var(--el-color-primary-light-9);
  border: 2px dashed var(--el-color-primary);
  border-radius: 8px;
}

.sortable-drag {
  opacity: 0.9;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: rotate(2deg);
}

.property-panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.panel-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.property-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-section {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.property-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-left: 4px;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: var(--el-color-primary);
  border-radius: 2px;
  margin-left: -4px;
}

.w-full {
  width: 100%;
}

.hidden-item {
  opacity: 0.5;
  border-style: dashed !important;
}

.hidden-item .item-label::after {
  content: ' (已隐藏)';
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  font-weight: normal;
}

.form-items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.form-item-wrapper {
  flex-shrink: 0;
}

.options-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-item .el-input {
  flex: 1;
}

.empty-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  min-height: 300px;
}

.empty-panel-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-panel p {
  font-size: 14px;
}

@media (max-width: 1400px) {
  .builder-container {
    gap: 12px;
  }

  .component-library {
    width: 240px;
  }

  .canvas-area {
    min-width: 400px;
  }

  .property-panel {
    width: 280px;
  }
}

@media (max-width: 1200px) {
  .builder-container {
    overflow-x: auto;
  }
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

.richtext-editor-wrapper {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.richtext-editor-wrapper :deep(.w-e-toolbar) {
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
}

.richtext-editor-wrapper :deep(.w-e-text-container) {
  background: var(--el-bg-color);
}

.richtext-editor-wrapper :deep(.w-e-text-placeholder) {
  color: var(--el-text-color-placeholder);
}
</style>

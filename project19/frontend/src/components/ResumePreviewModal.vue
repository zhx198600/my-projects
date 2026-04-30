<script setup>
import { ref, computed, watch } from 'vue'
import { getResumePreview } from '../api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  resumeId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const previewData = ref(null)
const activeTab = ref('info')

async function loadPreview() {
  if (!props.resumeId) return
  
  loading.value = true
  try {
    const result = await getResumePreview(props.resumeId)
    if (result.success) {
      previewData.value = result.data
    }
  } catch (error) {
    console.error('加载简历预览失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.resumeId, (newId) => {
  if (newId && props.visible) {
    loadPreview()
  }
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (visible && props.resumeId && !previewData.value) {
    loadPreview()
  }
  if (!visible) {
    activeTab.value = 'info'
  }
})

function closeModal() {
  emit('close')
}

function stopPropagation(e) {
  e.stopPropagation()
}

const parsedData = computed(() => previewData.value?.parsedData || {})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click="stopPropagation">
          <div class="modal-header">
            <div class="header-left">
              <span class="modal-icon">📄</span>
              <h2 class="modal-title">简历详情预览</h2>
            </div>
            <button class="close-btn" @click="closeModal">×</button>
          </div>

          <div v-if="loading" class="loading-content">
            <div class="spinner"></div>
            <p>加载简历信息中...</p>
          </div>

          <div v-else-if="previewData" class="modal-content">
            <div class="tabs">
              <button 
                v-for="tab in [
                  { id: 'info', label: '基本信息', icon: '👤' },
                  { id: 'skills', label: '技能特长', icon: '⭐' },
                  { id: 'raw', label: '原始内容', icon: '📝' }
                ]" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="['tab-btn', { active: activeTab === tab.id }]"
              >
                <span>{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <div class="tab-content">
              <div v-if="activeTab === 'info'" class="info-section">
                <div class="profile-header">
                  <div class="profile-avatar">{{ parsedData.name?.charAt(0) || '?' }}</div>
                  <div class="profile-info">
                    <h3 class="profile-name">{{ parsedData.name || '未填写' }}</h3>
                    <span 
                      v-if="parsedData.is_employed !== null && parsedData.is_employed !== undefined"
                      :class="['profile-status', parsedData.is_employed ? 'employed' : 'unemployed']"
                    >
                      {{ parsedData.is_employed ? '在职' : '离职寻找机会' }}
                    </span>
                    <span v-else :class="['profile-status', 'unknown']">
                      状态未知
                    </span>
                  </div>
                </div>

                <div class="info-grid">
                  <div class="info-card">
                    <span class="info-icon">🎂</span>
                    <div class="info-card-content">
                      <label>年龄</label>
                      <value>{{ parsedData.age || '未填写' }}</value>
                    </div>
                  </div>

                  <div class="info-card">
                    <span class="info-icon">🎓</span>
                    <div class="info-card-content">
                      <label>学历</label>
                      <value>{{ parsedData.education || '未填写' }}</value>
                    </div>
                  </div>

                  <div class="info-card">
                    <span class="info-icon">💼</span>
                    <div class="info-card-content">
                      <label>工作年限</label>
                      <value>{{ parsedData.work_years || '未填写' }}</value>
                    </div>
                  </div>

                  <div class="info-card">
                    <span class="info-icon">📍</span>
                    <div class="info-card-content">
                      <label>所在地区</label>
                      <value class="text-truncate">{{ parsedData.address || '未填写' }}</value>
                    </div>
                  </div>

                  <div class="info-card full-width">
                    <span class="info-icon">📱</span>
                    <div class="info-card-content">
                      <label>联系电话</label>
                      <value>{{ parsedData.phone || '未填写' }}</value>
                    </div>
                  </div>

                  <div class="info-card full-width">
                    <span class="info-icon">📧</span>
                    <div class="info-card-content">
                      <label>电子邮箱</label>
                      <value>{{ parsedData.email || '未填写' }}</value>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="activeTab === 'skills'" class="skills-section">
                <div class="skills-block">
                  <h4>🎯 基础技能</h4>
                  <div v-if="parsedData.basic_skills" class="skills-tags">
                    <span v-for="(skill, idx) in parsedData.basic_skills.split(/[,，、]/)" :key="idx" class="skill-tag">
                      {{ skill.trim() }}
                    </span>
                  </div>
                  <p v-else class="empty-text">暂无技能信息</p>
                </div>

                <div class="skills-block">
                  <h4>✨ 个人特长</h4>
                  <div v-if="parsedData.strengths" class="strengths-content">
                    <p>{{ parsedData.strengths }}</p>
                  </div>
                  <p v-else class="empty-text">暂无特长信息</p>
                </div>
              </div>

              <div v-else-if="activeTab === 'raw'" class="raw-section">
                <h4>📄 原始文本内容</h4>
                <div v-if="previewData.rawContent || previewData.fileContent" class="raw-content">
                  <pre>{{ previewData.rawContent || previewData.fileContent }}</pre>
                </div>
                <p v-else class="empty-text">暂无原始内容</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.loading-content {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 24px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
}

.profile-name {
  margin: 0 0 8px;
  font-size: 24px;
  color: #1e293b;
}

.profile-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.profile-status.employed {
  background: #dcfce7;
  color: #166534;
}

.profile-status.unemployed {
  background: #fef3c7;
  color: #92400e;
}

.profile-status.unknown {
  background: #f1f5f9;
  color: #475569;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.info-card-content {
  flex: 1;
}

.info-card-content label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-card-content value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skills-block {
  margin-bottom: 24px;
}

.skills-block h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #334155;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: linear-gradient(135deg, #667eea20, #764ba220);
  color: #5b21b6;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.strengths-content {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.strengths-content p {
  margin: 0;
  color: #334155;
  line-height: 1.6;
}

.raw-content {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.raw-content pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-text {
  color: #94a3b8;
  text-align: center;
  padding: 40px;
  margin: 0;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .tab-btn span:last-child {
    display: none;
  }

  .tabs {
    padding: 10px 20px;
    justify-content: space-around;
  }

  .tab-content {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-name {
    font-size: 20px;
  }
}
</style>

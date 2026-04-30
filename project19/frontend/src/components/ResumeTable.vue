<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  resumes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['preview', 'delete', 'pageChange'])

const currentPage = computed(() => props.pagination?.page || 1)
const totalPages = computed(() => props.pagination?.totalPages || 1)

function handlePreview(resume) {
  emit('preview', resume)
}

function handleDelete(resume) {
  if (confirm(`确定要删除 ${resume.name} 的简历吗？`)) {
    emit('delete', resume)
  }
}

function handlePageChange(page) {
  if (page >= 1 && page <= totalPages.value) {
    emit('pageChange', page)
  }
}
</script>

<template>
  <div class="resume-table-container">
    <div class="table-header">
      <h3>👥 简历列表</h3>
      <span class="resume-count">共 {{ pagination?.total || 0 }} 条记录</span>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="resumes.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p>暂无简历数据</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="resume-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>学历</th>
            <th class="hide-mobile">住址</th>
            <th>工作年限</th>
            <th class="hide-mobile">联系方式</th>
            <th>在职状态</th>
            <th>匹配度</th>
            <th class="hide-tablet">基础技能</th>
            <th class="hide-tablet">个人特长</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resume in resumes" :key="resume.id" class="resume-row">
            <td class="name-cell">
              <span class="avatar">{{ resume.name?.charAt(0) || '?' }}</span>
              <span class="name-text">{{ resume.name || '-' }}</span>
            </td>
            <td>{{ resume.age || '-' }}</td>
            <td><span class="tag education">{{ resume.education || '未知' }}</span></td>
            <td class="hide-mobile text-truncate">{{ resume.address || '-' }}</td>
            <td><span class="tag experience">{{ resume.work_years || '未知' }}</span></td>
            <td class="hide-mobile contact-cell">{{ resume.phone || resume.email || '-' }}</td>
            <td>
              <span 
                v-if="resume.is_employed !== null && resume.is_employed !== undefined"
                :class="['status-badge', resume.is_employed ? 'employed' : 'unemployed']"
              >
                {{ resume.is_employed ? '在职' : '离职' }}
              </span>
              <span v-else class="status-badge unknown">
                未知
              </span>
            </td>
            <td>
              <div class="match-score">
                <span :class="['score-badge', resume.match_score >= 80 ? 'excellent' : resume.match_score >= 60 ? 'good' : 'normal']">
                  {{ resume.match_score || 0 }}分
                </span>
              </div>
            </td>
            <td class="hide-tablet skills-cell">
              <div class="skills-list">
                <span v-for="(skill, idx) in (resume.basic_skills || '').split(/[,，、]/).slice(0, 2)" :key="idx" class="skill-tag">
                  {{ skill.trim() }}
                </span>
                <span v-if="(resume.basic_skills || '').split(/[,，、]/).length > 2" class="skill-more">+{{ (resume.basic_skills || '').split(/[,，、]/).length - 2 }}</span>
              </div>
            </td>
            <td class="hide-tablet text-truncate">{{ resume.strengths || '-' }}</td>
            <td class="actions-cell">
              <button @click="handlePreview(resume)" class="btn btn-preview" title="预览">
                👁️
              </button>
              <button @click="handleDelete(resume)" class="btn btn-delete" title="删除">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination && totalPages > 1" class="pagination">
      <button 
        @click="handlePageChange(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        上一页
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="handlePageChange(page)"
          :class="['page-btn', 'page-number', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="handlePageChange(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.resume-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.resume-count {
  font-size: 14px;
  opacity: 0.9;
}

.loading-state,
.empty-state {
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

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.table-wrapper {
  overflow-x: auto;
}

.resume-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.resume-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.resume-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #334155;
}

.resume-row:hover {
  background: #f8fafc;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.name-text {
  white-space: nowrap;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag.education {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag.experience {
  background: #dcfce7;
  color: #166534;
}

.contact-cell {
  font-size: 12px;
  color: #64748b;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.employed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.unemployed {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.unknown {
  background: #f1f5f9;
  color: #475569;
}

.match-score {
  display: flex;
  align-items: center;
}

.score-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.score-badge.excellent {
  background: #dcfce7;
  color: #166534;
}

.score-badge.good {
  background: #fef3c7;
  color: #92400e;
}

.score-badge.normal {
  background: #fee2e2;
  color: #991b1b;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.skill-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-more {
  color: #64748b;
  font-size: 11px;
}

.text-truncate {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 6px;
}

.btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-preview {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-preview:hover {
  background: #bfdbfe;
  transform: scale(1.05);
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
  transform: scale(1.05);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.page-number.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

@media (max-width: 1024px) {
  .hide-tablet {
    display: none;
  }
  .resume-table {
    min-width: 700px;
  }
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
  .resume-table {
    min-width: 500px;
  }
  .page-numbers {
    display: none;
  }
  .table-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

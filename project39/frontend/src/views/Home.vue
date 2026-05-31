<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <el-icon :size="64" color="#409eff"><document /></el-icon>
            <h1>发票管理系统</h1>
            <p>高效、便捷的发票管理解决方案</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#67c23a"><list /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">发票总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#e6a23c"><money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.totalAmount?.toFixed(2) }}</div>
              <div class="stat-label">总金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#409eff"><upload-filled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.monthCount }}</div>
              <div class="stat-label">本月新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" v-if="riskStats.abnormal > 0">
          <div class="stat-content">
            <el-icon :size="32" color="#f56c6c"><warning-filled /></el-icon>
            <div class="stat-info">
              <div class="stat-value danger-value">{{ riskStats.abnormal }}</div>
              <div class="stat-label">异常发票</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card" v-else>
          <div class="stat-content">
            <el-icon :size="32" color="#67c23a"><warning-filled /></el-icon>
            <div class="stat-info">
              <div class="stat-value normal-value">{{ riskStats.abnormal || 0 }}</div>
              <div class="stat-label">异常发票</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>快捷操作</h3>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/upload')">
              <el-icon><upload-filled /></el-icon>
              上传发票
            </el-button>
            <el-button type="success" size="large" @click="$router.push('/invoices')">
              <el-icon><list /></el-icon>
              查看发票列表
            </el-button>
            <el-button type="danger" size="large" @click="$router.push('/risk-monitor')">
              <el-icon><warning-filled /></el-icon>
              风险监控
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>数据备份与恢复</h3>
            </div>
          </template>
          <div class="backup-actions">
            <el-button type="warning" @click="backupDatabase" :loading="backingUp">
              <el-icon><folder-opened /></el-icon>
              备份数据库
            </el-button>
          </div>
          <el-divider />
          <div class="backup-list">
            <h4>备份文件列表</h4>
            <el-table :data="backups" v-loading="loadingBackups" size="small">
              <el-table-column prop="filename" label="文件名" />
              <el-table-column prop="size" label="大小">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" />
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button size="small" type="danger" @click="restoreBackup(scope.row)">恢复</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>系统功能</h3>
            </div>
          </template>
          <ul class="feature-list">
            <li>
              <el-icon><check /></el-icon>
              <span>发票上传与自动识别</span>
            </li>
            <li>
              <el-icon><check /></el-icon>
              <span>自动查重检测</span>
            </li>
            <li>
              <el-icon><check /></el-icon>
              <span>手动开具发票</span>
            </li>
            <li>
              <el-icon><check /></el-icon>
              <span>异常发票预警（红色警示）</span>
            </li>
            <li>
              <el-icon><check /></el-icon>
              <span>税务风险监控</span>
            </li>
            <li>
              <el-icon><check /></el-icon>
              <span>数据导出（CSV/Excel）</span>
            </li>
            <li>
              <el-icon><check /></el-icon>
              <span>数据备份与恢复</span>
            </li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { Document, List, Money, UploadFilled, Check, FolderOpened, WarningFilled } from '@element-plus/icons-vue'

const stats = ref({
  total: 0,
  totalAmount: 0,
  monthCount: 0
})

const riskStats = ref({
  total: 0,
  abnormal: 0,
  high_risk: 0,
  medium_risk: 0,
  low_risk: 0,
  normal: 0
})

const backups = ref([])
const loadingBackups = ref(false)
const backingUp = ref(false)

const fetchRiskStats = async () => {
  try {
    const response = await axios.get('/api/risk/statistics')
    riskStats.value = response.data
  } catch (error) {
    console.error('获取风险统计失败:', error)
  }
}

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/invoices', {
      params: { page: 1, per_page: 1 }
    })
    stats.value.total = response.data.total || 0
    
    if (response.data.invoices && response.data.invoices.length > 0) {
      const allResponse = await axios.get('/api/invoices', {
        params: { page: 1, per_page: 10000 }
      })
      const invoices = allResponse.data.invoices || []
      stats.value.totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
      
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      stats.value.monthCount = invoices.filter(inv => {
        const createdAt = new Date(inv.created_at)
        return createdAt >= monthStart
      }).length
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchBackups = async () => {
  loadingBackups.value = true
  try {
    const response = await axios.get('/api/backups')
    backups.value = response.data.backups || []
  } catch (error) {
    console.error('获取备份列表失败:', error)
  } finally {
    loadingBackups.value = false
  }
}

const backupDatabase = async () => {
  backingUp.value = true
  try {
    const response = await axios.post('/api/backup')
    if (response.data.success) {
      ElMessage.success('数据库备份成功')
      fetchBackups()
    } else {
      ElMessage.error(response.data.error || '备份失败')
    }
  } catch (error) {
    ElMessage.error('备份失败: ' + (error.response?.data?.error || error.message))
  } finally {
    backingUp.value = false
  }
}

const restoreBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要从备份文件 ${backup.filename} 恢复数据吗？这将覆盖当前所有数据！`,
      '恢复确认',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await axios.post('/api/restore', {
      backup_file: backup.filename
    })
    
    if (response.data.success) {
      ElMessage.success('数据库恢复成功，请刷新页面')
      fetchStats()
    } else {
      ElMessage.error(response.data.error || '恢复失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('恢复失败: ' + (error.response?.data?.error || error.message))
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

onMounted(() => {
  fetchStats()
  fetchRiskStats()
  fetchBackups()
})
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.welcome-content :deep(.el-icon) {
  color: #ffffff !important;
}

.welcome-content h1 {
  color: #ffffff;
  font-size: 32px;
  margin: 20px 0 10px 0;
}

.welcome-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0;
}

.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px 0;
}

.quick-actions .el-button {
  min-width: 150px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  color: #606266;
}

.feature-list .el-icon {
  color: #67c23a;
}

.backup-actions {
  text-align: center;
  padding: 15px 0;
}

.backup-list h4 {
  margin: 10px 0;
  color: #303133;
}

.danger-value {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.normal-value {
  font-size: 28px;
  font-weight: bold;
  color: #67c23a;
}
</style>
